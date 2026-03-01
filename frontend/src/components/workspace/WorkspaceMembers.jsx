import api from "../../api/axios";
import { ShieldCheck, UserMinus, ShieldAlert, Star } from "lucide-react";

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
    <div className="p-2">
      <div className="space-y-2">

        {workspace.members.map((m) => {
          const isMe = String(m.user?._id || m.user) === String(currentUserId);
          const isTargetOwner = m.role === "owner";
          const isTargetAdmin = m.role === "admin";

          return (
            <div
              key={m._id}
              className="group flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl hover:shadow-md transition"
            >
              
              {/* USER INFO */}
              <div className="flex items-center gap-4">

                <div className="relative">

                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                      isTargetOwner
                        ? "bg-amber-500"
                        : isTargetAdmin
                        ? "bg-indigo-600"
                        : "bg-slate-400"
                    }`}
                  >
                    {m.user?.name?.charAt(0).toUpperCase()}
                  </div>

                  {isTargetOwner && (
                    <div className="absolute -top-1 -right-1 bg-amber-400 p-1 rounded-full border-2 border-white">
                      <Star className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  )}

                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    {m.user?.name}

                    {isMe && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border">
                        You
                      </span>
                    )}
                  </div>

                  <div
                    className={`text-[11px] font-medium capitalize ${
                      isTargetOwner
                        ? "text-amber-600"
                        : isTargetAdmin
                        ? "text-indigo-600"
                        : "text-slate-500"
                    }`}
                  >
                    {m.role}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">

                {isOwner && m.role === "member" && (
                  <button
                    onClick={() => changeRole(m.user._id, "admin")}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Promote to Admin"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                )}

                {isOwner && m.role === "admin" && (
                  <button
                    onClick={() => changeRole(m.user._id, "member")}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    title="Demote to Member"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                )}

                {(isOwner || isAdmin) && !isMe && !isTargetOwner && (
                  <button
                    onClick={() => removeMember(m.user._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
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