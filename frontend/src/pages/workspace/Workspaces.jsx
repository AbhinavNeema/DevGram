import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Plus, LayoutGrid, ChevronRight, Globe, Shield, Loader2 } from "lucide-react";

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/workspaces")
      .then(res => {
        setWorkspaces(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 p-4 sm:p-8 md:p-12 relative overflow-x-hidden">

      {/* soft ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/40 blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">

          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl mb-2">
              Workspaces
            </h1>

            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              Secure Collaborations: {workspaces.length}
            </p>
          </div>

          <button
            onClick={() => navigate("/workspaces/create")}
            className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-md transition active:scale-95"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Create Workspace
          </button>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
            <span className="text-gray-500 font-bold uppercase tracking-[0.3em] text-xs">
              Loading Workspaces
            </span>
          </div>
        )}

        {/* EMPTY */}

        {!loading && workspaces.length === 0 && (
          <div className="text-center py-32 border border-gray-200 rounded-3xl bg-white shadow-sm">

            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-6" />

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No Workspaces Yet
            </h2>

            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Create your first workspace to start collaborating with your team.
            </p>

          </div>
        )}

        {/* GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">

          {workspaces.map((ws, index) => (

            <div
              key={ws._id}
              onClick={() => navigate(`/workspaces/${ws._id}`)}
              style={{ animationDelay: `${index * 50}ms` }}
              className="group relative flex flex-col justify-between bg-white border border-gray-200 p-8 rounded-2xl cursor-pointer 
                         hover:border-indigo-300 hover:shadow-lg 
                         transition-all duration-300 hover:-translate-y-1"
            >

              {/* ICON */}

              <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-8 group-hover:bg-indigo-600 transition">

                <LayoutGrid className="w-7 h-7 text-gray-500 group-hover:text-white transition-colors"/>

              </div>

              {/* TITLE */}

              <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                {ws.name}
              </h2>

              {/* DESCRIPTION */}

              <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                {ws.description || "Collaborative development workspace."}
              </p>

              {/* FOOTER */}

              <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">

                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Open Workspace
                </span>

                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"/>

              </div>

            </div>

          ))}

        </div>

      </div>

      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

    </div>
  );
};

export default Workspaces;