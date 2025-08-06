import { loginUserService, registerUserService } from '@/services/auth.service';

export async function loginController(body: { email: string; password: string }) {
  const { email, password } = body;

  if (!email || !password) {
    return { error: 'Correo y contraseña son obligatorios' };
  }

  const result = await loginUserService(email, password);
  return { ...result };
}

export async function registerController(body: { 
    nombre: string;
    email: string;
    password: string;
    rol: string;
    activo: boolean;
    telefono?: string;
    mfa_secret?: string;
}) {
    const { nombre,
            email,
            password, 
            rol,
            telefono, activo, mfa_secret } = body;

    if (!nombre || !email || !password || !rol || !telefono) {
        return { error: 'Faltan campos requeridos, verifique e intente nuevamente' };
    }

    const result = await registerUserService(nombre,
        email, password, rol, activo, telefono, mfa_secret);

    if (result.error) {
        return { error: result.error }
    }
    
    return { ...result };
}