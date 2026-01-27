const ROLE_STYLES = {
  owner: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  member: "bg-gray-100 text-gray-700",
};

const RoleBadge = ({ role }) => {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
        ROLE_STYLES[role] || ROLE_STYLES.member
      }`}
    >
      {role}
    </span>
  );
};

export default RoleBadge;