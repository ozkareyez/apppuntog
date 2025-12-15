// Dashboard.jsx
import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

import { API_URL } from "../config";

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

  const fetchPedidos = async (page = pagina) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", page);
      if (buscar) params.append("search", buscar);
      if (fechaInicio) params.append("inicio", fechaInicio);
      if (fechaFin) params.append("fin", fechaFin);

      const url = `${API_URL}/api/pedidos-completo?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();

      setPedidos(data.results || []);
      setTotalPaginas(data.totalPages || 1);
      setTotalResultados(data.total || 0);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchPedidos(1);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    fetchPedidos(pagina);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]);

  const aplicarFiltros = () => {
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setBuscar("");
    setFechaInicio("");
    setFechaFin("");
    setPagina(1);
    // fetchPedidos(1);
  };

  const eliminarPedido = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este pedido?")) return;
    try {
      const res = await fetch(`${API_URL}/api/pedidos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Pedido eliminado ✔");
        // si estamos en la última página y quedó vacío, mover a la previa
        if (pedidos.length === 1 && pagina > 1) setPagina(pagina - 1);
        else fetchPedidos(pagina);
      } else {
        const err = await res.json();
        alert("Error: " + (err.error || "no se pudo eliminar"));
      }
    } catch (err) {
      console.error(err);
      alert("Error eliminando pedido");
    }
  };

  const cambiarEstado = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/pedidos-estado/${id}`, {
        method: "PUT",
      });
      if (res.ok) {
        fetchPedidos(pagina);
      } else {
        alert("Error actualizando estado");
      }
    } catch (err) {
      console.error(err);
      alert("Error actualizando estado");
    }
  };

  const verDetalle = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/pedidos-detalle/${id}`);
      const data = await res.json();
      setDetalle({ pedidoId: id, items: data });
    } catch (err) {
      console.error("Error detalle:", err);
      alert("Error obteniendo detalle");
    }
  };

  const descargarExcel = () => {
    window.open("${API_URL}/api/exportar-pedidos-completo", "_blank");
  };

  const logout = () => {
    localStorage.removeItem("admin_auth");
    window.location.href = "/admin";
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#0B0B0F] text-white p-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Panel Administrador
          </h1>

          <div className="flex gap-3">
            <button
              onClick={descargarExcel}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition shadow"
            >
              Exportar Excel
            </button>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition shadow"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-[#12121A] border border-white/10 rounded-xl p-5 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Buscar cliente o teléfono"
              className="bg-[#0B0B0F] border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && aplicarFiltros()}
            />

            <input
              type="date"
              className="bg-[#0B0B0F] border border-white/10 rounded-lg px-3 py-2"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />

            <input
              type="date"
              className="bg-[#0B0B0F] border border-white/10 rounded-lg px-3 py-2"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />

            <button
              onClick={aplicarFiltros}
              className="bg-pink-600 hover:bg-pink-700 rounded-lg transition"
            >
              Aplicar
            </button>

            <button
              onClick={limpiarFiltros}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Limpiar
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-3">
            Resultados encontrados:{" "}
            <span className="text-white font-semibold">{totalResultados}</span>
          </p>
        </div>

        {/* TABLA */}
        <div className="bg-[#12121A] border border-white/10 rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#181824] text-gray-300">
              <tr>
                {[
                  "ID",
                  "Cliente",
                  "Teléfono",
                  "Total",
                  "Fecha",
                  "Estado",
                  "Acciones",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-400">
                    Cargando pedidos...
                  </td>
                </tr>
              )}

              {!loading && pedidos.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-400">
                    No hay resultados
                  </td>
                </tr>
              )}

              {!loading &&
                pedidos.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3">{p.id}</td>
                    <td className="px-4 py-3">{p.nombre}</td>
                    <td className="px-4 py-3">{p.telefono}</td>
                    <td className="px-4 py-3 font-semibold">${p.total}</td>
                    <td className="px-4 py-3">{p.fecha}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          p.estado === "entregado"
                            ? "bg-emerald-600/20 text-emerald-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => verDetalle(p.id)}
                        className="px-3 py-1 rounded bg-blue-600/80 hover:bg-blue-600 transition"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => cambiarEstado(p.id)}
                        className="px-3 py-1 rounded bg-purple-600/80 hover:bg-purple-600 transition"
                      >
                        Estado
                      </button>
                      <button
                        onClick={() => eliminarPedido(p.id)}
                        className="px-3 py-1 rounded bg-red-600/80 hover:bg-red-600 transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => p - 1)}
            className="px-4 py-2 rounded-lg bg-gray-700 disabled:opacity-40"
          >
            ← Anterior
          </button>

          <span className="text-gray-400">
            Página <span className="text-white">{pagina}</span> de{" "}
            <span className="text-white">{totalPaginas}</span>
          </span>

          <button
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-gray-700 disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>

        {/* MODAL DETALLE */}
        {detalle && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#12121A] rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  Pedido #{detalle.pedidoId}
                </h3>
                <button onClick={() => setDetalle(null)}>✖</button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {detalle.items.map((it, idx) => (
                  <div key={idx} className="border-b border-white/10 pb-2">
                    <p className="font-semibold">{it.producto}</p>
                    <p className="text-sm text-gray-400">
                      Cantidad: {it.cantidad} · Precio: ${it.precio} · Subtotal:
                      ${it.subtotal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
