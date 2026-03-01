import { useState } from "react";
import api from "../../api/axios";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const InviteMember = ({ workspaceId }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const invite = async () => {
    if (!email.trim()) return;

    try {
      setLoading(true);
      setStatus(null);
      await api.post(`/workspaces/${workspaceId}/invite`, { email });
      setEmail("");
      setStatus("success");
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="w-full">

    {/* HEADER */}

    <div className="flex items-center gap-2 mb-3">
      <Mail className="w-4 h-4 text-indigo-600" />
      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Invite Member
      </h3>
    </div>


    {/* INPUT AREA */}

    <div className="border border-gray-200 rounded-lg p-2 bg-white flex flex-col sm:flex-row gap-2">

      <div className="flex items-center flex-1 relative">

        <Mail className="absolute left-3 w-4 h-4 text-gray-400"/>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && invite()}
          placeholder="user@email.com"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

      </div>


      <button
        onClick={invite}
        disabled={loading || !email.trim()}
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


    {/* FEEDBACK */}

    {status === "success" && (
      <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
        <CheckCircle2 className="w-4 h-4"/>
        Invitation sent successfully
      </div>
    )}

    {status === "error" && (
      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
        <AlertCircle className="w-4 h-4"/>
        Failed to send invite
      </div>
    )}

  </div>
);
};

export default InviteMember;