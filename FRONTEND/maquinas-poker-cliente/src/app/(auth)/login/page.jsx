'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [isLogging, setIsLogging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError('Credenciales inválidas');
        return;
      }

      // Next-Auth maneja la sesión automáticamente
      console.log('Login exitoso');
      
      // Obtener la sesión actualizada
      const session = await getSession();
      console.log('session', session);
      
      // El rol está dentro de session.user
      const rol = session?.user?.role || session?.user?.rol;

      setIsLogging(true);
      
      switch (rol) {
        case 'admin':
          router.push('/admin');
          break;
        case 'cliente':
          router.push('/cliente');
          break;
        case 'tecnico':
          router.push('/tecnico');
          break;
        default:
          router.push('/');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-800">
    <div className="bg-gray-50 p-8 pt-16 rounded-lg shadow-lg w-full max-w-md relative border border-gray-200">
      {/* Botón para volver al inicio */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-blue-600 hover:text-blue-700 font-semibold"
      >
        ← Volver al inicio
      </Link>

      {/* Título principal */}
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
        Inicio de Sesión
      </h1>

      {/* Mensaje de error si las credenciales son inválidas */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Campo para el correo electrónico */}
        <div className="mb-5">
          <label className="block mb-2 text-gray-700" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition duration-200"
            required
          />
        </div>

        {/* Campo para la contraseña */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700" htmlFor="password">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition duration-200"
            required
          />
        </div>

        {/* Botón para enviar el formulario */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
        >
          {isLoading ? (
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : isLogging ? (
            <i className="bi bi-check-all"></i>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>
    </div>
  </div>
);
}
