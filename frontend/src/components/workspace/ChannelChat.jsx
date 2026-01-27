import { useEffect, useState } from "react";
import socket from "../../socket";
import api from "../../api/axios";

const ChannelChat = ({ channel }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // load messages + join room
  useEffect(() => {
    if (!channel) return;

    socket.emit("joinChannel", channel._id);

    api
      .get(`/channels/messages/${channel._id}`)
      .then(res => setMessages(res.data))
      .catch(console.error);
  }, [channel]);

  // socket listener (SEPARATE effect)
  useEffect(() => {
    if (!channel) return;

    const handleNewMessage = msg => {
      if (msg.channel?.toString() === channel._id) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [channel]);

  const send = () => {
    if (!text.trim()) return;

    const token = localStorage.getItem("token");
    const userId = JSON.parse(atob(token.split(".")[1])).sub;

    socket.emit("sendMessage", {
      channelId: channel._id,
      userId,
      content: text,
    });

    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m._id} className="text-sm">
            <span className="font-medium">{m.sender?.name}</span>
            <p className="text-gray-700">{m.content}</p>
          </div>
        ))}
      </div>

      {/* input */}
      <div className="border-t p-3 flex gap-2">
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