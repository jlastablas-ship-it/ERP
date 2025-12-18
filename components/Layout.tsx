import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Building2, 
  Calculator, 
  Banknote, 
  Truck, 
  ShoppingCart, 
  Network, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  Database
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Parse path for breadcrumbs/title
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentModule = pathSegments[0] || 'Home';
  const currentSection = pathSegments[1] || '';

  const MenuItem = ({ to, icon: Icon, label, indent = false }: { to: string, icon: any, label: string, indent?: boolean }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link 
        to={to} 
        title={collapsed ? label : ''}
        className={`flex items-center gap-3 px-4 py-3 transition-colors duration-200 group
          ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
          ${indent && !collapsed ? 'pl-8' : ''}
          ${collapsed ? 'justify-center px-0' : ''}
        `}
      >
        <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-white'} />
        {!collapsed && <span className="font-medium whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}
      </Link>
    );
  };

  const GroupHeader = ({ label }: { label: string }) => {
    if (collapsed) return <div className="h-px bg-slate-800 my-2 mx-4" />;
    return (
      <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col z-20 shadow-xl
        ${collapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <span className="bg-blue-600 p-1.5 rounded-lg"><Settings size={20}/></span>
              <span className="tracking-tight">Micro<span className="text-blue-500">ERP</span></span>
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto main-nav py-4" style={{ padding: collapsed ? '0rem' : '' }}>
          <GroupHeader label="Administración" />
          <MenuItem to="/admin/structure" icon={Building2} label="Estructura" />
          <MenuItem to="/admin/users" icon={Users} label="Usuarios" />
          <MenuItem to="/admin/security" icon={Shield} label="Seguridad" />

          <GroupHeader label="Módulos" />
          <MenuItem to="/modules/contabilidad" icon={Calculator} label="Contabilidad" />
          <MenuItem to="/modules/finanzas" icon={Banknote} label="Finanzas" />
          <MenuItem to="/modules/distribucion" icon={Truck} label="Distribución" />
          <MenuItem to="/modules/compras" icon={ShoppingCart} label="Compras" />
          <MenuItem to="/modules/integracion" icon={Network} label="Integración" />

          <GroupHeader label="Configuración" />
          <MenuItem to="/config/db" icon={Database} label="Base de Datos" />
        </nav>
        
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
           {!collapsed ? "v1.0.0 Alpha Build" : "v1.0"}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
            <div className="flex items-center gap-3 text-slate-600 font-medium capitalize">
                <LayoutDashboard size={20} className="text-blue-600" />
                <span>{currentModule}</span>
                {currentSection && (
                    <>
                        <ChevronRight size={16} className="text-slate-400" />
                        <span className="text-slate-400 font-normal">{currentSection}</span>
                    </>
                )}
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-800 leading-none">Administrador</p>
                    <p className="text-xs text-slate-500 mt-1">Empresa Demo S.A.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200 shadow-inner">
                    A
                </div>
            </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 scroll-smooth">
             <div className="max-w-7xl mx-auto">
                {children}
             </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;