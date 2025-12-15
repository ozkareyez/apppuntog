import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const enviar = (e) => {
    e.preventDefault();

    if (usuario === "oscar" && password === "811012") {
      localStorage.setItem("admin_auth", "yes");
      navigate("/admin/dashboard"); // ✅ redirección correcta
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={enviar} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Panel Admin</h2>

        <input
          type="text"
          placeholder="Usuario"
          className="border p-2 w-full mb-3"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="border p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
