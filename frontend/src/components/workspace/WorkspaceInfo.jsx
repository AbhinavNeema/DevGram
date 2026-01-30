import WorkspaceMembers from "./WorkspaceMembers";
import InviteMember from "./InviteMember";
import ChannelManager from "./ChannelManager";
import { ChevronLeft, ShieldCheck, UserCircle, LayoutGrid, Info, Zap } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-end z-[80] animate-in fade-in duration-300">
      
      {/* PANEL CONTAINER: Deep Onyx for Maximum Contrast */}
      <div className="w-full sm:w-[460px] bg-[#07080B] h-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border-l border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
        
        {/* TOP NAVIGATION BAR: Solid & Sharp */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/10 bg-[#11141D] z-10">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-300 hover:text-white transition-all group"
          >
            <ChevronLeft className="w-5 h-5 text-indigo-500 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <div className="flex items-center gap-2 bg-indigo-600 px-3 py-1.5 rounded-lg shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {myRole || "Member"} Access
            </span>
          </div>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#111420] to-[#07080B]">
          
          {/* HERO SECTION: Vivid White text on Dark Gradient */}
          <div className="px-8 py-12 border-b border-white/10">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-3xl font-black text-white tracking-tighter mb-4">{workspace.name}</h3>
            
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <Info className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                {workspace.description || "A high-performance workspace designed for elite collaboration and real-time communication."}
              </p>
            </div>
          </div>

          <div className="p-8 space-y-12">
            
            {/* INVITE SECTION (ADMIN ONLY): High Visibility Card */}
            {(isOwner || isAdmin) && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Growth & Recruitment</h4>
                </div>
                <div className="bg-[#11141D] border-2 border-white/5 rounded-[24px] p-6 shadow-2xl">
                  <InviteMember workspaceId={workspace._id} />
                  <p className="text-[10px] text-slate-500 mt-5 font-bold text-center uppercase tracking-tighter opacity-60">
                    Security protocol: Admins only
                  </p>
                </div>
              </section>
            )}

            {/* MEMBERS LIST SECTION */}
            <section className="space-y-4 pb-10">
               <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-widest">
                      Operator Directory
                    </h4>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 bg-white/5 px-3 py-1 rounded-full uppercase">
                    {workspace.members.length} Online
                  </span>
               </div>
              <div className="bg-[#0B0D13] rounded-[24px] overflow-hidden border border-white/10 shadow-inner">
                <WorkspaceMembers
                  workspace={workspace}
                  currentUserId={currentUserId}
                  myRole={myRole}
                />
              </div>
            </section>
          </div>
        </div>

        {/* FOOTER: Anchored Administrative Tools */}
        {(isOwner || isAdmin) && (
          <div className="mt-auto p-8 bg-[#0F111A] border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 mb-6">
              <LayoutGrid className="w-5 h-5 text-indigo-500" />
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Architecture Control</h4>
            </div>
            <div className="bg-[#1A1D26] p-1 rounded-2xl border border-white/5">
              <ChannelManager
                workspaceId={workspace._id}
                channels={workspace.channels || []}
                onCreated={onChannelCreated}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4F46E5; }
      `}</style>
    </div>
  );
};

export default WorkspaceInfo;