// Dashboard.jsx
import { useEffect, useState } from "react";
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

      const url = `${API_URL}/api/pedidos-completo`;
      const res = await fetch(url);
      const data = await res.json();
      setPedidos(data.results || []);
      setTotalPaginas(data.totalPages || 1);
      setTotalResultados(data.total || 0);
      setPagina(data.page || page);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPedidos(pagina);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]);

  const aplicarFiltros = () => {
    setPagina(1);
    fetchPedidos(1);
  };

  const limpiarFiltros = () => {
    setBuscar("");
    setFechaInicio("");
    setFechaFin("");
    setPagina(1);
    fetchPedidos(1);
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
      const res = await fetch(`http://${API_URL}/api/pedidos-estado/${id}`, {
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
      const res = await fetch(`http://${API_URL}/api/pedidos-detalle/${id}`);
      const data = await res.json();
      setDetalle({ pedidoId: id, items: data });
    } catch (err) {
      console.error("Error detalle:", err);
      alert("Error obteniendo detalle");
    }
  };

  const descargarExcel = () => {
    window.open("http://${API_URL}/api/exportar-pedidos-completo", "_blank");
  };

  const logout = () => {
    localStorage.removeItem("admin_auth");
    window.location.href = "/admin";
  };

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel Administrador</h1>

        <div className="flex gap-3">
          <button
            onClick={descargarExcel}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Exportar pedidos
          </button>

          <button onClick={logout} className="bg-red-500 px-4 py-2 rounded">
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 p-4 rounded mb-5">
        <div className="flex gap-3 flex-wrap items-center">
          <input
            type="text"
            placeholder="Buscar cliente o teléfono"
            className="p-2 rounded bg-gray-700"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") aplicarFiltros();
            }}
          />

          <div>
            <label className="text-sm block">Fecha inicio</label>
            <input
              type="date"
              className="p-2 rounded bg-gray-700"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm block">Fecha fin</label>
            <input
              type="date"
              className="p-2 rounded bg-gray-700"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={aplicarFiltros}
              className="bg-blue-600 px-4 py-2 rounded"
            >
              Aplicar
            </button>
            <button
              onClick={limpiarFiltros}
              className="bg-gray-600 px-4 py-2 rounded"
            >
              Limpiar
            </button>
          </div>
        </div>

        <p className="text-sm mt-2">Resultados: {totalResultados}</p>
      </div>

      {/* Tabla */}
      <h2 className="text-xl font-semibold mb-3">Pedidos</h2>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Teléfono</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Fecha</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  Cargando...
                </td>
              </tr>
            )}

            {!loading && pedidos.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  No hay resultados
                </td>
              </tr>
            )}

            {!loading &&
              pedidos.map((p) => (
                <tr key={p.id} className="odd:bg-gray-800 even:bg-gray-700">
                  <td className="p-2 border">{p.id}</td>
                  <td className="p-2 border">{p.nombre}</td>
                  <td className="p-2 border">{p.telefono}</td>
                  <td className="p-2 border">${p.total}</td>
                  <td className="p-2 border">{p.fecha}</td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        p.estado === "entregado"
                          ? "bg-green-600"
                          : "bg-yellow-600"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td className="p-2 border flex gap-2">
                    <button
                      className="bg-blue-600 px-3 py-1 rounded"
                      onClick={() => verDetalle(p.id)}
                    >
                      Ver
                    </button>

                    <button
                      className="bg-purple-600 px-3 py-1 rounded"
                      onClick={() => cambiarEstado(p.id)}
                    >
                      Estado
                    </button>

                    <button
                      className="bg-red-600 px-3 py-1 rounded"
                      onClick={() => eliminarPedido(p.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center gap-4 mt-4 items-center">
        <button
          disabled={pagina <= 1}
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
          className="bg-gray-600 px-3 py-1 rounded disabled:opacity-40"
        >
          ← Anterior
        </button>

        <span>
          Página {pagina} de {totalPaginas}
        </span>

        <button
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          className="bg-gray-600 px-3 py-1 rounded disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>

      {/* Modal Detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Detalle del pedido #{detalle.pedidoId}
              </h3>
              <button className="text-white" onClick={() => setDetalle(null)}>
                Cerrar ✖
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {detalle.items.map((it, idx) => (
                <div key={idx} className="border-b border-gray-700 py-2">
                  <p>
                    <strong>{it.producto}</strong>
                  </p>
                  <p>
                    Cantidad: {it.cantidad} — Precio: ${it.precio} — Subtotal: $
                    {it.subtotal}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="bg-gray-600 px-4 py-2 rounded"
                onClick={() => setDetalle(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
