import { useState } from "react";
import api from "../../api/axios";

const InviteMember = ({ workspaceId }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const invite = async () => {
    if (!email.trim()) return;

    try {
      setLoading(true);
      await api.post(`/workspaces/${workspaceId}/invite`, { email });
      setEmail("");
      alert("Invitation sent");
    } catch {
      alert("Invite failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Invite member</h3>
      <div className="flex gap-2">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="flex-1 border rounded px-2 py-1 text-sm"
        />
        <button
          onClick={invite}
          disabled={loading}
          className="bg-blue-600 text-white px-3 rounded text-sm"
        >
          Invite
        </button>
      </div>
    </div>
  );
};

export default InviteMember;