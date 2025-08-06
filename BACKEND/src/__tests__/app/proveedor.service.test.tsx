import { ProveedorService } from '@/services/proveedor.service';
import { ProveedorRepository } from '@/repositories/proveedor.repository';

jest.mock('@/repositories/proveedor.repository');
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

describe('ProveedorService', () => {

  // Test para getProveedores
  describe('getProveedores', () => {
    it('debe devolver todos los proveedores si no se pasa un ID', async () => {
      const mockProveedores = [
        { id: 1, nombre: 'Proveedor A', email: 'a@correo.com' },
        { id: 2, nombre: 'Proveedor B', email: 'b@correo.com' },
      ];
      (ProveedorRepository.findAll as jest.Mock).mockResolvedValue(mockProveedores);

      const result = await ProveedorService.getProveedores();

      expect(result).toEqual(mockProveedores);
      expect(ProveedorRepository.findAll).toHaveBeenCalled();
    });

    it('debe devolver un proveedor por ID si se pasa un ID', async () => {
      const mockProveedor = { id: 1, nombre: 'Proveedor A', email: 'a@correo.com' };
      (ProveedorRepository.findById as jest.Mock).mockResolvedValue(mockProveedor);

      const result = await ProveedorService.getProveedores(1);

      expect(result).toEqual(mockProveedor);
      expect(ProveedorRepository.findById).toHaveBeenCalledWith(1);
    });

    it('debe devolver null si no se encuentra el proveedor por ID', async () => {
      (ProveedorRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await ProveedorService.getProveedores(999);

      expect(result).toBeNull();
    });
  });

  // Test para createProveedor
  describe('createProveedor', () => {
    it('debe crear un proveedor si no existe otro con el mismo correo', async () => {
      const mockProveedor = { id: 1, nombre: 'Proveedor A', email: 'a@correo.com' };

      // Simulamos que no hay proveedores con el mismo email
      (ProveedorRepository.findAll as jest.Mock).mockResolvedValue([{ email: 'b@correo.com' }]);
      (ProveedorRepository.create as jest.Mock).mockResolvedValue(mockProveedor);

      const data = { nombre: 'Proveedor Ejemplo',
      email: 'proveedor@ejemplo.com',
      telefono: '+50499887766',
      contacto: 'Juan Pérez',
      rtn: '080119800012345',
      tipo_servicio: 'Repuestos y Equipo',
      calificacion: 5,
      activo: true };

      const result = await ProveedorService.createProveedor(data);

      expect(result).toEqual(mockProveedor);
      expect(ProveedorRepository.create).toHaveBeenCalledWith(data);
    });

    it('debe lanzar un error si ya existe un proveedor con el mismo correo', async () => {
      // Simulamos que ya existe un proveedor con el mismo email
      (ProveedorRepository.findAll as jest.Mock).mockResolvedValue([{ email: 'proveedor@ejemplo.com' }]);

      const data = { nombre: 'Proveedor Ejemplo',
      email: 'proveedor@ejemplo.com',
      telefono: '+50499887766',
      contacto: 'Juan Pérez',
      rtn: '080119800012345',
      tipo_servicio: 'Repuestos y Equipo',
      calificacion: 5,
      activo: true };

      await expect(ProveedorService.createProveedor(data)).rejects.toThrow('Ya existe un proveedor con este correo electrónico');
    });
  });

  // Test para updateProveedor
  describe('updateProveedor', () => {
    it('debe actualizar el proveedor si existe', async () => {
      const mockProveedor = { id: 1, nombre: 'Proveedor Ejemplo', email: 'proveedor@ejemplo.com' };

      // Simulamos que el proveedor existe
      (ProveedorRepository.findById as jest.Mock).mockResolvedValue(mockProveedor);
      (ProveedorRepository.update as jest.Mock).mockResolvedValue(mockProveedor);

      const data = { id: 1, nombre: 'Proveedor Ejemplo',
      email: 'proveedor@ejemplo.com',
      telefono: '+50499887766',
      contacto: 'Juan Pérez',
      rtn: '080119800012345',
      tipo_servicio: 'Repuestos y Equipo',
      calificacion: 5,
      activo: true };

      const result = await ProveedorService.updateProveedor(data);

      expect(result).toEqual(mockProveedor);
      expect(ProveedorRepository.update).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Proveedor Ejemplo',
      email: 'proveedor@ejemplo.com',
      telefono: '+50499887766',
      contacto: 'Juan Pérez',
      rtn: '080119800012345',
      tipo_servicio: 'Repuestos y Equipo',
      calificacion: 5,
      activo: true }));
    });

    it('debe lanzar un error si el proveedor no se encuentra', async () => {
      // Simulamos que el proveedor no se encuentra
      (ProveedorRepository.findById as jest.Mock).mockResolvedValue(null);

      const data = { id: 999, nombre: 'Proveedor Ejemplo',
      email: 'proveedor@ejemplo.com',
      telefono: '+50499887766',
      contacto: 'Juan Pérez',
      rtn: '080119800012345',
      tipo_servicio: 'Repuestos y Equipo',
      calificacion: 5,
      activo: true };

      await expect(ProveedorService.updateProveedor(data)).rejects.toThrow('Proveedor no encontrado');
    });
  });

  // Test para deleteProveedor
  describe('deleteProveedor', () => {
    it('debe eliminar el proveedor si existe', async () => {
      const mockProveedor = { id: 1, nombre: 'Proveedor A', email: 'a@correo.com' };

      // Simulamos que el proveedor existe
      (ProveedorRepository.findById as jest.Mock).mockResolvedValue(mockProveedor);
      (ProveedorRepository.remove as jest.Mock).mockResolvedValue(mockProveedor);

      const result = await ProveedorService.deleteProveedor(1);

      expect(result).toEqual(mockProveedor);
      expect(ProveedorRepository.remove).toHaveBeenCalledWith(mockProveedor);
    });

    it('debe lanzar un error si el proveedor no se encuentra', async () => {
      // Simulamos que no se encuentra el proveedor
      (ProveedorRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(ProveedorService.deleteProveedor(999)).rejects.toThrow('Proveedor no encontrado');
    });
  });

});
