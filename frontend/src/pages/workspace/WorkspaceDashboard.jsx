import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import ChannelList from "../../components/workspace/ChannelList";
import ChannelChat from "../../components/workspace/ChannelChat";
import WorkspaceMembers from "./WorkspaceMembers";

const WorkspaceDashboard = () => {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);

  useEffect(() => {
    api.get(`/workspaces/${id}`).then(res => setWorkspace(res.data));
  }, [id]);

  if (!workspace) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <div className="px-6 py-4 border-b bg-white shrink-0">
        <h1 className="text-xl font-semibold">{workspace.name}</h1>
        <p className="text-sm text-gray-500">{workspace.description}</p>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-12 bg-white">
          {/* CHANNEL LIST */}
          <div className="col-span-3 border-r overflow-hidden">
            <ChannelList
              workspaceId={workspace._id}
              activeChannel={activeChannel}
              onSelect={setActiveChannel}
            />
          </div>

          {/* CHAT */}
          <div className="col-span-6 bg-gray-50 overflow-hidden">
            {activeChannel ? (
              <ChannelChat channel={activeChannel} />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Select a channel to start chatting
              </div>
            )}
          </div>

          {/* MEMBERS */}
          <div className="col-span-3 border-l overflow-y-auto">
            <WorkspaceMembers workspace={workspace} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDashboard;