import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Hash, Plus, Loader2, MessageSquarePlus, Radio } from "lucide-react";

const ChannelList = ({ workspaceId, activeChannel, onSelect }) => {
  const [channels, setChannels] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    setLoading(true);
    api
      .get(`/channels/${workspaceId}`)
      .then((res) => setChannels(res.data))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const createChannel = async () => {
    if (!name.trim()) return;
    try {
      const res = await api.post(`/channels/${workspaceId}`, { name });
      setChannels((prev) => [...prev, res.data]);
      setName("");
    } catch (err) {
      console.error("Failed to create channel", err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#08090D] border-r border-white/10 shadow-2xl">
      {/* HEADER: High Contrast Slate-400 for metadata */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-white/5 bg-[#0F111A]">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <Radio className="w-3 h-3 text-indigo-500" />
          Channels
        </h2>
        <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
          {channels.length}
        </span>
      </div>

      {/* CHANNEL LIST: Focus on text legibility */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {loading ? (
          <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Syncing...</span>
          </div>
        ) : channels.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <MessageSquarePlus className="w-10 h-10 mx-auto mb-3 text-slate-800 opacity-40" />
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest leading-loose">
              Empty Workspace
            </p>
          </div>
        ) : (
          channels.map((ch) => {
            const active = activeChannel?._id === ch._id;
            return (
              <button
                key={ch._id}
                onClick={() => onSelect(ch)}
                className={`
                  group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300
                  ${
                    active
                      ? "bg-indigo-600 text-white shadow-[0_8px_16px_-4px_rgba(79,70,229,0.4)] border border-indigo-400/30 scale-[1.02]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                  }
                `}
              >
                <Hash
                  className={`w-4 h-4 transition-colors ${
                    active ? "text-indigo-200 stroke-[3px]" : "text-slate-600 group-hover:text-indigo-400"
                  }`}
                />
                <span className={`truncate font-bold tracking-tight ${active ? "text-white" : "text-slate-300 group-hover:text-slate-50"}`}>
                  {ch.name}
                </span>
                
                {active && (
                  <div className="ml-auto flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-white animate-bounce" />
                    <div className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:0.2s]" />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* CREATE CHANNEL: High Visibility Action Area */}
      <div className="p-5 bg-[#0F111A] border-t border-white/10">
        <div className="relative flex items-center group">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createChannel()}
            placeholder="New channel..."
            className="w-full bg-[#1A1D26] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm 
                     text-slate-100 placeholder:text-slate-600 font-semibold focus:outline-none 
                     focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          />
          <button
            onClick={createChannel}
            disabled={!name.trim()}
            className="absolute right-2 p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 
                       disabled:opacity-0 disabled:translate-x-4 transition-all duration-500 shadow-lg"
          >
            <Plus className="w-5 h-5 stroke-[2.5px]" />
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4F46E5;
        }
      `}</style>
    </div>
  );
};

export default ChannelList;