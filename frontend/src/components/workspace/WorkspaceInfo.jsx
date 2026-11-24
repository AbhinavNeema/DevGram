import { useAuth } from "../../context/AuthContext";
import WorkspaceMembers from "./WorkspaceMembers";
import InviteMember from "./InviteMember";
import {
  X,
  ShieldCheck,
  UserCircle,
  Layout,
  Info,
  Zap,
  Users
} from "lucide-react";

const WorkspaceInfo = ({ workspace, onClose, onWorkspaceUpdated }) => {
  const { user: authUser, token } = useAuth();

  const user = authUser || (() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { id: payload.sub || payload.id || payload._id, ...payload };
    } catch {
      return null;
    }
  })();

  const currentUserId = user?.id || user?._id;

  const myMember = workspace?.members?.find(
    (m) => String(m.user?._id || m.user) === String(currentUserId)
  );

  const myRole = myMember?.role || "member";
  const isOwner = myRole === "owner";
  const isAdmin = myRole === "admin";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-[80] transition-opacity animate-in fade-in duration-200">
      {/* SLIDE-OVER PANEL */}
      <div className="w-full sm:w-[460px] bg-[#0A0F1E] h-full shadow-2xl border-l border-white/[0.06] flex flex-col overflow-hidden text-white animate-in slide-in-from-right duration-300">
        {/* HEADER */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Workspace Overview
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                {myRole}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {/* HERO CARD */}
          <div className="p-6 border-b border-white/[0.06] bg-white/[0.01]">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white mb-4 shadow-lg shadow-indigo-500/20">
              {workspace?.name?.charAt(0).toUpperCase() || "W"}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {workspace?.name}
            </h3>

            <div className="flex items-start gap-3 p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-300 leading-relaxed">
                {workspace?.description ||
                  "A collaborative workspace for your team, channels, and projects."}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* INVITE MEMBERS SECTION (FOR OWNER/ADMIN) */}
            {(isOwner || isAdmin) && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Invite Teammates</span>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 shadow-sm">
                  <InviteMember workspaceId={workspace._id} />
                </div>
              </section>
            )}

            {/* MEMBERS ROSTER SECTION */}
            <section className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Users className="w-4 h-4" />
                  <span>Workspace Members</span>
                </div>

                <span className="text-xs text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
                  {workspace?.members?.length || 0}
                </span>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden p-2">
                <WorkspaceMembers
                  workspace={workspace}
                  currentUserId={currentUserId}
                  myRole={myRole}
                  onMemberChange={onWorkspaceUpdated}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceInfo;