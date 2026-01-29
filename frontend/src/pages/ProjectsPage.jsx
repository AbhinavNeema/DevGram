import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import { Filter, Layers, Zap, X, Terminal, Loader2, Sparkles } from "lucide-react";

const TAGS = [
  { label: "React", value: "react" },
  { label: "Nodejs", value: "nodejs" },
  { label: "MongoDB", value: "mongodb" },
  { label: "ML", value: "machine-learning" },
  { label: "AI", value: "ai" },
  { label: "NextJS", value: "nextjs" },
];

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get("/projects", {
          params: activeTag ? { tag: activeTag } : {},
        });
        setProjects(res.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [activeTag]);

  const handleTagClick = value => setSearchParams({ tag: value });
  const clearFilter = () => setSearchParams({});

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 py-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Deployments
            </h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            {activeTag ? `Filtering Sector: #${activeTag}` : "Global Community Stream"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(prev => !prev)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
              showFilters 
              ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
              : "bg-[#0F111A] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Close Interface" : "Filter Nodes"}
          </button>
        </div>
      </div>

      {/* FILTER DRAWER */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? "max-h-40 opacity-100 mb-8" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-[#0F111A] border border-white/10 p-5 rounded-[2rem] shadow-2xl">
          <div className="flex gap-3 items-center overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={clearFilter}
              className={`flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                ${!activeTag
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-black/40 text-slate-500 border-white/5 hover:border-white/20 hover:text-white"}`}
            >
              All Sectors
            </button>

            {TAGS.map(({ label, value }) => {
              const active = activeTag === value;
              return (
                <button
                  key={value}
                  onClick={() => handleTagClick(value)}
                  className={`flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all transform active:scale-95
                    ${active
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-black/40 text-slate-500 border-white/5 hover:border-white/20 hover:text-white"}`}
                >
                  #{label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="space-y-8 relative">
        
        {/* LOADING SKELETONS */}
        {loading && (
          <div className="space-y-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#0F111A] border border-white/5 rounded-[2.5rem] p-8">
                <div className="flex gap-4 items-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded-full w-40" />
                    <div className="h-2 bg-white/5 rounded-full w-24" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-white/5 rounded-full w-full" />
                  <div className="h-3 bg-white/5 rounded-full w-4/5" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="aspect-video bg-white/5 rounded-2xl" />
                  <div className="aspect-video bg-white/5 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-24 bg-[#0F111A] border border-white/5 rounded-[3rem] animate-in zoom-in duration-500">
            <div className="mx-auto w-24 h-24 rounded-[2rem] bg-indigo-600/10 flex items-center justify-center mb-8 border border-indigo-500/20">
              <Layers className="w-10 h-10 text-indigo-500 opacity-50" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">No Signal Detected</h3>
            <p className="mt-2 text-slate-500 font-bold text-sm uppercase tracking-tighter">Zero projects matched the current filter parameters.</p>
            <button
              onClick={clearFilter}
              className="mt-8 px-8 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              Reset All Filters
            </button>
          </div>
        )}

        {/* PROJECTS LIST */}
        {!loading && projects.length > 0 && (
          <div className="space-y-8">
            {projects.map((p, idx) => (
              <div
                key={p._id}
                className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER STATS INDICATOR */}
      {!loading && projects.length > 0 && (
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
            End of Transmission — {projects.length} Nodes Indexed
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;