"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const routesInfo = {
  Inventario: "Consulta su ubicación exacta, estado operativo y necesidades de mantenimiento. Registra entradas, salidas y traslados para una administración eficiente y actualizada.",
  Finanzas: "Registra ingresos diarios, mensuales y anuales por máquina. Obtén reportes precisos con márgenes de ganancia y análisis comparativos.",
  Clientes: "Gestiona información de contacto, historial de servicios, reportes recibidos y solicitudes de asistencia. Mejora la atención y la fidelización de tus clientes.",
  Ayuda: "Nuestro equipo está listo para ayudarte en todo momento.\n •Correo: soporte@techtitan.com\nTeléfono / • WhatsApp: +504 9232-2344\nTambién puedes usar el botón de Contactar Soporte en la parte inferior derecha para escribirnos directamente.",
  Empresa: `Tech Titan es una empresa enfocada en ofrecer soluciones inteligentes para la gestión de máquinas de póker.\n 
  Combinamos innovación tecnológica con atención personalizada para optimizar procesos como inventario, finanzas y mantenimiento. Contamos con un equipo multidisciplinario comprometido con la mejora continua, la seguridad y el crecimiento de nuestros clientes.`
};

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeInfo, setActiveInfo] = useState(null);

  const modules = [
    "Inventario: Ubicación, estado y control en tiempo real de todas tus máquinas.",
    "Finanzas: Registro y análisis detallado de ingresos y rentabilidad.",
    "Calidad: Mantenimiento preventivo y correctivo para máxima eficiencia.",
    "Informes: Dashboards y reportes inteligentes para tomar decisiones estratégicas.",
    "Servicios de Campo: Órdenes de trabajo y asistencia técnica desde dispositivos móviles.",
  ];

  return (
    // General background and text color, adjusted for a slightly darker feel
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Navbar - Using a darker shade of blue */}
      <nav className="bg-gray-900 shadow-md py-4 px-6 flex items-center justify-between relative z-20 md:px-8 lg:px-16">
        {/* Logo e inicio */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/TT.png"
            alt="Tech Titan Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-2xl font-bold text-white cursor-pointer">MaquinasPoker</span>
        </Link>

        {/* Botón menú móvil */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuMenuOpen)}
            className="text-white focus:outline-none"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? (
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Navegación desktop */}
        <div className="hidden md:flex flex-row items-center gap-6 relative">
          {Object.entries(routesInfo).map(([route, description]) => (
            <div
              key={route}
              className="relative"
              onMouseEnter={() => setActiveInfo(route)}
              onMouseLeave={() => setActiveInfo(null)}
            >
              <button className="text-gray-300 hover:text-gray-100 transition-colors text-lg font-medium">
                {route}
              </button>

              {activeInfo === route && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white text-gray-800 text-sm shadow-lg rounded p-3 z-50">
                  {description.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-1">{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Teléfono y botones */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-gray-400 font-medium">(+504) 9232-2344</span>
          <Link href="/login" className="text-gray-200 hover:text-white font-medium">Iniciar sesión</Link>
          <Link href="/login">
            <button className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition-colors shadow-md text-lg font-semibold">
              Registrarse
            </button>
          </Link>
        </div>
      </nav>


      {/* Mobile menu (visible only on small screens when open) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-blue-800 shadow-lg py-4 z-10">
          <div className="flex flex-col items-center gap-4">
            {Object.keys(routesInfo).map((route) => (
              <Link
                key={route}
                href={`/${route.toLowerCase()}`}
                className="text-gray-200 hover:text-blue-300 py-2 text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
              >
                {route[0].toUpperCase() + route.slice(1)}
              </Link>
            ))}
            <Link href="/login" className="text-gray-200 hover:text-blue-300 text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Iniciar sesión</Link>
            <Link href="/login">
              <button className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition-colors shadow-md text-lg font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                Registrarse
              </button>
            </Link>
            <span className="text-gray-300 mt-2 text-lg font-medium">(+504) 9232-2344</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main className="relative flex flex-col lg:flex-row items-center justify-center p-8 lg:p-16 gap-8 bg-gray-100 min-h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl z-10 relative">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-blue-700 leading-tight mb-6"> {/* Darker blue for headings */}
            Máquinas de Póker
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-xl"> {/* Darker gray for text */}
            Optimiza la operación de tus máquinas de póker con un sistema inteligente, modular y centralizado.
            Esta plataforma fue diseñada para controlar y analizar cada aspecto del negocio, desde el inventario 
            hasta las finanzas, la calidad del servicio y la gestión técnica en campo.
          </p>
          <div className="flex justify-center">
            <Link href="/login">
              <button className="w-full sm:w-auto px-8 py-3 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors shadow-lg text-lg font-semibold"> {/* Darker blue button */}
                Registrarse
              </button>
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full lg:w-1/2 h-80 sm:h-96 lg:h-[450px] rounded-2xl shadow-xl overflow-hidden flex items-center justify-center bg-gray-200">
            <Image
                src="/Poker.jpg" // IMAGE PATH
                alt="Máquina de Póker"
                fill 
                className="object-cover" 
                priority 
            />
        </div>
      </main>

      {/* Modules Section */}
      <section className="py-16 px-8 lg:px-16 bg-gray-900 text-white"> {/* Darker background for modules section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-400">Módulos del sistema:</h2> {/* Lighter blue for heading on dark background */}
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            {modules.map((module, index) => (
              <li key={index} className="flex items-start bg-gray-700 p-4 rounded-lg shadow-sm"> {/* Darker gray for module cards */}
                <span className="text-green-400 font-bold mr-3 text-xl">✓</span> {/* Muted green */}
                {module}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Floating Support Button */}
      <a
        href="#"
        className="fixed bottom-6 right-6 bg-blue-700 text-white p-4 rounded-full shadow-lg hover:bg-blue-800 transition-colors flex items-center gap-2 font-semibold z-30" // Darker blue button
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Contactar Soporte
      </a>
    </div>
  );
}
