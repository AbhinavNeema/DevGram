import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import { User, AtSign, Zap } from 'lucide-react';

const MentionInput = ({
  value,
  onChange,
  onMentionsChange,
  placeholder = 'Write something... @user',
  rows = 1,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search for @mentions
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Mention search failed', err);
        setSuggestions([]);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([]);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const text = e.target.value;
    onChange(text);

    // BUG FIX: When user deletes/backspaces @username, synchronize mentions array in parent
    onMentionsChange?.((prevMentions) => {
      if (!prevMentions || prevMentions.length === 0) return prevMentions;
      return prevMentions.filter((u) => u?.username && text.includes(`@${u.username}`));
    });

    // Detect @query at current cursor position
    const cursor = e.target.selectionStart;
    const before = text.slice(0, cursor);
    const match = before.match(/@([a-z0-9_.]{1,30})$/i);

    setQuery(match ? match[1] : '');
  };

  const selectUser = (user) => {
    const cursor = textareaRef.current.selectionStart;
    const before = value.slice(0, cursor).replace(/@([a-z0-9_.]{1,30})$/i, '');
    const after = value.slice(cursor);
    const newText = `${before}@${user.username} ${after}`;

    onChange(newText);

    onMentionsChange?.((prev) => {
      const existing = prev || [];
      if (existing.some((u) => u._id === user._id)) return existing;
      return [...existing, user];
    });

    setQuery('');
    setSuggestions([]);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = before.length + user.username.length + 2;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div ref={containerRef} className="relative w-full group">
      {/* Dark Glass Textarea */}
      <div className="relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.08] focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-300">
        <textarea
          ref={textareaRef}
          value={value}
          rows={rows}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-transparent px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none font-normal leading-relaxed ${className}`}
        />

        <div className="absolute bottom-2 right-2.5 pointer-events-none opacity-30 group-focus-within:opacity-80 transition-opacity">
          <AtSign className="w-3.5 h-3.5 text-indigo-400" />
        </div>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-full max-h-52 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#0E1528]/95 backdrop-blur-xl p-1.5 shadow-2xl">
          <div className="px-2.5 py-1 mb-1 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Matching Developers
            </span>
            <Zap className="w-3 h-3 text-indigo-400" />
          </div>

          <div className="space-y-1">
            {suggestions.map((u) => (
              <div
                key={u._id}
                onClick={() => selectUser(u)}
                className="group/item flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-indigo-500/15 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                  {u.name?.[0]?.toUpperCase() ||
                    u.username?.[0]?.toUpperCase() || (
                      <User className="w-3.5 h-3.5" />
                    )}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-white truncate">
                    @{u.username}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {u.name || 'Developer'}
                  </span>
                </div>

                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-indigo-500/30">
                    Mention
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentionInput;