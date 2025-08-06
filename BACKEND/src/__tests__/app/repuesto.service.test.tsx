import { RepuestoService } from '@/services/repuesto.service';
import { RepuestoRepository } from '@/repositories/repuesto.repository';

// Mockear las funciones de RepuestoRepository
jest.mock('@/repositories/repuesto.repository');
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

describe('RepuestoService', () => {

  // Test para getRepuestos
  describe('getRepuestos', () => {
    it('debe devolver todos los repuestos si no se pasa un ID', async () => {
      const mockRepuestos = [
        { id: 1, nombre: 'Repuesto A', cantidad: 10 },
        { id: 2, nombre: 'Repuesto B', cantidad: 5 },
      ];
      (RepuestoRepository.findAll as jest.Mock).mockResolvedValue(mockRepuestos);

      const result = await RepuestoService.getRepuestos();

      expect(result).toEqual(mockRepuestos);
      expect(RepuestoRepository.findAll).toHaveBeenCalled();
    });

    it('debe devolver un repuesto por ID si se pasa un ID', async () => {
      const mockRepuesto = { id: 1, nombre: 'Repuesto A', cantidad: 10 };
      (RepuestoRepository.findById as jest.Mock).mockResolvedValue(mockRepuesto);

      const result = await RepuestoService.getRepuestos(1);

      expect(result).toEqual(mockRepuesto);
      expect(RepuestoRepository.findById).toHaveBeenCalledWith(1);
    });

    it('debe devolver null si no se encuentra el repuesto por ID', async () => {
      (RepuestoRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await RepuestoService.getRepuestos(999);

      expect(result).toBeNull();
    });
  });

  // Test para createRepuesto
  describe('createRepuesto', () => {
    it('debe crear un repuesto si el proveedor existe', async () => {
      const mockProveedor = { id: 1, nombre: 'Proveedor A' };
      const mockRepuesto = { id: 1, nombre: 'Repuesto A', cantidad: 10 };

      // Simulamos que el proveedor existe
      (RepuestoRepository.findProveedorById as jest.Mock).mockResolvedValue(mockProveedor);
      (RepuestoRepository.create as jest.Mock).mockResolvedValue(mockRepuesto);

      const data = {
        nombre: 'Repuesto A',
        cantidad: 10,
        proveedor_id: 1,
        fecha_ultimo_reabastecimiento: new Date(),
      };

      const result = await RepuestoService.createRepuesto(data);

      expect(result).toEqual(mockRepuesto);
      expect(RepuestoRepository.create).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Repuesto A' }));
    });

    it('debe lanzar un error si el proveedor no existe', async () => {
      // Simulamos que el proveedor no existe
      (RepuestoRepository.findProveedorById as jest.Mock).mockResolvedValue(null);

      const data = {
        nombre: 'Repuesto A',
        cantidad: 10,
        proveedor_id: 999, // ID de proveedor no existente
        fecha_ultimo_reabastecimiento: new Date(),
      };

      await expect(RepuestoService.createRepuesto(data)).rejects.toThrow('Proveedor no encontrado');
    });
  });

  // Test para updateRepuesto
  describe('updateRepuesto', () => {
    it('debe actualizar el repuesto si el repuesto existe', async () => {
      const mockRepuesto = { id: 1, nombre: 'Repuesto A', cantidad: 10 };

      // Simulamos que `findById` devuelve el repuesto existente
      (RepuestoRepository.findById as jest.Mock).mockResolvedValue(mockRepuesto);
      (RepuestoRepository.update as jest.Mock).mockResolvedValue(mockRepuesto);

      const data = { id: 1, nombre: 'Repuesto A - Actualizado', cantidad: 15 };

      const result = await RepuestoService.updateRepuesto(data);

      expect(result).toEqual(mockRepuesto);
      expect(RepuestoRepository.update).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Repuesto A - Actualizado' }));
    });

    it('debe lanzar un error si el repuesto no se encuentra', async () => {
      // Simulamos que no se encuentra el repuesto
      (RepuestoRepository.findById as jest.Mock).mockResolvedValue(null);

      const data = { id: 999, nombre: 'Repuesto Inexistente' };

      await expect(RepuestoService.updateRepuesto(data)).rejects.toThrow('Repuesto no encontrado');
    });
  });

  // Test para deleteRepuesto
  describe('deleteRepuesto', () => {
    it('debe eliminar el repuesto si existe', async () => {
      const mockRepuesto = { id: 1, nombre: 'Repuesto A', cantidad: 10 };

      // Simulamos que `findById` devuelve el repuesto existente
      (RepuestoRepository.findById as jest.Mock).mockResolvedValue(mockRepuesto);
      (RepuestoRepository.remove as jest.Mock).mockResolvedValue(mockRepuesto);

      const result = await RepuestoService.deleteRepuesto(1);

      expect(result).toEqual(mockRepuesto);
      expect(RepuestoRepository.remove).toHaveBeenCalledWith(mockRepuesto);
    });

    it('debe lanzar un error si el repuesto no se encuentra', async () => {
      // Simulamos que no se encuentra el repuesto
      (RepuestoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(RepuestoService.deleteRepuesto(999)).rejects.toThrow('Repuesto no encontrado');
    });
  });

});