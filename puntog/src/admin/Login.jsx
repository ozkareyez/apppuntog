import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // 🔐 VALIDACIÓN (puedes cambiarla luego por backend)
    if (email === "admin@puntog.com" && password === "123456") {
      localStorage.setItem("admin_auth", "yes");

      // ✅ REDIRECCIÓN CLAVE
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F]">
      <form
        onSubmit={handleLogin}
        className="bg-black p-8 rounded-xl w-full max-w-md border border-white/10"
      >
        <h2 className="text-2xl font-bold text-pink-500 mb-6 text-center">
          Login Admin
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded bg-[#111] text-white border border-white/10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-4 p-3 rounded bg-[#111] text-white border border-white/10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-pink-600 hover:bg-pink-700 transition py-3 rounded-lg font-bold"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
