import { useEffect, useState } from "react";
import API_URL from "../config";

export default function ContactosAdmin() {
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/contacto`)
      .then((res) => res.json())
      .then((data) => {
        setContactos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando contactos:", err);
        setLoading(false);
      });
  }, []);

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
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Nombre</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {contactos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-2 border bg-white text-black">{c.id}</td>
                  <td className="p-2 border bg-white text-black">{c.nombre}</td>
                  <td className="p-2 border bg-white text-black">{c.email}</td>
                  <td className="p-2 border bg-white text-black">
                    {c.mensaje}
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
