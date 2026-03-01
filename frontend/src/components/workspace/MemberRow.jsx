import api from "../../api/axios";
import RoleBadge from "./RoleBadge";
import { Shield, User, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

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
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">

      {/* USER INFO */}

      <div className="flex items-center gap-3">

        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
          {member.user.name[0]}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-800">
            {member.user.name}
          </p>

          <RoleBadge role={member.role} />
        </div>

      </div>


      {/* ACTIONS */}

      {canManage && (
        <div className="flex items-center gap-2">

          {member.role === "member" && (
            <button
              onClick={() => changeRole("admin")}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              <ArrowUp className="w-3 h-3" />
              Promote
            </button>
          )}

          {member.role === "admin" && (
            <button
              onClick={() => changeRole("member")}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
            >
              <ArrowDown className="w-3 h-3" />
              Demote
            </button>
          )}

          <button
            onClick={removeUser}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </button>

        </div>
      )}

    </div>
  );
};

export default MemberRow;