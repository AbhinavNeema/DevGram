import api from "../api/axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users").then(res => setUsers(res.data));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Developers</h2>

      <div className="space-y-3">
        {users.map(u => (
          <Link
            key={u._id}
            to={`/user/${u._id}`}
            className="block bg-white border rounded-lg p-4 hover:shadow"
          >
            <p className="font-medium">{u.name}</p>
            <p className="text-sm text-gray-500">{u.bio || "No bio yet"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
