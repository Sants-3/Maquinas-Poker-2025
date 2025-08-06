import { MaquinaService } from '@/services/maquinas.service';
import { MaquinaRepository } from '@/repositories/maquinas.repository';

// Mockear las funciones de MaquinaRepository
jest.mock('@/repositories/maquinas.repository');
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

describe('MaquinaService', () => {

  // Test para getMaquinas
  describe('getMaquinas', () => {
    it('debe devolver todas las máquinas si no se pasa un ID', async () => {
      // Simulamos que la función `findAll` devuelve una lista de máquinas
      const mockMaquinas = [
        { id: 1, nombre: 'Maquina A', estado: 'operativa' },
        { id: 2, nombre: 'Maquina B', estado: 'en mantenimiento' },
      ];
      (MaquinaRepository.findAll as jest.Mock).mockResolvedValue(mockMaquinas);

      const result = await MaquinaService.getMaquinas();

      expect(result).toEqual(mockMaquinas);
      expect(MaquinaRepository.findAll).toHaveBeenCalled(); // Verificamos que `findAll` fue llamado
    });

    it('debe devolver una máquina por ID si se pasa un ID', async () => {
      const mockMaquina = { id: 1, nombre: 'Maquina A', estado: 'operativa' };
      (MaquinaRepository.findById as jest.Mock).mockResolvedValue(mockMaquina);

      const result = await MaquinaService.getMaquinas(1);

      expect(result).toEqual(mockMaquina);
      expect(MaquinaRepository.findById).toHaveBeenCalledWith(1); // Verificamos que se pasó el ID correcto
    });

    it('debe devolver null si no se encuentra la máquina por ID', async () => {
      // Simulamos que no se encuentra la máquina
      (MaquinaRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await MaquinaService.getMaquinas(999);

      expect(result).toBeNull();
    });
  });

  // Test para createMaquina
  describe('createMaquina', () => {
    it('debe crear una nueva máquina si el proveedor y la ubicación existen', async () => {
      const mockProveedor = { id: 1, nombre: 'Proveedor A' };
      const mockUbicacion = { id: 1, nombre: 'Ubicación A' };
      const mockUsuario = { id: 1, nombre: 'Usuario A' };
      const mockMaquina = { id: 1, nombre: 'Maquina A', estado: 'operativa' };

      // Simulamos que los repositorios devuelven los valores correctos
      (MaquinaRepository.findProveedorById as jest.Mock).mockResolvedValue(mockProveedor);
      (MaquinaRepository.findUbicacionById as jest.Mock).mockResolvedValue(mockUbicacion);
      (MaquinaRepository.findUsuarioById as jest.Mock).mockResolvedValue(mockUsuario);
      (MaquinaRepository.create as jest.Mock).mockResolvedValue(mockMaquina);

      const data = {
        nombre: 'Maquina A',
        modelo: 'Modelo X',
        estado: 'operativa',
        proveedor_id: 1,
        ubicacion_id: 1,
        usuario_id: 1,
        numero_serie: '12345',
        fecha_adquisicion: new Date(),
        fecha_instalacion: new Date(),
        ultimo_mantenimiento: new Date(),
        proximo_mantenimiento: new Date(),
        notas: 'Notas de la máquina',
      };

      const result = await MaquinaService.createMaquina(data);

      expect(result).toEqual(mockMaquina);
      expect(MaquinaRepository.create).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Maquina A' }));
    });

    it('debe lanzar un error si el proveedor o la ubicación no se encuentran', async () => {
      // Simulamos que el proveedor no se encuentra
      (MaquinaRepository.findProveedorById as jest.Mock).mockResolvedValue(null);

      const data = {
        nombre: 'Maquina A',
        modelo: 'Modelo X',
        estado: 'operativa',
        proveedor_id: 1,
        ubicacion_id: 1,
        usuario_id: 1,
        numero_serie: '12345',
        fecha_adquisicion: new Date(),
        fecha_instalacion: new Date(),
        ultimo_mantenimiento: new Date(),
        proximo_mantenimiento: new Date(),
        notas: 'Notas de la máquina',
      };

      await expect(MaquinaService.createMaquina(data)).rejects.toThrow('Proveedor o ubicación no encontrada');
    });
  });

  // Test para updateMaquina
  describe('updateMaquina', () => {
    it('debe actualizar la máquina si la máquina existe', async () => {
      const mockMaquina = { id: 1, nombre: 'Maquina A', estado: 'operativa' };

      // Simulamos que `findById` devuelve la máquina existente
      (MaquinaRepository.findById as jest.Mock).mockResolvedValue(mockMaquina);
      (MaquinaRepository.update as jest.Mock).mockResolvedValue(mockMaquina);

      const data = { id: 1, nombre: 'Maquina A - Actualizada', estado: 'en mantenimiento' };

      const result = await MaquinaService.updateMaquina(data);

      expect(result).toEqual(mockMaquina);
      expect(MaquinaRepository.update).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Maquina A - Actualizada' }));
    });

    it('debe lanzar un error si la máquina no se encuentra', async () => {
      // Simulamos que no se encuentra la máquina
      (MaquinaRepository.findById as jest.Mock).mockResolvedValue(null);

      const data = { id: 999, nombre: 'Maquina Inexistente' };

      await expect(MaquinaService.updateMaquina(data)).rejects.toThrow('Máquina no encontrada');
    });
  });

  // Test para deleteMaquina
  describe('deleteMaquina', () => {
    it('debe eliminar la máquina si existe', async () => {
      const mockMaquina = { id: 1, nombre: 'Maquina A', estado: 'operativa' };

      // Simulamos que `findById` devuelve la máquina existente
      (MaquinaRepository.findById as jest.Mock).mockResolvedValue(mockMaquina);
      (MaquinaRepository.remove as jest.Mock).mockResolvedValue(mockMaquina);

      const result = await MaquinaService.deleteMaquina(1);

      expect(result).toEqual(mockMaquina);
      expect(MaquinaRepository.remove).toHaveBeenCalledWith(mockMaquina);
    });

    it('debe lanzar un error si la máquina no se encuentra', async () => {
      // Simulamos que no se encuentra la máquina
      (MaquinaRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(MaquinaService.deleteMaquina(999)).rejects.toThrow('Máquina no encontrada');
    });
  });

});