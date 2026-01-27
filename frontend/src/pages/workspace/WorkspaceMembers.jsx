import api from "../../api/axios";

const WorkspaceMembers = ({ workspace }) => {
  const changeRole = async (userId, role) => {
    const res = await api.put(
      `/workspaces/${workspace._id}/role/${userId}`,
      { role }
    );

    // 🔥 force UI update
    window.location.reload(); // TEMP (safe for now)
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-3">Members</h3>

      {workspace.members.map(m => (
        <div
          key={m.user._id}
          className="flex justify-between items-center mb-2"
        >
          <div>
            <p className="text-sm font-medium">{m.user.name}</p>
            <p className="text-xs text-gray-500">{m.role}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => changeRole(m.user._id, "admin")}
              className="text-xs bg-blue-100 px-2 py-1 rounded"
            >
              Make Admin
            </button>
            <button
              onClick={() => changeRole(m.user._id, "member")}
              className="text-xs bg-gray-100 px-2 py-1 rounded"
            >
              Make Member
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkspaceMembers;