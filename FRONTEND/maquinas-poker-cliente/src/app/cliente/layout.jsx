"use client";
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ClienteLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'cliente') {
      router.push('/no-autorizado');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#6f42c1' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Cargando...</h5>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || (session && session.user.role !== 'cliente')) {
    return null;
  }

  const navItems = [
    {
      href: '/cliente/DashboardCliente',
      icon: 'bi-speedometer2',
      label: 'Dashboard',
      description: 'Vista general'
    },
    {
      href: '/cliente/inventario',
      icon: 'bi-boxes',
      label: 'Inventario',
      description: 'Ver máquinas'
    },
    {
      href: '/cliente/ReporteInventario',
      icon: 'bi-exclamation-triangle',
      label: 'Reportar Fallas',
      description: 'Reportar problemas'
    }
  ];

  const isActive = (href) => pathname === href;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg shadow-sm" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '3px solid rgba(255,255,255,0.1)'
      }}>
        <div className="container-fluid px-4">
          {/* Brand */}
          <Link href="/cliente/DashboardCliente" className="navbar-brand text-white fw-bold d-flex align-items-center">
            <div className="me-3 p-2 rounded-circle" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <i className="bi bi-gear-fill fs-4"></i>
            </div>
            <div>
              <div className="fs-5">Máquinas Poker</div>
              <small className="opacity-75">Panel Cliente</small>
            </div>
          </Link>

          {/* Toggle button for mobile */}
          <button 
            className="navbar-toggler border-0" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            style={{ color: 'white' }}
          >
            <i className="bi bi-list fs-3 text-white"></i>
          </button>

          {/* Navigation items */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              {navItems.map((item) => (
                <li key={item.href} className="nav-item mx-2">
                  <Link 
                    href={item.href}
                    className={`nav-link px-4 py-2 rounded-pill transition-all ${
                      isActive(item.href) 
                        ? 'bg-white text-dark shadow-sm fw-semibold' 
                        : 'text-white hover-bg-white-10'
                    }`}
                    style={{
                      transition: 'all 0.3s ease',
                      textDecoration: 'none'
                    }}
                  >
                    <i className={`${item.icon} me-2`}></i>
                    <span className="d-none d-lg-inline">{item.label}</span>
                    <span className="d-lg-none">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* User info and logout */}
            <div className="d-flex align-items-center">
              <div className="dropdown">
                <button 
                  className="btn btn-outline-light dropdown-toggle border-0 px-3 py-2 rounded-pill"
                  type="button" 
                  data-bs-toggle="dropdown"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  <span className="d-none d-md-inline">{session?.user?.name || 'Cliente'}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2">
                  <li>
                    <div className="dropdown-item-text">
                      <div className="fw-semibold">{session?.user?.name}</div>
                      <small className="text-muted">{session?.user?.email}</small>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger d-flex align-items-center"
                      onClick={() => signOut({ callbackUrl: '/' })}
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

      {/* Breadcrumb */}
      <div className="container-fluid px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link href="/cliente/DashboardCliente" className="text-decoration-none">
                <i className="bi bi-house-door me-1"></i>
                Inicio
              </Link>
            </li>
            {pathname !== '/cliente/DashboardCliente' && (
              <li className="breadcrumb-item active" aria-current="page">
                {navItems.find(item => item.href === pathname)?.label || 'Página'}
              </li>
            )}
          </ol>
        </nav>
      </div>

      {/* Main content */}
      <main className="container-fluid px-4 pb-4">
        {children}
      </main>

      {/* Custom styles */}
      <style jsx>{`
        .hover-bg-white-10:hover {
          background-color: rgba(255,255,255,0.1) !important;
        }
        
        .transition-all {
          transition: all 0.3s ease;
        }
        
        .nav-link:hover {
          transform: translateY(-1px);
        }
        
        .dropdown-menu {
          border-radius: 12px;
          padding: 0.5rem 0;
        }
        
        .dropdown-item {
          padding: 0.5rem 1rem;
          transition: all 0.2s ease;
        }
        
        .dropdown-item:hover {
          background-color: #f8f9fa;
          transform: translateX(2px);
        }
        
        .breadcrumb-item a:hover {
          color: #6f42c1 !important;
        }
        
        @media (max-width: 768px) {
          .navbar-nav {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255,255,255,0.1);
          }
          
          .nav-item {
            margin: 0.25rem 0;
          }
        }
      `}</style>
    </div>
  );
}