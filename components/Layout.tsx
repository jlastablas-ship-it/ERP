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
        className={`flex items-center gap-3 p-3 transition-colors duration-200 
        ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
        ${collapsed ? 'justify-center' : ''}
        ${indent && !collapsed ? 'pl-8 text-sm' : ''}
        `}
      >
        <Icon size={20} className="min-w-[20px]" />
        {!collapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
      </Link>
    );
  };

  const GroupHeader = ({ label }: { label: string }) => {
    if (collapsed) return <div className="h-px bg-slate-700 my-2 mx-2"></div>;
    return (
      <div className="px-4 py-2 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${collapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 shadow-xl z-20`}
      >
        <div className="h-16 flex items-center justify-between px-4 bg-slate-800 shadow-md">
          {!collapsed && <span className="font-bold text-xl text-white tracking-tight">ERP<span className="text-blue-500">System</span></span>}
          <button onClick={toggleSidebar} className="p-1 rounded hover:bg-slate-700 text-white ml-auto">
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
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
        
        <div className="p-4 bg-slate-800 border-t border-slate-700 text-xs text-center">
           {!collapsed ? "v1.0.0 Alpha" : "v1.0"}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 border-b border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
                <LayoutDashboard size={18} className="text-blue-600" />
                <span className="capitalize font-medium text-lg">{currentModule}</span>
                {currentSection && (
                    <>
                        <ChevronRight size={16} className="text-slate-400" />
                        <span className="capitalize text-slate-500">{currentSection}</span>
                    </>
                )}
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm text-right hidden md:block">
                    <p className="font-medium text-slate-800">Admin User</p>
                    <p className="text-xs text-slate-500">Empresa Demo S.A.</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                    A
                </div>
            </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50 relative">
             {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
