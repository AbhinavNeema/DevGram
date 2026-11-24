import { useEffect, useRef, useState } from "react";
import socket from "../../socket";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { 
  Send, 
  Paperclip, 
  Trash2, 
  FileText, 
  Download, 
  Hash, 
  Loader2, 
  Image as ImageIcon,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";

const ChannelChat = ({ channel }) => {
  const { user: authUser, token } = useAuth();

  // Safe fallback for user identification
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

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join channel socket and load messages
  useEffect(() => {
    if (!channel?._id) return;

    setLoadingMessages(true);
    socket.emit("joinChannel", channel._id);

    api.get(`/channels/messages/${channel._id}`)
      .then((res) => {
        setMessages(res.data || []);
        scrollToBottom();
      })
      .catch((err) => {
        console.error("Failed to fetch channel messages", err);
        toast.error("Failed to load channel messages");
      })
      .finally(() => {
        setLoadingMessages(false);
      });

    return () => {
      socket.emit("leaveChannel", channel._id);
    };
  }, [channel?._id]);

  // Socket event listeners
  useEffect(() => {
    if (!channel?._id) return;

    const handleNewMessage = (msg) => {
      const msgChannelId = String(msg.channel?._id || msg.channel);
      if (msgChannelId === String(channel._id)) {
        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };

    const handleDelete = (id) => {
      setMessages((prev) => prev.filter((m) => m._id !== id));
    };

    socket.on("newChannelMessage", handleNewMessage);
    socket.on("deleteChannelMessage", handleDelete);

    return () => {
      socket.off("newChannelMessage", handleNewMessage);
      socket.off("deleteChannelMessage", handleDelete);
    };
  }, [channel?._id]);

  const send = async () => {
    if (!text.trim() || !channel?._id) return;

    const messageText = text.trim();
    setText("");

    try {
      await api.post(`/channels/messages/${channel._id}`, { content: messageText });
    } catch (err) {
      console.error("Send channel message failed", err);
      toast.error("Failed to send message");
      setText(messageText); // Restore typed text on failure
    }
  };

  const sendFile = async (file) => {
    if (!file || !channel?._id) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/channels/${channel._id}/file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("File uploaded");
    } catch (err) {
      console.error("Send file error", err);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteMessage = async (id) => {
    // Optimistic removal
    setMessages((prev) => prev.filter((m) => m._id !== id));
    try {
      await api.delete(`/channels/message/${id}`);
      toast.success("Message removed");
    } catch (err) {
      console.error("Delete message error", err);
      toast.error("Failed to delete message");
    }
  };

  const timeShort = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E] text-white overflow-hidden">
      {/* MESSAGES LIST */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
      >
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
            <span className="text-xs">Loading channel stream...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3 text-indigo-400">
              <Hash className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">
              Welcome to #{channel?.name}!
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              This is the start of the #{channel?.name} channel. Send a message or upload files to kick off collaboration.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const senderId = m.sender?._id || m.sender;
            const isMe = String(senderId) === String(currentUserId);
            const fileName = m.fileMeta?.name || m.content?.split("/").pop() || "Attached File";

            return (
              <div
                key={m._id}
                className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}
              >
                {!isMe && (
                  <span className="text-[11px] font-semibold text-indigo-400 mb-1 ml-1 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-[9px]">
                      {m.sender?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                    {m.sender?.name || "Member"}
                  </span>
                )}

                <div className="relative group/bubble max-w-[85%] sm:max-w-[70%]">
                  <div
                    className={`p-3.5 sm:px-4 sm:py-3 text-sm leading-relaxed ${
                      isMe
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl rounded-br-sm shadow-md shadow-indigo-500/10"
                        : "bg-white/[0.06] text-slate-200 border border-white/[0.06] rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    {/* TEXT CONTENT */}
                    {m.type === "text" && (
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    )}

                    {/* IMAGE ATTACHMENT */}
                    {m.type === "image" && (
                      <div className="overflow-hidden rounded-xl">
                        <img
                          src={m.content}
                          alt="Channel upload"
                          className="max-h-72 w-auto object-cover rounded-lg cursor-pointer hover:opacity-95 transition"
                          onClick={() => window.open(m.content, "_blank")}
                        />
                      </div>
                    )}

                    {/* GENERIC FILE ATTACHMENT */}
                    {m.type === "file" && (
                      <div>
                        {/\.(jpe?g|png|gif|webp|svg)$/i.test(m.content) ? (
                          <img
                            src={m.content}
                            alt={fileName}
                            className="max-h-72 rounded-lg cursor-pointer hover:opacity-95 transition"
                            onClick={() => window.open(m.content, "_blank")}
                          />
                        ) : (
                          <a
                            href={m.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 p-2.5 rounded-xl border transition ${
                              isMe
                                ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                                : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-indigo-300 hover:text-indigo-200"
                            }`}
                          >
                            <FileText className="w-5 h-5 shrink-0" />
                            <div className="truncate max-w-[200px] sm:max-w-xs text-xs">
                              <p className="font-semibold truncate">{fileName}</p>
                              {m.fileMeta?.size && (
                                <p className="text-[10px] opacity-75">
                                  {(m.fileMeta.size / 1024).toFixed(1)} KB
                                </p>
                              )}
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1 opacity-70" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        isMe ? "text-indigo-200/80" : "text-slate-400"
                      }`}
                    >
                      <span>{timeShort(m.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions for message owner */}
                  {isMe && (
                    <button
                      onClick={() => deleteMessage(m._id)}
                      className="absolute -left-8 top-2 opacity-0 group-hover/bubble:opacity-100 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* INPUT BAR */}
      <div className="p-4 bg-white/[0.02] border-t border-white/[0.06] backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={(e) => sendFile(e.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-3 text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] rounded-xl transition duration-200 disabled:opacity-40"
            title="Attach file or media"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Message #${channel?.name || "channel"}`}
            className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 resize-none max-h-32"
          />

          <button
            onClick={send}
            disabled={!text.trim()}
            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-40 disabled:hover:from-indigo-500 text-white p-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelChat;