import { useState } from "react";
import api from "../../api/axios";
import { Mail, Send, Loader2 } from "lucide-react";

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
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-3">

      {/* INPUT */}

      <div className="relative flex-1">
        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />

        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>


      {/* BUTTON */}

      <button
        onClick={invite}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin"/>
        ) : (
          <>
            Invite
            <Send className="w-4 h-4"/>
          </>
        )}
      </button>

    </div>
  );
};

export default InviteModal;