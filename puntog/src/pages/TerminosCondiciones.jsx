export default function TerminosCondiciones() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-14 text-gray-700">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
          Términos y <span className="text-red-600">Condiciones</span>
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Última actualización: {new Date().toLocaleDateString("es-CO")}
        </p>

        <section className="space-y-6 leading-relaxed">
          <p>
            Al acceder y utilizar el sitio web <strong>Punto G</strong>, el
            usuario acepta los presentes Términos y Condiciones.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Uso del sitio</h2>
          <p>
            El usuario se compromete a utilizar este sitio de forma lícita y
            responsable. El uso está restringido exclusivamente a mayores de
            edad (+18).
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            Proceso de compra
          </h2>
          <p>
            Los precios, promociones y disponibilidad pueden cambiar sin previo
            aviso. La compra se considera confirmada una vez realizado el pago.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            Responsabilidad
          </h2>
          <p>
            Punto G no se hace responsable por el uso indebido de los productos
            adquiridos.
          </p>
        </section>
      </div>
    </div>
  );
}
