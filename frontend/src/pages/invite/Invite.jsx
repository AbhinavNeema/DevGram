import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
import api from "../../api/axios";

const Invite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
  const decoded = decodeJWT(token);

  if (!decoded || decoded.type !== "workspace-invite") {
    setError("Invalid or expired invite");
    return;
  }

  setInvite(decoded);
}, [token]);

  const joinWorkspace = async () => {
    try {
      const res = await api.post(
        `/workspaces/${invite.workspaceId}/accept`
      );
      navigate(`/workspaces/${res.data.workspaceId}`);
    } catch (err) {
      alert("Failed to join workspace");
    }
  };

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!invite) return null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="border p-6 rounded w-96 text-center">
        <h2 className="text-xl font-semibold mb-4">
          Workspace Invitation
        </h2>
        <p className="mb-4">
          You were invited as <b>{invite.email}</b>
        </p>
        <button
          onClick={joinWorkspace}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Join Workspace
        </button>
      </div>
    </div>
  );
};

export default Invite;