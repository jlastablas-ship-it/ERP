import React, { useState } from 'react';
import { db } from '../db';
import { Network, Download, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export const IntegrationView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // --- EXPORT FUNCTIONALITY ---
  const handleExport = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const dbInstance = db as any;
      const exportData: Record<string, any[]> = {};
      
      // Iterate over all defined tables in schema
      const tables = dbInstance.tables;
      for (const table of tables) {
        exportData[table.name] = await table.toArray();
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MicroERP_Full_Dump_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage({ type: 'success', text: 'Respaldo generado y descargado correctamente.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error crítico durante la exportación de registros.' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- IMPORT FUNCTIONALITY ---
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("ADVERTENCIA DE INTEGRIDAD: Esta acción fusionará los datos del archivo con la base de datos actual. Si existen IDs coincidentes, se sobrescribirán. ¿Desea proceder?")) {
        event.target.value = ''; // Reset input
        return;
    }

    setIsLoading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);
        const dbInstance = db as any;

        // Transaction to ensure atomicity
        await dbInstance.transaction('rw', dbInstance.tables, async () => {
            for (const tableName of Object.keys(importData)) {
                if (dbInstance[tableName]) {
                    // We use bulkPut to Upsert (Update if ID exists, Insert if not)
                    await dbInstance[tableName].bulkPut(importData[tableName]);
                }
            }
        });

        setMessage({ type: 'success', text: 'Importación finalizada. Los datos se han sincronizado con éxito.' });
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'El archivo seleccionado no cumple con el esquema JSON de MicroERP.' });
      } finally {
        setIsLoading(false);
        event.target.value = ''; // Reset input
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200">
            <Network size={32} />
        </div>
        <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pasarela de Datos</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Interoperabilidad & Backup del Sistema</p>
        </div>
      </div>

      {message && (
        <div className={`p-6 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg border-2
            ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
            <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {message.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            </div>
            <span className="font-bold text-sm tracking-tight">{message.text}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10">
        {/* EXPORT CARD */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 flex flex-col items-center text-center group hover:border-blue-200 transition-colors duration-500">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Download size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tighter">Exportar Ecosistema</h3>
            <p className="text-slate-400 mb-10 text-sm font-medium leading-relaxed px-4">
                Genere un archivo maestro en formato JSON que contiene todas las tablas, configuraciones y transacciones de su MicroERP.
            </p>
            <button 
                onClick={handleExport}
                disabled={isLoading}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-[0.97] flex items-center justify-center gap-3 disabled:opacity-50"
            >
                {isLoading ? <Loader className="animate-spin" size={24}/> : <Download size={24} />}
                <span>Iniciar Volcado JSON</span>
            </button>
        </div>

        {/* IMPORT CARD */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 flex flex-col items-center text-center group hover:border-indigo-200 transition-colors duration-500">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Upload size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tighter">Inyectar Registros</h3>
            <p className="text-slate-400 mb-10 text-sm font-medium leading-relaxed px-4">
                Cargue archivos de respaldo externos para restaurar información o migrar desde otros entornos de MicroERP compatibles.
            </p>
            <label 
                className={`w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.97] flex items-center justify-center gap-3 cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                {isLoading ? <Loader className="animate-spin" size={24}/> : <Upload size={24} />}
                <span>Seleccionar Archivo</span>
                <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={isLoading} />
            </label>
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 opacity-5 rotate-12">
            <Network size={200} />
        </div>
        <h4 className="font-black text-xs uppercase tracking-[0.3em] text-blue-400 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div> Directrices Técnicas
        </h4>
        <div className="grid md:grid-cols-2 gap-8 text-sm font-medium text-slate-400">
            <div className="space-y-4">
                <p><strong className="text-white">Formato Serializado:</strong> El motor utiliza el estándar JSON (JavaScript Object Notation) para garantizar la compatibilidad entre versiones del sistema.</p>
                <p><strong className="text-white">Lógica Upsert:</strong> La importación no borra la base de datos; fusiona registros y actualiza duplicados basados en el índice primario (ID).</p>
            </div>
            <div className="space-y-4">
                <p><strong className="text-white">Consistencia:</strong> Se recomienda purgar la base de datos activa antes de importar si desea una restauración limpia desde cero.</p>
                <p><strong className="text-white">Seguridad:</strong> El proceso se ejecuta íntegramente en local; sus datos corporativos nunca se transmiten por la red durante la integración.</p>
            </div>
        </div>
      </div>
    </div>
  );
};