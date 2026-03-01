import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { ShieldCheck, AlertCircle, Loader2, Users, ArrowRight, Layout } from "lucide-react";

const WorkspaceInvite = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/workspaces/${workspaceId}`)
      .then(res => {
        setWorkspace(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Invalid or expired invitation link");
        setLoading(false);
      });
  }, [workspaceId]);

  const acceptInvite = async () => {
    try {
      await api.post(`/workspaces/${workspaceId}/accept`);
      navigate(`/workspaces/${workspaceId}`);
    } catch {
      setError("Authorization failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin"/>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
          Validating invitation
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 shadow-sm rounded-3xl p-10 max-w-md text-center">

          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-7 h-7 text-red-500"/>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invitation Invalid
          </h2>

          <p className="text-gray-500 mb-6">
            {error}
          </p>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="max-w-lg w-full bg-white border border-gray-200 shadow-sm rounded-3xl p-10">

        {/* Invite badge */}

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4"/>
            Workspace Invite
          </div>
        </div>

        {/* Icon */}

        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
          <Layout className="text-white w-9 h-9"/>
        </div>

        {/* Title */}

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Join {workspace.name}
        </h1>

        {/* Description */}

        <p className="text-gray-500 text-center mb-8 leading-relaxed">
          {workspace.description || "You have been invited to collaborate inside this workspace."}
        </p>

        {/* Members preview */}

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1,2,3].map(i => (
            <div key={i} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-500"/>
            </div>
          ))}
          <span className="text-xs text-gray-500 ml-2">
            Active workspace
          </span>
        </div>

        {/* Buttons */}

        <div className="space-y-3">

          <button
            onClick={acceptInvite}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
          >
            Accept Invitation
            <ArrowRight className="w-4 h-4"/>
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm font-medium"
          >
            Decline
          </button>

        </div>

      </div>

    </div>
  );
};

export default WorkspaceInvite;