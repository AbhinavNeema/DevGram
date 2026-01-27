import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import ChannelList from "../../components/workspace/ChannelList";
import ChannelChat from "../../components/workspace/ChannelChat";
import WorkspaceInfo from "../../components/workspace/WorkspaceInfo";
import ChannelSettings from "../../components/workspace/ChannelSettings.jsx";

const WorkspaceDashboard = () => {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    api.get(`/workspaces/${id}`).then(res => setWorkspace(res.data));
  }, [id]);

  if (!workspace) return null;

  return (
    <div className="h-screen flex flex-col">
      {/* HEADER */}
      <div className="border-b px-6 py-3 flex justify-between items-center">
        <h1 className="font-semibold text-lg">{workspace.name}</h1>
        <button
          onClick={() => setShowInfo(true)}
          className="text-sm text-blue-600"
        >
          ℹ Info
        </button>
      </div>

      {/* BODY */}
      <div className="flex flex-1">
        <div className="w-64 border-r">
          <ChannelList
            workspaceId={workspace._id}
            activeChannel={activeChannel}
            onSelect={setActiveChannel}
          />
        </div>

        <div className="flex-1 flex flex-col">
          {activeChannel ? (
            <>
              {/* CHANNEL HEADER */}
              <div className="border-b px-4 py-2 flex justify-between items-center bg-white">
                <div className="font-medium text-sm">
                  #{activeChannel.name}
                </div>

                <button
                  onClick={() => {
                    setSelectedChannel(activeChannel);
                    setShowChannelSettings(true);
                  }}
                  className="text-xs text-gray-500 hover:text-black"
                >
                  ⚙
                </button>
              </div>

              {/* CHAT */}
              <div className="flex-1">
                <ChannelChat channel={activeChannel} />
              </div>
            </>
          ) : (
            <div className="p-6 text-gray-500">
              Select a channel
            </div>
          )}
        </div>
      </div>

      {showInfo && (
        <WorkspaceInfo
          workspace={workspace}
          onClose={() => setShowInfo(false)}
        />
      )}

      {showChannelSettings && selectedChannel && (
        <ChannelSettings
          channel={selectedChannel}
          workspace={workspace}
          onClose={() => {
            setShowChannelSettings(false);
            setSelectedChannel(null);
          }}
        />
      )}
    </div>
  );
};

export default WorkspaceDashboard;