import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "https://gleaming-motivation-production-4018.up.railway.app";

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarPedidos = async () => {
    try {
      const res = await fetch(`${API}/api/pedidos-completo`);

      // 🔒 VALIDACIÓN CLAVE
      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`);
      }

      const text = await res.text();

      // 🔒 Si viene HTML, lo detectamos
      if (text.startsWith("<!DOCTYPE")) {
        throw new Error("El backend devolvió HTML, no JSON");
      }

      const data = JSON.parse(text);

      if (!data.ok) {
        throw new Error("Respuesta inválida del servidor");
      }

      setPedidos(data.results);
    } catch (err) {
      console.error("ERROR PEDIDOS ADMIN:", err);
      setError("No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cambiarEstado = async (id) => {
    try {
      const res = await fetch(`${API}/api/pedidos-estado/${id}`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      if (!data.ok) throw new Error();

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
    } catch {
      alert("Error cambiando el estado");
    }
  };

  if (loading) return <p>Cargando pedidos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📦 Pedidos</h1>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm text-white">
          <thead className="bg-black/60">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Departamento</th>
              <th>Ciudad</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.map((p) => (
              <tr
                key={p.id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="p-3">{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.telefono}</td>
                <td>{p.direccion}</td>
                <td>{p.departamento_nombre || "—"}</td>
                <td>{p.ciudad_nombre || "—"}</td>

                <td className="font-semibold">
                  ${Number(p.total).toLocaleString()}
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.estado === "pendiente"
                        ? "bg-yellow-500 text-black"
                        : "bg-green-500 text-black"
                    }`}
                  >
                    {p.estado}
                  </span>
                </td>

                <td className="flex flex-col gap-2 py-2">
                  <button
                    onClick={() => cambiarEstado(p.id)}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      p.estado === "pendiente"
                        ? "bg-green-600"
                        : "bg-yellow-600"
                    }`}
                  >
                    {p.estado === "pendiente"
                      ? "Marcar entregado"
                      : "Marcar pendiente"}
                  </button>

                  <Link
                    to={`/admin/orden-servicio/${p.id}`}
                    className="text-blue-400 underline text-xs text-center"
                  >
                    Orden de Servicio
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
