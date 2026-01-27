import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

import WorkspaceMembers from "./WorkspaceMembers";
import ChannelList from "../../components/workspace/ChannelList";
import ChannelChat from "../../components/workspace/ChannelChat";
const WorkspaceDashboard = () => {
  const { id } = useParams();

  const [workspace, setWorkspace] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    api.get(`/workspaces/${id}`).then(res => setWorkspace(res.data));
  }, [id]);

  if (!workspace) return null;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-lg border mb-4">
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
        <p className="text-gray-500 mt-1">{workspace.description}</p>
      </div>

      {/* TABS */}
      <div className="flex gap-6 mb-4">
        {["overview", "members", "settings"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm capitalize pb-1 border-b-2 ${
              tab === t
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT — CHANNELS */}
        <div className="col-span-3">
          <ChannelList
            workspaceId={workspace._id}
            onSelect={setActiveChannel}
          />
        </div>

        {/* CENTER — CONTENT */}
        <div className="col-span-6 bg-white rounded-lg border h-[70vh]">
          {tab === "overview" && (
            activeChannel ? (
              <ChannelChat channel={activeChannel} />
            ) : (
              <div className="p-6 text-gray-500">
                Select a channel to start chatting
              </div>
            )
          )}

          {tab === "members" && (
            <div className="p-6 text-gray-500">
              Select a member from the right panel
            </div>
          )}

          {tab === "settings" && (
            <div className="p-6 text-gray-500">
              Workspace settings coming soon
            </div>
          )}
        </div>

        {/* RIGHT — MEMBERS */}
        <div className="col-span-3">
          <WorkspaceMembers workspace={workspace} />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDashboard;