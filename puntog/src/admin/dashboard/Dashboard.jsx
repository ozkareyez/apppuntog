// Dashboard.jsx
import { useEffect, useState } from "react";
import KpiCard from "./KpiCard";
import VentasPorDia from "./VentasPorDia";
import { API_URL } from "../../config";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [buscar, setBuscar] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);

  const hoy = new Date().toISOString().split("T")[0];

  const pedidosHoy = pedidos.filter((p) => p.fecha?.startsWith(hoy));

  const totalVentasHoy = pedidosHoy.reduce(
    (sum, p) => sum + Number(p.total || 0),
    0
  );

  const totalVentasMes = pedidos.reduce(
    (sum, p) => sum + Number(p.total || 0),
    0
  );

  const ticketPromedio =
    pedidos.length > 0 ? Math.round(totalVentasMes / pedidos.length) : 0;

  const fetchPedidos = async (page = pagina) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", page);
      if (buscar) params.append("search", buscar);
      if (fechaInicio) params.append("inicio", fechaInicio);
      if (fechaFin) params.append("fin", fechaFin);

      const res = await fetch(
        `${API_URL}/api/pedidos-completo?${params.toString()}`
      );
      const data = await res.json();

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
    // eslint-disable-next-line
  }, [pagina]);

  const ventasPorDia = Object.values(
    pedidos.reduce((acc, p) => {
      const f = p.fecha?.split(" ")[0];
      if (!f) return acc;
      if (!acc[f]) acc[f] = { fecha: f, total: 0 };
      acc[f].total += Number(p.total || 0);
      return acc;
    }, {})
  );

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white p-6">
      <h1 className="text-3xl font-bold mb-8">Panel Administrador</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* <KpiCard title="Ventas hoy" value={`$${totalVentasHoy}`} />
        <KpiCard title="Pedidos hoy" value={pedidosHoy.length} />
        <KpiCard title="Ventas mes" value={`$${totalVentasMes}`} />
        <KpiCard title="Ticket promedio" value={`$${ticketPromedio}`} /> */}

        <div className="text-white">
          <h1>Dashboard OK</h1>
        </div>
      </div>

      {/* <VentasPorDia data={ventasPorDia} /> */}

      {/* TABLA */}
      <div className="bg-[#12121A] mt-8 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#181824]">
            <tr>
              {["ID", "Cliente", "Teléfono", "Total", "Fecha"].map((h) => (
                <th key={h} className="px-4 py-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="py-6 text-center">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading &&
              pedidos.map((p) => (
                <tr key={p.id} className="border-t border-white/10">
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">{p.nombre}</td>
                  <td className="px-4 py-2">{p.telefono}</td>
                  <td className="px-4 py-2">${p.total}</td>
                  <td className="px-4 py-2">{p.fecha}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
