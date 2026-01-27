import { useState } from "react";
import api from "../../api/axios";

const InviteModal = ({ workspaceId }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const invite = async () => {
    if (!email || loading) return;

    setLoading(true);
    try {
      await api.post(`/workspaces/${workspaceId}/invite`, { email });
      alert("Invite sent");
      setEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "Invite failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="border px-2 py-1 text-sm rounded"
      />
      <button
        onClick={invite}
        disabled={loading}
        className="bg-[#0a66c2] text-white px-3 rounded text-sm disabled:opacity-50"
      >
        {loading ? "Sending…" : "Invite"}
      </button>
    </div>
  );
};
export default InviteModal;