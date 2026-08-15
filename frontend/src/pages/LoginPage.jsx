import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token);

      const pendingWorkspace = localStorage.getItem("pendingWorkspaceInvite");
      if (pendingWorkspace) {
        localStorage.removeItem("pendingWorkspaceInvite");
        try {
          await api.post(`/workspaces/${pendingWorkspace}/accept`);
          toast.success("Joined workspace!");
          navigate(`/workspaces/${pendingWorkspace}`);
          return;
        } catch (inviteErr) {
          console.error("Failed to auto-join workspace:", inviteErr);
        }
      }

      navigate(redirect || "/");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent-2/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-accent-2 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity -z-10" />
          </div>
        </div>

        {/* Card */}
        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Gradient header bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-accent-2" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Login to your DevGram account
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm px-4 py-3 rounded-2xl mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Email
              </label>
              <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-primary dark:focus-within:border-primary transition-all">
                <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 outline-none text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-8">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Password
              </label>
              <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-primary dark:focus-within:border-primary transition-all">
                <Lock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="flex-1 outline-none text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={submit}
              disabled={loading}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-primary via-accent to-accent-2 disabled:from-slate-300 disabled:to-slate-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 disabled:shadow-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-accent via-accent-2 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  <span className="relative z-10">Logging in...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Login</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-semibold hover:underline underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;