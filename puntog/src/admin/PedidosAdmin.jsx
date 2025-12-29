import { useEffect, useState } from "react";
import { API_URL } from "@/config";

const ITEMS_POR_PAGINA = 10;

export default function ContactosAdmin() {
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 paginación
  const [paginaActual, setPaginaActual] = useState(1);

  // 🔹 filtro estado
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  useEffect(() => {
    cargarContactos();
  }, []);

  const cargarContactos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/contacto`);
      const data = await res.json();
      setContactos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este mensaje?")) return;

    const res = await fetch(`${API_URL}/api/admin/contacto/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!data.ok) {
      alert("Error al eliminar");
      return;
    }

    setContactos((prev) => prev.filter((c) => c.id !== id));
  };

  // 🔹 aplicar filtro por estado
  const contactosFiltrados =
    estadoFiltro === "todos"
      ? contactos
      : contactos.filter((c) => c.estado === estadoFiltro);

  // 🔹 paginación
  const totalPaginas = Math.ceil(contactosFiltrados.length / ITEMS_POR_PAGINA);

  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;

  const contactosPaginados = contactosFiltrados.slice(inicio, fin);

  // reset página al cambiar filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [estadoFiltro]);

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-10">Cargando mensajes...</p>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* TÍTULO */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            📩 Mensajes de contacto
          </h1>
          <p className="text-gray-600 text-sm">
            Consultas enviadas desde el formulario web
          </p>
        </div>

        {/* FILTRO */}
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="
            border border-gray-300
            rounded-lg
            px-4 py-2
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-red-600
          "
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="entregado">Entregados</option>
        </select>
      </div>

      {/* TABLA */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left font-semibold">ID</th>
              <th className="p-3 text-left font-semibold">Nombre</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Mensaje</th>
              <th className="p-3 text-left font-semibold">Estado</th>
              <th className="p-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {contactosPaginados.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No hay mensajes
                </td>
              </tr>
            )}

            {contactosPaginados.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 text-gray-500">{c.id}</td>

                <td className="p-3 font-medium text-gray-900">{c.nombre}</td>

                <td className="p-3 text-red-600 font-medium">{c.email}</td>

                <td className="p-3 text-gray-700 max-w-md">
                  <div className="line-clamp-2 hover:line-clamp-none">
                    {c.mensaje}
                  </div>
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      c.estado === "entregado"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {c.estado || "pendiente"}
                  </span>
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => eliminar(c.id)}
                    className="
                      px-3 py-1.5
                      rounded-lg
                      bg-red-600
                      text-white
                      font-semibold
                      hover:bg-red-700
                      transition
                    "
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
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            disabled={paginaActual === 1}
            className="
              px-4 py-2 rounded-lg border
              text-sm font-semibold
              disabled:opacity-50
              hover:bg-gray-100
            "
          >
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página <strong>{paginaActual}</strong> de {totalPaginas}
          </span>

          <button
            onClick={() =>
              setPaginaActual((p) => Math.min(p + 1, totalPaginas))
            }
            disabled={paginaActual === totalPaginas}
            className="
              px-4 py-2 rounded-lg border
              text-sm font-semibold
              disabled:opacity-50
              hover:bg-gray-100
            "
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
