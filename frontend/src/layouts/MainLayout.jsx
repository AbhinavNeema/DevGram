import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-[#0A0F1E] text-slate-300 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient background glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-violet-600/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute -bottom-20 left-1/3 w-[600px] h-[500px] bg-fuchsia-600/5 blur-[160px] rounded-full" />
      </div>

      {/* Frosted glass navbar */}
      <header className="sticky top-0 z-50 w-full">
        <Navbar />
      </header>

      {/* Main Content Area without wrapping card */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;