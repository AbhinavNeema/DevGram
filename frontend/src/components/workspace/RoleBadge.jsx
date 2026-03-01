import { Crown, Shield, User } from "lucide-react";

const ROLE_STYLES = {
  owner: {
    class: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Crown,
  },
  admin: {
    class: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Shield,
  },
  member: {
    class: "bg-gray-100 text-gray-700 border-gray-200",
    icon: User,
  },
};

const RoleBadge = ({ role }) => {
  const roleConfig = ROLE_STYLES[role] || ROLE_STYLES.member;
  const Icon = roleConfig.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleConfig.class}`}
    >
      <Icon className="w-3 h-3" />
      {role}
    </span>
  );
};

export default RoleBadge;