import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Hash, Plus, Loader2, MessageSquarePlus, Radio } from "lucide-react";

const ChannelList = ({ workspaceId, activeChannel, onSelect }) => {
  const [channels, setChannels] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  /* Fetch channels when workspace changes */
  useEffect(() => {
    if (!workspaceId) return;

    const fetchChannels = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/channels/${workspaceId}`);
        setChannels(res.data || []);
      } catch (err) {
        console.error("Failed to fetch channels:", err);
        toast.error("Failed to load channels");
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [workspaceId]);

  /* Create new channel */
  const createChannel = async () => {
    if (!name.trim() || creating) return;

    try {
      setCreating(true);
      const res = await api.post(`/channels/${workspaceId}`, { name: name.trim() });
      setChannels((prev) => [...prev, res.data]);
      setName("");
      toast.success(`Channel #${res.data.name} created!`);
      onSelect(res.data);
    } catch (err) {
      console.error("Failed to create channel:", err);
      const message = err.response?.data?.message || "Failed to create channel";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  /* Handle keyboard shortcut */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      createChannel();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <Radio className="w-3 h-3 text-indigo-500 animate-pulse" />
          Channels
        </h2>

        <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-0.5 rounded-full">
          {channels.length}
        </span>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {loading ? (
          <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            Loading channels...
          </div>
        ) : channels.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <MessageSquarePlus className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              No channels yet
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Create one below
            </p>
          </div>
        ) : (
          channels.map((ch) => {
            const isActive = activeChannel?._id === ch._id;

            return (
              <button
                key={ch._id}
                onClick={() => onSelect(ch)}
                className={`
                  group w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition
                  ${isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"}
                `}
              >
                <Hash
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? "text-indigo-600" : "text-gray-400"
                  }`}
                />
                <span className="truncate">{ch.name}</span>
                {ch.description && (
                  <span className="text-[10px] text-gray-400 truncate ml-1">
                    — {ch.description}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Create Channel */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New channel name..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition bg-white"
            maxLength={50}
          />

          <button
            onClick={createChannel}
            disabled={!name.trim() || creating}
            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition"
            title="Create channel"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Press Enter to create
        </p>
      </div>
    </div>
  );
};

export default ChannelList;