import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const cargarPedidos = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/pedidos-completo?page=${p}`);
      const data = await res.json();

      if (data.ok) {
        // 🔥 CLAVE: resultados (NO results)
        setPedidos(data.resultados);
        setTotalPages(data.totalPages);
        setPage(data.page);
      }
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  if (loading) return <p>Cargando pedidos...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📦 Pedidos</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-white/10 text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2">ID</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Ciudad</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="p-2">{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.telefono}</td>
                <td>{p.ciudad || "—"}</td>
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
                <td>{new Date(p.fecha).toLocaleDateString()}</td>
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
    </div>
  );
}
