import WorkspaceMembers from "./WorkspaceMembers";
import InviteMember from "./InviteMember";
import ChannelManager from "./ChannelManager";

const WorkspaceInfo = ({
  workspace,
  onClose,
  onChannelCreated,
}) => {
  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;

    const currentUserId =
  payload?.id || payload?._id || payload?.sub || null;

  const myMember = workspace.members.find(
  m => (m.user?._id || m.user) === currentUserId
);

  const myRole = myMember?.role; 
  const isOwner = myRole === "owner";
  const isAdmin = myRole === "admin";
    console.log("MY ROLE:", myRole);
console.log("MEMBERS:", workspace.members);
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="w-[420px] bg-white h-full p-6 overflow-y-auto flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back
          </button>

          <h2 className="text-lg font-semibold">Workspace Info</h2>

          <div />
        </div>

        {/* BASIC INFO */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold">{workspace.name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {workspace.description || "No description"}
          </p>
        </div>

        {/* INVITE SECTION */}
        {(isOwner || isAdmin) && (
          <div className="mb-6 border rounded p-4">
            <h4 className="font-semibold mb-2">Invite Members</h4>
            <InviteMember workspaceId={workspace._id} />
          </div>
        )}

        {/* MEMBERS */}
        <div className="mb-6">
          <WorkspaceMembers
            workspace={workspace}
            currentUserId={currentUserId}
            myRole={myRole}
          />
        </div>

        {/* CHANNEL MANAGER */}
        {(isOwner || isAdmin) && (
          <div className="mt-auto pt-4 border-t">
            <ChannelManager
              workspaceId={workspace._id}
              channels={workspace.channels || []}
              onCreated={onChannelCreated}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceInfo;