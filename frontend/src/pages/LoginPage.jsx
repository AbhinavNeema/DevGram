import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      login(res.data.token);

      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border rounded-xl w-full max-w-md p-8">

        <h2 className="text-2xl font-semibold text-center mb-2">
          Sign in to DevGram
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Build. Share. Connect with developers.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:border-[#0a66c2]"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg px-4 py-2 mb-4 text-sm focus:outline-none focus:border-[#0a66c2]"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-[#0a66c2] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#004182]"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          New to DevGram?{" "}
          <Link to="/register" className="text-[#0a66c2] hover:underline">
            Join now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
