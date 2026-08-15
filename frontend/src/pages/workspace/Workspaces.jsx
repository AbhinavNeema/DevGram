import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, LayoutGrid, ChevronRight, Globe, Shield, Loader2, RefreshCw, Users, ArrowRight } from "lucide-react";

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchWorkspaces = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await api.get("/workspaces");
      setWorkspaces(res.data || []);
    } catch (err) {
      console.error("Failed to fetch workspaces:", err);
      toast.error("Failed to load workspaces");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleRefresh = () => {
    fetchWorkspaces(true);
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-8 md:p-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Workspaces
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
              <Shield className="w-4 h-4 text-primary" />
              {workspaces.length} {workspaces.length === 1 ? "workspace" : "workspaces"} available
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={() => navigate("/workspaces/create")}
              className="group flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-indigo-500/25 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all active:scale-95"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Create Workspace
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent animate-ping opacity-20" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
            <span className="text-sm text-slate-500 font-medium mt-4">Loading workspaces...</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && workspaces.length === 0 && (
          <div className="text-center py-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Globe className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No Workspaces Yet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Create your first workspace to start collaborating with your team.
            </p>
            <button
              onClick={() => navigate("/workspaces/create")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-indigo-500/25 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Create Workspace
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && workspaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
            {workspaces.map((ws, index) => (
              <div
                key={ws._id}
                onClick={() => navigate(`/workspaces/${ws._id}`)}
                className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 rounded-2xl cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 hover:border-primary/30 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient accent on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                  <LayoutGrid className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {ws.name}
                </h2>

                {/* Description */}
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                  {ws.description || "Collaborative development workspace."}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {ws.members?.length || 0} members
                  </span>
                  {ws.channels?.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                      {ws.channels.length} channels
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Open Workspace
                  </span>
                  <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspaces;