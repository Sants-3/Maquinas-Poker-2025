import { getAllUsersService, updateUserService, deleteUserService } from '@/services/user.service';
import { getAllUsersRepository, updateUserRepository, deleteUserRepository } from '@/repositories/user.repository';

jest.mock('@/repositories/user.repository'); // Mockear todo el módulo de repositorios
// 💡 Mockear TypeORM de forma más completa para evitar el error de decoradores
jest.mock('typeorm', () => {
  return {
    // Proporciona mocks para los decoradores que se usarán en las entidades
    Entity: () => jest.fn(),
    PrimaryGeneratedColumn: () => jest.fn(),
    Column: () => jest.fn(),
    ManyToOne: () => jest.fn(),
    JoinColumn: () => jest.fn(),
    OneToMany: () => jest.fn(),
    DataSource: jest.fn().mockImplementation(() => {
      return {
        initialize: jest.fn().mockResolvedValue(true),
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn(),
          save: jest.fn(),
        }),
      };
    }),
  };
});

describe('User Service', () => {

  // Test para getAllUsersService
  describe('getAllUsersService', () => {
    it('debe devolver todos los usuarios si existen', async () => {
      // Simulamos que la función de repositorio devuelve una lista de usuarios
      const mockUsers = [
        { id: 1, email: 'user_retornado1@email.com', rol: 'admin' },
        { id: 2, email: 'user_retornado2@email.com', rol: 'cliente' },
      ];
      (getAllUsersRepository as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getAllUsersService();

      // Verificamos que el resultado sea igual al mock
      expect(result).toEqual(mockUsers);
    });

    it('debe devolver un array vacío si no hay usuarios', async () => {
      // Simulamos que no hay usuarios
      (getAllUsersRepository as jest.Mock).mockResolvedValue([]);

      const result = await getAllUsersService();

      expect(result).toEqual([]);
    });
  });

  // Test para updateUserService
  describe('updateUserService', () => {
    it('debe devolver el usuario actualizado si la actualización es exitosa', async () => {
      // Simulamos que el repositorio devuelve el usuario actualizado
      const updatedUser = { id: 1, email: 'usuario_actualizado@email.com', rol: 'admin' };
      (updateUserRepository as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateUserService(1, { email: 'usuario_actualizado@email.com' });

      expect(result).toEqual(updatedUser);
    });

    it('debe devolver un error si la actualización falla', async () => {
      // Simulamos que no se puede actualizar el usuario
      (updateUserRepository as jest.Mock).mockResolvedValue(null);

      const result = await updateUserService(1, { email: 'usuario_actualizado@email.com' });

      expect(result).toEqual({ error: 'No se pudo actualizar el usuario' });
    });
  });

  // Test para deleteUserService
  describe('deleteUserService', () => {
    it('debe devolver el usuario eliminado si la eliminación es exitosa', async () => {
      // Simulamos que el repositorio devuelve el usuario eliminado
      const deletedUser = { id: 1, email: 'user_eliminado1@email.com', rol: 'admin' };
      (deleteUserRepository as jest.Mock).mockResolvedValue(deletedUser);

      const result = await deleteUserService(1);

      expect(result).toEqual(deletedUser);
    });

    it('debe devolver un error si la eliminación falla', async () => {
      // Simulamos que no se puede eliminar el usuario
      (deleteUserRepository as jest.Mock).mockResolvedValue(null);

      const result = await deleteUserService(1);

      expect(result).toEqual({ error: 'No se pudo eliminar el usuario' });
    });
  });

});