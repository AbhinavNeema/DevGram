import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

const MainLayout = ({ children }) => {
  return (
    <>
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3000,
        }}
        containerStyle={{
          top: 70, // avoids navbar overlap
        }}
        limit={1}   // 🔥 PREVENTS MULTIPLE TOASTS
      />

      <Navbar />

      <main className="pt-16 bg-[#f3f2ef] min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          {children}
        </div>
      </main>
    </>
  );
};

export default MainLayout;