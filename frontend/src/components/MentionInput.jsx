import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { User, AtSign, Search, Zap } from "lucide-react";

const MentionInput = ({
  value,
  onChange,
  onMentionsChange,
  placeholder = "Write a comment... @user",
  rows = 1
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const ref = useRef(null);
  const boxRef = useRef(null);
  const debounceRef = useRef(null);

  /* 🔹 Debounced fetch for suggestions (lightweight) 🔹 */
  useEffect(() => {
  if (!query) {
    setSuggestions([]);
    return;
  }

  if (debounceRef.current) clearTimeout(debounceRef.current);

  debounceRef.current = setTimeout(async () => {
    try {
      const res = await api.get(
        `/users/search?q=${encodeURIComponent(query)}`
      );

      setSuggestions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Mention search failed", err);
      setSuggestions([]);
    }
  }, 220);

  return () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };
}, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setSuggestions([]);
        setQuery("");
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

    setQuery(match ? match[1] : "");
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
    setTimeout(() => ref.current.focus(), 0);
  };

  return (
    <div ref={boxRef} className="relative w-full group">
      {/* compact single-line textarea container (light theme) */}
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-150 focus-within:ring-1 focus-within:ring-indigo-100">
        <textarea
          ref={ref}
          value={value}
          rows={rows}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none font-medium leading-tight"
        />

        {/* subtle at-sign indicator */}
        <div className="absolute bottom-1.5 right-3 pointer-events-none opacity-30 transition-opacity">
          <AtSign className="w-3.5 h-3.5 text-indigo-400" />
        </div>
      </div>

      {/* suggestions dropdown - compact, light, and non-obtrusive */}
      {suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg custom-scrollbar">
          <div className="px-2 py-1 mb-1 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Matches</span>
            <Zap className="w-3 h-3 text-indigo-500" />
          </div>

          <div className="space-y-1 px-1">
            {suggestions.map((u) => (
              <div
                key={u._id}
                onClick={() => selectUser(u)}
                className="group flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer hover:bg-indigo-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center text-[12px] font-bold text-indigo-700 flex-shrink-0 border border-indigo-100">
                  {u.name?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">@{u.username}</span>
                  <span className="text-[11px] text-slate-500">{u.name || "No name"}</span>
                </div>

                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-indigo-600 text-white text-[11px] px-2 py-0.5 rounded">Tag</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.08); border-radius: 8px; }
      `}</style>
    </div>
  );
};

export default MentionInput;