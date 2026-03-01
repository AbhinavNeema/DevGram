import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      navigate(redirect || "/");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-50 via-white to-pink-50">

      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-lg">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            D
          </div>
        </div>

        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500">
            Login to your Devgram account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Email
          </label>

          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
            <Mail className="w-4 h-4 text-slate-500" />
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 outline-none text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="Enter password"
              className="flex-1 outline-none text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Login
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* FOOTER */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;