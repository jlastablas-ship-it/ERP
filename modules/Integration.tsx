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
      link.download = `MicroERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage({ type: 'success', text: 'Datos exportados correctamente.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al exportar datos.' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- IMPORT FUNCTIONALITY ---
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("ADVERTENCIA: Esta acción combinará/sobrescribirá los datos existentes con los del archivo. ¿Desea continuar?")) {
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

        setMessage({ type: 'success', text: 'Datos importados correctamente. La base de datos ha sido actualizada.' });
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Error al importar. Verifique que el archivo sea un backup válido de MicroERP.' });
      } finally {
        setIsLoading(false);
        event.target.value = ''; // Reset input
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Network size={32} className="text-blue-600" />
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Módulo de Integración</h2>
            <p className="text-slate-500">Importación y Exportación de Datos</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* EXPORT CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <Download size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Exportar Datos</h3>
            <p className="text-slate-500 mb-6 text-sm">
                Descargue una copia completa de la base de datos actual en formato JSON. Útil para copias de seguridad o migración.
            </p>
            <button 
                onClick={handleExport}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isLoading ? <Loader className="animate-spin" size={20}/> : <Download size={20} />}
                Generar Backup
            </button>
        </div>

        {/* IMPORT CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-4">
                <Upload size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Importar Datos</h3>
            <p className="text-slate-500 mb-6 text-sm">
                Restaure una copia de seguridad o importe datos externos. Los registros existentes con el mismo ID serán actualizados.
            </p>
            <label 
                className={`w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2 cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                {isLoading ? <Loader className="animate-spin" size={20}/> : <Upload size={20} />}
                <span>Seleccionar Archivo JSON</span>
                <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={isLoading} />
            </label>
        </div>
      </div>

      <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-500">
        <h4 className="font-bold text-slate-700 mb-2">Nota Técnica:</h4>
        <ul className="list-disc list-inside space-y-1">
            <li>El formato de archivo esperado es un JSON con claves correspondientes a los nombres de las tablas (accounts, suppliers, invoices, etc.).</li>
            <li>La importación utiliza un método "Upsert": si el ID existe, se actualiza; si no, se crea.</li>
            <li>Asegúrese de seleccionar la Base de Datos correcta en "Configuración" antes de importar.</li>
        </ul>
      </div>
    </div>
  );
};
