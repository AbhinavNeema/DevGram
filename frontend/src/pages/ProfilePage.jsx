import { useState, useEffect } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import { useSearchParams } from "react-router-dom";

const [searchParams] = useSearchParams();
const tag = searchParams.get("tag");
const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const url = tag
        ? `/projects/feed?tag=${encodeURIComponent(tag)}`
        : "/projects/feed";

      const res = await api.get(url);
      setProjects(res.data);
    } catch (err) {
      console.error("Feed fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  fetchFeed();
}, [tag]);
  return (
    <>
      <div className="bg-gray-50 min-h-screen py-6">
        <div className="max-w-3xl mx-auto px-4 space-y-5">
          {projects.map(p => (
            <ProjectCard
              key={p._id}
              project={p}
              
            />
          ))}
        </div>
      </div>

      {activeProject && (
        <ProjectModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
          
        />
      )}
    </>
  );
};

export default ProjectsPage;