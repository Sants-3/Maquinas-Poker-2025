import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db;

if (typeof window === 'undefined') {
  const dbDir = path.join(process.cwd(), 'database');
  const dbPath = path.join(dbDir, 'poker.db');

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath, { 
    verbose: process.env.NODE_ENV === 'development' ? console.log : null 
  });

  const initializeDatabase = () => {
    try {
      db.pragma('journal_mode = WAL');
      
      // Tablas principales
      db.exec(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'tecnico', 'cliente')),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS poker_machines (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          model TEXT NOT NULL,
          serial_number TEXT UNIQUE NOT NULL,
          location TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Operativa' CHECK(status IN ('Operativa', 'En mantenimiento', 'Fuera de servicio')),
          last_maintenance TEXT,
          client_id INTEGER NOT NULL,
          hourly_rate REAL DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS machine_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          machine_id TEXT NOT NULL,
          client_id INTEGER NOT NULL,
          description TEXT NOT NULL,
          status TEXT DEFAULT 'Reportada' CHECK(status IN ('Reportada', 'En revisión', 'Reparada', 'Rechazada')),
          severity TEXT DEFAULT 'Media' CHECK(severity IN ('Baja', 'Media', 'Alta', 'Crítica')),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          work_order_id INTEGER,
          FOREIGN KEY (machine_id) REFERENCES poker_machines(id) ON DELETE CASCADE,
          FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS work_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          machine_id TEXT NOT NULL,
          client_id INTEGER NOT NULL,
          technician_id INTEGER NOT NULL,
          report_id INTEGER,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Pendiente' CHECK(status IN ('Pendiente', 'Asignada', 'En progreso', 'Completada', 'Cancelada')),
          priority TEXT NOT NULL DEFAULT 'Media' CHECK(priority IN ('Baja', 'Media', 'Alta', 'Urgente')),
          scheduled_date TEXT,
          start_date TEXT,
          end_date TEXT,
          solution TEXT,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (machine_id) REFERENCES poker_machines(id) ON DELETE CASCADE,
          FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (report_id) REFERENCES machine_reports(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS technician_activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          work_order_id INTEGER NOT NULL,
          technician_id INTEGER NOT NULL,
          activity_type TEXT NOT NULL CHECK(activity_type IN ('Diagnóstico', 'Reparación', 'Mantenimiento', 'Reemplazo', 'Inspección', 'Otro')),
          description TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          duration_minutes INTEGER NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
          FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS used_parts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          work_order_id INTEGER NOT NULL,
          part_name TEXT NOT NULL,
          part_code TEXT,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price REAL NOT NULL,
          supplier_info TEXT,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS machine_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          model TEXT NOT NULL,
          location TEXT NOT NULL,
          reason TEXT NOT NULL,
          status TEXT DEFAULT 'Pendiente' CHECK(status IN ('Pendiente', 'Aprobada', 'Rechazada', 'Completada')),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS financial_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          machine_id TEXT NOT NULL,
          client_id INTEGER NOT NULL,
          session_start TEXT NOT NULL,
          session_end TEXT NOT NULL,
          hours_worked REAL NOT NULL,
          earnings REAL NOT NULL,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (machine_id) REFERENCES poker_machines(id) ON DELETE CASCADE,
          FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Triggers
      db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_machine_timestamp
        AFTER UPDATE ON poker_machines
        FOR EACH ROW
        BEGIN
          UPDATE poker_machines SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;

        CREATE TRIGGER IF NOT EXISTS update_work_order_timestamp
        AFTER UPDATE ON work_orders
        FOR EACH ROW
        BEGIN
          UPDATE work_orders SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
      `);

      // Índices
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_machines_client ON poker_machines(client_id);
        CREATE INDEX IF NOT EXISTS idx_machines_status ON poker_machines(status);
        CREATE INDEX IF NOT EXISTS idx_reports_machine ON machine_reports(machine_id);
        CREATE INDEX IF NOT EXISTS idx_reports_client ON machine_reports(client_id);
        CREATE INDEX IF NOT EXISTS idx_financial_machine ON financial_records(machine_id);
        CREATE INDEX IF NOT EXISTS idx_financial_client ON financial_records(client_id);
        CREATE INDEX IF NOT EXISTS idx_work_orders_technician ON work_orders(technician_id);
        CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
        CREATE INDEX IF NOT EXISTS idx_work_orders_machine ON work_orders(machine_id);
        CREATE INDEX IF NOT EXISTS idx_activities_work_order ON technician_activities(work_order_id);
        CREATE INDEX IF NOT EXISTS idx_parts_work_order ON used_parts(work_order_id);
      `);

      // Insertar datos iniciales
      const insertInitialData = () => {
        try {
          // Usuarios
          const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
          if (userCount === 0) {
            const users = [
              { name: 'Admin Principal', email: 'admin@casino.com', password: 'admin123', role: 'admin' },
              { name: 'Técnico Juan Pérez', email: 'juan@casino.com', password: 'tecnico123', role: 'tecnico' },
              { name: 'Técnico María Gómez', email: 'maria@casino.com', password: 'tecnico456', role: 'tecnico' },
              { name: 'Casino Las Vegas', email: 'contacto@vegas.com', password: 'casino123', role: 'cliente' },
              { name: 'Casino Bellagio', email: 'contacto@bellagio.com', password: 'casino456', role: 'cliente' }
            ];

            const insertUser = db.prepare(`
              INSERT INTO users (name, email, password, role)
              VALUES (@name, @email, @password, @role)
            `);

            db.transaction(() => {
              users.forEach(user => insertUser.run(user));
            })();
          }

          // Máquinas de poker
          const machineCount = db.prepare("SELECT COUNT(*) as count FROM poker_machines").get().count;
          if (machineCount === 0) {
            const machines = [
              { id: 'POKER-001', name: 'Texas Holdem', model: 'IGT Game King', serial_number: 'GK-001', location: 'Sala Principal', status: 'Operativa', last_maintenance: '2023-11-15', client_id: 4, hourly_rate: 150.00 },
              { id: 'POKER-002', name: 'Omaha Poker', model: 'Bally Pro Wave', serial_number: 'PW-002', location: 'Sala VIP', status: 'Operativa', last_maintenance: '2023-11-10', client_id: 4, hourly_rate: 180.00 },
              { id: 'POKER-003', name: '7-Card Stud', model: 'Aristocrat MK6', serial_number: 'MK6-003', location: 'Sala Secundaria', status: 'En mantenimiento', last_maintenance: '2023-10-28', client_id: 4, hourly_rate: 120.00 },
              { id: 'POKER-004', name: 'Caribbean Stud', model: 'IGT S2000', serial_number: 'S2K-004', location: 'Sala Principal', status: 'Operativa', last_maintenance: '2023-11-05', client_id: 5, hourly_rate: 200.00 }
            ];

            const insertMachine = db.prepare(`
              INSERT INTO poker_machines 
              (id, name, model, serial_number, location, status, last_maintenance, client_id, hourly_rate)
              VALUES (@id, @name, @model, @serial_number, @location, @status, @last_maintenance, @client_id, @hourly_rate)
            `);

            db.transaction(() => {
              machines.forEach(machine => insertMachine.run(machine));
            })();
          }

          // Reportes de máquinas
          const reportCount = db.prepare("SELECT COUNT(*) as count FROM machine_reports").get().count;
          if (reportCount === 0) {
            const reports = [
              { machine_id: 'POKER-003', client_id: 4, description: 'Pantalla con líneas verticales', severity: 'Alta' },
              { machine_id: 'POKER-001', client_id: 4, description: 'Problema con el dispensador de billetes', severity: 'Media' }
            ];

            const insertReport = db.prepare(`
              INSERT INTO machine_reports 
              (machine_id, client_id, description, severity)
              VALUES (@machine_id, @client_id, @description, @severity)
            `);

            db.transaction(() => {
              reports.forEach(report => insertReport.run(report));
            })();
          }

          // Órdenes de trabajo
          const orderCount = db.prepare("SELECT COUNT(*) as count FROM work_orders").get().count;
          if (orderCount === 0) {
            const orders = [
              { machine_id: 'POKER-003', client_id: 4, technician_id: 2, report_id: 1, title: 'Reparación de pantalla', description: 'La pantalla muestra líneas verticales y necesita reemplazo', status: 'Asignada', priority: 'Alta', scheduled_date: '2023-12-05 10:00:00' },
              { machine_id: 'POKER-001', client_id: 4, technician_id: 2, report_id: 2, title: 'Reparación dispensador', description: 'El dispensador de billetes no funciona correctamente', status: 'Pendiente', priority: 'Media', scheduled_date: '2023-12-06 11:00:00' },
              { machine_id: 'POKER-002', client_id: 4, technician_id: 3, report_id: null, title: 'Mantenimiento preventivo', description: 'Revisión general y limpieza según programa', status: 'Pendiente', priority: 'Baja', scheduled_date: '2023-12-07 09:00:00' }
            ];

            const insertOrder = db.prepare(`
              INSERT INTO work_orders 
              (machine_id, client_id, technician_id, report_id, title, description, status, priority, scheduled_date)
              VALUES (@machine_id, @client_id, @technician_id, @report_id, @title, @description, @status, @priority, @scheduled_date)
            `);

            db.transaction(() => {
              orders.forEach(order => insertOrder.run(order));
            })();
          }

          // Actividades de técnicos
          const activityCount = db.prepare("SELECT COUNT(*) as count FROM technician_activities").get().count;
          if (activityCount === 0) {
            const activities = [
              { work_order_id: 1, technician_id: 2, activity_type: 'Diagnóstico', description: 'Diagnóstico inicial de la pantalla', start_time: '2023-12-05 10:15:00', end_time: '2023-12-05 10:45:00', duration_minutes: 30 },
              { work_order_id: 1, technician_id: 2, activity_type: 'Reemplazo', description: 'Reemplazo de la pantalla LCD', start_time: '2023-12-05 11:00:00', end_time: '2023-12-05 12:30:00', duration_minutes: 90 }
            ];

            const insertActivity = db.prepare(`
              INSERT INTO technician_activities 
              (work_order_id, technician_id, activity_type, description, start_time, end_time, duration_minutes)
              VALUES (@work_order_id, @technician_id, @activity_type, @description, @start_time, @end_time, @duration_minutes)
            `);

            db.transaction(() => {
              activities.forEach(activity => insertActivity.run(activity));
            })();
          }

          // Repuestos utilizados
          const partCount = db.prepare("SELECT COUNT(*) as count FROM used_parts").get().count;
          if (partCount === 0) {
            const parts = [
              { work_order_id: 1, part_name: 'Pantalla LCD', part_code: 'LCD-IGT-2023', quantity: 1, unit_price: 250.00, supplier_info: 'Proveedor Electrónico SA' }
            ];

            const insertPart = db.prepare(`
              INSERT INTO used_parts 
              (work_order_id, part_name, part_code, quantity, unit_price, supplier_info)
              VALUES (@work_order_id, @part_name, @part_code, @quantity, @unit_price, @supplier_info)
            `);

            db.transaction(() => {
              parts.forEach(part => insertPart.run(part));
            })();
          }

        } catch (error) {
          console.error('Error inserting initial data:', error);
        }
      };

      insertInitialData();

    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  };

  try {
    initializeDatabase();
  } catch (error) {
    console.error('Critical database initialization error:', error);
    process.exit(1);
  }
} else {
  db = {
    prepare: () => {
      throw new Error('Database operations are not available on the client side');
    }
  };
}

// ==============================================
// Funciones para gestión de usuarios
// ==============================================

export const getUserById = (id) => {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
};

export const getUserByEmail = (email) => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

export const createUser = (userData) => {
  return db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `).run(userData.name, userData.email, userData.password, userData.role || 'cliente');
};

export const getAllTechnicians = () => {
  return db.prepare('SELECT * FROM users WHERE role = "tecnico" ORDER BY name').all();
};

// ==============================================
// Funciones para máquinas de poker
// ==============================================

export const getClientMachines = (clientId) => {
  return db.prepare(`
    SELECT id, name, model, status, location, hourly_rate 
    FROM poker_machines 
    WHERE client_id = ?
    ORDER BY status, name
  `).all(clientId);
};

export const getMachineById = (machineId, clientId = null) => {
  if (clientId) {
    return db.prepare(`
      SELECT * FROM poker_machines 
      WHERE id = ? AND client_id = ?
    `).get(machineId, clientId);
  }
  return db.prepare('SELECT * FROM poker_machines WHERE id = ?').get(machineId);
};

export const updateMachineStatus = (machineId, status) => {
  return db.prepare(`
    UPDATE poker_machines 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(status, machineId);
};

export const getAllMachines = () => {
  return db.prepare(`
    SELECT m.*, u.name as client_name, u.email as client_email
    FROM poker_machines m
    JOIN users u ON m.client_id = u.id
    ORDER BY m.client_id, m.status
  `).all();
};

// ==============================================
// Funciones para reportes de máquinas
// ==============================================

export const createMachineReport = (machineId, clientId, description, severity = 'Media') => {
  return db.prepare(`
    INSERT INTO machine_reports 
    (machine_id, client_id, description, severity)
    VALUES (?, ?, ?, ?)
  `).run(machineId, clientId, description, severity);
};

export const getMachineReports = (clientId) => {
  return db.prepare(`
    SELECT r.*, m.name as machine_name 
    FROM machine_reports r
    JOIN poker_machines m ON r.machine_id = m.id
    WHERE r.client_id = ?
    ORDER BY r.created_at DESC
  `).all(clientId);
};

export const getAllReports = () => {
  return db.prepare(`
    SELECT r.*, m.name as machine_name, u.name as client_name
    FROM machine_reports r
    JOIN poker_machines m ON r.machine_id = m.id
    JOIN users u ON r.client_id = u.id
    ORDER BY r.created_at DESC
  `).all();
};

export const updateReportStatus = (reportId, status) => {
  return db.prepare(`
    UPDATE machine_reports 
    SET status = ? 
    WHERE id = ?
  `).run(status, reportId);
};

// ==============================================
// Funciones para órdenes de trabajo
// ==============================================

export const createWorkOrder = (orderData) => {
  const stmt = db.prepare(`
    INSERT INTO work_orders (
      machine_id, client_id, technician_id, report_id, title, description,
      status, priority, scheduled_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    orderData.machine_id,
    orderData.client_id,
    orderData.technician_id,
    orderData.report_id || null,
    orderData.title,
    orderData.description,
    orderData.status || 'Pendiente',
    orderData.priority || 'Media',
    orderData.scheduled_date || null
  );
  
  return { success: true, id: result.lastInsertRowid };
};
export const getTechnicianOrders = (technicianId, status = null) => {
  try {
    let query = `
      SELECT wo.*, 
             pm.name as machine_name, 
             pm.model as machine_model,
             pm.location as machine_location,
             u.name as client_name,
             u.email as client_email,
             mr.description as report_description
      FROM work_orders wo
      JOIN poker_machines pm ON wo.machine_id = pm.id
      JOIN users u ON wo.client_id = u.id
      LEFT JOIN machine_reports mr ON wo.report_id = mr.id
      WHERE wo.technician_id = ?
    `;
    
    const params = [technicianId];
    
    if (status) {
      query += ' AND wo.status = ?';
      params.push(status);
    }
    
    query += ` ORDER BY 
      CASE wo.priority
        WHEN 'Urgente' THEN 1
        WHEN 'Alta' THEN 2
        WHEN 'Media' THEN 3
        ELSE 4
      END, 
      wo.scheduled_date ASC, 
      wo.created_at DESC`;
    
    return db.prepare(query).all(...params);
  } catch (error) {
    console.error('Error getting technician orders:', error);
    return [];
  }
};

export const getWorkOrderDetails = (orderId, technicianId = null) => {
  let query = `
    SELECT wo.*, 
           pm.name as machine_name, 
           pm.model as machine_model,
           pm.serial_number as machine_serial,
           pm.location as machine_location,
           u.name as client_name,
           t.name as technician_name,
           mr.description as report_description
    FROM work_orders wo
    JOIN poker_machines pm ON wo.machine_id = pm.id
    JOIN users u ON wo.client_id = u.id
    JOIN users t ON wo.technician_id = t.id
    LEFT JOIN machine_reports mr ON wo.report_id = mr.id
    WHERE wo.id = ?
  `;
  
  const params = [orderId];
  
  if (technicianId) {
    query += ' AND wo.technician_id = ?';
    params.push(technicianId);
  }
  
  return db.prepare(query).get(...params);
};

export const updateWorkOrderStatus = (orderId, technicianId, newStatus, solution = null) => {
  let query = `
    UPDATE work_orders 
    SET status = ?, 
        updated_at = CURRENT_TIMESTAMP
  `;
  
  const params = [newStatus];
  
  if (newStatus === 'En progreso') {
    query += ', start_date = CURRENT_TIMESTAMP';
  } else if (newStatus === 'Completada') {
    query += ', end_date = CURRENT_TIMESTAMP, solution = ?';
    params.push(solution);
  }
  
  query += ' WHERE id = ? AND technician_id = ?';
  params.push(orderId, technicianId);
  
  const result = db.prepare(query).run(...params);
  
  if (result.changes === 0) {
    return { success: false, error: 'Orden no encontrada o no autorizado' };
  }
  
  return { success: true };
};

export const getAllWorkOrders = (status = null) => {
  let query = `
    SELECT wo.*, 
           pm.name as machine_name, 
           u.name as client_name,
           t.name as technician_name
    FROM work_orders wo
    JOIN poker_machines pm ON wo.machine_id = pm.id
    JOIN users u ON wo.client_id = u.id
    JOIN users t ON wo.technician_id = t.id
  `;
  
  const params = [];
  
  if (status) {
    query += ' WHERE wo.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY wo.created_at DESC';
  
  return db.prepare(query).all(...params);
};

// ==============================================
// Funciones para actividades de técnicos
// ==============================================

export const addTechnicianActivity = (activityData) => {
  return db.prepare(`
    INSERT INTO technician_activities (
      work_order_id, technician_id, activity_type, description,
      start_time, end_time, duration_minutes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    activityData.work_order_id,
    activityData.technician_id,
    activityData.activity_type,
    activityData.description,
    activityData.start_time,
    activityData.end_time,
    activityData.duration_minutes
  );
};

export const getOrderActivities = (orderId) => {
  return db.prepare(`
    SELECT ta.*, u.name as technician_name
    FROM technician_activities ta
    JOIN users u ON ta.technician_id = u.id
    WHERE ta.work_order_id = ?
    ORDER BY ta.start_time DESC
  `).all(orderId);
};

// ==============================================
// Funciones para repuestos utilizados
// ==============================================

export const addUsedPart = (partData) => {
  return db.prepare(`
    INSERT INTO used_parts (
      work_order_id, part_name, part_code, quantity, unit_price, supplier_info, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    partData.work_order_id,
    partData.part_name,
    partData.part_code || null,
    partData.quantity || 1,
    partData.unit_price,
    partData.supplier_info || null,
    partData.notes || null
  );
};

export const getOrderUsedParts = (orderId) => {
  return db.prepare(`
    SELECT * FROM used_parts
    WHERE work_order_id = ?
    ORDER BY part_name
  `).all(orderId);
};

// ==============================================
// Funciones para solicitudes de máquinas
// ==============================================

export const createMachineRequest = (clientId, name, model, location, reason) => {
  return db.prepare(`
    INSERT INTO machine_requests 
    (client_id, name, model, location, reason)
    VALUES (?, ?, ?, ?, ?)
  `).run(clientId, name, model, location, reason);
};

export const getClientRequests = (clientId) => {
  return db.prepare(`
    SELECT * FROM machine_requests 
    WHERE client_id = ?
    ORDER BY created_at DESC
  `).all(clientId);
};

// ==============================================
// Funciones para registros financieros
// ==============================================

export const createFinancialRecord = (recordData) => {
  return db.prepare(`
    INSERT INTO financial_records (
      machine_id, client_id, session_start, session_end, hours_worked, earnings, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    recordData.machine_id,
    recordData.client_id,
    recordData.session_start,
    recordData.session_end,
    recordData.hours_worked,
    recordData.earnings,
    recordData.notes || null
  );
};

export const getClientFinancialRecords = (clientId) => {
  return db.prepare(`
    SELECT fr.*, pm.name as machine_name
    FROM financial_records fr
    JOIN poker_machines pm ON fr.machine_id = pm.id
    WHERE fr.client_id = ?
    ORDER BY fr.session_start DESC
  `).all(clientId);
};

export default db;