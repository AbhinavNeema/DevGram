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

  if (!workspace) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#050505] overflow-hidden">
      
      {/* MAIN WORKSPACE HEADER */}
      <header className="h-16 border-b border-white/10 bg-[#0F111A] flex items-center justify-between px-4 sm:px-6 z-30 shadow-2xl">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-black text-white text-lg tracking-tighter uppercase hidden sm:block">
              {workspace.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Workspace Info</span>
          </button>
        </div>
      </header>

      {/* BODY SECTION */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* CHANNEL SIDEBAR - Responsive Toggle */}
        <aside className={`
          absolute inset-y-0 left-0 z-40 w-72 bg-[#08090D] border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.8)]" : "-translate-x-full"}
        `}>
          <ChannelList
            workspaceId={workspace._id}
            activeChannel={activeChannel}
            onSelect={(ch) => {
              setActiveChannel(ch);
              setIsMobileMenuOpen(false); // Auto-close on mobile selection
            }}
          />
        </aside>

        {/* CHAT VIEWPORT */}
        <main className="flex-1 flex flex-col bg-[#050505] relative z-10">
          {activeChannel ? (
            <>
              {/* INNER CHANNEL HEADER */}
              <div className="h-14 border-b border-white/5 bg-[#0F111A]/50 backdrop-blur-md px-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-indigo-500" />
                  <span className="font-black text-white tracking-tight uppercase text-sm">
                    {activeChannel.name}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedChannel(activeChannel);
                    setShowChannelSettings(true);
                  }}
                  className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* CHAT COMPONENT */}
              <div className="flex-1 overflow-hidden">
                <ChannelChat channel={activeChannel} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#111420] to-[#050505]">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                <ChevronRight className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter mb-2 uppercase">Ready for Deployment</h2>
              <p className="text-slate-500 text-sm max-w-xs font-medium leading-relaxed">
                Select a channel from the sidebar to begin communicating with your team.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* MODAL / SLIDE-OUT OVERLAYS */}
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

      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default WorkspaceDashboard;