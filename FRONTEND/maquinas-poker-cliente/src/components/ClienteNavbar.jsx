'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function ClienteNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      href: '/cliente/DashboardCliente',
      label: 'Dashboard',
      icon: 'bi-speedometer2',
      description: 'Panel principal'
    },
    {
      href: '/cliente/InventarioSimple',
      label: 'Inventario',
      icon: 'bi-boxes',
      description: 'Gestión de máquinas'
    },
    {
      href: '/cliente/ReporteInventario',
      label: 'Reportes',
      icon: 'bi-file-earmark-text',
      description: 'Reportes y estado'
    }
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="navbar navbar-expand-lg shadow-sm" style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #6f42c1' }}>
      <div className="container-fluid">
        {/* Brand */}
        <Link href="/cliente/DashboardCliente" className="navbar-brand d-flex align-items-center">
          <i className="bi bi-casino me-2 fs-4" style={{ color: '#6f42c1' }}></i>
          <span className="fw-bold" style={{ color: '#6f42c1' }}>
            Máquinas Poker
          </span>
          <span className="badge bg-primary ms-2 small">Cliente</span>
        </Link>

        {/* Toggle button for mobile */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#clienteNavbar"
          aria-controls="clienteNavbar" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar content */}
        <div className="collapse navbar-collapse" id="clienteNavbar">
          {/* Navigation items */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {navItems.map((item) => (
              <li key={item.href} className="nav-item">
                <Link 
                  href={item.href}
                  className={`nav-link d-flex align-items-center px-3 py-2 rounded-pill mx-1 ${
                    pathname === item.href 
                      ? 'active fw-semibold' 
                      : 'text-muted hover-link'
                  }`}
                  style={{
                    backgroundColor: pathname === item.href ? '#6f42c1' : 'transparent',
                    color: pathname === item.href ? 'white' : '#6c757d',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className={`bi ${item.icon} me-2`}></i>
                  <div>
                    <div className="fw-semibold">{item.label}</div>
                    <small className="opacity-75">{item.description}</small>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* User info and logout */}
          <div className="d-flex align-items-center">
            {/* User info */}
            <div className="me-3 text-end d-none d-md-block">
              <div className="fw-semibold text-dark">{session?.user?.name}</div>
              <small className="text-muted">{session?.user?.email}</small>
            </div>

            {/* User avatar */}
            <div className="dropdown">
              <button 
                className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-2"></i>
                <span className="d-none d-md-inline">Mi Cuenta</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <div className="dropdown-header">
                    <div className="fw-semibold">{session?.user?.name}</div>
                    <small className="text-muted">{session?.user?.email}</small>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link href="/cliente/perfil" className="dropdown-item">
                    <i className="bi bi-person me-2"></i>
                    Mi Perfil
                  </Link>
                </li>
                <li>
                  <Link href="/cliente/configuracion" className="dropdown-item">
                    <i className="bi bi-gear me-2"></i>
                    Configuración
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="dropdown-item text-danger"
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}