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
  <div className="mt-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">

    {/* HEADER */}

    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
        <Layers className="w-5 h-5" />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Workspace Channels
        </h3>
        <p className="text-xs text-gray-500">
          {channels.length} {channels.length === 1 ? "Channel" : "Channels"} Active
        </p>
      </div>
    </div>


    {/* CHANNEL LIST */}

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">

      {channels.map((ch) => (
        <div
          key={ch._id}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
        >
          <Hash className="w-3.5 h-3.5 text-gray-400" />

          <span className="text-gray-700 font-medium truncate">
            {ch.name}
          </span>
        </div>
      ))}

      {channels.length === 0 && (
        <div className="col-span-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
          <p className="text-sm text-gray-400">
            No channels created yet
          </p>
        </div>
      )}

    </div>


    {/* CREATE CHANNEL */}

    <div className="flex gap-2">

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && createChannel()}
        placeholder="channel-name"
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <button
        onClick={createChannel}
        disabled={loading || !name.trim()}
        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-5 rounded-lg text-sm font-medium transition"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Create"
        )}
      </button>

    </div>

  </div>
);
};

export default ChannelManager;