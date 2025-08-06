import { User } from '@/entity/User';
import { deleteUserService, getAllUsersService, updateUserService } from '@/services/user.service';
import bcrypt from 'bcryptjs';

export async function getAllUsersController() {
    const users = await getAllUsersService();
    if (!users || users.length === 0) {
        return { error: 'No se encontraron usuarios' };
    }
    return users;
}

export async function updateUserController(id: number, body: {
    nombre: string;
    email: string;
    password: string;
    rol: string;
    telefono?: string;
    activo?: boolean;
    mfa_secret?: string;
}) {
    const { nombre, email, password, rol, telefono, activo, mfa_secret } = body;

    if (!nombre && !email && !password && !rol && !telefono && activo === undefined && !mfa_secret) {
        return { error: 'No se proporcionaron datos para actualizar el usuario' }
    }

    const userData: Partial<User> = {};
    if (nombre) userData.nombre = nombre;
    if (email) userData.email = email;
    if (password) userData.password_hash = password;
    if (rol) userData.rol = rol;
    if (telefono) userData.telefono = telefono;
    if (activo !== undefined) userData.activo = activo;
    if (mfa_secret) userData.mfa_secret = mfa_secret;
    userData.fecha_actualizacion = new Date();
    userData.fecha_creacion = new Date();

    const updatedUser = await updateUserService(id, userData);
    if (!updatedUser) {
        return { error: 'Usuario no encontrado' };
    }

    return updatedUser;
}

export async function deleteUserController(id: number) {
    
    if (!id) {
        return { error: 'Falta el ID del usuario' };
    }
    
    const deletedUser = await deleteUserService(id);
    if (!deletedUser) {
        return { error: 'Usuario no encontrado' };
    }
    return deletedUser;
}