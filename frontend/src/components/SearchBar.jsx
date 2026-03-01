import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Command } from "lucide-react";

const SearchBar = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={submit}
      className="relative w-full max-w-xl"
    >
      {/* icon */}
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-slate-400" />
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search projects, users, tags..."
        className="w-full bg-white border border-gray-200 pl-10 pr-12 py-2.5 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
      />

      {/* keyboard hint */}
      <div className="absolute inset-y-0 right-3 flex items-center gap-1 pointer-events-none">
        <Command className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] font-semibold text-slate-400">K</span>
      </div>
    </form>
  );
};

export default SearchBar;