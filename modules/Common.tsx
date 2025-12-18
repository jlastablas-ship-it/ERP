import React from 'react';
import { Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UnderConstruction: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 border border-amber-100">
        <Construction size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">En Construcción</h2>
      <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
        Este módulo o sección se encuentra actualmente en fase de desarrollo o no tiene una definición específica asignada.
      </p>
      <div className="mt-8 px-4 py-2 bg-slate-50 rounded-full text-xs font-semibold text-slate-400 uppercase tracking-widest border border-slate-100">
        Próximamente
      </div>
    </div>
  );
};

export const ModuleNav: React.FC<{ baseUrl: string, activeTab: string, exclude?: string[] }> = ({ baseUrl, activeTab, exclude = [] }) => {
  const tabs = [
    { id: 'maestro', label: 'Maestro' },
    { id: 'procesos', label: 'Procesos' },
    { id: 'transacciones', label: 'Transacciones' },
    { id: 'listados', label: 'Listados' },
    { id: 'informes', label: 'Informes' },
  ];

  return (
    <div className="flex gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 mb-8 w-fit shadow-sm overflow-x-auto">
        {tabs.filter(t => !exclude.includes(t.id)).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={`${baseUrl}/${tab.id}`}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 whitespace-nowrap
                ${isActive ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}
              `}
            >
              {tab.label}
            </Link>
          );
        })}
    </div>
  );
};