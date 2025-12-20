import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);

  const cargarPedidos = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/pedidos-completo?page=${p}`);
      const data = await res.json();

      if (data.ok) {
        setPedidos(data.results);
        setTotalPages(data.totalPages);
        setPage(p);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const verDetalle = async (id) => {
    const res = await fetch(`${API}/api/pedidos-detalle/${id}`);
    const data = await res.json();
    setDetalle({ id, items: data });
  };

  const cambiarEstado = async (id) => {
    await fetch(`${API}/api/pedidos-estado/${id}`, { method: "PUT" });
    cargarPedidos(page);
  };

  const eliminarPedido = async (id) => {
    if (!confirm("¿Eliminar pedido?")) return;
    await fetch(`${API}/api/pedidos/${id}`, { method: "DELETE" });
    cargarPedidos(page);
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  if (loading) return <p>Cargando pedidos...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📦 Pedidos</h1>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-white/10">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2">ID</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Ciudad</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="p-2">{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.telefono}</td>
                <td>{p.ciudad}</td>
                <td>${Number(p.total).toLocaleString()}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      p.estado === "entregado"
                        ? "bg-green-600"
                        : "bg-yellow-500"
                    }`}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="space-x-2">
                  <button
                    onClick={() => verDetalle(p.id)}
                    className="text-blue-400 hover:underline"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => cambiarEstado(p.id)}
                    className="text-yellow-400 hover:underline"
                  >
                    Estado
                  </button>
                  <button
                    onClick={() => eliminarPedido(p.id)}
                    className="text-red-400 hover:underline"
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
      <div className="flex justify-between mt-4">
        <button disabled={page <= 1} onClick={() => cargarPedidos(page - 1)}>
          ⬅ Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => cargarPedidos(page + 1)}
        >
          Siguiente ➡
        </button>
      </div>

      {/* MODAL DETALLE */}
      {detalle && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#111] p-6 rounded-xl w-[500px]">
            <h2 className="text-xl font-bold mb-4">Pedido #{detalle.id}</h2>

            <ul className="space-y-2">
              {detalle.items.map((i, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>
                    {i.producto} x{i.cantidad}
                  </span>
                  <span>${Number(i.subtotal).toLocaleString()}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setDetalle(null)}
              className="mt-4 w-full bg-pink-500 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
