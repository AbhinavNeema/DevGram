import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
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
  Smile,
  Paperclip,
  CheckCheck,
  User,
  Sparkles
} from "lucide-react";

const DM = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user: authUser, token } = useAuth();

  // Safe fallback user resolver
  const user = authUser || (() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { id: payload.sub || payload.id || payload._id, ...payload };
    } catch {
      return null;
    }
  })();

  const currentUserId = user?.id || user?._id;

  const messagesEndRef = useRef(null);
  const editInputRef = useRef(null);
  const sendInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [inbox, setInbox] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch inbox on mount
  useEffect(() => {
    setLoadingInbox(true);
    api.get("/messages/inbox")
      .then((res) => {
        setInbox(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load inbox", err);
      })
      .finally(() => {
        setLoadingInbox(false);
      });
  }, []);

  // Update active conversation based on route or fetched inbox
  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    const found = inbox.find((c) => c._id === conversationId);
    if (found) {
      setActiveConversation(found);
    } else {
      // Fallback: If navigating directly to a conversation not yet in state, fetch inbox
      api.get("/messages/inbox")
        .then((res) => {
          const list = res.data || [];
          setInbox(list);
          const match = list.find((c) => c._id === conversationId);
          if (match) {
            setActiveConversation(match);
          }
        })
        .catch(() => {});
    }
  }, [conversationId, inbox]);

  // Handle joining socket room and loading messages
  useEffect(() => {
    if (!conversationId) return;

    socket.emit("joinConversation", conversationId);
    setLoadingMessages(true);

    api.get(`/messages/${conversationId}`)
      .then((res) => {
        setMessages(res.data || []);
        setInbox((prev) =>
          prev.map((c) =>
            c._id === conversationId ? { ...c, unreadCount: 0 } : c
          )
        );
        scrollToBottom();
      })
      .catch((err) => {
        console.error("Failed to get messages", err);
        toast.error("Failed to load messages");
      })
      .finally(() => {
        setLoadingMessages(false);
      });

    // Mark as read
    api.put(`/messages/read/${conversationId}`).catch(() => {});

    return () => {
      socket.emit("leaveConversation", conversationId);
    };
  }, [conversationId]);

  // Socket event listeners for real-time messages, edits, and deletions
  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = (msg) => {
      const msgConvId = String(msg.conversation?._id || msg.conversation);
      if (msgConvId !== String(conversationId)) return;

      const senderId = String(msg.sender?._id || msg.sender);
      const isMine = senderId === String(currentUserId);

      setMessages((prev) => {
        if (isMine) {
          // Check if there is an optimistic message waiting to be replaced
          const hasOptimistic = prev.some(
            (m) => String(m._id).startsWith("c-") && m.content === msg.content
          );

          if (hasOptimistic) {
            let replaced = false;
            return prev.map((m) => {
              if (!replaced && String(m._id).startsWith("c-") && m.content === msg.content) {
                replaced = true;
                return msg;
              }
              return m;
            });
          }

          // If already has exact real ID, don't duplicate
          if (prev.some((m) => String(m._id) === String(msg._id))) {
            return prev;
          }
          return [...prev, msg];
        } else {
          // Message from other user
          if (prev.some((m) => String(m._id) === String(msg._id))) {
            return prev;
          }
          return [...prev, msg];
        }
      });

      // Update inbox preview
      setInbox((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: msg, unreadCount: 0 }
            : c
        )
      );

      scrollToBottom();
    };

    const handleEditMessage = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    const handleDeleteMessage = (msgId) => {
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("editMessage", handleEditMessage);
    socket.on("deleteMessage", handleDeleteMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("editMessage", handleEditMessage);
      socket.off("deleteMessage", handleDeleteMessage);
    };
  }, [conversationId, currentUserId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
      sender: { _id: currentUserId, name: user?.name || "You" },
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const res = await api.post("/messages/send", {
        conversationId,
        content: msgText,
        type: "text",
        clientId,
      });

      // Swap out the optimistic message with server populated message
      if (res?.data) {
        setMessages((prev) =>
          prev.map((m) => (m._id === clientId ? res.data : m))
        );
      }
    } catch (err) {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== clientId));
      setText(msgText);
    }
  };

  const sendImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post(`/messages/dm/${conversationId}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data) {
        setMessages((prev) =>
          prev.some((m) => m._id === res.data._id) ? prev : [...prev, res.data]
        );
        scrollToBottom();
      }
    } catch (err) {
      toast.error("Failed to send image");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const startEditMessage = (msg) => {
    if (!msg || msg.type === "image") return;
    if (!msg._id || String(msg._id).startsWith("c-")) return;
    const senderId = msg.sender?._id || msg.sender;
    if (String(senderId) !== String(currentUserId)) return;

    setEditingMessageId(msg._id);
    setEditingText(msg.content || "");

    setTimeout(() => {
      editInputRef.current?.focus();
    }, 50);
  };

  const saveEdit = async (msgId) => {
    if (!editingText.trim()) return;
    try {
      const res = await api.put(`/messages/message/${msgId}`, { content: editingText.trim() });
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? res.data : m))
      );
      setEditingMessageId(null);
      toast.success("Message updated");
    } catch (err) {
      toast.error("Failed to edit message");
    }
  };

  const deleteMessage = async (id) => {
    try {
      await api.delete(`/messages/message/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Derive otherUser with multiple fallbacks
  const otherUser = useMemo(() => {
    if (activeConversation?.participants) {
      const other = activeConversation.participants.find(
        (p) => String(p._id) !== String(currentUserId)
      );
      if (other) return other;
    }

    // Secondary fallback from message history
    const otherMsg = messages.find(
      (m) => m.sender && String(m.sender._id || m.sender) !== String(currentUserId)
    );
    if (otherMsg?.sender && typeof otherMsg.sender === "object") {
      return otherMsg.sender;
    }

    return null;
  }, [activeConversation, messages, currentUserId]);

  const timeShort = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // Filter inbox based on search query
  const filteredInbox = useMemo(() => {
    if (!searchQuery.trim()) return inbox;
    const q = searchQuery.toLowerCase();
    return inbox.filter((conv) => {
      const other = conv.participants?.find(
        (p) => String(p._id) !== String(currentUserId)
      );
      const nameMatch = other?.name?.toLowerCase().includes(q);
      const lastMsgMatch = conv.lastMessage?.content?.toLowerCase().includes(q);
      return nameMatch || lastMsgMatch;
    });
  }, [inbox, searchQuery, currentUserId]);

  return (
    <div className="h-[calc(100vh-73px)] flex bg-[#0A0F1E] overflow-hidden">
      {/* LEFT SIDEBAR: CONVERSATIONS LIST */}
      <aside
        className={`${
          conversationId ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 flex-col bg-white/[0.02] border-r border-white/[0.06] backdrop-blur-xl z-20`}
      >
        {/* Inbox Header */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Messages</h1>
            </div>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08]">
              {inbox.length}
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
          {loadingInbox ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading chats...
            </div>
          ) : filteredInbox.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3 text-slate-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-400">
                {searchQuery ? "No matching conversations" : "No conversations yet"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery
                  ? "Try searching for a different name or message"
                  : "Visit user profiles to start a conversation"}
              </p>
            </div>
          ) : (
            filteredInbox.map((conv) => {
              const other = conv.participants?.find(
                (p) => String(p._id) !== String(currentUserId)
              );
              const isSelected = conversationId === conv._id;
              const unread = conv.unreadCount || 0;

              return (
                <button
                  key={conv._id}
                  onClick={() => navigate(`/dm/${conv._id}`)}
                  className={`w-full text-left p-4 flex items-center gap-3.5 transition-all duration-200 border-l-2 ${
                    isSelected
                      ? "bg-indigo-500/10 border-indigo-500 text-white"
                      : "border-transparent hover:bg-white/[0.04] text-slate-300"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {other?.name ? other.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#0A0F1E]" />
                  </div>

                  {/* Conv Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-white truncate">
                        {other?.name || "Direct Message"}
                      </span>
                      <span className="text-[11px] text-slate-500 shrink-0 ml-2">
                        {timeShort(conv.lastMessage?.createdAt || conv.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate ${unread > 0 ? "text-slate-200 font-medium" : "text-slate-400"}`}>
                        {conv.lastMessage?.type === "image"
                          ? "📷 Image attachment"
                          : conv.lastMessage?.content || "No messages yet"}
                      </p>
                      {unread > 0 && (
                        <span className="shrink-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* RIGHT CHAT AREA */}
      <main
        className={`${
          !conversationId ? "hidden md:flex" : "flex"
        } flex-1 flex-col bg-[#0A0F1E] relative overflow-hidden`}
      >
        {!conversationId ? (
          /* Empty State when no conversation is active */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/10">
              <Sparkles className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Select a conversation</h2>
            <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
              Choose an existing chat from the left or search for people in the network to initiate a direct dialogue.
            </p>
            <button
              onClick={() => navigate("/search")}
              className="bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300"
            >
              Explore Developers
            </button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="h-16 shrink-0 bg-white/[0.02] border-b border-white/[0.06] backdrop-blur-xl px-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => navigate("/dm")}
                  className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0A0F1E]" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white leading-tight">
                    {otherUser?.name || "Direct Message"}
                  </h2>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (otherUser?._id) navigate(`/user/${otherUser._id}`);
                  }}
                  className="bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-300"
                >
                  View Profile
                </button>
              </div>
            </header>

            {/* Messages Viewport */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <span className="text-xs">Loading dialogue...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3 text-indigo-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-white">No messages here yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Send a greeting to start collaborating or sharing ideas!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId = msg.sender?._id || msg.sender;
                  const isMine = String(senderId) === String(currentUserId);
                  const isOptimistic = String(msg._id).startsWith("c-");

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col group ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
                        {!isMine && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1">
                            {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : "U"}
                          </div>
                        )}

                        <div className="relative group/bubble">
                          {/* Chat Bubble */}
                          <div
                            className={`p-3.5 sm:px-4 sm:py-3 text-sm leading-relaxed transition-all duration-200 ${
                              isMine
                                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl rounded-br-sm shadow-md shadow-indigo-500/10"
                                : "bg-white/[0.06] text-slate-200 border border-white/[0.06] rounded-2xl rounded-bl-sm"
                            }`}
                          >
                            {msg.type === "image" ? (
                              <div className="overflow-hidden rounded-xl">
                                <img
                                  src={
                                    msg.content?.startsWith("http")
                                      ? msg.content
                                      : `${import.meta.env.VITE_BACKEND_URL}${msg.content}`
                                  }
                                  alt="attachment"
                                  className="max-h-72 w-auto object-cover rounded-lg cursor-pointer hover:opacity-95 transition"
                                  onClick={() => window.open(msg.content, "_blank")}
                                />
                              </div>
                            ) : editingMessageId === msg._id ? (
                              <div className="space-y-2 min-w-[200px]">
                                <input
                                  ref={editInputRef}
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEdit(msg._id);
                                    if (e.key === "Escape") setEditingMessageId(null);
                                  }}
                                  className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white"
                                />
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setEditingMessageId(null)}
                                    className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => saveEdit(msg._id)}
                                    className="p-1 bg-emerald-500 hover:bg-emerald-600 rounded text-white"
                                    title="Save"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            )}

                            {/* Timestamp & Status */}
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isMine ? "text-indigo-200/80" : "text-slate-400"
                              }`}
                            >
                              <span>{timeShort(msg.createdAt)}</span>
                              {isMine && (
                                isOptimistic ? (
                                  <span className="italic opacity-70">sending...</span>
                                ) : (
                                  <CheckCheck className="w-3 h-3 text-indigo-200" />
                                )
                              )}
                            </div>
                          </div>

                          {/* Quick Message Actions for user's own messages */}
                          {isMine && !editingMessageId && !isOptimistic && (
                            <div className="absolute right-0 -top-8 hidden group-hover/bubble:flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-lg px-1.5 py-0.5 shadow-lg z-10">
                              {msg.type !== "image" && (
                                <button
                                  onClick={() => startEditMessage(msg)}
                                  className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition"
                                  title="Edit message"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteMessage(msg._id)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition"
                                title="Delete message"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <footer className="p-4 bg-white/[0.02] border-t border-white/[0.06] backdrop-blur-xl">
              <div className="max-w-4xl mx-auto flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  hidden
                  onChange={sendImage}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] rounded-xl transition duration-200 disabled:opacity-40"
                  title="Upload Image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    ref={sendInputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={`Message ${otherUser?.name || "..."}`}
                    rows={1}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 resize-none max-h-32"
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!text.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-40 disabled:hover:from-indigo-500 disabled:hover:to-violet-500 text-white p-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
};

export default DM;