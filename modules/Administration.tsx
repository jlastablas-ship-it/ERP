import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { CompanyCenter, CenterType, User, Role } from '../types';
import { Trash2, Edit, Plus, Building, Shield, User as UserIcon, CornerDownRight } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Building className="text-blue-600" /> Estructura de Centros
        </h2>
        <button 
            onClick={() => { setFormData({ type: CenterType.CENTRAL }); setIsEditing(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-100"
        >
            <Plus size={18} /> Nuevo Centro
        </button>
      </div>

      {isEditing && (
        <div className="mb-8 p-8 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nombre del Centro</label>
            <input 
              type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-white"
              value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Tipo de Centro</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-white font-bold"
              value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as CenterType, parentId: undefined})}
            >
              {Object.values(CenterType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {formData.type !== CenterType.CENTRAL && (
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Dependencia Jerárquica (Padre)</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-white font-bold"
                  value={formData.parentId || ''} onChange={e => setFormData({...formData, parentId: Number(e.target.value)})}
                >
                  <option value="">-- Seleccionar Nodo Padre --</option>
                  {parentOptions?.map(c => <option key={c.id} value={c.id}>{c.type} - {c.name}</option>)}
                </select>
              </div>
          )}
          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-800 transition">Cancelar</button>
            <button onClick={handleSave} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black shadow-lg shadow-blue-200">Guardar Nodo</button>
          </div>
        </div>
      )}

      {/* Tree Visualization */}
      <div className="space-y-4 border-2 border-slate-50 rounded-3xl p-8 bg-slate-50/50 min-h-[300px]">
         {centers?.filter(c => c.type === CenterType.CENTRAL).map(central => (
             <div key={central.id} className="mb-6 last:mb-0">
                 <div className="flex items-center gap-3 font-black text-slate-800 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm group">
                    <Building size={20} className="text-blue-500"/> 
                    <span className="text-lg tracking-tight">{central.name}</span>
                    <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-1 rounded-md ml-auto border border-blue-100 uppercase tracking-tighter">{central.type}</span>
                    <button onClick={() => {setFormData(central); setIsEditing(true);}} className="p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit size={16}/></button>
                 </div>
                 
                 {/* Level 2: Delegations & Others */}
                 <div className="ml-8 border-l-2 border-slate-200 pl-6 mt-3 space-y-3">
                    {centers.filter(c => c.parentId === central.id).map(child => (
                        <div key={child.id}>
                            <div className="flex items-center gap-3 text-slate-700 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm group">
                                <CornerDownRight size={18} className="text-slate-300"/> 
                                <span className="font-bold">{child.name}</span>
                                <span className="bg-slate-50 text-slate-400 text-[9px] font-black px-2 py-1 rounded-md ml-auto border border-slate-100 uppercase tracking-tighter">{child.type}</span>
                                <button onClick={() => {setFormData(child); setIsEditing(true);}} className="p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit size={16}/></button>
                            </div>

                            {/* Level 3: Associated Centers */}
                            <div className="ml-8 border-l-2 border-slate-200 pl-6 mt-3 space-y-3">
                                {centers.filter(gc => gc.parentId === child.id).map(grandChild => (
                                    <div key={grandChild.id} className="flex items-center gap-3 text-slate-500 p-3 bg-white border border-slate-100 rounded-xl shadow-sm group">
                                        <CornerDownRight size={14} className="text-slate-200"/> 
                                        <span className="text-sm font-semibold">{grandChild.name}</span>
                                        <span className="bg-slate-50 text-slate-300 text-[8px] font-black px-1.5 py-0.5 rounded-md ml-auto uppercase tracking-tighter">{grandChild.type}</span>
                                        <button onClick={() => {setFormData(grandChild); setIsEditing(true);}} className="p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
         ))}
         {(!centers || centers.length === 0) && (
            <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Sin estructura jerárquica configurada.</div>
         )}
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
        if(!formData.username || !formData.email) return alert('Datos de usuario incompletos');
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><UserIcon className="text-blue-600"/> Gestión de Usuarios</h2>
                <button onClick={() => {setFormData({}); setIsEditing(true);}} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-black flex items-center gap-2 shadow-lg shadow-blue-100"><Plus size={18}/> Alta de Usuario</button>
            </div>

            {isEditing && (
                <div className="mb-8 p-8 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="col-span-1">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ID Acceso</label>
                        <input className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-white" placeholder="Username..." value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Corporativo</label>
                        <input className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-white" placeholder="email@empresa.com" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Asignar Perfil (Rol)</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-white font-bold" value={formData.roleId || ''} onChange={e => setFormData({...formData, roleId: Number(e.target.value)})}>
                            <option value="">-- Sin Rol Asignado --</option>
                            {roles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                        <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-800 transition">Cancelar</button>
                        <button onClick={handleSave} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black shadow-lg shadow-blue-200">Confirmar Alta</button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificador</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo Electrónico</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfil de Seguridad</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {users?.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-black text-slate-700">{u.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                        {roles?.find(r => r.id === u.roleId)?.name || 'INVITADO'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    <button onClick={() => {setFormData(u); setIsEditing(true);}} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition"><Edit size={18}/></button>
                                    <button onClick={() => u.id && db.users.delete(u.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Security: Roles ---
export const SecurityView: React.FC = () => {
    const roles = useLiveQuery(() => db.roles.toArray());
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Role>>({ permissions: [] });

    const handleSave = async () => {
        if(!formData.name) return alert('El nombre del rol es obligatorio');
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><Shield className="text-blue-600"/> Perfiles de Seguridad</h2>
                <button onClick={() => {setFormData({ permissions: [] }); setIsEditing(true);}} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-black flex items-center gap-2 shadow-lg shadow-blue-100"><Plus size={18}/> Crear Nuevo Perfil</button>
            </div>

            {isEditing && (
                <div className="mb-8 p-8 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nombre del Perfil</label>
                        <input className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-white font-bold" placeholder="p.ej. Supervisor Contable" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Módulos Permitidos (Separados por coma)</label>
                        <input className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-white" placeholder="Contabilidad, Finanzas..." 
                            value={formData.permissions?.join(', ') || ''} 
                            onChange={e => setFormData({...formData, permissions: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})} 
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200">
                        <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-800 transition">Cancelar</button>
                        <button onClick={handleSave} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black shadow-lg shadow-blue-200">Confirmar Perfil</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles?.map(role => (
                    <div key={role.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-black text-slate-800 tracking-tight leading-none">{role.name}</h3>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => {setFormData(role); setIsEditing(true);}} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg"><Edit size={14}/></button>
                                <button onClick={() => role.id && db.roles.delete(role.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={14}/></button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-4">
                            {role.permissions.map((p, i) => (
                                <span key={i} className="px-2 py-1 bg-white text-slate-600 rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">{p}</span>
                            ))}
                            {role.permissions.length === 0 && <span className="text-[10px] text-slate-400 font-medium italic">Sin permisos específicos</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};