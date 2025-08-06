import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { compare } from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Llamada directa a tu API backend
    const res = await fetch('http://backend:4000/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const { user } = await res.json();

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Devuelve los datos del usuario para que el cliente pueda iniciar sesión
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.nombre,
        email: user.correo,
        role: user.rol
      }
    });
    
  } catch (error) {
    console.error('Error en autenticación:', error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}