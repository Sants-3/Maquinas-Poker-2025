import { getAllMantenimientosService, createMantenimientoService, updateMantenimientoService, deleteMantenimientoService } from '@/services/mantenimiento.service';
import { findAllMantenimientosRepository, createMantenimientoRepository, updateMantenimientoRepository, deleteMantenimientoRepository, findOrdenByIdRepository, findTecnicoByIdRepository } from '@/repositories/mantenimiento.repository';

jest.mock('@/repositories/mantenimiento.repository'); // Mockear todo el módulo de repositorios
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

describe('Mantenimiento Service', () => {

  // Test para getAllMantenimientosService
  describe('getAllMantenimientosService', () => {
    it('debe devolver todos los mantenimientos', async () => {
      // Simulamos que la función de repositorio devuelve una lista de mantenimientos
      const mockMantenimientos = [
        { id: 1, tipo: 'Reparación', estado: 'Completado' },
        { id: 2, tipo: 'Mantenimiento', estado: 'Pendiente' },
      ];
      (findAllMantenimientosRepository as jest.Mock).mockResolvedValue(mockMantenimientos);

      const result = await getAllMantenimientosService();

      expect(result).toEqual(mockMantenimientos);
    });

    it('debe devolver un array vacío si no hay mantenimientos', async () => {
      // Simulamos que no hay mantenimientos
      (findAllMantenimientosRepository as jest.Mock).mockResolvedValue([]);

      const result = await getAllMantenimientosService();

      expect(result).toEqual([]);
    });
  });

  // Test para createMantenimientoService
  describe('createMantenimientoService', () => {
    it('debe crear un mantenimiento si todos los datos son válidos', async () => {
      // Simulamos la existencia de la orden y el técnico
      const mockOrden = { id: 1, estado: 'abierta' };
      const mockTecnico = { id: 1, nombre: 'Juan Pérez' };
      const mockMantenimiento = { id: 1, tipo: 'Reparación', resultado: 'Exitoso' };

      (findOrdenByIdRepository as jest.Mock).mockResolvedValue(mockOrden);
      (findTecnicoByIdRepository as jest.Mock).mockResolvedValue(mockTecnico);
      (createMantenimientoRepository as jest.Mock).mockResolvedValue(mockMantenimiento);

      const body = {
        orden_trabajo_id: 1,
        tipo: 'Reparación',
        descripcion: 'Reemplazo de piezas',
        acciones_realizadas: 'Reemplazo de piezas defectuosas',
        repuestos_utilizados: 'Pieza A, Pieza B',
        costo_estimado: 1000,
        costo_real: 900,
        fecha_programada: new Date(),
        fecha_realizacion: new Date(),
        tecnico_id: 1,
        resultado: 'Exitoso',
        observaciones: 'Todo en orden',
      };

      const result = await createMantenimientoService(body);

      expect(result).toEqual({ result: mockMantenimiento });
    });

    it('debe devolver un error si la orden no se encuentra', async () => {
      // Simulamos que no se encuentra la orden
      (findOrdenByIdRepository as jest.Mock).mockResolvedValue(null);

      const body = {
        orden_trabajo_id: 1,
        tipo: 'Reparación',
        descripcion: 'Reemplazo de piezas',
        acciones_realizadas: 'Reemplazo de piezas defectuosas',
        repuestos_utilizados: 'Pieza A, Pieza B',
        costo_estimado: 1000,
        costo_real: 900,
        fecha_programada: new Date(),
        fecha_realizacion: new Date(),
        tecnico_id: 1,
        resultado: 'Exitoso',
        observaciones: 'Todo en orden',
      };

      const result = await createMantenimientoService(body);

      expect(result).toEqual({ error: "Orden de trabajo no encontrada." });
    });

    it('debe devolver un error si el técnico no se encuentra', async () => {
      // Simulamos que el técnico no se encuentra
      const mockOrden = { id: 1, estado: 'abierta' };
      (findOrdenByIdRepository as jest.Mock).mockResolvedValue(mockOrden);
      (findTecnicoByIdRepository as jest.Mock).mockResolvedValue(null);

      const body = {
        orden_trabajo_id: 1,
        tipo: 'Reparación',
        descripcion: 'Reemplazo de piezas',
        acciones_realizadas: 'Reemplazo de piezas defectuosas',
        repuestos_utilizados: 'Pieza A, Pieza B',
        costo_estimado: 1000,
        costo_real: 900,
        fecha_programada: new Date(),
        fecha_realizacion: new Date(),
        tecnico_id: 1,
        resultado: 'Exitoso',
        observaciones: 'Todo en orden',
      };

      const result = await createMantenimientoService(body);

      expect(result).toEqual({ error: "Técnico no encontrado." });
    });

    it('debe devolver un error si la fecha de realización es anterior a la programada', async () => {
      // Simulamos que la fecha de realización es anterior
      const mockOrden = { id: 1, estado: 'abierta' };
      const mockTecnico = { id: 1, nombre: 'Juan Pérez' };
      (findOrdenByIdRepository as jest.Mock).mockResolvedValue(mockOrden);
      (findTecnicoByIdRepository as jest.Mock).mockResolvedValue(mockTecnico);

      const body = {
        orden_trabajo_id: 1,
        tipo: 'Reparación',
        descripcion: 'Reemplazo de piezas',
        acciones_realizadas: 'Reemplazo de piezas defectuosas',
        repuestos_utilizados: 'Pieza A, Pieza B',
        costo_estimado: 1000,
        costo_real: 900,
        fecha_programada: new Date(),
        fecha_realizacion: new Date(Date.now() - 86400000), // Un día antes
        tecnico_id: 1,
        resultado: 'Exitoso',
        observaciones: 'Todo en orden',
      };

      const result = await createMantenimientoService(body);

      expect(result).toEqual({ error: "La fecha de realización no puede ser anterior a la programada." });
    });
  });

  // Test para updateMantenimientoService
  describe('updateMantenimientoService', () => {
    it('debe actualizar el mantenimiento si la actualización es exitosa', async () => {
      // Simulamos que el repositorio devuelve el mantenimiento actualizado
      const updatedMantenimiento = { id: 1, tipo: 'Reparación', estado: 'Completado' };
      (updateMantenimientoRepository as jest.Mock).mockResolvedValue(updatedMantenimiento);

      const result = await updateMantenimientoService(1, { tipo: 'Reparación' });

      expect(result).toEqual(updatedMantenimiento);
    });

    it('debe devolver un error si no se puede actualizar el mantenimiento', async () => {
      // Simulamos que no se puede actualizar el mantenimiento
      (updateMantenimientoRepository as jest.Mock).mockResolvedValue(null);

      const result = await updateMantenimientoService(1, { tipo: 'Reparación' });

      expect(result).toEqual({ error: 'No se pudo actualizar el mantenimiento' });
    });
  });

  // Test para deleteMantenimientoService
  describe('deleteMantenimientoService', () => {
    it('debe devolver el mantenimiento eliminado si la eliminación es exitosa', async () => {
      // Simulamos que el repositorio devuelve el mantenimiento eliminado
      const deletedMantenimiento = { id: 1, tipo: 'Reparación', estado: 'Completado' };
      (deleteMantenimientoRepository as jest.Mock).mockResolvedValue(deletedMantenimiento);

      const result = await deleteMantenimientoService(1);

      expect(result).toEqual(deletedMantenimiento);
    });

    it('debe devolver un error si la eliminación falla', async () => {
      // Simulamos que no se puede eliminar el mantenimiento
      (deleteMantenimientoRepository as jest.Mock).mockResolvedValue(null);

      const result = await deleteMantenimientoService(1);

      expect(result).toEqual({ error: 'No se pudo eliminar el mantenimiento' });
    });
  });

});
