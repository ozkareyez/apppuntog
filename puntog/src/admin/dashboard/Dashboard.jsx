import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ShoppingCart,
  Truck,
  CreditCard,
  MessageSquare,
  Phone,
  MapPin,
  BarChart,
  Calendar,
} from "lucide-react";
import { API_URL } from "../../config";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    completados: 0,
    cancelados: 0,
    promedio: 0,
  });

  // Filtros
  const [buscar, setBuscar] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [ordenarPor, setOrdenarPor] = useState("fecha_desc");
  const [detalle, setDetalle] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (buscar.trim()) params.append("search", buscar.trim());
      if (fechaInicio) params.append("inicio", fechaInicio);
      if (fechaFin) params.append("fin", fechaFin);

      const res = await fetch(
        `${API_URL}/api/pedidos-completo?${params.toString()}`,
      );
      const data = await res.json();

      if (!Array.isArray(data.results)) {
        throw new Error("Formato de datos inválido");
      }

      setPedidos(data.results);
      calcularEstadisticas(data.results);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (pedidosData) => {
    const total = pedidosData.length;
    const pendientes = pedidosData.filter(
      (p) => p.estado === "pendiente",
    ).length;
    const completados = pedidosData.filter(
      (p) => p.estado === "completado",
    ).length;
    const cancelados = pedidosData.filter(
      (p) => p.estado === "cancelado",
    ).length;
    const promedio =
      total > 0
        ? pedidosData.reduce((sum, p) => sum + (Number(p.total) || 0), 0) /
          total
        : 0;

    setStats({
      total,
      pendientes,
      completados,
      cancelados,
      promedio,
    });
  };

  // Carga inicial
  useEffect(() => {
    fetchPedidos();
  }, []);

  // Debounce filtros
  useEffect(() => {
    const delay = setTimeout(fetchPedidos, 500);
    return () => clearTimeout(delay);
  }, [buscar, fechaInicio, fechaFin, estadoFiltro]);

  const pedidosFiltrados = useMemo(() => {
    let filtered = [...pedidos];

    // Filtrar por estado
    if (estadoFiltro !== "todos") {
      filtered = filtered.filter((p) => p.estado === estadoFiltro);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (ordenarPor) {
        case "fecha_desc":
          return new Date(b.fecha) - new Date(a.fecha);
        case "fecha_asc":
          return new Date(a.fecha) - new Date(b.fecha);
        case "total_desc":
          return (Number(b.total) || 0) - (Number(a.total) || 0);
        case "total_asc":
          return (Number(a.total) || 0) - (Number(b.total) || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [pedidos, estadoFiltro, ordenarPor]);

  const KPI_CARDS = [
    {
      title: "Total",
      value: stats.total,
      icon: ShoppingCart,
      change: `${stats.total} pedidos`,
      color: "border-l-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Pendientes",
      value: stats.pendientes,
      icon: Clock,
      change: `${Math.round((stats.pendientes / stats.total) * 100) || 0}%`,
      color: "border-l-amber-500",
      bg: "bg-amber-50",
    },
    {
      title: "Completados",
      value: stats.completados,
      icon: CheckCircle,
      change: `${Math.round((stats.completados / stats.total) * 100) || 0}%`,
      color: "border-l-green-500",
      bg: "bg-green-50",
    },
    {
      title: "Promedio",
      value: `$${stats.promedio.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      icon: DollarSign,
      change: "ticket promedio",
      color: "border-l-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const estados = [
    { value: "todos", label: "Todos", icon: Package },
    { value: "pendiente", label: "Pendientes", icon: Clock },
    { value: "completado", label: "Completados", icon: CheckCircle },
    { value: "cancelado", label: "Cancelados", icon: XCircle },
  ];

  const ordenOptions = [
    { value: "fecha_desc", label: "Más reciente" },
    { value: "fecha_asc", label: "Más antiguo" },
    { value: "total_desc", label: "Mayor a menor" },
    { value: "total_asc", label: "Menor a mayor" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4">
      {/* HEADER */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">Resumen de pedidos</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`${API_URL}/api/exportar-pedidos-completo`}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Exportar"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={fetchPedidos}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Actualizar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI CARDS - Minimalistas */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {KPI_CARDS.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={index}
                className={`${kpi.bg} border ${kpi.color} rounded-lg p-3`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-500">{kpi.change}</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-600">{kpi.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTROS */}
      <div className="mb-4">
        {/* Barra de búsqueda */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pedidos..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
            {estados.map((estado) => {
              const Icon = estado.icon;
              return (
                <button
                  key={estado.value}
                  onClick={() => setEstadoFiltro(estado.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-1 ${
                    estadoFiltro === estado.value
                      ? "bg-red-500 text-white"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {estado.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="ml-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros avanzados */}
        <AnimatePresence>
          {mostrarFiltros && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 bg-white rounded-lg border border-gray-200 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Ordenar por
                  </label>
                  <select
                    value={ordenarPor}
                    onChange={(e) => setOrdenarPor(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    {ordenOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LISTA DE PEDIDOS - Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Cargando pedidos...</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No hay pedidos</p>
            <p className="text-gray-500 text-xs mt-1">Ajusta los filtros</p>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-mono font-bold text-gray-800 text-sm">
                      #{pedido.id}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pedido.estado === "pendiente"
                        ? "bg-amber-100 text-amber-800"
                        : pedido.estado === "completado"
                          ? "bg-green-100 text-green-800"
                          : pedido.estado === "cancelado"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {pedido.estado === "pendiente" && "⏳"}
                    {pedido.estado === "completado" && "✅"}
                    {pedido.estado === "cancelado" && "❌"}
                    <span className="ml-1 hidden xs:inline">
                      {pedido.estado}
                    </span>
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <h3 className="font-medium text-gray-900">
                      {pedido.nombre}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{pedido.telefono}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {pedido.ciudad_nombre || "Sin ciudad"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-red-600">
                      ${Number(pedido.total || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Fecha</p>
                    <p className="text-sm text-gray-700">
                      {pedido.fecha || "Sin fecha"}
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setDetalle(pedido)}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden xs:inline">Detalles</span>
                  </button>
                  <a
                    href={`/admin/orden-servicio/${pedido.id}`}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 flex items-center justify-center gap-1"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="hidden xs:inline">Ver orden</span>
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINACIÓN SIMPLE */}
      {pedidosFiltrados.length > 0 && (
        <div className="mt-4 bg-white rounded-lg p-3">
          <div className="flex items-center justify-center gap-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">
              ←
            </button>
            <span className="text-sm text-gray-600">1 de 1</span>
            <button className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">
              →
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE - Minimalista */}
      <AnimatePresence>
        {detalle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3"
            onClick={() => setDetalle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-red-500 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">
                      Pedido #{detalle.id}
                    </h3>
                    <p className="text-red-100 text-sm">
                      ${Number(detalle.total).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setDetalle(null)}
                    className="text-white hover:text-red-200"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {/* Información básica */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-gray-600">Nombre:</span>{" "}
                        {detalle.nombre}
                      </p>
                      <p>
                        <span className="text-gray-600">Teléfono:</span>{" "}
                        {detalle.telefono}
                      </p>
                      {detalle.email && (
                        <p>
                          <span className="text-gray-600">Email:</span>{" "}
                          {detalle.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Dirección
                    </h4>
                    <p className="text-sm text-gray-600">{detalle.direccion}</p>
                    <p className="text-sm text-gray-600">
                      {detalle.ciudad_nombre}, {detalle.departamento_nombre}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Detalles</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Estado</p>
                        <p className="text-sm font-medium">{detalle.estado}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fecha</p>
                        <p className="text-sm font-medium">{detalle.fecha}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                {detalle.notas && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {detalle.notas}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setDetalle(null)}
                  className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// import { useEffect, useState, useMemo } from "react";
// import {
//   Search,
//   Filter,
//   Download,
//   Eye,
//   MoreVertical,
//   TrendingUp,
//   TrendingDown,
//   Package,
//   DollarSign,
//   User,
//   Clock,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   BarChart3,
//   Calendar,
//   RefreshCw,
//   ChevronDown,
//   ShoppingCart,
//   Truck,
//   CreditCard,
//   MessageSquare,
//   Phone,
//   MapPin,
// } from "lucide-react";
// import { API_URL } from "../../config";
// import { motion, AnimatePresence } from "framer-motion";

// export default function Dashboard() {
//   const [pedidos, setPedidos] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState({
//     total: 0,
//     pendientes: 0,
//     completados: 0,
//     cancelados: 0,
//     promedio: 0,
//     crecimiento: 0,
//   });

//   // Filtros
//   const [buscar, setBuscar] = useState("");
//   const [fechaInicio, setFechaInicio] = useState("");
//   const [fechaFin, setFechaFin] = useState("");
//   const [estadoFiltro, setEstadoFiltro] = useState("todos");
//   const [ordenarPor, setOrdenarPor] = useState("fecha_desc");

//   // Modal y estados
//   const [detalle, setDetalle] = useState(null);
//   const [filtrosAvanzados, setFiltrosAvanzados] = useState(false);

//   const fetchPedidos = async () => {
//     try {
//       setLoading(true);

//       const params = new URLSearchParams();
//       if (buscar.trim()) params.append("search", buscar.trim());
//       if (fechaInicio) params.append("inicio", fechaInicio);
//       if (fechaFin) params.append("fin", fechaFin);

//       const res = await fetch(
//         `${API_URL}/api/pedidos-completo?${params.toString()}`
//       );

//       const data = await res.json();

//       if (!Array.isArray(data.results)) {
//         throw new Error("Formato de datos inválido");
//       }

//       setPedidos(data.results);

//       // Calcular estadísticas
//       calcularEstadisticas(data.results);
//     } catch (error) {
//       console.error("Error cargando pedidos:", error);
//       setPedidos([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calcularEstadisticas = (pedidosData) => {
//     const total = pedidosData.length;
//     const pendientes = pedidosData.filter(
//       (p) => p.estado === "pendiente"
//     ).length;
//     const completados = pedidosData.filter(
//       (p) => p.estado === "completado"
//     ).length;
//     const cancelados = pedidosData.filter(
//       (p) => p.estado === "cancelado"
//     ).length;
//     const promedio =
//       total > 0
//         ? pedidosData.reduce((sum, p) => sum + (Number(p.total) || 0), 0) /
//           total
//         : 0;
//     const crecimiento = 12.5; // Esto vendría del backend en una app real

//     setStats({
//       total,
//       pendientes,
//       completados,
//       cancelados,
//       promedio,
//       crecimiento,
//     });
//   };

//   // Carga inicial
//   useEffect(() => {
//     fetchPedidos();
//   }, []);

//   // Debounce filtros
//   useEffect(() => {
//     const delay = setTimeout(fetchPedidos, 500);
//     return () => clearTimeout(delay);
//   }, [buscar, fechaInicio, fechaFin, estadoFiltro]);

//   const pedidosFiltrados = useMemo(() => {
//     let filtered = [...pedidos];

//     // Filtrar por estado
//     if (estadoFiltro !== "todos") {
//       filtered = filtered.filter((p) => p.estado === estadoFiltro);
//     }

//     // Ordenar
//     filtered.sort((a, b) => {
//       switch (ordenarPor) {
//         case "fecha_desc":
//           return new Date(b.fecha) - new Date(a.fecha);
//         case "fecha_asc":
//           return new Date(a.fecha) - new Date(b.fecha);
//         case "total_desc":
//           return (Number(b.total) || 0) - (Number(a.total) || 0);
//         case "total_asc":
//           return (Number(a.total) || 0) - (Number(b.total) || 0);
//         default:
//           return 0;
//       }
//     });

//     return filtered;
//   }, [pedidos, estadoFiltro, ordenarPor]);

//   const KPI_CARDS = [
//     {
//       title: "Total Pedidos",
//       value: stats.total,
//       icon: <ShoppingCart className="w-6 h-6" />,
//       change:
//         stats.crecimiento > 0
//           ? `+${stats.crecimiento}%`
//           : `${stats.crecimiento}%`,
//       trend: stats.crecimiento > 0 ? "up" : "down",
//       color: "from-blue-500 to-blue-600",
//       bg: "bg-blue-50",
//       text: "text-blue-700",
//     },
//     {
//       title: "Pendientes",
//       value: stats.pendientes,
//       icon: <Clock className="w-6 h-6" />,
//       change: `${
//         Math.round((stats.pendientes / stats.total) * 100) || 0
//       }% del total`,
//       trend: "neutral",
//       color: "from-amber-500 to-amber-600",
//       bg: "bg-amber-50",
//       text: "text-amber-700",
//     },
//     {
//       title: "Completados",
//       value: stats.completados,
//       icon: <CheckCircle className="w-6 h-6" />,
//       change: `${
//         Math.round((stats.completados / stats.total) * 100) || 0
//       }% del total`,
//       trend: "up",
//       color: "from-green-500 to-green-600",
//       bg: "bg-green-50",
//       text: "text-green-700",
//     },
//     {
//       title: "Ticket Promedio",
//       value: `$${stats.promedio.toLocaleString(undefined, {
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0,
//       })}`,
//       icon: <DollarSign className="w-6 h-6" />,
//       change: "+8.2% vs mes anterior",
//       trend: "up",
//       color: "from-purple-500 to-purple-600",
//       bg: "bg-purple-50",
//       text: "text-purple-700",
//     },
//   ];

//   const estados = [
//     { value: "todos", label: "Todos", color: "bg-gray-100 text-gray-800" },
//     {
//       value: "pendiente",
//       label: "Pendientes",
//       color: "bg-yellow-100 text-yellow-800",
//     },
//     {
//       value: "completado",
//       label: "Completados",
//       color: "bg-green-100 text-green-800",
//     },
//     {
//       value: "cancelado",
//       label: "Cancelados",
//       color: "bg-red-100 text-red-800",
//     },
//     {
//       value: "en_camino",
//       label: "En camino",
//       color: "bg-blue-100 text-blue-800",
//     },
//   ];

//   const ordenOptions = [
//     { value: "fecha_desc", label: "Fecha (más reciente)" },
//     { value: "fecha_asc", label: "Fecha (más antigua)" },
//     { value: "total_desc", label: "Total (mayor a menor)" },
//     { value: "total_asc", label: "Total (menor a mayor)" },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6">
//       {/* HEADER */}
//       <div className="mb-8">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//               Dashboard de Pedidos
//             </h1>
//             <p className="text-gray-600">
//               Gestiona y monitorea todos los pedidos de tu tienda
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={fetchPedidos}
//               className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-red-600/30 transition"
//             >
//               <RefreshCw size={18} />
//               Actualizar
//             </button>
//             <a
//               href={`${API_URL}/api/exportar-pedidos-completo`}
//               target="_blank"
//               rel="noreferrer"
//               className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-600/30 transition"
//             >
//               <Download size={18} />
//               Exportar Excel
//             </a>
//           </div>
//         </div>

//         {/* KPI CARDS */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {KPI_CARDS.map((kpi, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.text}`}>
//                   {kpi.icon}
//                 </div>
//                 <div
//                   className={`text-sm font-medium flex items-center gap-1 ${
//                     kpi.trend === "up"
//                       ? "text-green-600"
//                       : kpi.trend === "down"
//                       ? "text-red-600"
//                       : "text-gray-600"
//                   }`}
//                 >
//                   {kpi.trend === "up" && <TrendingUp size={14} />}
//                   {kpi.trend === "down" && <TrendingDown size={14} />}
//                   {kpi.change}
//                 </div>
//               </div>
//               <div>
//                 <h3 className="text-2xl font-bold text-gray-900 mb-1">
//                   {kpi.value}
//                 </h3>
//                 <p className="text-gray-600 text-sm">{kpi.title}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* FILTROS */}
//       <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
//           <div>
//             <h2 className="text-xl font-bold text-gray-900 mb-1">
//               Filtros avanzados
//             </h2>
//             <p className="text-gray-600 text-sm">
//               Filtra y organiza los pedidos según tus necesidades
//             </p>
//           </div>
//           <button
//             onClick={() => setFiltrosAvanzados(!filtrosAvanzados)}
//             className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
//           >
//             <Filter size={18} />
//             {filtrosAvanzados ? "Ocultar filtros" : "Mostrar filtros"}
//             <ChevronDown
//               className={`transition-transform ${
//                 filtrosAvanzados ? "rotate-180" : ""
//               }`}
//             />
//           </button>
//         </div>

//         {/* FILTROS BÁSICOS */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Buscar por cliente, teléfono..."
//               value={buscar}
//               onChange={(e) => setBuscar(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <input
//               type="date"
//               value={fechaInicio}
//               onChange={(e) => setFechaInicio(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//               placeholder="Fecha inicio"
//             />
//           </div>

//           <div>
//             <input
//               type="date"
//               value={fechaFin}
//               onChange={(e) => setFechaFin(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//               placeholder="Fecha fin"
//             />
//           </div>

//           <div className="relative">
//             <select
//               value={ordenarPor}
//               onChange={(e) => setOrdenarPor(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
//             >
//               {ordenOptions.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//           </div>
//         </div>

//         {/* FILTROS AVANZADOS */}
//         <AnimatePresence>
//           {filtrosAvanzados && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               className="overflow-hidden"
//             >
//               <div className="pt-6 border-t border-gray-200">
//                 <h3 className="font-semibold text-gray-900 mb-4">
//                   Filtrar por estado
//                 </h3>
//                 <div className="flex flex-wrap gap-2">
//                   {estados.map((estado) => (
//                     <button
//                       key={estado.value}
//                       onClick={() => setEstadoFiltro(estado.value)}
//                       className={`px-4 py-2 rounded-xl font-medium transition ${
//                         estadoFiltro === estado.value
//                           ? `${estado.color} ring-2 ring-offset-2 ring-current`
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                     >
//                       {estado.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* TABLA DE PEDIDOS */}
//       <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                   <div className="flex items-center gap-2">
//                     <Package size={16} />
//                     ID Pedido
//                   </div>
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                   <div className="flex items-center gap-2">
//                     <User size={16} />
//                     Cliente
//                   </div>
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                   <div className="flex items-center gap-2">
//                     <Phone size={16} />
//                     Contacto
//                   </div>
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                   <div className="flex items-center gap-2">
//                     <DollarSign size={16} />
//                     Total
//                   </div>
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                   Estado
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                   <div className="flex items-center gap-2">
//                     <Calendar size={16} />
//                     Fecha
//                   </div>
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                   Acciones
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="7" className="px-6 py-12">
//                     <div className="flex flex-col items-center justify-center">
//                       <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
//                       <p className="text-gray-600">Cargando pedidos...</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : pedidosFiltrados.length === 0 ? (
//                 <tr>
//                   <td colSpan="7" className="px-6 py-12">
//                     <div className="flex flex-col items-center justify-center">
//                       <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                         <Package className="w-8 h-8 text-gray-400" />
//                       </div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                         No hay pedidos
//                       </h3>
//                       <p className="text-gray-600 text-center max-w-md">
//                         No se encontraron pedidos con los filtros actuales.
//                         Intenta ajustar los filtros o verifica si hay nuevos
//                         pedidos.
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 pedidosFiltrados.map((pedido, index) => (
//                   <motion.tr
//                     key={pedido.id}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                     className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="px-6 py-4">
//                       <div>
//                         <span className="font-mono font-bold text-gray-900">
//                           #{pedido.id}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div>
//                         <p className="font-medium text-gray-900">
//                           {pedido.nombre}
//                         </p>
//                         {pedido.email && (
//                           <p className="text-sm text-gray-600">
//                             {pedido.email}
//                           </p>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div>
//                         <p className="font-medium text-gray-900">
//                           {pedido.telefono}
//                         </p>
//                         {pedido.direccion && (
//                           <p className="text-sm text-gray-600 truncate max-w-xs">
//                             <MapPin size={12} className="inline mr-1" />
//                             {pedido.direccion}
//                           </p>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className="font-bold text-gray-900">
//                         ${Number(pedido.total).toLocaleString()}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
//                           pedido.estado === "pendiente"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : pedido.estado === "completado"
//                             ? "bg-green-100 text-green-800"
//                             : pedido.estado === "cancelado"
//                             ? "bg-red-100 text-red-800"
//                             : pedido.estado === "en_camino"
//                             ? "bg-blue-100 text-blue-800"
//                             : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {pedido.estado === "pendiente" && <Clock size={12} />}
//                         {pedido.estado === "completado" && (
//                           <CheckCircle size={12} />
//                         )}
//                         {pedido.estado === "cancelado" && <XCircle size={12} />}
//                         {pedido.estado === "en_camino" && <Truck size={12} />}
//                         {pedido.estado}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div>
//                         <p className="text-gray-900">{pedido.fecha}</p>
//                         <p className="text-sm text-gray-600">
//                           {pedido.hora || "Sin hora"}
//                         </p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => setDetalle(pedido)}
//                           className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
//                           title="Ver detalles"
//                         >
//                           <Eye size={18} />
//                         </button>
//                         <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
//                           <MoreVertical size={18} />
//                         </button>
//                       </div>
//                     </td>
//                   </motion.tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* PAGINACIÓN (simulada) */}
//         {pedidosFiltrados.length > 0 && (
//           <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//             <p className="text-sm text-gray-600">
//               Mostrando{" "}
//               <span className="font-semibold">{pedidosFiltrados.length}</span>{" "}
//               de <span className="font-semibold">{pedidos.length}</span> pedidos
//             </p>
//             <div className="flex items-center gap-2">
//               <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
//                 Anterior
//               </button>
//               <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg">
//                 1
//               </button>
//               <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
//                 2
//               </button>
//               <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
//                 Siguiente
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* MODAL DE DETALLE */}
//       <AnimatePresence>
//         {detalle && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
//             onClick={() => setDetalle(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//               className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
//             >
//               {/* HEADER */}
//               <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <div>
//                     <h3 className="text-2xl font-bold text-white">
//                       Pedido #{detalle.id}
//                     </h3>
//                     <p className="text-red-100">
//                       Detalles completos del pedido
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setDetalle(null)}
//                     className="p-2 text-white hover:bg-white/20 rounded-lg transition"
//                   >
//                     ✕
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
//                     <p className="text-white text-sm">Total</p>
//                     <p className="text-white text-xl font-bold">
//                       ${Number(detalle.total).toLocaleString()}
//                     </p>
//                   </div>
//                   <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
//                     <p className="text-white text-sm">Estado</p>
//                     <span
//                       className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
//                         detalle.estado === "pendiente"
//                           ? "bg-yellow-500"
//                           : detalle.estado === "completado"
//                           ? "bg-green-500"
//                           : detalle.estado === "cancelado"
//                           ? "bg-red-500"
//                           : "bg-blue-500"
//                       }`}
//                     >
//                       {detalle.estado}
//                     </span>
//                   </div>
//                   <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
//                     <p className="text-white text-sm">Fecha</p>
//                     <p className="text-white font-medium">{detalle.fecha}</p>
//                   </div>
//                   <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
//                     <p className="text-white text-sm">Método Pago</p>
//                     <p className="text-white font-medium">
//                       {detalle.metodo_pago || "No especificado"}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* BODY */}
//               <div className="p-6 overflow-y-auto max-h-[60vh]">
//                 <div className="grid md:grid-cols-2 gap-6 mb-6">
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                       <User size={18} />
//                       Información del Cliente
//                     </h4>
//                     <div className="space-y-2">
//                       <p>
//                         <strong>Nombre:</strong> {detalle.nombre}
//                       </p>
//                       <p>
//                         <strong>Teléfono:</strong> {detalle.telefono}
//                       </p>
//                       {detalle.email && (
//                         <p>
//                           <strong>Email:</strong> {detalle.email}
//                         </p>
//                       )}
//                       {detalle.direccion && (
//                         <p>
//                           <strong>Dirección:</strong> {detalle.direccion}
//                         </p>
//                       )}
//                       {detalle.ciudad && (
//                         <p>
//                           <strong>Ciudad:</strong> {detalle.ciudad}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                       <CreditCard size={18} />
//                       Información del Pedido
//                     </h4>
//                     <div className="space-y-2">
//                       <p>
//                         <strong>ID:</strong> {detalle.id}
//                       </p>
//                       <p>
//                         <strong>Fecha creación:</strong>{" "}
//                         {detalle.fecha_creacion || detalle.fecha}
//                       </p>
//                       <p>
//                         <strong>Última actualización:</strong>{" "}
//                         {detalle.actualizado || "Hoy"}
//                       </p>
//                       <p>
//                         <strong>Método de pago:</strong>{" "}
//                         {detalle.metodo_pago || "Por definir"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* PRODUCTOS (si existen en el objeto) */}
//                 {detalle.productos && detalle.productos.length > 0 && (
//                   <div className="mt-6">
//                     <h4 className="font-semibold text-gray-900 mb-3">
//                       Productos del pedido
//                     </h4>
//                     <div className="border rounded-lg overflow-hidden">
//                       {detalle.productos.map((producto, idx) => (
//                         <div
//                           key={idx}
//                           className="border-b last:border-b-0 p-4 hover:bg-gray-50"
//                         >
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <p className="font-medium">{producto.nombre}</p>
//                               <p className="text-sm text-gray-600">
//                                 Cantidad: {producto.cantidad}
//                               </p>
//                             </div>
//                             <p className="font-bold">${producto.precio}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* NOTAS ADICIONALES */}
//                 <div className="mt-6">
//                   <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                     <MessageSquare size={18} />
//                     Notas Adicionales
//                   </h4>
//                   <div className="bg-gray-50 rounded-xl p-4">
//                     <p className="text-gray-700">
//                       {detalle.notas ||
//                         "No hay notas adicionales para este pedido."}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* FOOTER */}
//               <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
//                 <button
//                   onClick={() => setDetalle(null)}
//                   className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
//                 >
//                   Cerrar
//                 </button>
//                 <button className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg transition">
//                   Marcar como completado
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { API_URL } from "../../config";

// export default function Dashboard() {
//   const [pedidos, setPedidos] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // filtros
//   const [buscar, setBuscar] = useState("");
//   const [fechaInicio, setFechaInicio] = useState("");
//   const [fechaFin, setFechaFin] = useState("");

//   // modal
//   const [detalle, setDetalle] = useState(null);

//   const fetchPedidos = async () => {
//     try {
//       setLoading(true);

//       const params = new URLSearchParams();
//       if (buscar.trim()) params.append("search", buscar.trim());
//       if (fechaInicio) params.append("inicio", fechaInicio);
//       if (fechaFin) params.append("fin", fechaFin);

//       const res = await fetch(
//         `${API_URL}/api/pedidos-completo?${params.toString()}`
//       );

//       const data = await res.json();

//       if (!Array.isArray(data.results)) {
//         throw new Error("Formato de datos inválido");
//       }

//       setPedidos(data.results);
//     } catch (error) {
//       console.error("Error cargando pedidos:", error);
//       setPedidos([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // carga inicial
//   useEffect(() => {
//     fetchPedidos();
//   }, []);

//   // debounce filtros
//   useEffect(() => {
//     const delay = setTimeout(fetchPedidos, 500);
//     return () => clearTimeout(delay);
//   }, [buscar, fechaInicio, fechaFin]);

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">
//         📊 Panel Administrador
//       </h1>

//       {/* ================= FILTROS ================= */}
//       <div className="bg-white p-4 rounded-xl border border-gray-200 grid md:grid-cols-4 gap-4 mb-6">
//         <input
//           type="text"
//           placeholder="Buscar cliente o teléfono"
//           value={buscar}
//           onChange={(e) => setBuscar(e.target.value)}
//           className="input-admin"
//         />

//         <input
//           type="date"
//           value={fechaInicio}
//           onChange={(e) => setFechaInicio(e.target.value)}
//           className="input-admin"
//         />

//         <input
//           type="date"
//           value={fechaFin}
//           onChange={(e) => setFechaFin(e.target.value)}
//           className="input-admin"
//         />

//         <button
//           onClick={fetchPedidos}
//           className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-semibold transition"
//         >
//           🔍 Buscar
//         </button>
//       </div>

//       {/* ================= EXCEL ================= */}
//       <div className="mb-4 flex justify-end">
//         <a
//           href={`${API_URL}/api/exportar-pedidos-completo`}
//           target="_blank"
//           rel="noreferrer"
//           className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
//         >
//           📥 Descargar Excel
//         </a>
//       </div>

//       {/* ================= TABLA ================= */}
//       <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow">
//         <table className="w-full text-sm text-gray-700">
//           <thead className="bg-red-50 text-red-700">
//             <tr>
//               <th className="px-4 py-3 text-left">ID</th>
//               <th className="px-4 py-3 text-left">Cliente</th>
//               <th className="px-4 py-3 text-left">Teléfono</th>
//               <th className="px-4 py-3 text-left">Total</th>
//               <th className="px-4 py-3 text-left">Estado</th>
//               <th className="px-4 py-3 text-left">Fecha</th>
//               <th className="px-4 py-3 text-left">Acciones</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading && (
//               <tr>
//                 <td colSpan="7" className="text-center py-6 text-gray-500">
//                   Cargando pedidos...
//                 </td>
//               </tr>
//             )}

//             {!loading && pedidos.length === 0 && (
//               <tr>
//                 <td colSpan="7" className="text-center py-6 text-gray-500">
//                   No hay pedidos
//                 </td>
//               </tr>
//             )}

//             {!loading &&
//               pedidos.map((p) => (
//                 <tr
//                   key={p.id}
//                   className="border-t border-gray-200 hover:bg-gray-50"
//                 >
//                   <td className="px-4 py-2 font-semibold">{p.id}</td>
//                   <td className="px-4 py-2">{p.nombre}</td>
//                   <td className="px-4 py-2">{p.telefono}</td>
//                   <td className="px-4 py-2 font-bold text-red-600">
//                     ${Number(p.total).toLocaleString()}
//                   </td>

//                   <td className="px-4 py-2">
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                         p.estado === "pendiente"
//                           ? "bg-yellow-100 text-yellow-800"
//                           : "bg-green-100 text-green-800"
//                       }`}
//                     >
//                       {p.estado}
//                     </span>
//                   </td>

//                   <td className="px-4 py-2">{p.fecha}</td>

//                   <td className="px-4 py-2">
//                     <button
//                       onClick={() => setDetalle(p)}
//                       className="text-red-600 hover:text-red-800 font-medium underline"
//                     >
//                       Ver
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//           </tbody>
//         </table>
//       </div>

//       {/* ================= MODAL ================= */}
//       {detalle && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">
//               Pedido #{detalle.id}
//             </h3>

//             <div className="space-y-1 text-gray-700">
//               <p>
//                 <b>Cliente:</b> {detalle.nombre}
//               </p>
//               <p>
//                 <b>Teléfono:</b> {detalle.telefono}
//               </p>
//               <p>
//                 <b>Total:</b> ${detalle.total}
//               </p>
//               <p>
//                 <b>Estado:</b> {detalle.estado}
//               </p>
//               <p>
//                 <b>Fecha:</b> {detalle.fecha}
//               </p>
//             </div>

//             <button
//               onClick={() => setDetalle(null)}
//               className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
//             >
//               Cerrar
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
