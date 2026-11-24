import { useState } from "react";
import api from "../../api/axios";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const InviteMember = ({ workspaceId }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState("");

  const invite = async () => {
    if (!email.trim() || !workspaceId) return;

    try {
      setLoading(true);
      setStatus(null);
      setErrorMessage("");

      await api.post(`/workspaces/${workspaceId}/invite`, { email: email.trim() });
      setEmail("");
      setStatus("success");
      toast.success("Invitation sent successfully!");
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      console.error("Invite error", err);
      const msg = err.response?.data?.message || "Failed to send invite";
      setErrorMessage(msg);
      setStatus("error");
      toast.error(msg);
      setTimeout(() => setStatus(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-indigo-400" />
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Invite by Email
        </h3>
      </div>

      {/* INPUT BAR */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center flex-1 relative">
          <Mail className="absolute left-3.5 w-4 h-4 text-slate-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && invite()}
            placeholder="colleague@domain.com"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
          />
        </div>

        <button
          onClick={invite}
          disabled={loading || !email.trim()}
          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Send Invite</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* FEEDBACK STATUS */}
      {status === "success" && (
        <div className="flex items-center gap-1.5 mt-2.5 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Invite dispatched successfully via email.</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-1.5 mt-2.5 text-rose-400 text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage || "Failed to send invitation."}</span>
        </div>
      )}
    </div>
  );
};

export default InviteMember;