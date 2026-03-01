import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Settings, Save, Trash2 } from "lucide-react";

const WorkspaceSettings = ({ workspace, currentUserId }) => {
  const navigate = useNavigate();
  const isOwner = workspace.owner === currentUserId;

  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || "");
  const [loading, setLoading] = useState(false);

  const saveChanges = async () => {
    try {
      setLoading(true);
      await api.put(`/workspaces/${workspace._id}`, { name, description });
      alert("Workspace updated successfully");
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async () => {
    if (!window.confirm("Delete workspace permanently?")) return;

    await api.delete(`/workspaces/${workspace._id}`);
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* SETTINGS CARD */}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-indigo-600" />
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Workspace Settings
          </h2>
        </div>

        <div className="space-y-6">

          {/* NAME */}

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Workspace Name
            </label>

            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Description
            </label>

            <textarea
              rows="4"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* SAVE BUTTON */}

          <button
            onClick={saveChanges}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>

        </div>
      </div>

      {/* DANGER ZONE */}

      {isOwner && (
        <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-8 mt-8">

          <h3 className="text-lg font-bold text-red-600 mb-3">
            Danger Zone
          </h3>

          <p className="text-sm text-gray-500 mb-6">
            Deleting a workspace will permanently remove all projects,
            members, and activity inside it.
          </p>

          <button
            onClick={deleteWorkspace}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-lg font-semibold transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete Workspace
          </button>

        </div>
      )}

    </div>
  );
};

export default WorkspaceSettings;