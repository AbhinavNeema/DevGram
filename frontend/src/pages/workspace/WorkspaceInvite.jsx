import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ShieldCheck, AlertCircle, Loader2, Users, ArrowRight, Layout, Lock } from "lucide-react";

/* Parse JWT safely */
const parseToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const WorkspaceInvite = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const payload = parseToken();
  const isLoggedIn = !!payload?.sub || !!payload?.id;

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/workspaces/${workspaceId}`);
        setWorkspace(res.data);
      } catch (err) {
        console.error("Failed to fetch workspace:", err);
        if (err.response?.status === 401) {
          setError("Please sign in to view this invitation");
        } else if (err.response?.status === 403) {
          setError("You are not authorized to view this workspace");
        } else {
          setError("Invalid or expired invitation link");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  const acceptInvite = async () => {
    if (!isLoggedIn) {
      // Store invite info and redirect to login
      localStorage.setItem("pendingWorkspaceInvite", workspaceId);
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/workspaces/${workspaceId}/accept`);
      localStorage.removeItem("pendingWorkspaceInvite");
      navigate(`/workspaces/${workspaceId}`);
    } catch (err) {
      console.error("Accept invite error:", err);
      if (err.response?.status === 401) {
        setError("Please sign in to join this workspace");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to join workspace");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const decline = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
          Validating invitation
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 shadow-sm rounded-3xl p-10 max-w-md text-center">
          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invitation Issue
          </h2>

          <p className="text-gray-500 mb-6">
            {error}
          </p>

          {error.includes("sign in") ? (
            <div className="space-y-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm font-medium"
              >
                Create Account
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition"
            >
              Return Home
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white border border-gray-200 shadow-sm rounded-3xl p-10">
        {/* Invite badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Workspace Invite
          </div>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
          <Layout className="text-white w-9 h-9" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Join {workspace?.name}
        </h1>

        {/* Description */}
        <p className="text-gray-500 text-center mb-8 leading-relaxed">
          {workspace?.description || "You have been invited to collaborate inside this workspace."}
        </p>

        {/* Member count preview */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white"
              >
                <Users className="w-4 h-4 text-gray-500" />
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {workspace?.members?.length || 0} member{(workspace?.members?.length || 0) !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Not logged in notice */}
        {!isLoggedIn && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
            <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              You'll need to sign in or create an account to join
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={acceptInvite}
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Accept Invitation
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={decline}
            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm font-medium"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceInvite;