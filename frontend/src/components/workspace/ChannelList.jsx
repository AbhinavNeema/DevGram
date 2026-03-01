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
  <div className="h-full flex flex-col bg-white border-r border-gray-200">

    {/* HEADER */}

    <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200">

      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-2">
        <Radio className="w-3 h-3 text-indigo-500" />
        Channels
      </h2>

      <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-0.5 rounded-full">
        {channels.length}
      </span>

    </div>


    {/* CHANNEL LIST */}

    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

      {loading ? (
        <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          Syncing...
        </div>
      ) : channels.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <MessageSquarePlus className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            Empty workspace
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
                group w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition
                ${
                  active
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >

              <Hash
                className={`w-4 h-4 ${
                  active ? "text-indigo-600" : "text-gray-400"
                }`}
              />

              <span className="truncate">
                {ch.name}
              </span>

            </button>
          );
        })
      )}

    </div>


    {/* CREATE CHANNEL */}

    <div className="p-4 border-t border-gray-200 bg-white">

      <div className="flex items-center gap-2">

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createChannel()}
          placeholder="New channel..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={createChannel}
          disabled={!name.trim()}
          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-30"
        >
          <Plus className="w-4 h-4" />
        </button>

      </div>

    </div>

  </div>
);
};

export default ChannelList;