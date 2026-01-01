import { useEffect, useState } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";

const Feed = () => {
  const [projects, setProjects] = useState([]);
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const url = activeTag
        ? `/projects?tag=${activeTag}`
        : "/projects";

      const res = await api.get(url);
      setProjects(res.data);
    };

    fetchProjects();
  }, [activeTag]);

  return (
    <div className="max-w-3xl mx-auto px-4">

      <div className="flex gap-2 overflow-x-auto py-3">
        {["React", "Node", "MongoDB", "ML", "AI", "NextJS"].map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3 py-1 rounded-full text-sm border
              ${activeTag === tag
                ? "bg-[#0a66c2] text-white"
                : "bg-white text-[#0a66c2]"}`}
          >
            #{tag}
          </button>
        ))}

        {activeTag && (
          <button
            onClick={() => setActiveTag(null)}
            className="text-sm text-gray-500"
          >
            Clear
          </button>
        )}
      </div>

      {projects.map(p => (
        <ProjectCard key={p._id} project={p} />
      ))}
    </div>
  );
};

export default Feed;