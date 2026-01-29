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

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let userId = null;
  let userInitial = "U";

  try {
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      userId = decoded.sub || decoded.id;
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
    <nav className="sticky top-0 z-[100] w-full border-b border-white/10 bg-[#08090D]/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* LEFT: Branding */}
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className="group flex items-center gap-3 outline-none"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:rotate-12 transition-all duration-300">
                <Layout className="text-white w-6 h-6 stroke-[2.5px]" />
              </div>
              <span className="hidden lg:block text-xl font-black tracking-tighter text-white uppercase italic">
                DevGram
              </span>
            </Link>

            {/* Search - Command Palette Style (Visible on Desktop) */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center relative group w-64 lg:w-96"
            >
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search database..."
                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
              />
              <div className="absolute inset-y-0 right-3 flex items-center gap-1 pointer-events-none">
                <Command className="w-3 h-3 text-slate-600" />
                <span className="text-[10px] font-black text-slate-600">K</span>
              </div>
            </form>
          </div>
          
          {/* RIGHT: Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            
            {/* Nav Links (Hidden on small mobile) */}
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <Link
                to="/dm"
                className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all relative"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#08090D]"></span>
              </Link>

              <Link
                to="/trending"
                className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                title="Trending"
              >
                <TrendingUp className="w-5 h-5" />
              </Link>

              <Link
                to="/workspaces"
                className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all flex items-center gap-2"
                title="Workspaces"
              >
                <Layers className="w-5 h-5" />
                <span className="hidden xl:inline text-xs font-black uppercase tracking-widest">Workspaces</span>
              </Link>
            </div>

            {/* Primary Action */}
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)]"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span className="hidden md:inline">Project</span>
            </Link>

            <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>

            {/* Profile Section */}
            {userId ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/user/${userId}`)}
                  className="group flex items-center gap-3 outline-none"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px] transition-transform group-hover:rotate-6">
                    <div className="w-full h-full rounded-[10px] bg-[#08090D] flex items-center justify-center">
                      <span className="text-sm font-black text-indigo-400">
                        {userInitial}
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="hidden lg:flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-rose-500 transition-colors uppercase tracking-[0.2em]"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest border border-indigo-500/30 px-4 py-2 rounded-xl bg-indigo-500/5 transition-all"
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