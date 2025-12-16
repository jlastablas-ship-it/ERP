// Enums
export enum AccountClassification {
  ACTIVO = 'Activo',
  PASIVO = 'Pasivo',
  CAPITAL = 'Capital',
  INGRESOS = 'Ingresos',
  COSTES = 'Costes'
}

export enum SupplierClassification {
  SUBCONTRATISTA = 'Subcontratista',
  MATERIALES = 'Materiales',
  SERVICIOS_GENERALES = 'Servicios Generales',
  INGENIERIA = 'Ingenieria',
  OTRO = 'Otro'
}

export enum CenterType {
  CENTRAL = 'Central',
  DELEGACION = 'Delegacion',
  CENTRO_ASOCIADO = 'Centro_Asociado',
  OTRO_CENTRO = 'Otro_centro'
}

// Database Entities
export interface Account {
  id?: number;
  cuenta: string; // 4 digits
  subcuenta: string; // 4 digits
  descripcion: string;
  codigoExterno?: string;
  clasificacion: AccountClassification;
  timestamp: string;
}

export interface JournalEntryLine {
  accountId: number; // Reference to Account.id
  accountLabel: string; // Snapshot for display
  descripcion: string;
  valor: number;
}

export interface JournalEntry {
  id?: number;
  timestamp: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
}

export interface Supplier {
  id?: number;
  numeroProveedor: string; // 4 digits
  nombreProveedor: string;
  direccionProveedor?: string;
  codigoExterno?: string;
  clasificacion: SupplierClassification;
  timestamp: string;
}

export interface Invoice {
  id?: number;
  supplierId: number;
  supplierName: string; // Snapshot
  numeroFactura: string;
  fechaFactura: string;
  descripcion?: string;
  valor: number;
  timestamp: string;
}

export interface CompanyCenter {
  id?: number;
  name: string;
  type: CenterType;
  parentId?: number; // References another CompanyCenter.id
  timestamp: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  roleId?: number;
  timestamp: string;
}

export interface Role {
  id?: number;
  name: string;
  permissions: string[]; // List of allowed modules/sections
  timestamp: string;
}

// UI Types
export type Section = 'Estructura' | 'Usuarios' | 'Seguridad';
export type ModuleType = 'Contabilidad' | 'Finanzas' | 'Distribucion' | 'Compras' | 'Integracion';
export type SubDivision = 'Maestro' | 'Procesos' | 'Transacciones' | 'Listados' | 'Informes';
