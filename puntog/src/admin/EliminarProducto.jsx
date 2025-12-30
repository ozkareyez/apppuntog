import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch(
          "https://gleaming-motivation-production-4018.up.railway.app/api/productos"
        );
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;

    try {
      await fetch(
        `https://gleaming-motivation-production-4018.up.railway.app/api/productos/${id}`,
        { method: "DELETE" }
      );

      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  if (loading) {
    return <p className="text-center">Cargando productos...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto">
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
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
