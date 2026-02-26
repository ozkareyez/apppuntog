import { Helmet } from "react-helmet-async";

export default function MetodosPago() {
  const lastUpdated = new Date().toLocaleDateString("es-CO");
  const lastUpdatedISO = new Date().toISOString();

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Métodos de Pago | Punto G Sex Shop Colombia</title>
        <meta
          name="description"
          content="Conoce todos los métodos de pago disponibles en Punto G: efectivo, transferencia PSE y Nequi. Pagos seguros, confidenciales y fáciles en Colombia."
        />
        <link rel="canonical" href="https://puntogsexshop.com/metodos-pago" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph - SIN IMAGEN */}
        <meta
          property="og:title"
          content="Métodos de Pago | Punto G Sex Shop Colombia"
        />
        <meta
          property="og:description"
          content="Paga de forma segura con efectivo, PSE o Nequi. Transacciones protegidas y 100% confidenciales en Colombia."
        />
        <meta
          property="og:url"
          content="https://puntogsexshop.com/metodos-pago"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Punto G Sex Shop" />
        {/* 👆 Sin og:image */}

        {/* Twitter Card - versión sin imagen */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="Métodos de Pago | Punto G Sex Shop Colombia"
        />
        <meta
          name="twitter:description"
          content="Paga de forma segura con efectivo, PSE o Nequi. Transacciones protegidas y confidenciales."
        />
        {/* 👆 Sin twitter:image */}

        {/* Meta de actualización */}
        <meta property="article:modified_time" content={lastUpdatedISO} />
      </Helmet>

      {/* Resto del contenido igual */}
      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Métodos de <span className="text-red-600">Pago</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Última actualización: {lastUpdated}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          <p className="text-base">
            En <strong className="text-gray-900">Punto G</strong> ofrecemos
            diferentes métodos de pago para que elijas el que mejor se adapte a
            tus necesidades, garantizando seguridad, facilidad y
            confidencialidad en cada transacción.
          </p>

          {/* Efectivo */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              1. Pago en efectivo
            </h2>
            <p>
              El pago en efectivo está disponible únicamente para entregas
              acordadas previamente o pagos contra entrega, según cobertura y
              disponibilidad. El valor debe ser cancelado en su totalidad al
              momento de recibir el pedido.
            </p>
          </div>

          {/* Transferencia PSE */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              2. Transferencia bancaria (PSE)
            </h2>
            <p>
              Aceptamos pagos a través de <strong>PSE</strong>, permitiendo
              transferencias directas desde cuentas bancarias habilitadas en
              Colombia. El pedido será procesado una vez el pago sea confirmado
              por la plataforma.
            </p>
          </div>

          {/* Nequi */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              3. Pago con Nequi
            </h2>
            <p>
              Los pagos mediante <strong>Nequi</strong> se realizan a través de
              transferencia directa al número autorizado por Punto G. Es
              responsabilidad del cliente enviar el comprobante de pago para
              validar la transacción y continuar con el despacho del pedido.
            </p>
          </div>

          {/* Confirmación */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              4. Confirmación de pagos
            </h2>
            <p>
              Todos los pedidos serán procesados únicamente después de la
              confirmación del pago. En caso de inconsistencias, Punto G se
              reserva el derecho de solicitar información adicional antes de
              continuar con el envío.
            </p>
          </div>

          {/* Seguridad */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              5. Seguridad de la información
            </h2>
            <p>
              Punto G no almacena información bancaria sensible de sus clientes.
              Las transacciones se realizan a través de plataformas externas
              seguras, garantizando la protección de los datos personales.
            </p>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              6. Contacto
            </h2>
            <p className="text-sm">
              Para dudas relacionadas con métodos de pago o validación de
              transacciones, puedes comunicarte con nosotros a:
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
