import React from 'react';
import { Construction } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const UnderConstruction: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 bg-white rounded-lg border border-dashed border-slate-300 shadow-sm">
      <Construction size={64} className="mb-4 text-amber-500" />
      <h2 className="text-2xl font-bold text-slate-700 mb-2">En Construcción</h2>
      <p className="text-center max-w-md">
        Este módulo o sección aún no tiene una definición específica. 
        Por favor, consulta con el administrador o vuelve más tarde.
      </p>
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
    <div className="mb-6 border-b border-slate-200">
      <nav className="flex space-x-1 overflow-x-auto pb-1">
        {tabs.filter(t => !exclude.includes(t.id)).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={`${baseUrl}/${tab.id}`}
              className={`
                px-4 py-2 font-medium text-sm rounded-t-lg transition-colors whitespace-nowrap
                ${isActive 
                  ? 'bg-white text-blue-600 border-x border-t border-slate-200 -mb-px relative z-10 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}
              `}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
