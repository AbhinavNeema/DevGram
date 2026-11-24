import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
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
  ShieldCheck,
} from 'lucide-react';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromLocation = location.state?.from?.pathname;
  const searchRedirect = new URLSearchParams(location.search).get('redirect');
  const destination = fromLocation || searchRedirect || '/';

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(''); // '' | 'checking' | 'available' | 'taken' | 'invalid'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const debounceTimeoutRef = useRef(null);

  // Compute password strength: score 0 to 4
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-indigo-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  // Debounced username checker (500ms)
  const handleUsernameChange = (val) => {
    const normalized = val.toLowerCase().trim();
    setUsername(normalized);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!normalized) {
      setUsernameStatus('');
      return;
    }

    if (!/^[a-z0-9_.]+$/.test(normalized) || normalized.length < 3) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/check-username/${encodeURIComponent(normalized)}`);
        setUsernameStatus(res.data.available ? 'available' : 'taken');
      } catch (err) {
        console.error('Check username failed', err);
        setUsernameStatus('taken');
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedUsername || !trimmedEmail || !password) {
      const msg = 'All fields are required';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      const msg = 'Please choose a valid and available username';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', {
        name: trimmedName,
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      });

      // Automatically log in after registration
      const loginRes = await api.post('/auth/login', {
        email: trimmedEmail,
        password,
      });

      if (loginRes.data?.token) {
        login(loginRes.data.token);
        toast.success('Account created successfully!');
        navigate(destination, { replace: true });
      } else {
        navigate('/login');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please check your information.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 transition-all duration-300">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/25 mb-4 ring-1 ring-white/20">
            D
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-center">
            Create an account
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 text-center">
            Join the <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent font-semibold">DevGram</span> developer collective
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span className="flex-1 text-xs sm:text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Username
              </label>
              {usernameStatus && (
                <div
                  className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                    usernameStatus === 'available'
                      ? 'text-emerald-400'
                      : usernameStatus === 'checking'
                      ? 'text-indigo-400'
                      : 'text-red-400'
                  }`}
                >
                  {usernameStatus === 'checking' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {usernameStatus === 'available' && <CheckCircle2 className="w-3 h-3" />}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                    <XCircle className="w-3 h-3" />
                  )}
                  <span>
                    {usernameStatus === 'checking'
                      ? 'Checking...'
                      : usernameStatus === 'available'
                      ? 'Available'
                      : usernameStatus === 'invalid'
                      ? 'Min 3 chars (letters, numbers, _)'
                      : 'Username taken'}
                  </span>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <AtSign className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="adalovelace"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
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
                placeholder="ada@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-11 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
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

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Strength:</span>
                  <span className="font-semibold text-slate-300">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        step <= strength.score ? strength.color : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-4 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;