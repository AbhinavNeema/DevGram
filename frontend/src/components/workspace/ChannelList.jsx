import { useEffect, useState } from "react";
import api from "../../api/axios";

const ChannelList = ({ workspaceId, onSelect }) => {
  const [channels, setChannels] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    api.get(`/channels/${workspaceId}`).then(res => setChannels(res.data));
  }, [workspaceId]);

  const createChannel = async () => {
    const res = await api.post(`/channels/${workspaceId}`, { name });
    setChannels(prev => [...prev, res.data]);
    setName("");
  };

  return (
    <div className="bg-white border p-3 rounded">
      <h3 className="font-semibold mb-2">Channels</h3>

      {channels.map(c => (
        <div
          key={c._id}
          onClick={() => onSelect(c)}
          className="text-sm cursor-pointer hover:text-blue-600"
        >
          #{c.name}
        </div>
      ))}

      <div className="mt-3 flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="new-channel"
          className="border px-2 py-1 text-sm rounded w-full"
        />
        <button onClick={createChannel} className="text-sm bg-blue-600 text-white px-2 rounded">
          +
        </button>
      </div>
    </div>
  );
};

export default ChannelList;