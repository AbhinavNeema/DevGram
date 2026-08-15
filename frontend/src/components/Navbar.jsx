import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Search,
  Plus,
  MessageSquare,
  TrendingUp,
  Layers,
  LogOut,
  Layout,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  User,
  Settings,
  Zap,
} from "lucide-react";

/* Parse JWT payload safely */
const parseToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const payload = parseToken();
  const userId = payload?.sub || payload?.id || null;
  const userName = payload?.name || null;
  const userInitial = userName?.[0]?.toUpperCase() || "U";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className={`
      sticky top-0 z-50 transition-all duration-500
      ${isScrolled
        ? "glass-nav shadow-xl shadow-violet-500/10 backdrop-blur-2xl"
        : "bg-white/70 dark:bg-slate-900/70"
      }
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[68px]">
          {/* Gradient accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 via-pink-500 to-rose-500 rounded-full" />

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-500/40 group-hover:shadow-xl group-hover:shadow-violet-500/60 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-black text-xl">D</span>
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-300" />
            </div>
            <span className="hidden sm:block text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 group-hover:from-violet-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
              DevGram
            </span>
          </Link>

          {/* Search bar (desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className={`
              relative w-full group rounded-2xl overflow-hidden transition-all duration-300
              ${isScrolled
                ? "bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50"
                : "bg-white/80 dark:bg-slate-800/80 border-2 border-transparent shadow-lg shadow-violet-500/5"
              }
            `}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, users, blogs..."
                className="w-full pl-12 pr-4 py-3 bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-[10px] text-slate-400">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">⌘</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">K</kbd>
              </div>
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Create button */}
            {userId && (
              <Link
                to="/create"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold
                  bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600
                  text-white shadow-lg shadow-violet-500/30
                  hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105
                  active:scale-95 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative z-10">New Project</span>
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:scale-105 active:scale-95"
              title={theme === "light" ? "Dark mode" : "Light mode"}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Messages button */}
            {userId && (
              <button
                onClick={() => navigate("/dm")}
                className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:scale-105 active:scale-95 relative"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            )}

            {/* User menu */}
            {userId ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl
                    bg-gradient-to-r from-violet-100/80 to-pink-100/80 dark:from-violet-900/40 dark:to-pink-900/40
                    border border-violet-200/50 dark:border-violet-700/50
                    hover:from-violet-200/80 hover:to-pink-200/80 dark:hover:from-violet-800/50 dark:hover:to-pink-800/50
                    transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {userInitial}
                  </div>
                  <span className="hidden lg:block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {userName?.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 glass-card shadow-2xl shadow-violet-500/20 overflow-hidden animate-slide-down">
                    <div className="p-1">
                      <button
                        onClick={() => { navigate(`/user/${userId}`); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-pink-50 dark:hover:from-violet-900/30 dark:hover:to-pink-900/30 transition-all duration-200"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                          {userInitial}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-sm">{userName}</p>
                          <p className="text-xs text-slate-500">View profile</p>
                        </div>
                      </button>

                      <div className="my-2 h-px bg-gradient-to-r from-transparent via-violet-200 dark:via-violet-700 to-transparent" />

                      <button
                        onClick={() => { navigate(`/edit-profile/${userId}`); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all duration-200"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Settings</span>
                      </button>

                      <button
                        onClick={() => { navigate("/workspaces"); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all duration-200"
                      >
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">Workspaces</span>
                      </button>

                      <div className="my-2 h-px bg-gradient-to-r from-transparent via-violet-200 dark:via-violet-700 to-transparent" />

                      <button
                        onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-12 pr-4 py-3 bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none text-sm"
              />
            </div>
          </form>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/50 dark:border-slate-700/50 animate-slide-down">
            <div className="space-y-2">
              {userId && (
                <Link
                  to="/create"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Project
                </Link>
              )}

              {userId ? (
                <>
                  <Link
                    to={`/user/${userId}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <User className="w-5 h-5 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-200">Profile</span>
                  </Link>

                  <Link
                    to="/workspaces"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <Zap className="w-5 h-5 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-200">Workspaces</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  <User className="w-5 h-5" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;