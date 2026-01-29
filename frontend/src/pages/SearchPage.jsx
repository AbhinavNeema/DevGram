import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import { Search, User, Database, ChevronRight, Loader2, Home, Sparkles } from "lucide-react";

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get("q");

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runSearch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${q}`);
        setUsers(res.data.users);
        setProjects(res.data.projects);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (q) runSearch();
  }, [q]);

  const highlight = (text = "", query = "") => {
    if (!query) return text;
    const re = new RegExp(`(${escapeRegExp(query)})`, "ig");
    return text.split(re).map((part, i) =>
      re.test(part) ? (
        <span key={i} className="text-indigo-400 bg-indigo-500/10 px-0.5 rounded shadow-[0_0_10px_rgba(99,102,241,0.2)]">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* HEADER AREA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                <Search className="w-5 h-5 text-white stroke-[3px]" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                Query Results
              </h2>
            </div>
            
            <div className="flex items-center gap-3 mt-4">
              <div className="bg-[#0F111A] border border-indigo-500/30 px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Keyword:</span>
                <span className="text-sm font-bold text-indigo-400 break-all">{q || "Null"}</span>
              </div>
              {!loading && (
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full">
                  {users.length + projects.length} Matches Found
                </div>
              )}
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Home className="w-4 h-4" />
            Base
          </Link>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="space-y-8">
            <div className="bg-[#0F111A] border border-white/5 rounded-[2rem] p-8 animate-pulse">
               <div className="w-24 h-4 bg-white/5 rounded mb-6" />
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-1/3" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
               </div>
            </div>
            <div className="flex flex-col items-center justify-center py-20">
               <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
          </div>
        )}

        {/* RESULTS CONTENT */}
        {!loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* USERS SECTION */}
            {users.length > 0 && (
              <section className="bg-[#0F111A] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl" />
                
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                  <User className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Personnel Directory</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {users.map(u => (
                    <Link
                      key={u._id}
                      to={`/user/username/${u.username}`}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-lg font-black text-white group-hover:bg-indigo-600 transition-colors">
                        {u.name?.[0] || u.username?.[0]}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors truncate">
                          {highlight(u.name || u.username, q)}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter"> 
                          @{highlight(u.username, q)}
                        </div>
                      </div>
                      <ChevronRight className="ml-auto w-4 h-4 text-slate-700 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* PROJECTS SECTION */}
            {projects.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6 px-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Repository Matches</h3>
                </div>

                <div className="space-y-8">
                  {projects.map((p, idx) => (
                    <div
                      key={p._id}
                      className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <ProjectCard project={p} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* EMPTY STATE */}
            {users.length === 0 && projects.length === 0 && (
              <div className="text-center py-24 bg-[#0F111A] border border-white/5 rounded-[3rem] animate-in zoom-in duration-500">
                <div className="mx-auto w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                  <Search className="w-10 h-10 text-slate-700 opacity-50" />
                </div>
                <h4 className="text-2xl font-black text-white tracking-tighter uppercase">No Signal Matches</h4>
                <p className="mt-2 text-slate-500 font-bold text-sm uppercase tracking-tighter max-w-xs mx-auto">
                  Zero records found for <span className="text-indigo-400">“{q}”</span> in the local database.
                </p>
                <div className="mt-10">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    Reset Frequency
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* BACKGROUND RADIANCE */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
};

export default SearchPage;