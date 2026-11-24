import { useState } from "react";
import api from "../../api/axios";
import { 
  X, 
  Settings, 
  UserPlus, 
  UserMinus, 
  Trash2, 
  Info, 
  Save, 
  ShieldAlert, 
  Loader2,
  Hash,
  Users
} from "lucide-react";
import toast from "react-hot-toast";

const ChannelSettings = ({
  channel,
  workspace,
  onClose,
  onChannelDeleted,
  onChannelUpdated,
}) => {
  const [name, setName] = useState(channel.name || "");
  const [description, setDescription] = useState(channel.description || "");
  const [channelMembers, setChannelMembers] = useState(channel.members || []);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      toast.error("Channel name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const res = await api.put(`/channels/${channel._id}`, {
        name: name.trim().toLowerCase().replace(/\s+/g, "-"),
        description: description.trim(),
      });

      toast.success("Channel settings saved");
      if (onChannelUpdated) {
        onChannelUpdated(res.data);
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Failed to update channel", err);
      toast.error("Failed to update channel");
    } finally {
      setSaving(false);
    }
  };

  const addMember = async (userId) => {
    try {
      await api.post(`/channels/${channel._id}/members`, { userId });
      setChannelMembers((prev) => [...prev, userId]);
      toast.success("Member added to channel");
    } catch (err) {
      console.error("Failed to add member", err);
      toast.error("Failed to add member");
    }
  };

  const removeMember = async (userId) => {
    try {
      await api.delete(`/channels/${channel._id}/members/${userId}`);
      setChannelMembers((prev) => prev.filter((id) => String(id) !== String(userId)));
      toast.success("Member removed from channel");
    } catch (err) {
      console.error("Failed to remove member", err);
      toast.error("Failed to remove member");
    }
  };

  const deleteChannel = async () => {
    if (!confirm(`Are you sure you want to delete #${channel.name}? All messages will be permanently lost.`)) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/channels/${channel._id}`);
      if (onChannelDeleted) {
        onChannelDeleted(channel._id);
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Failed to delete channel", err);
      const msg = err.response?.data?.message || "Failed to delete channel";
      toast.error(msg);
      setDeleting(false);
    }
  };

  const membersList = workspace?.members || [];

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* SLIDE-OVER PANEL */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-[#0A0F1E] border-l border-white/[0.06] z-[70] shadow-2xl flex flex-col text-white animate-in slide-in-from-right duration-300">
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-white text-base">Channel Settings</h3>
              <p className="text-xs text-slate-400">#{channel.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/[0.05] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* GENERAL INFO SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>General Settings</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Channel Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                  #
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this channel about?"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 resize-none"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>

          {/* CHANNEL MEMBERS SECTION */}
          <div className="space-y-4 border-t border-white/[0.06] pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>Channel Access</span>
              </div>

              <span className="text-xs text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
                {channelMembers.length} active
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {membersList.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No workspace members found.</p>
              ) : (
                membersList.map((m) => {
                  const userId = m.user?._id || m.user;
                  const userName = m.user?.name || "Member";
                  const initial = m.user?.name?.[0]?.toUpperCase() || "U";
                  const inChannel = channelMembers.some(
                    (id) => String(id) === String(userId)
                  );

                  return (
                    <div
                      key={String(userId)}
                      className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {initial}
                        </div>
                        <span className="text-sm text-slate-200 truncate">
                          {userName}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          inChannel ? removeMember(userId) : addMember(userId)
                        }
                        className={`p-1.5 rounded-lg border transition ${
                          inChannel
                            ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
                        }`}
                        title={inChannel ? "Remove from channel" : "Add to channel"}
                      >
                        {inChannel ? (
                          <UserMinus className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* DANGER ZONE: DELETE CHANNEL */}
          {channel.name !== "general" && (
            <div className="border-t border-white/[0.06] pt-6">
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-2xl">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Danger Zone</span>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Deleting this channel will remove all message history and media attachments. This action cannot be undone.
                </p>

                <button
                  onClick={deleteChannel}
                  disabled={deleting}
                  className="flex items-center justify-center gap-2 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-300 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Channel</span>
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