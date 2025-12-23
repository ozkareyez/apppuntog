export default function FormularioEnvio({ onSubmit }) {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-2 mt-3"
    >
      {["nombre", "telefono", "email", "direccion", "ciudad"].map((campo) => (
        <input
          key={campo}
          placeholder={campo}
          required={campo !== "email"}
          value={form[campo]}
          onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
          className="w-full border px-2 py-1"
        />
      ))}

      <button className="w-full bg-green-600 text-white py-2 rounded">
        Enviar pedido
      </button>
    </form>
  );
}
