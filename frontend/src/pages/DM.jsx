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
<div className="h-[calc(100vh-100px)] flex bg-gray-50 overflow-hidden rounded-3xl border border-gray-200 shadow-sm">

{/* INBOX SIDEBAR */}
<div className={`${conversationId ? "hidden md:flex" : "flex"} w-full md:w-[380px] flex-col bg-white border-r border-gray-200`}>

<div className="p-6 border-b border-gray-200">
<h2 className="text-lg font-semibold text-slate-900 mb-4">Inbox</h2>

<div className="relative">
<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
<input
placeholder="Search..."
className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-300"
/>
</div>
</div>

<div className="flex-1 overflow-y-auto custom-scrollbar">

{inbox.length === 0 ? (
<div className="flex flex-col items-center justify-center h-40 text-gray-400">
<MessageSquare className="w-8 h-8 mb-2"/>
<p className="text-sm">No Messages</p>
</div>
) : (

inbox.map(conv => {

const other = conv.participants.find(
p => String(p._id) !== String(currentUserId)
);

const active = conversationId === conv._id;

return (

<div
key={conv._id}
onClick={() => navigate(`/dm/${conv._id}`)}
className={`flex items-center gap-4 p-4 cursor-pointer ${
active ? "bg-indigo-50" : "hover:bg-gray-50"
}`}
>

<div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
{other?.name?.[0]}
</div>

<div className="flex-1 min-w-0">

<div className="flex justify-between mb-1">

<span className="text-sm font-semibold text-slate-900 truncate">
{other?.name}
</span>

<span className="text-xs text-gray-400">
{conv.lastMessage?.createdAt
? timeShort(conv.lastMessage.createdAt)
: ""}
</span>

</div>

<p className="text-xs text-gray-500 truncate">
{conv.lastMessage?.content || "..."}
</p>

</div>

{(conv.unreadCount || 0) > 0 && (
<div className="bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
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

<div className={`flex-1 flex flex-col bg-white ${!conversationId && "hidden md:flex items-center justify-center"}`}>

{!conversationId ? (

<div className="text-center p-12">

<MessageSquare className="w-14 h-14 text-gray-300 mx-auto mb-4"/>

<h2 className="text-xl font-semibold text-slate-900">
Select a conversation
</h2>

</div>

) : (

<>

{/* HEADER */}

<div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">

<div className="flex items-center gap-3">

<button
onClick={() => navigate("/dm")}
className="md:hidden text-gray-500"
>
<ChevronLeft/>
</button>

<div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
{otherUser?.name?.[0]}
</div>

<div>

<h3 className="text-sm font-semibold text-slate-900">
{otherUser?.name}
</h3>

<span className="text-xs text-green-500">
Active
</span>

</div>

</div>

<MoreVertical className="text-gray-400"/>

</div>


{/* MESSAGES */}

<div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

{messages.map(msg => {

const mine = msg.sender?._id === currentUserId;

return (

<div
key={msg._id}
className={`flex ${mine ? "justify-end" : "justify-start"}`}
>

<div
className={`max-w-[70%] px-4 py-2 rounded-xl text-sm ${
mine
? "bg-indigo-600 text-white"
: "bg-gray-100 text-slate-800"
}`}
>

{msg.type === "image" ? (

<img
src={
msg.content.startsWith("http")
? msg.content
: `${import.meta.env.VITE_BACKEND_URL}${msg.content}`
}
alt="sent"
className="rounded-lg"
/>

) : editingMessageId === msg._id ? (

<div>

<input
ref={editInputRef}
value={editingText}
onChange={e => setEditingText(e.target.value)}
className="border border-gray-300 rounded px-2 py-1 text-sm"
/>

<div className="flex gap-2 mt-2">

<button
onClick={() => saveEdit(msg._id)}
className="text-green-600 text-xs"
>
<Check size={14}/>
</button>

<button
onClick={() => setEditingMessageId(null)}
className="text-red-500 text-xs"
>
<X size={14}/>
</button>

</div>

</div>

) : (

<p>{msg.content}</p>

)}

<div className="text-[10px] opacity-70 mt-1">
{timeShort(msg.createdAt)}
</div>

{mine && !editingMessageId && (

<div className="flex gap-3 mt-1 text-[10px]">

{msg.type !== "image" && (

<button
onClick={() => startEditMessage(msg)}
className="text-indigo-500"
>
Edit
</button>

)}

<button
onClick={() => deleteMessage(msg._id)}
className="text-red-500"
>
Delete
</button>

</div>

)}

</div>

</div>

);

})}

<div ref={messagesEndRef}/>

</div>


{/* INPUT */}

<div className="p-4 border-t border-gray-200">

<div className="flex items-center gap-3 border border-gray-200 rounded-xl p-2">

<input
type="file"
accept="image/*"
ref={fileInputRef}
hidden
onChange={sendImage}
/>

<button onClick={() => fileInputRef.current.click()}>
<ImageIcon className="w-5 h-5 text-gray-500"/>
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
className="flex-1 resize-none outline-none text-sm"
/>

<button
onClick={sendMessage}
disabled={!text.trim()}
className="bg-indigo-600 text-white p-2 rounded-lg disabled:opacity-30"
>
<Send className="w-4 h-4"/>
</button>

</div>

</div>

</>

)}

</div>

<style>{`
.custom-scrollbar::-webkit-scrollbar {
width:4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
background:#cbd5f5;
}
`}</style>

</div>
);
};

export default DM;