import { useState } from "react";
import api from "../../api/axios";
import { Hash, Plus, Loader2, Layers } from "lucide-react";

const ChannelManager = ({ workspaceId, channels = [], onCreated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const createChannel = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      const res = await api.post(`/channels/${workspaceId}`, {
        name,
      });

      onCreated?.(res.data);
      setName("");
    } catch (err) {
      console.error("Create channel failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-xl">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Workspace Channels
          </h3>
          <p className="text-[10px] text-slate-500 font-medium">
            {channels.length} {channels.length === 1 ? 'Channel' : 'Channels'} Active
          </p>
        </div>
      </div>

      {/* CHANNELS GRID/LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
        {channels.map((ch) => (
          <div
            key={ch._id}
            className="group flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-slate-900/40 border border-white/5 
                       hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all duration-300"
          >
            <Hash className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            <span className="text-slate-300 group-hover:text-white truncate font-medium">
              {ch.name}
            </span>
          </div>
        ))}

        {channels.length === 0 && (
          <div className="col-span-full py-8 border-2 border-dashed border-white/5 rounded-2xl text-center">
            <p className="text-xs text-slate-500 italic">No channels created yet.</p>
          </div>
        )}
      </div>

      {/* CREATE ACTION AREA */}
      <div className="relative group">
        <div className="flex gap-2 p-1.5 bg-black/20 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 transition-all shadow-inner">
          <div className="flex items-center pl-3 text-slate-500">
            <Plus className="w-4 h-4" />
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createChannel()}
            placeholder="channel-name"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-slate-200 placeholder:text-slate-600"
          />
          <button
            onClick={createChannel}
            disabled={loading || !name.trim()}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 
                       disabled:text-slate-600 text-white px-5 rounded-xl text-xs font-bold transition-all 
                       active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create"
            )}
          </button>
        </div>
        
        {/* SUBTLE GLOW EFFECT UNDER INPUT */}
        <div className="absolute -inset-1 bg-indigo-500/5 blur-xl rounded-2xl -z-10 group-focus-within:bg-indigo-500/10 transition-colors" />
      </div>
    </div>
  );
};

export default ChannelManager;