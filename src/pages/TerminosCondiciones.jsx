import { Helmet } from "react-helmet-async";

export default function TerminosCondiciones() {
  const lastUpdated = new Date().toLocaleDateString("es-CO");
  const lastUpdatedISO = new Date().toISOString();

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Términos y Condiciones | Punto G Sex Shop Colombia</title>
        <meta
          name="description"
          content="Lee los términos y condiciones de Punto G Sex Shop. Información sobre uso del sitio, proceso de compra, responsabilidades y políticas para mayores de 18 años en Colombia."
        />
        <link
          rel="canonical"
          href="https://puntogsexshop.com/terminos-condiciones"
        />
        <meta name="robots" content="index, follow" />

        {/* Open Graph - SIN IMAGEN (como acordamos) */}
        <meta
          property="og:title"
          content="Términos y Condiciones | Punto G Sex Shop Colombia"
        />
        <meta
          property="og:description"
          content="Términos y condiciones de uso del sitio, proceso de compra y responsabilidades. Sitio exclusivo para mayores de 18 años."
        />
        <meta
          property="og:url"
          content="https://puntogsexshop.com/terminos-condiciones"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Punto G Sex Shop" />

        {/* Twitter Card - versión sin imagen */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="Términos y Condiciones | Punto G Sex Shop Colombia"
        />
        <meta
          name="twitter:description"
          content="Términos y condiciones de uso del sitio y proceso de compra en Punto G."
        />

        {/* Meta de actualización */}
        <meta property="article:modified_time" content={lastUpdatedISO} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-8 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Términos y <span className="text-red-600">Condiciones</span>
          </h1>
          <p className="text-sm text-gray-500">
            Última actualización: {lastUpdated}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          {/* Introducción */}
          <div className="bg-gray-50 border-l-4 border-red-600 p-4">
            <p className="text-base italic">
              Al acceder y utilizar el sitio web{" "}
              <strong className="text-gray-900">Punto G</strong>, el usuario
              acepta los presentes Términos y Condiciones.
            </p>
          </div>

          {/* Uso del sitio */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              1. Uso del sitio
            </h2>
            <p>
              El usuario se compromete a utilizar este sitio de forma lícita y
              responsable. El uso está restringido exclusivamente a mayores de
              edad (+18). No nos hacemos responsables por el acceso de menores
              de edad al sitio.
            </p>
          </div>

          {/* Proceso de compra */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              2. Proceso de compra
            </h2>
            <p>
              Los precios, promociones y disponibilidad pueden cambiar sin
              previo aviso. La compra se considera confirmada una vez realizado
              el pago y verificada la transacción. Todos los precios están
              expresados en pesos colombianos (COP).
            </p>
          </div>

          {/* Responsabilidad */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              3. Responsabilidad
            </h2>
            <p>
              Punto G no se hace responsable por el uso indebido de los
              productos adquiridos. Los productos deben ser utilizados siguiendo
              las instrucciones del fabricante y bajo la responsabilidad del
              comprador.
            </p>
          </div>

          {/* Privacidad */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              4. Privacidad y datos personales
            </h2>
            <p>
              Toda la información personal proporcionada será tratada con
              confidencialidad y no será compartida con terceros sin
              consentimiento previo, excepto cuando sea requerido por
              autoridades competentes.
            </p>
          </div>

          {/* Modificaciones */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              5. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier
              momento. Los cambios entrarán en vigor inmediatamente después de
              su publicación en el sitio. Es responsabilidad del usuario revisar
              periódicamente esta sección.
            </p>
          </div>

          {/* Legislación aplicable */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              6. Legislación aplicable
            </h2>
            <p>
              Estos términos se rigen por las leyes de la República de Colombia.
              Cualquier controversia será sometida a los tribunales competentes
              de Colombia.
            </p>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Contacto legal
            </h2>
            <p className="text-sm">
              Para consultas sobre estos términos y condiciones, puedes
              comunicarte a:
              <br />
              <span className="font-semibold text-red-600">
                puntogsexshop2024@hotmail.com
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
