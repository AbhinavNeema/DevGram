import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

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
        setError("Invalid or expired invitation");
        setLoading(false);
      });
  }, [workspaceId]);

  const acceptInvite = async () => {
    try {
      await api.post(`/workspaces/${workspaceId}/accept`);
      navigate(`/workspace/${workspaceId}`);
    } catch (err) {
      setError("Failed to accept invite");
    }
  };

  if (loading) return null;

  if (error) {
    return <div className="text-center mt-20 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-24 bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-semibold mb-2">
        Join {workspace.name}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {workspace.description}
      </p>

      <button
        onClick={acceptInvite}
        className="w-full bg-[#0a66c2] text-white py-2 rounded"
      >
        Accept Invitation
      </button>
    </div>
  );
};

export default WorkspaceInvite;