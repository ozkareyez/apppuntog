import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Package,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ShoppingCart,
  Truck,
  CreditCard,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  Wifi,
  WifiOff,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { API_URL } from "../../config";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  // 🎯 Estados principales
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    entregados: 0,
    cancelados: 0,
    promedio: 0,
    totalRevenue: 0,
  });

  // 🎯 Filtros
  const [buscar, setBuscar] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [ordenarPor, setOrdenarPor] = useState("fecha_desc");
  const [detalle, setDetalle] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    total: 0,
    totalPages: 1,
  });

  // 🎯 Estados mejorados
  const [apiStatus, setApiStatus] = useState("checking");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // 🎯 Refs para control
  const isMounted = useRef(true);

  // ✅ CORREGIDO: Verificar conexión usando endpoint raíz /
  const checkConnection = useCallback(async () => {
    if (!isMounted.current) return false;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      // ✅ Usa el endpoint raíz que SÍ existe
      const response = await fetch(`${API_URL}/`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        setApiStatus("online");
        return true;
      } else {
        setApiStatus("offline");
        return false;
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.log("🔌 Modo offline - Usando conexión directa");
        setApiStatus("offline");
      }
      return false;
    }
  }, []);

  // 📥 Función principal para cargar pedidos
  const fetchPedidos = useCallback(
    async (pagina = 1, forceRefresh = false) => {
      if (!isMounted.current) return;
      if (loading && !forceRefresh) return;

      setLoading(true);
      setError(null);

      try {
        // Intentar conectar (pero no bloquear si falla)
        try {
          await checkConnection();
        } catch (connError) {
          console.log("⚠️ Verificación de conexión falló, continuando...");
        }

        // Construir parámetros
        const params = new URLSearchParams({
          page: pagina.toString(),
          limit: "10",
        });

        if (buscar.trim()) params.append("search", buscar.trim());
        if (fechaInicio) params.append("inicio", fechaInicio);
        if (fechaFin) params.append("fin", fechaFin);
        if (estadoFiltro !== "todos") params.append("estado", estadoFiltro);

        console.log(
          `📡 Solicitando: ${API_URL}/api/pedidos-completo?${params}`,
        );

        const response = await fetch(
          `${API_URL}/api/pedidos-completo?${params.toString()}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Error ${response.status}: No se pudieron cargar los pedidos`,
          );
        }

        const data = await response.json();

        if (data?.ok === true && Array.isArray(data.results)) {
          const pedidosData = data.results || [];

          console.log(`✅ ${pedidosData.length} pedidos cargados`);

          setPedidos(pedidosData);
          setPaginacion({
            pagina: data.page || pagina,
            total: data.total || 0,
            totalPages: data.totalPages || 1,
          });

          // Calcular estadísticas
          const total = pedidosData.length;
          const pendientes = pedidosData.filter(
            (p) => p.estado?.toLowerCase() === "pendiente",
          ).length;
          const entregados = pedidosData.filter(
            (p) => p.estado?.toLowerCase() === "entregado",
          ).length;
          const cancelados = pedidosData.filter(
            (p) => p.estado?.toLowerCase() === "cancelado",
          ).length;
          const totalAmount = pedidosData.reduce((sum, p) => {
            const amount = Number(p.total) || 0;
            return isNaN(amount) ? sum : sum + amount;
          }, 0);
          const promedio = total > 0 ? totalAmount / total : 0;

          setStats({
            total,
            pendientes,
            entregados,
            cancelados,
            promedio,
            totalRevenue: totalAmount,
          });

          // Detectar pedidos pendientes antiguos
          const newNotifications = [];
          const now = new Date();

          pedidosData.forEach((pedido) => {
            if (pedido.estado?.toLowerCase() === "pendiente") {
              try {
                const pedidoDate = new Date(pedido.fecha || pedido.created_at);
                if (!isNaN(pedidoDate.getTime())) {
                  const hoursDiff = (now - pedidoDate) / (1000 * 60 * 60);

                  if (hoursDiff > 24) {
                    newNotifications.push({
                      id: `alert-${pedido.id}`,
                      type: "warning",
                      message: `Pedido #${pedido.id} pendiente por más de 24h`,
                      time: `${Math.floor(hoursDiff)}h`,
                    });
                  }
                }
              } catch (e) {
                // Ignorar errores de fecha
              }
            }
          });

          setNotifications(newNotifications.slice(0, 3));
          setLastUpdate(new Date());
          setApiStatus("online");
        } else {
          throw new Error("Formato de respuesta inválido del servidor");
        }
      } catch (error) {
        console.error("❌ Error cargando pedidos:", error);

        let errorMessage = "Error al cargar los pedidos";
        if (error.message.includes("Failed to fetch")) {
          errorMessage =
            "No se pudo conectar al servidor. Verifica tu conexión.";
          setApiStatus("offline");
        } else {
          errorMessage = error.message;
        }

        setError(errorMessage);
        setPedidos([]);
        setStats({
          total: 0,
          pendientes: 0,
          entregados: 0,
          cancelados: 0,
          promedio: 0,
          totalRevenue: 0,
        });
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [buscar, fechaInicio, fechaFin, estadoFiltro, loading, checkConnection],
  );

  // 🎯 Efecto inicial
  useEffect(() => {
    isMounted.current = true;

    // Cargar datos iniciales
    fetchPedidos(1);

    return () => {
      isMounted.current = false;
    };
  }, []);

  // 🎯 Efecto para filtros con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMounted.current) {
        fetchPedidos(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [buscar, fechaInicio, fechaFin, estadoFiltro, fetchPedidos]);

  // 🎯 Memoized pedidos filtrados
  const pedidosFiltrados = useMemo(() => {
    if (!Array.isArray(pedidos)) return [];

    let filtered = [...pedidos];

    // Filtrar por estado
    if (estadoFiltro !== "todos") {
      filtered = filtered.filter((p) => {
        const estado = (p.estado || "").toLowerCase();
        return estado === estadoFiltro.toLowerCase();
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      try {
        const fechaA = new Date(a.fecha || a.created_at || 0);
        const fechaB = new Date(b.fecha || b.created_at || 0);
        const totalA = Number(a.total) || 0;
        const totalB = Number(b.total) || 0;

        switch (ordenarPor) {
          case "fecha_desc":
            return fechaB.getTime() - fechaA.getTime();
          case "fecha_asc":
            return fechaA.getTime() - fechaB.getTime();
          case "total_desc":
            return totalB - totalA;
          case "total_asc":
            return totalA - totalB;
          default:
            return 0;
        }
      } catch (e) {
        return 0;
      }
    });

    return filtered;
  }, [pedidos, estadoFiltro, ordenarPor]);

  // 🎯 Funciones auxiliares
  const formatFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return "Fecha inválida";

      return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Fecha inválida";
    }
  };

  const formatMoneda = (valor) => {
    try {
      const num = Number(valor);
      if (isNaN(num)) return "$0";

      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
    } catch {
      return "$0";
    }
  };

  const getEstadoColor = (estado) => {
    if (!estado) return "bg-gray-100 text-gray-800";
    const estadoLower = estado.toLowerCase();
    if (estadoLower === "pendiente") return "bg-amber-100 text-amber-800";
    if (estadoLower === "entregado") return "bg-green-100 text-green-800";
    if (estadoLower === "cancelado") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getEstadoIcon = (estado) => {
    if (!estado) return "❓";
    const estadoLower = estado.toLowerCase();
    if (estadoLower === "pendiente") return "⏳";
    if (estadoLower === "entregado") return "✅";
    if (estadoLower === "cancelado") return "❌";
    return "❓";
  };

  // 🎯 Componentes de UI
  const KPI_CARDS = useMemo(
    () => [
      {
        title: "Total Pedidos",
        value: stats.total,
        icon: ShoppingCart,
        change: `${stats.total} pedidos`,
        color: "from-blue-500 to-blue-600",
        format: "number",
      },
      {
        title: "Pendientes",
        value: stats.pendientes,
        icon: Clock,
        change: `${stats.total > 0 ? Math.round((stats.pendientes / stats.total) * 100) : 0}% del total`,
        color: "from-amber-500 to-amber-600",
        format: "number",
      },
      {
        title: "Entregados",
        value: stats.entregados,
        icon: CheckCircle,
        change: `${stats.total > 0 ? Math.round((stats.entregados / stats.total) * 100) : 0}% del total`,
        color: "from-green-500 to-green-600",
        format: "number",
      },
      {
        title: "Ingreso Total",
        value: stats.totalRevenue,
        icon: DollarSign,
        change: `Ticket promedio: ${formatMoneda(stats.promedio)}`,
        color: "from-purple-500 to-purple-600",
        format: "currency",
      },
    ],
    [stats],
  );

  const estados = useMemo(
    () => [
      { value: "todos", label: "Todos", icon: Package },
      { value: "pendiente", label: "Pendientes", icon: Clock },
      { value: "entregado", label: "Entregados", icon: CheckCircle },
      { value: "cancelado", label: "Cancelados", icon: XCircle },
    ],
    [],
  );

  const ordenOptions = useMemo(
    () => [
      { value: "fecha_desc", label: "Más reciente", icon: Calendar },
      { value: "fecha_asc", label: "Más antiguo", icon: Calendar },
      { value: "total_desc", label: "Mayor a menor", icon: DollarSign },
      { value: "total_asc", label: "Menor a mayor", icon: DollarSign },
    ],
    [],
  );

  // 🎯 Handlers
  const handleRefresh = () => {
    fetchPedidos(1, true);
  };

  const clearAllFilters = () => {
    setBuscar("");
    setFechaInicio("");
    setFechaFin("");
    setEstadoFiltro("todos");
    setOrdenarPor("fecha_desc");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Dashboard de Pedidos
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-gray-600 text-sm">
                    Gestión y seguimiento en tiempo real
                  </p>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      apiStatus === "online"
                        ? "bg-green-100 text-green-800"
                        : apiStatus === "offline"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {apiStatus === "online" ? (
                      <Wifi className="w-3 h-3" />
                    ) : (
                      <WifiOff className="w-3 h-3" />
                    )}
                    <span>
                      {apiStatus === "online"
                        ? "Conectado"
                        : apiStatus === "offline"
                          ? "Sin conexión"
                          : "Verificando..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notificaciones */}
            {notifications.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setNotifications([])}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
              </div>
            )}

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline text-sm">Actualizar</span>
            </button>

            <a
              href={`${API_URL}/api/exportar-productos-excel`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-sm flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Exportar</span>
            </a>
          </div>
        </div>

        {/* Notificaciones */}
        <AnimatePresence>
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <div className="flex flex-wrap gap-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>{notif.message}</span>
                    <span className="text-xs opacity-75 ml-2">
                      {notif.time}
                    </span>
                    <button
                      onClick={() =>
                        setNotifications((prev) =>
                          prev.filter((n) => n.id !== notif.id),
                        )
                      }
                      className="ml-auto text-amber-600 hover:text-amber-800"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {KPI_CARDS.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-gray-50">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="text-xs font-medium text-gray-500">
                    {kpi.change}
                  </div>
                </div>

                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {kpi.format === "currency"
                      ? formatMoneda(kpi.value)
                      : kpi.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    {kpi.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTROS */}
      <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o dirección..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {estados.map((estado) => {
              const Icon = estado.icon;
              const isActive = estadoFiltro === estado.value;

              return (
                <button
                  key={estado.value}
                  onClick={() => setEstadoFiltro(estado.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {estado.label}
                </button>
              );
            })}

            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
                mostrarFiltros
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              Más filtros
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mostrarFiltros ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* FILTROS AVANZADOS */}
        <AnimatePresence>
          {mostrarFiltros && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Fechas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de Fechas
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Desde
                        </label>
                        <input
                          type="date"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ordenar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={ordenarPor}
                      onChange={(e) => setOrdenarPor(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {ordenOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col justify-end space-y-3">
                    <button
                      onClick={clearAllFilters}
                      className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                    <button
                      onClick={() => fetchPedidos(1)}
                      className="w-full px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LISTA DE PEDIDOS */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-700" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Pedidos ({pedidosFiltrados.length})
                </h2>
                {lastUpdate && (
                  <p className="text-sm text-gray-500">
                    Actualizado: {formatFecha(lastUpdate)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Página {paginacion.pagina} de {paginacion.totalPages}
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        {loading && pedidos.length === 0 ? (
          <div className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Cargando pedidos...</p>
            </div>
          </div>
        ) : error && pedidos.length === 0 ? (
          <div className="py-12">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <AlertTriangle className="w-16 h-16 text-red-300 mb-4" />
              <p className="text-gray-700 font-medium mb-2">
                No se pudieron cargar los pedidos
              </p>
              <p className="text-gray-500 text-sm mb-6 max-w-md">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="py-12">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-700 font-medium mb-2">
                {pedidos.length === 0
                  ? "No hay pedidos registrados"
                  : "No hay resultados con los filtros actuales"}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {pedidos.length === 0
                  ? "Cuando realices ventas, aparecerán aquí."
                  : "Intenta cambiar los filtros de búsqueda."}
              </p>
              {pedidos.length === 0 ? (
                <button
                  onClick={handleRefresh}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Actualizar
                </button>
              ) : (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {pedidosFiltrados.map((pedido) => (
                <div
                  key={pedido.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900 text-lg">
                                #{pedido.id}
                              </span>
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}
                              >
                                {getEstadoIcon(pedido.estado)}{" "}
                                {pedido.estado || "Desconocido"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatFecha(pedido.fecha || pedido.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Cliente
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {pedido.nombre || "Cliente no especificado"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {pedido.telefono || "Sin teléfono"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Dirección
                          </p>
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-900">
                                {pedido.direccion || "No especificada"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:text-right">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Total</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatMoneda(pedido.total || 0)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setDetalle(pedido)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        <a
                          href={`/admin/orden-servicio/${pedido.id}`}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          Orden
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINACIÓN */}
            {paginacion.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Mostrando {pedidosFiltrados.length} de {paginacion.total}{" "}
                    pedidos
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchPedidos(paginacion.pagina - 1)}
                      disabled={paginacion.pagina <= 1}
                      className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Anterior
                    </button>

                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages = [];
                        const maxVisible = 5;

                        if (paginacion.totalPages <= maxVisible) {
                          for (let i = 1; i <= paginacion.totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          let start = Math.max(1, paginacion.pagina - 2);
                          let end = Math.min(
                            paginacion.totalPages,
                            start + maxVisible - 1,
                          );

                          if (end - start < maxVisible - 1) {
                            start = Math.max(1, end - maxVisible + 1);
                          }

                          if (start > 1) pages.push(1, "...");
                          for (let i = start; i <= end; i++) pages.push(i);
                          if (end < paginacion.totalPages)
                            pages.push("...", paginacion.totalPages);
                        }

                        return pages.map((page, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              typeof page === "number" && fetchPedidos(page)
                            }
                            disabled={
                              page === "..." || paginacion.pagina === page
                            }
                            className={`w-8 h-8 rounded text-sm font-medium ${
                              paginacion.pagina === page
                                ? "bg-red-500 text-white"
                                : page === "..."
                                  ? "text-gray-400 cursor-default"
                                  : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        ));
                      })()}
                    </div>

                    <button
                      onClick={() => fetchPedidos(paginacion.pagina + 1)}
                      disabled={paginacion.pagina >= paginacion.totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DE DETALLE */}
      <AnimatePresence>
        {detalle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setDetalle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Pedido #{detalle.id}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(detalle.estado)}`}
                        >
                          {getEstadoIcon(detalle.estado)}{" "}
                          {detalle.estado || "Desconocido"}
                        </span>
                        <span className="text-red-100">
                          {formatFecha(detalle.fecha)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-100 text-sm mb-1">
                      Total del pedido
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {formatMoneda(detalle.total || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                      Información del Cliente
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Nombre completo
                          </p>
                          <p className="font-medium text-gray-900">
                            {detalle.nombre || "No especificado"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p className="font-medium text-gray-900">
                            {detalle.telefono || "No especificado"}
                          </p>
                        </div>
                      </div>

                      {detalle.email && (
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Correo electrónico
                            </p>
                            <p className="font-medium text-gray-900">
                              {detalle.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                      Dirección de Envío
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Dirección</p>
                          <p className="font-medium text-gray-900">
                            {detalle.direccion || "No especificada"}
                          </p>
                        </div>
                      </div>

                      {(detalle.ciudad_nombre || detalle.ciudad) && (
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Ubicación</p>
                            <p className="font-medium text-gray-900">
                              {detalle.ciudad_nombre || detalle.ciudad}
                              {detalle.departamento_nombre &&
                                `, ${detalle.departamento_nombre}`}
                            </p>
                          </div>
                        </div>
                      )}

                      {detalle.costo_envio > 0 && (
                        <div className="flex items-start gap-3">
                          <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Costo de envío
                            </p>
                            <p className="font-medium text-gray-900">
                              {formatMoneda(detalle.costo_envio)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {detalle.notas && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                      Notas Adicionales
                    </h3>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-gray-700">{detalle.notas}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setDetalle(null)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cerrar
                  </button>
                  <a
                    href={`/admin/orden-servicio/${detalle.id}`}
                    className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Ver Orden Completa
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>
          Dashboard Seguro •{" "}
          {apiStatus === "online" ? "Conectado a la API" : "Modo local"} • v1.0
        </p>
        <p className="mt-1">
          Sistema de gestión de pedidos • Protegido con encriptación
        </p>
      </div>
    </div>
  );
}

// import { useEffect, useState, useMemo } from "react";
// import {
//   Search,
//   Filter,
//   Download,
//   Eye,
//   Package,
//   DollarSign,
//   User,
//   Clock,
//   CheckCircle,
//   XCircle,
//   RefreshCw,
//   ShoppingCart,
//   Truck,
//   CreditCard,
//   MessageSquare,
//   Phone,
//   MapPin,
//   Calendar,
// } from "lucide-react";
// import { API_URL } from "../../config";
// import { motion, AnimatePresence } from "framer-motion";

// export default function Dashboard() {
//   const [pedidos, setPedidos] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [stats, setStats] = useState({
//     total: 0,
//     pendientes: 0,
//     entregados: 0,
//     cancelados: 0,
//     promedio: 0,
//   });

//   // Filtros
//   const [buscar, setBuscar] = useState("");
//   const [fechaInicio, setFechaInicio] = useState("");
//   const [fechaFin, setFechaFin] = useState("");
//   const [estadoFiltro, setEstadoFiltro] = useState("todos");
//   const [ordenarPor, setOrdenarPor] = useState("fecha_desc");
//   const [detalle, setDetalle] = useState(null);
//   const [mostrarFiltros, setMostrarFiltros] = useState(false);
//   const [paginacion, setPaginacion] = useState({
//     pagina: 1,
//     total: 0,
//     totalPages: 1,
//   });

//   const fetchPedidos = async (pagina = 1) => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Construir parámetros según lo que espera el backend
//       const params = new URLSearchParams({
//         page: pagina.toString(),
//         limit: "10",
//       });

//       // Solo añadir filtros si tienen valor
//       if (buscar.trim()) {
//         params.append("search", buscar.trim());
//       }

//       if (fechaInicio) {
//         params.append("inicio", fechaInicio);
//       }

//       if (fechaFin) {
//         params.append("fin", fechaFin);
//       }

//       // IMPORTANTE: Tu backend usa "entregado" no "completado"
//       if (estadoFiltro !== "todos") {
//         params.append("estado", estadoFiltro);
//       }

//       console.log(
//         `🔍 Fetching: ${API_URL}/api/pedidos-completo?${params.toString()}`,
//       );

//       const res = await fetch(
//         `${API_URL}/api/pedidos-completo?${params.toString()}`,
//         {
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       console.log("📊 Response status:", res.status);

//       if (!res.ok) {
//         throw new Error(`Error ${res.status}: ${res.statusText}`);
//       }

//       const data = await res.json();
//       console.log("✅ API Response:", data);

//       // Verificar estructura de respuesta
//       if (data && data.ok === true) {
//         // Formato correcto: { ok: true, results: [], total: X, totalPages: X, page: X }
//         setPedidos(data.results || []);
//         setPaginacion({
//           pagina: data.page || pagina,
//           total: data.total || 0,
//           totalPages: data.totalPages || 1,
//         });
//         calcularEstadisticas(data.results || []);
//       } else {
//         console.warn("⚠️ Formato de respuesta inesperado:", data);
//         setPedidos([]);
//         calcularEstadisticas([]);
//         setError("Formato de datos incorrecto del servidor");
//       }
//     } catch (error) {
//       console.error("❌ Error cargando pedidos:", error);
//       setError(error.message || "Error al conectar con el servidor");
//       setPedidos([]);
//       calcularEstadisticas([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calcularEstadisticas = (pedidosData) => {
//     if (!Array.isArray(pedidosData) || pedidosData.length === 0) {
//       setStats({
//         total: 0,
//         pendientes: 0,
//         entregados: 0,
//         cancelados: 0,
//         promedio: 0,
//       });
//       return;
//     }

//     const total = pedidosData.length;

//     // IMPORTANTE: Tu backend usa "entregado" no "completado"
//     const pendientes = pedidosData.filter(
//       (p) => p.estado?.toLowerCase() === "pendiente",
//     ).length;

//     const entregados = pedidosData.filter(
//       (p) => p.estado?.toLowerCase() === "entregado",
//     ).length;

//     const cancelados = pedidosData.filter(
//       (p) => p.estado?.toLowerCase() === "cancelado",
//     ).length;

//     const totalAmount = pedidosData.reduce((sum, p) => {
//       const amount = Number(p.total) || 0;
//       return sum + amount;
//     }, 0);

//     const promedio = total > 0 ? totalAmount / total : 0;

//     setStats({
//       total,
//       pendientes,
//       entregados,
//       cancelados,
//       promedio,
//     });
//   };

//   // Carga inicial
//   useEffect(() => {
//     fetchPedidos();
//   }, []);

//   // Debounce para filtros
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchPedidos(1); // Resetear a página 1 al filtrar
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [buscar, fechaInicio, fechaFin, estadoFiltro]);

//   const pedidosFiltrados = useMemo(() => {
//     // Ya vienen filtrados del backend, pero podemos aplicar filtros adicionales
//     let filtered = [...pedidos];

//     // Filtrar por estado (si no se filtró en el backend)
//     if (estadoFiltro !== "todos") {
//       filtered = filtered.filter((p) => {
//         const estado = p.estado?.toLowerCase() || "";
//         return estado === estadoFiltro.toLowerCase();
//       });
//     }

//     // Ordenar
//     filtered.sort((a, b) => {
//       const fechaA = new Date(a.fecha || a.created_at || 0);
//       const fechaB = new Date(b.fecha || b.created_at || 0);
//       const totalA = Number(a.total) || 0;
//       const totalB = Number(b.total) || 0;

//       switch (ordenarPor) {
//         case "fecha_desc":
//           return fechaB - fechaA;
//         case "fecha_asc":
//           return fechaA - fechaB;
//         case "total_desc":
//           return totalB - totalA;
//         case "total_asc":
//           return totalA - totalB;
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
//       icon: ShoppingCart,
//       change: `${stats.total} pedidos`,
//       color: "border-l-blue-500",
//       bg: "bg-blue-50",
//     },
//     {
//       title: "Pendientes",
//       value: stats.pendientes,
//       icon: Clock,
//       change: `${stats.total > 0 ? Math.round((stats.pendientes / stats.total) * 100) : 0}% del total`,
//       color: "border-l-amber-500",
//       bg: "bg-amber-50",
//     },
//     {
//       title: "Entregados", // CAMBIADO: de "Completados" a "Entregados"
//       value: stats.entregados,
//       icon: CheckCircle,
//       change: `${stats.total > 0 ? Math.round((stats.entregados / stats.total) * 100) : 0}% del total`,
//       color: "border-l-green-500",
//       bg: "bg-green-50",
//     },
//     {
//       title: "Ticket Promedio",
//       value: `$${stats.promedio.toLocaleString("es-CO", {
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0,
//       })}`,
//       icon: DollarSign,
//       change: "por pedido",
//       color: "border-l-purple-500",
//       bg: "bg-purple-50",
//     },
//   ];

//   // CAMBIADO: "entregado" en lugar de "completado"
//   const estados = [
//     { value: "todos", label: "Todos", icon: Package },
//     { value: "pendiente", label: "Pendientes", icon: Clock },
//     { value: "entregado", label: "Entregados", icon: CheckCircle },
//     { value: "cancelado", label: "Cancelados", icon: XCircle },
//   ];

//   const ordenOptions = [
//     { value: "fecha_desc", label: "Más reciente" },
//     { value: "fecha_asc", label: "Más antiguo" },
//     { value: "total_desc", label: "Mayor a menor" },
//     { value: "total_asc", label: "Menor a mayor" },
//   ];

//   const formatFecha = (fecha) => {
//     if (!fecha) return "Sin fecha";

//     try {
//       const date = new Date(fecha);
//       if (isNaN(date.getTime())) return fecha;

//       return new Intl.DateTimeFormat("es-CO", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       }).format(date);
//     } catch {
//       return fecha;
//     }
//   };

//   const formatMoneda = (valor) => {
//     const num = Number(valor) || 0;
//     return new Intl.NumberFormat("es-CO", {
//       style: "currency",
//       currency: "COP",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(num);
//   };

//   const getEstadoColor = (estado) => {
//     if (!estado) return "bg-gray-100 text-gray-800";

//     const estadoLower = estado.toLowerCase();
//     if (estadoLower === "pendiente") return "bg-amber-100 text-amber-800";
//     if (estadoLower === "entregado") return "bg-green-100 text-green-800"; // CAMBIADO
//     if (estadoLower === "cancelado") return "bg-red-100 text-red-800";
//     return "bg-gray-100 text-gray-800";
//   };

//   const getEstadoIcon = (estado) => {
//     if (!estado) return "❓";

//     const estadoLower = estado.toLowerCase();
//     if (estadoLower === "pendiente") return "⏳";
//     if (estadoLower === "entregado") return "✅"; // CAMBIADO
//     if (estadoLower === "cancelado") return "❌";
//     return "❓";
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-3 md:p-6">
//       {/* HEADER */}
//       <div className="mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               Dashboard de Pedidos
//             </h1>
//             <p className="text-gray-500 text-sm">
//               Gestión y seguimiento de pedidos
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => fetchPedidos(paginacion.pagina)}
//               disabled={loading}
//               className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
//               title="Actualizar"
//             >
//               <RefreshCw
//                 className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
//               />
//             </button>
//             <a
//               href={`${API_URL}/api/exportar-productos-excel`}
//               target="_blank"
//               rel="noreferrer"
//               className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
//               title="Exportar a Excel"
//             >
//               <Download className="w-5 h-5" />
//             </a>
//           </div>
//         </div>

//         {/* Mensaje de error */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <div className="flex items-start gap-3">
//               <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
//               <div className="flex-1">
//                 <p className="text-sm font-medium text-red-800">
//                   Error al cargar pedidos
//                 </p>
//                 <p className="text-sm text-red-600 mt-1">{error}</p>
//                 <div className="mt-3 flex gap-2">
//                   <button
//                     onClick={() => fetchPedidos()}
//                     className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
//                   >
//                     Reintentar
//                   </button>
//                   <button
//                     onClick={() => setError(null)}
//                     className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition-colors"
//                   >
//                     Descartar
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* KPI CARDS */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           {KPI_CARDS.map((kpi, index) => {
//             const Icon = kpi.icon;
//             return (
//               <div
//                 key={index}
//                 className={`${kpi.bg} border-l-4 ${kpi.color} rounded-lg p-4 shadow-sm hover:shadow transition-shadow`}
//               >
//                 <div className="flex items-center justify-between mb-2">
//                   <Icon className="w-5 h-5 text-gray-600" />
//                   <span className="text-xs text-gray-500 font-medium">
//                     {kpi.change}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {kpi.value}
//                   </p>
//                   <p className="text-sm text-gray-600 font-medium">
//                     {kpi.title}
//                   </p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* FILTROS */}
//       <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//           {/* Barra de búsqueda */}
//           <div className="relative flex-1 max-w-lg">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Buscar por nombre, teléfono o dirección..."
//               value={buscar}
//               onChange={(e) => setBuscar(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
//             />
//           </div>

//           {/* Botones de estado - CAMBIADO: "entregado" en lugar de "completado" */}
//           <div className="flex flex-wrap gap-2">
//             {estados.map((estado) => {
//               const Icon = estado.icon;
//               const isActive = estadoFiltro === estado.value;

//               return (
//                 <button
//                   key={estado.value}
//                   onClick={() => setEstadoFiltro(estado.value)}
//                   className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
//                     isActive
//                       ? "bg-red-500 text-white shadow-sm"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   <Icon className="w-4 h-4" />
//                   {estado.label}
//                   {isActive && estadoFiltro !== "todos" && (
//                     <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-xs">
//                       {estado.value === "pendiente"
//                         ? stats.pendientes
//                         : estado.value === "entregado" // CAMBIADO
//                           ? stats.entregados
//                           : estado.value === "cancelado"
//                             ? stats.cancelados
//                             : 0}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}

//             <button
//               onClick={() => setMostrarFiltros(!mostrarFiltros)}
//               className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
//                 mostrarFiltros
//                   ? "bg-gray-800 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               <Filter className="w-4 h-4" />
//               Filtros
//             </button>
//           </div>
//         </div>

//         {/* Filtros avanzados */}
//         <AnimatePresence>
//           {mostrarFiltros && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               className="overflow-hidden"
//             >
//               <div className="mt-6 pt-6 border-t border-gray-200">
//                 <h3 className="text-sm font-semibold text-gray-900 mb-4">
//                   Filtros Avanzados
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* Fechas */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Rango de Fechas
//                     </label>
//                     <div className="space-y-3">
//                       <div>
//                         <label className="block text-xs text-gray-500 mb-1">
//                           Desde
//                         </label>
//                         <input
//                           type="date"
//                           value={fechaInicio}
//                           onChange={(e) => setFechaInicio(e.target.value)}
//                           className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs text-gray-500 mb-1">
//                           Hasta
//                         </label>
//                         <input
//                           type="date"
//                           value={fechaFin}
//                           onChange={(e) => setFechaFin(e.target.value)}
//                           className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Ordenar */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Ordenar por
//                     </label>
//                     <select
//                       value={ordenarPor}
//                       onChange={(e) => setOrdenarPor(e.target.value)}
//                       className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                     >
//                       {ordenOptions.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Acciones */}
//                   <div className="flex items-end">
//                     <div className="space-y-3 w-full">
//                       <button
//                         onClick={() => {
//                           setFechaInicio("");
//                           setFechaFin("");
//                           setEstadoFiltro("todos");
//                           setOrdenarPor("fecha_desc");
//                           setBuscar("");
//                         }}
//                         className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
//                       >
//                         Limpiar Filtros
//                       </button>
//                       <button
//                         onClick={() => fetchPedidos(1)}
//                         className="w-full px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
//                       >
//                         Aplicar Filtros
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* LISTA DE PEDIDOS */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         {/* Header tabla */}
//         <div className="px-6 py-4 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold text-gray-900">
//               Pedidos ({pedidosFiltrados.length})
//             </h2>
//             <div className="text-sm text-gray-500">
//               Página {paginacion.pagina} de {paginacion.totalPages}
//             </div>
//           </div>
//         </div>

//         {/* Contenido */}
//         {loading ? (
//           <div className="py-12">
//             <div className="flex flex-col items-center justify-center">
//               <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
//               <p className="text-gray-600 font-medium">Cargando pedidos...</p>
//               <p className="text-gray-500 text-sm mt-1">Por favor espera</p>
//             </div>
//           </div>
//         ) : error && pedidos.length === 0 ? (
//           <div className="py-12">
//             <div className="flex flex-col items-center justify-center text-center px-4">
//               <XCircle className="w-16 h-16 text-red-300 mb-4" />
//               <p className="text-gray-700 font-medium mb-2">
//                 No se pudieron cargar los pedidos
//               </p>
//               <p className="text-gray-500 text-sm mb-6 max-w-md">{error}</p>
//               <button
//                 onClick={() => fetchPedidos()}
//                 className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
//               >
//                 Reintentar
//               </button>
//             </div>
//           </div>
//         ) : pedidosFiltrados.length === 0 ? (
//           <div className="py-12">
//             <div className="flex flex-col items-center justify-center text-center px-4">
//               <Package className="w-16 h-16 text-gray-300 mb-4" />
//               <p className="text-gray-700 font-medium mb-2">
//                 {pedidos.length === 0
//                   ? "No hay pedidos registrados"
//                   : "No hay resultados con los filtros actuales"}
//               </p>
//               <p className="text-gray-500 text-sm mb-6">
//                 {pedidos.length === 0
//                   ? "Cuando realices ventas, aparecerán aquí."
//                   : "Intenta cambiar los filtros de búsqueda."}
//               </p>
//               {pedidos.length === 0 && (
//                 <button
//                   onClick={() => fetchPedidos()}
//                   className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   Actualizar
//                 </button>
//               )}
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Lista de pedidos - Cards */}
//             <div className="divide-y divide-gray-100">
//               {pedidosFiltrados.map((pedido) => (
//                 <div
//                   key={pedido.id}
//                   className="p-6 hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex flex-col lg:flex-row lg:items-center gap-6">
//                     {/* Información principal */}
//                     <div className="flex-1">
//                       <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
//                         <div className="flex items-center gap-3">
//                           <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
//                             <ShoppingCart className="w-5 h-5 text-gray-600" />
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <span className="font-mono font-bold text-gray-900 text-lg">
//                                 #{pedido.id}
//                               </span>
//                               <span
//                                 className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}
//                               >
//                                 {getEstadoIcon(pedido.estado)}{" "}
//                                 {pedido.estado || "Desconocido"}
//                               </span>
//                             </div>
//                             <p className="text-sm text-gray-500 mt-1">
//                               {formatFecha(pedido.fecha || pedido.created_at)}
//                             </p>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {/* Cliente */}
//                         <div>
//                           <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
//                             Cliente
//                           </p>
//                           <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
//                               <User className="w-4 h-4 text-red-600" />
//                             </div>
//                             <div>
//                               <p className="font-medium text-gray-900">
//                                 {pedido.nombre || "Cliente no especificado"}
//                               </p>
//                               <div className="flex items-center gap-2 mt-1">
//                                 <Phone className="w-3 h-3 text-gray-400" />
//                                 <span className="text-sm text-gray-600">
//                                   {pedido.telefono || "Sin teléfono"}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Dirección */}
//                         <div>
//                           <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
//                             Dirección
//                           </p>
//                           <div className="flex items-start gap-3">
//                             <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
//                             <div>
//                               <p className="text-sm text-gray-900">
//                                 {pedido.direccion || "No especificada"}
//                               </p>
//                               <p className="text-sm text-gray-600 mt-1">
//                                 {pedido.ciudad_nombre || pedido.ciudad || ""}
//                                 {pedido.departamento_nombre
//                                   ? `, ${pedido.departamento_nombre}`
//                                   : ""}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Total y acciones */}
//                     <div className="lg:text-right">
//                       <div className="mb-4">
//                         <p className="text-sm text-gray-500 mb-1">Total</p>
//                         <p className="text-2xl font-bold text-red-600">
//                           {formatMoneda(pedido.total || 0)}
//                         </p>
//                         {pedido.costo_envio > 0 && (
//                           <p className="text-sm text-gray-500 mt-1">
//                             Envío: {formatMoneda(pedido.costo_envio)}
//                           </p>
//                         )}
//                       </div>

//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => setDetalle(pedido)}
//                           className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
//                         >
//                           <Eye className="w-4 h-4" />
//                           Ver
//                         </button>
//                         <a
//                           href={`/admin/orden-servicio/${pedido.id}`}
//                           className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
//                         >
//                           <CreditCard className="w-4 h-4" />
//                           Orden
//                         </a>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Paginación */}
//             {paginacion.totalPages > 1 && (
//               <div className="px-6 py-4 border-t border-gray-200">
//                 <div className="flex items-center justify-between">
//                   <div className="text-sm text-gray-500">
//                     Mostrando {pedidosFiltrados.length} de {paginacion.total}{" "}
//                     pedidos
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => fetchPedidos(paginacion.pagina - 1)}
//                       disabled={paginacion.pagina <= 1}
//                       className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       ← Anterior
//                     </button>

//                     <div className="flex items-center gap-1">
//                       {Array.from(
//                         { length: Math.min(5, paginacion.totalPages) },
//                         (_, i) => {
//                           let pageNum;
//                           if (paginacion.totalPages <= 5) {
//                             pageNum = i + 1;
//                           } else if (paginacion.pagina <= 3) {
//                             pageNum = i + 1;
//                           } else if (
//                             paginacion.pagina >=
//                             paginacion.totalPages - 2
//                           ) {
//                             pageNum = paginacion.totalPages - 4 + i;
//                           } else {
//                             pageNum = paginacion.pagina - 2 + i;
//                           }

//                           return (
//                             <button
//                               key={pageNum}
//                               onClick={() => fetchPedidos(pageNum)}
//                               className={`w-8 h-8 rounded text-sm font-medium ${
//                                 paginacion.pagina === pageNum
//                                   ? "bg-red-500 text-white"
//                                   : "text-gray-700 hover:bg-gray-100"
//                               }`}
//                             >
//                               {pageNum}
//                             </button>
//                           );
//                         },
//                       )}
//                     </div>

//                     <button
//                       onClick={() => fetchPedidos(paginacion.pagina + 1)}
//                       disabled={paginacion.pagina >= paginacion.totalPages}
//                       className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       Siguiente →
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* MODAL DE DETALLE */}
//       <AnimatePresence>
//         {detalle && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
//             onClick={() => setDetalle(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.95, opacity: 0, y: 20 }}
//               onClick={(e) => e.stopPropagation()}
//               className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
//             >
//               {/* Header */}
//               <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
//                       <ShoppingCart className="w-6 h-6 text-white" />
//                     </div>
//                     <div>
//                       <h2 className="text-2xl font-bold text-white">
//                         Pedido #{detalle.id}
//                       </h2>
//                       <div className="flex items-center gap-3 mt-2">
//                         <span
//                           className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(detalle.estado)}`}
//                         >
//                           {getEstadoIcon(detalle.estado)}{" "}
//                           {detalle.estado || "Desconocido"}
//                         </span>
//                         <span className="text-red-100">
//                           {formatFecha(detalle.fecha)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-red-100 text-sm mb-1">
//                       Total del pedido
//                     </p>
//                     <p className="text-3xl font-bold text-white">
//                       {formatMoneda(detalle.total || 0)}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Contenido */}
//               <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                   {/* Información del cliente */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
//                       Información del Cliente
//                     </h3>
//                     <div className="space-y-4">
//                       <div className="flex items-start gap-3">
//                         <User className="w-5 h-5 text-gray-400 mt-0.5" />
//                         <div>
//                           <p className="text-sm text-gray-500">
//                             Nombre completo
//                           </p>
//                           <p className="font-medium text-gray-900">
//                             {detalle.nombre || "No especificado"}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex items-start gap-3">
//                         <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
//                         <div>
//                           <p className="text-sm text-gray-500">Teléfono</p>
//                           <p className="font-medium text-gray-900">
//                             {detalle.telefono || "No especificado"}
//                           </p>
//                         </div>
//                       </div>

//                       {detalle.email && (
//                         <div className="flex items-start gap-3">
//                           <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
//                           <div>
//                             <p className="text-sm text-gray-500">
//                               Correo electrónico
//                             </p>
//                             <p className="font-medium text-gray-900">
//                               {detalle.email}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Dirección de envío */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
//                       Dirección de Envío
//                     </h3>
//                     <div className="space-y-4">
//                       <div className="flex items-start gap-3">
//                         <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
//                         <div>
//                           <p className="text-sm text-gray-500">Dirección</p>
//                           <p className="font-medium text-gray-900">
//                             {detalle.direccion || "No especificada"}
//                           </p>
//                         </div>
//                       </div>

//                       {(detalle.ciudad_nombre || detalle.ciudad) && (
//                         <div className="flex items-start gap-3">
//                           <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
//                           <div>
//                             <p className="text-sm text-gray-500">Ubicación</p>
//                             <p className="font-medium text-gray-900">
//                               {detalle.ciudad_nombre || detalle.ciudad}
//                               {detalle.departamento_nombre &&
//                                 `, ${detalle.departamento_nombre}`}
//                             </p>
//                           </div>
//                         </div>
//                       )}

//                       {detalle.costo_envio > 0 && (
//                         <div className="flex items-start gap-3">
//                           <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
//                           <div>
//                             <p className="text-sm text-gray-500">
//                               Costo de envío
//                             </p>
//                             <p className="font-medium text-gray-900">
//                               {formatMoneda(detalle.costo_envio)}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Método de pago si existe */}
//                 {detalle.metodo_pago && (
//                   <div className="mt-8">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
//                       Método de Pago
//                     </h3>
//                     <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//                       <CreditCard className="w-5 h-5 text-gray-600" />
//                       <span className="font-medium text-gray-900">
//                         {detalle.metodo_pago}
//                       </span>
//                     </div>
//                   </div>
//                 )}

//                 {/* Notas */}
//                 {detalle.notas && (
//                   <div className="mt-8">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
//                       Notas Adicionales
//                     </h3>
//                     <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
//                       <p className="text-gray-700">{detalle.notas}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Footer */}
//               <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
//                 <div className="flex items-center justify-between">
//                   <button
//                     onClick={() => setDetalle(null)}
//                     className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
//                   >
//                     Cerrar
//                   </button>
//                   <a
//                     href={`/admin/orden-servicio/${detalle.id}`}
//                     className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
//                   >
//                     <CreditCard className="w-5 h-5" />
//                     Ver Orden Completa
//                   </a>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
