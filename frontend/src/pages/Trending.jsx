import { useEffect, useState } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import { Flame, Loader2, TrendingUp } from "lucide-react";

const Trending = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const res = await api.get("/projects/trending");
        setProjects(res.data);
      } catch (err) {
        console.error("Trending fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">

        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Trending Projects
            </h1>
            <p className="text-sm text-slate-500">
              Most active projects in the community
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold">
          <TrendingUp className="w-4 h-4" />
          Live
        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No trending projects right now.
        </div>
      )}

      {/* PROJECT LIST */}
      {!loading && projects.length > 0 && (
        <div className="space-y-8">
          {projects.map((project, index) => (
            <div key={project._id} className="relative">

              {/* RANK BADGE */}
              <div className="absolute -left-10 top-6 hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                {index + 1}
              </div>

              <ProjectCard project={project} />

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Trending;