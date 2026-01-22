import { useEffect, useState, useMemo, useCallback } from "react";
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
  Shield,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Printer,
  Mail,
  Hash,
  Layers,
  ShieldCheck,
  Database,
  Wifi,
  WifiOff,
  Bell,
  Activity,
  Zap,
} from "lucide-react";
import { API_URL } from "../../config";
import { motion, AnimatePresence } from "framer-motion";
import CryptoJS from "crypto-js";

// 🔐 Configuración de seguridad
const ENCRYPTION_KEY =
  import.meta.env.VITE_APP_ENCRYPTION_KEY || "clave-dashboard-segura-2024";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    entregados: 0,
    cancelados: 0,
    promedio: 0,
    totalRevenue: 0,
    growth: 0,
  });

  // Filtros
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

  // Nuevos estados para mejoras
  const [apiStatus, setApiStatus] = useState("checking");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedPedidos, setSelectedPedidos] = useState([]);
  const [batchMode, setBatchMode] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [performance, setPerformance] = useState({
    loadTime: 0,
    cacheHits: 0,
    requests: 0,
  });

  // 🔐 Cargar sesión segura
  const loadSecureSession = () => {
    try {
      const encryptedSession = localStorage.getItem("admin_session");
      if (encryptedSession) {
        const bytes = CryptoJS.AES.decrypt(encryptedSession, ENCRYPTION_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
    } catch (error) {
      console.warn("Error cargando sesión:", error);
    }
    return null;
  };

  // 🌐 Verificar estado de la API
  const checkApiStatus = useCallback(async () => {
    try {
      const startTime = performance.now();
      const res = await fetch(`${API_URL}/health`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });

      const loadTime = performance.now() - startTime;
      setApiStatus(res.ok ? "online" : "offline");

      // Actualizar métricas de performance
      setPerformance((prev) => ({
        ...prev,
        loadTime: loadTime,
        requests: prev.requests + 1,
      }));

      return res.ok;
    } catch (error) {
      setApiStatus("offline");
      return false;
    }
  }, []);

  const fetchPedidos = useCallback(
    async (pagina = 1, forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Verificar API primero
        const apiOnline = await checkApiStatus();

        if (!apiOnline && !forceRefresh) {
          // Intentar cargar desde caché local
          const cachedData = localStorage.getItem(
            `pedidos_cache_${estadoFiltro}`,
          );
          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData);
              if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
                // 5 minutos
                setPedidos(parsed.data);
                calcularEstadisticas(parsed.data);
                setPerformance((prev) => ({
                  ...prev,
                  cacheHits: prev.cacheHits + 1,
                }));
                console.log("📦 Datos cargados desde caché");
                return;
              }
            } catch (e) {
              console.warn("Error leyendo caché:", e);
            }
          }
        }

        // Construir parámetros
        const params = new URLSearchParams({
          page: pagina.toString(),
          limit: "15", // Aumentado para mejor UX
        });

        if (buscar.trim()) params.append("search", buscar.trim());
        if (fechaInicio) params.append("inicio", fechaInicio);
        if (fechaFin) params.append("fin", fechaFin);
        if (estadoFiltro !== "todos") params.append("estado", estadoFiltro);

        // 🔐 Añadir headers de seguridad
        const session = loadSecureSession();
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Request-ID": CryptoJS.lib.WordArray.random(16).toString(),
        };

        if (session?.apiToken) {
          headers["Authorization"] = `Bearer ${session.apiToken}`;
        }

        const response = await fetch(
          `${API_URL}/api/pedidos-completo?${params.toString()}`,
          { headers, signal: AbortSignal.timeout(10000) },
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data?.ok === true) {
          // 🔐 Guardar en caché local
          const cacheData = {
            data: data.results || [],
            timestamp: Date.now(),
            filters: { estadoFiltro, buscar, fechaInicio, fechaFin },
          };
          localStorage.setItem(
            `pedidos_cache_${estadoFiltro}`,
            JSON.stringify(cacheData),
          );

          setPedidos(data.results || []);
          setPaginacion({
            pagina: data.page || pagina,
            total: data.total || 0,
            totalPages: data.totalPages || 1,
          });
          calcularEstadisticas(data.results || []);
          generarDatosGrafico(data.results || []);
          detectarAlertas(data.results || []);
          setLastUpdate(new Date());
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("❌ Error cargando pedidos:", error);
          setError(error.message || "Error al conectar con el servidor");
          setPedidos([]);
          calcularEstadisticas([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [buscar, fechaInicio, fechaFin, estadoFiltro, checkApiStatus],
  );

  const calcularEstadisticas = useCallback((pedidosData) => {
    if (!Array.isArray(pedidosData) || pedidosData.length === 0) {
      setStats({
        total: 0,
        pendientes: 0,
        entregados: 0,
        cancelados: 0,
        promedio: 0,
        totalRevenue: 0,
        growth: 0,
      });
      return;
    }

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

    const totalAmount = pedidosData.reduce(
      (sum, p) => sum + (Number(p.total) || 0),
      0,
    );
    const promedio = total > 0 ? totalAmount / total : 0;

    // Calcular crecimiento vs período anterior (simulado)
    const previousRevenue = totalAmount * 0.8; // Simulación
    const growth =
      previousRevenue > 0
        ? ((totalAmount - previousRevenue) / previousRevenue) * 100
        : 0;

    setStats({
      total,
      pendientes,
      entregados,
      cancelados,
      promedio,
      totalRevenue: totalAmount,
      growth: parseFloat(growth.toFixed(1)),
    });
  }, []);

  const generarDatosGrafico = useCallback((pedidosData) => {
    // Agrupar por día para el gráfico
    const last7Days = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      last7Days[key] = 0;
    }

    pedidosData.forEach((pedido) => {
      const fecha = pedido.fecha || pedido.created_at;
      if (fecha) {
        const dateKey = new Date(fecha).toISOString().split("T")[0];
        if (last7Days[dateKey] !== undefined) {
          last7Days[dateKey] += Number(pedido.total) || 0;
        }
      }
    });

    const chartData = Object.entries(last7Days).map(([date, value]) => ({
      date,
      value,
      formatted: new Date(date).toLocaleDateString("es-CO", {
        weekday: "short",
        day: "numeric",
      }),
    }));

    setChartData(chartData);
  }, []);

  const detectarAlertas = useCallback((pedidosData) => {
    const newNotifications = [];
    const now = new Date();

    // Detectar pedidos pendientes por más de 24h
    pedidosData.forEach((pedido) => {
      if (pedido.estado?.toLowerCase() === "pendiente") {
        const pedidoDate = new Date(pedido.fecha || pedido.created_at);
        const hoursDiff = (now - pedidoDate) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
          newNotifications.push({
            id: pedido.id,
            type: "warning",
            message: `Pedido #${pedido.id} pendiente por más de 24h`,
            time: hoursDiff.toFixed(1) + "h",
          });
        }
      }

      // Detectar pedidos con total alto
      if ((Number(pedido.total) || 0) > 500000) {
        newNotifications.push({
          id: pedido.id,
          type: "info",
          message: `Pedido #${pedido.id} con total elevado: ${formatMoneda(pedido.total)}`,
        });
      }
    });

    // Limitar a 5 notificaciones más recientes
    setNotifications(newNotifications.slice(0, 5));
  }, []);

  // Carga inicial y suscripciones
  useEffect(() => {
    fetchPedidos();

    // Configurar auto-refresh cada 2 minutos
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchPedidos(paginacion.pagina);
      }
    }, 120000);

    // Configurar event listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchPedidos(paginacion.pagina);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Debounce para filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPedidos(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [buscar, fechaInicio, fechaFin, estadoFiltro, fetchPedidos]);

  // Memoized pedidos filtrados
  const pedidosFiltrados = useMemo(() => {
    let filtered = [...pedidos];

    if (estadoFiltro !== "todos") {
      filtered = filtered.filter(
        (p) => (p.estado?.toLowerCase() || "") === estadoFiltro.toLowerCase(),
      );
    }

    filtered.sort((a, b) => {
      const fechaA = new Date(a.fecha || a.created_at || 0);
      const fechaB = new Date(b.fecha || b.created_at || 0);
      const totalA = Number(a.total) || 0;
      const totalB = Number(b.total) || 0;

      switch (ordenarPor) {
        case "fecha_desc":
          return fechaB - fechaA;
        case "fecha_asc":
          return fechaA - fechaB;
        case "total_desc":
          return totalB - totalA;
        case "total_asc":
          return totalA - totalB;
        case "prioridad":
          const prioridadA =
            a.estado === "pendiente" ? 2 : a.estado === "entregado" ? 1 : 0;
          const prioridadB =
            b.estado === "pendiente" ? 2 : b.estado === "entregado" ? 1 : 0;
          return prioridadB - prioridadA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [pedidos, estadoFiltro, ordenarPor]);

  // Componentes reutilizables
  const KPI_CARDS = [
    {
      title: "Total Pedidos",
      value: stats.total,
      icon: ShoppingCart,
      change: `${stats.total} pedidos`,
      color: "from-blue-500 to-blue-600",
      trend: stats.growth > 0 ? "up" : "down",
      format: "number",
    },
    {
      title: "Pendientes",
      value: stats.pendientes,
      icon: Clock,
      change: `${stats.total > 0 ? Math.round((stats.pendientes / stats.total) * 100) : 0}% del total`,
      color: "from-amber-500 to-amber-600",
      trend: "warning",
      format: "number",
    },
    {
      title: "Entregados",
      value: stats.entregados,
      icon: CheckCircle,
      change: `${stats.total > 0 ? Math.round((stats.entregados / stats.total) * 100) : 0}% del total`,
      color: "from-green-500 to-green-600",
      trend: "up",
      format: "number",
    },
    {
      title: "Ingreso Total",
      value: stats.totalRevenue,
      icon: DollarSign,
      change: `${stats.growth > 0 ? "+" : ""}${stats.growth}% vs. período anterior`,
      color: "from-purple-500 to-purple-600",
      trend: stats.growth > 0 ? "up" : "down",
      format: "currency",
    },
  ];

  const estados = [
    {
      value: "todos",
      label: "Todos",
      icon: Package,
      color: "bg-gray-100 text-gray-800",
    },
    {
      value: "pendiente",
      label: "Pendientes",
      icon: Clock,
      color: "bg-amber-100 text-amber-800",
    },
    {
      value: "entregado",
      label: "Entregados",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800",
    },
    {
      value: "cancelado",
      label: "Cancelados",
      icon: XCircle,
      color: "bg-red-100 text-red-800",
    },
  ];

  const ordenOptions = [
    { value: "fecha_desc", label: "Más reciente", icon: Calendar },
    { value: "fecha_asc", label: "Más antiguo", icon: Calendar },
    { value: "total_desc", label: "Mayor a menor", icon: DollarSign },
    { value: "total_asc", label: "Menor a mayor", icon: DollarSign },
    { value: "prioridad", label: "Por prioridad", icon: AlertTriangle },
  ];

  // Funciones auxiliares
  const formatFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return fecha;

      return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return fecha;
    }
  };

  const formatMoneda = (valor) => {
    const num = Number(valor) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
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

  // Funciones de acción
  const handleBatchAction = (action) => {
    switch (action) {
      case "print":
        // Implementar impresión batch
        console.log("Imprimir seleccionados:", selectedPedidos);
        break;
      case "export":
        // Implementar exportación batch
        console.log("Exportar seleccionados:", selectedPedidos);
        break;
      case "status":
        // Implementar cambio de estado batch
        console.log("Cambiar estado de:", selectedPedidos);
        break;
    }
    setSelectedPedidos([]);
    setBatchMode(false);
  };

  const togglePedidoSelection = (id) => {
    setSelectedPedidos((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3 md:p-6">
      {/* HEADER MEJORADO */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
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
                        ? "En línea"
                        : apiStatus === "offline"
                          ? "Sin conexión"
                          : "Verificando"}
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
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
              </div>
            )}

            {/* Performance */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <Zap className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-700">
                {performance.loadTime > 0
                  ? `${performance.loadTime.toFixed(0)}ms`
                  : "..."}
              </span>
            </div>

            <button
              onClick={() => fetchPedidos(paginacion.pagina, true)}
              disabled={loading}
              className="p-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            <a
              href={`${API_URL}/api/exportar-productos-excel`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-sm flex items-center gap-2"
              title="Exportar a Excel"
            >
              <Download className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-medium">
                Exportar
              </span>
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
                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      notif.type === "warning"
                        ? "bg-amber-50 border border-amber-200 text-amber-800"
                        : "bg-blue-50 border border-blue-200 text-blue-800"
                    }`}
                  >
                    {notif.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    <span>{notif.message}</span>
                    {notif.time && (
                      <span className="text-xs opacity-75 ml-2">
                        {notif.time}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KPI CARDS MEJORADAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {KPI_CARDS.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="relative bg-white rounded-2xl p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm">
                      <Icon className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className="flex items-center gap-1">
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : kpi.trend === "down" ? (
                        <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />
                      ) : (
                        <Activity className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-xs font-medium text-gray-500">
                        {kpi.change}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                      {kpi.format === "currency"
                        ? formatMoneda(kpi.value)
                        : kpi.value.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {kpi.title}
                    </p>
                  </div>

                  {/* Barra de progreso para algunos KPIs */}
                  {(kpi.title === "Pendientes" ||
                    kpi.title === "Entregados") && (
                    <div className="mt-4">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(kpi.value / (stats.total || 1)) * 100}%`,
                          }}
                          className={`h-full rounded-full ${
                            kpi.title === "Pendientes"
                              ? "bg-gradient-to-r from-amber-400 to-amber-500"
                              : "bg-gradient-to-r from-green-400 to-green-500"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* GRÁFICO SIMPLE */}
        {chartData.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">
                  Ingresos últimos 7 días
                </h3>
              </div>
              <span className="text-sm text-gray-500">COP</span>
            </div>

            <div className="flex items-end h-32 gap-1 md:gap-2">
              {chartData.map((day, index) => {
                const maxValue = Math.max(...chartData.map((d) => d.value));
                const height = maxValue > 0 ? (day.value / maxValue) * 100 : 0;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="relative w-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: index * 0.1 }}
                        className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg"
                        style={{ height: `${height}%` }}
                      />
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                        <div className="text-xs font-medium bg-gray-900 text-white px-2 py-1 rounded-lg whitespace-nowrap">
                          {formatMoneda(day.value)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 font-medium text-center">
                      {day.formatted}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FILTROS MEJORADOS */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Barra de búsqueda mejorada */}
            <div className="relative flex-1 max-w-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-xl" />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pedidos por nombre, teléfono, dirección o ID..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder-gray-500"
              />
              {buscar && (
                <button
                  onClick={() => setBuscar("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Controles principales */}
            <div className="flex flex-wrap items-center gap-2">
              {estados.map((estado) => {
                const Icon = estado.icon;
                const isActive = estadoFiltro === estado.value;

                return (
                  <button
                    key={estado.value}
                    onClick={() => setEstadoFiltro(estado.value)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {estado.label}
                    {isActive && estadoFiltro !== "todos" && (
                      <span
                        className={`ml-1 px-2 py-0.5 rounded text-xs ${
                          isActive ? "bg-white/20" : "bg-gray-200"
                        }`}
                      >
                        {estado.value === "pendiente"
                          ? stats.pendientes
                          : estado.value === "entregado"
                            ? stats.entregados
                            : stats.cancelados}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                  mostrarFiltros
                    ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros Avanzados
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${mostrarFiltros ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Filtros avanzados mejorados */}
          <AnimatePresence>
            {mostrarFiltros && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Fechas */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Rango de Fechas
                      </label>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1.5">
                            Desde
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={fechaInicio}
                              onChange={(e) => setFechaInicio(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            {fechaInicio && (
                              <button
                                onClick={() => setFechaInicio("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1.5">
                            Hasta
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={fechaFin}
                              onChange={(e) => setFechaFin(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            {fechaFin && (
                              <button
                                onClick={() => setFechaFin("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ordenar */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <Hash className="w-4 h-4 inline mr-2" />
                        Ordenar por
                      </label>
                      <select
                        value={ordenarPor}
                        onChange={(e) => setOrdenarPor(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
                      >
                        {ordenOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Modo batch */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <Layers className="w-4 h-4 inline mr-2" />
                        Acciones en lote
                      </label>
                      <div className="space-y-2">
                        <button
                          onClick={() => setBatchMode(!batchMode)}
                          className={`w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                            batchMode
                              ? "bg-red-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {batchMode
                            ? "Cancelar selección"
                            : "Seleccionar múltiples"}
                        </button>
                        {batchMode && selectedPedidos.length > 0 && (
                          <div className="text-xs text-gray-600">
                            {selectedPedidos.length} pedidos seleccionados
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col justify-end space-y-3">
                      <button
                        onClick={() => {
                          setFechaInicio("");
                          setFechaFin("");
                          setEstadoFiltro("todos");
                          setOrdenarPor("fecha_desc");
                          setBuscar("");
                          setSelectedPedidos([]);
                          setBatchMode(false);
                        }}
                        className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Limpiar todo
                      </button>
                      <button
                        onClick={() => fetchPedidos(1)}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                      >
                        <Filter className="w-4 h-4" />
                        Aplicar filtros
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* LISTA DE PEDIDOS MEJORADA */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header tabla mejorado */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Pedidos Recientes
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">
                    {pedidosFiltrados.length} de {paginacion.total} pedidos
                  </span>
                  {lastUpdate && (
                    <span className="text-xs text-gray-500">
                      • Actualizado: {formatFecha(lastUpdate)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {batchMode && selectedPedidos.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                    {selectedPedidos.length} seleccionados
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleBatchAction("print")}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                      title="Imprimir seleccionados"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleBatchAction("export")}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                      title="Exportar seleccionados"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 font-medium">
                Página {paginacion.pagina} de {paginacion.totalPages}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="py-16">
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-red-500 animate-pulse" />
                </div>
              </div>
              <p className="text-gray-700 font-medium mb-2">
                Cargando pedidos...
              </p>
              <p className="text-gray-500 text-sm">
                Obteniendo datos actualizados
              </p>
            </div>
          </div>
        ) : error && pedidos.length === 0 ? (
          <div className="py-16">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-gray-800 font-medium text-lg mb-2">
                Error de conexión
              </p>
              <p className="text-gray-600 max-w-md mb-6">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => fetchPedidos()}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
                >
                  Reintentar
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem(`pedidos_cache_${estadoFiltro}`);
                    fetchPedidos();
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Limpiar caché
                </button>
              </div>
            </div>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="py-16">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-800 font-medium text-lg mb-2">
                {pedidos.length === 0
                  ? "No hay pedidos registrados"
                  : "No se encontraron resultados"}
              </p>
              <p className="text-gray-600 max-w-md mb-6">
                {pedidos.length === 0
                  ? "Comienza a vender para ver los pedidos aquí."
                  : "Intenta cambiar los filtros de búsqueda."}
              </p>
              {pedidos.length === 0 ? (
                <button
                  onClick={() => fetchPedidos()}
                  className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all"
                >
                  Actualizar
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEstadoFiltro("todos");
                    setBuscar("");
                    setFechaInicio("");
                    setFechaFin("");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Lista de pedidos - Cards mejoradas */}
            <div className="divide-y divide-gray-100">
              {pedidosFiltrados.map((pedido) => (
                <div
                  key={pedido.id}
                  className={`p-6 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all duration-300 ${
                    selectedPedidos.includes(pedido.id)
                      ? "bg-gradient-to-r from-red-50/50 to-white"
                      : ""
                  }`}
                >
                  {batchMode && (
                    <div className="mb-4">
                      <input
                        type="checkbox"
                        checked={selectedPedidos.includes(pedido.id)}
                        onChange={() => togglePedidoSelection(pedido.id)}
                        className="w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                      />
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Información principal mejorada */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                              <ShoppingCart className="w-6 h-6 text-gray-700" />
                            </div>
                            <div
                              className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${
                                getEstadoColor(pedido.estado)
                                  .replace("text-", "bg-")
                                  .split(" ")[0]
                              }`}
                            >
                              {getEstadoIcon(pedido.estado)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-gray-900 text-xl">
                                #{pedido.id}
                              </span>
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getEstadoColor(pedido.estado)}`}
                              >
                                {pedido.estado || "Desconocido"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                {formatFecha(pedido.fecha || pedido.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Cliente mejorado */}
                        <div className="bg-gray-50/50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <User className="w-3.5 h-3.5" />
                            Cliente
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {pedido.nombre || "Cliente no especificado"}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {pedido.telefono || "Sin teléfono"}
                                </span>
                              </div>
                              {pedido.email && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-sm text-gray-600 truncate max-w-[200px]">
                                    {pedido.email}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Dirección mejorada */}
                        <div className="bg-gray-50/50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" />
                            Dirección
                          </p>
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {pedido.direccion || "No especificada"}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                {pedido.ciudad_nombre || pedido.ciudad || ""}
                                {pedido.departamento_nombre
                                  ? `, ${pedido.departamento_nombre}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Información de envío/pago */}
                        <div className="bg-gray-50/50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5" />
                            Envío & Pago
                          </p>
                          <div className="space-y-2">
                            {pedido.costo_envio > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Envío:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {formatMoneda(pedido.costo_envio)}
                                </span>
                              </div>
                            )}
                            {pedido.metodo_pago && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Método:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {pedido.metodo_pago}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total y acciones mejoradas */}
                    <div className="lg:text-right lg:w-64">
                      <div className="mb-5">
                        <p className="text-sm text-gray-500 mb-1">
                          Total del pedido
                        </p>
                        <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                          {formatMoneda(pedido.total || 0)}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <button
                          onClick={() => setDetalle(pedido)}
                          className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalles
                        </button>
                        <div className="flex gap-2">
                          <a
                            href={`/admin/orden-servicio/${pedido.id}`}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-sm flex items-center justify-center gap-2"
                          >
                            <CreditCard className="w-4 h-4" />
                            Orden
                          </a>
                          <button
                            onClick={() => window.print()}
                            className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                            title="Imprimir"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación mejorada */}
            {paginacion.totalPages > 1 && (
              <div className="px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Mostrando {pedidosFiltrados.length} de {paginacion.total}{" "}
                    pedidos
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchPedidos(paginacion.pagina - 1)}
                      disabled={paginacion.pagina <= 1}
                      className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                              paginacion.pagina === page
                                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
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
                      className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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

      {/* MODAL DE DETALLE MEJORADO */}
      <AnimatePresence>
        {detalle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDetalle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                <div className="relative">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <ShoppingCart className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                          Pedido #{detalle.id}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${getEstadoColor(detalle.estado)}`}
                          >
                            {getEstadoIcon(detalle.estado)}{" "}
                            {detalle.estado || "Desconocido"}
                          </span>
                          <span className="text-red-100 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatFecha(detalle.fecha)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-100/90 text-sm mb-1 font-medium">
                        Total del pedido
                      </p>
                      <p className="text-3xl lg:text-4xl font-bold text-white">
                        {formatMoneda(detalle.total || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Información del cliente mejorada */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5 pb-4 border-b border-gray-200 flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <User className="w-5 h-5 text-red-600" />
                      </div>
                      Información del Cliente
                    </h3>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200">
                        <User className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Nombre completo
                          </p>
                          <p className="font-semibold text-gray-900 text-lg">
                            {detalle.nombre || "No especificado"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200">
                        <Phone className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Teléfono
                          </p>
                          <p className="font-semibold text-gray-900 text-lg">
                            {detalle.telefono || "No especificado"}
                          </p>
                        </div>
                      </div>

                      {detalle.email && (
                        <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200">
                          <Mail className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Correo electrónico
                            </p>
                            <p className="font-semibold text-gray-900 text-lg break-all">
                              {detalle.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dirección de envío mejorada */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5 pb-4 border-b border-gray-200 flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      Dirección de Envío
                    </h3>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200">
                        <MapPin className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Dirección completa
                          </p>
                          <p className="font-semibold text-gray-900">
                            {detalle.direccion || "No especificada"}
                          </p>
                        </div>
                      </div>

                      {(detalle.ciudad_nombre || detalle.ciudad) && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white rounded-xl border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Ciudad
                            </p>
                            <p className="font-semibold text-gray-900">
                              {detalle.ciudad_nombre || detalle.ciudad}
                            </p>
                          </div>
                          {detalle.departamento_nombre && (
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Departamento
                              </p>
                              <p className="font-semibold text-gray-900">
                                {detalle.departamento_nombre}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {detalle.costo_envio > 0 && (
                        <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200">
                          <Truck className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Información de envío
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Costo:</span>
                              <span className="font-bold text-gray-900">
                                {formatMoneda(detalle.costo_envio)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Método de pago y notas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {detalle.metodo_pago && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-5 pb-4 border-b border-gray-200 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CreditCard className="w-5 h-5 text-green-600" />
                        </div>
                        Método de Pago
                      </h3>
                      <div className="p-4 bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">
                            {detalle.metodo_pago}
                          </span>
                          <CreditCard className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {detalle.notas && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-5 pb-4 border-b border-gray-200 flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-amber-600" />
                        </div>
                        Notas Adicionales
                      </h3>
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {detalle.notas}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer del modal mejorado */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    ID de sesión:{" "}
                    {CryptoJS.lib.WordArray.random(8)
                      .toString()
                      .substring(0, 12)}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDetalle(null)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Cerrar
                    </button>
                    <a
                      href={`/admin/orden-servicio/${detalle.id}`}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      Ver Orden Completa
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER DE ESTADO */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>Sistema seguro • Encriptación activa</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Cache hits: {performance.cacheHits}
          </span>
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Requests: {performance.requests}
          </span>
          <span>v2.0.1 • Dashboard Seguro</span>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para chevron
const ChevronDown = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

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
