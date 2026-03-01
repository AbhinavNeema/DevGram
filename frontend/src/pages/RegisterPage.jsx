import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight
} from "lucide-react";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      await api.post("/auth/register", { name, email, username, password });

      const res = await api.post("/auth/login", { email, password });
      login(res.data.token);

      navigate(redirect || "/");
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-50 via-white to-pink-50">

      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-lg">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow">
            D
          </div>
        </div>

        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Create your account
          </h2>
          <p className="text-sm text-slate-500">
            Join the Devgram developer network
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* NAME */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Full Name
          </label>

          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
            <User className="w-4 h-4 text-slate-500" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="flex-1 outline-none text-sm"
            />
          </div>
        </div>

        {/* USERNAME */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Username
          </label>

          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
            <AtSign className="w-4 h-4 text-slate-500" />
            <input
              value={username}
              onChange={(e) => checkUsername(e.target.value)}
              placeholder="your_handle"
              className="flex-1 outline-none text-sm"
            />
          </div>

          {usernameStatus && (
            <div
              className={`flex items-center gap-1 text-xs mt-1 ${
                usernameStatus === "available"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {usernameStatus === "available" ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}

              {usernameStatus === "available"
                ? "Username available"
                : usernameStatus === "invalid"
                ? "Invalid characters"
                : "Username taken"}
            </div>
          )}
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Email
          </label>

          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
            <Mail className="w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 outline-none text-sm"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Password
          </label>

          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
            <Lock className="w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
              className="flex-1 outline-none text-sm"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* FOOTER */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;