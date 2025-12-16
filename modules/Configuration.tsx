import React, { useState, useEffect } from 'react';
import Dexie from 'dexie';
import { Database, Trash2, CheckCircle, RefreshCcw, Save } from 'lucide-react';
import { db } from '../db';

export const DbConfig: React.FC = () => {
  const [dbInfo, setDbInfo] = useState<{name: string, tables: {name: string, count: number}[], version: number} | null>(null);
  const [activeDbName, setActiveDbName] = useState(localStorage.getItem('microerp_db_name') || 'MicroERP_DB');

  const fetchDbInfo = async () => {
    const dbInstance = db as any;
    const tableInfo = await Promise.all(
      dbInstance.tables.map(async (table: any) => {
        const count = await table.count();
        return { name: table.name, count };
      })
    );
    setDbInfo({
      name: dbInstance.name,
      version: dbInstance.verno,
      tables: tableInfo
    });
  };

  useEffect(() => {
    fetchDbInfo();
  }, []);

  const handleReset = async () => {
    if(confirm("¿Estás seguro de querer borrar todos los datos de la base de datos actual? Esta acción no se puede deshacer.")) {
        await (db as any).delete();
        window.location.reload();
    }
  };

  const handleChangeDb = () => {
    if (activeDbName !== dbInfo?.name) {
        if(confirm(`La aplicación se recargará para cambiar a la base de datos "${activeDbName}". ¿Continuar?`)) {
            localStorage.setItem('microerp_db_name', activeDbName);
            window.location.reload();
        }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <Database className="text-blue-600" />
        Configuración de Base de Datos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active DB Card */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-700">Base de Datos Activa</h3>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <CheckCircle size={14} /> Conectado (Dexie.js / IndexedDB)
              </p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-mono">
              {dbInfo?.name} v{dbInfo?.version}
            </div>
          </div>

          <div className="mb-6">
             <label className="block text-sm font-medium text-slate-700 mb-1">Seleccionar / Crear DB</label>
             <div className="flex gap-2">
                 <input 
                    type="text" 
                    className="flex-1 rounded-md border-slate-300 shadow-sm border p-2 text-sm"
                    value={activeDbName}
                    onChange={(e) => setActiveDbName(e.target.value)}
                    placeholder="Nombre Base de Datos"
                 />
                 <button 
                    onClick={handleChangeDb}
                    disabled={activeDbName === dbInfo?.name}
                    className={`px-4 py-2 rounded text-white text-sm font-medium transition
                        ${activeDbName === dbInfo?.name ? 'bg-slate-300 cursor-default' : 'bg-blue-600 hover:bg-blue-700 shadow-sm'}
                    `}
                 >
                    <Save size={16} />
                 </button>
             </div>
             <p className="text-xs text-slate-500 mt-1">Cambiar el nombre creará una nueva DB aislada.</p>
          </div>

          <div className="space-y-3 mt-6">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Tablas y Registros</h4>
            <ul className="divide-y divide-slate-100">
              {dbInfo?.tables.map(t => (
                <li key={t.name} className="py-2 flex justify-between text-sm">
                  <span className="capitalize text-slate-700">{t.name}</span>
                  <span className="bg-slate-100 px-2 rounded text-slate-600 font-medium">{t.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
            <button onClick={fetchDbInfo} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition">
              <RefreshCcw size={16} /> Refrescar
            </button>
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 hover:text-red-700 transition ml-auto border border-red-200">
              <Trash2 size={16} /> Resetear DB
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 text-slate-600">
            <h3 className="font-semibold text-slate-800 mb-3">Información Técnica</h3>
            <p className="text-sm mb-4">
                Esta aplicación utiliza <strong>IndexedDB</strong> en el navegador para almacenar todos los datos localmente sin necesidad de un servidor backend.
            </p>
            <p className="text-sm mb-4">
                La librería <strong>Dexie.js</strong> se utiliza como un wrapper para simplificar las operaciones asíncronas de la base de datos.
            </p>
            <div className="p-4 bg-white rounded border border-slate-200 text-xs font-mono overflow-x-auto">
                <p className="text-slate-400 mb-1">// Ejemplo de inicialización</p>
                <p>const db = new Dexie('MicroERP_DB');</p>
                <p>db.version(1).stores(&#123;</p>
                <p className="pl-4">accounts: '++id, cuenta...',</p>
                <p className="pl-4">suppliers: '++id, numero...',</p>
                <p className="pl-4">centers: '++id, name, type...'</p>
                <p>&#125;);</p>
            </div>
        </div>
      </div>
    </div>
  );
};
