import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Credenciales incorrectas");
      }

      // 🔑 GUARDAR AUTH
      localStorage.setItem("admin_auth", "yes");

      // ✅ REDIRECCIÓN FORZADA
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleLogin}
        className="bg-[#1f1f1f] p-8 rounded-xl w-96 border border-white/10"
      >
        <h2 className="text-white text-2xl text-center mb-6">Admin Login</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          className="w-full mb-4 p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
