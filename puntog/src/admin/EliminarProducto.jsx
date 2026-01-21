import { useEffect, useState } from "react";
import {
  Trash2,
  Edit,
  Loader2,
  Save,
  RefreshCw,
  Search,
  Package,
  Filter,
  CheckCircle,
  XCircle,
  DollarSign,
  MoreVertical,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenarPor, setOrdenarPor] = useState("id");
  const [ordenDireccion, setOrdenDireccion] = useState("desc");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [showMoreInfo, setShowMoreInfo] = useState({});

  // Cargar productos
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/api/productos`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando:", error);
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async () => {
    if (!editando) return;

    setCargando(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/productos/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editando.nombre || "",
          precio: parseInt(editando.precio) || 0,
          estado: editando.estado === 0 ? 0 : 1,
          descripcion: editando.descripcion || "",
          categoria: editando.categoria || "",
          talla: editando.talla || "",
          color: editando.color || "",
          es_oferta: editando.es_oferta ? 1 : 0,
          precio_antes: editando.precio_antes
            ? parseInt(editando.precio_antes)
            : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProductos((prev) =>
          prev.map((p) => (p.id === editando.id ? { ...p, ...editando } : p)),
        );
        setEditando(null);
        setMenuAbierto(null);
        setDebugInfo("✅ Cambios guardados exitosamente");
        setTimeout(() => setDebugInfo(""), 3000);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error guardando:", error);
      setError("Error al guardar cambios");
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = async (id, nombre) => {
    if (
      !window.confirm(
        `¿Eliminar "${nombre}"?\nEsta acción no se puede deshacer.`,
      )
    )
      return;

    try {
      const response = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== id));
        setMenuAbierto(null);
        setDebugInfo(`✅ Producto eliminado`);
        setTimeout(() => setDebugInfo(""), 3000);
      }
    } catch (error) {
      console.error("Error eliminando:", error);
      setError("Error al eliminar producto");
    }
  };

  // Filtrar y ordenar productos
  const productosFiltrados = productos
    .filter((p) => {
      const coincideBusqueda =
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.id?.toString().includes(busqueda);

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "disponibles" && p.estado === 1) ||
        (filtroEstado === "agotados" && p.estado === 0);

      return coincideBusqueda && coincideEstado;
    })
    .sort((a, b) => {
      let valorA, valorB;

      switch (ordenarPor) {
        case "nombre":
          valorA = a.nombre?.toLowerCase() || "";
          valorB = b.nombre?.toLowerCase() || "";
          break;
        case "precio":
          valorA = Number(a.precio) || 0;
          valorB = Number(b.precio) || 0;
          break;
        default:
          valorA = a.id || 0;
          valorB = b.id || 0;
      }

      if (ordenDireccion === "asc") {
        return valorA > valorB ? 1 : -1;
      }
      return valorA < valorB ? 1 : -1;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900 mx-auto" />
          <p className="mt-3 text-gray-600 text-sm">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header compacto */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Productos</h1>
              <p className="text-gray-500 text-xs mt-0.5">
                {productos.length} productos en total
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Filtros"
              >
                <Filter size={16} />
              </button>
              <button
                onClick={cargarProductos}
                disabled={cargando}
                className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Actualizar"
              >
                <RefreshCw
                  size={16}
                  className={cargando ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* Notificaciones */}
          {debugInfo && (
            <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-xs">{debugInfo}</p>
            </div>
          )}

          {error && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-xs">{error}</p>
            </div>
          )}

          {/* Barra de búsqueda */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-1 mb-2">
            <button
              onClick={() => setFiltroEstado("todos")}
              className={`px-2 py-1 rounded text-xs ${
                filtroEstado === "todos"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroEstado("disponibles")}
              className={`px-2 py-1 rounded text-xs ${
                filtroEstado === "disponibles"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Disponibles
            </button>
            <button
              onClick={() => setFiltroEstado("agotados")}
              className={`px-2 py-1 rounded text-xs ${
                filtroEstado === "agotados"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Agotados
            </button>
          </div>

          {/* Filtros avanzados */}
          {mostrarFiltros && (
            <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-white">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ordenar por
                  </label>
                  <select
                    value={ordenarPor}
                    onChange={(e) => setOrdenarPor(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="id">ID</option>
                    <option value="nombre">Nombre</option>
                    <option value="precio">Precio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Orden
                  </label>
                  <select
                    value={ordenDireccion}
                    onChange={(e) => setOrdenDireccion(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contador */}
          <div className="mb-2">
            <p className="text-xs text-gray-600">
              Mostrando {productosFiltrados.length} productos
              {busqueda && ` · Buscando: "${busqueda}"`}
            </p>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="space-y-2">
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-900 font-medium text-sm mb-1">
                No se encontraron productos
              </h3>
              <p className="text-gray-500 text-xs">
                {productos.length === 0
                  ? "No hay productos cargados"
                  : "Intenta con otros términos"}
              </p>
            </div>
          ) : (
            productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="bg-white border border-gray-200 rounded-lg p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Imagen */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden">
                      {producto.imagenes?.[0] ? (
                        <img
                          src={producto.imagenes[0]}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package size={18} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {producto.nombre}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-gray-900 text-sm">
                            ${producto.precio?.toLocaleString()}
                          </span>
                          {producto.precio_antes && (
                            <span className="text-gray-400 text-xs line-through">
                              ${producto.precio_antes.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            producto.estado === 0
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {producto.estado === 0 ? "Agotado" : "Disponible"}
                        </span>
                        <button
                          onClick={() =>
                            setMenuAbierto(
                              menuAbierto === producto.id ? null : producto.id,
                            )
                          }
                          className="p-0.5 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Etiquetas */}
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {producto.es_oferta && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                          Oferta
                        </span>
                      )}
                      {producto.categoria && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs truncate max-w-[100px]">
                          {producto.categoria}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">
                        ID: {producto.id}
                      </span>
                    </div>

                    {/* Información adicional */}
                    {showMoreInfo[producto.id] && (
                      <div className="mt-1.5 pt-1.5 border-t border-gray-100">
                        <p className="text-gray-600 text-xs">
                          {producto.descripcion || "Sin descripción"}
                        </p>
                        {(producto.talla || producto.color) && (
                          <div className="flex gap-2 mt-1 text-xs text-gray-500">
                            {producto.talla && (
                              <span>Talla: {producto.talla}</span>
                            )}
                            {producto.color && (
                              <span>Color: {producto.color}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botón ver más/menos */}
                    {(producto.descripcion ||
                      producto.talla ||
                      producto.color) && (
                      <button
                        onClick={() =>
                          setShowMoreInfo({
                            ...showMoreInfo,
                            [producto.id]: !showMoreInfo[producto.id],
                          })
                        }
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-0.5"
                      >
                        {showMoreInfo[producto.id] ? (
                          <>
                            <ChevronUp size={12} />
                            Ver menos
                          </>
                        ) : (
                          <>
                            <ChevronDown size={12} />
                            Ver más
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Menú flotante */}
                {menuAbierto === producto.id && (
                  <div className="absolute right-2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-32">
                    <button
                      onClick={() => {
                        setEditando(producto);
                        setMenuAbierto(null);
                      }}
                      className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit size={12} />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        eliminarProducto(producto.id, producto.nombre);
                        setMenuAbierto(null);
                      }}
                      className="w-full px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de edición - Versión móvil optimizada */}
      {editando && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
          <div
            className="bg-white w-full min-h-screen max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header sticky */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Editar Producto</h2>
                <p className="text-gray-500 text-xs">ID: {editando.id}</p>
              </div>
              <button
                onClick={() => setEditando(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario compacto */}
            <div className="p-4 space-y-3">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editando.nombre || ""}
                  onChange={(e) =>
                    setEditando({ ...editando, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={editando.precio || ""}
                      onChange={(e) =>
                        setEditando({ ...editando, precio: e.target.value })
                      }
                      className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Precio anterior
                  </label>
                  <input
                    type="number"
                    value={editando.precio_antes || ""}
                    onChange={(e) =>
                      setEditando({
                        ...editando,
                        precio_antes: e.target.value || null,
                      })
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              {/* Categoría, Talla, Color */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={editando.categoria || ""}
                    onChange={(e) =>
                      setEditando({ ...editando, categoria: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Talla
                  </label>
                  <input
                    type="text"
                    value={editando.talla || ""}
                    onChange={(e) =>
                      setEditando({ ...editando, talla: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="S, M, L"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={editando.color || ""}
                    onChange={(e) =>
                      setEditando({ ...editando, color: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ej: Rojo"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editando.descripcion || ""}
                  onChange={(e) =>
                    setEditando({ ...editando, descripcion: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Descripción del producto..."
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Estado
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditando({ ...editando, estado: 1 })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium ${
                      editando.estado === 1
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <CheckCircle size={12} className="inline mr-1" />
                    Disponible
                  </button>
                  <button
                    onClick={() => setEditando({ ...editando, estado: 0 })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium ${
                      editando.estado === 0
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <XCircle size={12} className="inline mr-1" />
                    Agotado
                  </button>
                </div>
              </div>

              {/* Oferta */}
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    ¿Es oferta?
                  </span>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={editando.es_oferta}
                        onChange={(e) =>
                          setEditando({
                            ...editando,
                            es_oferta: e.target.checked,
                          })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-9 h-5 rounded-full transition-colors ${
                          editando.es_oferta ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          editando.es_oferta ? "transform translate-x-4" : ""
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botones fijos al final */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditando(null)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarCambios}
                    disabled={cargando}
                    className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {cargando ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// import { useEffect, useState } from "react";
// import {
//   Trash2,
//   Edit,
//   Loader2,
//   Save,
//   RefreshCw,
//   Search,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Eye,
//   Package,
//   Tag,
//   DollarSign,
//   Filter,
//   MoreVertical,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";

// const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

// export default function EliminarProducto() {
//   const [productos, setProductos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editando, setEditando] = useState(null);
//   const [cargando, setCargando] = useState(false);
//   const [busqueda, setBusqueda] = useState("");
//   const [error, setError] = useState("");
//   const [debugInfo, setDebugInfo] = useState("");
//   const [filtroEstado, setFiltroEstado] = useState("todos"); // todos, disponibles, agotados
//   const [ordenarPor, setOrdenarPor] = useState("id");
//   const [ordenDireccion, setOrdenDireccion] = useState("desc");
//   const [productosExpandidos, setProductosExpandidos] = useState(new Set());
//   const [mostrarFiltros, setMostrarFiltros] = useState(false);

//   // Cargar productos
//   useEffect(() => {
//     cargarProductos();
//   }, []);

//   const cargarProductos = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const response = await fetch(`${API_URL}/api/productos`);
//       if (!response.ok) throw new Error(`HTTP ${response.status}`);

//       const data = await response.json();
//       setProductos(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Error cargando:", error);
//       setError("Error al cargar productos. Verifica la conexión.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const intentarGuardar = async (producto) => {
//     setDebugInfo(`Guardando producto ${producto.id}...`);

//     try {
//       const response = await fetch(`${API_URL}/api/productos/${producto.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           nombre: producto.nombre || "",
//           precio: parseInt(producto.precio) || 0,
//           estado: producto.estado === 0 ? 0 : 1,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         return { success: true, data, method: "PUT" };
//       }
//       throw new Error(`HTTP ${response.status}`);
//     } catch (error) {
//       console.error("Error guardando:", error);
//       return { success: false, error: error.message };
//     }
//   };

//   const guardarCambios = async () => {
//     if (!editando) return;

//     setCargando(true);
//     setError("");

//     try {
//       const resultado = await intentarGuardar(editando);

//       if (resultado.success) {
//         setProductos((prev) =>
//           prev.map((p) => (p.id === editando.id ? { ...p, ...editando } : p)),
//         );
//         setEditando(null);
//         setDebugInfo("✅ Cambios guardados exitosamente");
//         setTimeout(() => setDebugInfo(""), 3000);
//       } else {
//         setError("Error al guardar cambios. Intenta nuevamente.");
//       }
//     } catch (error) {
//       console.error("Error final:", error);
//       setError(`Error: ${error.message}`);
//     } finally {
//       setCargando(false);
//     }
//   };

//   const eliminarProducto = async (id, nombre) => {
//     if (
//       !window.confirm(
//         `¿Estás seguro de eliminar el producto "${nombre}"?\nEsta acción no se puede deshacer.`,
//       )
//     )
//       return;

//     try {
//       setCargando(true);
//       const response = await fetch(`${API_URL}/api/productos/${id}`, {
//         method: "DELETE",
//       });

//       if (response.ok) {
//         setProductos((prev) => prev.filter((p) => p.id !== id));
//         setDebugInfo(`✅ Producto "${nombre}" eliminado`);
//         setTimeout(() => setDebugInfo(""), 3000);
//       } else {
//         throw new Error(`HTTP ${response.status}`);
//       }
//     } catch (error) {
//       console.error("Error eliminando:", error);
//       setError("Error al eliminar el producto");
//     } finally {
//       setCargando(false);
//     }
//   };

//   const toggleExpandirProducto = (id) => {
//     const nuevosExpandidos = new Set(productosExpandidos);
//     if (nuevosExpandidos.has(id)) {
//       nuevosExpandidos.delete(id);
//     } else {
//       nuevosExpandidos.add(id);
//     }
//     setProductosExpandidos(nuevosExpandidos);
//   };

//   // Filtrar y ordenar productos
//   const productosFiltrados = productos
//     .filter((p) => {
//       const coincideBusqueda =
//         p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
//         p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
//         p.id?.toString().includes(busqueda);

//       const coincideEstado =
//         filtroEstado === "todos" ||
//         (filtroEstado === "disponibles" && p.estado === 1) ||
//         (filtroEstado === "agotados" && p.estado === 0);

//       return coincideBusqueda && coincideEstado;
//     })
//     .sort((a, b) => {
//       let valorA, valorB;

//       switch (ordenarPor) {
//         case "nombre":
//           valorA = a.nombre?.toLowerCase() || "";
//           valorB = b.nombre?.toLowerCase() || "";
//           break;
//         case "precio":
//           valorA = Number(a.precio) || 0;
//           valorB = Number(b.precio) || 0;
//           break;
//         case "estado":
//           valorA = a.estado || 0;
//           valorB = b.estado || 0;
//           break;
//         default:
//           valorA = a.id || 0;
//           valorB = b.id || 0;
//       }

//       if (ordenDireccion === "asc") {
//         return valorA > valorB ? 1 : -1;
//       }
//       return valorA < valorB ? 1 : -1;
//     });

//   // Estadísticas
//   const estadisticas = {
//     total: productos.length,
//     disponibles: productos.filter((p) => p.estado === 1).length,
//     agotados: productos.filter((p) => p.estado === 0).length,
//     ofertas: productos.filter((p) => p.es_oferta).length,
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="relative">
//             <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
//             <div className="absolute inset-0 animate-ping opacity-20">
//               <Loader2 className="w-12 h-12 text-blue-600 mx-auto" />
//             </div>
//           </div>
//           <p className="mt-4 text-gray-600 font-medium">
//             Cargando productos...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 Gestión de Productos
//               </h1>
//               <p className="text-gray-600">
//                 Administra y actualiza el inventario de productos
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={cargarProductos}
//                 disabled={cargando}
//                 className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 disabled:opacity-50"
//               >
//                 <RefreshCw
//                   size={18}
//                   className={cargando ? "animate-spin" : ""}
//                 />
//                 <span className="font-medium">Actualizar</span>
//               </button>
//               <button
//                 onClick={() => setMostrarFiltros(!mostrarFiltros)}
//                 className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
//               >
//                 <Filter size={18} />
//                 <span className="font-medium">Filtros</span>
//               </button>
//             </div>
//           </div>

//           {/* Estadísticas */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//             {[
//               {
//                 label: "Total Productos",
//                 value: estadisticas.total,
//                 icon: Package,
//                 color: "bg-blue-500",
//               },
//               {
//                 label: "Disponibles",
//                 value: estadisticas.disponibles,
//                 icon: CheckCircle,
//                 color: "bg-green-500",
//               },
//               {
//                 label: "Agotados",
//                 value: estadisticas.agotados,
//                 icon: XCircle,
//                 color: "bg-red-500",
//               },
//               {
//                 label: "En Oferta",
//                 value: estadisticas.ofertas,
//                 icon: Tag,
//                 color: "bg-amber-500",
//               },
//             ].map((stat, idx) => (
//               <div
//                 key={idx}
//                 className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <div className={`p-2 rounded-lg ${stat.color} text-white`}>
//                     <stat.icon size={20} />
//                   </div>
//                   <span className="text-2xl font-bold text-gray-900">
//                     {stat.value}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-600 font-medium">
//                   {stat.label}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* Notificaciones */}
//           {debugInfo && (
//             <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-fadeIn">
//               <div className="flex items-center gap-3">
//                 <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
//                 <p className="text-green-800 font-medium">{debugInfo}</p>
//               </div>
//             </div>
//           )}

//           {error && (
//             <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
//               <div className="flex items-center gap-3">
//                 <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
//                 <p className="text-red-800 font-medium">{error}</p>
//               </div>
//             </div>
//           )}

//           {/* Barra de búsqueda y filtros */}
//           <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
//             <div className="flex flex-col md:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Buscar productos por nombre, descripción o ID..."
//                   value={busqueda}
//                   onChange={(e) => setBusqueda(e.target.value)}
//                   className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                 />
//               </div>

//               <div className="flex gap-3">
//                 <div className="relative">
//                   <select
//                     value={ordenarPor}
//                     onChange={(e) => setOrdenarPor(e.target.value)}
//                     className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                   >
//                     <option value="id">Ordenar por ID</option>
//                     <option value="nombre">Ordenar por nombre</option>
//                     <option value="precio">Ordenar por precio</option>
//                     <option value="estado">Ordenar por estado</option>
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//                 </div>

//                 <button
//                   onClick={() =>
//                     setOrdenDireccion(ordenDireccion === "asc" ? "desc" : "asc")
//                   }
//                   className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
//                 >
//                   {ordenDireccion === "asc" ? (
//                     <ChevronUp size={20} />
//                   ) : (
//                     <ChevronDown size={20} />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Filtros avanzados */}
//             {mostrarFiltros && (
//               <div className="mt-5 pt-5 border-t border-gray-200">
//                 <div className="flex flex-wrap gap-4">
//                   <div className="flex items-center gap-3">
//                     <span className="text-sm font-medium text-gray-700">
//                       Estado:
//                     </span>
//                     {["todos", "disponibles", "agotados"].map((filtro) => (
//                       <button
//                         key={filtro}
//                         onClick={() => setFiltroEstado(filtro)}
//                         className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
//                           filtroEstado === filtro
//                             ? "bg-blue-600 text-white"
//                             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         }`}
//                       >
//                         {filtro === "todos" && "Todos"}
//                         {filtro === "disponibles" && "Disponibles"}
//                         {filtro === "agotados" && "Agotados"}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Contador de resultados */}
//           <div className="mb-4 flex items-center justify-between">
//             <p className="text-gray-600">
//               Mostrando{" "}
//               <span className="font-bold">{productosFiltrados.length}</span> de{" "}
//               <span className="font-bold">{estadisticas.total}</span> productos
//             </p>
//             <div className="text-sm text-gray-500">
//               {busqueda && `Búsqueda: "${busqueda}"`}
//             </div>
//           </div>
//         </div>

//         {/* Lista de productos */}
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//           {productosFiltrados.length === 0 ? (
//             <div className="text-center py-16">
//               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Package className="w-10 h-10 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 mb-2">
//                 No se encontraron productos
//               </h3>
//               <p className="text-gray-600 max-w-md mx-auto">
//                 {productos.length === 0
//                   ? "No hay productos cargados. Intenta actualizar la página."
//                   : "Intenta con otros términos de búsqueda o ajusta los filtros."}
//               </p>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-100">
//               {productosFiltrados.map((producto) => {
//                 const estaExpandido = productosExpandidos.has(producto.id);
//                 return (
//                   <div
//                     key={producto.id}
//                     className="p-5 hover:bg-gray-50 transition-colors duration-150"
//                   >
//                     <div className="flex flex-col lg:flex-row lg:items-start gap-4">
//                       {/* Imagen */}
//                       <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
//                         {producto.imagenes?.[0] ? (
//                           <img
//                             src={producto.imagenes[0]}
//                             alt={producto.nombre}
//                             className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center text-gray-400">
//                             <Package size={32} />
//                           </div>
//                         )}
//                       </div>

//                       {/* Información principal */}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
//                           <div>
//                             <div className="flex items-center gap-3 mb-1">
//                               <h3 className="font-bold text-gray-900 text-lg truncate">
//                                 {producto.nombre}
//                               </h3>
//                               <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
//                                 ID: {producto.id}
//                               </span>
//                             </div>
//                             <p className="text-gray-600 text-sm line-clamp-2">
//                               {producto.descripcion || "Sin descripción"}
//                             </p>
//                           </div>

//                           <div className="flex flex-col items-end gap-2">
//                             <div className="flex items-center gap-3">
//                               <span className="text-2xl font-bold text-gray-900 flex items-center gap-1">
//                                 <DollarSign size={20} />
//                                 {producto.precio?.toLocaleString()}
//                               </span>
//                               {producto.precio_antes && (
//                                 <span className="text-gray-400 line-through text-sm">
//                                   ${producto.precio_antes.toLocaleString()}
//                                 </span>
//                               )}
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span
//                                 className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
//                                   producto.estado === 0
//                                     ? "bg-red-100 text-red-800"
//                                     : "bg-green-100 text-green-800"
//                                 }`}
//                               >
//                                 {producto.estado === 0 ? (
//                                   <XCircle size={14} />
//                                 ) : (
//                                   <CheckCircle size={14} />
//                                 )}
//                                 {producto.estado === 0
//                                   ? "Agotado"
//                                   : "Disponible"}
//                               </span>
//                               {producto.es_oferta && (
//                                 <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
//                                   Oferta
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Información expandible */}
//                         {estaExpandido && (
//                           <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-slideDown">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                               <div>
//                                 <h4 className="text-sm font-medium text-gray-700 mb-2">
//                                   Información del Producto
//                                 </h4>
//                                 <div className="space-y-1 text-sm">
//                                   <p>
//                                     <span className="text-gray-600">
//                                       Categoría:
//                                     </span>{" "}
//                                     <span className="font-medium">
//                                       {producto.categoria || "No especificada"}
//                                     </span>
//                                   </p>
//                                   <p>
//                                     <span className="text-gray-600">
//                                       Talla/Color:
//                                     </span>{" "}
//                                     <span className="font-medium">
//                                       {producto.talla || "N/A"} /{" "}
//                                       {producto.color || "N/A"}
//                                     </span>
//                                   </p>
//                                 </div>
//                               </div>
//                               <div>
//                                 <h4 className="text-sm font-medium text-gray-700 mb-2">
//                                   Detalles
//                                 </h4>
//                                 <div className="space-y-1 text-sm">
//                                   <p>
//                                     <span className="text-gray-600">
//                                       Categoría ID:
//                                     </span>{" "}
//                                     <span className="font-medium">
//                                       {producto.categoria_id}
//                                     </span>
//                                   </p>
//                                   <p>
//                                     <span className="text-gray-600">
//                                       Activo:
//                                     </span>{" "}
//                                     <span
//                                       className={`font-medium ${
//                                         producto.activo
//                                           ? "text-green-600"
//                                           : "text-red-600"
//                                       }`}
//                                     >
//                                       {producto.activo ? "Sí" : "No"}
//                                     </span>
//                                   </p>
//                                 </div>
//                               </div>
//                               <div>
//                                 <h4 className="text-sm font-medium text-gray-700 mb-2">
//                                   Imágenes
//                                 </h4>
//                                 <div className="flex gap-2">
//                                   {producto.imagenes?.map((img, idx) => (
//                                     <div
//                                       key={idx}
//                                       className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden"
//                                     >
//                                       <img
//                                         src={img}
//                                         alt={`${producto.nombre} ${idx + 1}`}
//                                         className="w-full h-full object-cover"
//                                       />
//                                     </div>
//                                   ))}
//                                   {(!producto.imagenes ||
//                                     producto.imagenes.length === 0) && (
//                                     <div className="text-sm text-gray-500">
//                                       Sin imágenes
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         )}

//                         {/* Botones */}
//                         <div className="flex flex-wrap gap-2 mt-4">
//                           <button
//                             onClick={() => toggleExpandirProducto(producto.id)}
//                             className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
//                           >
//                             <Eye size={16} />
//                             {estaExpandido ? "Ver menos" : "Ver detalles"}
//                           </button>
//                           <button
//                             onClick={() => setEditando(producto)}
//                             className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
//                           >
//                             <Edit size={16} />
//                             Editar
//                           </button>
//                           <button
//                             onClick={() =>
//                               eliminarProducto(producto.id, producto.nombre)
//                             }
//                             className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200"
//                           >
//                             <Trash2 size={16} />
//                             Eliminar
//                           </button>
//                           {producto.imagenes?.[0] && (
//                             <a
//                               href={producto.imagenes[0]}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200"
//                             >
//                               Ver imagen
//                             </a>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal de edición */}
//       {editando && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
//           <div
//             className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-scaleUp"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="p-8">
//               {/* Header del modal */}
//               <div className="flex justify-between items-center mb-8">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     Editar Producto
//                   </h2>
//                   <p className="text-gray-600 mt-1">
//                     ID: {editando.id} • Última actualización
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setEditando(null)}
//                   className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
//                 >
//                   <XCircle className="w-6 h-6 text-gray-500" />
//                 </button>
//               </div>

//               {/* Formulario */}
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">
//                       Nombre del Producto
//                     </label>
//                     <input
//                       type="text"
//                       value={editando.nombre || ""}
//                       onChange={(e) =>
//                         setEditando({ ...editando, nombre: e.target.value })
//                       }
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                       placeholder="Ingresa el nombre del producto"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">
//                       Precio
//                     </label>
//                     <div className="relative">
//                       <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
//                         $
//                       </div>
//                       <input
//                         type="number"
//                         value={editando.precio || ""}
//                         onChange={(e) =>
//                           setEditando({
//                             ...editando,
//                             precio: e.target.value,
//                           })
//                         }
//                         className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                         placeholder="0.00"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Estado del producto */}
//                 <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                     Estado del Producto
//                   </h3>
//                   <div className="flex flex-col sm:flex-row gap-4">
//                     <div
//                       className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
//                         editando.estado === 1
//                           ? "border-green-500 bg-green-50"
//                           : "border-gray-300 hover:border-gray-400"
//                       }`}
//                       onClick={() => setEditando({ ...editando, estado: 1 })}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={`w-6 h-6 rounded-full border flex items-center justify-center ${
//                             editando.estado === 1
//                               ? "border-green-500 bg-green-500"
//                               : "border-gray-400"
//                           }`}
//                         >
//                           {editando.estado === 1 && (
//                             <CheckCircle className="w-4 h-4 text-white" />
//                           )}
//                         </div>
//                         <div>
//                           <div className="flex items-center gap-2">
//                             <CheckCircle className="w-5 h-5 text-green-600" />
//                             <span className="font-semibold text-gray-900">
//                               Disponible
//                             </span>
//                           </div>
//                           <p className="text-sm text-gray-600 mt-1">
//                             Producto en stock y listo para venta
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div
//                       className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
//                         editando.estado === 0
//                           ? "border-red-500 bg-red-50"
//                           : "border-gray-300 hover:border-gray-400"
//                       }`}
//                       onClick={() => setEditando({ ...editando, estado: 0 })}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={`w-6 h-6 rounded-full border flex items-center justify-center ${
//                             editando.estado === 0
//                               ? "border-red-500 bg-red-500"
//                               : "border-gray-400"
//                           }`}
//                         >
//                           {editando.estado === 0 && (
//                             <XCircle className="w-4 h-4 text-white" />
//                           )}
//                         </div>
//                         <div>
//                           <div className="flex items-center gap-2">
//                             <XCircle className="w-5 h-5 text-red-600" />
//                             <span className="font-semibold text-gray-900">
//                               Agotado
//                             </span>
//                           </div>
//                           <p className="text-sm text-gray-600 mt-1">
//                             Producto sin stock temporalmente
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Botones de acción */}
//                 <div className="flex gap-4 pt-6">
//                   <button
//                     onClick={() => setEditando(null)}
//                     disabled={cargando}
//                     className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
//                   >
//                     Cancelar
//                   </button>
//                   <button
//                     onClick={guardarCambios}
//                     disabled={cargando}
//                     className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3"
//                   >
//                     {cargando ? (
//                       <>
//                         <Loader2 className="w-5 h-5 animate-spin" />
//                         Guardando...
//                       </>
//                     ) : (
//                       <>
//                         <Save className="w-5 h-5" />
//                         Guardar Cambios
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Estilos CSS para animaciones */}
//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }

//         @keyframes slideDown {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes scaleUp {
//           from {
//             opacity: 0;
//             transform: scale(0.95);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }

//         .animate-slideDown {
//           animation: slideDown 0.3s ease-out;
//         }

//         .animate-scaleUp {
//           animation: scaleUp 0.3s ease-out;
//         }

//         .line-clamp-2 {
//           overflow: hidden;
//           display: -webkit-box;
//           -webkit-box-orient: vertical;
//           -webkit-line-clamp: 2;
//         }
//       `}</style>
//     </div>
//   );
// }
