import { useEffect, useState } from "react";
import {
  Trash2,
  Edit,
  Loader2,
  Save,
  RefreshCw,
  Search,
  Globe,
  Shield,
} from "lucide-react";

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modoConexion, setModoConexion] = useState("proxy"); // "directo" o "proxy"
  const [error, setError] = useState("");

  // URLs disponibles
  const URLS = {
    directo: "https://gleaming-motivation-production-4018.up.railway.app",
    proxy: "/api/railway", // Usa el proxy configurado en vite.config.js
  };

  // Cargar productos
  useEffect(() => {
    cargarProductos();
  }, []);

  const construirURL = (endpoint) => {
    const baseUrl = URLS[modoConexion];
    // Si es proxy, asegurarnos de que la ruta sea correcta
    if (modoConexion === "proxy" && !endpoint.startsWith("/")) {
      endpoint = "/" + endpoint;
    }
    return `${baseUrl}${endpoint}`;
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError("");

      const url = construirURL("/api/productos");
      console.log("🌐 Cargando desde:", url);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      console.log("📡 Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📦 Datos recibidos:", data.length);

      if (!Array.isArray(data)) {
        throw new Error("Formato de respuesta inválido");
      }

      setProductos(data);
    } catch (error) {
      console.error("❌ Error cargando productos:", error);
      setError(`Error: ${error.message}`);

      // Intentar cambiar de modo si falla
      if (modoConexion === "directo") {
        setModoConexion("proxy");
        setTimeout(() => cargarProductos(), 1000);
      } else if (modoConexion === "proxy") {
        setModoConexion("directo");
        setTimeout(() => cargarProductos(), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Guardar cambios
  const guardarCambios = async () => {
    if (!editando) return;

    setCargando(true);
    setError("");

    try {
      // Datos básicos
      const datos = {
        nombre: editando.nombre || "",
        precio: parseInt(editando.precio) || 0,
        estado: editando.estado === 0 ? 0 : 1,
        categoria: editando.categoria || "",
        descripcion: editando.descripcion || "",
      };

      const url = construirURL(`/api/productos/${editando.id}`);
      console.log("💾 Guardando en:", url);
      console.log("📤 Datos:", datos);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(datos),
      });

      console.log("📨 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error del servidor:", errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const resultado = await response.json();
      console.log("✅ Resultado:", resultado);

      if (resultado.ok) {
        // Actualizar localmente
        setProductos((prev) =>
          prev.map((p) => (p.id === editando.id ? { ...p, ...editando } : p)),
        );
        setEditando(null);
        alert("✅ Producto actualizado correctamente");
      } else {
        throw new Error(resultado.message || "Error desconocido");
      }
    } catch (error) {
      console.error("❌ Error guardando:", error);
      setError(`Error al guardar: ${error.message}`);

      // Sugerir cambiar de modo
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("CORS")
      ) {
        setError(
          `${error.message}. Intentando con ${modoConexion === "proxy" ? "conexión directa" : "proxy"}...`,
        );
        setTimeout(() => {
          setModoConexion(modoConexion === "proxy" ? "directo" : "proxy");
          guardarCambios();
        }, 1500);
      }
    } finally {
      setCargando(false);
    }
  };

  // Eliminar producto
  const eliminarProducto = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

    try {
      const url = construirURL(`/api/productos/${id}`);
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (response.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== id));
        alert("✅ Producto eliminado");
      } else {
        throw new Error(`Error ${response.status}`);
      }
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("❌ Error al eliminar el producto");
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(
    (p) =>
      !busqueda ||
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando productos...</p>
          <p className="text-sm text-gray-500 mt-2">
            Modo:{" "}
            {modoConexion === "proxy" ? "Proxy (local)" : "Directo (Railway)"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Productos
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    modoConexion === "proxy"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {modoConexion === "proxy" ? (
                    <>
                      <Shield size={14} />
                      <span>Usando Proxy Local</span>
                    </>
                  ) : (
                    <>
                      <Globe size={14} />
                      <span>Conexión Directa</span>
                    </>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {productos.length} productos
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setModoConexion(
                    modoConexion === "proxy" ? "directo" : "proxy",
                  )
                }
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                {modoConexion === "proxy" ? (
                  <Globe size={16} />
                ) : (
                  <Shield size={16} />
                )}
                {modoConexion === "proxy" ? "Usar Directo" : "Usar Proxy"}
              </button>
              <button
                onClick={cargarProductos}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Recargar
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-red-100 rounded">
                  <Shield size={18} className="text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-800">Error de conexión</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    El proxy local debería evitar problemas de CORS. Si
                    persiste, revisa la consola.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Búsqueda */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, categoría o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">
                {busqueda
                  ? "No hay productos que coincidan con la búsqueda"
                  : "No hay productos disponibles"}
              </p>
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {productosFiltrados.map((producto) => (
                  <div
                    key={producto.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Imagen */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                          {producto.imagenes?.[0] ? (
                            <img
                              src={producto.imagenes[0]}
                              alt={producto.nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              Sin imagen
                            </div>
                          )}
                        </div>

                        {/* Información */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {producto.nombre}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="font-bold text-gray-900">
                              ${Number(producto.precio || 0).toLocaleString()}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                producto.estado === 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {producto.estado === 0 ? "Agotado" : "Disponible"}
                            </span>
                            {producto.es_oferta && (
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                Oferta
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {producto.id} •{" "}
                            {producto.categoria || "Sin categoría"}
                          </div>
                        </div>
                      </div>

                      {/* Botones */}
                      <div className="flex gap-2 self-start md:self-center">
                        <button
                          onClick={() => setEditando(producto)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-2"
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarProducto(producto.id)}
                          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contador */}
              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Mostrando {productosFiltrados.length} de {productos.length}{" "}
                  productos
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal de edición */}
        {editando && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Editar Producto
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      ID: {editando.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditando(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    disabled={cargando}
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del producto
                    </label>
                    <input
                      type="text"
                      value={editando.nombre || ""}
                      onChange={(e) =>
                        setEditando({ ...editando, nombre: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del producto"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio
                      </label>
                      <input
                        type="number"
                        value={editando.precio || ""}
                        onChange={(e) =>
                          setEditando({ ...editando, precio: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría
                      </label>
                      <input
                        type="text"
                        value={editando.categoria || ""}
                        onChange={(e) =>
                          setEditando({
                            ...editando,
                            categoria: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Categoría"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={editando.descripcion || ""}
                      onChange={(e) =>
                        setEditando({
                          ...editando,
                          descripcion: e.target.value,
                        })
                      }
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Descripción del producto"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editando.estado === 0}
                        onChange={(e) =>
                          setEditando({
                            ...editando,
                            estado: e.target.checked ? 0 : 1,
                          })
                        }
                        className="w-4 h-4 text-red-600 rounded"
                      />
                      <div>
                        <span className="font-medium">Producto agotado</span>
                        <p className="text-sm text-gray-500">
                          Marca esta opción si el producto no está disponible
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setEditando(null)}
                    className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={cargando}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarCambios}
                    disabled={cargando}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {cargando ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>

                {/* Info de conexión */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    {modoConexion === "proxy" ? (
                      <Shield className="w-5 h-5 text-green-600" />
                    ) : (
                      <Globe className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="font-medium">
                      {modoConexion === "proxy"
                        ? "Usando Proxy Local"
                        : "Conexión Directa a Railway"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {modoConexion === "proxy"
                      ? "El proxy evita problemas de CORS enviando la petición a través del servidor de desarrollo."
                      : "Conexión directa al servidor. Puede fallar por problemas de CORS."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
