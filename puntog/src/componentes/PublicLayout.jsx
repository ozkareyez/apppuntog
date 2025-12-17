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
