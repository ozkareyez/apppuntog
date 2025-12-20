import { useEffect, useState } from "react";

const API = "https://gleaming-motivation-production-4018.up.railway.app";

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const res = await fetch(`${API}/api/pedidos-completo`);
        const data = await res.json();

        // 🔐 VALIDACIÓN CLAVE
        if (!data.ok || !Array.isArray(data.results)) {
          throw new Error("Formato de datos inválido");
        }

        setPedidos(data.results);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los pedidos");
        setPedidos([]); // 🔥 evita undefined
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  if (loading) return <p>Cargando pedidos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

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
              <th>Direccion</th>
              <th>Departamento</th>
              <th>Ciudad</th>
              <th>Fecha</th>
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
                <td>{p.direccion}</td>
                <td>{p.departamento}</td>
                <td>{p.ciudad}</td>
                <td>{p.fecha}</td>
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
