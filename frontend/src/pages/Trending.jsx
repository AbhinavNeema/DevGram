import { useEffect, useState } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import { Flame, Activity, Loader2, Zap, ArrowUpRight } from "lucide-react";

const Trending = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/projects/trending")
      .then(res => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      <div className="max-w-3xl mx-auto px-4 py-12">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                Hot Signals
              </h1>
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              High-velocity community deployments
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-[#0F111A] border border-white/5 rounded-2xl">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Live Analysis
            </span>
          </div>
        </div>

        {/* CONTENT STATE HANDLERS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Syncing Trends...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-[#0F111A] border border-white/5 rounded-[3rem] shadow-2xl">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Activity className="w-10 h-10 text-slate-700 opacity-50" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase">Thermal Low</h3>
            <p className="mt-2 text-slate-500 font-bold text-sm uppercase tracking-tighter">No trending projects detected in this cycle.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {projects.map((p, idx) => (
              <div key={p._id} className="relative group">
                {/* RANK INDICATOR */}
                <div className="absolute -left-4 top-10 hidden xl:flex flex-col items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                   <span className="text-4xl font-black text-indigo-500">0{idx + 1}</span>
                   <div className="w-px h-12 bg-gradient-to-b from-indigo-500 to-transparent" />
                </div>
                
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        )}

        {/* FOOTER FEEDBACK */}
        {!loading && projects.length > 0 && (
          <div className="mt-16 text-center border-t border-white/5 pt-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              End of Trending Stream
            </div>
          </div>
        )}
      </div>

      {/* AMBIENT BACKGROUND RADIANCE */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[140px] pointer-events-none -z-10" />
    </div>
  );
};

export default Trending;