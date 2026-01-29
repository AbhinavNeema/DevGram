import { useEffect, useRef, useState } from "react";
import socket from "../../socket";
import api from "../../api/axios";

const token = localStorage.getItem("token");
const currentUserId = token
  ? JSON.parse(atob(token.split(".")[1])).sub
  : null;

const ChannelChat = ({ channel }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);

  // load messages + join room
  useEffect(() => {
    if (!channel) return;

    socket.emit("joinChannel", channel._id);

    api
      .get(`/channels/messages/${channel._id}`)
      .then(res => setMessages(res.data))
      .catch(console.error);

    return () => {
      socket.emit("leaveChannel", channel._id);
    };
  }, [channel]);

  // realtime listeners
  useEffect(() => {
    if (!channel) return;

    const handleNewMessage = msg => {
      if (msg.channel?.toString() === channel._id.toString()) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleDelete = (id) => {
      setMessages(prev => prev.filter(m => m._id !== id));
    };

    socket.on("newChannelMessage", handleNewMessage);
    socket.on("deleteChannelMessage", handleDelete);

    return () => {
      socket.off("newChannelMessage", handleNewMessage);
      socket.off("deleteChannelMessage", handleDelete);
    };
  }, [channel]);

  // send text message
  const send = async () => {
    if (!text.trim()) return;

    await api.post(`/channels/messages/${channel._id}`, {
      content: text,
    });

    setText("");
  };

  // send file / image
  const sendFile = async file => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await api.post(`/channels/${channel._id}/file`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  // delete message
  const deleteMessage = async (id) => {
    try {
      await api.delete(`/channels/message/${id}`);

      // ✅ Optimistic update for sender
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => (
          <div
            key={m._id}
            className={`max-w-[70%] p-2 rounded text-sm ${
              m.sender?._id === currentUserId
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-100 text-black mr-auto"
            }`}
          >
            {m.sender?._id !== currentUserId && (
              <div className="font-medium">{m.sender?.name}</div>
            )}

            {m.type === "image" && (
              <img
                src={m.content}
                className="mt-1 rounded max-h-60 cursor-pointer"
                onClick={() => window.open(m.content, "_blank")}
              />
            )}

            {m.type === "file" && (
  <div className="mt-1 flex items-center gap-3 border rounded p-2 max-w-sm bg-white">
    <span className="text-xl">📎</span>
    <div className="flex-1">
      <p className="text-sm font-medium truncate">{m.fileName}</p>
      <p className="text-xs text-gray-500">
        {(m.fileSize / 1024).toFixed(1)} KB
      </p>
    </div>

    <a
      href={`https://docs.google.com/gview?url=${encodeURIComponent(m.content)}&embedded=true`}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 text-xs font-semibold"
    >
      Open
    </a>
  </div>
)}

            {m.type === "text" && (
              <p className="text-gray-700">{m.content}</p>
            )}

            {m.sender?._id === currentUserId && (
              <button
                onClick={() => deleteMessage(m._id)}
                className="text-xs text-red-200 mt-1"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* input */}
      <div className="border-t p-3 flex gap-2 items-center">
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={e => sendFile(e.target.files[0])}
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="text-xl"
        >
          📎
        </button>

        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder={`Message #${channel?.name}`}
        />

        <button
          onClick={send}
          className="bg-blue-600 text-white px-4 rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChannelChat;