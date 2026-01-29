import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import socket from "../socket";

const DM = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const editInputRef = useRef(null);
  const sendInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const currentUserId = payload?.id || payload?.sub || null;

  const [inbox, setInbox] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  /* ================= LOAD INBOX ================= */
  useEffect(() => {
    api.get("/messages/inbox").then(res => setInbox(res.data));
  }, []);

  /* ================= SET ACTIVE CONVERSATION ================= */
  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    const conv = inbox.find(c => c._id === conversationId);
    if (conv) setActiveConversation(conv);
  }, [conversationId, inbox]);

  useEffect(() => {
    socket.on("editMessage", msg => {
      setMessages(prev =>
        prev.map(m => {
          if (m._id !== msg._id) return m;
          if (editingMessageId === msg._id) return m; // don’t overwrite local edit
          return msg;
        })
      );
    });

    socket.on("deleteMessage", id => {
      setMessages(prev => prev.filter(m => m._id !== id));
    });

    return () => {
      socket.off("editMessage");
      socket.off("deleteMessage");
    };
  }, []);

  /* ================= LOAD MESSAGE HISTORY ================= */
  useEffect(() => {
    if (!conversationId) return;

    api.get(`/messages/${conversationId}`).then(res => {
      setMessages(res.data);
      scrollToBottom();
    });

    api.put(`/messages/read/${conversationId}`);
    setInbox(prev => prev.map(c => c._id === conversationId ? { ...c, unreadCount: 0 } : c));
    
  }, [conversationId]);
