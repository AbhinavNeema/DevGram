import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import ChannelList from "../../components/workspace/ChannelList";
import ChannelChat from "../../components/workspace/ChannelChat";
import WorkspaceInfo from "../../components/workspace/WorkspaceInfo";
import ChannelSettings from "../../components/workspace/ChannelSettings.jsx";
import { Info, Settings, Layout, Hash, ChevronRight, Menu } from "lucide-react";

const WorkspaceDashboard = () => {
  const { id } = useParams();

  const [workspace, setWorkspace] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.get(`/workspaces/${id}`).then(res => setWorkspace(res.data));
  }, [id]);

  if (!workspace) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* HEADER */}

      <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 sm:px-6">

        <div className="flex items-center gap-4">

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6"/>
          </button>

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Layout className="w-5 h-5 text-white"/>
            </div>

            <h1 className="font-semibold text-gray-900 text-lg">
              {workspace.name}
            </h1>

          </div>

        </div>

        <button
          onClick={() => setShowInfo(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-semibold hover:bg-indigo-100 transition"
        >
          <Info className="w-4 h-4"/>
          <span className="hidden sm:inline">Workspace Info</span>
        </button>

      </header>


      {/* BODY */}

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}

        <aside
          className={`
            absolute inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300
            lg:relative lg:translate-x-0
            ${isMobileMenuOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
          `}
        >
          <ChannelList
            workspaceId={workspace._id}
            activeChannel={activeChannel}
            onSelect={(ch) => {
              setActiveChannel(ch);
              setIsMobileMenuOpen(false);
            }}
          />
        </aside>


        {/* CHAT AREA */}

        <main className="flex-1 flex flex-col">

          {activeChannel ? (
            <>
              {/* CHANNEL HEADER */}

              <div className="h-14 border-b border-gray-200 bg-white px-6 flex justify-between items-center">

                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Hash className="w-4 h-4 text-indigo-500"/>
                  {activeChannel.name}
                </div>

                <button
                  onClick={() => {
                    setSelectedChannel(activeChannel);
                    setShowChannelSettings(true);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <Settings className="w-4 h-4"/>
                </button>

              </div>

              <div className="flex-1 overflow-hidden bg-gray-50">
                <ChannelChat channel={activeChannel}/>
              </div>
            </>
          ) : (

            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">

              <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
                <ChevronRight className="w-7 h-7 text-indigo-500"/>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Select a channel
              </h2>

              <p className="text-gray-500 max-w-sm">
                Choose a channel from the sidebar to start collaborating with your team.
              </p>

            </div>

          )}

        </main>

      </div>


      {/* MODALS */}

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


      {/* MOBILE OVERLAY */}

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

    </div>
  );
};

export default WorkspaceDashboard;