import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Users, Mail, Loader2, Rocket, ShieldAlert, ArrowRight, LogIn, UserPlus } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

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
  const { user, token: authToken } = useAuth();

  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invitation link is missing token.");
      return;
    }

    const decoded = decodeJWT(token);

    if (!decoded || decoded.type !== "workspace-invite") {
      setError("This invite link is invalid or has expired.");
      return;
    }

    setInvite(decoded);

    // If user is not authenticated, store pending invite so they can be redirected after login
    if (!authToken) {
      localStorage.setItem("pendingInvite", token);
    }
  }, [token, authToken]);

  const joinWorkspace = async () => {
    if (!authToken) {
      localStorage.setItem("pendingInvite", token);
      navigate("/login", { state: { returnTo: `/invite/${token}` } });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post(`/workspaces/${invite.workspaceId}/accept`);
      localStorage.removeItem("pendingInvite");
      toast.success("Joined workspace successfully!");
      navigate(`/workspaces/${res.data.workspaceId || invite.workspaceId}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to join workspace. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    localStorage.setItem("pendingInvite", token);
    navigate("/login", { state: { returnTo: `/invite/${token}` } });
  };

  const handleRegisterRedirect = () => {
    localStorage.setItem("pendingInvite", token);
    navigate("/register", { state: { returnTo: `/invite/${token}` } });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] px-4">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-8 sm:p-10 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Invitation Error</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] rounded-xl px-4 py-2.5 font-medium transition-all duration-300"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <span className="text-xs uppercase tracking-widest text-slate-500">
            Validating Invite...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md text-center">
        {/* Workspace Avatar */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Users size={28} />
        </div>

        {/* Title & Subtitle */}
        <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-medium mb-3">
          Workspace Invitation
        </span>
        <h1 className="text-2xl font-bold text-white mb-2">You've Been Invited!</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          You have been invited to collaborate with the team on DevGram.
        </p>

        {/* Invited Email Pill */}
        <div className="flex items-center justify-center gap-2 bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 rounded-xl mb-6">
          <Mail size={16} className="text-indigo-400 shrink-0" />
          <span className="text-slate-200 font-medium text-sm truncate">
            {invite.email}
          </span>
        </div>

        {/* Auth Action Condition */}
        {authToken ? (
          <button
            onClick={joinWorkspace}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-6 py-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.99] disabled:opacity-50"
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
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
              Please sign in to your DevGram account to accept this invite.
            </p>

            <button
              onClick={handleLoginRedirect}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <LogIn size={18} />
              Log In & Accept
            </button>

            <button
              onClick={handleRegisterRedirect}
              className="w-full flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] rounded-xl px-4 py-2.5 font-medium transition-all duration-300"
            >
              <UserPlus size={18} />
              Create an Account
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-center gap-2">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-slate-400 transition"
          >
            Decline and go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Invite;