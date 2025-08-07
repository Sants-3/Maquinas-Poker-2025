"use client";
import { useState, useEffect } from 'react';

export default function TestReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular un token de administrador (reemplazar con el token real)
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tYnJlIjoiQWRtaW5pc3RyYWRvciIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2wiOiJhZG1pbiIsImlhdCI6MTczMzU5MjExMiwiZXhwIjoxNzMzNjc4NTEyfQ.Hs8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
      
      const response = await fetch('http://localhost:4000/api/reportes-cliente', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setReportes(data);
      console.log('Reportes obtenidos:', data);
      
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Test API Reportes Cliente</h1>
      
      <button 
        className="btn btn-primary mb-3" 
        onClick={testAPI}
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Probar API'}
      </button>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {reportes.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5>Reportes Encontrados ({reportes.length})</h5>
          </div>
          <div className="card-body">
            <pre>{JSON.stringify(reportes, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h3>Instrucciones:</h3>
        <ol>
          <li>Asegúrate de que el backend esté corriendo en puerto 4000</li>
          <li>Haz clic en "Probar API" para obtener los reportes</li>
          <li>Si hay reportes, se mostrarán abajo</li>
          <li>Si hay errores, se mostrarán en rojo</li>
        </ol>
        
        <h4>Para usar en el frontend:</h4>
        <p>Reemplaza el método <code>obtenerReportesClientes</code> en el servicio con:</p>
        <pre className="bg-light p-3">
{`async obtenerReportesClientes(token) {
  try {
    const response = await fetch('http://localhost:4000/api/reportes-cliente', {
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(\`Error \${response.status}: \${response.statusText}\`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error en obtenerReportesClientes:', error);
    throw error;
  }
}`}
        </pre>
      </div>
    </div>
  );
}