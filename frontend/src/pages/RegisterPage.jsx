import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const redirect = new URLSearchParams(location.search).get("redirect");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name || !email || !password || !username) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        name,
        email,
        username,
        password
      });

      const res = await api.post("/auth/login", {
        email,
        password
      });

      login(res.data.token);
      if (redirect) {
        navigate(redirect);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  const checkUsername = async (value) => {
  const normalized = value.toLowerCase();
  setUsername(normalized);

  if (!normalized) {
    setUsernameStatus("");
    return;
  }

  if (!/^[a-z0-9_.]+$/.test(normalized)) {
    setUsernameStatus("invalid");
    return;
  }

  try {
    const res = await api.get(`/auth/check-username/${normalized}`);
    setUsernameStatus(res.data.available ? "available" : "taken");
  } catch {
    setUsernameStatus("taken");
  }
};
  return (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4">

    {/* BACKGROUND GLOWS */}
    <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />

    <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl w-full max-w-md p-8 shadow-2xl">

      {/* LOGO */}
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0a66c2] to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg">
          D
        </div>
      </div>

      {/* HEADER */}
      <div className="text-center mb-7">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Join DevGram
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Create your developer profile
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-5 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      {/* INPUTS */}
      <div className="space-y-4">

        {/* NAME */}
        <div className="relative">
          <input
            placeholder="Full name"
            className="w-full border border-slate-300 rounded-lg pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">👤</span>
        </div>

        {/* USERNAME */}
        <div className="relative">
          <input
            value={username}
            onChange={e => checkUsername(e.target.value)}
            placeholder="Choose a unique username"
            className="w-full border border-slate-300 rounded-lg pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>

          {usernameStatus === "available" && (
            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
              ✔ Username available
            </p>
          )}

          {usernameStatus === "taken" && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              ✖ Username already taken
            </p>
          )}

          {usernameStatus === "invalid" && (
            <p className="text-xs text-red-600 mt-1.5">
              Only lowercase letters, numbers, <code>_</code> and <code>.</code>
            </p>
          )}
        </div>

        {/* EMAIL */}
        <div className="relative">
          <input
            type="email"
            placeholder="Email address"
            className="w-full border border-slate-300 rounded-lg pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">✉️</span>
        </div>

        {/* PASSWORD */}
        <div className="relative">
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-slate-300 rounded-lg pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔒</span>
          <p className="text-xs text-slate-400 mt-1">
            Use at least 8 characters for better security
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={submit}
        disabled={loading}
        className="w-full mt-6 bg-gradient-to-r from-[#0a66c2] to-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl hover:from-[#004182] hover:to-blue-700 transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account…" : "Create Account"}
      </button>

      {/* DIVIDER */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="text-xs text-slate-400">or</span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      {/* FOOTER */}
      <p className="text-sm text-center text-slate-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#0a66c2] font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>

      <p className="text-[11px] text-center text-slate-400 mt-4">
        By signing up, you agree to our Terms & Privacy Policy
      </p>
    </div>
  </div>
);

};

export default RegisterPage;