useEffect(() => {
  if (!conversationId) return;

  socket.emit("joinConversation", conversationId);
  console.log("Joined conversation:", conversationId);
}, [conversationId]);
  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
  const handleNewMessage = msg => {
    setMessages(prev => {
      if (prev.some(m => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
    scrollToBottom();
  };

  socket.on("newMessage", handleNewMessage);
  socket.on("editMessage", updated => {
    setMessages(prev =>
      prev.map(m => (m._id === updated._id ? updated : m))
    );
  });
  socket.on("deleteMessage", id => {
    setMessages(prev => prev.filter(m => m._id !== id));
  });

  return () => {
    socket.off("newMessage", handleNewMessage);
    socket.off("editMessage");
    socket.off("deleteMessage");
  };
}, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!text.trim() || !conversationId) return;

    const msgText = text.trim();
    setText("");

    const optimisticMsg = {
      _id: "temp-" + Date.now(),
      conversationId,
      content: msgText,
      type: "text",
      sender: { _id: currentUserId },
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const res = await api.post("/messages/send", {
        conversationId,
        content: msgText,
        type: "text",
      });

      if (res.data) {
        setMessages(prev =>
          prev.map(m => (m._id === optimisticMsg._id ? res.data : m))
        );
      }
    } catch (err) {
      console.error("Send message failed", err);
      toast.error("Failed to send message");
    }
  };

  const sendImage = async (e) => {
  const file = e.target.files[0];
  if (!file || !conversationId) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await api.post(
      `/messages/dm/${conversationId}/image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    // ✅ immediately show image without refresh
    if (res.data) {
      setMessages(prev => {
        if (prev.some(m => m._id === res.data._id)) return prev;
        return [...prev, res.data];
      });
      scrollToBottom();
    }
  } catch (err) {
    console.error("Send image failed", err);
    toast.error("Failed to send image");
  }

  e.target.value = null;
};


  /* ================= EDIT MESSAGE (open inline editor) ================= */
  const startEditMessage = msg => {
    if (msg.type === "image") return;
    setEditingMessageId(msg._id);
    setEditingText(msg.content || "");
  };

  // focus edit input when editingMessageId changes
  useEffect(() => {
    if (editingMessageId) {
      setTimeout(() => {
        editInputRef.current?.focus();
      }, 80);
    }
  }, [editingMessageId]);

  const saveEdit = async (msgId) => {
    const newText = editingText?.trim();
    if (!newText) return;

    try {
      const res = await api.put(`/messages/message/${msgId}`, { content: newText });
      setMessages(prev => prev.map(m => (m._id === msgId ? res.data : m)));
      setEditingMessageId(null);
      setEditingText("");
    } catch (err) {
      console.error("Edit failed", err);
      toast.error("Failed to edit message");
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  /* ================= DELETE MESSAGE ================= */
  const deleteMessage = async id => {
    // optimistic UI
    setMessages(prev => prev.filter(m => m._id !== id));

    try {
      await api.delete(`/messages/message/${id}`);
    } catch (err) {
      toast.error("Failed to delete message");
      // rollback by refetching messages
      if (conversationId) {
        const res = await api.get(`/messages/${conversationId}`);
        setMessages(res.data);
      }
    }
  };

  const otherUser = activeConversation?.participants?.find(
    p => p._id !== currentUserId
  );

  // helper to format time if exists
  const timeShort = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Messages</h2>

      <div className="border rounded-lg h-[75vh] flex overflow-hidden shadow-sm">
        {/* INBOX */}
        <div className="w-1/3 border-r bg-white overflow-y-auto">
          <div className="px-4 py-3 sticky top-0 bg-white z-10 border-b">
            <div className="text-sm text-slate-600">Chats</div>
          </div>

          {inbox.length === 0 && (
            <div className="p-4 text-sm text-slate-500">No conversations</div>
          )}

          {inbox.map(conv => {
            const other = conv.participants.find(
              p => String(p._id) !== String(currentUserId)
            );

            const active = conversationId === conv._id;

            return (
              <div
                key={conv._id}
                onClick={() => navigate(`/dm/${conv._id}`)}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
                  active ? "bg-gray-100" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white font-bold flex items-center justify-center">
                  {other?.name?.[0] || "U"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm truncate">{other?.name}</div>
                    <div className="text-xs text-slate-400">
                      {/* optional: show unread dot or time */}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 truncate mt-1">
                    {conv.lastMessage?.content || "No messages yet"}
                  </div>
                </div>

                {(conv.unreadCount || 0) > 0 && (
                  <div className="ml-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {conv.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CHAT */}
        <div className="flex-1 flex flex-col bg-slate-50">
          <div className="border-b p-4 bg-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white font-bold flex items-center justify-center">
              {otherUser?.name?.[0] || "U"}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{otherUser?.name || "Select a conversation"}</div>
              <div className="text-xs text-slate-400">{otherUser ? "Direct message" : " "}</div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-3" style={{ background: "linear-gradient(180deg, #f8fbff 0%, #f7fafc 100%)" }}>
            {messages.length === 0 && (
              <div className="text-center text-sm text-slate-400 mt-8">No messages yet — say hi 👋</div>
            )}

            {messages.map(msg => {
  const mine = msg.sender?._id === currentUserId;

  return (
    <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`relative max-w-[75%] flex flex-col ${mine ? "items-end" : "items-start"}`}>

        {/* ✅ SENDER NAME */}
        {!mine && (
          <div className="text-xs text-slate-400 mb-1">
            {msg.sender?.name}
          </div>
        )}

        <div
          className={`px-4 py-2 rounded-lg text-sm break-words ${
            mine
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-white border"
          }`}
        >
          {msg.type === "image" ? (
            <img
              src={msg.content.startsWith("http")
                ? msg.content
                : `http://localhost:5001${msg.content}`}
              alt="sent"
              className="max-w-[240px] rounded-lg"
            />
          ) : (
            editingMessageId === msg._id ? (
              <div className="flex flex-col gap-1">
                <input
                  ref={editInputRef}
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") saveEdit(msg._id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="text-sm text-black px-2 py-1 rounded border"
                />
                <div className="flex gap-2 text-[11px] text-slate-500">
                  <button onClick={() => saveEdit(msg._id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <span>{msg.content || ""}</span>
            )
          )}
          <div className="mt-1 text-[11px] text-slate-400">
            {timeShort(msg.createdAt)}
          </div>
        </div>
        {mine && (
          <div className="flex gap-2 mt-1 text-[11px] text-slate-300">
            {msg.type !== "image" && (
              <button
                onClick={() => startEditMessage(msg)}
                className="hover:text-white"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => deleteMessage(msg._id)}
              className="hover:text-red-300"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
})}

            <div ref={messagesEndRef} />
          </div>

          {/* SEND BOX */}
          {activeConversation && (
            <div className="border-t p-4 bg-white flex items-center gap-3">
              <textarea
                ref={sendInputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message… (Shift+Enter for newline)"
                rows={1}
                className="flex-1 resize-none rounded-md border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                hidden
                onChange={sendImage}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="p-2 rounded-md hover:bg-slate-100"
              >
                📷
              </button>

              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0a66c2] text-white hover:bg-[#004182] disabled:opacity-50 transition transform active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10l9-7v18L3 14h18" />
                </svg>
                <span className="text-sm">Send</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DM;
