import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import ChannelList from "../../components/workspace/ChannelList";
import ChannelChat from "../../components/workspace/ChannelChat";
import WorkspaceInfo from "../../components/workspace/WorkspaceInfo";
import ChannelSettings from "../../components/workspace/ChannelSettings.jsx";
import { Info, Settings, Layout, Hash, ChevronRight, Menu, Loader2 } from "lucide-react";

const WorkspaceDashboard = () => {
  const { id } = useParams();

  const [workspace, setWorkspace] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/workspaces/${id}`);
        setWorkspace(res.data);
      } catch (err) {
        console.error("Failed to load workspace:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchWorkspace();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent animate-ping opacity-20" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
          </div>
          <span className="text-sm text-slate-500 font-medium">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Workspace not found</h2>
          <p className="text-sm text-slate-500">The workspace may have been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white/50 dark:bg-slate-900/50 overflow-hidden">

      {/* HEADER */}

      <header className="h-16 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            <Menu className="w-6 h-6"/>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layout className="w-5 h-5 text-white"/>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-lg">
                {workspace.name}
              </h1>
              <p className="text-xs text-slate-500">{workspace.members?.length || 0} members</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 transition-all backdrop-blur-sm"
        >
          <Info className="w-4 h-4"/>
          <span className="hidden sm:inline">Info</span>
        </button>
      </header>


      {/* BODY */}

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}

        <aside
          className={`
            absolute inset-y-0 left-0 z-40 w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 transform transition-transform duration-300
            lg:relative lg:translate-x-0
            ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
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

              <div className="h-14 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 px-6 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-primary"/>
                  </div>
                  {activeChannel.name}
                </div>

                <button
                  onClick={() => {
                    setSelectedChannel(activeChannel);
                    setShowChannelSettings(true);
                  }}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/5 transition-all"
                >
                  <Settings className="w-4 h-4"/>
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <ChannelChat channel={activeChannel}/>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5">
                <ChevronRight className="w-7 h-7 text-slate-400"/>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Select a channel
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default WorkspaceDashboard;