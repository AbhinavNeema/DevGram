import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

const MainLayout = ({ children }) => {
  return (
    /* We use 'overflow-x-hidden' to prevent horizontal jitter while allowing vertical scroll */
    <div className="relative min-h-screen bg-[#050505] selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* RADIANT BACKGROUND EFFECTS - Changed to 'fixed' to stay put during scroll */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <Toaster
        position="top-right"
        gutter={12}
        containerStyle={{ top: 80 }}
        toastOptions={{
          duration: 3500,
          style: {
            background: "#161925",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            fontSize: "14px",
            padding: "12px 20px",
          },
        }}
        limit={1}
      />

      <div className="fixed top-0 w-full z-50">
        <Navbar />
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="relative pt-24 pb-12 min-h-screen z-10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          {/* FIX: Removed the hard 'h-full' and 'overflow-hidden'.
              Now the container expands based on the children's height.
          */}
          <div className="w-full bg-[#0F111A]/40 backdrop-blur-md rounded-[40px] border border-white/5 shadow-2xl flex flex-col min-h-[calc(100vh-160px)]">
            <div className="flex-1 w-full h-full p-1 sm:p-2">
               {children}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <div className="fixed bottom-6 right-8 pointer-events-none hidden lg:block z-20">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/5 opacity-40 hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] text-white uppercase tracking-[0.3em] font-black">
            Systems Nominal
          </span>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;