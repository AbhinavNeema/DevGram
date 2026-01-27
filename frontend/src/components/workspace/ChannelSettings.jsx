import { useState, useEffect } from "react";
import api from "../../api/axios";

const ChannelSettings = ({ channel, workspace, onClose }) => {
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description || "");
  const [channelMembers, setChannelMembers] = useState(channel.members || []);

  const save = async () => {
    await api.put(`/channels/${channel._id}`, { name, description });
    onClose();
  };

  const addMember = async (userId) => {
    await api.post(`/channels/${channel._id}/members`, { userId });
    setChannelMembers(prev => [...prev, userId]);
  };

  const removeMember = async (userId) => {
    await api.delete(`/channels/${channel._id}/members/${userId}`);
    setChannelMembers(prev =>
      prev.filter(id => String(id) !== String(userId))
    );
  };

  const deleteChannel = async () => {
    if (!confirm("Delete this channel?")) return;
    await api.delete(`/channels/${channel._id}`);
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* SIDEBAR */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-xl flex flex-col">
        
        {/* HEADER */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">Channel Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* NAME */}
          <div>
            <label className="text-xs text-gray-500">Channel name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border rounded px-2 py-1 mt-1"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs text-gray-500">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border rounded px-2 py-1 mt-1"
            />
          </div>

          <button
            onClick={save}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Save Changes
          </button>

          {/* MEMBERS */}
          <div>
            <h4 className="font-medium mb-2">Members</h4>

            <div className="space-y-2">
              {workspace.members.map(m => {
                const inChannel = channelMembers.some(
                  id => String(id) === String(m.user._id)
                );
                return (
                  <div
                    key={m.user._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{m.user.name}</span>

                    {inChannel ? (
                      <button
                        onClick={() => removeMember(m.user._id)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => addMember(m.user._id)}
                        className="text-blue-600 hover:underline"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DELETE */}
          {channel.name !== "general" && (
            <button
              onClick={deleteChannel}
              className="text-red-600 hover:underline mt-6"
            >
              Delete Channel
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ChannelSettings;