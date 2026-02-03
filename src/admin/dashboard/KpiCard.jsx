const KpiCard = ({ titulo, valor, icono }) => {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <div className="text-3xl">{icono}</div>
      <div>
        <p className="text-gray-500 text-sm">{titulo}</p>
        <h3 className="text-2xl font-bold">{valor}</h3>
      </div>
    </div>
  );
};

export default KpiCard;
