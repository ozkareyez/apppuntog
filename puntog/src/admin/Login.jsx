import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_USER = "oscar";
const ADMIN_PASS = "811012";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ ESTE useEffect SÍ está bien
  useEffect(() => {
    // Forzar cierre de sesión al entrar al login
    localStorage.removeItem("admin_token");
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (user === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem("admin_token", "yes");
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-extrabold text-center mb-2">
          Panel Administrativo
        </h2>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}

        <input
          type="text"
          placeholder="Usuario"
          className="w-full mb-4 px-4 py-2.5 border rounded-lg"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-6 px-4 py-2.5 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2.5 rounded-lg"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
