import { useEffect, useState } from "react";
import api from "../../api/axios";

const ChannelList = ({ workspaceId, activeChannel, onSelect }) => {
  const [channels, setChannels] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    setLoading(true);
    api
      .get(`/channels/${workspaceId}`)
      .then(res => setChannels(res.data))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const createChannel = async () => {
    if (!name.trim()) return;

    const res = await api.post(`/channels/${workspaceId}`, {
      name,
    });

    setChannels(prev => [...prev, res.data]);
    setName("");
  };

  return (
    <div className="h-full flex flex-col bg-white border-r">
      {/* HEADER */}
      <div className="px-4 py-3 text-sm font-semibold text-gray-600">
        Channels
      </div>

      {/* CHANNEL LIST */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {loading && (
          <p className="text-xs text-gray-400 px-2">Loading…</p>
        )}

        {!loading && channels.length === 0 && (
          <p className="text-xs text-gray-400 px-2">
            No channels yet
          </p>
        )}

        {channels.map(ch => {
          const active = activeChannel?._id === ch._id;

          return (
            <button
              key={ch._id}
              onClick={() => onSelect(ch)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition ${
                active
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              # {ch.name}
            </button>
          );
        })}
      </div>

      {/* CREATE CHANNEL */}
      <div className="p-3 border-t flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="new-channel"
          className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={createChannel}
          className="bg-blue-600 text-white px-3 rounded text-sm hover:bg-blue-700"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ChannelList;