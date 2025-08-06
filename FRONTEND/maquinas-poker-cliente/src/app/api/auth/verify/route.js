import { NextResponse } from 'next/server';
//import { findUserById } from '@/lib/users';
import { verifyToken } from '../../../../libs/jwt';

export async function GET(request) {
  const token = request.cookies.get('authToken')?.value;

  if (!token) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    );
  }

  const user = verifyToken(token);
  
  if (!user) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}
