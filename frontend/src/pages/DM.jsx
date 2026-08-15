import { useEffect, useState, useRef, useCallback } from "react";
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
  MessageSquare,
  User,
} from "lucide-react";

/* Parse JWT payload safely */
const parseToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const DM = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const editInputRef = useRef(null);
  const sendInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const payload = parseToken();
  const currentUserId = payload?.sub || payload?.id || null;

  const [inbox, setInbox] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= Fetch Inbox ================= */
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        setLoadingInbox(true);
        const res = await api.get("/messages/inbox");
        setInbox(res.data);
      } catch (err) {
        console.error("Failed to fetch inbox:", err);
        toast.error("Failed to load messages");
      } finally {
        setLoadingInbox(false);
      }
    };
    fetchInbox();
  }, []);

  /* ================= Set Active Conversation from Inbox ================= */
  useEffect(() => {
    if (!conversationId || inbox.length === 0) {
      setActiveConversation(null);
      return;
    }
    const conv = inbox.find(c => c._id === conversationId);
    setActiveConversation(conv || null);
  }, [conversationId, inbox]);

  /* ================= Fetch Messages when Conversation Changes ================= */
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get(`/messages/${conversationId}`);
        setMessages(res.data || []);

        setInbox(prev =>
          prev.map(c =>
            c._id === conversationId ? { ...c, unreadCount: 0 } : c
          )
        );

        api.put(`/messages/read/${conversationId}`).catch(console.error);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        toast.error("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  /* ================= Socket Listeners ================= */
  useEffect(() => {
    if (!conversationId) return;

    if (!socket.connected) socket.connect();
    socket.emit("joinConversation", conversationId);

    const handleNewMessage = (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;

        if (msg.clientId) {
          const idx = prev.findIndex(m => m.clientId === msg.clientId);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = msg;
            return copy;
          }
        }

        if (String(msg.conversation) !== String(conversationId)) return prev;
        return [...prev, msg];
      });

      setInbox(prev =>
        prev.map(c => {
          const isCurrentConv = String(c._id) === String(msg.conversation);
          return {
            ...c,
            lastMessage: msg,
            unreadCount: isCurrentConv ? 0 : (c.unreadCount || 0) + 1,
          };
        })
      );

      scrollToBottom();
    };

    const handleEditMessage = (updated) => {
      setMessages(prev =>
        prev.map(m => (m._id === updated._id ? updated : m))
      );
    };

    const handleDeleteMessage = (id) => {
      setMessages(prev => prev.filter(m => m._id !== id));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("editMessage", handleEditMessage);
    socket.on("deleteMessage", handleDeleteMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("editMessage", handleEditMessage);
      socket.off("deleteMessage", handleDeleteMessage);
      socket.emit("leaveConversation", conversationId);
    };
  }, [conversationId, currentUserId]);

  /* ================= Helpers ================= */
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const sendMessage = async () => {
    if (!text.trim() || !conversationId) return;

    const msgText = text.trim();
    const clientId = `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    setText("");

    const optimisticMsg = {
      _id: clientId,
      clientId,
      conversation: conversationId,
      content: msgText,
      type: "text",
      sender: { _id: currentUserId, name: payload?.name },
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
    } catch (err) {
      toast.error("Failed to send message");
      setMessages(prev => prev.filter(m => m._id !== clientId));
    }
  };

  const sendImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    const formData = new FormData();
    formData.append("image", file);

    const clientId = `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const optimisticMsg = {
      _id: clientId,
      clientId,
      conversation: conversationId,
      content: URL.createObjectURL(file),
      type: "image",
      sender: { _id: currentUserId },
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const res = await api.post(`/messages/dm/${conversationId}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data) {
        setMessages(prev => {
          const idx = prev.findIndex(m => m.clientId === clientId);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = res.data;
            return copy;
          }
          return prev;
        });
      }
    } catch (err) {
      toast.error("Failed to send image");
      setMessages(prev => prev.filter(m => m._id !== clientId));
    }

    e.target.value = null;
  };

  const startEditMessage = (msg) => {
    if (!msg || msg.type === "image") return;
    if (!msg._id || String(msg._id).startsWith("c-")) return;
    if (String(msg.sender?._id) !== String(currentUserId)) return;

    setEditingMessageId(msg._id);
    setEditingText(msg.content || "");
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const saveEdit = async (msgId) => {
    if (!editingText.trim()) return;

    try {
      const res = await api.put(`/messages/message/${msgId}`, {
        content: editingText.trim(),
      });
      setMessages(prev => prev.map(m => (m._id === msgId ? res.data : m)));
      setEditingMessageId(null);
      setEditingText("");
      toast.success("Message edited");
    } catch (err) {
      console.error("Edit message error:", err);
      toast.error("Failed to edit message");
      setEditingMessageId(null);
      setEditingText("");
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const deleteMessage = async (id) => {
    if (String(id).startsWith("c-")) return;

    try {
      await api.delete(`/messages/message/${id}`);
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch {
      toast.error("Failed to delete message");
    }
  };

  /* ================= Render Helpers ================= */
  const otherUser = activeConversation?.participants?.find(
    p => String(p._id) !== String(currentUserId)
  );

  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredInbox = inbox.filter(conv => {
    if (!searchQuery) return true;
    const other = conv.participants?.find(p => String(p._id) !== String(currentUserId));
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           other?.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-120px)] flex overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
      {/* ================= INBOX SIDEBAR ================= */}
      <div
        className={`
          ${conversationId ? "hidden md:flex" : "flex"}
          w-full md:w-[360px] flex-col bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200/50 dark:border-slate-700/50
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Messages</h2>
              <p className="text-xs text-slate-500">{inbox.length} conversations</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loadingInbox ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Loading...</p>
            </div>
          ) : filteredInbox.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 p-4">
              <MessageSquare className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm font-medium">
                {searchQuery ? "No matches found" : "No messages yet"}
              </p>
            </div>
          ) : (
            filteredInbox.map(conv => {
              const other = conv.participants?.find(
                p => String(p._id) !== String(currentUserId)
              );
              const isActive = conversationId === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => navigate(`/dm/${conv._id}`)}
                  className={`
                    flex items-center gap-3 p-4 cursor-pointer transition-all border-l-3
                    ${isActive
                      ? "bg-gradient-to-r from-primary/10 to-transparent border-l-primary"
                      : "hover:bg-slate-100/50 dark:hover:bg-slate-700/50 border-l-transparent"}
                  `}
                >
                  {/* Avatar with gradient */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-white shadow-lg">
                      {other?.profilePhoto ? (
                        <img src={other.profilePhoto} alt={other.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        other?.name?.[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {other?.name || "Unknown"}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">
                        {formatTime(conv.lastMessage?.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`
                        text-xs truncate
                        ${(conv.unreadCount || 0) > 0
                          ? "text-slate-700 dark:text-slate-300 font-medium"
                          : "text-slate-500 dark:text-slate-400"}
                      `}
                    >
                      {conv.lastMessage?.content || "Start a conversation..."}
                    </p>
                  </div>

                  {(conv.unreadCount || 0) > 0 && (
                    <div className="w-5 h-5 bg-gradient-to-r from-primary to-accent text-white text-[10px] rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= CHAT VIEWPORT ================= */}
      <div
        className={`
          flex-1 flex flex-col
          ${!conversationId ? "hidden md:flex items-center justify-center" : ""}
        `}
      >
        {!conversationId ? (
          <div className="text-center p-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Select a conversation
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Choose someone to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/dm")}
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-white shadow-lg">
                  {otherUser?.profilePhoto ? (
                    <img src={otherUser.profilePhoto} alt={otherUser.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    otherUser?.name?.[0]?.toUpperCase() || "?"
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {otherUser?.name || "Unknown"}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">Online</span>
                  </div>
                </div>
              </div>

              <button className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                  <p className="text-xs text-slate-500">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs text-slate-400 mt-1">Say hello to start the conversation!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const mine = String(msg.sender?._id) === String(currentUserId);
                  const isOptimistic = String(msg._id).startsWith("c-");

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${mine ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div
                        className={`
                          max-w-[70%] px-4 py-3 rounded-2xl text-sm relative group transition-all
                          ${mine
                            ? "bg-gradient-to-r from-primary to-accent text-white rounded-br-md shadow-lg shadow-indigo-500/20"
                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/50 dark:border-slate-700/50 rounded-bl-md shadow-sm"}
                        `}
                      >
                        {/* Image */}
                        {msg.type === "image" && (
                          <img
                            src={
                              msg.content?.startsWith("http")
                                ? msg.content
                                : `${import.meta.env.VITE_BACKEND_URL}${msg.content}`
                            }
                            alt="Shared"
                            className="rounded-xl max-w-full max-h-64 object-cover shadow-md"
                            loading="lazy"
                          />
                        )}

                        {/* Editing UI */}
                        {editingMessageId === msg._id ? (
                          <div>
                            <input
                              ref={editInputRef}
                              value={editingText}
                              onChange={e => setEditingText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter") saveEdit(msg._id);
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className={`
                                w-full px-2 py-1.5 text-sm rounded-lg outline-none
                                ${mine
                                  ? "bg-white/20 text-white placeholder:text-white/50"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600"}
                              `}
                              placeholder="Edit message..."
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => saveEdit(msg._id)}
                                className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                        )}

                        {/* Timestamp */}
                        <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${mine ? "text-white/70" : "text-slate-400"}`}>
                          {isOptimistic ? (
                            <>
                              <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" />
                              <span>sending...</span>
                            </>
                          ) : (
                            formatTime(msg.createdAt)
                          )}
                        </div>

                        {/* Actions */}
                        {mine && !editingMessageId && !isOptimistic && (
                          <div className={`absolute -top-7 right-0 flex gap-1 p-1 rounded-xl shadow-lg backdrop-blur-sm border transition-all ${
                            mine
                              ? "bg-white/90 dark:bg-slate-800/90 border-slate-200/50 dark:border-slate-700/50"
                              : "bg-slate-800/90 border-slate-700/50"
                          }`}>
                            {msg.type !== "image" && (
                              <button
                                onClick={() => startEditMessage(msg)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition-all"
                                title="Edit"
                              >
                                <Edit3 size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteMessage(msg._id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl p-2 border border-slate-200/50 dark:border-slate-700/50">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={sendImage}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                  title="Send image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

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
                  placeholder="Write a message..."
                  rows={1}
                  className="flex-1 resize-none outline-none text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 py-2"
                />

                <button
                  onClick={sendMessage}
                  disabled={!text.trim()}
                  className="p-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};

export default DM;