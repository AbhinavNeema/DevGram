import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:via-violet-950/30 dark:to-slate-950" />

        {/* Animated mesh gradient */}
        <div className="absolute inset-0 gradient-mesh-animated opacity-80" />

        {/* Large floating orbs with blur */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-pink-500/30 rounded-full blur-[150px] animate-float opacity-60" />
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/25 via-blue-500/20 to-purple-500/25 rounded-full blur-[120px] animate-float opacity-50" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-br from-pink-500/25 via-rose-500/20 to-violet-500/25 rounded-full blur-[140px] animate-float opacity-45" style={{ animationDelay: '-4s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-indigo-500/20 rounded-full blur-[100px] animate-float opacity-40" style={{ animationDelay: '-1s' }} />

        {/* Smaller accent orbs */}
        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-gradient-to-br from-fuchsia-500/40 to-purple-500/40 rounded-full blur-[60px] animate-float-slow opacity-50" style={{ animationDelay: '-3s' }} />
        <div className="absolute bottom-1/2 left-1/3 w-[250px] h-[250px] bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-[50px] animate-float-slow opacity-40" style={{ animationDelay: '-5s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Vignette effect */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.05) 100%)'
        }} />
      </div>

      {/* Floating particles (decorative) */}
      <div className="fixed inset-0 pointer-events-none -z-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-float"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + i * 15}%`,
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              opacity: 0.3 + (i % 3) * 0.1,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${8 + i}s`
            }}
          />
        ))}
      </div>

      {/* Toast notifications with modern styling */}
      <Toaster
        position="top-right"
        gutter={12}
        containerStyle={{ top: 20 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.95))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: '20px',
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px 20px',
            boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(124, 58, 237, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Content container with glass effect */}
          <div className="relative">
            {/* Glow effect behind container */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 rounded-[2rem] blur-xl opacity-50" />

            {/* Main glass container */}
            <div className="relative glass-card p-1.5">
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[1.4rem] shadow-2xl">
                {/* Top gradient border */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[1.4rem] bg-gradient-to-r from-violet-500 via-purple-500 via-pink-500 to-rose-500" />

                <div className="p-6 sm:p-8 lg:p-10">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 to-transparent pointer-events-none" />
    </div>
  );
};

export default MainLayout;