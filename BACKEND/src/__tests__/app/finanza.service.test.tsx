import { FinanzaService } from '@/services/finanza.service';
import { FinanzaRepository } from '@/repositories/finanza.repository';
import { FinanzaDTO } from '@/intrerface/finanza_input';

// Mockear las funciones de FinanzaRepository
jest.mock('@/repositories/finanza.repository');
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

describe('FinanzaService', () => {

  // Test para getFinanzas
  describe('getFinanzas', () => {
    it('debe devolver todas las finanzas', async () => {
      const mockFinanzas = [
        { id: 1, tipo_movimiento: 'Ingreso', monto: 100, moneda: 'USD', descripcion: 'Pago cliente', fecha_movimiento: new Date() },
        { id: 2, tipo_movimiento: 'Egreso', monto: 50, moneda: 'USD', descripcion: 'Pago proveedor', fecha_movimiento: new Date() },
      ];
      (FinanzaRepository.findAll as jest.Mock).mockResolvedValue(mockFinanzas);

      const result = await FinanzaService.getFinanzas();

      expect(result).toEqual(mockFinanzas);
      expect(FinanzaRepository.findAll).toHaveBeenCalled();
    });
  });

  // Test para createFinanza
  describe('createFinanza', () => {
    it('debe crear una nueva finanza', async () => {
      const mockFinanza = { id: 1, tipo_movimiento: 'Ingreso', monto: 100, moneda: 'USD', descripcion: 'Pago cliente', fecha_movimiento: new Date() };
      
      // Simulamos la creación de una nueva finanza
      (FinanzaRepository.create as jest.Mock).mockResolvedValue(mockFinanza);

      const data: FinanzaDTO = {
        tipo_movimiento: 'Ingreso',
        descripcion: 'Pago cliente',
        monto: 100,
        moneda: 'USD',
        fecha_movimiento: new Date().toISOString(),
        maquina_id: 1,
        usuario_id: 1,
        transaccion_id: 1,
        proveedor_id: 1,
        orden_trabajo_id: 1,
        referencia_externa: 'ref123',
        notas: 'Pago realizado correctamente',
      };

      const result = await FinanzaService.createFinanza(data);

      expect(result).toEqual(mockFinanza);
      expect(FinanzaRepository.create).toHaveBeenCalledWith(expect.objectContaining({ tipo_movimiento: 'Ingreso', monto: 100 }));
    });

    it('debe lanzar un error si algún campo requerido falta', async () => {
      const data: FinanzaDTO = {
        tipo_movimiento: 'Ingreso',
        descripcion: '',
        monto: 100,
        moneda: 'HNL',
        fecha_movimiento: new Date().toISOString(),
        maquina_id: 1,
        usuario_id: 1,
        transaccion_id: 1,
        proveedor_id: 1,
        orden_trabajo_id: 1,
        referencia_externa: 'ref123',
        notas: 'Pago realizado correctamente',
      };

      // Simulamos que falta algún dato necesario
      (FinanzaRepository.create as jest.Mock).mockResolvedValue(null);

      await expect(FinanzaService.createFinanza(data)).rejects.toThrow();
    });
  });

  // Test para updateFinanza
  describe('updateFinanza', () => {
    it('debe actualizar una finanza existente', async () => {
      const mockFinanza = { id: 1, tipo_movimiento: 'Ingreso', monto: 100, moneda: 'USD', descripcion: 'Pago cliente', fecha_movimiento: new Date(), notas: 'Pago realizado correctamente' };

      // Simulamos que la finanza existe
      (FinanzaRepository.findById as jest.Mock).mockResolvedValue(mockFinanza);
      (FinanzaRepository.update as jest.Mock).mockResolvedValue(mockFinanza);

      const data = { id: 1, monto: 120, descripcion: 'Pago cliente actualizado' };

      const result = await FinanzaService.updateFinanza(data);

      expect(result).toEqual(mockFinanza);
      expect(FinanzaRepository.update).toHaveBeenCalledWith(expect.objectContaining({ monto: 120 }));
    });

    it('debe lanzar un error si la finanza no se encuentra', async () => {
      // Simulamos que la finanza no existe
      (FinanzaRepository.findById as jest.Mock).mockResolvedValue(null);

      const data = { id: 999, monto: 120, descripcion: 'Pago cliente actualizado' };

      await expect(FinanzaService.updateFinanza(data)).rejects.toThrow('Registro financiero no encontrado');
    });
  });

});
