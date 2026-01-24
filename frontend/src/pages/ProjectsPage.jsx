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
  const activeTag = searchParams.get("tag");

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
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 py-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse community projects{activeTag ? ` — filtered by #${activeTag}` : ""}
          </p>
          <div className="mt-2 text-xs text-slate-400">
            {loading ? "Loading projects…" : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(prev => !prev)}
            aria-expanded={showFilters}
            className="px-3 py-1.5 rounded-full text-sm border border-slate-200 text-slate-700 bg-white hover:shadow-sm transition"
            title="Toggle filters"
          >
            {showFilters ? "Hide filters" : "Filters"}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${showFilters ? "max-h-[360px] pb-4" : "max-h-0"}`}
        aria-hidden={!showFilters}
      >
        <div className="flex gap-3 items-center overflow-x-auto py-3 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-300">
          <button
            onClick={() => setSearchParams({})}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition
              ${!activeTag
                ? "bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-lg border-transparent"
                : "bg-white text-[#0a66c2] border-slate-200 hover:bg-slate-50"}`}
            aria-pressed={!activeTag}
          >
            All
          </button>

          {TAGS.map(({ label, value }) => {
            const active = activeTag === value;
            return (
              <button
                key={value}
                onClick={() => handleTagClick(value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition transform hover:-translate-y-0.5
                  ${active
                    ? "bg-gradient-to-tr from-indigo-600 to-blue-500 text-white border-transparent shadow-lg"
                    : "bg-white text-[#0a66c2] border-slate-200 hover:bg-slate-50"}`}
                aria-pressed={active}
              >
                #{label}
              </button>
            );
          })}

          {activeTag && (
            <button
              onClick={clearFilter}
              className="ml-2 px-3 py-1.5 rounded-full text-sm text-slate-500 hover:text-slate-700 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-6 space-y-5">
        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border rounded-lg p-4 animate-pulse" aria-hidden>
                <div className="flex gap-3 items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-3 bg-slate-200 rounded w-32 mb-2" />
                    <div className="h-2 bg-slate-200 rounded w-20" />
                  </div>
                </div>

                <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 rounded w-5/6 mb-3" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-32 bg-slate-200 rounded" />
                  <div className="h-32 bg-slate-200 rounded" />
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="h-8 w-20 bg-slate-200 rounded" />
                  <div className="h-8 w-12 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <div className="text-center mt-12 py-12">
            <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-50 to-blue-50 flex items-center justify-center text-3xl">🧩</div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900">No projects found</h3>
            <p className="mt-2 text-sm text-slate-500">Try a different filter or check back later.</p>
            <div className="mt-4">
              <button
                onClick={clearFilter}
                className="px-4 py-2 rounded-md bg-[#0a66c2] text-white hover:bg-[#004182] transition"
              >
                Show all projects
              </button>
            </div>
          </div>
        )}

        {/* Projects list */}
        {!loading && projects.length > 0 && (
          <div className="space-y-5">
            {projects.map((p, idx) => (
              <div
                key={p._id}
                className="transition-transform duration-300 ease-out hover:scale-[1.01] hover:shadow-lg rounded-lg"
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
