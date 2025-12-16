import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { CompanyCenter, CenterType, User, Role } from '../types';
import { Trash2, Edit, Plus, Save, Building, Shield, User as UserIcon, CornerDownRight } from 'lucide-react';

// --- Structure: Company Tree ---
export const StructureView: React.FC = () => {
  const centers = useLiveQuery(() => db.centers.toArray());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyCenter>>({ type: CenterType.CENTRAL });

  const handleSave = async () => {
    if (!formData.name) return alert('El nombre es obligatorio');
    
    // Validation logic for parents
    if (formData.type === CenterType.DELEGACION && !formData.parentId) return alert('Una Delegación debe asociarse a una Central');
    if (formData.type === CenterType.CENTRO_ASOCIADO && !formData.parentId) return alert('Un Centro Asociado debe tener padre');
    
    const data = {
        name: formData.name,
        type: formData.type as CenterType,
        parentId: formData.parentId ? Number(formData.parentId) : undefined,
        timestamp: new Date().toISOString()
    };

    if (formData.id) await db.centers.update(formData.id, data);
    else await db.centers.add(data as CompanyCenter);

    setIsEditing(false);
    setFormData({ type: CenterType.CENTRAL });
  };

  const parentOptions = centers?.filter(c => {
    if (formData.type === CenterType.DELEGACION) return c.type === CenterType.CENTRAL;
    if (formData.type === CenterType.CENTRO_ASOCIADO) return c.type === CenterType.DELEGACION;
    if (formData.type === CenterType.OTRO_CENTRO) return c.type === CenterType.CENTRAL || c.type === CenterType.DELEGACION;
    return false;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Building className="text-blue-600" /> Estructura de Empresa
        </h2>
        <button 
            onClick={() => { setFormData({ type: CenterType.CENTRAL }); setIsEditing(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
            <Plus size={16} /> Nuevo Centro
        </button>
      </div>

      {isEditing && (
        <div className="mb-6 p-4 bg-slate-50 rounded border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nombre del Centro</label>
            <input 
              type="text" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
              value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Tipo de Centro</label>
            <select 
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 bg-white"
              value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as CenterType, parentId: undefined})}
            >
              {Object.values(CenterType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {formData.type !== CenterType.CENTRAL && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Asociado a (Padre)</label>
                <select 
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 bg-white"
                  value={formData.parentId || ''} onChange={e => setFormData({...formData, parentId: Number(e.target.value)})}
                >
                  <option value="">Seleccione Padre...</option>
                  {parentOptions?.map(c => <option key={c.id} value={c.id}>{c.type} - {c.name}</option>)}
                </select>
              </div>
          )}
          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
          </div>
        </div>
      )}

      {/* Tree Visualization */}
      <div className="space-y-2 border rounded-md p-4 bg-slate-50 min-h-[200px]">
         {centers?.filter(c => c.type === CenterType.CENTRAL).map(central => (
             <div key={central.id} className="mb-4">
                 <div className="flex items-center gap-2 font-bold text-slate-800 p-2 bg-white border rounded shadow-sm">
                    <Building size={16} className="text-blue-500"/> {central.name} <span className="text-xs text-slate-400 font-normal uppercase tracking-wider ml-auto">{central.type}</span>
                    <button onClick={() => {setFormData(central); setIsEditing(true);}} className="ml-2 text-slate-400 hover:text-blue-600"><Edit size={14}/></button>
                 </div>
                 
                 {/* Level 2: Delegations & Others */}
                 <div className="ml-6 border-l-2 border-slate-200 pl-4 mt-2 space-y-2">
                    {centers.filter(c => c.parentId === central.id).map(child => (
                        <div key={child.id}>
                            <div className="flex items-center gap-2 text-slate-700 p-2 bg-white border rounded shadow-sm">
                                <CornerDownRight size={14} className="text-slate-400"/> {child.name} <span className="text-xs text-slate-400 font-normal uppercase tracking-wider ml-auto">{child.type}</span>
                                <button onClick={() => {setFormData(child); setIsEditing(true);}} className="ml-2 text-slate-400 hover:text-blue-600"><Edit size={14}/></button>
                            </div>

                            {/* Level 3: Associated Centers */}
                            <div className="ml-6 border-l-2 border-slate-200 pl-4 mt-2 space-y-2">
                                {centers.filter(gc => gc.parentId === child.id).map(grandChild => (
                                    <div key={grandChild.id} className="flex items-center gap-2 text-slate-600 p-2 bg-white border rounded shadow-sm text-sm">
                                        <CornerDownRight size={14} className="text-slate-300"/> {grandChild.name} <span className="text-xs text-slate-400 font-normal uppercase tracking-wider ml-auto">{grandChild.type}</span>
                                        <button onClick={() => {setFormData(grandChild); setIsEditing(true);}} className="ml-2 text-slate-400 hover:text-blue-600"><Edit size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
         ))}
         {centers?.length === 0 && <p className="text-slate-400 text-center">No hay estructura definida.</p>}
      </div>
    </div>
  );
};

// --- Users: Management ---
export const UsersView: React.FC = () => {
    const users = useLiveQuery(() => db.users.toArray());
    const roles = useLiveQuery(() => db.roles.toArray());
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});

    const handleSave = async () => {
        if(!formData.username || !formData.email) return alert('Datos incompletos');
        const data = {
            username: formData.username,
            email: formData.email,
            roleId: formData.roleId ? Number(formData.roleId) : undefined,
            timestamp: new Date().toISOString()
        };
        if (formData.id) await db.users.update(formData.id, data);
        else await db.users.add(data as User);
        setIsEditing(false);
        setFormData({});
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2"><UserIcon className="text-blue-600"/> Gestión de Usuarios</h2>
                <button onClick={() => {setFormData({}); setIsEditing(true);}} className="btn-primary flex items-center gap-2"><Plus size={16}/> Nuevo Usuario</button>
            </div>

            {isEditing && (
                <div className="mb-6 p-4 bg-slate-50 rounded border border-blue-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input className="input-field" placeholder="Nombre Usuario" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
                    <input className="input-field" placeholder="Email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <select className="input-field bg-white" value={formData.roleId || ''} onChange={e => setFormData({...formData, roleId: Number(e.target.value)})}>
                        <option value="">Sin Rol</option>
                        {roles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <div className="md:col-span-3 flex justify-end gap-2">
                        <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancelar</button>
                        <button onClick={handleSave} className="btn-primary">Guardar</button>
                    </div>
                </div>
            )}

            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                    <tr><th className="px-6 py-3">Usuario</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Rol</th><th className="px-6 py-3 text-right">Acciones</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users?.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-medium">{u.username}</td>
                            <td className="px-6 py-3 text-slate-500">{u.email}</td>
                            <td className="px-6 py-3"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">{roles?.find(r => r.id === u.roleId)?.name || 'N/A'}</span></td>
                            <td className="px-6 py-3 text-right">
                                <button onClick={() => {setFormData(u); setIsEditing(true);}} className="text-blue-600 mr-2"><Edit size={16}/></button>
                                <button onClick={() => u.id && db.users.delete(u.id)} className="text-red-600"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Security: Roles ---
export const SecurityView: React.FC = () => {
    const roles = useLiveQuery(() => db.roles.toArray());
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Role>>({ permissions: [] });

    const handleSave = async () => {
        if(!formData.name) return alert('Nombre del rol requerido');
        const data = {
            name: formData.name,
            permissions: formData.permissions || [],
            timestamp: new Date().toISOString()
        };
        if(formData.id) await db.roles.update(formData.id, data);
        else await db.roles.add(data as Role);
        setIsEditing(false);
        setFormData({ permissions: [] });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2"><Shield className="text-blue-600"/> Roles y Permisos</h2>
                <button onClick={() => {setFormData({ permissions: [] }); setIsEditing(true);}} className="btn-primary flex items-center gap-2"><Plus size={16}/> Nuevo Rol</button>
            </div>

            {isEditing && (
                <div className="mb-6 p-4 bg-slate-50 rounded border border-blue-200 gap-4 flex flex-col">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre del Rol</label>
                        <input className="input-field" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Permisos (Separados por coma para demo)</label>
                        <input className="input-field" placeholder="Contabilidad, Finanzas, Admin..." 
                            value={formData.permissions?.join(', ') || ''} 
                            onChange={e => setFormData({...formData, permissions: e.target.value.split(',').map(s => s.trim())})} 
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancelar</button>
                        <button onClick={handleSave} className="btn-primary">Guardar</button>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roles?.map(role => (
                    <div key={role.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition bg-slate-50">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-700">{role.name}</h3>
                            <div className="flex gap-1">
                                <button onClick={() => {setFormData(role); setIsEditing(true);}} className="text-blue-500 hover:bg-blue-100 p-1 rounded"><Edit size={14}/></button>
                                <button onClick={() => role.id && db.roles.delete(role.id)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={14}/></button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {role.permissions.map((p, i) => (
                                <span key={i} className="text-[10px] uppercase bg-slate-200 text-slate-600 px-2 py-1 rounded font-semibold">{p}</span>
                            ))}
                            {role.permissions.length === 0 && <span className="text-xs text-slate-400 italic">Sin permisos definidos</span>}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .input-field { @apply block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2; }
                .btn-primary { @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm; }
                .btn-secondary { @apply px-4 py-2 text-slate-600 hover:text-slate-800 transition; }
            `}</style>
        </div>
    );
};
