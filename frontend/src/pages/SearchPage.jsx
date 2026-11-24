import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import {
  Search,
  User,
  Loader2,
  Users,
  FolderGit2,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const SearchPage = () => {
  const [params, setSearchParams] = useSearchParams();
  const urlQuery = params.get('q') || '';

  const [inputVal, setInputVal] = useState(urlQuery);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Sync internal input value if URL changes from outside (e.g. navbar search)
  useEffect(() => {
    setInputVal(urlQuery);
  }, [urlQuery]);

  // Execute search when urlQuery changes
  useEffect(() => {
    const trimmed = urlQuery.trim();
    if (!trimmed) {
      setUsers([]);
      setProjects([]);
      setLoading(false);
      return;
    }

    const runSearch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/search?q=${encodeURIComponent(trimmed)}`);
        setUsers(res.data?.users || []);
        setProjects(res.data?.projects || []);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [urlQuery]);

  // Debounced input handler for inline search
  const handleInputChange = (e) => {
    const nextVal = e.target.value;
    setInputVal(nextVal);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const trimmed = nextVal.trim();
      setSearchParams(trimmed ? { q: trimmed } : {});
    }, 350);
  };

  const handleClear = () => {
    setInputVal('');
    setSearchParams({});
    setUsers([]);
    setProjects([]);
  };

  const highlight = (text = '', query = '') => {
    if (!query || !text) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return String(text)
      .split(regex)
      .map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            className="bg-indigo-500/20 text-indigo-300 font-semibold px-0.5 rounded"
          >
            {part}
          </span>
        ) : (
          part
        )
      );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Inline Search Bar at Top (Mobile & Desktop) */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder="Search developers, projects, tech stacks, or keywords..."
            className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] rounded-2xl pl-12 pr-11 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/25 transition-all shadow-xl"
          />
          {inputVal && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {urlQuery && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing results for <span className="text-white font-semibold">"{urlQuery}"</span>
            </span>
            {!loading && (
              <span>
                {users.length} {users.length === 1 ? 'developer' : 'developers'},{' '}
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-9 h-9 animate-spin text-indigo-400 mb-3" />
          <span className="text-slate-400 text-sm font-medium">Searching developer network...</span>
        </div>
      )}

      {/* Results Section */}
      {!loading && (
        <div className="space-y-10">
          {/* USERS RESULTS */}
          {users.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 text-white">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold tracking-tight">
                  Developers ({users.length})
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {users.map((u) => (
                  <Link
                    key={u._id}
                    to={`/user/${u._id}`}
                    className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 group shadow-md"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                      {u.profilePhoto ? (
                        <img
                          src={u.profilePhoto}
                          alt={u.name || u.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        u.name?.[0]?.toUpperCase() ||
                        u.username?.[0]?.toUpperCase() ||
                        'U'
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors truncate">
                        {highlight(u.name || u.username, urlQuery)}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        @{highlight(u.username, urlQuery)}
                      </p>
                      {u.bio && (
                        <p className="text-xs text-slate-500 truncate mt-1">
                          {u.bio}
                        </p>
                      )}
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* PROJECTS RESULTS */}
          {projects.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 text-white">
                <FolderGit2 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold tracking-tight">
                  Projects ({projects.length})
                </h2>
              </div>

              <div className="space-y-6">
                {projects.map((p) => (
                  <ProjectCard key={p._id} project={p} />
                ))}
              </div>
            </section>
          )}

          {/* NO RESULTS / EMPTY STATE */}
          {urlQuery && users.length === 0 && projects.length === 0 && (
            <div className="text-center py-20 px-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">No Matches Found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mb-4">
                We couldn't find any developers or projects matching "{urlQuery}". Try another keyword, tag, or handle.
              </p>
              <button
                onClick={handleClear}
                className="bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] rounded-xl px-4 py-2 text-xs font-semibold transition-all"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* INITIAL EMPTY QUERY PROMPT */}
          {!urlQuery && (
            <div className="text-center py-20 px-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
              <Sparkles className="w-10 h-10 text-indigo-400/60 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Explore DevGram</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Discover creators, trending open-source projects, engineering blogs, and system architecture blueprints.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;