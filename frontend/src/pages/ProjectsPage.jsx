import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";

const TAGS = [
  { label: "React", value: "react" },
  { label: "Nodejs", value: "nodejs" },
  { label: "MongoDB", value: "mongodb" },
  { label: "ML", value: "machine-learning" },
  { label: "AI", value: "ai" },
  { label: "NextJS", value: "nextjs" },
];


const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag")?.toLowerCase();


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const res = await api.get("/projects", {
          params: activeTag ? { tag: activeTag } : {},
        });

        setProjects(res.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [activeTag]);

  const handleTagClick = value => {
    setSearchParams({ tag: value });
  };


  const clearFilter = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-3xl mx-auto px-4">

      <div className="flex justify-between items-center py-4">
        <h2 className="text-lg font-semibold">Projects</h2>

        <button
          onClick={() => setShowFilters(prev => !prev)}
          className="px-3 py-1 text-sm border rounded-full text-[#0a66c2]"
        >
          Filter
        </button>
      </div>

      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-3">
          {TAGS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleTagClick(value)}
              className={`px-3 py-1 rounded-full text-sm border whitespace-nowrap
                ${
                  activeTag === value
                    ? "bg-[#0a66c2] text-white"
                    : "bg-white text-[#0a66c2]"
                }`}
            >
              #{label}
            </button>
          ))}

          {activeTag && (
            <button
              onClick={clearFilter}
              className="text-sm text-gray-500 ml-2"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-center mt-10">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="text-center mt-20 text-gray-600">
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm mt-2">Try another tag</p>
        </div>
      ) : (
        <div className="space-y-5 mt-4">
          {projects.map(p => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
