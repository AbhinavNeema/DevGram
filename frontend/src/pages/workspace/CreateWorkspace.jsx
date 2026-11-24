import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Rocket, Info, ArrowLeft, Loader2, Sparkles, Layout } from "lucide-react";
import toast from "react-hot-toast";

const CreateWorkspace = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/workspaces", {
        name: name.trim(),
        description: description.trim(),
      });

      toast.success("Workspace created!");
      navigate(`/workspaces/${res.data._id}`);
    } catch (err) {
      console.error("Create workspace failed", err);
      const msg = err.response?.data?.message || "Failed to create workspace";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-[#0A0F1E] px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <form
        onSubmit={submit}
        className="w-full max-w-lg bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10"
      >
        {/* HEADER */}
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/25">
            <Layout className="w-7 h-7" />
          </div>

          <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-medium mb-3">
            New Workspace
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Create Workspace
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Set up an isolated development and discussion environment for your engineering team.
          </p>
        </div>

        {/* INPUTS */}
        <div className="space-y-6">
          {/* NAME */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-2">
              <span>Workspace Name</span>
              <span className="text-rose-400">*</span>
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Core Engineering or Alpha Labs"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 text-sm"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-2">
              <span>Description</span>
              <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Brief summary of the workspace purpose, team goals, or tech stack..."
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 text-sm resize-none"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-40 text-white font-medium rounded-xl px-6 py-2.5 text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Create Workspace</span>
                <Rocket className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateWorkspace;