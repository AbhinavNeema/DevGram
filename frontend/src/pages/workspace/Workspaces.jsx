import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Plus, LayoutGrid, ChevronRight, Globe, Shield, Loader2, Sparkles, FolderCode } from "lucide-react";

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/workspaces")
      .then((res) => {
        setWorkspaces(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load workspaces", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-[calc(100vh-73px)] w-full bg-[#0A0F1E] text-white p-6 sm:p-10 md:p-12 relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-violet-500/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-medium text-indigo-400 mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Team Workspaces</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Collaborative Workspaces
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Organize projects, discuss ideas in channels, and collaborate with your teammates in real-time.
            </p>
          </div>

          <button
            onClick={() => navigate("/workspaces/create")}
            className="group flex items-center gap-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Create Workspace</span>
          </button>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
            <span className="text-slate-500 font-medium tracking-wider uppercase text-xs">
              Loading workspaces...
            </span>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && workspaces.length === 0 && (
          <div className="text-center py-24 px-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl max-w-lg mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 text-indigo-400">
              <FolderCode className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">No Workspaces Yet</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Create your very first workspace to begin collaborating with your engineering peers.
            </p>

            <button
              onClick={() => navigate("/workspaces/create")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-5 py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          </div>
        )}

        {/* WORKSPACE CARDS GRID */}
        {!loading && workspaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {workspaces.map((ws) => (
              <div
                key={ws._id}
                onClick={() => navigate(`/workspaces/${ws._id}`)}
                className="group relative flex flex-col justify-between bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-7 rounded-2xl cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10"
              >
                <div>
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-full">
                      {ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : "Active"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-indigo-400 transition-colors">
                    {ws.name}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6">
                    {ws.description || "A dedicated collaboration space for product development and code discussion."}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-5 border-t border-white/[0.06] text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                  <span className="tracking-wide">Launch Workspace</span>
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
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