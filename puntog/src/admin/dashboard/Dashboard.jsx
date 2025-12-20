// Dashboard.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../../config";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  // filtros
  const [buscar, setBuscar] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // modal
  const [detalle, setDetalle] = useState(null);

  const fetchPedidos = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (buscar.trim()) params.append("search", buscar.trim());
      if (fechaInicio) params.append("inicio", fechaInicio);
      if (fechaFin) params.append("fin", fechaFin);

      const res = await fetch(
        `${API_URL}/api/pedidos-completo?${params.toString()}`
      );

      const data = await res.json();

      if (!Array.isArray(data.results)) {
        throw new Error("Formato de datos inválido");
      }

      setPedidos(data.results);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 carga inicial
  useEffect(() => {
    fetchPedidos();
  }, []);

  // 🔹 volver a buscar cuando cambian filtros
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchPedidos();
    }, 500); // debounce

    return () => clearTimeout(delay);
  }, [buscar, fechaInicio, fechaFin]);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Panel Administrador</h1>

      {/* ================= FILTROS ================= */}
      <div className="bg-[#12121A] p-4 rounded-xl border border-white/10 grid md:grid-cols-4 gap-4 mb-6">
        {/* BUSCADOR */}
        <input
          type="text"
          placeholder="Buscar cliente o teléfono"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="bg-black/50 border border-white/10 rounded px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        {/* FECHA INICIO */}
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="bg-black/50 border border-white/10 rounded px-3 py-2
                     text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          style={{ colorScheme: "dark" }}
        />

        {/* FECHA FIN */}
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="bg-black/50 border border-white/10 rounded px-3 py-2
                     text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          style={{ colorScheme: "dark" }}
        />

        <button
          onClick={fetchPedidos}
          className="bg-pink-500 hover:bg-pink-600 rounded px-4 py-2 font-semibold"
        >
          🔍 Buscar
        </button>
      </div>

      {/* ================= EXCEL ================= */}
      <div className="mb-4 flex justify-end">
        <a
          href={`${API_URL}/api/exportar-pedidos-completo`}
          target="_blank"
          rel="noreferrer"
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-sm font-semibold"
        >
          📥 Descargar Excel
        </a>
      </div>

      {/* ================= TABLA ================= */}
      <div className="bg-[#12121A] rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#181824]">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Teléfono</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="text-center py-6">
                  Cargando pedidos...
                </td>
              </tr>
            )}

            {!loading && pedidos.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-white/50">
                  No hay pedidos
                </td>
              </tr>
            )}

            {!loading &&
              pedidos.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">{p.nombre}</td>
                  <td className="px-4 py-2">{p.telefono}</td>
                  <td className="px-4 py-2">${p.total}</td>

                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          p.estado === "pendiente"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                    >
                      {p.estado}
                    </span>
                  </td>

                  <td className="px-4 py-2">{p.fecha}</td>

                  <td className="px-4 py-2">
                    <button
                      onClick={() => setDetalle(p)}
                      className="text-pink-400 hover:underline"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {detalle && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#12121A] w-full max-w-lg rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Pedido #{detalle.id}</h3>

            <p>
              <b>Cliente:</b> {detalle.nombre}
            </p>
            <p>
              <b>Teléfono:</b> {detalle.telefono}
            </p>
            <p>
              <b>Total:</b> ${detalle.total}
            </p>
            <p>
              <b>Estado:</b> {detalle.estado}
            </p>
            <p>
              <b>Fecha:</b> {detalle.fecha}
            </p>

            <button
              onClick={() => setDetalle(null)}
              className="mt-6 w-full bg-pink-500 hover:bg-pink-600 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
