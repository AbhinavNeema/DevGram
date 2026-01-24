import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get("q");

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runSearch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${q}`);
        setUsers(res.data.users);
        setProjects(res.data.projects);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (q) runSearch();
  }, [q]);

  // small helper to highlight query matches inside a string (case-insensitive)
  const highlight = (text = "", query = "") => {
    if (!query) return text;
    const re = new RegExp(`(${escapeRegExp(query)})`, "ig");
    return text.split(re).map((part, i) =>
      re.test(part) ? (
        <span key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Search results{" "}
            <span className="text-base font-normal text-slate-500">for</span>
          </h2>

          <div className="mt-2 flex items-center gap-3">
            <div className="text-sm text-slate-700">
              <span className="inline-block bg-slate-100 px-3 py-1 rounded-full text-slate-800 font-medium">
                {q ? (
                  <span className="inline-flex items-center gap-2">
                    🔎 <span className="break-words">{q}</span>
                  </span>
                ) : (
                  "No query"
                )}
              </span>
            </div>

            {!loading && (
              <div className="text-xs text-slate-400">
                {users.length + projects.length} result{users.length + projects.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-slate-700 transition"
          >
            Home
          </Link>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-6">
          {/* users skeleton */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-3 bg-slate-200 rounded w-48 mb-2 animate-pulse" />
                <div className="h-2 bg-slate-200 rounded w-32 animate-pulse" />
              </div>
            </div>
          </div>

          {/* projects skeleton */}
          {[1, 2].map(i => (
            <div key={i} className="bg-white border rounded-lg p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-2/5 mb-3" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-28 bg-slate-200 rounded" />
                <div className="h-28 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESULTS */}
      {!loading && (
        <div className="space-y-6">
          {/* USERS */}
          {users.length > 0 && (
            <section className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-3">Users</h3>

              <div className="space-y-3">
                {users.map(u => (
                  <Link
                    key={u._id}
                    to={`/user/username/${u.username}`}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white font-bold flex items-center justify-center">
                      {u.name?.[0] || u.username?.[0] || "U"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {highlight(u.name || u.username, q)}
                        </div>
                        <div className="text-xs text-slate-400"> @{highlight(u.username, q)}</div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{u.bio || "No bio"}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* PROJECTS */}
          {projects.length > 0 && (
            <section>
              <h3 className="text-lg font-medium mb-3">Projects</h3>

              <div className="space-y-4">
                {projects.map((p, idx) => (
                  <div
                    key={p._id}
                    className="transition-transform duration-300 ease-out hover:scale-[1.01] hover:shadow-lg rounded-lg"
                    style={{ transitionDelay: `${idx * 30}ms` }}
                  >
                    {/* we keep ProjectCard unchanged (logic preserved) */}
                    <ProjectCard project={p} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EMPTY */}
          {users.length === 0 && projects.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-50 to-blue-50 flex items-center justify-center text-4xl">🔍</div>
              <h4 className="mt-6 text-lg font-semibold text-slate-900">No results found</h4>
              <p className="mt-2 text-sm text-slate-500">We couldn't find anything matching <span className="font-medium">“{q}”</span>.</p>
              <div className="mt-4">
                <Link
                  to="/"
                  className="inline-block px-4 py-2 rounded-md bg-[#0a66c2] text-white hover:bg-[#004182] transition"
                >
                  Back to home
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
