"use client";

import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();

  // Datos estáticos para las tarjetas, siguiendo tu ejemplo original
  const cardData = [
    { label: "Total Ingresos", value: "L. 150,000.00", bg: "bg-success", icon: "bi-cash-stack" },
    { label: "Total Egresos", value: "L. 80,000.00", bg: "bg-danger", icon: "bi-cash-stack" },
    { label: "Balance Neto", value: "L. 70,000.00", bg: "bg-info", icon: "bi-currency-dollar" },
    { label: "Costo Mantenimientos", value: "L. 12,000.00", bg: "bg-warning", icon: "bi-tools" },
    { label: "Total Máquinas", value: 50, bg: "bg-primary", icon: "bi-cpu" },
    { label: "Máquinas Activas", value: 45, bg: "bg-success", icon: "bi-check-circle" },
    { label: "Total Usuarios", value: 20, bg: "bg-secondary", icon: "bi-people" },
    { label: "Usuarios Activos", value: 18, bg: "bg-info", icon: "bi-person-check" },
  ];

  // Datos estáticos para el inventario con stock bajo
  const lowStockItems = [
    { id: 'item1', name: 'Placa Base XYZ', stock: 3 },
    { id: 'item2', name: 'Fuente de Poder 600W', stock: 5 },
    { id: 'item3', name: 'Módulo RAM DDR4', stock: 2 },
  ];

  return (
    <div className="container-fluid p-0 min-vh-100 bg-light">
      {/* Navbar de Administrador - Estilo Bootstrap */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
        <div className="container-fluid">
          <Link className="navbar-brand" href="/inventario/dashAdmin">
            <i className="bi bi-gear-fill me-2"></i>
            Dashboard Administrador
          </Link>
          <div className="d-flex align-items-center">
            {/* Estos enlaces son solo de demostración para la UI, sin funcionalidad real aquí */}
            <Link href="/admin/usuarios" className="btn btn-sm btn-outline-light me-2">
              <i className="bi bi-people me-1"></i> Gestión de Usuarios
            </Link>
            <Link href="/admin/maquinas" className="btn btn-sm btn-outline-light me-2">
              <i className="bi bi-cpu me-1"></i> Gestión de Máquinas
            </Link>
            <button className="btn btn-sm btn-light" onClick={() => alert('Cerrar sesión (funcionalidad no implementada)')}>
              <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="container py-4">
        <h1 className="mb-4 text-dark">
          <i className="bi bi-speedometer2 me-2"></i>
          Panel de Control Administrativo
        </h1>

 
        {/* Botón Regresar */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="btn btn-secondary" // Clases de Bootstrap
          >
            <i className="bi bi-arrow-left me-2"></i> Regresar
          </button>
        </div>

        {/* Tarjetas de Estadísticas - Estilo Bootstrap */}
        <div className="row mb-4 g-3">
          {cardData.map((card, i) => (
            <div key={i} className="col-md-6 col-lg-3"> {/* Layout responsivo de Bootstrap */}
              <div className={`card text-white ${card.bg} h-100 shadow-sm`}> {/* Estilos de tarjeta Bootstrap */}
                <div className="card-body text-center py-4">
                  <h5 className="card-title">
                    <i className={`bi ${card.icon} me-2`}></i> {/* Íconos de Bootstrap */}
                    {card.label}
                  </h5>
                  <p className="display-5 my-3">{card.value}</p> {/* Tamaño de texto Bootstrap */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de Inventario con Stock Bajo - Estilo Bootstrap */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white border-bottom">
            <h5 className="mb-0">
              <i className="bi bi-box-seam text-danger me-2"></i>
              Inventario con Stock Bajo ({lowStockItems.length} Ítems)
            </h5>
          </div>
          <div className="card-body">
            {lowStockItems.length > 0 ? (
              <ul className="list-group list-group-flush">
                {lowStockItems.map((item) => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {item.name}
                    <span className="badge bg-danger rounded-pill">Stock: {item.stock}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-3 text-muted">
                No hay ítems con stock bajo en este momento.
              </div>
            )}
          </div>
        </div>

        {/* Aquí puedes añadir más secciones para el administrador, siguiendo el estilo Bootstrap */}
      </main>

      {/* Footer - Estilo Bootstrap */}
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              <p className="mb-0">
                <i className="bi bi-c-circle"></i> {new Date().getFullYear()} Poker Machines Manager
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-0">
                Versión 1.0.0 | Área de Administración
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}