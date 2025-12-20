import { useEffect, useState } from "react";

const API = "https://gleaming-motivation-production-4018.up.railway.app";

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarPedidos = async () => {
    try {
      const res = await fetch(`${API}/api/pedidos-completo`);
      const data = await res.json();

      if (!data.ok || !Array.isArray(data.results)) {
        throw new Error("Formato de datos inválido");
      }

      setPedidos(data.results);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // 🔁 CAMBIAR ESTADO
  const cambiarEstado = async (id) => {
    try {
      const res = await fetch(`${API}/api/pedidos-estado/${id}`, {
        method: "PUT",
      });

      const data = await res.json();
      if (!data.ok) throw new Error();

      // actualizar estado local
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                estado: p.estado === "pendiente" ? "entregado" : "pendiente",
              }
            : p
        )
      );
    } catch (err) {
      alert("Error cambiando el estado del pedido");
    }
  };

  if (loading) return <p>Cargando pedidos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📦 Pedidos</h1>

      <table className="w-full border border-white/10 text-sm">
        <thead className="bg-black/40">
          <tr>
            <th className="p-2">ID</th>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Direcion</th>
            <th>Departamento</th>
            <th>Ciudad</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody className="text-center justify-center">
          {pedidos.map((p) => (
            <tr key={p.id} className="border-t border-white/10">
              <td className="p-2 text-center">{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.telefono}</td>
              <td>{p.direccion}</td>
              <td>{p.departamento_nombre}</td>
              <td>{p.ciudad}</td>
              <td>${Number(p.total).toLocaleString()}</td>

              <td>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    p.estado === "pendiente"
                      ? "bg-yellow-500 text-black"
                      : "bg-green-500 text-black"
                  }`}
                >
                  {p.estado}
                </span>
              </td>

              <td>
                <button
                  onClick={() => cambiarEstado(p.id)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    p.estado === "pendiente"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  }`}
                >
                  {p.estado === "pendiente"
                    ? "Marcar entregado"
                    : "Marcar pendiente"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
