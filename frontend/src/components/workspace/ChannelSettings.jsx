import { useState } from "react";
import api from "../../api/axios";
import { X, Settings, UserPlus, UserMinus, Trash2, Info, Save, ShieldAlert, Loader2 } from "lucide-react";

const ChannelSettings = ({ channel, workspace, onClose }) => {
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description || "");
  const [channelMembers, setChannelMembers] = useState(channel.members || []);
  const [saving, setSaving] = useState(false);

  // Logic remains 100% identical
  const save = async () => {
    setSaving(true);
    await api.put(`/channels/${channel._id}`, { name, description });
    setSaving(false);
    onClose();
  };

  const addMember = async (userId) => {
    await api.post(`/channels/${channel._id}/members`, { userId });
    setChannelMembers(prev => [...prev, userId]);
  };

  const removeMember = async (userId) => {
    await api.delete(`/channels/${channel._id}/members/${userId}`);
    setChannelMembers(prev => prev.filter(id => String(id) !== String(userId)));
  };

  const deleteChannel = async () => {
    if (!confirm("Are you sure? This action is permanent.")) return;
    await api.delete(`/channels/${channel._id}`);
  };

  return (
  <>
    {/* BACKDROP */}
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
      onClick={onClose}
    />

    {/* PANEL */}
    <div className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white border-l border-gray-200 z-[70] shadow-2xl flex flex-col">

      {/* HEADER */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Settings className="w-5 h-5"/>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Channel Settings
            </h3>
            <p className="text-xs text-gray-500">
              Configuration & permissions
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
        >
          <X className="w-5 h-5"/>
        </button>

      </div>


      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* GENERAL INFO */}

        <div className="space-y-4">

          <div className="flex items-center gap-2 text-gray-600 text-xs font-medium uppercase">
            <Info className="w-4 h-4"/>
            General
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Channel Name
            </label>

            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Description
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={save}
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-medium transition"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin"/>
            ) : (
              <Save className="w-4 h-4"/>
            )}
            Save Changes
          </button>

        </div>


        {/* MEMBERS */}

        <div className="space-y-4 border-t pt-6">

          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-gray-500 font-medium">
              Channel Members
            </span>

            <span className="text-xs text-indigo-600 font-medium">
              {workspace.members.length} users
            </span>
          </div>

          <div className="space-y-2">

            {workspace.members.map(m => {

              const inChannel = channelMembers.some(
                id => String(id) === String(m.user._id)
              );

              return (
                <div
                  key={m.user._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                      {m.user.name[0]}
                    </div>

                    <span className="text-sm text-gray-800">
                      {m.user.name}
                    </span>

                  </div>

                  <button
                    onClick={() =>
                      inChannel
                        ? removeMember(m.user._id)
                        : addMember(m.user._id)
                    }
                    className={`p-2 rounded-md transition ${
                      inChannel
                        ? "text-red-600 hover:bg-red-50"
                        : "text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    {inChannel ? (
                      <UserMinus className="w-4 h-4"/>
                    ) : (
                      <UserPlus className="w-4 h-4"/>
                    )}
                  </button>

                </div>
              );
            })}

          </div>

        </div>


        {/* DELETE */}

        {channel.name !== "general" && (

          <div className="border-t pt-6">

            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">

              <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-3">
                <ShieldAlert className="w-4 h-4"/>
                Danger Zone
              </div>

              <button
                onClick={deleteChannel}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4"/>
                Delete Channel
              </button>

            </div>

          </div>

        )}

      </div>
    </div>
  </>
);
};

export default ChannelSettings;