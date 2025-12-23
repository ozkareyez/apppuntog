import { useEffect, useState } from "react";
import { API_URL } from "@/config";

export default function FormularioEnvio({ onSubmit }) {
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    departamento: "",
    ciudad: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/api/departamentos`)
      .then((res) => res.json())
      .then(setDepartamentos)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!formData.departamento) {
      setCiudades([]);
      return;
    }

    fetch(`${API_URL}/api/ciudades?departamento_id=${formData.departamento}`)
      .then((res) => res.json())
      .then(setCiudades)
      .catch(console.error);
  }, [formData.departamento]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-3 bg-gray-100 p-3 rounded mt-4"
    >
      <input
        placeholder="Nombre completo"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        required
      />

      <input
        placeholder="Teléfono"
        value={formData.telefono}
        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
        required
      />

      <input
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <input
        placeholder="Dirección"
        value={formData.direccion}
        onChange={(e) =>
          setFormData({ ...formData, direccion: e.target.value })
        }
        required
      />

      <select
        value={formData.departamento}
        onChange={(e) =>
          setFormData({
            ...formData,
            departamento: e.target.value,
            ciudad: "",
          })
        }
        required
      >
        <option value="">Departamento *</option>
        {departamentos.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nombre}
          </option>
        ))}
      </select>

      <select
        value={formData.ciudad}
        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
        required
        disabled={!ciudades.length}
      >
        <option value="">Ciudad *</option>
        {ciudades.map((c) => (
          <option key={c.id} value={c.nombre}>
            {c.nombre}
          </option>
        ))}
      </select>

      <button className="bg-black text-white w-full py-2 rounded">
        Enviar pedido
      </button>
    </form>
  );
}
