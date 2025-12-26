export function calcularEnvio({ ciudad, total }) {
  if (total >= 200000) return 0;

  if (!ciudad) return "Gratis en compras mayores a $200.000";

  return ciudad.toLowerCase() === "cali" ? 5000 : 16000;
}
