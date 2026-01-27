import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    api.get("/workspaces").then(res => setWorkspaces(res.data));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Workspaces</h1>
        <button
          onClick={() => navigate("/workspaces/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create Workspace
        </button>
      </div>

      {workspaces.length === 0 && (
        <p className="text-gray-500">No workspaces yet</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {workspaces.map(ws => (
          <div
            key={ws._id}
            onClick={() => navigate(`/workspaces/${ws._id}`)}
            className="border p-4 rounded cursor-pointer hover:shadow"
          >
            <h2 className="font-semibold">{ws.name}</h2>
            <p className="text-sm text-gray-500">
              {ws.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workspaces;