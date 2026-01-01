import { useEffect, useState } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get("/projects/feed");
        setProjects(res.data);
      } catch (err) {
        console.error("Feed fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading feed…</p>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center mt-20 text-gray-600">
        <p className="text-lg font-medium">🎉 You’re all caught up</p>
        <p className="text-sm mt-2">
          Explore trending projects or follow more developers
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-5">
      {projects.map(p => (
        <ProjectCard key={p._id} project={p} />
      ))}
    </div>
  );
};

export default ProjectsPage;