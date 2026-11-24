import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  TrendingUp,
  MessageSquare,
  Layers,
  Plus,
  Search,
  Command,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Code2,
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const userId = user?.id || null;
  const displayName = user?.name || user?.username || 'User';
  const userInitial = (displayName[0] || 'U').toUpperCase();

  // ⌘K / Ctrl+K shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch('');
    searchInputRef.current?.blur();
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Trending', path: '/trending', icon: TrendingUp },
    { name: 'Messages', path: '/dm', icon: MessageSquare },
    { name: 'Workspaces', path: '/workspaces', icon: Layers },
  ];

  const isCurrentPath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="w-full bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/[0.06] transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* LEFT: Branding + Desktop Search */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all">
                <Code2 className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                DevGram
              </span>
            </Link>

            {/* Desktop Search input with glow effect & ⌘K shortcut */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-72 lg:w-96 group">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                <Search className="w-4 h-4" />
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, developers, tags..."
                className="w-full bg-white/[0.04] border border-white/[0.08] pl-10 pr-12 py-2 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.07] transition-all shadow-inner"
              />

              <div className="absolute inset-y-0 right-3 flex items-center gap-0.5 pointer-events-none">
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white/[0.06] border border-white/[0.1] rounded">
                  <Command className="w-2.5 h-2.5" />
                  <span>K</span>
                </kbd>
              </div>
            </form>
          </div>

          {/* RIGHT: Desktop Nav Icons, Create CTA, User Profile */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isCurrentPath(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                      active
                        ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                    title={item.name}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name === 'Workspaces' && (
                      <span className="hidden xl:inline text-xs font-semibold uppercase tracking-wider">
                        Workspaces
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Create Project Button */}
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-4 py-2 text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create</span>
            </Link>

            <div className="w-px h-6 bg-white/[0.08] mx-1" />

            {/* User Avatar & Dropdown */}
            {userId ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/[0.05] transition-all focus:outline-none"
                  aria-label="User menu"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 p-[1px] shadow-sm">
                    <div className="w-full h-full rounded-[11px] bg-[#0A0F1E] flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-400">{userInitial}</span>
                    </div>
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-white/[0.1] rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-2xl animate-fade-in">
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                      {user?.email && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                      )}
                      {user?.username && (
                        <p className="text-xs text-indigo-400 truncate mt-0.5">@{user.username}</p>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to={`/user/${userId}`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to={`/edit-profile/${userId}`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                      </Link>

                      <Link
                        to="/workspaces"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span>My Workspaces</span>
                      </Link>
                    </div>

                    <div className="border-t border-white/[0.06] pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] rounded-xl px-4 py-2 text-sm font-medium transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* MOBILE: Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {userId && (
              <Link
                to="/create"
                className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                title="Create"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SLIDE-OUT DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-4/5 max-w-sm h-full bg-[#0E1528] border-l border-white/[0.08] shadow-2xl p-6 flex flex-col justify-between z-10 animate-slide-in-right">
            <div>
              {/* Header with Brand and Close */}
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Code2 className="text-white w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-lg">DevGram</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mt-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-white/[0.05] border border-white/[0.1] pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </form>

              {/* Nav Links */}
              <div className="mt-6 flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isCurrentPath(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <Link
                  to="/create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 mt-2"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span>Create Project</span>
                </Link>
              </div>
            </div>

            {/* Bottom: Profile & Logout */}
            <div className="pt-6 border-t border-white/[0.06]">
              {userId ? (
                <div className="flex flex-col gap-3">
                  <Link
                    to={`/user/${userId}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm">
                      {userInitial}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-white truncate">{displayName}</p>
                      {user?.username && (
                        <p className="text-xs text-indigo-400 truncate">@{user.username}</p>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;