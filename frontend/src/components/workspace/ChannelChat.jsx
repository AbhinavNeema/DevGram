import { useEffect, useRef, useState } from "react";
import socket from "../../socket";
import api from "../../api/axios";
import { Send, Paperclip, Trash2, FileText, Play, Music, Download, Hash, Loader2, CheckCircle2 } from "lucide-react";

const token = localStorage.getItem("token");
const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;

const ChannelChat = ({ channel }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!channel) return;
    socket.emit("joinChannel", channel._id);
    api.get(`/channels/messages/${channel._id}`).then(res => setMessages(res.data));
    return () => socket.emit("leaveChannel", channel._id);
  }, [channel]);

  useEffect(() => {
    if (!channel) return;
    const handleNewMessage = msg => {
      if (msg.channel?.toString() === channel._id.toString()) {
        setMessages(prev => [...prev, msg]);
      }
    };
    const handleDelete = (id) => setMessages(prev => prev.filter(m => m._id !== id));
    
    socket.on("newChannelMessage", handleNewMessage);
    socket.on("deleteChannelMessage", handleDelete);
    return () => {
      socket.off("newChannelMessage", handleNewMessage);
      socket.off("deleteChannelMessage", handleDelete);
    };
  }, [channel]);

  const send = async () => {
    if (!text.trim()) return;
    const tempText = text;
    setText("");
    await api.post(`/channels/messages/${channel._id}`, { content: tempText });
  };

  const sendFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(`/channels/${channel._id}/file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteMessage = async (id) => {
    setMessages(prev => prev.filter(m => m._id !== id));
    await api.delete(`/channels/message/${id}`).catch(() => {});
  };

  return (
  <div className="flex flex-col h-full bg-gray-50 text-gray-900">

    {/* HEADER */}

    <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Hash className="w-4 h-4 text-white" />
        </div>

        <div>
          <h1 className="font-semibold text-gray-900">
            {channel?.name || "Select channel"}
          </h1>
          <p className="text-xs text-gray-500">
            Live channel
          </p>
        </div>

      </div>

    </div>


    {/* MESSAGES */}

    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
    >
      {messages.map((m) => {
        const isMe = m.sender?._id === currentUserId;

        return (
          <div
            key={m._id}
            className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}
          >

            {!isMe && (
              <span className="text-xs font-medium text-indigo-600 mb-1">
                {m.sender?.name}
              </span>
            )}

            <div
              className={`relative max-w-[70%] px-4 py-3 rounded-2xl shadow-sm border ${
                isMe
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-white text-gray-800 border-gray-200"
              }`}
            >

              {m.type === "text" && (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {m.content}
                </p>
              )}

              {m.type === "image" && (
                <img
                  src={m.content}
                  className="rounded-lg max-h-72"
                  onClick={() => window.open(m.content, "_blank")}
                />
              )}

              {m.type === "file" && (
                <div className="mt-2">
                  {renderFilePreview(m, isMe)}
                </div>
              )}

              {isMe && (
                <button
                  onClick={() => deleteMessage(m._id)}
                  className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 text-red-500"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              )}

            </div>

            <span className="text-xs text-gray-400 mt-1">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>

          </div>
        );
      })}
    </div>


    {/* INPUT */}

    <div className="border-t border-gray-200 bg-white p-4">

      <div className="flex items-center gap-3 max-w-5xl mx-auto">

        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={(e) => sendFile(e.target.files[0])}
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="p-2 text-gray-500 hover:text-gray-900"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin"/>
          ) : (
            <Paperclip className="w-5 h-5"/>
          )}
        </button>

        <textarea
          rows="1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={`Message #${channel?.name}`}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={send}
          disabled={!text.trim()}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-30"
        >
          <Send className="w-4 h-4"/>
        </button>

      </div>

    </div>

  </div>
);
};

export default ChannelChat;