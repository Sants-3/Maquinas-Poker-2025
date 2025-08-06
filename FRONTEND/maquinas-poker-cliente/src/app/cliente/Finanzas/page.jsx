// src/app/finanzas/page.jsx
'use client';

import { useEffect, useState } from 'react';
import MaquinaCard from '@/components/finanzas/MaquinaCard';
import GraficoRendimiento from '@/components/finanzas/GraficoRendimiento';

export default function FinanzasPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/finanzas');
        if (!response.ok) {
          throw new Error('Error al obtener datos financieros');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Cargando datos financieros...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reporte de Finanzas</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Resumen por Máquina</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.maquinas?.map(maquina => (
            <MaquinaCard key={maquina.id} maquina={maquina} />
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-6">Rendimiento Histórico</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <GraficoRendimiento data={data?.historico || []} />
        </div>
      </section>
    </div>
  );
}