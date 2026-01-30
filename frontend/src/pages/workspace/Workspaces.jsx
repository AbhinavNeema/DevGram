import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Plus, LayoutGrid, ChevronRight, Globe, Shield, Loader2 } from "lucide-react";

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    api.get("/workspaces")
      .then(res => {
        setWorkspaces(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    /* REMOVED overflow-hidden and added overflow-x-hidden to prevent horizontal jitter */
    <div className="min-h-screen w-full bg-[#050505] text-white p-4 sm:p-8 md:p-12 relative overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* AMBIENT BACKGROUND DECOR - Changed to 'fixed' so they stay in place while you scroll */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 animate-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl font-black tracking-tighter sm:text-6xl mb-2 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
              Workspaces
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              Secure Collaborations: {workspaces.length}
            </p>
          </div>

          <button
            onClick={() => navigate("/workspaces/create")}
            className="group relative flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-[0_15px_30px_-10px_rgba(79,70,229,0.4)] transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Initialize New Unit
          </button>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
            <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">
              Accessing Database...
            </span>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && workspaces.length === 0 && (
          <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01] backdrop-blur-sm">
            <Globe className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-slate-300 mb-2 tracking-tight">No active deployments found.</h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium leading-relaxed">
              Create your first workspace to begin orchestrating your team and projects.
            </p>
          </div>
        )}

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {workspaces.map((ws, index) => (
            <div
              key={ws._id}
              onClick={() => navigate(`/workspaces/${ws._id}`)}
              style={{ animationDelay: `${index * 50}ms` }}
              className="group relative flex flex-col justify-between bg-[#0F111A] border border-white/10 p-8 rounded-[32px] cursor-pointer 
                         hover:bg-[#131622] hover:border-indigo-500/50 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] 
                         transition-all duration-500 hover:-translate-y-3 animate-in fade-in slide-in-from-bottom-4"
            >
              {/* DECORATIVE CARD GLOW */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/15 transition-all duration-500" />

              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#1A1D26] border border-white/5 flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:border-indigo-400/50 transition-all duration-500 shadow-xl">
                  <LayoutGrid className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                
                <h2 className="text-2xl font-black text-white tracking-tight mb-4 group-hover:text-indigo-400 transition-colors">
                  {ws.name}
                </h2>
                
                <p className="text-slate-400 text-[15px] font-medium leading-relaxed line-clamp-3 group-hover:text-slate-300 transition-colors">
                  {ws.description || "Active high-performance workspace with no specific objective defined."}
                </p>
              </div>

              <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-6">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-indigo-400 transition-colors">
                  Establish Connection
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-300">
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Workspaces;