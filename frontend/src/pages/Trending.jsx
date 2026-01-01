import { useEffect, useState } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";

const Trending = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/projects/trending")
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h2 className="text-lg font-semibold my-4">🔥 Trending Projects</h2>

      {projects.length === 0 && (
        <p className="text-sm text-gray-500">No trending projects yet</p>
      )}

      {projects.map(p => (
        <ProjectCard key={p._id} project={p} />
      ))}
    </div>
  );
};

export default Trending; 