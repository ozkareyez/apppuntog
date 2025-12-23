import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function EnvioModal({ cerrar }) {
  const { setCiudad } = useCart();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Datos de envío</h3>
          <button onClick={cerrar}>
            <X />
          </button>
        </div>

        <select
          className="w-full border p-3 rounded"
          onChange={(e) => setCiudad(e.target.value)}
        >
          <option value="Cali">Cali</option>
          <option value="Otra">Otra ciudad</option>
        </select>

        <button
          className="w-full bg-green-600 text-white py-3 rounded font-semibold"
          onClick={() => alert("Aquí va WhatsApp + BD")}
        >
          Enviar pedido
        </button>
      </div>
    </div>
  );
}
