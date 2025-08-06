import { InventarioService } from '@/services/inventarios.service';
import { InventarioRepository } from '@/repositories/inventarios.repository';

// Mockear el repositorio
jest.mock('@/repositories/inventarios.repository');
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

describe('InventarioService', () => {

  // Test para obtener inventarios sin ID (debe devolver todos los inventarios)
  describe('getInventario', () => {
    it('debe devolver todos los inventarios si no se pasa un ID', async () => {
      // Simulamos que la función `findAll` devuelve un listado de inventarios
      const mockInventarios = [
        { id: 1, nombre: 'Producto A', cantidad: 10 },
        { id: 2, nombre: 'Producto B', cantidad: 5 },
      ];
      (InventarioRepository.findAll as jest.Mock).mockResolvedValue(mockInventarios);

      const result = await InventarioService.getInventario();

      // Verificamos que el resultado es igual al listado de inventarios mockeado
      expect(result).toEqual(mockInventarios);
      expect(InventarioRepository.findAll).toHaveBeenCalled(); // Aseguramos que `findAll` fue llamado
    });

    it('debe devolver un array vacío si no hay inventarios', async () => {
      // Simulamos que no hay inventarios en la base de datos
      (InventarioRepository.findAll as jest.Mock).mockResolvedValue([]);

      const result = await InventarioService.getInventario();

      // Verificamos que el resultado sea un array vacío
      expect(result).toEqual([]);
    });
  });

  // Test para obtener un inventario por ID (debe devolver un inventario específico)
  describe('getInventario con ID', () => {
    it('debe devolver un inventario por ID si se pasa un ID', async () => {
      // Simulamos que la función `findById` devuelve un inventario específico
      const mockInventario = { id: 1, nombre: 'Producto A', cantidad: 10 };
      (InventarioRepository.findById as jest.Mock).mockResolvedValue(mockInventario);

      const result = await InventarioService.getInventario(1);

      // Verificamos que el resultado sea el inventario con el ID especificado
      expect(result).toEqual(mockInventario);
      expect(InventarioRepository.findById).toHaveBeenCalledWith(1); // Verificamos que se pasó el ID correcto
    });

    it('debe devolver null si no encuentra un inventario por ID', async () => {
      // Simulamos que no se encuentra un inventario con el ID dado
      (InventarioRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await InventarioService.getInventario(999); // Usamos un ID que no existe

      // Verificamos que el resultado sea null (no se encontró)
      expect(result).toBeNull();
    });
  });

});