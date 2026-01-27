import { useState } from "react";
import api from "../../api/axios";

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
    <div className="mt-6">
      <h3 className="font-semibold mb-3">Channels</h3>

      <div className="space-y-2 mb-4">
        {channels.map(ch => (
          <div
            key={ch._id}
            className="text-sm px-3 py-1 rounded bg-gray-50 border"
          >
            # {ch.name}
          </div>
        ))}
      </div>

      {/* CREATE */}
      <div className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="new-channel"
          className="flex-1 border rounded px-2 py-1 text-sm"
        />
        <button
          onClick={createChannel}
          disabled={loading}
          className="bg-blue-600 text-white px-3 rounded text-sm disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ChannelManager;