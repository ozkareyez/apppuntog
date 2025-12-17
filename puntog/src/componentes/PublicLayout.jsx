import { Outlet } from "react-router-dom";

// IMPORTS COMPONENTES
import Navbar from "./Navbar/Navbar"; // Asegúrate que la ruta sea correcta
import Foter from "./Foter"; // Si Foter está en la misma carpeta "componentes"

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <Foter />
    </div>
  );
}
