
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function GraficoRendimiento({ data }) {
  // Procesar datos para el gráfico
  const maquinas = [...new Set(data.map(item => item.maquina))];
  const meses = [...new Set(data.map(item => item.mes))];

  const datasets = maquinas.map(maquina => {
    const datosMaquina = data.filter(item => item.maquina === maquina);
    return {
      label: maquina,
      data: meses.map(mes => {
        const item = datosMaquina.find(d => d.mes === mes);
        return item ? item.ganancia : 0;
      }),
      borderColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      tension: 0.1,
    };
  });

  const chartData = {
    labels: meses,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return `$${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}