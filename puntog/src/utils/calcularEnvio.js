export function calcularEnvio({ ciudad, total }) {
  if (total >= 250000) return 0;

  if (!ciudad) return 0;

  return ciudad.toLowerCase() === "cali" ? 5000 : 16000;
}
