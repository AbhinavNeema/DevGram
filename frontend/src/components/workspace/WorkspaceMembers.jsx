import api from "../../api/axios";

const WorkspaceMembers = ({ workspace, currentUserId, myRole }) => {
  const isOwner = myRole === "owner";
  const isAdmin = myRole === "admin";

  const changeRole = async (userId, role) => {
    await api.put(
      `/workspaces/${workspace._id}/role/${userId}`,
      { role }
    );
    window.location.reload();
  };

  const removeMember = async (userId) => {
    if (!confirm("Remove this member from workspace?")) return;

    await api.delete(
      `/workspaces/${workspace._id}/members/${userId}`
    );
    window.location.reload();
  };

  return (
    <div>
      <h4 className="font-semibold mb-3">Members</h4>

      <div className="space-y-3">
        {workspace.members.map(m => {
          const isMe = String(m.user._id) === String(currentUserId);
          const isTargetOwner = m.role === "owner";

          return (
            <div
              key={m._id}
              className="flex items-center justify-between border rounded p-3"
            >
              {/* USER INFO */}
              <div>
                <div className="text-sm font-medium">
                  {m.user.name} {isMe && "(You)"}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {m.role}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 text-xs">
                {/* OWNER ONLY */}
                {isOwner && m.role === "member" && (
                  <button
                    onClick={() => changeRole(m.user._id, "admin")}
                    className="text-blue-600 hover:underline"
                  >
                    Make Admin
                  </button>
                )}

                {isOwner && m.role === "admin" && (
                  <button
                    onClick={() => changeRole(m.user._id, "member")}
                    className="text-yellow-600 hover:underline"
                  >
                    Demote
                  </button>
                )}

                {/* OWNER + ADMIN */}
                {(isOwner || isAdmin) &&
                  !isMe &&
                  !isTargetOwner && (
                    <button
                      onClick={() => removeMember(m.user._id)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkspaceMembers;