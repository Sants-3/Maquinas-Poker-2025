import { createUserRepository, findUserByEmailRepository, findUserByNombreRepository } from '@/repositories/user.repository';
import { loginUserService, registerUserService } from '@/services/auth.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('@/repositories/user.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

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

// Definimos los tipos de las respuestas mockeadas para que TypeScript no marque errores
type UserMock = {
  nombre: string;
  email: string;
  rol: string;
  password_hash: string;
};

describe('loginUserService', () => {
  it('debe retornar error si el usuario no existe', async () => {
    // Simulamos que findUserByEmailRepository devuelve null (usuario no encontrado)
    (findUserByEmailRepository as jest.Mock).mockResolvedValue(null); // Mock a null

    const result = await loginUserService('correoinexistente@email.com', 'password');
    expect(result).toEqual({ error: 'Usuario no encontrado' });
  });

  it('debe retornar error si la contraseña es incorrecta', async () => {
    // Simulamos que el usuario existe, pero la contraseña no es válida
    (findUserByEmailRepository as jest.Mock).mockResolvedValue({
      email: 'cposas@email.com',
      password_hash: 'constraeña_hasheada',
    } as UserMock);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Contraseña incorrecta

    const result = await loginUserService('cposas@email.com', 'contraseña_incorrecta');
    expect(result).toEqual({ error: 'Contraseña inválida' });
  });

  it('debe devolver el usuario y el token si el login es exitoso', async () => {
    // Simulamos que el usuario existe y la contraseña es válida
    (findUserByEmailRepository as jest.Mock).mockResolvedValue({
      email: 'cposas@email.com',
      rol: 'admin',
      password_hash: 'contraseña_hasheada',
    } as UserMock);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Contraseña correcta
    (jwt.sign as jest.Mock).mockReturnValue('fake_jwt_token'); // Mock de JWT

    const result = await loginUserService('cposas@email.com', 'constraseña_correcta');
    expect(result).toEqual({
      user: { email: 'cposas@email.com', rol: 'admin', password_hash: 'contraseña_hasheada' },
      token: 'fake_jwt_token',
    });
  });
});

describe('registerUserService', () => {
  it('debe devolver error si el nombre de usuario ya está en uso', async () => {
    (findUserByNombreRepository as jest.Mock).mockResolvedValue(true); // Simulamos que el nombre de usuario ya está en uso

    const result = await registerUserService('cposas', 'cposas@email.com', 'password', 'cliente', true);
    expect(result).toEqual({ error: 'El nombre de usuario ya está en uso' });
  });

  it('debe devolver error si el correo ya está en uso', async () => {
    // 💡 Corregido: Ahora se mockea el repositorio correcto para esta prueba.
    (findUserByNombreRepository as jest.Mock).mockResolvedValue(null); // Se asegura de que el nombre de usuario no esté en uso
    (findUserByEmailRepository as jest.Mock).mockResolvedValue(true); // Simulamos que el correo ya está registrado

    const result = await registerUserService('cposas', 'cposas@email.com', 'password', 'cliente', true);
    expect(result).toEqual({ error: 'El correo electrónico ya está en uso' });
  });

  it('debe registrar un nuevo usuario exitosamente', async () => {
    (findUserByNombreRepository as jest.Mock).mockResolvedValue(null); // Nombre de usuario disponible
    (findUserByEmailRepository as jest.Mock).mockResolvedValue(null); // Correo disponible
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    // 💡 Corregido: Se alinea el rol del mock con el valor esperado en la aserción.
    (createUserRepository as jest.Mock).mockResolvedValue({
      nombre: 'newuser',
      email: 'newuser@email.com',
      rol: 'admin',
    } as UserMock);
    (jwt.sign as jest.Mock).mockReturnValue('fake_jwt_token'); // Mock de JWT

    const result = await registerUserService('newuser', 'newuser@email.com', 'password', 'admin', true);
    expect(result).toEqual({
      newUser: { nombre: 'newuser', email: 'newuser@email.com', rol: 'admin' },
      token: 'fake_jwt_token',
    });
  });
});