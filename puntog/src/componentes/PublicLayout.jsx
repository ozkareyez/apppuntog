export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
