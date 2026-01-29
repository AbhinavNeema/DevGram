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
      {/* HIGH-CONTRAST BACKDROP */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* SETTINGS PANEL: Midnight Deep Navy */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-[#0A0B10] border-l border-white/10 z-[70] shadow-2xl flex flex-col animate-slide-in">
        
        {/* HEADER: Solid High-Visibility Header */}
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between bg-[#11141D]">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <Settings className="w-5 h-5 text-white stroke-[2.5px]" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg tracking-tight leading-none">Channel Control</h3>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1.5">Settings & Privacy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* GENERAL INFO SECTION */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">General Info</h4>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 ml-1">Channel Label</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#161922] border-2 border-white/5 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-indigo-500 focus:bg-[#1c212d] outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 ml-1">Description</label>
              <textarea
                value={description}
                rows={3}
                placeholder="What is this channel for?"
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-[#161922] border-2 border-white/5 rounded-xl px-4 py-3 text-sm text-white font-medium focus:border-indigo-500 focus:bg-[#1c212d] outline-none transition-all resize-none placeholder:text-slate-600"
              />
            </div>

            <button
              onClick={save}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Update Configuration
            </button>
          </div>

          {/* MEMBERS SECTION */}
          <div className="space-y-6 pt-10 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Manage Access</h4>
              <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
                {workspace.members.length} Total Members
              </span>
            </div>

            <div className="grid gap-3">
              {workspace.members.map(m => {
                const inChannel = channelMembers.some(id => String(id) === String(m.user._id));
                return (
                  <div
                    key={m.user._id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-[#11141D] border border-white/5 group hover:border-indigo-500/40 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-black text-white uppercase">
                        {m.user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-100">{m.user.name}</span>
                    </div>

                    <button
                      onClick={() => inChannel ? removeMember(m.user._id) : addMember(m.user._id)}
                      className={`p-2.5 rounded-xl transition-all border ${
                        inChannel 
                        ? "text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-600 hover:text-white" 
                        : "text-indigo-400 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-600 hover:text-white"
                      }`}
                    >
                      {inChannel ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DANGER ZONE */}
          {channel.name !== "general" && (
            <div className="pt-10 mt-10 border-t border-rose-500/20">
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span className="text-[11px] font-black text-rose-500 uppercase tracking-widest">Danger Zone</span>
                </div>
                <button
                  onClick={deleteChannel}
                  className="flex items-center gap-3 text-rose-500 hover:text-rose-400 font-bold text-sm transition-all group"
                >
                  <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Delete this channel permanently
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }
      `}</style>
    </>
  );
};

export default ChannelSettings;