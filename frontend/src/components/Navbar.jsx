import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let userId = null;
  let userInitial = "U";

  try {
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      userId = decoded.sub;
      userInitial = decoded.name?.[0]?.toUpperCase() || "U";
    }
  } catch {}

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
  <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md transition-all duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between gap-8">
        
        {/* LEFT: Branding & Search */}
        <div className="flex items-center gap-6 flex-1">
          <Link 
            to="/" 
            className="group flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform">
              <span className="text-white text-base">D</span>
            </div>
            <span className="hidden sm:block">DevGram</span>
          </Link>

          {/* Search Bar - Command Palette Style */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md relative group"
          >
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects, tags, or @username..."
              className="w-full bg-slate-100/50 border border-transparent pl-10 pr-4 py-2 rounded-xl text-sm transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded">⌘K</kbd>
            </div>
          </form>
        </div>
        
        {/* RIGHT: Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          <Link
            to="/dm"
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Messages"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
          </Link>

          <Link
            to="/trending"
            className="hidden sm:block px-3 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            Trending
          </Link>
          <Link
            to="/workspaces"
            className="text-sm font-medium text-gray-700 hover:text-[#0a66c2]"
          >
            Workspaces
          </Link>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-sm shadow-slate-200"
          >
            <span className="text-lg leading-none">+</span>
            <span className="hidden md:inline">Project</span>
          </Link>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* PROFILE & LOGOUT */}
          {userId ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/user/${userId}`)}
                className="group relative flex items-center gap-2 outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] transition-transform group-hover:scale-105">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {userInitial}
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={logout}
                className="hidden lg:block text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700">
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