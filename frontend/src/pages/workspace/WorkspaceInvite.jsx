import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ShieldCheck, AlertCircle, Loader2, Layout, ArrowRight, LogIn, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const WorkspaceInvite = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { token: authToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authToken && workspaceId) {
      localStorage.setItem("pendingWorkspaceInvite", workspaceId);
    }
  }, [authToken, workspaceId]);

  const acceptInvite = async () => {
    if (!authToken) {
      localStorage.setItem("pendingWorkspaceInvite", workspaceId);
      navigate("/login", { state: { returnTo: `/workspace/invite/${workspaceId}` } });
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.post(`/workspaces/${workspaceId}/accept`);
      localStorage.removeItem("pendingWorkspaceInvite");
      toast.success("Joined workspace!");
      navigate(`/workspaces/${res.data.workspaceId || workspaceId}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Authorization failed or invite expired.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    localStorage.setItem("pendingWorkspaceInvite", workspaceId);
    navigate("/login", { state: { returnTo: `/workspace/invite/${workspaceId}` } });
  };

  const handleRegisterRedirect = () => {
    localStorage.setItem("pendingWorkspaceInvite", workspaceId);
    navigate("/register", { state: { returnTo: `/workspace/invite/${workspaceId}` } });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-6">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-400">
            <AlertCircle className="w-8 h-8" />
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

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10 text-center">
        {/* Workspace Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
          <Layout className="text-white w-8 h-8" />
        </div>

        {/* Invite badge */}
        <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-medium mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Workspace Collaboration
        </span>

        {/* Title & Description */}
        <h1 className="text-2xl font-bold text-white mb-2">Join Workspace</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          You have been invited to collaborate and build projects together inside this DevGram workspace.
        </p>

        {/* Actions */}
        {authToken ? (
          <div className="space-y-3">
            <button
              onClick={acceptInvite}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-6 py-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Accept Invitation
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full text-slate-500 hover:text-slate-400 py-2 text-xs font-medium transition"
            >
              Decline
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-left">
            <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-center">
              Please sign in to accept this workspace invite.
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

            <div className="text-center pt-3">
              <Link to="/" className="text-xs text-slate-500 hover:text-slate-400 transition">
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceInvite;