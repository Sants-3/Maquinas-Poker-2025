import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { User } from '../entity/User';
import { Ubicacion } from '../entity/Ubicacion';
import { Transaccion } from '../entity/Transaccion';
import { TipoTransaccion } from '../entity/TipoTransaccion';

import { Repuesto } from '../entity/Repuesto';
import { Proveedor } from '../entity/Proveedor';
import { OrdenTrabajo } from '../entity/OrdenesTrabajo';
import { Maquina } from '../entity/Maquina';
import { Mantenimiento } from '../entity/Mantenimiento';
import { Inventario } from '../entity/Inventario';
import { Finanza } from '../entity/Finanza';
import { EvidenciaMantenimiento } from '../entity/EvidenciaMantenimiento';
import { ReporteCliente } from '../entity/ReporteCliente';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_SERVER || 'localhost',
  port: 1433,
  username: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_DATABASE || 'gestion_maquinas_poker',
  // Directorio donde TypeORM mapeará las entidades
  entities: [User, Ubicacion, Transaccion, TipoTransaccion, Repuesto, Proveedor, OrdenTrabajo,
    Maquina, Mantenimiento, Inventario, Finanza, EvidenciaMantenimiento, ReporteCliente
  ],
  synchronize: false, // Sincronización deshabilitada para producción
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'], // Habilitar logging solo en desarrollo
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
});

export const getDataSource = async () => {
  if (!AppDataSource.isInitialized) {
    try{
        await AppDataSource.initialize();
        console.log('AppDataSource inicializado exitosamente');
    } catch (error) {
        console.error('Error inicializando TypeORM DataSource:', error);
        throw error;
    }
  }
  return AppDataSource;
}
