export default function MaquinaCard({ maquina }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">{maquina.nombre}</h3>
      <p className="text-gray-600">{maquina.modelo}</p>
      <div className="mt-4">
        <p className="text-2xl font-bold text-green-600">
          ${maquina.ganancia_total.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">
          {maquina.total_sesiones} sesiones
        </p>
      </div>
    </div>
  );
}