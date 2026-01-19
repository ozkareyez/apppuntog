export function calcularEnvio({ ciudad, total }) {
  if (total >= 200000) return "";

  if (!ciudad) return 0;

  return ciudad.toLowerCase() === "cali"
    ? "Pendiente verificar costo segun zona"
    : 16000;
}
