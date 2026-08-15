import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import ProjectCard from "../components/ProjectCard";
import { Flame, Loader2, TrendingUp, RefreshCw, Sparkles } from "lucide-react";

const Trending = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrending = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await api.get("/projects/trending");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Trending fetch failed:", err);
      toast.error("Failed to load trending projects");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  const handleRefresh = () => {
    fetchTrending(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Animated Header */}
      <div className="flex items-center justify-between mb-10 relative">
        {/* Background glow */}
        <div className="absolute -left-4 -top-4 w-64 h-32 bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-pink-500/10 rounded-3xl blur-2xl -z-10" />

        <div className="flex items-center gap-4">
          {/* Premium icon badge */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative p-3 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
              <Flame className="w-7 h-7 text-white" />
            </div>
            {/* Sparkle effect */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Trending
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500">Projects</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Most active projects in the community</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button with premium styling */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="group relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 overflow-hidden
              bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-orange-200/50 dark:border-orange-800/50
              hover:bg-orange-50 hover:border-orange-400/70 hover:shadow-lg hover:shadow-orange-500/20
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 text-orange-500 ${refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            <span className="text-slate-700 dark:text-slate-300 group-hover:text-orange-600 transition-colors">Refresh</span>
          </button>

          {/* Live indicator */}
          <div className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 dark:border-emerald-500/50">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span className="text-emerald-600 dark:text-emerald-400">Live</span>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <Loader2 className="relative w-12 h-12 animate-spin text-gradient-fire" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Loading trending projects</p>
            <p className="text-sm text-slate-400">Discover what's hot right now</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="relative text-center py-24 glass-panel border border-orange-200/30 dark:border-orange-800/30 rounded-3xl overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-rose-50/30 to-pink-50/50 dark:from-slate-900/80 dark:via-orange-950/20 dark:to-rose-950/20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-orange-500/10 to-transparent rounded-full blur-3xl" />

          <div className="relative">
            {/* Icon */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/50 dark:to-rose-900/50 rounded-2xl flex items-center justify-center border border-orange-200/50 dark:border-orange-800/50">
                <TrendingUp className="w-10 h-10 text-orange-500" />
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              No trending projects yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Check back later or be the first to post something amazing!
            </p>

            <button
              onClick={handleRefresh}
              className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Project List */}
      {!loading && projects.length > 0 && (
        <div className="space-y-8">
          {projects.map((project, index) => (
            <div key={project._id} className="relative group">
              {/* Rank Badge */}
              <div className={`absolute -left-14 top-8 hidden lg:flex items-center justify-center w-12 h-12 rounded-2xl font-black text-lg shadow-xl transform -rotate-6 ${
                index === 0 ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-rose-500 text-white shadow-orange-500/40' :
                index === 1 ? 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-slate-700 shadow-slate-500/30' :
                index === 2 ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white shadow-amber-600/30' :
                'bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/50 dark:to-pink-900/50 text-violet-600 dark:text-violet-400 shadow-lg shadow-violet-500/20'
              }`}>
                #{index + 1}
              </div>

              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {!loading && projects.length > 0 && (
        <div className="text-center mt-12 p-6 glass-panel rounded-2xl border border-orange-200/30 dark:border-orange-800/30 bg-gradient-to-r from-orange-50/30 to-rose-50/30 dark:from-slate-900/50 dark:to-pink-950/30">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Rankings based on engagement and recency · Updated in real-time
          </p>
        </div>
      )}
    </div>
  );
};

export default Trending;