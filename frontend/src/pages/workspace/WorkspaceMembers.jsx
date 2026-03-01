import { Users } from "lucide-react";

const WorkspaceMembers = ({ workspace }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
          <Users className="w-4 h-4 text-indigo-600" />
        </div>

        <h3 className="text-sm font-bold text-gray-900">
          Workspace Members
        </h3>

        <span className="ml-auto text-xs text-gray-500 font-semibold">
          {workspace.members.length}
        </span>
      </div>

      {/* Members List */}

      <div className="space-y-3">

        {workspace.members.map(m => (
          <div
            key={m.user._id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
          >

            {/* Avatar */}

            <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">
              {m.user.name?.[0]?.toUpperCase()}
            </div>

            {/* Name */}

            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {m.user.name}
              </span>
            </div>

            {/* Role Badge */}

            <span
              className={`ml-auto text-xs px-3 py-1 rounded-full font-semibold
                ${
                  m.role === "owner"
                    ? "bg-purple-100 text-purple-700"
                    : m.role === "admin"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600"
                }`}
            >
              {m.role}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
};

export default WorkspaceMembers;