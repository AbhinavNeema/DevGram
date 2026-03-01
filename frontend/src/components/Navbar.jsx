import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Search,
  Plus,
  MessageSquare,
  TrendingUp,
  Layers,
  LogOut,
  Command,
  Layout
} from "lucide-react";

/** safer token parsing helper (used across components) */
const safeGetUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.sub || payload.id || null,
      name: payload.name || null
    };
  } catch {
    return null;
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const user = safeGetUser();
  const userId = user?.id || null;
  const userInitial = user?.name?.[0]?.toUpperCase() || "U";

  const [search, setSearch] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search)}`);
    setSearch("");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* LEFT: Branding + Search */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-md transition-transform group-hover:rotate-6">
                <Layout className="text-white w-5 h-5 stroke-[2]" />
              </div>

              <span className="hidden lg:block text-lg font-extrabold tracking-tight text-slate-900 uppercase">
                DevGram
              </span>
            </Link>

            {/* Desktop Search (compact, command-palette hint) */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-[20rem] lg:w-[28rem]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search database..."
                className="w-full bg-gray-50 border border-gray-100 pl-10 pr-10 py-2 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-100 focus:border-indigo-300 transition"
              />

              <div className="absolute inset-y-0 right-3 flex items-center gap-1 pointer-events-none">
                <Command className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] font-semibold text-slate-500">K</span>
              </div>
            </form>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/dm"
                className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-gray-50 rounded-xl transition"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="sr-only">Messages</span>
                <span className="absolute top-3 right-6 inline-block w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white"></span>
              </Link>

              <Link
                to="/trending"
                className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-gray-50 rounded-xl transition"
                title="Trending"
              >
                <TrendingUp className="w-5 h-5" />
              </Link>

              <Link
                to="/workspaces"
                className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition flex items-center gap-2"
                title="Workspaces"
              >
                <Layers className="w-5 h-5" />
                <span className="hidden xl:inline text-xs font-semibold uppercase tracking-wider text-slate-700">Workspaces</span>
              </Link>
            </div>

            {/* Primary CTA */}
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-95 transition shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              <span className="hidden md:inline">Project</span>
            </Link>

            <div className="hidden sm:block w-px h-6 bg-gray-100 mx-2" />

            {/* Profile / Auth */}
            {userId ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/user/${userId}`)}
                  className="group flex items-center gap-2"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-[8px] bg-white flex items-center justify-center">
                      <span className="text-sm font-extrabold text-indigo-600">{userInitial}</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-rose-500 uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-widest border border-indigo-100 px-3 py-2 rounded-xl bg-indigo-50"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;