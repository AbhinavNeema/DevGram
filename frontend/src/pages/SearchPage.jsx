import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import ProjectCard from "../components/ProjectCard";
import BlogCard from "../components/BlogCard";
import { Search, User, Loader2, FolderOpen, FileText, Users, Code2, Hash } from "lucide-react";

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get("q");

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const abortRef = useRef(null);

  useEffect(() => {
    if (!q) {
      setUsers([]);
      setProjects([]);
      setBlogs([]);
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
    if (!debouncedQuery) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    const runSearch = async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(debouncedQuery)}`, {
          signal: abortRef.current.signal
        });
        setUsers(res.data.users || []);
        setProjects(res.data.projects || []);
        setBlogs(res.data.blogs || []);
      } catch (err) {
        if (err.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        console.error("Search failed:", err);
        toast.error("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    runSearch();

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [debouncedQuery]);

  const highlightMatch = (text = "", query = "") => {
    if (!query || !text) return text;

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${escaped})`, "gi");

    return text.split(re).map((part, i) =>
      re.test(part) ? (
        <mark key={i} className="bg-accent/20 text-accent px-1 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const totalResults = users.length + projects.length + blogs.length;

  const renderUserCard = (user) => (
    <Link
      key={user._id}
      to={`/user/${user.username || user._id}`}
      className="flex items-center gap-4 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:shadow-indigo-500/10 transition-all group"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
        {user.profilePhoto ? (
          <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
        ) : (
          user.name?.[0]?.toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
            {highlightMatch(user.name, q)}
          </h3>
          <span className="text-xs text-slate-400">@{user.username}</span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-1">
          {user.bio || "Developer on DevGram"}
        </p>
        {user.techStack?.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {user.techStack.slice(0, 3).map((tech) => (
              <span key={tech} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <FolderOpen className="w-3 h-3" />
          {user.projects?.length || 0}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {user.followers?.length || 0}
        </span>
      </div>
    </Link>
  );

  const renderResults = () => {
    const tabs = [
      { key: "all", label: "All", count: totalResults },
      { key: "users", label: "Users", count: users.length, icon: User },
      { key: "projects", label: "Projects", count: projects.length, icon: Code2 },
      { key: "blogs", label: "Blogs", count: blogs.length, icon: FileText },
    ];

    return (
      <>
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-200/50 dark:border-slate-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Users */}
        {(activeTab === "all" || activeTab === "users") && users.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              <Users className="w-4 h-4" />
              Users
            </h2>
            <div className="grid gap-3">
              {users.map(renderUserCard)}
            </div>
          </div>
        )}

        {/* Projects */}
        {(activeTab === "all" || activeTab === "projects") && projects.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              <Code2 className="w-4 h-4" />
              Projects
            </h2>
            <div className="space-y-6">
              {projects.map((p) => (
                <ProjectCard key={p._id} project={p} showOwnerActions />
              ))}
            </div>
          </div>
        )}

        {/* Blogs */}
        {(activeTab === "all" || activeTab === "blogs") && blogs.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              <FileText className="w-4 h-4" />
              Blogs
            </h2>
            <div className="space-y-6">
              {blogs.map((b) => (
                <BlogCard key={b._id} blog={b} showOwnerActions />
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {totalResults === 0 && !loading && (
          <div className="text-center py-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              We couldn&apos;t find anything matching "{q}". Try different keywords.
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Search className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Search Results
          </h1>
          {q && (
            <p className="text-sm text-slate-500">
              {loading ? "Searching..." : `${totalResults} results for "${q}"`}
            </p>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : q ? (
        renderResults()
      ) : (
        <div className="text-center py-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Start searching
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Search for users, projects, or blogs by typing in the search bar above.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;