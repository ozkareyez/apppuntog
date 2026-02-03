export default function GarantiasServicios() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Garantías y <span className="text-red-600">Servicios</span>
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Última actualización: {new Date().toLocaleDateString("es-CO")}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          <p className="text-base">
            En <strong className="text-gray-900">Punto G</strong>, trabajamos
            para ofrecer productos de calidad y un servicio confiable. A
            continuación, detallamos nuestras políticas de garantía y los
            servicios que ponemos a disposición de nuestros clientes, conforme a
            la normativa vigente en Colombia.
          </p>

          {/* Bloque */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              1. Garantía legal
            </h2>
            <p>
              Todos nuestros productos cuentan con garantía legal según lo
              establecido en la <strong>Ley 1480 de 2011</strong> (Estatuto del
              Consumidor). La garantía cubre defectos de fabricación y fallas de
              funcionamiento bajo condiciones normales de uso.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              2. Productos excluidos de garantía
            </h2>
            <p>
              Por razones de higiene, salud y seguridad, algunos productos no
              aplican para garantía, especialmente aquellos que:
            </p>
            <ul className="list-disc pl-8 space-y-2 mt-2">
              <li>Han sido abiertos o usados</li>
              <li>Corresponden a productos de uso íntimo o personal</li>
              <li>
                Presentan daños por mal uso, golpes o manipulación indebida
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              3. Plazo para solicitar la garantía
            </h2>
            <p>
              El cliente debe reportar cualquier inconveniente dentro de los{" "}
              <strong>5 a 10 días hábiles</strong> posteriores a la entrega del
              producto, adjuntando evidencia fotográfica o en video que permita
              verificar el defecto.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              4. Proceso de garantía
            </h2>
            <p>
              Una vez recibida la solicitud, Punto G evaluará el caso y podrá
              ofrecer, según corresponda:
            </p>
            <ul className="list-disc pl-8 space-y-2 mt-2">
              <li>Reparación del producto</li>
              <li>Cambio por uno de iguales características</li>
              <li>Reembolso del dinero</li>
            </ul>
            <p className="mt-2">
              La decisión dependerá del diagnóstico técnico y la disponibilidad
              del producto.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              5. Costos de envío en garantías
            </h2>
            <p>
              Si la garantía es aprobada, Punto G asumirá los costos de envío.
              En caso de que la garantía sea rechazada por mal uso u otras
              causales, el cliente deberá asumir dichos costos.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              6. Servicios al cliente
            </h2>
            <p>
              Ofrecemos acompañamiento antes, durante y después de la compra a
              través de nuestros canales de atención, brindando asesoría sobre
              productos, estado de pedidos y solicitudes de garantía.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              7. Uso adecuado de los productos
            </h2>
            <p>
              La garantía no cubre daños ocasionados por uso indebido,
              incumplimiento de las instrucciones del fabricante o manipulación
              incorrecta del producto.
            </p>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              8. Contacto
            </h2>
            <p className="text-sm">
              Para solicitudes de garantía o información sobre nuestros
              servicios, puedes comunicarte con nosotros a:
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
