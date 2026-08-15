import { useEffect, useRef, useState, useCallback } from "react";
import socket from "../../socket";
import api from "../../api/axios";
import {
  Send,
  Paperclip,
  Trash2,
  FileText,
  Image as ImageIcon,
  Download,
  Hash,
  Loader2,
  File,
} from "lucide-react";
import toast from "react-hot-toast";

/* Get current user ID from token */
const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.sub || payload?.id || null;
  } catch {
    return null;
  }
};

/* Format file size */
const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/* Format time */
const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* Render file preview */
const renderFilePreview = (msg, isMe) => {
  const fileMeta = msg.fileMeta || {};
  const fileName = fileMeta.name || "File";
  const fileSize = fileMeta.size ? formatFileSize(fileMeta.size) : "";

  return (
    <div className="flex items-center gap-3 bg-black/10 dark:bg-white/10 rounded-lg p-3">
      <File className="w-8 h-8 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        {fileSize && <p className="text-xs opacity-70">{fileSize}</p>}
      </div>
      <a
        href={msg.content}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition"
        onClick={(e) => e.stopPropagation()}
      >
        <Download className="w-4 h-4" />
      </a>
    </div>
  );
};

const ChannelChat = ({ channel }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const currentUserId = getCurrentUserId();

  /* Auto-scroll to bottom */
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  /* Fetch messages and join channel */
  useEffect(() => {
    if (!channel?._id) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/channels/messages/${channel._id}`);
        setMessages(res.data || []);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    // Ensure socket is connected
    if (!socket.connected) socket.connect();

    // Join socket room
    socket.emit("joinChannel", channel._id);
    fetchMessages();

    return () => {
      socket.emit("leaveChannel", channel._id);
    };
  }, [channel?._id, scrollToBottom]);

  /* Socket listeners */
  useEffect(() => {
    if (!channel?._id) return;

    const handleNewMessage = (msg) => {
      // Ignore messages from other channels
      if (msg.channel?.toString() !== channel._id.toString()) return;

      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      scrollToBottom();
    };

    const handleDeleteMessage = (id) => {
      setMessages((prev) => prev.filter((m) => m._id !== id));
    };

    socket.on("newChannelMessage", handleNewMessage);
    socket.on("deleteChannelMessage", handleDeleteMessage);

    return () => {
      socket.off("newChannelMessage", handleNewMessage);
      socket.off("deleteChannelMessage", handleDeleteMessage);
    };
  }, [channel?._id, scrollToBottom]);

  /* Auto-resize textarea */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  /* Send message */
  const sendMessage = async () => {
    if (!text.trim() || !channel?._id) return;

    const tempText = text.trim();
    setText("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await api.post(`/channels/messages/${channel._id}`, { content: tempText });
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
      setText(tempText); // Restore text on failure
    }
  };

  /* Send file */
  const sendFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !channel?._id) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/channels/${channel._id}/file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.error("Failed to upload file:", err);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  /* Delete message */
  const deleteMessage = async (msgId) => {
    if (!msgId || String(msgId).startsWith("temp-")) return;

    // Optimistic delete
    setMessages((prev) => prev.filter((m) => m._id !== msgId));

    try {
      await api.delete(`/channels/message/${msgId}`);
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error("Failed to delete message");
    }
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Hash className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">#{channel.name}</h2>
            {channel.description && (
              <p className="text-xs text-muted-foreground">{channel.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Hash className="w-12 h-12 mb-4 opacity-30" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = String(msg.sender?._id) === String(currentUserId);

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}
              >
                {!isMe && (
                  <span className="text-xs font-semibold text-primary mb-1">
                    {msg.sender?.name || "Unknown"}
                  </span>
                )}

                <div
                  className={`relative max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm border transition-shadow ${
                    isMe
                      ? "bg-primary text-primary-foreground border-primary rounded-br-md"
                      : "bg-secondary text-foreground border-border rounded-bl-md"
                  }`}
                >
                  {/* Text message */}
                  {msg.type === "text" && (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                      {msg.content}
                    </p>
                  )}

                  {/* Image message */}
                  {msg.type === "image" && (
                    <img
                      src={msg.content}
                      alt="Shared image"
                      className="rounded-lg max-w-full max-h-80 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(msg.content, "_blank")}
                      loading="lazy"
                    />
                  )}

                  {/* File message */}
                  {msg.type === "file" && (
                    <div className="min-w-[200px]">
                      {renderFilePreview(msg, isMe)}
                    </div>
                  )}

                  {/* Timestamp */}
                  <span
                    className={`text-[10px] mt-1 block ${
                      isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </span>

                  {/* Delete button (only for own messages) */}
                  {isMe && (
                    <button
                      onClick={() => deleteMessage(msg._id)}
                      className="absolute -left-10 top-1 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 rounded-lg text-destructive transition-all"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 p-4">
        <div className="flex items-end gap-3 max-w-5xl mx-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={sendFile}
            className="hidden"
            accept="*/*"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition disabled:opacity-50"
            title="Attach file"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={`Message #${channel.name}`}
            rows={1}
            className="flex-1 border border-border bg-background text-foreground rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition max-h-36"
            style={{ minHeight: "44px" }}
          />

          <button
            onClick={sendMessage}
            disabled={!text.trim() || isUploading}
            className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelChat;