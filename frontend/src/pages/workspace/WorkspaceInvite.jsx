import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { ShieldCheck, AlertCircle, Loader2, Users, ArrowRight, Layout } from "lucide-react";

const WorkspaceInvite = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/workspaces/${workspaceId}`)
      .then(res => {
        setWorkspace(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Invalid or expired invitation link");
        setLoading(false);
      });
  }, [workspaceId]);

  const acceptInvite = async () => {
    try {
      await api.post(`/workspaces/${workspaceId}/accept`);
      // Consistent with your dashboard naming convention
      navigate(`/workspaces/${workspaceId}`); 
    } catch (err) {
      setError("Authorization failed. Please try again.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Validating Link</p>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0F111A] border-2 border-rose-500/20 p-8 rounded-[32px] text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">Access Denied</h2>
          <p className="text-slate-400 font-medium mb-8">{error}</p>
          <button 
            onClick={() => navigate("/")}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/10 transition-all"
          >
            Return to Base
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-4 sm:p-6 relative overflow-hidden">
      
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-lg bg-[#0F111A] border border-white/10 rounded-[40px] p-8 sm:p-12 shadow-2xl animate-in zoom-in duration-500">
        
        {/* TOP BADGE */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">External Invitation</span>
          </div>
        </div>

        {/* WORKSPACE INFO */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/40 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <Layout className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-4">
            Join {workspace.name}
          </h1>
          
          <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
            <p className="text-slate-300 font-medium leading-relaxed italic">
              "{workspace.description || "You've been invited to collaborate with this team on DevGram."}"
            </p>
          </div>
        </div>

        {/* STATS PREVIEW (Visual Polish) */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="flex -space-x-3">
             {[1,2,3].map(i => (
               <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0F111A] flex items-center justify-center">
                 <Users className="w-3 h-3 text-slate-500" />
               </div>
             ))}
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Community</span>
        </div>

        {/* ACTIONS */}
        <div className="space-y-4">
          <button
            onClick={acceptInvite}
            className="w-full relative group bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden text-lg"
          >
            Accept Invitation
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full text-slate-500 hover:text-white font-bold py-3 text-sm transition-colors"
          >
            Decline Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceInvite;