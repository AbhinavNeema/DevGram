import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import socket from "../socket";
import { 
  Send, 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  MoreVertical, 
  Search,
  Check,
  X,
  MessageSquare
} from "lucide-react";

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

  /* ================= Logic (Remains 100% Identical) ================= */
  useEffect(() => {
    api.get("/messages/inbox").then(res => setInbox(res.data));
  }, []);

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
    if (!conversationId) return;
    socket.emit("joinConversation", conversationId);
    api.get(`/messages/${conversationId}`).then(res => {
      setMessages(res.data);
      scrollToBottom();
    });
    api.put(`/messages/read/${conversationId}`);
    setInbox(prev => prev.map(c => c._id === conversationId ? { ...c, unreadCount: 0 } : c));
  }, [conversationId]);

  useEffect(() => {
    const handleNewMessage = msg => {
      // Ignore echo of optimistic messages without clientId match
      if (msg.sender?._id === currentUserId && !msg.clientId) return;

      setMessages(prev => {
        // replace optimistic message
        if (msg.clientId) {
          const idx = prev.findIndex(m => m.clientId === msg.clientId);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = msg;
            return copy;
          }
        }

        // dedupe
        if (prev.some(m => m._id === msg._id)) return prev;

        // only for current conversation
        if (String(msg.conversation) !== String(conversationId)) return prev;

        return [...prev, msg];
      });

      // 🔥 UPDATE INBOX (last message + unread)
      setInbox(prev =>
        prev.map(c =>
          String(c._id) === String(msg.conversation)
            ? {
                ...c,
                lastMessage: msg,
                unreadCount:
                  String(msg.conversation) === String(conversationId)
                    ? 0
                    : (c.unreadCount || 0) + 1,
              }
            : c
        )
      );

      scrollToBottom();
    };
    const handleEditMessage = updated => {
      setMessages(prev => prev.map(m => (m._id === updated._id ? updated : m)));
    };
    const handleDeleteMessage = id => {
      setMessages(prev => prev.filter(m => m._id !== id));
    };
    socket.on("newMessage", handleNewMessage);
    socket.on("editMessage", handleEditMessage);
    socket.on("deleteMessage", handleDeleteMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("editMessage", handleEditMessage);
      socket.off("deleteMessage", handleDeleteMessage);
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = async () => {
    if (!text.trim() || !conversationId) return;

    const msgText = text.trim();
    const clientId = "c-" + Date.now() + "-" + Math.random().toString(36).slice(2);

    setText("");

    const optimisticMsg = {
      _id: clientId,
      clientId,
      conversation: conversationId,
      content: msgText,
      type: "text",
      sender: { _id: currentUserId },
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      await api.post("/messages/send", {
        conversationId,
        content: msgText,
        type: "text",
        clientId,
      });
    } catch {
      toast.error("Failed to send message");
      setMessages(prev => prev.filter(m => m._id !== clientId));
    }
  };

  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !conversationId) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await api.post(`/messages/dm/${conversationId}/image`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data) {
        setMessages(prev => (prev.some(m => m._id === res.data._id) ? prev : [...prev, res.data]));
        scrollToBottom();
      }
    } catch (err) { toast.error("Failed to send image"); }
    e.target.value = null;
  };

  const startEditMessage = msg => {
    if (msg.type === "image") return;
    setEditingMessageId(msg._id);
    setEditingText(msg.content || "");
  };

  const saveEdit = async (msgId) => {
    if (!editingText.trim()) return;
    try {
      const res = await api.put(`/messages/message/${msgId}`, { content: editingText });
      setMessages(prev => prev.map(m => (m._id === msgId ? res.data : m)));
      setEditingMessageId(null);
    } catch (err) { toast.error("Failed to edit"); }
  };

  const deleteMessage = async id => {
  try {
    await api.delete(`/messages/message/${id}`);
    setMessages(prev => prev.filter(m => m._id !== id));
  } catch {
    toast.error("Delete failed");
  }
};

  const otherUser = activeConversation?.participants?.find(p => p._id !== currentUserId);
  const timeShort = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

  return (
    <div className="h-[calc(100vh-100px)] flex bg-[#050505] overflow-hidden rounded-[32px] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
      
      {/* INBOX SIDEBAR */}
      <div className={`
        ${conversationId ? "hidden md:flex" : "flex"} 
        w-full md:w-[380px] flex-col bg-[#0F111A] border-r border-white/5
      `}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase mb-4">Encryption/Inbox</h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              placeholder="Search frequencies..." 
              className="w-full bg-[#050505] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {inbox.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-600 opacity-50">
              <MessageSquare className="w-8 h-8 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">No Signals Detected</p>
            </div>
          ) : (
            inbox.map(conv => {
              const other = conv.participants.find(p => String(p._id) !== String(currentUserId));
              const active = conversationId === conv._id;
              return (
                <div
                  key={conv._id}
                  onClick={() => navigate(`/dm/${conv._id}`)}
                  className={`group relative flex items-center gap-4 p-5 cursor-pointer transition-all duration-300 ${
                    active ? "bg-indigo-600/10" : "hover:bg-white/[0.02]"
                  }`}
                >
                  {active && <div className="absolute left-0 w-1 h-12 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" />}
                  
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-lg ${
                      active ? "bg-indigo-600 shadow-indigo-500/20 scale-110" : "bg-slate-800 border border-white/5 group-hover:scale-105"
                    } transition-all`}>
                      {other?.name?.[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#0F111A]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-black tracking-tight truncate ${active ? "text-white" : "text-slate-200"}`}>
                        {other?.name}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                        {conv.lastMessage?.createdAt
                          ? timeShort(conv.lastMessage.createdAt)
                          : ""}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${active ? "text-indigo-200" : "text-slate-500"} font-medium`}>
                      {conv.lastMessage?.content || "Transmission pending..."}
                    </p>
                  </div>

                  {(conv.unreadCount || 0) > 0 && (
                    <div className="bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 animate-pulse">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CHAT VIEWPORT */}
      <div className={`flex-1 flex flex-col bg-[#050505] ${!conversationId && "hidden md:flex items-center justify-center"}`}>
        {!conversationId ? (
          <div className="text-center p-12">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-slate-700" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-[0.3em]">Secure Terminal</h2>
            <p className="text-slate-500 text-xs font-bold mt-4">SELECT A SIGNAL TO BEGIN COMMUNICATION</p>
          </div>
        ) : (
          <>
            {/* CHAT HEADER */}
            <div className="px-6 py-4 flex items-center justify-between bg-[#0F111A]/60 backdrop-blur-md border-b border-white/5 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate("/dm")} className="md:hidden p-2 text-slate-400 hover:text-white"><ChevronLeft /></button>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-indigo-500/20">
                  {otherUser?.name?.[0]}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight leading-none mb-1">{otherUser?.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Link</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-500 hover:text-white transition-colors"><MoreVertical /></button>
            </div>

            {/* MESSAGES FEED */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#111420] to-[#050505] custom-scrollbar">
              {messages.map(msg => {
                const mine = msg.sender?._id === currentUserId;
                return (
                  <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"} group/msg animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`relative max-w-[85%] sm:max-w-[70%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      {!mine && <span className="text-[10px] font-black text-indigo-400 mb-1.5 ml-2 uppercase tracking-widest">{msg.sender?.name}</span>}
                      
                      <div className={`px-4 py-3 rounded-2xl shadow-xl transition-all ${
                        mine 
                          ? "bg-indigo-600 text-white rounded-tr-none border border-indigo-400/30" 
                          : "bg-[#1A1D26] text-slate-50 rounded-tl-none border border-white/5"
                      }`}>
                        {msg.type === "image" ? (
                          <div className="relative group/img">
                            <img
                              src={
                                msg.content.startsWith("http")
                                  ? msg.content
                                  : `${import.meta.env.VITE_BACKEND_URL}${msg.content}`
                              }
                              alt="sent"
                              className="max-w-full rounded-xl border border-white/10"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                              <ImageIcon className="text-white" />
                            </div>
                          </div>
                        ) : (
                          editingMessageId === msg._id ? (
                            <div className="space-y-2">
                              <input ref={editInputRef} value={editingText} onChange={e => setEditingText(e.target.value)} className="bg-black/20 border border-white/10 text-white text-sm px-3 py-1.5 rounded-lg outline-none focus:border-white/40" />
                              <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest">
                                <button onClick={() => saveEdit(msg._id)} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Check className="w-3 h-3"/> Commit</button>
                                <button onClick={() => setEditingMessageId(null)} className="text-rose-400 hover:text-rose-300 flex items-center gap-1"><X className="w-3 h-3"/> Abort</button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[15px] font-medium leading-relaxed">{msg.content}</p>
                          )
                        )}
                        <div className={`mt-2 text-[9px] font-black uppercase tracking-tighter opacity-50 ${mine ? "text-white" : "text-slate-400"}`}>
                          {timeShort(msg.createdAt)}
                        </div>
                      </div>

                      {mine && !editingMessageId && (
                        <div className="flex gap-3 mt-1.5 px-2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                          {msg.type !== "image" && <button onClick={() => startEditMessage(msg)} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-400">Edit</button>}
                          <button onClick={() => deleteMessage(msg._id)} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-rose-500">Purge</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE INPUT */}
            <div className="p-4 bg-[#0F111A] border-t border-white/5">
              <div className="max-w-4xl mx-auto flex items-end gap-3 bg-[#1A1D26] border-2 border-white/5 rounded-2xl p-2.5 focus-within:border-indigo-500/50 transition-all shadow-2xl">
                <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={sendImage} />
                <button onClick={() => fileInputRef.current.click()} className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <ImageIcon className="w-5 h-5 stroke-[2.5px]" />
                </button>

                <textarea
                  ref={sendInputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Establish communication link..."
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 font-semibold py-2.5 resize-none max-h-32"
                />

                <button
                  onClick={sendMessage}
                  disabled={!text.trim()}
                  className="p-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-20 transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
                >
                  <Send className="w-5 h-5 fill-current" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4F46E5; }
      `}</style>
    </div>
  );
};

export default DM;