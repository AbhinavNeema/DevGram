import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ChannelList from "../../components/workspace/ChannelList";
import ChannelChat from "../../components/workspace/ChannelChat";
import WorkspaceInfo from "../../components/workspace/WorkspaceInfo";
import ChannelSettings from "../../components/workspace/ChannelSettings.jsx";
import { Info, Settings, Layout, Hash, ChevronRight, Menu, X, MessageSquareCode } from "lucide-react";
import toast from "react-hot-toast";

const WorkspaceDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch workspace details
  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await api.get(`/workspaces/${id}`);
      setWorkspace(res.data);
    } catch (err) {
      console.error("Failed to load workspace", err);
      toast.error("Workspace access error");
      navigate("/workspaces");
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  // Fetch channels for this workspace
  const fetchChannels = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingChannels(true);
      const res = await api.get(`/channels/${id}`);
      const chList = res.data || [];
      setChannels(chList);

      // Auto-select general or first channel if none active
      setActiveChannel((prev) => {
        if (prev && chList.some((c) => c._id === prev._id)) {
          // Keep current active channel updated
          return chList.find((c) => c._id === prev._id);
        }
        const general = chList.find((c) => c.name === "general");
        return general || chList[0] || null;
      });
    } catch (err) {
      console.error("Failed to fetch channels", err);
    } finally {
      setLoadingChannels(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels, refreshTrigger]);

  // Handle Channel Deletion callback
  const handleChannelDeleted = (deletedChannelId) => {
    setChannels((prev) => prev.filter((c) => c._id !== deletedChannelId));
    if (activeChannel?._id === deletedChannelId) {
      const remaining = channels.filter((c) => c._id !== deletedChannelId);
      const nextActive = remaining.find((c) => c.name === "general") || remaining[0] || null;
      setActiveChannel(nextActive);
    }
    setShowChannelSettings(false);
    setSelectedChannel(null);
    toast.success("Channel deleted");
  };

  // Handle Channel Rename / Description Update callback
  const handleChannelUpdated = (updatedChannel) => {
    setChannels((prev) =>
      prev.map((c) => (c._id === updatedChannel._id ? updatedChannel : c))
    );
    if (activeChannel?._id === updatedChannel._id) {
      setActiveChannel(updatedChannel);
    }
    setShowChannelSettings(false);
    setSelectedChannel(null);
    toast.success("Channel updated");
  };

  // Handle Channel Created callback
  const handleChannelCreated = (newChannel) => {
    setChannels((prev) => [...prev, newChannel]);
    setActiveChannel(newChannel);
  };

  if (!workspace) {
    return (
      <div className="h-[calc(100vh-73px)] bg-[#0A0F1E] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
          Loading Workspace...
        </span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col bg-[#0A0F1E] overflow-hidden text-white relative">
      {/* WORKSPACE SUB-NAVBAR HEADER */}
      <header className="h-16 shrink-0 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-20">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-xl transition"
            title="Toggle Channels"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Workspace Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Layout className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                  {workspace.name}
                </h1>
                <span className="hidden sm:inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-2 py-0.5 text-[10px] font-medium">
                  Workspace
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-sm">
                {workspace.description || "DevGram Collaborative Space"}
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Info Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] text-xs font-medium transition-all duration-300"
          >
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Workspace Info</span>
          </button>
        </div>
      </header>

      {/* BODY LAYOUT: SIDEBAR + CHAT AREA */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* CHANNELS SIDEBAR */}
        <aside
          className={`
            fixed lg:static inset-y-16 lg:inset-y-0 left-0 z-30 w-72 lg:w-80 bg-[#0A0F1E] lg:bg-white/[0.02] border-r border-white/[0.06] backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <ChannelList
            workspaceId={workspace._id}
            channels={channels}
            loading={loadingChannels}
            activeChannel={activeChannel}
            onSelect={(ch) => {
              setActiveChannel(ch);
              setIsMobileMenuOpen(false);
            }}
            onChannelCreated={handleChannelCreated}
          />
        </aside>

        {/* MOBILE OVERLAY BACKDROP */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* ACTIVE CHANNEL CHAT AREA */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0A0F1E] relative">
          {activeChannel ? (
            <>
              {/* Channel Header Bar */}
              <div className="h-14 shrink-0 border-b border-white/[0.06] bg-white/[0.01] backdrop-blur-md px-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <span>{activeChannel.name}</span>
                  {activeChannel.description && (
                    <span className="text-xs text-slate-500 font-normal hidden md:inline truncate max-w-md ml-2 border-l border-white/[0.08] pl-3">
                      {activeChannel.description}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedChannel(activeChannel);
                    setShowChannelSettings(true);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.06] transition"
                  title="Channel Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Viewport */}
              <div className="flex-1 overflow-hidden">
                <ChannelChat channel={activeChannel} />
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5 text-indigo-400">
                <MessageSquareCode className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Select a channel</h2>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                Choose a channel from the sidebar or create a new one to start collaborating with your team.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* SLIDE-OVER PANELS */}
      {showInfo && (
        <WorkspaceInfo
          workspace={workspace}
          onClose={() => setShowInfo(false)}
          onWorkspaceUpdated={(updatedWs) => setWorkspace(updatedWs)}
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
          onChannelDeleted={handleChannelDeleted}
          onChannelUpdated={handleChannelUpdated}
        />
      )}
    </div>
  );
};

export default WorkspaceDashboard;