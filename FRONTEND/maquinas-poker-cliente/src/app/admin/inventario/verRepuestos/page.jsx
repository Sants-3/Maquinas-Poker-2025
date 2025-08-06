"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function VerRepuestos() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [repuestos, setRepuestos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://backend:4000/api/inventario/repuesto', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.length > 0) {
        setRepuestos(data);
        }
      } catch (error) {
        console.error('Error al obtener datos de repuestos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRepuestos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return repuestos.filter((r) => {
      return Object.values(r).some((val) =>
        String(val).toLowerCase().includes(term)
      );
    });
  }, [searchTerm, repuestos]);

  const columnas = [
    { label: "ID", key: "id" },
    { label: "Nombre", key: "nombre" },
    { label: "Código", key: "codigo" },
    { label: "Descripción", key: "descripcion", truncate: true },
    { label: "Proveedor", key: "proveedor.nombre" },
    {
      label: "Precio Unitario",
      key: "precio_unitario",
      format: (val) => `$${val.toFixed(2)}`,
    },
    { label: "Stock Actual", key: "stock_actual" },
    { label: "Stock Mínimo", key: "stock_minimo" },
    { label: "Ubicación", key: "ubicacion.nombre" },
    { label: "Compatible con", key: "compatible_con", truncate: true },
    {
      label: "Últ. Reabastecimiento",
      key: "fecha_ultimo_reabastecimiento",
      format: (val) =>
        new Date(val).toLocaleDateString("es-HN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition"
          >
            ← Regresar
          </button>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-800 text-center mb-12 tracking-tight drop-shadow-lg">
          Inventario de Repuestos
        </h1>

        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Buscar en todo el inventario..."
            className="w-full max-w-md p-3 pl-4 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredRepuestos.length === 0 ? (
          <div className="text-center text-gray-600 text-xl py-20">
            No se encontraron repuestos que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-blue-600 sticky top-0 z-10">
                  <tr>
                    {columnas.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRepuestos.map((r) => (
                    <tr key={r.id} className="hover:bg-blue-50 transition">
                      {columnas.map((col, idx) => {
                        const valor = col.key.split('.').reduce((acc, k) => acc?.[k], r) ?? "N/A";
                        const contenido = col.format ? col.format(valor) : valor;
                        return (
                          <td
                            key={idx}
                            className={`px-6 py-4 text-sm text-gray-700 ${
                              col.truncate ? "max-w-xs truncate" : ""
                            }`}
                            title={col.truncate ? valor : undefined}
                          >
                            {contenido}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
