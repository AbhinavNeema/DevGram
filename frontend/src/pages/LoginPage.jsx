import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

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
      setError("Authorization credentials required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token);
      navigate(redirect || "/");
    } catch (err) {
      setError("Identity verification failed. Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="relative bg-[#0F111A] border border-white/10 w-full max-w-md p-10 rounded-[40px] shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* BRANDING */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl transform group-hover:rotate-3 transition-transform">
              D
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">
            System Login
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
            Access your developer terminal
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {error}
          </div>
        )}

        {/* INPUTS */}
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="Security Key"
              className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>
        </div>
        
        {/* SUBMIT */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-8 relative overflow-hidden group bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Authorize Access
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* FOOTER */}
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            First time deploying here?{" "}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-white transition-colors"
            >
              Initialize Account
            </Link>
          </p>
          
          <div className="flex items-center gap-2 opacity-30">
            <ShieldCheck className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Handshake Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;