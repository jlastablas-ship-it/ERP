import React, { useState, useEffect } from 'react';
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
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-blue-200 transform rotate-3">
            <Database size={40} />
        </div>
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Motor de Datos de Persistencia</h2>
        <p className="text-slate-500 max-w-lg mt-2 font-medium">Gestione los núcleos de almacenamiento IndexedDB locales del navegador.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Active DB Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-10 flex flex-col h-full relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
             <Database size={120} />
          </div>
          
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200"></span>
                <h3 className="text-xl font-black text-slate-800">Núcleo Activo</h3>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Dexie.js / IndexedDB Wrapper</p>
          </div>

          <div className="space-y-6 flex-1">
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Conmutador de Base de Datos</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        className="flex-1 bg-white px-5 py-4 rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition font-bold text-slate-800 shadow-inner"
                        value={activeDbName}
                        onChange={(e) => setActiveDbName(e.target.value)}
                        placeholder="Nombre DB..."
                    />
                    <button 
                        onClick={handleChangeDb}
                        disabled={activeDbName === dbInfo?.name}
                        className={`p-5 rounded-xl text-white transition-all shadow-xl active:scale-95
                            ${activeDbName === dbInfo?.name ? 'bg-slate-200 text-slate-400 cursor-default shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}
                        `}
                    >
                        <Save size={24} />
                    </button>
                </div>
                <p className="text-[9px] text-slate-400 font-medium mt-3 leading-relaxed">
                    Al cambiar el nombre, el sistema inicializará un nuevo contexto de datos vacío o conmutará a uno existente.
                </p>
             </div>

             <div className="pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Esquema y Estadísticas</h4>
                <div className="space-y-2">
                    {dbInfo?.tables.map(t => (
                        <div key={t.name} className="flex justify-between items-center px-4 py-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                            <span className="capitalize font-black text-xs text-slate-600 tracking-tight">{t.name}</span>
                            <span className="bg-white px-3 py-1 rounded-full text-blue-600 text-[10px] font-black border border-slate-200 shadow-sm">{t.count} rec.</span>
                        </div>
                    ))}
                </div>
             </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-4">
            <button onClick={fetchDbInfo} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition font-black text-xs uppercase tracking-widest border border-slate-200">
              <RefreshCcw size={16} /> Refrescar Info
            </button>
            <button onClick={handleReset} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-black text-xs uppercase tracking-widest border border-red-100">
              <Trash2 size={16} /> Purgar Datos
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="flex flex-col gap-10">
            <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <CheckCircle size={100} />
                </div>
                <h3 className="text-2xl font-black mb-6 tracking-tighter">Stack Tecnológico</h3>
                <ul className="space-y-4 text-slate-400 font-medium">
                    <li className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-blue-500 mt-1 flex-shrink-0" />
                        <span><strong className="text-white">IndexedDB:</strong> Estándar de W3C para almacenamiento de grandes cantidades de datos estructurados en cliente.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-blue-500 mt-1 flex-shrink-0" />
                        <span><strong className="text-white">Dexie.js:</strong> Wrapper minimalista que resuelve la verbosidad de la API nativa y añade tipado robusto.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-blue-500 mt-1 flex-shrink-0" />
                        <span><strong className="text-white">No-Cloud Architecture:</strong> Privacidad total. Sus datos financieros nunca abandonan su dispositivo.</span>
                    </li>
                </ul>
            </div>
            
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-xl">
                <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest text-center">Definición de Esquema</h3>
                <div className="bg-slate-900 p-6 rounded-2xl text-[10px] font-mono leading-relaxed text-blue-300 overflow-x-auto shadow-inner">
                    <p className="text-slate-500 mb-2">// Declaración de Tablas (v1)</p>
                    <p className="text-blue-400">db.version(1).stores(&#123;</p>
                    <p className="pl-6 text-indigo-400">accounts: '++id, cuenta, subcuenta...',</p>
                    <p className="pl-6 text-indigo-400">journalEntries: '++id, timestamp',</p>
                    <p className="pl-6 text-indigo-400">suppliers: '++id, numeroProveedor...',</p>
                    <p className="pl-6 text-indigo-400">centers: '++id, name, type...'</p>
                    <p className="text-blue-400">&#125;);</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};