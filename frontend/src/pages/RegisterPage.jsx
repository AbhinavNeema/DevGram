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
  ShieldCheck, 
  CheckCircle2, 
  XCircle,
  Zap 
} from "lucide-react";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      setError("Initialization failed: All fields required");
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
      setError(err.response?.data?.message || "Registration sequence failed");
    } finally {
      setLoading(false);
    }
  };

  const checkUsername = async (value) => {
    const normalized = value.toLowerCase();
    setUsername(normalized);
    if (!normalized) { setUsernameStatus(""); return; }
    if (!/^[a-z0-9_.]+$/.test(normalized)) { setUsernameStatus("invalid"); return; }

    try {
      const res = await api.get(`/auth/check-username/${normalized}`);
      setUsernameStatus(res.data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("taken");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      
      {/* RADIANT AMBIENT GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/10 blur-[140px] pointer-events-none" />

      <div className="relative bg-[#0F111A] border border-white/10 w-full max-w-md p-10 rounded-[40px] shadow-2xl animate-in zoom-in duration-500">
        
        {/* BRANDING */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_30px_rgba(79,70,229,0.4)] transform rotate-3 hover:rotate-0 transition-transform duration-300">
            D
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">
            Initialize Account
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
            Deploy your developer identity
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* NAME */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              placeholder="Full Name"
              className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* USERNAME */}
          <div className="relative group">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              value={username}
              onChange={e => checkUsername(e.target.value)}
              placeholder="Handle (unique)"
              className={`w-full bg-[#161925] border-2 rounded-2xl pl-12 pr-4 py-4 text-sm text-white font-bold focus:outline-none transition-all shadow-inner ${
                usernameStatus === "available" ? "border-emerald-500/30" : 
                usernameStatus === "taken" || usernameStatus === "invalid" ? "border-rose-500/30" : "border-white/5 focus:border-indigo-500/50"
              }`}
            />
            
            {/* USERNAME STATUS BADGES */}
            {usernameStatus && (
              <div className={`mt-2 flex items-center gap-1.5 px-2 text-[10px] font-black uppercase tracking-widest ${
                usernameStatus === "available" ? "text-emerald-400" : "text-rose-500"
              }`}>
                {usernameStatus === "available" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {usernameStatus === "available" ? "ID verified available" : 
                 usernameStatus === "invalid" ? "Illegal characters" : "ID already claimed"}
              </div>
            )}
          </div>

          {/* EMAIL */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="email"
              placeholder="Email Interface"
              className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="password"
              placeholder="Secure Passkey"
              className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* CTA BUTTON */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-10 relative overflow-hidden group bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Deploy Identity
              <Zap className="w-4 h-4 group-hover:fill-white transition-all" />
            </>
          )}
        </button>

        {/* FOOTER */}
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
            Existing Operator?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-white transition-colors ml-1">
              Resume Session
            </Link>
          </p>
          
          <div className="flex items-center gap-2 opacity-30">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol V.2.0.4 Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;