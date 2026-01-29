import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Rocket, Info, ArrowLeft, Loader2, Sparkles } from "lucide-react";

const CreateWorkspace = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const res = await api.post("/workspaces", {
        name,
        description,
      });
      navigate(`/workspaces/${res.data._id}`);
    } catch (err) {
      console.error("Create workspace failed", err);
      // Using a modern alert would be better, but keeping logic same
      alert("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-4 sm:p-6 relative overflow-hidden">
      
      {/* BACKGROUND DECORATION: Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-lg bg-[#0F111A] border border-white/10 rounded-[32px] p-8 sm:p-12 shadow-2xl animate-in fade-in zoom-in duration-500"
      >
        {/* HEADER */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)] mb-6">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter sm:text-4xl">
            Launch Workspace
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Define your digital headquarters
          </p>
        </div>

        <div className="space-y-8">
          {/* WORKSPACE NAME */}
          <div className="space-y-2 group">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">
                Workspace Identity
              </label>
              <Sparkles className="w-3 h-3 text-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl px-5 py-4 text-white font-bold 
                       placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 
                       focus:ring-4 focus:ring-indigo-500/10 transition-all text-base sm:text-lg"
              placeholder="eg. Alpha Design Lab"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2 group">
            <div className="flex items-center gap-2 ml-1">
              <Info className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">
                Strategic Brief
              </label>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl px-5 py-4 text-white font-medium 
                       placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 
                       focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none text-base"
              rows={4}
              placeholder="What's the mission of this workspace?"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto order-2 sm:order-1 flex items-center justify-center gap-2 px-8 py-4 
                     rounded-2xl text-slate-400 font-bold hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            disabled={loading}
            className="w-full sm:flex-1 order-1 sm:order-2 relative group overflow-hidden bg-indigo-600 
                     hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale py-4 px-8 rounded-2xl 
                     text-white font-black text-lg shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] 
                     transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Initialize
                <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateWorkspace;