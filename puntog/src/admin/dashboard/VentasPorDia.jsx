import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function VentasPorDia({ data }) {
  return (
    <div className="bg-[#12121A] border border-white/10 rounded-xl p-5 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">📈 Ventas por día</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3c" />
          <XAxis dataKey="fecha" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#ec4899"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
