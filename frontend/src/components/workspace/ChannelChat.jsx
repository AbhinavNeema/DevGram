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
    <div className="flex flex-col h-full bg-[#07080B] text-white">
      {/* HEADER: High Contrast with Solid Border */}
      <div className="px-6 py-4 border-b border-white/10 bg-[#0F111A] flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Hash className="w-5 h-5 text-white stroke-[3px]" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight leading-none">
              {channel?.name || "Select a channel"}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Live Channel</p>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES: High Contrast Bubbles */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#111420] to-[#07080B]"
      >
        {messages.map((m) => {
          const isMe = m.sender?._id === currentUserId;
          return (
            <div key={m._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}>
              {!isMe && (
                <span className="text-xs font-black text-indigo-400 ml-2 mb-1 uppercase tracking-wider">
                  {m.sender?.name}
                </span>
              )}
              
              <div className={`relative max-w-[80%] md:max-w-[65%] p-4 shadow-xl transition-all ${
                isMe 
                  ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none border border-indigo-400/30" 
                  : "bg-[#1C202B] text-slate-50 rounded-2xl rounded-tl-none border border-white/5"
              }`}>
                
                {/* TEXT: Increased font size and weight for readability */}
                {m.type === "text" && (
                  <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
                    {m.content}
                  </p>
                )}

                {/* MEDIA PREVIEWS */}
                {m.type === "image" && (
                  <div className="mt-1 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={m.content}
                      className="max-h-80 w-full object-cover cursor-pointer"
                      onClick={() => window.open(m.content, "_blank")}
                    />
                  </div>
                )}

                {m.type === "file" && <div className="mt-2">{renderFilePreview(m, isMe)}</div>}

                {/* DELETE BUTTON */}
                {isMe && (
                  <button
                    onClick={() => deleteMessage(m._id)}
                    className="absolute -left-10 top-2 p-2 opacity-0 group-hover:opacity-100 text-rose-500 hover:scale-110 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* TIMESTAMP: High Visibility Slate */}
              <div className="flex items-center gap-1 mt-1 px-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && <CheckCircle2 className="w-3 h-3 text-indigo-500 opacity-50" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT: Deep Contrast "Control Bar" */}
      <div className="p-4 bg-[#0F111A] border-t border-white/10">
        <div className="max-w-5xl mx-auto flex items-end gap-3 bg-[#161925] border-2 border-white/5 rounded-2xl p-2.5 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-2xl">
          <input type="file" hidden ref={fileInputRef} onChange={e => sendFile(e.target.files[0])} />

          <button
            onClick={() => fileInputRef.current.click()}
            className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-500" /> : <Paperclip className="w-5 h-5 stroke-[2.5px]" />}
          </button>

          <textarea
            rows="1"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder={`Message # ${channel?.name}`}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 font-semibold py-2.5 resize-none max-h-32"
          />

          <button
            onClick={send}
            disabled={!text.trim()}
            className="p-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-20 transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
          >
            <Send className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4F46E5; }
      `}</style>
    </div>
  );
};

const renderFilePreview = (m, isMe) => {
  const name = m.fileName || "File";
  const ext = name.split(".").pop()?.toLowerCase();
  const isVideo = ["mp4", "webm", "mov"].includes(ext);
  const isAudio = ["mp3", "wav"].includes(ext);

  if (isVideo) return <video src={m.content} controls className="rounded-lg max-h-64 border border-white/10 w-full bg-black" />;
  if (isAudio) return <audio src={m.content} controls className="w-full h-10 mt-1 invert" />;

  return (
    <div className={`flex items-center gap-4 p-3 rounded-xl border ${isMe ? 'bg-black/20 border-white/10' : 'bg-black/40 border-white/5'} transition-all`}>
      <div className="p-3 bg-indigo-600/20 rounded-lg text-indigo-400">
        <FileText className="w-6 h-6 stroke-[2.5px]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{name}</p>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{ext} · {m.fileSize ? (m.fileSize / 1024).toFixed(1) : '0'} KB</p>
      </div>
      <a href={m.content} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
        <Download className="w-5 h-5" />
      </a>
    </div>
  );
};

export default ChannelChat;