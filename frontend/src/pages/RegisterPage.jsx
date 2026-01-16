import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

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
      navigate("/");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border rounded-xl w-full max-w-md p-8">

        <h2 className="text-2xl font-semibold text-center mb-2">
          Join DevGram
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Create your developer profile
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <input
          placeholder="Full name"
          className="w-full border rounded-lg px-4 py-2 mb-3 text-sm"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          value={username}
          onChange={(e) => checkUsername(e.target.value)}
          placeholder="Choose a unique username"
          className="w-full border rounded-lg px-4 py-2 mb-1 text-sm"
        />
        {usernameStatus === "available" && (
          <p className="text-xs text-green-600 mb-3">Username available</p>
        )}

        {usernameStatus === "taken" && (
          <p className="text-xs text-red-600 mb-3">Username already taken</p>
        )}

        {usernameStatus === "invalid" && (
          <p className="text-xs text-red-600 mb-3">
            Only lowercase letters, numbers, _ and .
          </p>
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg px-4 py-2 mb-3 text-sm"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg px-4 py-2 mb-4 text-sm"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-[#0a66c2] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#004182] disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0a66c2] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;