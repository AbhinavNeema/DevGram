import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { User, AtSign, Search, Zap } from "lucide-react";

const MentionInput = ({
  value,
  onChange,
  onMentionsChange,
  placeholder,
  rows = 3
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const ref = useRef(null);
  const boxRef = useRef(null);

  /* 🔹 Same Logic 🔹 */
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await api.get(`/search?q=${query}`);
        setSuggestions(res.data.users || []);
      } catch (err) {
        console.error("Mention search failed", err);
      }
    };

    fetchUsers();
  }, [query]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setSuggestions([]);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = e => {
    const text = e.target.value;
    onChange(text);

    const cursor = e.target.selectionStart;
    const before = text.slice(0, cursor);
    const match = before.match(/@([a-z0-9_.]{1,30})$/i);

    setQuery(match ? match[1] : "");
  };

  const selectUser = user => {
    const cursor = ref.current.selectionStart;
    const before = value.slice(0, cursor).replace(/@([a-z0-9_.]{1,30})$/i, "");
    const after = value.slice(cursor);

    onChange(`${before}@${user.username} ${after}`);

    onMentionsChange?.(prev =>
      prev.find(u => u._id === user._id) ? prev : [...prev, user]
    );

    setQuery("");
    setSuggestions([]);
    setTimeout(() => ref.current.focus(), 0);
  };

  return (
    <div ref={boxRef} className="relative w-full group">
      {/* TEXTAREA CONTAINER */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0F111A] transition-all duration-300 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-inner">
        <textarea
          ref={ref}
          value={value}
          rows={rows}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all resize-none font-medium leading-relaxed"
        />
        
        {/* SUBTLE INDICATOR */}
        <div className="absolute bottom-2 right-3 pointer-events-none opacity-20 group-focus-within:opacity-100 transition-opacity">
           <AtSign className="w-3.5 h-3.5 text-indigo-400" />
        </div>
      </div>

      {/* SUGGESTIONS DROPDOWN: High Visibility Glassmorphism */}
      {suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-full max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#161925]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 custom-scrollbar">
          <div className="px-3 py-2 mb-1 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Database Match</span>
            <Zap className="w-3 h-3 text-indigo-500 fill-current" />
          </div>
          
          <div className="space-y-1">
            {suggestions.map(u => (
              <div
                key={u._id}
                onClick={() => selectUser(u)}
                className="group/item flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-indigo-600 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-white/10 group-hover/item:bg-white/20 transition-colors">
                  <User className="w-4 h-4 text-slate-400 group-hover/item:text-white" />
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white group-hover/item:text-white transition-colors">
                    @{u.username}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter group-hover/item:text-indigo-200">
                    {u.name || "Personnel"}
                  </span>
                </div>

                <div className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black text-white uppercase">Tag</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MentionInput;