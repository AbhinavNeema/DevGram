import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

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

  /* 🔹 Fetch suggestions */
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const fetchUsers = async () => {
      const res = await api.get(`/search?q=${query}`);
      setSuggestions(res.data.users || []);
    };

    fetchUsers();
  }, [query]);

  /* 🔹 Close dropdown on outside click */
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
    <div ref={boxRef} className="relative w-full">
      <textarea
        ref={ref}
        value={value}
        rows={rows}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full border rounded-md px-3 py-2 text-sm"
      />

      {suggestions.length > 0 && (
        <div className="absolute z-20 bg-white border rounded-md mt-1 w-full shadow max-h-40 overflow-y-auto">
          {suggestions.map(u => (
            <div
              key={u._id}
              onClick={() => selectUser(u)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
            >
              @{u.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionInput;