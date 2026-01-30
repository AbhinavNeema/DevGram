import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import BlogCard from "../components/BlogCard";
import TAGS from "../constants/tags";
import { Filter, Layers, Zap, Terminal, Loader2, Activity } from "lucide-react";

const ProjectsPage = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Animation States
  const [isFirstHit, setIsFirstHit] = useState(false);
  const [introFinished, setIntroFinished] = useState(true);
  const [statusText, setStatusText] = useState("Initializing...");

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("devgram_intro_seen");
    if (!hasSeenIntro) {
      setIsFirstHit(true);
      setIntroFinished(false);
      sessionStorage.setItem("devgram_intro_seen", "true");
      
      // Cycle through status messages for extra "vibes"
      const messages = ["Connecting to Grid...", "Bypassing Firewalls...", "Fetching Nodes...", "Ready."];
      messages.forEach((msg, i) => {
        setTimeout(() => setStatusText(msg), i * 600);
      });

      setTimeout(() => setIntroFinished(true), 2800);
    }
  }, []);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const res = await api.get("/feed", {
          params: {
            type: typeFilter,
            tag: activeTag || undefined,
            q: search || undefined,
          },
        });
        setFeed(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fetch failed", err);
        setFeed([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [activeTag, typeFilter, search]);

  const handleTagClick = value => {
    setSearchParams(prev => {
      prev.set("tag", value);
      return prev;
    });
  };

  const clearFilter = () => {
    setSearchParams(prev => {
      prev.delete("tag");
      return prev;
    });
  };

  // 1. UPDATED INTRO UI
  if (isFirstHit && !introFinished) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center overflow-hidden font-mono">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black" />
        
        <div className="flex flex-col items-center gap-8 relative z-10">
          {/* Logo with pulse */}
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(79,70,229,0.4)] animate-in zoom-in duration-700">
            <Terminal className="text-white w-10 h-10 stroke-[2.5px]" />
          </div>
          
          {/* Typing Container */}
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-[0.1em] uppercase italic border-r-4 border-indigo-500 pr-2 animate-typing overflow-hidden whitespace-nowrap mx-auto">
              DevGram
            </h1>
          </div>

          {/* System Log */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
               <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
               <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em]">
                 {statusText}
               </span>
            </div>
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-600 animate-progress" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 pb-20 ${isFirstHit ? 'animate-in fade-in duration-1000' : ''}`}>
      
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
              ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" 
              : "bg-[#0F111A] border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Close Interface" : "Filter Nodes"}
          </button>
        </div>
      </div>

      {/* FILTER DRAWER */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? "max-h-72 opacity-100 mb-8" : "max-h-0 opacity-0"}`}>
        <div className="bg-[#0F111A] border border-white/10 p-5 rounded-[2rem] shadow-2xl space-y-6">
          {/* Type Filter Buttons */}
          <div className="flex gap-3 justify-center">
            {["all", "project", "blog"].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                  typeFilter === type
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-black/40 text-slate-500 border-white/5 hover:text-white"
                }`}
              >
                {type === "all" ? "All" : type === "project" ? "Projects" : "Blogs"}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Search the Grid..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Tag Buttons */}
          <div className="flex gap-3 items-center overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={clearFilter}
              className={`flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                ${!activeTag
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-black/40 text-slate-500 border-white/5 hover:border-white/20 hover:text-white"}`}
            >
              All Sectors
            </button>
            {TAGS.map(value => {
              const active = activeTag === value;
              return (
                <button
                  key={value}
                  onClick={() => handleTagClick(value)}
                  className={`flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                    ${active ? "bg-indigo-600 border-indigo-500 text-white" : "bg-black/40 text-slate-500 border-white/5 hover:text-white"}`}
                >
                  #{value}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="space-y-8 relative">
        {loading ? (
          <div className="flex flex-col items-center py-40 gap-4">
             <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Scanning Grid...</span>
          </div>
        ) : feed.length === 0 ? (
          <div className="text-center py-24 bg-[#0F111A] border border-white/5 rounded-[3rem]">
            <Layers className="mx-auto w-12 h-12 text-slate-700 mb-4" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">No Signal Detected</h3>
            <button onClick={clearFilter} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Clear Frequencies</button>
          </div>
        ) : (
          <div className="space-y-8">
            {feed.map((item, idx) => (
              <div key={item._id} className="animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                {item.feedType === "project" && <ProjectCard project={item} />}
                {item.feedType === "blog" && <BlogCard blog={item} />}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>   {`
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink {
          50% { border-color: transparent; }
        }
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-typing {
          /* 7 characters in DevGram, steps(7) makes it type letter-by-letter */
          animation: typing 1.5s steps(7, end) forwards, blink .6s step-end infinite;
        }
        .animate-progress {
          animation: progress 2.5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default ProjectsPage;