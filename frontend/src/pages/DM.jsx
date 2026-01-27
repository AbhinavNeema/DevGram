import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

import socket from "../socket";

const DM = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const editInputRef = useRef(null);
  const sendInputRef = useRef(null);
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const currentUserId = payload?.id || payload?.sub || null;

  const [inbox, setInbox] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // inline edit states
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  /* ================= SOCKET CONNECT ONCE ================= */
    useEffect(() => {
      socketRef.current = io("http://localhost:5001", {
        transports: ["websocket"],
      });

      console.log("Socket connected");

      return () => {
        socketRef.current.disconnect();
        console.log("Socket disconnected");
      };
    }, []);

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
        prev.map(m => (m._id === msg._id ? msg : m))
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
  if (!conversationId || !socketRef.current) return;

  socketRef.current.emit("joinConversation", conversationId);
  console.log("Joined conversation:", conversationId);
}, [conversationId]);
  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
  if (!socketRef.current) return;

  const handleNewMessage = msg => {
    setMessages(prev => {
      if (prev.some(m => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
    scrollToBottom();
  };

  socketRef.current.on("newMessage", handleNewMessage);

  return () => {
    socketRef.current.off("newMessage", handleNewMessage);
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

    const msgText = text;
    setText("");

    setInbox(prev =>
      prev.map(c =>
        c._id === conversationId
          ? { ...c, lastMessage: { text: msgText } }
          : c
      )
    );

    try {
      await api.post("/messages/send", {
        conversationId,
        text: msgText,
      });
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  /* ================= EDIT MESSAGE (open inline editor) ================= */
  const startEditMessage = msg => {
    setEditingMessageId(msg._id);
    setEditingText(msg.text);
    // focus will be triggered by effect below
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
      const res = await api.put(`/messages/message/${msgId}`, { text: newText });
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
    await api.delete(`/messages/message/${id}`);
    setMessages(prev => prev.filter(m => m._id !== id));
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
                    {conv.lastMessage?.text || "No messages yet"}
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
          {msg.text}
          <div className="mt-1 text-[11px] text-slate-400">
            {timeShort(msg.createdAt)}
          </div>
        </div>
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
