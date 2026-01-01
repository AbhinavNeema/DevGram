import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search projects, users, tags..."
        className="border px-3 py-2 rounded w-full text-sm"
      />
    </form>
  );
};

export default SearchBar;