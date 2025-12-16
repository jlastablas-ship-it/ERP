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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Plan Contable</h2>
        <button 
            onClick={() => { setFormData({ subcuenta: '0000', clasificacion: AccountClassification.ACTIVO }); setIsEditing(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
            <Plus size={16} /> Nueva Cuenta
        </button>
      </div>

      {isEditing && (
        <div className="mb-6 p-4 bg-slate-50 rounded border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Cuenta (4 dígitos)</label>
            <input 
              type="text" maxLength={4} placeholder="0000"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={formData.cuenta || ''} onChange={e => setFormData({...formData, cuenta: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Subcuenta (4 dígitos)</label>
            <input 
              type="text" maxLength={4} placeholder="0000"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={formData.subcuenta || ''} onChange={e => setFormData({...formData, subcuenta: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Descripción</label>
            <input 
              type="text"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Código Externo</label>
            <input 
              type="text"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={formData.codigoExterno || ''} onChange={e => setFormData({...formData, codigoExterno: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Clasificación</label>
            <select 
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
              value={formData.clasificacion} 
              onChange={e => setFormData({...formData, clasificacion: e.target.value as any})}
            >
              {Object.values(AccountClassification).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cuenta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sub</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Clasificación</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {accounts?.map(acc => (
              <tr key={acc.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{acc.cuenta}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{acc.subcuenta}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{acc.descripcion}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${acc.clasificacion === 'Activo' ? 'bg-green-100 text-green-800' : 
                          acc.clasificacion === 'Pasivo' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {acc.clasificacion}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => { setFormData(acc); setIsEditing(true); }} className="text-blue-600 hover:text-blue-900 mr-3"><Edit size={18}/></button>
                  <button onClick={() => acc.id && handleDelete(acc.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {accounts?.length === 0 && <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">No hay cuentas registradas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Process: Journal Entry ---
export const AccountingProcess: React.FC = () => {
  const accounts = useLiveQuery(() => db.accounts.toArray());
  const [lines, setLines] = useState<Partial<JournalEntryLine>[] >([{}, {}]); // Start with 2 lines

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
  const isBalanced = Math.abs(totalValue) < 0.01;

  const handleSaveEntry = async () => {
    if (!isBalanced) return alert('El asiento no está cuadrado');
    if (lines.some(l => !l.accountId || !l.valor)) return alert('Complete todas las líneas');

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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Calculator className="text-blue-600" />
            Grabar Entrada Asiento
        </h2>

        <div className="space-y-4 mb-6">
            <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-slate-500 uppercase bg-slate-50 p-2 rounded">
                <div className="col-span-4">Cuenta</div>
                <div className="col-span-5">Descripción</div>
                <div className="col-span-2 text-right">Valor</div>
                <div className="col-span-1"></div>
            </div>

            {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                        <select 
                            className="w-full border-slate-300 rounded-md shadow-sm text-sm p-2 border"
                            value={line.accountId || ''}
                            onChange={e => updateLine(idx, 'accountId', Number(e.target.value))}
                        >
                            <option value="">Seleccionar Cuenta</option>
                            {accounts?.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.cuenta}-{acc.subcuenta} {acc.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-5">
                        <input 
                            type="text" 
                            className="w-full border-slate-300 rounded-md shadow-sm text-sm p-2 border"
                            placeholder="Descripción del movimiento"
                            value={line.descripcion || ''}
                            onChange={e => updateLine(idx, 'descripcion', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <input 
                            type="number" step="0.01"
                            className="w-full border-slate-300 rounded-md shadow-sm text-sm p-2 border text-right"
                            placeholder="0.00"
                            value={line.valor || ''}
                            onChange={e => updateLine(idx, 'valor', Number(e.target.value))}
                        />
                    </div>
                    <div className="col-span-1 text-center">
                        <button onClick={() => removeLine(idx)} className="text-slate-400 hover:text-red-500">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <button onClick={addLine} className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline mb-8">
            <Plus size={16} /> Añadir Línea
        </button>

        <div className="border-t border-slate-200 pt-4 flex flex-col md:flex-row justify-between items-center bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className={`flex items-center gap-2 ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    {isBalanced ? <AlertCircle size={20} className="transform rotate-180"/> : <AlertCircle size={20} />}
                    <span className="font-bold">Total: {totalValue.toFixed(2)}</span>
                </div>
                {!isBalanced && <span className="text-xs text-red-500">(Debe ser 0)</span>}
            </div>
            <button 
                onClick={handleSaveEntry}
                disabled={!isBalanced}
                className={`flex items-center gap-2 px-6 py-2 rounded shadow-sm text-white font-medium transition
                    ${isBalanced ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-400 cursor-not-allowed'}`}
            >
                <Save size={18} /> Grabar Asiento
            </button>
        </div>
    </div>
  );
};

// --- Transactions: List Journal Entries ---
export const AccountingTransactions: React.FC = () => {
    const entries = useLiveQuery(() => db.journalEntries.orderBy('timestamp').reverse().toArray());

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Transacciones Registradas</h2>
            <div className="space-y-6">
                {entries?.map(entry => (
                    <div key={entry.id} className="border rounded-md overflow-hidden">
                        <div className="bg-slate-100 px-4 py-2 flex justify-between text-sm text-slate-600">
                            <span>ID: {entry.id}</span>
                            <span>{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-slate-500">Cuenta</th>
                                    <th className="px-4 py-2 text-left font-medium text-slate-500">Descripción</th>
                                    <th className="px-4 py-2 text-right font-medium text-slate-500">Debe</th>
                                    <th className="px-4 py-2 text-right font-medium text-slate-500">Haber</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entry.lines.map((line, i) => (
                                    <tr key={i} className="border-b last:border-0">
                                        <td className="px-4 py-2 text-slate-800">{line.accountLabel}</td>
                                        <td className="px-4 py-2 text-slate-600">{line.descripcion}</td>
                                        <td className="px-4 py-2 text-right text-slate-700">
                                            {line.valor > 0 ? line.valor.toFixed(2) : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-right text-slate-700">
                                            {line.valor < 0 ? Math.abs(line.valor).toFixed(2) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
                {entries?.length === 0 && <p className="text-center text-slate-400">No hay transacciones registradas.</p>}
            </div>
        </div>
    );
};