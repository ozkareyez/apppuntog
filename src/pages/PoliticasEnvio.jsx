export default function PoliticaEnvio() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        {/* Header */}
        <div className="mb-10 border-b border-red-100 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Política de <span className="text-red-600">Envíos</span>
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Última actualización: {new Date().toLocaleDateString("es-CO")}
          </p>
        </div>

        {/* Contenido */}
        <section className="space-y-8 leading-relaxed">
          <p className="text-base">
            En <strong className="text-gray-900">Punto G</strong>, nos
            comprometemos a realizar envíos seguros, discretos y confiables. A
            continuación, detallamos nuestras políticas de envío para que tengas
            claridad sobre los tiempos, costos y condiciones de entrega.
          </p>

          {/* Bloque */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              1. Procesamiento de pedidos
            </h2>
            <p>
              Todos los pedidos se procesan dentro de un plazo de{" "}
              <strong>24 a 48 horas hábiles</strong> después de confirmado el
              pago. En fechas especiales o promociones, este tiempo puede
              extenderse.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              2. Tiempos de entrega
            </h2>
            <ul className="list-disc pl-8 space-y-2">
              <li>
                <strong>Ciudades principales:</strong> 1 a 3 días hábiles
              </li>
              <li>
                <strong>Ciudades intermedias o zonas rurales:</strong> 3 a 6
                días hábiles
              </li>
            </ul>
            <p className="mt-2">
              Los tiempos son estimados y pueden variar por causas ajenas a
              Punto G, como condiciones climáticas o retrasos de la
              transportadora.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              3. Costos de envío
            </h2>
            <p>
              El costo del envío se calcula automáticamente al finalizar la
              compra y se mostrará antes de confirmar el pedido. En algunas
              promociones, el envío puede ser gratuito según el monto de compra.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              4. Seguimiento del pedido
            </h2>
            <p>
              Una vez despachado el pedido, el cliente recibirá un número de
              guía para rastrear el envío directamente con la empresa
              transportadora.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              5. Empaque y privacidad
            </h2>
            <p>
              Todos los productos se envían en{" "}
              <strong>empaques totalmente discretos</strong>, sin logos ni
              referencias al contenido del paquete o al nombre del negocio,
              garantizando la privacidad del cliente.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              6. Dirección incorrecta
            </h2>
            <p>
              Es responsabilidad del cliente proporcionar una dirección correcta
              y completa. Punto G no se hace responsable por retrasos, pérdidas
              o devoluciones causadas por errores en la información
              suministrada.
            </p>
          </div>

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

          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-600 pl-3 mb-3">
              8. Cambios y devoluciones
            </h2>
            <p>
              Por razones de higiene y seguridad, los productos eróticos{" "}
              <strong>no tienen cambio ni devolución</strong> si han sido
              abiertos o usados. Solo se aceptarán reclamos por defectos de
              fábrica o errores en el envío, reportados dentro de los{" "}
              <strong>7 días</strong> posteriores a la entrega.
            </p>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 border border-red-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              9. Contacto
            </h2>
            <p className="text-sm">
              Para dudas o solicitudes relacionadas con envíos, puedes
              comunicarte con nosotros a:
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
