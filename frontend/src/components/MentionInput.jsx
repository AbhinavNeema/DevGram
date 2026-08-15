import { useEffect, useRef, useState, useCallback } from "react";
import api from "../api/axios";
import { User, AtSign, Zap, Search } from "lucide-react";

const MentionInput = ({
  value,
  onChange,
  onMentionsChange,
  placeholder = "Write a comment... @user",
  rows = 1,
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef(null);
  const boxRef = useRef(null);
  const abortRef = useRef(null);

  /* Debounced fetch with request cancellation */
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      setIsLoading(true);
      const res = await api.get(
        `/users/search?q=${encodeURIComponent(searchQuery)}`,
        { signal: abortRef.current.signal }
      );

      setSuggestions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        return;
      }
      console.error("Mention search failed", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* Debounce the fetch */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setSuggestions([]);
        setQuery("");
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const text = e.target.value;
    onChange(text);

    const cursor = e.target.selectionStart;
    const before = text.slice(0, cursor);
    const match = before.match(/@([a-z0-9_.]{1,30})$/i);

    if (match) {
      setQuery(match[1]);
      setShowDropdown(true);
    } else {
      setQuery("");
      setShowDropdown(false);
    }
  };

  const selectUser = (user) => {
    const cursor = ref.current.selectionStart;
    const before = value.slice(0, cursor).replace(/@([a-z0-9_.]{1,30})$/i, "");
    const after = value.slice(cursor);

    onChange(`${before}@${user.username} ${after}`);

    onMentionsChange?.((prev) =>
      prev?.find((u) => u._id === user._id) ? prev : [...(prev || []), user]
    );

    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setTimeout(() => ref.current.focus(), 0);
  };

  return (
    <div ref={boxRef} className={`relative w-full group ${className}`}>
      {/* Input container with glassmorphism */}
      <div className="relative overflow-hidden bg-transparent transition-all duration-150">
        <textarea
          ref={ref}
          value={value}
          rows={rows}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all resize-none leading-relaxed"
        />

        {/* At-sign indicator */}
        {value === "" && (
          <div className="absolute bottom-2 right-3 pointer-events-none opacity-40">
            <AtSign className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && (suggestions.length > 0 || isLoading) && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-72 max-h-64 overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-indigo-500/10">
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Search className="w-3 h-3" />
              Mention
            </span>
            <Zap className="w-3 h-3 text-primary/60" />
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="px-3 py-4 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Suggestions list */}
          {!isLoading && suggestions.length > 0 && (
            <div className="p-1.5">
              {suggestions.map((u) => (
                <div
                  key={u._id}
                  onClick={() => selectUser(u)}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {u.profilePhoto ? (
                      <img src={u.profilePhoto} alt={u.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      u.name?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase()
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      @{u.username}
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      {u.name || "No name"}
                    </span>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gradient-to-r from-primary to-accent text-white text-[10px] px-2 py-1 rounded-lg font-semibold">
                      Tag
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!isLoading && suggestions.length === 0 && query && (
            <div className="px-3 py-4 text-center text-xs text-slate-400">
              No users found for "@{query}"
            </div>
          )}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }
      `}</style>
    </div>
  );
};

export default MentionInput;