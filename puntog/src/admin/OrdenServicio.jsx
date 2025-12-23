import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "@/config";

export default function OrdenServicio() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/orden-servicio/${id}`)
      .then((res) => res.json())
      .then(setData);
  }, [id]);

  if (!data) return <p className="p-6">Cargando orden...</p>;

  const { pedido, productos } = data;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-black">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ORDEN DE SERVICIO</h1>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-black text-white rounded print:hidden"
        >
          Imprimir
        </button>
      </div>

      {/* INFO CLIENTE */}
      <section className="mb-6">
        <h2 className="font-semibold mb-2">Datos del Cliente</h2>
        <p>
          <b>Nombre:</b> {pedido.nombre}
        </p>
        <p>
          <b>Email:</b> {pedido.email}
        </p>
        <p>
          <b>Teléfono:</b> {pedido.telefono}
        </p>
        <p>
          <b>Dirección:</b> {pedido.direccion}
        </p>
        <p>
          <b>Ciudad:</b> {pedido.ciudad} – {pedido.departamento}
        </p>
      </section>

      {/* INFO PEDIDO */}
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

      {/* TABLA PRODUCTOS */}
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
              <td className="border p-2">${p.precio.toLocaleString()}</td>
              <td className="border p-2 text-center">{p.cantidad}</td>
              <td className="border p-2">${p.subtotal.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL */}
      <div className="text-right text-xl font-bold">
        TOTAL: ${pedido.total.toLocaleString()}
      </div>

      {/* FOOTER */}
      <div className="mt-10 text-sm text-center">Gracias por su compra</div>
    </div>
  );
}
