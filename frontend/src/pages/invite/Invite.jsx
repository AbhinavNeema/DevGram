import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, Mail, Loader2, Rocket, ShieldAlert } from "lucide-react";
import api from "../../api/axios";

function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

const Invite = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setLoading(true);

      const res = await api.post(
        `/workspaces/${invite.workspaceId}/accept`
      );

      navigate(`/workspaces/${res.data.workspaceId}`);
    } catch {
      setError("Failed to join workspace");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
        <div className="bg-[#0F111A] border border-white/10 p-10 rounded-[40px] text-center shadow-2xl">
          <ShieldAlert className="mx-auto mb-4 text-rose-500" size={40} />
          <h2 className="text-xl font-black text-white mb-2">
            Invite Invalid
          </h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!invite) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="relative bg-[#0F111A] border border-white/10 p-10 rounded-[40px] shadow-2xl w-full max-w-md text-center animate-in zoom-in duration-500">

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)]">
          <Users className="text-white" size={28} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
          Workspace Invitation
        </h2>

        <p className="text-slate-400 text-sm mb-6">
          You were invited to collaborate as
        </p>

        {/* Email Badge */}
        <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl mb-8">
          <Mail size={16} className="text-indigo-400" />
          <span className="text-white font-bold text-sm">
            {invite.email}
          </span>
        </div>

        {/* Join Button */}
        <button
          onClick={joinWorkspace}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Join Workspace
              <Rocket size={18} />
            </>
          )}
        </button>

        {/* Footer */}
        <p className="mt-6 text-[10px] text-slate-500 uppercase tracking-[0.3em]">
          DevGram Collaboration Protocol
        </p>
      </div>
    </div>
  );
};

export default Invite;