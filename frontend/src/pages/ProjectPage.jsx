import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import { ChevronLeft, Loader2, Cpu, ShieldCheck } from "lucide-react";

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Project fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Decrypting Data...</span>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center p-10 bg-[#0F111A] border border-white/5 rounded-[40px] shadow-2xl">
         <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-4 opacity-50" />
         <h2 className="text-xl font-black text-white uppercase">Access Restricted</h2>
         <p className="text-slate-500 text-xs font-bold mt-2">PROJECT NOT FOUND OR UNAUTHORIZED</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] py-12 sm:py-20 relative overflow-x-hidden">
      
      {/* AMBIENT BACKGROUND ATMOSPHERE */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/5 blur-[140px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* BREADCRUMB NAVIGATION */}
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-all"
          >
            <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-indigo-600/20 transition-all border border-white/5">
              <ChevronLeft className="w-4 h-4 text-indigo-400" />
            </div>
            Back to Feed
          </button>

          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Single Entry View</span>
          </div>
        </div>

        {/* PROJECT CARD WRAPPER */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <ProjectCard project={project} showOwnerActions={true} />
        </div>

        {/* FOOTER METADATA */}
        <div className="mt-12 text-center opacity-30 hover:opacity-100 transition-opacity">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
             End of Documentation — DevGram Central Node
           </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;