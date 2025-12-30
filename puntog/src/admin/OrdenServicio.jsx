import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "@/config";

export default function OrdenServicio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarOrden = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orden-servicio/${id}`);

        if (!res.ok) throw new Error();

        const json = await res.json();
        console.log("📦 Datos recibidos:", json); // 👈 AGREGAR ESTO
        console.log("📍 Pedido:", json.pedido); // 👈 Y ESTO
        setData(json);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la orden de servicio");
      } finally {
        setLoading(false);
      }
    };

    cargarOrden();
  }, [id]);

  // useEffect(() => {
  //   const cargarOrden = async () => {
  //     try {
  //       const res = await fetch(`${API_URL}/api/orden-servicio/${id}`);

  //       if (!res.ok) throw new Error();

  //       const json = await res.json();
  //       setData(json);
  //     } catch (err) {
  //       console.error(err);
  //       setError("No se pudo cargar la orden de servicio");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   cargarOrden();
  // }, [id]);

  if (loading) return <p className="p-6">Cargando orden...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  const { pedido, productos } = data;

  return (
    <>
      {/* BOTONES */}
      <div className="flex justify-between max-w-4xl mx-auto mb-4 print:hidden">
        <button
          onClick={() => navigate("/admin/pedidos")}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          ✖ Cerrar
        </button>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-black text-white rounded"
        >
          🖨️ Imprimir
        </button>
      </div>

      {/* ORDEN */}
      <div className="print-area p-8 max-w-4xl mx-auto bg-white text-black">
        <h1 className="text-2xl font-bold mb-6 text-center">
          ORDEN DE SERVICIO
        </h1>

        {/* CLIENTE */}
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Datos del Cliente</h2>
          <p>
            <b>Nombre:</b> {pedido.nombre}
          </p>
          <p>
            <b>Email:</b> {pedido.email || "—"}
          </p>
          <p>
            <b>Teléfono:</b> {pedido.telefono}
          </p>
          <p>
            <b>Dirección:</b> {pedido.direccion}
          </p>
          <p>
            <b>Departamento:</b> {pedido.departamento_nombre || "—"}
          </p>
          <p>
            <b>Ciudad:</b> {pedido.ciudad_nombre || "—"}
          </p>
        </section>

        {/* PEDIDO */}
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Datos del Pedido</h2>
          <p>
            <b>Pedido #:</b> {pedido.id}
          </p>
          <p>
            <b>Fecha:</b> {pedido.fecha}
          </p>
          <p>
            <b>Estado:</b> {pedido.estado}
          </p>
        </section>

        {/* PRODUCTOS */}
        <table className="w-full border border-black border-collapse mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Producto</th>
              <th className="border p-2">Precio</th>
              <th className="border p-2">Cantidad</th>
              <th className="border p-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p, i) => (
              <tr key={i}>
                <td className="border p-2">{p.nombre}</td>
                <td className="border p-2">
                  ${Number(p.precio).toLocaleString()}
                </td>
                <td className="border p-2 text-center">{p.cantidad}</td>
                <td className="border p-2">
                  ${Number(p.subtotal).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALES */}
        <div className="text-right space-y-1">
          {/* <p>Subtotal: ${Number(pedido.subtotal || 0).toLocaleString()}</p> */}
          <p>Envío: ${Number(pedido.costo_envio || 0).toLocaleString()}</p>
          <p className="text-xl font-bold">
            TOTAL: ${Number(pedido.total).toLocaleString()}
          </p>
        </div>

        <div className="mt-10 text-sm text-center">Gracias por su compra</div>
      </div>
    </>
  );
}
