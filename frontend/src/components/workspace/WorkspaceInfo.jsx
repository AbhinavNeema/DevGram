import WorkspaceMembers from "./WorkspaceMembers";
import InviteMember from "./InviteMember";
import ChannelManager from "./ChannelManager";
import {
  ChevronLeft,
  ShieldCheck,
  UserCircle,
  LayoutGrid,
  Info,
  Zap
} from "lucide-react";

const WorkspaceInfo = ({ workspace, onClose, onChannelCreated }) => {
  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const currentUserId = payload?.id || payload?._id || payload?.sub || null;

  const myMember = workspace.members.find(
    m => (m.user?._id || m.user) === currentUserId
  );

  const myRole = myMember?.role;
  const isOwner = myRole === "owner";
  const isAdmin = myRole === "admin";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-[80]">

      {/* PANEL */}
      <div className="w-full sm:w-[460px] bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-200 bg-white">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
              {myRole || "Member"}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-50">

          {/* HERO */}
          <div className="px-8 py-10 border-b border-slate-200">
            <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-md">
              {workspace.name.charAt(0).toUpperCase()}
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {workspace.name}
            </h3>

            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <Info className="w-5 h-5 text-indigo-500 mt-0.5" />
              <p className="text-sm text-slate-600">
                {workspace.description ||
                  "A collaborative workspace for your team and projects."}
              </p>
            </div>
          </div>

          <div className="p-8 space-y-10">

            {/* INVITE */}
            {(isOwner || isAdmin) && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Invite Members
                  </h4>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <InviteMember workspaceId={workspace._id} />
                </div>
              </section>
            )}

            {/* MEMBERS */}
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                    Members
                  </h4>
                </div>

                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {workspace.members.length}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <WorkspaceMembers
                  workspace={workspace}
                  currentUserId={currentUserId}
                  myRole={myRole}
                />
              </div>
            </section>
          </div>
        </div>

        {/* FOOTER */}
        {(isOwner || isAdmin) && (
          <div className="p-6 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                Channels
              </h4>
            </div>

            <ChannelManager
              workspaceId={workspace._id}
              channels={workspace.channels || []}
              onCreated={onChannelCreated}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceInfo;