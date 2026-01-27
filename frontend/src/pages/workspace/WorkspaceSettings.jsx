import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const WorkspaceSettings = ({ workspace, currentUserId }) => {
  const navigate = useNavigate();

  const isOwner = workspace.owner === currentUserId;

  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description);

  const saveChanges = async () => {
    await api.put(`/workspaces/${workspace._id}`, {
      name,
      description,
    });
    alert("Workspace updated");
  };

  const deleteWorkspace = async () => {
    if (!window.confirm("Delete workspace permanently?")) return;

    await api.delete(`/workspaces/${workspace._id}`);
    navigate("/");
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-lg font-semibold mb-4">Workspace Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </div>

        <button
          onClick={saveChanges}
          className="bg-[#0a66c2] text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>

        {isOwner && (
          <div className="border-t pt-4 mt-6">
            <button
              onClick={deleteWorkspace}
              className="text-red-600 text-sm hover:underline"
            >
              Delete Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceSettings;