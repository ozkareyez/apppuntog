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
      navigate("/admin/pedidos");
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-black">
      <form
        className="bg-gray-900 p-8 rounded-xl shadow-xl w-80"
        onSubmit={enviar}
      >
        <h2 className="text-xl font-bold mb-6 text-center text-white">
          Panel Administrador
        </h2>

        <input
          className="w-full p-3 mb-3 rounded bg-gray-800 text-white"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 mb-5 rounded bg-gray-800 text-white"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-pink-600 hover:bg-pink-700 py-3 rounded font-bold text-white">
          Entrar
        </button>
      </form>
    </div>
  );
}
