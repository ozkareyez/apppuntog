import { Helmet } from "react-helmet-async";

export default function CambiosDevoluciones() {
  const lastUpdated = new Date().toLocaleDateString("es-CO");
  const lastUpdatedISO = new Date().toISOString();

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Cambios y Devoluciones | Punto G Sex Shop Colombia</title>
        <meta
          name="description"
          content="Políticas de cambios y devoluciones de Punto G. Conoce nuestras condiciones por higiene, defectos de fábrica y plazos para solicitar cambios en productos íntimos en Colombia."
        />
        <link
          rel="canonical"
          href="https://puntogsexshop.com/cambios-devoluciones"
        />
        <meta name="robots" content="index, follow" />

        {/* Open Graph - SIN IMAGEN */}
        <meta
          property="og:title"
          content="Cambios y Devoluciones | Punto G Sex Shop Colombia"
        />
        <meta
          property="og:description"
          content="Políticas de cambios y devoluciones por higiene y defectos de fábrica. Plazo de 48 horas para notificar novedades."
        />
        <meta
          property="og:url"
          content="https://puntogsexshop.com/cambios-devoluciones"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Punto G Sex Shop" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="Cambios y Devoluciones | Punto G Sex Shop Colombia"
        />
        <meta
          name="twitter:description"
          content="Políticas de cambios por higiene y defectos de fábrica. Plazo de 48 horas."
        />

        {/* Meta de actualización */}
        <meta property="article:modified_time" content={lastUpdatedISO} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Cambios y <span className="text-red-600">Devoluciones</span>
          </h1>
          <p className="text-sm text-gray-500">
            Última actualización: {lastUpdated}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          {/* Introducción */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-base italic text-gray-700">
              En <strong className="text-gray-900">Punto G</strong>, tu
              satisfacción es importante. A continuación, te explicamos nuestras
              políticas de cambios y devoluciones.
            </p>
          </div>

          {/* Política de higiene */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              1. Política de higiene y seguridad
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-gray-900">
                ⚠️ Por razones de higiene y seguridad, los productos íntimos no
                tienen cambio ni devolución una vez abiertos o usados.
              </p>
            </div>
          </div>

          {/* Defectos de fábrica */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              2. Defectos de fábrica
            </h2>
            <p>
              Solo se aceptarán cambios en caso de{" "}
              <strong>defectos de fábrica</strong>, notificándolo dentro de las{" "}
              <strong>primeras 48 horas</strong> posteriores a la entrega.
            </p>
            <p className="mt-2">
              Para proceder con el cambio, el producto debe:
            </p>
            <ul className="list-disc pl-8 mt-2 space-y-1">
              <li>Estar sin uso</li>
              <li>En su empaque original</li>
              <li>Con todos sus accesorios y manuales</li>
              <li>Presentar el comprobante de compra</li>
            </ul>
          </div>

          {/* Condiciones del producto */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              3. Condiciones para cambios
            </h2>
            <p>
              El producto debe estar sin uso, en su empaque original y con todos
              sus accesorios. Nos reservamos el derecho de evaluar cada caso
              particular antes de aceptar cualquier cambio.
            </p>
          </div>

          {/* Proceso para solicitar cambio */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              4. Proceso para solicitar un cambio
            </h2>
            <ol className="list-decimal pl-8 space-y-2">
              <li>
                Contactarnos dentro de las 48 horas posteriores a la entrega
              </li>
              <li>Enviar fotos del producto y el empaque original</li>
              <li>Adjuntar el comprobante de compra</li>
              <li>Esperar la evaluación de nuestro equipo</li>
              <li>Recibir instrucciones para el envío del cambio</li>
            </ol>
          </div>

          {/* Excepciones */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              5. Excepciones
            </h2>
            <p>No se aceptarán cambios por:</p>
            <ul className="list-disc pl-8 mt-2 space-y-1">
              <li>Productos abiertos o usados</li>
              <li>
                Razones estéticas (color, tamaño, textura) si el producto
                corresponde a lo descrito
              </li>
              <li>Cambio de opinión después de recibido el producto</li>
              <li>Daños causados por mal uso del producto</li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¿Necesitas solicitar un cambio?
            </h2>
            <p className="text-sm">
              Para solicitar un cambio o resolver dudas, escríbenos a:
              <br />
              <span className="font-semibold text-red-600">
                puntogsexshop2024@hotmail.com
              </span>
              <br />
              <span className="text-xs text-gray-500">
                Recuerda hacerlo dentro de las 48 horas posteriores a la
                entrega.
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
