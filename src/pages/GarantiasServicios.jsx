import { Helmet } from "react-helmet-async";

export default function GarantiasServicios() {
  const lastUpdated = new Date().toLocaleDateString("es-CO");
  const lastUpdatedISO = new Date().toISOString();

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Garantías y Servicios | Punto G Sex Shop Colombia</title>
        <meta
          name="description"
          content="Conoce las garantías y servicios de Punto G. Información sobre garantía legal (Ley 1480 de 2011), productos excluidos, plazos, procesos y costos de envío en Colombia."
        />
        <link
          rel="canonical"
          href="https://puntogsexshop.com/garantias-servicios"
        />
        <meta name="robots" content="index, follow" />

        {/* Open Graph - SIN IMAGEN */}
        <meta
          property="og:title"
          content="Garantías y Servicios | Punto G Sex Shop Colombia"
        />
        <meta
          property="og:description"
          content="Garantía legal según Estatuto del Consumidor. Procesos, plazos y cobertura para productos íntimos en Colombia."
        />
        <meta
          property="og:url"
          content="https://puntogsexshop.com/garantias-servicios"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Punto G Sex Shop" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="Garantías y Servicios | Punto G Sex Shop Colombia"
        />
        <meta
          name="twitter:description"
          content="Garantía legal, plazos y procesos para solicitar garantía en productos íntimos."
        />

        {/* Meta de actualización */}
        <meta property="article:modified_time" content={lastUpdatedISO} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Garantías y <span className="text-red-600">Servicios</span>
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
              En <strong className="text-gray-900">Punto G</strong>, trabajamos
              para ofrecer productos de calidad y un servicio confiable. A
              continuación, detallamos nuestras políticas de garantía y los
              servicios que ponemos a disposición de nuestros clientes, conforme
              a la normativa vigente en Colombia.
            </p>
          </div>

          {/* Garantía Legal - Destacado */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              1. Garantía legal
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium text-gray-900">
                📋 <strong>Ley 1480 de 2011</strong> (Estatuto del Consumidor)
              </p>
              <p className="mt-2">
                Todos nuestros productos cuentan con garantía legal según lo
                establecido en la ley. La garantía cubre defectos de fabricación
                y fallas de funcionamiento bajo condiciones normales de uso.
              </p>
            </div>
          </div>

          {/* Productos excluidos */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              2. Productos excluidos de garantía
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-gray-900">
                ⚠️ Por razones de higiene, salud y seguridad:
              </p>
              <ul className="list-disc pl-8 space-y-2 mt-2">
                <li>Productos que han sido abiertos o usados</li>
                <li>Productos de uso íntimo o personal</li>
                <li>Daños por mal uso, golpes o manipulación indebida</li>
              </ul>
            </div>
          </div>

          {/* Plazo */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              3. Plazo para solicitar la garantía
            </h2>
            <p>
              El cliente debe reportar cualquier inconveniente dentro de los{" "}
              <strong className="text-red-600">5 a 10 días hábiles</strong>{" "}
              posteriores a la entrega del producto, adjuntando evidencia
              fotográfica o en video que permita verificar el defecto.
            </p>
          </div>

          {/* Proceso */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              4. Proceso de garantía
            </h2>
            <p>
              Una vez recibida la solicitud, Punto G evaluará el caso y podrá
              ofrecer, según corresponda:
            </p>
            <ul className="list-disc pl-8 space-y-2 mt-2">
              <li>🔧 Reparación del producto</li>
              <li>🔄 Cambio por uno de iguales características</li>
              <li>💰 Reembolso del dinero</li>
            </ul>
            <p className="mt-2">
              La decisión dependerá del diagnóstico técnico y la disponibilidad
              del producto.
            </p>
          </div>

          {/* Costos de envío */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              5. Costos de envío en garantías
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-semibold text-green-700">
                  ✅ Garantía aprobada
                </p>
                <p className="text-sm">Punto G asume los costos de envío</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="font-semibold text-red-700">
                  ❌ Garantía rechazada
                </p>
                <p className="text-sm">Cliente asume los costos de envío</p>
              </div>
            </div>
          </div>

          {/* Servicios al cliente */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              6. Servicios al cliente
            </h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p>
                Ofrecemos acompañamiento{" "}
                <strong>antes, durante y después</strong> de la compra a través
                de nuestros canales de atención, brindando asesoría sobre:
              </p>
              <ul className="list-disc pl-8 mt-2 space-y-1">
                <li>Selección de productos</li>
                <li>Estado de pedidos</li>
                <li>Solicitudes de garantía</li>
                <li>Recomendaciones de uso</li>
              </ul>
            </div>
          </div>

          {/* Uso adecuado */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              7. Uso adecuado de los productos
            </h2>
            <p>
              La garantía <strong className="text-red-600">no cubre</strong>{" "}
              daños ocasionados por:
            </p>
            <ul className="list-disc pl-8 space-y-2 mt-2">
              <li>Uso indebido del producto</li>
              <li>Incumplimiento de las instrucciones del fabricante</li>
              <li>Manipulación incorrecta del producto</li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
              <span className="mr-2">📞</span> 8. Contacto para garantías
            </h2>
            <p className="text-sm">
              Para solicitudes de garantía o información sobre nuestros
              servicios, puedes comunicarte con nosotros a:
              <br />
              <span className="font-semibold text-red-600 text-base">
                puntogsexshop2024@hotmail.com
              </span>
              <br />
              <span className="text-xs text-gray-500">
                Por favor incluye tu número de pedido y fotos del producto.
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
