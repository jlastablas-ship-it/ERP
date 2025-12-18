import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Account, AccountClassification, JournalEntry, JournalEntryLine } from '../types';
import { Trash2, Edit, Plus, Save, AlertCircle, Calculator } from 'lucide-react';

// --- Master: Accounting Plan ---
export const AccountingMaster: React.FC = () => {
  const accounts = useLiveQuery(() => db.accounts.toArray());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Account>>({
    subcuenta: '0000',
    clasificacion: AccountClassification.ACTIVO
  });

  const handleSave = async () => {
    if (!formData.cuenta || !formData.descripcion) return alert('Campos obligatorios faltantes');
    
    const accountData = {
      cuenta: formData.cuenta,
      subcuenta: formData.subcuenta || '0000',
      descripcion: formData.descripcion,
      codigoExterno: formData.codigoExterno || '',
      clasificacion: formData.clasificacion as AccountClassification,
      timestamp: new Date().toISOString()
    };

    if (formData.id) {
      await db.accounts.update(formData.id, accountData);
    } else {
      await db.accounts.add(accountData as Account);
    }
    setIsEditing(false);
    setFormData({ subcuenta: '0000', clasificacion: AccountClassification.ACTIVO });
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Borrar cuenta?')) db.accounts.delete(id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="text-blue-600" /> Plan Contable
        </h2>
        <button 
            onClick={() => { setFormData({ subcuenta: '0000', clasificacion: AccountClassification.ACTIVO }); setIsEditing(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold shadow-sm shadow-blue-200"
        >
            <Plus size={18} /> Nueva Cuenta
        </button>
      </div>

      {isEditing && (
        <div className="p-6 bg-blue-50/50 border-b border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Cuenta (4 dígitos)*</label>
              <input 
                type="text" maxLength={4} pattern="\d{4}"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={formData.cuenta || ''} onChange={e => setFormData({...formData, cuenta: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Subcuenta (4 dígitos)*</label>
              <input 
                type="text" maxLength={4} pattern="\d{4}"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={formData.subcuenta || ''} onChange={e => setFormData({...formData, subcuenta: e.target.value})}
              />
            </div>
            <div className="lg:col-span-1">
               <label className="block text-sm font-semibold text-slate-700 mb-1">Clasificación</label>
                <select 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                value={formData.clasificacion} 
                onChange={e => setFormData({...formData, clasificacion: e.target.value as any})}
                >
                {Object.values(AccountClassification).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción*</label>
              <input 
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Código Externo</label>
              <input 
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={formData.codigoExterno || ''} onChange={e => setFormData({...formData, codigoExterno: e.target.value})}
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-blue-100">
              <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cuenta</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sub</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Clasificación</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {accounts?.map(acc => (
              <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-slate-700">{acc.cuenta}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-500">{acc.subcuenta}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{acc.descripcion}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${acc.clasificacion === 'Activo' ? 'bg-green-100 text-green-700' : 
                          acc.clasificacion === 'Pasivo' ? 'bg-red-100 text-red-700' : 
                          acc.clasificacion === 'Ingresos' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}
                    `}>
                        {acc.clasificacion}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => { setFormData(acc); setIsEditing(true); }} className="text-blue-500 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition mr-1"><Edit size={18}/></button>
                  <button onClick={() => acc.id && handleDelete(acc.id)} className="text-red-400 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!accounts || accounts.length === 0) && (
            <div className="py-20 text-center text-slate-400 font-medium bg-slate-50/50 italic">
                No se han encontrado registros en el plan contable.
            </div>
        )}
      </div>
    </div>
  );
};

// --- Process: Journal Entry ---
export const AccountingProcess: React.FC = () => {
  const accounts = useLiveQuery(() => db.accounts.toArray());
  const [lines, setLines] = useState<Partial<JournalEntryLine>[] >([{}, {}]);

  const addLine = () => setLines([...lines, {}]);
  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));

  const updateLine = (idx: number, field: keyof JournalEntryLine, value: any) => {
    const newLines = [...lines];
    newLines[idx] = { ...newLines[idx], [field]: value };
    if (field === 'accountId') {
        const acc = accounts?.find(a => a.id === Number(value));
        if (acc) newLines[idx].accountLabel = `${acc.cuenta}-${acc.subcuenta} ${acc.descripcion}`;
    }
    setLines(newLines);
  };

  const totalValue = lines.reduce((sum, line) => sum + (Number(line.valor) || 0), 0);
  const isBalanced = Math.abs(totalValue) < 0.001;

  const handleSaveEntry = async () => {
    if (!isBalanced) return alert('El asiento no está cuadrado');
    if (lines.some(l => !l.accountId || !l.valor)) return alert('Complete todas las líneas requeridas');

    const entry: JournalEntry = {
        timestamp: new Date().toISOString(),
        lines: lines as JournalEntryLine[],
        totalDebit: lines.filter(l => (l.valor || 0) > 0).reduce((s, l) => s + (l.valor || 0), 0),
        totalCredit: Math.abs(lines.filter(l => (l.valor || 0) < 0).reduce((s, l) => s + (l.valor || 0), 0))
    };

    await db.journalEntries.add(entry);
    alert('Asiento grabado correctamente');
    setLines([{}, {}]);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center gap-3">
            <Calculator className="text-blue-400" />
            <h2 className="text-xl font-bold">Grabar Entrada de Asiento</h2>
        </div>

        <div className="p-6">
            <div className="mb-6 space-y-3">
                <div className="grid grid-cols-12 gap-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-5">Cuenta</div>
                    <div className="col-span-4">Descripción</div>
                    <div className="col-span-2 text-right">Valor</div>
                    <div className="col-span-1"></div>
                </div>

                {lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-2 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors">
                        <div className="col-span-5">
                            <select 
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
                                value={line.accountId || ''}
                                onChange={e => updateLine(idx, 'accountId', Number(e.target.value))}
                            >
                                <option value="">Seleccionar Cuenta...</option>
                                {accounts?.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.cuenta}-{acc.subcuenta} {acc.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-4">
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                                placeholder="Concepto..."
                                value={line.descripcion || ''}
                                onChange={e => updateLine(idx, 'descripcion', e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <input 
                                type="number" step="0.01"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-right shadow-sm font-mono font-bold"
                                placeholder="0.00"
                                value={line.valor || ''}
                                onChange={e => updateLine(idx, 'valor', Number(e.target.value))}
                            />
                        </div>
                        <div className="col-span-1 flex justify-center">
                            <button onClick={() => removeLine(idx)} className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={addLine} 
                className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:bg-blue-50 px-4 py-2 rounded-lg transition border border-transparent hover:border-blue-100"
            >
                <Plus size={18} /> Añadir Apunte
            </button>

            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border-2 transition-all duration-300 ${isBalanced ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-70">Balance Total</span>
                        <span className="text-2xl font-black font-mono leading-none">{totalValue.toFixed(2)} €</span>
                    </div>
                    {isBalanced ? (
                        <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg shadow-green-200"><Save size={20} /></div>
                    ) : (
                        <div className="animate-pulse bg-red-500 text-white p-1.5 rounded-full shadow-lg shadow-red-200"><AlertCircle size={20} /></div>
                    )}
                </div>
                
                <button 
                    onClick={handleSaveEntry}
                    disabled={!isBalanced}
                    className={`px-10 py-4 rounded-xl font-black text-lg shadow-xl transition-all active:scale-95
                        ${isBalanced ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                    `}
                >
                    {isBalanced ? 'Grabar Asiento Contable' : 'Asiento Descuadrado'}
                </button>
            </div>
        </div>
    </div>
  );
};

// --- Transactions: List Journal Entries ---
export const AccountingTransactions: React.FC = () => {
    const entries = useLiveQuery(() => db.journalEntries.orderBy('timestamp').reverse().toArray());

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
               <span className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl shadow-sm border border-blue-200"><Calculator size={20}/></span>
               Libro Diario
            </h2>
            
            <div className="grid grid-cols-1 gap-8">
                {entries?.map(entry => (
                    <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-slate-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <span className="bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Asiento #{entry.id}</span>
                                <span className="text-sm font-semibold text-slate-500">{new Date(entry.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold">
                                <span className="text-green-600">Debe: {entry.totalDebit.toFixed(2)} €</span>
                                <span className="text-red-600">Haber: {entry.totalCredit.toFixed(2)} €</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cuenta Contable</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción / Concepto</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Debe</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Haber</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {entry.lines.map((line, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-slate-700">{line.accountLabel}</td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500 italic">{line.descripcion}</td>
                                            <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-green-600">
                                                {line.valor > 0 ? line.valor.toFixed(2) : '-'}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-red-600">
                                                {line.valor < 0 ? Math.abs(line.valor).toFixed(2) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
                {(!entries || entries.length === 0) && (
                    <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <Calculator size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No se han registrado asientos en el diario.</p>
                    </div>
                )}
            </div>
        </div>
    );
};