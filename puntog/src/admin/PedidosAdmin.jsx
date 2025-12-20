import { useEffect, useState } from "react";

const API = "https://gleaming-motivation-production-4018.up.railway.app";

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPedidos = async () => {
    try {
      const res = await fetch(`${API}/api/pedidos-completo`);
      const text = await res.text();

      // 🔍 DEBUG CLAVE
      if (text.startsWith("<!DOCTYPE")) {
        throw new Error("El backend respondió HTML, no JSON");
      }

      const data = JSON.parse(text);

      if (data.ok) {
        setPedidos(data.resultados);
      }
    } catch (error) {
      console.error("Error cargando pedidos:", error.message);
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

      {pedidos.length === 0 ? (
        <p>No hay pedidos</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.telefono}</td>
                <td>${Number(p.total).toLocaleString()}</td>
                <td>{p.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
