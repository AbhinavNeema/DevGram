import { useState, useEffect } from "react";
import api from "../../api/axios";
import RoleBadge from "./RoleBadge";
import { ShieldCheck, UserMinus, ShieldAlert, Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const WorkspaceMembers = ({ workspace, currentUserId, myRole, onMemberChange }) => {
  const [members, setMembers] = useState(workspace?.members || []);
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    if (workspace?.members) {
      setMembers(workspace.members);
    }
  }, [workspace?.members]);

  const isOwner = myRole === "owner";
  const isAdmin = myRole === "admin";

  const changeRole = async (targetUserId, newRole) => {
    try {
      setLoadingAction(targetUserId);
      const res = await api.put(`/workspaces/${workspace._id}/role/${targetUserId}`, {
        role: newRole,
      });

      // Update locally without window.location.reload()
      const updatedMembers = members.map((m) => {
        const uId = typeof m.user === "string" ? m.user : m.user?._id;
        if (String(uId) === String(targetUserId)) {
          return { ...m, role: newRole };
        }
        return m;
      });

      setMembers(updatedMembers);
      if (onMemberChange && res.data) {
        onMemberChange(res.data);
      }
      toast.success(`Role changed to ${newRole}`);
    } catch (err) {
      console.error("Failed to change role", err);
      toast.error(err.response?.data?.message || "Failed to change role");
    } finally {
      setLoadingAction(null);
    }
  };

  const removeMember = async (targetUserId, memberName) => {
    if (!confirm(`Are you sure you want to remove ${memberName || "this member"} from the workspace?`)) {
      return;
    }

    try {
      setLoadingAction(targetUserId);
      await api.delete(`/workspaces/${workspace._id}/members/${targetUserId}`);

      // Update locally without window.location.reload()
      const updatedMembers = members.filter((m) => {
        const uId = typeof m.user === "string" ? m.user : m.user?._id;
        return String(uId) !== String(targetUserId);
      });

      setMembers(updatedMembers);
      if (onMemberChange) {
        onMemberChange({ ...workspace, members: updatedMembers });
      }
      toast.success("Member removed");
    } catch (err) {
      console.error("Failed to remove member", err);
      toast.error(err.response?.data?.message || "Failed to remove member");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-2">
      {members.map((m) => {
        const userId = typeof m.user === "string" ? m.user : m.user?._id;
        const userName = typeof m.user === "object" ? m.user?.name : "User";
        const isMe = String(userId) === String(currentUserId);
        const isTargetOwner = m.role === "owner";
        const isTargetAdmin = m.role === "admin";
        const isActionLoading = loadingAction === userId;

        return (
          <div
            key={m._id || String(userId)}
            className="group flex items-center justify-between bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-xl hover:bg-white/[0.04] transition-all duration-200"
          >
            {/* USER INFO */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                    isTargetOwner
                      ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm shadow-purple-500/20"
                      : isTargetAdmin
                      ? "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-sm shadow-indigo-500/20"
                      : "bg-slate-700"
                  }`}
                >
                  {userName?.charAt(0).toUpperCase() || "U"}
                </div>

                {isTargetOwner && (
                  <div className="absolute -top-1 -right-1 bg-amber-400 p-0.5 rounded-full ring-2 ring-[#0A0F1E]">
                    <Star className="w-2 h-2 text-slate-900 fill-slate-900" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-white flex items-center gap-2 truncate">
                  <span className="truncate">{userName}</span>
                  {isMe && (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded-md shrink-0">
                      You
                    </span>
                  )}
                </div>

                <div className="mt-0.5">
                  <RoleBadge role={m.role} />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {isActionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <>
                  {/* Promote member to admin */}
                  {isOwner && m.role === "member" && (
                    <button
                      onClick={() => changeRole(userId, "admin")}
                      className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 rounded-lg transition"
                      title="Promote to Admin"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  )}

                  {/* Demote admin to member */}
                  {isOwner && m.role === "admin" && (
                    <button
                      onClick={() => changeRole(userId, "member")}
                      className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 rounded-lg transition"
                      title="Demote to Member"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  )}

                  {/* Remove member from workspace */}
                  {(isOwner || isAdmin) && !isMe && !isTargetOwner && (
                    <button
                      onClick={() => removeMember(userId, userName)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition"
                      title="Remove Member"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkspaceMembers;