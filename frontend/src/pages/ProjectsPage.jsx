import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import ProjectCard from "../components/ProjectCard";
import { Plus, Loader2, Grid, LayoutList, Search, X, SlidersHorizontal } from "lucide-react";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [tagFilter, setTagFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (tagFilter) params.append("tag", tagFilter);
      if (searchQuery) params.append("search", searchQuery);
      if (sortBy) params.append("sort", sortBy);

      const res = await api.get(`/projects?${params.toString()}`);
      setProjects(res.data || []);
    } catch (err) {
      console.error("Projects fetch failed:", err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [tagFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) fetchProjects();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="relative mb-10">
        {/* Background glow effects */}
        <div className="absolute -left-8 -top-8 w-72 h-40 bg-gradient-to-r from-violet-500/15 via-purple-500/15 to-pink-500/15 rounded-3xl blur-3xl -z-10" />
        <div className="absolute -right-8 -bottom-8 w-64 h-32 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-3xl blur-3xl -z-10" />

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Premium icon */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative p-3 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Explore
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600">Projects</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Discover amazing projects from the community</p>
            </div>
          </div>

          {/* Create button */}
          <a
            href="/projects/create"
            className="group relative flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Create Project</span>
          </a>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 p-4 glass-panel rounded-2xl border border-violet-200/30 dark:border-violet-800/30 bg-gradient-to-r from-white/60 via-violet-50/30 to-pink-50/30 dark:from-slate-900/60 dark:via-violet-950/20 dark:to-pink-950/20 backdrop-blur-xl">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-violet-200/50 dark:border-violet-700/50 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
              <input
                type="text"
                placeholder="Filter by tag..."
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-violet-200/50 dark:border-violet-700/50 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 w-40"
              />
            </div>
            {tagFilter && (
              <button
                onClick={() => setTagFilter("")}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-violet-200/50 dark:border-violet-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-violet-500/50 cursor-pointer transition-all duration-300 appearance-none"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="discussed">Most Discussed</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-violet-200/30 dark:border-violet-700/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === "grid" ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg" : "text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30"}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === "list" ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg" : "text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30"}`}
            >
              <LayoutList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <Loader2 className="relative w-12 h-12 animate-spin text-gradient-fire" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Loading projects</p>
            <p className="text-sm text-slate-400">Fetching amazing work from the community</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="relative text-center py-24 glass-panel border border-violet-200/30 dark:border-violet-800/30 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-slate-900/80 dark:via-violet-950/20 dark:to-pink-950/20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-violet-500/10 to-transparent rounded-full blur-3xl" />

          <div className="relative">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/50 dark:to-pink-900/50 rounded-2xl flex items-center justify-center border border-violet-200/50 dark:border-violet-800/50">
                <svg className="w-10 h-10 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {searchQuery || tagFilter
                ? "Try adjusting your filters or search terms"
                : "Be the first to create an amazing project!"}
            </p>

            <a
              href="/projects/create"
              className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </a>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && projects.length > 0 && (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="font-bold text-violet-600 dark:text-violet-400">{projects.length}</span> projects found
            </p>
          </div>

          <div className={viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 gap-6"
            : "space-y-6"
          }>
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectsPage;