// Dashboard.jsx
import { useEffect, useState } from "react";
import KpiCard from "./KpiCard";
import { API_URL } from "../../config";

const formatCurrency = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const [loading, setLoading] = useState(false);

  const hoy = new Date().toISOString().split("T")[0];

  const pedidosHoy = pedidos.filter((p) => p.fecha?.startsWith(hoy));

  const totalVentasHoy = pedidosHoy.reduce(
    (sum, p) => sum + Number(p.total || 0),
    0
  );

  const totalVentasPagina = pedidos.reduce(
    (sum, p) => sum + Number(p.total || 0),
    0
  );

  const ticketPromedio =
    pedidos.length > 0 ? Math.round(totalVentasPagina / pedidos.length) : 0;

  const fetchPedidos = async (page = pagina) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/pedidos-completo?page=${page}`);
      const data = await res.json();

      if (!data.ok) throw new Error("Formato inválido");

      setPedidos(data.results || []);
      setTotalPaginas(data.totalPages || 1);
      setTotalResultados(data.total || 0);
    } catch (err) {
      console.error(err);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos(pagina);
  }, [pagina]);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">📊 Dashboard</h1>
        <p className="text-gray-400 text-sm">
          Resumen general de ventas y pedidos
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Ventas hoy" value={formatCurrency(totalVentasHoy)} />
        <KpiCard title="Pedidos hoy" value={pedidosHoy.length} />
        <KpiCard
          title="Ventas (página)"
          value={formatCurrency(totalVentasPagina)}
        />
        <KpiCard
          title="Ticket promedio"
          value={formatCurrency(ticketPromedio)}
        />
      </div>

      {/* TABLA */}
      <div className="bg-[#12121A] rounded-xl border border-white/10 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="font-semibold">Pedidos recientes</h2>
          <span className="text-sm text-gray-400">
            Total: {totalResultados}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#181824] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="py-6 text-center">
                    ⏳ Cargando pedidos...
                  </td>
                </tr>
              )}

              {!loading && pedidos.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500">
                    No hay pedidos registrados
                  </td>
                </tr>
              )}

              {!loading &&
                pedidos.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-2">{p.id}</td>
                    <td className="px-4 py-2 font-medium">{p.nombre}</td>
                    <td className="px-4 py-2 text-gray-400">{p.telefono}</td>
                    <td className="px-4 py-2 text-right font-semibold text-pink-400">
                      {formatCurrency(p.total)}
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      {p.fecha?.split(" ")[0]}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="flex justify-between items-center p-4 border-t border-white/10">
          <button
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40"
          >
            ◀ Anterior
          </button>

          <span className="text-sm text-gray-400">
            Página {pagina} de {totalPaginas}
          </span>

          <button
            disabled={pagina === totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40"
          >
            Siguiente ▶
          </button>
        </div>
      </div>
    </div>
  );
}
