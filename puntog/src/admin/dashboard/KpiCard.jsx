const KpiCard = ({ title, value, color }) => {
  return (
    <div className="bg-[#12121A] border border-white/10 rounded-xl p-5 shadow-lg">
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
};

export default KpiCard;
