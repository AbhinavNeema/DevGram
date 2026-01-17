import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let userId = null;
  let userInitial = "U";

  try {
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      userId = decoded.id;
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-[#0a66c2]">
            DevGram
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects, tags, or @username"
              className="bg-transparent outline-none text-sm w-64"
            />
          </form>
          <Link
          to="/dm"
          className="text-sm font-medium text-gray-700 hover:text-blue-600"
        >
          💬 Messages
        </Link>
        </div>
        
        {/* RIGHT */}
        <div className="flex items-center gap-5 text-sm font-medium">

          <Link
            to="/create"
            className="bg-[#0a66c2] text-white px-4 py-1.5 rounded-full hover:bg-[#004182]"
          >
            + Create Project
          </Link>

          <Link
            to="/trending"
            className="text-gray-600 hover:text-black"
          >
            Trending
          </Link>

          {/* PROFILE AVATAR */}
          {userId && (
            <button
              onClick={() => navigate(`/user/${userId}`)}
              className="w-9 h-9 rounded-full bg-[#e7f3ff] text-[#0a66c2] font-semibold flex items-center justify-center hover:ring-2 hover:ring-[#0a66c2]"
              title="My Profile"
            >
              {userInitial}
            </button>
          )}

          <button
            onClick={logout}
            className="text-gray-500 hover:text-black"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;