import api from "../../api/axios";
import RoleBadge from "./RoleBadge";

const MemberRow = ({ member, workspaceId, ownerId, currentUserId }) => {
  const isOwner = member.user._id === ownerId;
  const canManage =
    currentUserId === ownerId && member.user._id !== ownerId;

  const changeRole = async role => {
    await api.put(
      `/workspaces/${workspaceId}/role/${member.user._id}`,
      { role }
    );
    window.location.reload();
  };

  const removeUser = async () => {
    await api.delete(
      `/workspaces/${workspaceId}/member/${member.user._id}`
    );
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{member.user.name}</p>
        <RoleBadge role={member.role} />
      </div>

      {canManage && (
        <div className="flex gap-2 text-xs">
          {member.role === "member" && (
            <button
              onClick={() => changeRole("admin")}
              className="text-blue-600 hover:underline"
            >
              Promote
            </button>
          )}

          {member.role === "admin" && (
            <button
              onClick={() => changeRole("member")}
              className="text-yellow-600 hover:underline"
            >
              Demote
            </button>
          )}

          <button
            onClick={removeUser}
            className="text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberRow;