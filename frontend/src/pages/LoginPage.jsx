import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination priority: ProtectedRoute location.state -> search query param -> feed
  const fromLocation = location.state?.from?.pathname;
  const searchRedirect = new URLSearchParams(location.search).get('redirect');
  const destination = fromLocation || searchRedirect || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      const msg = 'Please enter both email and password';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        email: trimmedEmail,
        password,
      });

      if (res.data?.token) {
        login(res.data.token);
        toast.success('Welcome back!');
        navigate(destination, { replace: true });
      } else {
        throw new Error('Authentication token not received');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 transition-all duration-300">
        {/* Brand / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/25 mb-4 ring-1 ring-white/20">
            D
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-center">
            Welcome back to <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">DevGram</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 text-center">
            Sign in to connect with fellow engineers and share your work
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span className="flex-1 text-xs sm:text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-11 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;