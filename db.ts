import Dexie, { Table } from 'dexie';
import { Account, JournalEntry, Supplier, Invoice, CompanyCenter, User, Role } from './types';

export class ERPDatabase extends Dexie {
  accounts!: Table<Account>;
  journalEntries!: Table<JournalEntry>;
  suppliers!: Table<Supplier>;
  invoices!: Table<Invoice>;
  centers!: Table<CompanyCenter>;
  users!: Table<User>;
  roles!: Table<Role>;

  constructor() {
    // Read database name from localStorage or default to 'MicroERP_DB'
    const dbName = localStorage.getItem('microerp_db_name') || 'MicroERP_DB';
    super(dbName);
    
    (this as any).version(1).stores({
      accounts: '++id, cuenta, subcuenta, clasificacion, timestamp',
      journalEntries: '++id, timestamp',
      suppliers: '++id, numeroProveedor, nombreProveedor, clasificacion, timestamp',
      invoices: '++id, supplierId, numeroFactura, fechaFactura, timestamp',
      centers: '++id, name, type, parentId, timestamp',
      users: '++id, username, email, roleId, timestamp',
      roles: '++id, name, timestamp'
    });
  }
}

export const db = new ERPDatabase();

// Pre-populate some data for demonstration if empty
(db as any).on('populate', () => {
  db.accounts.bulkAdd([
    { cuenta: '5700', subcuenta: '0001', descripcion: 'Caja General', clasificacion: 'Activo' as any, timestamp: new Date().toISOString() },
    { cuenta: '4300', subcuenta: '0000', descripcion: 'Clientes', clasificacion: 'Activo' as any, timestamp: new Date().toISOString() },
    { cuenta: '7000', subcuenta: '0000', descripcion: 'Venta de Mercaderías', clasificacion: 'Ingresos' as any, timestamp: new Date().toISOString() },
  ]);
  
  db.suppliers.bulkAdd([
    { numeroProveedor: '1000', nombreProveedor: 'Proveedor Tech SL', direccionProveedor: 'Calle Falsa 123', clasificacion: 'Materiales' as any, timestamp: new Date().toISOString() }
  ]);

  db.roles.add({
    name: 'Administrador',
    permissions: ['*'],
    timestamp: new Date().toISOString()
  });

  db.centers.add({
    name: 'Sede Central',
    type: 'Central',
    timestamp: new Date().toISOString()
  });
});
