import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
