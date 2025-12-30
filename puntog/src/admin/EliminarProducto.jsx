import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/productos`);
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
        alert("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  const eliminarProducto = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este producto?"
    );
    if (!confirmar) return;

    setEliminandoId(id);

    try {
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Error al eliminar");
      }

      // quitar del estado solo si backend confirma
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el producto");
    } finally {
      setEliminandoId(null);
    }
  };

  if (loading) {
    return <p className="text-center">Cargando productos...</p>;
  }

  if (productos.length === 0) {
    return (
      <p className="text-center text-gray-500">No hay productos activos</p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Eliminar productos</h2>

      <div className="space-y-4">
        {productos.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 bg-white p-4 rounded-xl shadow"
          >
            <img
              src={p.imagen}
              alt={p.nombre}
              className="w-20 h-20 rounded-lg object-cover"
            />

            <div className="flex-1">
              <p className="font-semibold">{p.nombre}</p>
              <p className="text-sm text-gray-500">${p.precio}</p>
            </div>

            <button
              onClick={() => eliminarProducto(p.id)}
              disabled={eliminandoId === p.id}
              className={`px-4 py-2 rounded-lg text-white transition
                ${
                  eliminandoId === p.id
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
