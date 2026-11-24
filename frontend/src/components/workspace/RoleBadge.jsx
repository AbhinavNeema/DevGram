import { Crown, Shield, User } from "lucide-react";

const ROLE_STYLES = {
  owner: {
    class: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    icon: Crown,
  },
  admin: {
    class: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    icon: Shield,
  },
  member: {
    class: "bg-white/[0.04] text-slate-400 border-white/[0.08]",
    icon: User,
  },
};

const RoleBadge = ({ role }) => {
  const normalizedRole = (role || "member").toLowerCase();
  const roleConfig = ROLE_STYLES[normalizedRole] || ROLE_STYLES.member;
  const Icon = roleConfig.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border uppercase ${roleConfig.class}`}
    >
      <Icon className="w-2.5 h-2.5" />
      <span>{normalizedRole}</span>
    </span>
  );
};

export default RoleBadge;