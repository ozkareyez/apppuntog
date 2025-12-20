import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_USER = "oscar";
const ADMIN_PASS = "811012";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (user === ADMIN_USER && password === ADMIN_PASS) {
      // 🔐 CLAVE CORRECTA (coincide con AdminLayout)
      localStorage.setItem("admin_token", "yes");

      // 🚀 redirección correcta
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleLogin}
        className="bg-[#1f1f1f] p-8 rounded-xl w-96 border border-white/10"
      >
        <h2 className="text-white text-2xl text-center mb-6">
          Acceso Administrador
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Usuario"
          className="w-full mb-4 p-2 rounded"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-6 p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
