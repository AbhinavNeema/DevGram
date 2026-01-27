import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateWorkspace = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const res = await api.post("/workspaces", {
        name,
        description,
      });

      // redirect to workspace dashboard
      navigate(`/workspaces/${res.data._id}`);
    } catch (err) {
      console.error("Create workspace failed", err);
      alert("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={submit}
        className="bg-white w-full max-w-md p-6 rounded-lg shadow"
      >
        <h1 className="text-xl font-semibold mb-4">
          Create Workspace
        </h1>

        {/* NAME */}
        <div className="mb-4">
          <label className="text-sm font-medium">
            Workspace Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            placeholder="eg. DevGram Team"
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div className="mb-6">
          <label className="text-sm font-medium">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            rows={3}
            placeholder="What is this workspace about?"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm px-4 py-2 rounded border"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateWorkspace;