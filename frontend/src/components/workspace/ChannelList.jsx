import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Hash, Plus, Loader2, MessageSquarePlus, Radio } from "lucide-react";
import toast from "react-hot-toast";

const ChannelList = ({
  workspaceId,
  activeChannel,
  onSelect,
  channels: propChannels,
  loading: propLoading,
  onChannelCreated,
}) => {
  const [internalChannels, setInternalChannels] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  // If parent didn't pass channels prop, fetch them locally
  useEffect(() => {
    if (propChannels !== undefined) return;
    if (!workspaceId) return;

    setInternalLoading(true);
    api.get(`/channels/${workspaceId}`)
      .then((res) => {
        setInternalChannels(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch channels", err);
      })
      .finally(() => {
        setInternalLoading(false);
      });
  }, [workspaceId, propChannels]);

  const channels = propChannels !== undefined ? propChannels : internalChannels;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  const createChannel = async () => {
    if (!name.trim() || !workspaceId) return;

    // Sanitize name for channel convention (lowercase, dashes)
    const formattedName = name.trim().toLowerCase().replace(/\s+/g, "-");

    try {
      setCreating(true);
      const res = await api.post(`/channels/${workspaceId}`, { name: formattedName });
      toast.success(`Channel #${formattedName} created!`);
      setName("");

      if (onChannelCreated) {
        onChannelCreated(res.data);
      } else {
        setInternalChannels((prev) => [...prev, res.data]);
        if (onSelect) onSelect(res.data);
      }
    } catch (err) {
      console.error("Failed to create channel", err);
      const msg = err.response?.data?.message || "Failed to create channel";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* HEADER */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Channels
          </h2>
        </div>

        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
          {channels.length}
        </span>
      </div>

      {/* CHANNEL LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {loading ? (
          <div className="flex items-center gap-2.5 px-4 py-3 text-xs text-slate-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Syncing channels...</span>
          </div>
        ) : channels.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <MessageSquarePlus className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-medium text-slate-500">
              No channels yet
            </p>
          </div>
        ) : (
          channels.map((ch) => {
            const active = activeChannel?._id === ch._id;

            return (
              <button
                key={ch._id}
                onClick={() => onSelect(ch)}
                className={`group w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm transition-all duration-200 border ${
                  active
                    ? "bg-indigo-500/10 border-indigo-500/30 text-white font-medium"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <Hash
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"
                  }`}
                />
                <span className="truncate">{ch.name}</span>
              </button>
            );
          })
        )}
      </div>

      {/* CHANNEL CREATION BAR */}
      <div className="p-3.5 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">
              #
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createChannel()}
              placeholder="new-channel"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-7 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
            />
          </div>

          <button
            onClick={createChannel}
            disabled={!name.trim() || creating}
            className="p-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-40 text-white rounded-xl transition duration-200 shrink-0 hover:shadow-md hover:shadow-indigo-500/25"
            title="Create Channel"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelList;