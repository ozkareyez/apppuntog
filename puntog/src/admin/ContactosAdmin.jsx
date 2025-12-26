import { useEffect, useState } from "react";
import { API_URL } from "@/config";

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
      setContactos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este mensaje?")) return;

    await fetch(`${API_URL}/api/admin/contacto/${id}`, {
      method: "DELETE",
    });

    setContactos((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-10">Cargando mensajes...</p>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* TÍTULO */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">
          📩 Mensajes de contacto
        </h1>
        <p className="text-gray-600 text-sm">
          Consultas enviadas desde el formulario web
        </p>
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
              <th className="p-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {contactos.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No hay mensajes registrados
                </td>
              </tr>
            )}

            {contactos.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 text-gray-500">{c.id}</td>

                <td className="p-3 font-medium text-gray-900">{c.nombre}</td>

                <td className="p-3 text-red-600 font-medium">{c.email}</td>

                <td className="p-3 text-gray-700 max-w-md">
                  <div className="line-clamp-2 hover:line-clamp-none">
                    {c.mensaje}
                  </div>
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
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { API_URL } from "@/config";

// export default function ContactosAdmin() {
//   const [contactos, setContactos] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     cargarContactos();
//   }, []);

//   const cargarContactos = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/admin/contacto`);
//       const data = await res.json();
//       setContactos(data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const eliminar = async (id) => {
//     if (!confirm("¿Eliminar este mensaje?")) return;

//     await fetch(`${API_URL}/api/admin/contacto/${id}`, {
//       method: "DELETE",
//     });

//     setContactos(contactos.filter((c) => c.id !== id));
//   };

//   if (loading) {
//     return (
//       <p className="text-center text-gray-400 mt-10">Cargando mensajes...</p>
//     );
//   }

//   return (
//     <div className="p-6 text-white">
//       <h1 className="text-2xl font-bold mb-6">📩 Mensajes de contacto</h1>

//       <div className="bg-black/40 border border-white/10 rounded-xl shadow-xl overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="bg-white/10 text-gray-300">
//             <tr>
//               <th className="p-3 text-left">ID</th>
//               <th className="p-3 text-left">Nombre</th>
//               <th className="p-3 text-left">Email</th>
//               <th className="p-3 text-left">Mensaje</th>
//               <th className="p-3 text-center">Acciones</th>
//             </tr>
//           </thead>

//           <tbody>
//             {contactos.length === 0 && (
//               <tr>
//                 <td colSpan="5" className="p-4 text-center text-gray-400">
//                   No hay mensajes
//                 </td>
//               </tr>
//             )}

//             {contactos.map((c) => (
//               <tr
//                 key={c.id}
//                 className="border-t border-white/10 hover:bg-white/5"
//               >
//                 <td className="p-3">{c.id}</td>
//                 <td className="p-3 font-medium">{c.nombre}</td>
//                 <td className="p-3 text-pink-400">{c.email}</td>
//                 <td className="p-3 max-w-md truncate">{c.mensaje}</td>
//                 <td className="p-3 text-center">
//                   <button
//                     onClick={() => eliminar(c.id)}
//                     className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700"
//                   >
//                     Eliminar
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
