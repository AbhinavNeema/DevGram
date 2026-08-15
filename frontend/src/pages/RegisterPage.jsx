import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

/* Password strength checker */
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: "Weak", color: "bg-rose-500" };
  if (score <= 4) return { score: 2, label: "Medium", color: "bg-amber-500" };
  return { score: 3, label: "Strong", color: "bg-emerald-500" };
};

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  // Debounced username check
  useEffect(() => {
    if (!username) {
      setUsernameStatus("");
      return;
    }

    const normalized = username.toLowerCase();

    if (!/^[a-z0-9_.]+$/.test(normalized)) {
      setUsernameStatus("invalid");
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await api.get(`/auth/check-username/${normalized}`);
        setUsernameStatus(res.data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("taken");
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const submit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (usernameStatus === "taken" || usernameStatus === "invalid") {
      setError("Please choose a valid username");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        username: username.toLowerCase(),
        password,
      });

      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
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
          console.warn("Failed to auto-join workspace:", inviteErr);
        }
      }

      toast.success("Welcome to DevGram!");
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent via-secondary to-primary flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-violet-500/30 group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-accent to-primary rounded-2xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity -z-10" />
          </div>
        </div>

        {/* Card */}
        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Gradient header bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-secondary to-primary" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">Join the network</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Create your account
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Start building and sharing with the community
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

            {/* Name */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Full Name</label>
              <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-accent dark:focus-within:border-accent transition-all">
                <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="flex-1 outline-none text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Username */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Username</label>
              <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-accent dark:focus-within:border-accent transition-all">
                <AtSign className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_handle"
                  className="flex-1 outline-none text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 lowercase"
                  autoComplete="username"
                />
                {checkingUsername && (
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin flex-shrink-0" />
                )}
              </div>

              {usernameStatus && usernameStatus !== "checking" && (
                <div
                  className={`flex items-center gap-1.5 text-xs mt-2 font-medium ${
                    usernameStatus === "available" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {usernameStatus === "available" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Username available
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      {usernameStatus === "invalid" ? "Only letters, numbers, _ and . allowed" : "Username taken"}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Email</label>
              <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-accent dark:focus-within:border-accent transition-all">
                <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 outline-none text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-8">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Password</label>
              <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-accent dark:focus-within:border-accent transition-all">
                <Lock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password (min 6 chars)"
                  className="flex-1 outline-none text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={loading || usernameStatus === "taken" || usernameStatus === "invalid"}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-accent via-secondary to-primary disabled:from-slate-300 disabled:to-slate-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:shadow-violet-500/25 disabled:shadow-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  <span className="relative z-10">Creating account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Create Account</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-semibold hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;