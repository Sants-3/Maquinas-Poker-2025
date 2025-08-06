import { UbicacionService } from '@/services/ubicaciones.service';
import { UbicacionRepository } from '@/repositories/ubicaciones.repository';

// Mockear las funciones de UbicacionRepository
jest.mock('@/repositories/ubicaciones.repository');
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

describe('UbicacionService', () => {

  // Test para getUbicaciones
  describe('getUbicaciones', () => {
    it('debe devolver todas las ubicaciones si no se pasa un ID', async () => {
      const mockUbicaciones = [
        { id: 1, nombre: 'Ubicación A' },
        { id: 2, nombre: 'Ubicación B' },
      ];
      (UbicacionRepository.findAll as jest.Mock).mockResolvedValue(mockUbicaciones);

      const result = await UbicacionService.getUbicaciones();

      expect(result).toEqual(mockUbicaciones);
      expect(UbicacionRepository.findAll).toHaveBeenCalled();  // Verifica que findAll fue llamado
    });

    it('debe devolver una ubicación por ID si se pasa un ID', async () => {
      const mockUbicacion = { id: 1, nombre: 'Ubicación A' };
      (UbicacionRepository.findById as jest.Mock).mockResolvedValue(mockUbicacion);

      const result = await UbicacionService.getUbicaciones(1);

      expect(result).toEqual(mockUbicacion);
      expect(UbicacionRepository.findById).toHaveBeenCalledWith(1);  // Verifica que se pasó el ID correcto
    });

    it('debe devolver null si no se encuentra la ubicación por ID', async () => {
      // Simulamos que no se encuentra la ubicación
      (UbicacionRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await UbicacionService.getUbicaciones(999);

      expect(result).toBeNull();  // Verifica que no se encontró la ubicación
    });
  });

});