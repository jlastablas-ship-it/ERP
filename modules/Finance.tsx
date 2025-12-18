import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Supplier, SupplierClassification, Invoice } from '../types';
import { Trash2, Edit, Plus, Save, FileText, Banknote } from 'lucide-react';

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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Banknote className="text-emerald-600" /> Maestro Proveedores
                </h2>
                <button 
                    onClick={() => { setFormData({ clasificacion: SupplierClassification.OTRO }); setIsEditing(true); }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-100"
                >
                    <Plus size={18} /> Nuevo Proveedor
                </button>
            </div>

            {isEditing && (
                <div className="p-8 bg-emerald-50/50 border-b border-emerald-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">Nº Proveedor (4 dígitos)*</label>
                            <input type="text" maxLength={4} pattern="\d{4}" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition bg-white" value={formData.numeroProveedor || ''} onChange={e => setFormData({...formData, numeroProveedor: e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">Nombre o Razón Social*</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition bg-white" value={formData.nombreProveedor || ''} onChange={e => setFormData({...formData, nombreProveedor: e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">Dirección Fiscal</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition bg-white" value={formData.direccionProveedor || ''} onChange={e => setFormData({...formData,direccionProveedor: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">Clasificación</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition bg-white font-bold" value={formData.clasificacion} onChange={e => setFormData({...formData, clasificacion: e.target.value as any})}>
                                {Object.values(SupplierClassification).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-4 pt-6 mt-4 border-t border-emerald-100">
                            <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-500 font-black uppercase tracking-widest text-xs hover:text-slate-800 transition">Cancelar</button>
                            <button onClick={handleSave} className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-black shadow-lg shadow-emerald-200 uppercase tracking-widest text-xs">Guardar Proveedor</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Comercial</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestión</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {suppliers?.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-900">{s.numeroProveedor}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">{s.nombreProveedor}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">{s.clasificacion}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    <button onClick={() => { setFormData(s); setIsEditing(true); }} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition shadow-sm"><Edit size={16}/></button>
                                    <button onClick={() => s.id && db.suppliers.delete(s.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition shadow-sm"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!suppliers || suppliers.length === 0) && (
                    <div className="py-20 text-center text-slate-400 italic">No hay proveedores configurados en el sistema.</div>
                )}
            </div>
        </div>
    );
};

// --- Process: Record Invoice ---
export const FinanceProcess: React.FC = () => {
    const suppliers = useLiveQuery(() => db.suppliers.toArray());
    const [formData, setFormData] = useState<Partial<Invoice>>({ valor: 0 });

    const handleSave = async () => {
        if (!formData.supplierId || !formData.numeroFactura || !formData.fechaFactura) return alert('Los campos Proveedor, Número y Fecha son obligatorios');

        const supplier = suppliers?.find(s => s.id === Number(formData.supplierId));
        
        await db.invoices.add({
            supplierId: Number(formData.supplierId),
            supplierName: supplier?.nombreProveedor || 'N/A',
            numeroFactura: formData.numeroFactura,
            fechaFactura: formData.fechaFactura,
            descripcion: formData.descripcion || '',
            valor: Number(formData.valor),
            timestamp: new Date().toISOString()
        } as Invoice);
        
        alert('Factura de proveedor registrada correctamente');
        setFormData({ valor: 0 });
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-emerald-600 px-8 py-8 flex flex-col items-center text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                    <FileText size={32} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Registro de Factura Recibida</h2>
                <p className="text-emerald-100 text-sm mt-1 font-medium">Contabilidad Auxiliar de Proveedores</p>
            </div>
            
            <div className="p-10 space-y-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Entidad Emisora (Proveedor)</label>
                        <select 
                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition bg-slate-50 font-bold"
                            value={formData.supplierId || ''}
                            onChange={e => setFormData({...formData, supplierId: Number(e.target.value)})}
                        >
                            <option value="">-- Buscar Proveedor --</option>
                            {suppliers?.map(s => <option key={s.id} value={s.id}>[{s.numeroProveedor}] {s.nombreProveedor}</option>)}
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Nº Factura</label>
                            <input type="text" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition bg-slate-50 font-bold"
                                value={formData.numeroFactura || ''} onChange={e => setFormData({...formData, numeroFactura: e.target.value})}
                                placeholder="FACT-001..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Fecha Emisión</label>
                            <input type="date" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition bg-slate-50 font-bold" 
                                value={formData.fechaFactura || ''} onChange={e => setFormData({...formData, fechaFactura: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Descripción / Observaciones</label>
                        <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition bg-slate-50 font-medium text-sm" rows={2}
                            value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})}
                            placeholder="Detalle de la compra o servicios..."
                        />
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100 flex flex-col items-center">
                        <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Importe Total con IVA</label>
                        <div className="relative w-full max-w-xs">
                            <input type="number" step="0.01" className="w-full pl-6 pr-12 py-5 rounded-2xl border-none focus:ring-4 focus:ring-emerald-500/20 outline-none transition bg-white text-center text-3xl font-black text-emerald-800 shadow-inner" 
                                value={formData.valor || ''} onChange={e => setFormData({...formData, valor: Number(e.target.value)})}
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-emerald-300">€</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleSave} 
                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <Save size={24} /> Confirmar y Registrar Factura
                </button>
            </div>
        </div>
    );
};

// --- Transactions: List Invoices ---
export const FinanceTransactions: React.FC = () => {
    const invoices = useLiveQuery(() => db.invoices.toArray());

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
               <span className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-2xl shadow-sm border border-emerald-200"><FileText size={24}/></span>
               Histórico de Facturas
            </h2>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Factura</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº Documento</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedor</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Importe</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {invoices?.map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">{inv.fechaFactura}</td>
                                <td className="px-8 py-5 whitespace-nowrap"><span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-black uppercase tracking-widest">{inv.numeroFactura}</span></td>
                                <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-slate-800">{inv.supplierName}</td>
                                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-400 font-medium italic truncate max-w-[200px]">{inv.descripcion}</td>
                                <td className="px-8 py-5 whitespace-nowrap text-right font-mono text-lg font-black text-emerald-600">{inv.valor.toFixed(2)} €</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!invoices || invoices.length === 0) && (
                    <div className="py-24 text-center">
                        <FileText size={48} className="mx-auto text-slate-200 mb-6" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No hay facturas registradas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};