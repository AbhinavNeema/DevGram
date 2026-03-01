import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import { Loader2, ArrowLeft } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center py-32">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Project not found
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            The project may have been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">

      <div className="max-w-3xl mx-auto px-4">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* PROJECT CARD */}
        <ProjectCard
          project={project}
          showOwnerActions={true}
        />

      </div>

    </div>
  );
};

export default ProjectPage;