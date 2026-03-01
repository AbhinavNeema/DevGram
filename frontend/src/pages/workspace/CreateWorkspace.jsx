import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Rocket, Info, ArrowLeft, Loader2, Sparkles } from "lucide-react";

const CreateWorkspace = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);

      const res = await api.post("/workspaces", {
        name,
        description,
      });

      navigate(`/workspaces/${res.data._id}`);
    } catch (err) {
      console.error("Create workspace failed", err);
      alert("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

      <form
        onSubmit={submit}
        className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-10 shadow-xl"
      >

        {/* HEADER */}

        <div className="mb-10">

          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-6">
            <Rocket className="w-6 h-6 text-white" />
          </div>

          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Create Workspace
          </h1>

          <p className="text-gray-500">
            Set up a collaborative workspace for your team.
          </p>

        </div>


        {/* FORM */}

        <div className="space-y-6">

          {/* NAME */}

          <div>

            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              Workspace Name
              <Sparkles className="w-4 h-4 text-indigo-500"/>
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Alpha Design Lab"
              required
            />

          </div>


          {/* DESCRIPTION */}

          <div>

            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-indigo-500"/>
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe the purpose of this workspace"
            />

          </div>

        </div>


        {/* ACTIONS */}

        <div className="mt-10 flex items-center justify-between">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4"/>
            Back
          </button>


          <button
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
                       text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin"/>
            ) : (
              <>
                Create
                <Rocket className="w-4 h-4"/>
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
};

export default CreateWorkspace;