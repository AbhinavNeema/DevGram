import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const DM = () => {
  
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const messagesEndRef = useRef(null);
  console.log("DM conversationId:", conversationId);

  const token = localStorage.getItem("token");
  const currentUserId = token
    ? JSON.parse(atob(token.split(".")[1])).id
    : null;

  const [inbox, setInbox] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  /* ================= LOAD INBOX ================= */
  useEffect(() => {
    api.get("/messages/inbox").then(res => {
      setInbox(res.data);
    });
  }, []);

  /* ================= LOAD CONVERSATION FROM URL ================= */
  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    const conv = inbox.find(c => c._id === conversationId);
    if (conv) {
      setActiveConversation(conv);
    }
  }, [conversationId, inbox]);

  /* ================= LOAD MESSAGES ================= */
  useEffect(() => {
    if (!conversationId) return;

    api.get(`/messages/${conversationId}`).then(res => {
      setMessages(res.data);
      scrollToBottom();
    });
  }, [conversationId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!text.trim() || !conversationId) return;

    const res = await api.post("/messages/send", {
      conversationId,
      text,
    });

    setMessages(prev => [...prev, res.data]);
    setText("");

    setInbox(prev =>
      prev.map(c =>
        c._id === conversationId
          ? { ...c, lastMessage: res.data }
          : c
      )
    );

    scrollToBottom();
  };

  /* ================= OTHER USER ================= */
  const otherUser = activeConversation?.participants?.find(
    p => p._id !== currentUserId
  );

  return (
    
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Messages</h2>

      <div className="border rounded-lg h-[70vh] flex overflow-hidden">

        {/* LEFT: INBOX */}
        <div className="w-1/3 border-r overflow-y-auto">
          {inbox.length === 0 && (
            <p className="p-4 text-sm text-gray-500">No conversations</p>
          )}

          {inbox.map(conv => {
            const other = conv.participants.find(
              p => p._id !== currentUserId
            );

            return (
              <div
                key={conv._id}
                onClick={() => {
                  setActiveConversation(conv);
                  navigate(`/dm/${conv._id}`);
                }}
                className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                  conversationId === conv._id ? "bg-gray-100" : ""
                }`}
              >
                <p className="font-medium text-sm">{other?.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {conv.lastMessage?.text || "No messages yet"}
                </p>
              </div>
            );
          })}
        </div>

        {/* RIGHT: CHAT */}
        <div className="flex-1 flex flex-col">

          {/* HEADER */}
          <div className="border-b p-3 font-medium">
            {otherUser?.name || "Select a conversation"}
          </div>

          {/* MESSAGES */}
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
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
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