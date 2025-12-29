import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "https://gleaming-motivation-production-4018.up.railway.app";

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filtros
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  // 🔥 paginación REAL
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargarPedidos = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/pedidos-completo?page=${page}`);

      if (!res.ok) throw new Error();

      const data = await res.json();
      if (!data.ok) throw new Error();

      let resultados = data.results;

      // 🔹 filtro estado en frontend
      if (estadoFiltro !== "todos") {
        resultados = resultados.filter((p) => p.estado === estadoFiltro);
      }

      setPedidos(resultados);
      setPaginaActual(data.page);
      setTotalPaginas(data.totalPages);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos(paginaActual);
  }, [paginaActual, estadoFiltro]);

  const cambiarEstado = async (id) => {
    try {
      const res = await fetch(`${API}/api/pedidos-estado/${id}`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error();

      cargarPedidos(paginaActual);
    } catch {
      alert("Error cambiando el estado");
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">Cargando pedidos...</p>
    );

  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📦 Pedidos</h1>
          <p className="text-gray-500 text-sm">Gestión de pedidos realizados</p>
        </div>

        {/* FILTRO */}
        <select
          value={estadoFiltro}
          onChange={(e) => {
            setEstadoFiltro(e.target.value);
            setPaginaActual(1);
          }}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="entregado">Entregados</option>
        </select>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-red-50 text-red-700">
            <tr>
              <th className="p-3">ID</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Depto</th>
              <th>Ciudad</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-semibold">{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.telefono}</td>
                <td className="truncate max-w-xs">{p.direccion}</td>
                <td>{p.departamento_nombre}</td>
                <td>{p.ciudad_nombre}</td>
                <td className="font-bold text-red-600">
                  ${Number(p.total).toLocaleString()}
                </td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      p.estado === "pendiente"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="flex flex-col gap-2 p-3">
                  <button
                    onClick={() => cambiarEstado(p.id)}
                    className="text-xs bg-black text-white rounded px-3 py-1"
                  >
                    Cambiar estado
                  </button>

                  <Link
                    to={`/admin/orden-servicio/${p.id}`}
                    className="text-red-600 text-xs underline text-center"
                  >
                    Ver orden
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual((p) => p - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-sm">
          Página <strong>{paginaActual}</strong> de {totalPaginas}
        </span>

        <button
          disabled={paginaActual === totalPaginas}
          onClick={() => setPaginaActual((p) => p + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// const API = "https://gleaming-motivation-production-4018.up.railway.app";

// export default function PedidosAdmin() {
//   const [pedidos, setPedidos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const cargarPedidos = async () => {
//     try {
//       const res = await fetch(`${API}/api/pedidos-completo`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);

//       const text = await res.text();
//       if (text.startsWith("<!DOCTYPE")) {
//         throw new Error("Respuesta HTML inesperada");
//       }

//       const data = JSON.parse(text);
//       if (!data.ok) throw new Error("Respuesta inválida");

//       setPedidos(data.results);
//     } catch (err) {
//       console.error(err);
//       setError("No se pudieron cargar los pedidos");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     cargarPedidos();
//   }, []);

//   const cambiarEstado = async (id) => {
//     try {
//       const res = await fetch(`${API}/api/pedidos-estado/${id}`, {
//         method: "PUT",
//       });

//       if (!res.ok) throw new Error();

//       const data = await res.json();
//       if (!data.ok) throw new Error();

//       setPedidos((prev) =>
//         prev.map((p) =>
//           p.id === id
//             ? {
//                 ...p,
//                 estado: p.estado === "pendiente" ? "entregado" : "pendiente",
//               }
//             : p
//         )
//       );
//     } catch {
//       alert("Error cambiando el estado");
//     }
//   };

//   if (loading)
//     return (
//       <p className="text-center text-gray-500 mt-10">Cargando pedidos...</p>
//     );

//   if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

//   return (
//     <div className="p-6 bg-gray-100 min-h-full">
//       {/* HEADER */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">📦 Pedidos</h1>
//         <p className="text-gray-500 text-sm">Gestión de pedidos realizados</p>
//       </div>

//       {/* TABLA */}
//       <div className="bg-white border border-gray-200 rounded-xl shadow overflow-x-auto">
//         <table className="w-full text-sm text-gray-700">
//           <thead className="bg-red-50 text-red-700">
//             <tr>
//               <th className="p-3 text-left">ID</th>
//               <th>Cliente</th>
//               <th>Teléfono</th>
//               <th>Dirección</th>
//               <th>Depto</th>
//               <th>Ciudad</th>
//               <th>Total</th>
//               <th>Estado</th>
//               <th className="text-center">Acciones</th>
//             </tr>
//           </thead>

//           <tbody>
//             {pedidos.map((p) => (
//               <tr
//                 key={p.id}
//                 className="border-t border-gray-200 hover:bg-gray-50"
//               >
//                 <td className="p-3 font-semibold">{p.id}</td>
//                 <td>{p.nombre}</td>
//                 <td>{p.telefono}</td>
//                 <td className="max-w-xs truncate">{p.direccion}</td>
//                 <td>{p.departamento_nombre || "—"}</td>
//                 <td>{p.ciudad_nombre || "—"}</td>

//                 <td className="font-bold text-red-600">
//                   ${Number(p.total).toLocaleString()}
//                 </td>

//                 <td>
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                       p.estado === "pendiente"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : "bg-green-100 text-green-800"
//                     }`}
//                   >
//                     {p.estado}
//                   </span>
//                 </td>

//                 <td className="p-3">
//                   <div className="flex flex-col gap-2">
//                     <button
//                       onClick={() => cambiarEstado(p.id)}
//                       className={`px-3 py-1 rounded text-xs font-medium transition ${
//                         p.estado === "pendiente"
//                           ? "bg-green-600 text-white hover:bg-green-700"
//                           : "bg-yellow-500 text-white hover:bg-yellow-600"
//                       }`}
//                     >
//                       {p.estado === "pendiente"
//                         ? "Marcar entregado"
//                         : "Marcar pendiente"}
//                     </button>

//                     <Link
//                       to={`/admin/orden-servicio/${p.id}`}
//                       className="text-red-600 hover:text-red-800 underline text-xs text-center"
//                     >
//                       Ver orden de servicio
//                     </Link>
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {pedidos.length === 0 && (
//               <tr>
//                 <td colSpan="9" className="p-6 text-center text-gray-500">
//                   No hay pedidos registrados
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
