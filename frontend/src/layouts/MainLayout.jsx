import Navbar from "../components/Navbar";

const MainLayout = ({ children }) => {
  return (
    <>
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
