import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const WorkspacesPage = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/workspaces")
      .then(res => setWorkspaces(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Workspaces</h1>
      </div>

      {workspaces.length === 0 && (
        <p className="text-gray-500">You are not part of any workspace yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspaces.map(ws => (
          <div
            key={ws._id}
            onClick={() => navigate(`/workspace/${ws._id}`)}
            className="bg-white border rounded-lg p-5 cursor-pointer hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">{ws.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {ws.description || "No description"}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Created on {new Date(ws.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspacesPage;