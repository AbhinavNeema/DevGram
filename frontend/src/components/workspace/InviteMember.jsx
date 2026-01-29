import { useState } from "react";
import api from "../../api/axios";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const InviteMember = ({ workspaceId }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const invite = async () => {
    if (!email.trim()) return;

    try {
      setLoading(true);
      setStatus(null);
      await api.post(`/workspaces/${workspaceId}/invite`, { email });
      setEmail("");
      setStatus("success");
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full transition-all duration-500">
      <div className="flex items-center gap-2 mb-3 ml-1">
        <Mail className="w-4 h-4 text-indigo-400" />
        <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">
          Add Personnel
        </h3>
      </div>

      <div className="relative group">
        <div className="flex flex-col sm:flex-row gap-3 bg-[#08090D] p-1.5 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 transition-all shadow-2xl">
          <div className="flex-1 relative flex items-center">
            <div className="absolute left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && invite()}
              placeholder="operator@system.com"
              className="w-full bg-transparent border-none pl-11 pr-4 py-3 text-sm text-white font-bold placeholder:text-slate-700 focus:ring-0"
            />
          </div>

          <button
            onClick={invite}
            disabled={loading || !email.trim()}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Transmit</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* IN-UI FEEDBACK (Replaces generic alerts) */}
        {status === "success" && (
          <div className="absolute -bottom-8 left-1 flex items-center gap-2 text-emerald-400 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Invitation Dispatched</span>
          </div>
        )}

        {status === "error" && (
          <div className="absolute -bottom-8 left-1 flex items-center gap-2 text-rose-500 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Transmission Failed</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteMember;