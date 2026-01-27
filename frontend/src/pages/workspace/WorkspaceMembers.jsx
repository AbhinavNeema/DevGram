import api from "../../api/axios";

const WorkspaceMembers = ({ workspace }) => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-500">
        Members
      </h3>

      <div className="space-y-2">
        {workspace.members.map(m => (
          <div
            key={m.user._id}
            className="flex items-center gap-2 text-sm"
          >
            <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
              {m.user.name[0]}
            </div>
            <span>{m.user.name}</span>
            <span className="text-xs text-gray-400 ml-auto">
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


export default WorkspaceMembers;