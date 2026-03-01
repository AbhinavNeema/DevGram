import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { LayoutGrid, ChevronRight, Cpu, Loader2 } from "lucide-react";

const WorkspacesPage = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/workspaces")
      .then(res => {
        setWorkspaces(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-16 px-4 relative overflow-x-hidden">

      {/* ambient glow */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/40 blur-[160px]" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-200/40 blur-[160px]" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* HEADER */}

        <div className="mb-12">

          <div className="flex items-center gap-3 mb-3">

            <div className="p-2 bg-indigo-100 border border-indigo-200 rounded-xl">
              <Cpu className="w-5 h-5 text-indigo-600" />
            </div>

            <h1 className="text-3xl font-black tracking-tight">
              Workspaces
            </h1>

          </div>

          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500">
            Collaborative Development Environments
          </p>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="flex flex-col items-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              Fetching Workspaces
            </span>
          </div>
        )}

        {/* EMPTY STATE */}

        {!loading && workspaces.length === 0 && (
          <div className="text-center py-28 bg-white border border-gray-200 rounded-3xl shadow-sm">

            <LayoutGrid className="w-14 h-14 text-gray-300 mx-auto mb-6"/>

            <h3 className="text-xl font-black tracking-tight">
              No Workspaces Found
            </h3>

            <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto font-medium">
              You are not part of any workspace yet.
            </p>

          </div>
        )}

        {/* WORKSPACE GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {workspaces.map((ws, i) => (
            <div
              key={ws._id}
              onClick={() => navigate(`/workspace/${ws._id}`)}
              style={{ animationDelay: `${i * 60}ms` }}
              className="group bg-white border border-gray-200 rounded-3xl p-8 cursor-pointer
                         hover:border-indigo-300 hover:shadow-lg
                         transition-all duration-300 hover:-translate-y-1
                         animate-in fade-in slide-in-from-bottom-6"
            >

              {/* top row */}

              <div className="flex items-center justify-between mb-6">

                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:bg-indigo-600 transition">
                  <LayoutGrid className="w-5 h-5 text-gray-500 group-hover:text-white"/>
                </div>

                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">
                  WORKSPACE
                </span>

              </div>

              {/* title */}

              <h2 className="text-xl font-black mb-3 group-hover:text-indigo-600 transition-colors">
                {ws.name}
              </h2>

              {/* description */}

              <p className="text-sm text-gray-500 leading-relaxed">
                {ws.description || "Secure collaborative environment for development."}
              </p>

              {/* footer */}

              <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Open Workspace
                </span>

                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"/>

              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
};

export default WorkspacesPage;