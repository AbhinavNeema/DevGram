import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import { Search, User, Loader2 } from "lucide-react";

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get("q");

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (!q) {
      setUsers([]);
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timeout = setTimeout(() => {
      setDebouncedQuery(q);
    }, 400);

    return () => clearTimeout(timeout);
  }, [q]);

  useEffect(() => {
    const runSearch = async () => {
      try {
        const res = await api.get(`/search?q=${debouncedQuery}`);
        setUsers(res.data.users);
        setProjects(res.data.projects);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (debouncedQuery) runSearch();
  }, [debouncedQuery]);

  const highlight = (text = "", query = "") => {
    if (!query) return text;

    const re = new RegExp(`(${escapeRegExp(query)})`, "ig");

    return text.split(re).map((part, i) =>
      re.test(part) ? (
        <span key={i} className="bg-indigo-100 text-indigo-600 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <Search className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-900">
          Search results for "{q}"
        </h1>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {!loading && (
        <div className="space-y-10">

          {/* USERS */}
          {users.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-600 mb-4">
                Users
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {users.map((u) => (
                  <Link
                    key={u._id}
                    to={`/user/username/${u.username}`}
                    className="flex items-center gap-4 border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50 transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {u.name?.[0] || u.username?.[0]}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {highlight(u.name || u.username, q)}
                      </p>
                      <p className="text-sm text-slate-500">
                        @{highlight(u.username, q)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* PROJECTS */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-600 mb-4">
                Projects
              </h2>

              <div className="space-y-6">
                {projects.map((p) => (
                  <ProjectCard key={p._id} project={p} />
                ))}
              </div>
            </section>
          )}

          {/* EMPTY */}
          {users.length === 0 && projects.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              No results found for "{q}"
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default SearchPage;