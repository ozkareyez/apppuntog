import { useEffect, useState } from "react";
import API_URL from "../config";

export default function ContactosAdmin() {
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarContactos();
  }, []);

  const cargarContactos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/contacto`);
      const data = await res.json();
      setContactos(data);
    } catch (error) {
      console.error("Error cargando contactos:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este mensaje?")) return;

    try {
      await fetch(`${API_URL}/api/admin/contacto/${id}`, {
        method: "DELETE",
      });

      // quitar del estado sin recargar
      setContactos(contactos.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error eliminando contacto:", error);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Cargando mensajes...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📩 Mensajes de contacto</h1>

      {contactos.length === 0 ? (
        <p>No hay mensajes</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Nombre</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Mensaje</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contactos.map((c) => (
                <tr key={c.id} className="odd:bg-gray-800 even:bg-gray-700">
                  <td className="p-2 border text-white">{c.id}</td>
                  <td className="p-2 border text-white">{c.nombre}</td>
                  <td className="p-2 border text-white">{c.email}</td>
                  <td className="p-2 border text-white">{c.mensaje}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => eliminar(c.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
