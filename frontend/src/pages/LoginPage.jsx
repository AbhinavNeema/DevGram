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
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">

      <div className="bg-white border rounded-2xl w-full max-w-md p-8
                      shadow-sm hover:shadow-md transition-all">

        {/* Logo / Brand */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600
                          flex items-center justify-center text-white font-bold text-lg shadow">
            D
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-1">
          Sign in to DevGram
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Build. Share. Connect with developers.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600
                          text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg px-4 py-2 mb-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:border-blue-500 transition"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg px-4 py-2 mb-4 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:border-blue-500 transition"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        
        {/* Button */}
        <button
          onClick={submit}
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition
            ${loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"
            }
            text-white`}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        {/* Footer */}
        <p className="text-sm text-center text-gray-600 mt-5">
          New to DevGram?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Join now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
