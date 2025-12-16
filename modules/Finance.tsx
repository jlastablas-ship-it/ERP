import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Supplier, SupplierClassification, Invoice } from '../types';
import { Trash2, Edit, Plus, Save, FileText } from 'lucide-react';

// --- Master: Suppliers ---
export const FinanceMaster: React.FC = () => {
    const suppliers = useLiveQuery(() => db.suppliers.toArray());
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Supplier>>({
        clasificacion: SupplierClassification.OTRO
    });

    const handleSave = async () => {
        if (!formData.numeroProveedor || !formData.nombreProveedor) return alert('Campos obligatorios faltantes');
        
        const data = {
            numeroProveedor: formData.numeroProveedor,
            nombreProveedor: formData.nombreProveedor,
            direccionProveedor: formData.direccionProveedor || '',
            codigoExterno: formData.codigoExterno || '',
            clasificacion: formData.clasificacion as SupplierClassification,
            timestamp: new Date().toISOString()
        };

        if (formData.id) await db.suppliers.update(formData.id, data);
        else await db.suppliers.add(data as Supplier);

        setIsEditing(false);
        setFormData({ clasificacion: SupplierClassification.OTRO });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Maestro Proveedores</h2>
                <button 
                    onClick={() => { setFormData({ clasificacion: SupplierClassification.OTRO }); setIsEditing(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    <Plus size={16} /> Nuevo Proveedor
                </button>
            </div>

            {isEditing && (
                <div className="mb-6 p-4 bg-slate-50 rounded border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Número (4 dígitos)*</label>
                        <input type="text" maxLength={4} className="input-field" value={formData.numeroProveedor || ''} onChange={e => setFormData({...formData, numeroProveedor: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nombre Proveedor*</label>
                        <input type="text" className="input-field" value={formData.nombreProveedor || ''} onChange={e => setFormData({...formData, nombreProveedor: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Dirección</label>
                        <input type="text" className="input-field" value={formData.direccionProveedor || ''} onChange={e => setFormData({...formData, direccionProveedor: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Código Externo</label>
                        <input type="text" className="input-field" value={formData.codigoExterno || ''} onChange={e => setFormData({...formData, codigoExterno: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Clasificación</label>
                        <select className="input-field bg-white" value={formData.clasificacion} onChange={e => setFormData({...formData, clasificacion: e.target.value as any})}>
                            {Object.values(SupplierClassification).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                        <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancelar</button>
                        <button onClick={handleSave} className="btn-primary">Guardar</button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="th-cell">Número</th>
                            <th className="th-cell">Nombre</th>
                            <th className="th-cell">Clasificación</th>
                            <th className="th-cell text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {suppliers?.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50">
                                <td className="td-cell font-medium">{s.numeroProveedor}</td>
                                <td className="td-cell">{s.nombreProveedor}</td>
                                <td className="td-cell"><span className="badge">{s.clasificacion}</span></td>
                                <td className="td-cell text-right">
                                    <button onClick={() => { setFormData(s); setIsEditing(true); }} className="text-blue-600 mr-3"><Edit size={18}/></button>
                                    <button onClick={() => s.id && db.suppliers.delete(s.id)} className="text-red-600"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <style>{`
                .input-field { @apply mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2; }
                .btn-primary { @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700; }
                .btn-secondary { @apply px-4 py-2 text-slate-600 hover:text-slate-800; }
                .th-cell { @apply px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider; }
                .td-cell { @apply px-6 py-4 whitespace-nowrap text-sm text-slate-700; }
                .badge { @apply px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800; }
            `}</style>
        </div>
    );
};

// --- Process: Record Invoice ---
export const FinanceProcess: React.FC = () => {
    const suppliers = useLiveQuery(() => db.suppliers.toArray());
    const [formData, setFormData] = useState<Partial<Invoice>>({ valor: 0 });

    const handleSave = async () => {
        if (!formData.supplierId || !formData.numeroFactura || !formData.fechaFactura) return alert('Campos requeridos vacíos');

        const supplier = suppliers?.find(s => s.id === Number(formData.supplierId));
        
        await db.invoices.add({
            supplierId: Number(formData.supplierId),
            supplierName: supplier?.nombreProveedor || 'Unknown',
            numeroFactura: formData.numeroFactura,
            fechaFactura: formData.fechaFactura,
            descripcion: formData.descripcion || '',
            valor: Number(formData.valor),
            timestamp: new Date().toISOString()
        } as Invoice);
        
        alert('Factura grabada');
        setFormData({ valor: 0 });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <FileText className="text-purple-600" />
                Grabar Entrada Factura
            </h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Proveedor</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 bg-white"
                        value={formData.supplierId || ''}
                        onChange={e => setFormData({...formData, supplierId: Number(e.target.value)})}
                    >
                        <option value="">Seleccione Proveedor</option>
                        {suppliers?.map(s => <option key={s.id} value={s.id}>{s.numeroProveedor} - {s.nombreProveedor}</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Número Factura</label>
                        <input type="text" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2" 
                            value={formData.numeroFactura || ''} onChange={e => setFormData({...formData, numeroFactura: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Fecha Factura</label>
                        <input type="date" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2" 
                            value={formData.fechaFactura || ''} onChange={e => setFormData({...formData, fechaFactura: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Descripción</label>
                    <textarea className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2" rows={3}
                        value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Valor</label>
                    <input type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2" 
                        value={formData.valor || ''} onChange={e => setFormData({...formData, valor: Number(e.target.value)})}
                    />
                </div>

                <div className="pt-4 text-right">
                    <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 shadow-sm">
                        Registrar Factura
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Transactions: List Invoices ---
export const FinanceTransactions: React.FC = () => {
    const invoices = useLiveQuery(() => db.invoices.toArray());

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Facturas Registradas</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">Fecha</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">Nº Factura</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">Proveedor</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">Descripción</th>
                            <th className="px-6 py-3 text-right font-medium text-slate-500">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {invoices?.map(inv => (
                            <tr key={inv.id}>
                                <td className="px-6 py-4">{inv.fechaFactura}</td>
                                <td className="px-6 py-4 font-medium">{inv.numeroFactura}</td>
                                <td className="px-6 py-4">{inv.supplierName}</td>
                                <td className="px-6 py-4 text-slate-500">{inv.descripcion}</td>
                                <td className="px-6 py-4 text-right font-semibold">{inv.valor.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
