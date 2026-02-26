// src/pages/PoliticaEnvio.jsx
import { Helmet } from "react-helmet-async";

export default function PoliticaEnvio() {
  const lastUpdated = new Date().toLocaleDateString("es-CO");
  const lastUpdatedISO = new Date().toISOString();

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Política de Envíos | Punto G Sex Shop Colombia</title>
        <meta
          name="description"
          content="Política de envíos de Punto G. Conoce tiempos de entrega, costos, seguimiento, empaque discreto y condiciones para ciudades principales y zonas rurales en Colombia."
        />
        <link
          rel="canonical"
          href="https://puntogsexshop.com/politica-envios"
        />
        <meta name="robots" content="index, follow" />

        {/* Open Graph - SIN IMAGEN */}
        <meta
          property="og:title"
          content="Política de Envíos | Punto G Sex Shop Colombia"
        />
        <meta
          property="og:description"
          content="Envíos seguros y discretos en Colombia. Tiempos de entrega, costos y seguimiento de pedidos."
        />
        <meta
          property="og:url"
          content="https://puntogsexshop.com/politica-envios"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Punto G Sex Shop" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="Política de Envíos | Punto G Sex Shop Colombia"
        />
        <meta
          name="twitter:description"
          content="Información sobre tiempos de entrega, costos y empaque discreto."
        />

        {/* Meta de actualización */}
        <meta property="article:modified_time" content={lastUpdatedISO} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Política de <span className="text-red-600">Envíos</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Última actualización: {lastUpdated}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          {/* Introducción */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-base italic text-gray-700">
              En <strong className="text-gray-900">Punto G</strong>, nos
              comprometemos a realizar envíos seguros, discretos y confiables. A
              continuación, detallamos nuestras políticas de envío para que
              tengas claridad sobre los tiempos, costos y condiciones de
              entrega.
            </p>
          </div>

          {/* Procesamiento de pedidos */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              1. Procesamiento de pedidos
            </h2>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="flex items-start">
                <span className="text-green-600 mr-2">⏱️</span>
                <span>
                  Todos los pedidos se procesan dentro de un plazo de{" "}
                  <strong className="text-red-600">
                    24 a 48 horas hábiles
                  </strong>{" "}
                  después de confirmado el pago. En fechas especiales o
                  promociones, este tiempo puede extenderse.
                </span>
              </p>
            </div>
          </div>

          {/* Tiempos de entrega */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              2. Tiempos de entrega
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-700 mb-2 flex items-center">
                  <span className="mr-2">🏙️</span> Ciudades principales
                </h3>
                <p className="text-2xl font-bold text-purple-600">1-3 días</p>
                <p className="text-sm mt-1">hábiles</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-700 mb-2 flex items-center">
                  <span className="mr-2">🌄</span> Zonas rurales
                </h3>
                <p className="text-2xl font-bold text-orange-600">3-6 días</p>
                <p className="text-sm mt-1">hábiles</p>
              </div>
            </div>
            <p className="mt-3 text-sm bg-gray-50 p-3 rounded">
              ⚠️ Los tiempos son estimados y pueden variar por causas ajenas a
              Punto G, como condiciones climáticas o retrasos de la
              transportadora.
            </p>
          </div>

          {/* Costos de envío */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              3. Costos de envío
            </h2>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="flex items-start">
                <span className="text-yellow-600 mr-2">💰</span>
                <span>
                  El costo del envío se calcula automáticamente al finalizar la
                  compra y se mostrará antes de confirmar el pedido. En algunas
                  promociones, el envío puede ser <strong>gratuito</strong>{" "}
                  según el monto de compra.
                </span>
              </p>
            </div>
          </div>

          {/* Seguimiento del pedido */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              4. Seguimiento del pedido
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="flex items-start">
                <span className="text-blue-600 mr-2">📦</span>
                <span>
                  Una vez despachado el pedido, el cliente recibirá un{" "}
                  <strong>número de guía</strong> para rastrear el envío
                  directamente con la empresa transportadora.
                </span>
              </p>
            </div>
          </div>

          {/* Empaque y privacidad */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              5. Empaque y privacidad
            </h2>
            <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
              <p className="font-medium text-green-800 mb-2 flex items-center">
                <span className="text-2xl mr-2">📦</span>
                ¡ENVÍO DISCRETO GARANTIZADO!
              </p>
              <p>
                Todos los productos se envían en{" "}
                <strong className="text-red-600">
                  empaques totalmente discretos
                </strong>
                , sin logos ni referencias al contenido del paquete o al nombre
                del negocio, garantizando la privacidad del cliente.
              </p>
            </div>
          </div>

          {/* Dirección incorrecta */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              6. Dirección incorrecta
            </h2>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="flex items-start">
                <span className="text-red-600 mr-2">⚠️</span>
                <span>
                  Es <strong>responsabilidad del cliente</strong> proporcionar
                  una dirección correcta y completa. Punto G no se hace
                  responsable por retrasos, pérdidas o devoluciones causadas por
                  errores en la información suministrada.
                </span>
              </p>
            </div>
          </div>

          {/* Incidentes y retrasos */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              7. Incidentes y retrasos
            </h2>
            <p>
              No nos hacemos responsables por retrasos ocasionados por fuerza
              mayor, eventos climáticos, festivos o fallas de la empresa de
              mensajería. En caso de inconvenientes, nuestro equipo brindará
              acompañamiento para gestionar la solución.
            </p>
          </div>

          {/* Cambios y devoluciones */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              8. Cambios y devoluciones
            </h2>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p>
                Por razones de higiene y seguridad, los productos eróticos{" "}
                <strong className="text-red-600">
                  no tienen cambio ni devolución
                </strong>{" "}
                si han sido abiertos o usados. Solo se aceptarán reclamos por
                defectos de fábrica o errores en el envío, reportados dentro de
                los <strong className="text-red-600">7 días</strong> posteriores
                a la entrega.
              </p>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">📧</span> 9. Contacto para envíos
            </h2>
            <p className="text-sm mb-3">
              Para dudas o solicitudes relacionadas con envíos, puedes
              comunicarte con nosotros a:
            </p>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="font-semibold text-red-600 text-base">
                puntogsexshop2024@hotmail.com
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Incluye tu número de pedido para una atención más rápida.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
