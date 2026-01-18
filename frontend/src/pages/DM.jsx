import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const socket = io("http://localhost:5001", {
  autoConnect: false,
});

const DM = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const currentUserId = token
    ? JSON.parse(atob(token.split(".")[1])).id
    : null;

  const [inbox, setInbox] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  /* ================= SOCKET CONNECT ONCE ================= */
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("newMessage");
      socket.off("editMessage");
      socket.off("deleteMessage");
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
    socket.emit("joinConversation", conversationId);
  }, [conversationId]);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = msg => {
      setInbox(prev =>
        prev.map(c => {
          if (c._id === msg.conversation) {
            const updated = { ...c, lastMessage: msg };
            if (msg.sender._id !== currentUserId && msg.conversation !== conversationId) {
              updated.unreadCount = (updated.unreadCount || 0) + 1;
            }
            return updated;
          }
          return c;
        })
      );

      if (msg.conversation !== conversationId && msg.sender._id !== currentUserId) {
        toast.success(`New message from ${msg.sender.name}`);
        return;
      }

      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      scrollToBottom();
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [conversationId, currentUserId]);

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

    setInbox(prev => prev.map(c => c._id === conversationId ? { ...c, lastMessage: { text: msgText, sender: { _id: currentUserId } } } : c));

    try {
      await api.post("/messages/send", {
        conversationId,
        text: msgText,
      });
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  /* ================= EDIT MESSAGE ================= */
  const editMessage = async msg => {
    const newText = prompt("Edit message", msg.text);
    if (!newText || newText === msg.text) return;

    const res = await api.put(`/messages/message/${msg._id}`, {
      text: newText,
    });

    setMessages(prev =>
      prev.map(m => (m._id === msg._id ? res.data : m))
    );
  };

  /* ================= DELETE MESSAGE ================= */
  const deleteMessage = async id => {
    await api.delete(`/messages/message/${id}`);
    setMessages(prev => prev.filter(m => m._id !== id));
  };

  const otherUser = activeConversation?.participants?.find(
    p => p._id !== currentUserId
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Messages</h2>

      <div className="border rounded-lg h-[70vh] flex overflow-hidden">

        {/* INBOX */}
        <div className="w-1/3 border-r overflow-y-auto">
          {inbox.map(conv => {
            const other = conv.participants.find(
              p => p._id !== currentUserId
            );

            return (
              <div
                key={conv._id}
                onClick={() => navigate(`/dm/${conv._id}`)}
                className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                  conversationId === conv._id ? "bg-gray-100" : ""
                }`}
              >
                <p className="font-medium text-sm">{other?.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {conv.lastMessage?.text || "No messages yet"}
                </p>

                {(conv.unreadCount || 0) > 0 && (
                  <span className="ml-auto bg-blue-600 text-white text-xs px-2 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* CHAT */}
        <div className="flex-1 flex flex-col">
          <div className="border-b p-3 font-medium">
            {otherUser?.name || "Select a conversation"}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {messages.map(msg => (
              <div
                key={msg._id}
                className={`max-w-[70%] px-3 py-2 rounded text-sm ${
                  msg.sender?._id === currentUserId
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {msg.text}

                {msg.sender?._id === currentUserId && (
                  <div className="text-xs text-right mt-1">
                    <button
                      onClick={() => editMessage(msg)}
                      className="text-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMessage(msg._id)}
                      className="ml-2 text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {activeConversation && (
            <div className="border-t p-3 flex gap-2">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type a message…"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className="bg-[#0a66c2] text-white px-4 rounded text-sm disabled:opacity-50"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DM;