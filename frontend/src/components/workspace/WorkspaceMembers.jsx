import api from "../../api/axios";
import { ShieldCheck, UserMinus, ShieldAlert, User, Star } from "lucide-react";

const WorkspaceMembers = ({ workspace, currentUserId, myRole }) => {
  const isOwner = myRole === "owner";
  const isAdmin = myRole === "admin";

  const changeRole = async (userId, role) => {
    await api.put(`/workspaces/${workspace._id}/role/${userId}`, { role });
    window.location.reload();
  };

  const removeMember = async (userId) => {
    if (!confirm("Remove this member from workspace?")) return;
    await api.delete(`/workspaces/${workspace._id}/members/${userId}`);
    window.location.reload();
  };

  return (
    <div className="p-1">
      <div className="space-y-2">
        {workspace.members.map((m) => {
          const isMe = String(m.user?._id || m.user) === String(currentUserId);
          const isTargetOwner = m.role === "owner";
          const isTargetAdmin = m.role === "admin";

          return (
            <div
              key={m._id}
              className="group flex items-center justify-between bg-[#1A1D26] border border-white/5 p-4 rounded-2xl hover:border-indigo-500/50 transition-all duration-300 shadow-lg"
            >
              {/* USER INFO SECTION */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-black shadow-inner border border-white/10 ${
                    isTargetOwner ? "bg-gradient-to-br from-amber-400 to-orange-600" : 
                    isTargetAdmin ? "bg-gradient-to-br from-indigo-500 to-violet-600" : 
                    "bg-slate-700"
                  }`}>
                    {m.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  {isTargetOwner && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 p-1 rounded-full border-2 border-[#1A1D26] shadow-lg">
                      <Star className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[15px] font-black text-white flex items-center gap-2 tracking-tight">
                    {m.user?.name}
                    {isMe && (
                      <span className="text-[9px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-md border border-white/5 uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-[0.1em] mt-0.5 ${
                    isTargetOwner ? "text-amber-400" : isTargetAdmin ? "text-indigo-400" : "text-slate-500"
                  }`}>
                    {m.role}
                  </div>
                </div>
              </div>

              {/* ACTIONS SECTION */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* ROLE MANAGEMENT (OWNER ONLY) */}
                {isOwner && m.role === "member" && (
                  <button
                    onClick={() => changeRole(m.user._id, "admin")}
                    className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-all"
                    title="Promote to Admin"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                )}

                {isOwner && m.role === "admin" && (
                  <button
                    onClick={() => changeRole(m.user._id, "member")}
                    className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all"
                    title="Demote to Member"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                )}

                {/* REMOVE ACTION (OWNER + ADMIN) */}
                {(isOwner || isAdmin) && !isMe && !isTargetOwner && (
                  <button
                    onClick={() => removeMember(m.user._id)}
                    className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                    title="Remove Member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkspaceMembers;