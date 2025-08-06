import { User } from '@/entity/User';
import { deleteUserRepository, getAllUsersRepository, updateUserRepository } from '@/repositories/user.repository';

export async function getAllUsersService() {
  const users = await getAllUsersRepository();
  return users;
}

export async function updateUserService(id: number, userData: Partial<User>) {
    const updatedUser = await updateUserRepository(id, userData);
    if (!updatedUser) {
        return { error: 'No se pudo actualizar el usuario' };
    }
    return updatedUser;
}

export async function deleteUserService(id: number) {
    const deletedUser = await deleteUserRepository(id);
    if (!deletedUser) {
        return { error: 'No se pudo eliminar el usuario' };
    }

    return deletedUser;
}