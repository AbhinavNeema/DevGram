import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white overflow-x-hidden selection:bg-indigo-200">

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-200/40 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-pink-200/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[400px] bg-purple-200/30 blur-[120px] rounded-full" />
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        gutter={10}
        containerStyle={{ top: 70 }}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            fontSize: "14px",
            padding: "10px 16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
          }
        }}
      />

      {/* Navbar */}
      <div className="sticky top-0 z-50 w-full">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-8 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

          {/* Glass content container */}
          <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-lg min-h-[calc(100vh-120px)]">
            <div className="w-full h-full p-3 sm:p-6">
              {children}
            </div>
          </div>

        </div>
      </main>

      {/* Floating System Status */}
      

    </div>
  );
};

export default MainLayout;