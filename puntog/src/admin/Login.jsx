import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const enviar = (e) => {
    e.preventDefault();

    if (usuario === "oscar" && password === "811012") {
      localStorage.setItem("admin_auth", "yes");
      navigate("/Dashboard");
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <motion.form
        onSubmit={enviar}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 text-white"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Panel Administrador
        </h2>
        <p className="text-center text-sm text-gray-400 mb-6">
          Acceso restringido
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 font-semibold hover:opacity-90 transition"
          >
            Entrar
          </button>
        </div>
      </motion.form>
    </div>
  );
}
