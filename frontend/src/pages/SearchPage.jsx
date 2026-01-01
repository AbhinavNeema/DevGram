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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      <h2 className="text-lg font-semibold mb-4">
        Search results for “{q}”
      </h2>

      {loading && <p>Searching…</p>}

      {users.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Users</h3>
          <div className="space-y-2">
            {users.map(u => (
              <Link
                key={u._id}
                to={`/user/username/${u.username}`}
                className="block text-sm text-[#0a66c2] hover:underline"
              >
                @{u.username} — {u.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Projects</h3>
          {projects.map(p => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      )}

      {!loading && users.length === 0 && projects.length === 0 && (
        <p className="text-gray-500">No results found</p>
      )}
    </div>
  );
};

export default SearchPage;