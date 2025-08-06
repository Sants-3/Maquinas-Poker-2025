import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { findUserByNombreRepository, createUserRepository, findUserByEmailRepository, updateUltimoLoginRepository } from '@/repositories/user.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_maquinas_poker';

export async function loginUserService(email: string, password: string) {
  const user = await findUserByEmailRepository(email);
  if (!user) return { error: 'Usuario no encontrado' };
    // console.log("UsuarioService", nombre, password, user);
  const contraseñaValida = await bcrypt.compare(password, user.password_hash);
  if (!contraseñaValida) return { error: 'Contraseña inválida' };

    updateUltimoLoginRepository(user.id);

    const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, {
      expiresIn: '4h',
    });

  return { user, token };
}

export async function registerUserService(
    nombre: string,
    email: string, 
    password: string, 
    rol: string,
    activo: boolean,
    telefono?: string,
    mfa_secret?: string
) {
    const existingUser = await findUserByNombreRepository(nombre);
    const existingEmail = await findUserByEmailRepository(email);
    if (existingUser) {
        return { error: 'El nombre de usuario ya está en uso' };
    }
    if (existingEmail) {
        return { error: 'El correo electrónico ya está en uso' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fechaActual = new Date();

    const newUser = await createUserRepository({ 
        nombre, 
        email, 
        password_hash: hashedPassword, 
        rol,
        telefono,
        activo,
        mfa_secret,
        fecha_creacion: fechaActual,
        fecha_actualizacion: fechaActual
    });

    const token = jwt.sign({ id: newUser.id, rol: newUser.rol }, JWT_SECRET, {
        expiresIn: '4h',
      });

    return { newUser, token };
}