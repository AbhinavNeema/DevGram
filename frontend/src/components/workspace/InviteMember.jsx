import { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Mail, Send, Loader2 } from "lucide-react";

const InviteMember = ({ workspaceId }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const invite = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      await api.post(`/workspaces/${workspaceId}/invite`, { email });
      setEmail("");
      toast.success("Invitation sent successfully!");
    } catch (err) {
      console.error("Invite failed:", err);
      const message = err.response?.data?.message || "Failed to send invitation";
      toast.error(message);
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


    </div>
);
};

export default InviteMember;