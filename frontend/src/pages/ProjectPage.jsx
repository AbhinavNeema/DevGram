import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import { Loader2, ArrowLeft, FolderX } from 'lucide-react';

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error('Project fetch failed', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-3" />
        <span className="text-slate-400 text-sm font-medium">Loading project details...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-slate-400 mx-auto mb-4">
            <FolderX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Project Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            The project you are looking for may have been deleted, made private, or does not exist.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-3xl mx-auto px-4">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-xs font-semibold transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      {/* Project Card */}
      <ProjectCard
        project={project}
        showOwnerActions={true}
        onDelete={() => navigate('/')}
      />
    </div>
  );
};

export default ProjectPage;