import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import { UnderConstruction, ModuleNav } from './modules/Common';
import { AccountingMaster, AccountingProcess, AccountingTransactions } from './modules/Accounting';
import { FinanceMaster, FinanceProcess, FinanceTransactions } from './modules/Finance';
import { DbConfig } from './modules/Configuration';
import { StructureView, UsersView, SecurityView } from './modules/Administration';
import { IntegrationView } from './modules/Integration';

// Generic Wrapper to show Nav + Content
const ModuleWrapper = ({ baseUrl }: { baseUrl: string }) => {
    const activeTab = location.hash.split('/').pop() || 'maestro';
    return (
        <div className="h-full flex flex-col">
            <ModuleNav baseUrl={baseUrl} activeTab={activeTab} />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/structure" replace />} />
          
          {/* Admin Section */}
          <Route path="/admin/structure" element={<StructureView />} />
          <Route path="/admin/users" element={<UsersView />} />
          <Route path="/admin/security" element={<SecurityView />} />

          {/* Configuration */}
          <Route path="/config/db" element={<DbConfig />} />

          {/* Module: Accounting */}
          <Route path="/modules/contabilidad" element={<ModuleWrapper baseUrl="/modules/contabilidad" />}>
            <Route index element={<Navigate to="maestro" replace />} />
            <Route path="maestro" element={<AccountingMaster />} />
            <Route path="procesos" element={<AccountingProcess />} />
            <Route path="transacciones" element={<AccountingTransactions />} />
            <Route path="listados" element={<AccountingMaster />} />
            <Route path="informes" element={<UnderConstruction />} />
          </Route>

          {/* Module: Finance */}
          <Route path="/modules/finanzas" element={<ModuleWrapper baseUrl="/modules/finanzas" />}>
            <Route index element={<Navigate to="maestro" replace />} />
            <Route path="maestro" element={<FinanceMaster />} />
            <Route path="procesos" element={<FinanceProcess />} />
            <Route path="transacciones" element={<FinanceTransactions />} />
            <Route path="listados" element={<FinanceMaster />} />
            <Route path="informes" element={<UnderConstruction />} />
          </Route>

          {/* Other Modules (Placeholders) */}
          <Route path="/modules/distribucion/*" element={<ModuleWrapper baseUrl="/modules/distribucion" />} >
             <Route path="*" element={<UnderConstruction />} />
          </Route>
          <Route path="/modules/compras/*" element={<ModuleWrapper baseUrl="/modules/compras" />} >
             <Route path="*" element={<UnderConstruction />} />
          </Route>
          
          {/* Module: Integration */}
          <Route path="/modules/integracion" element={<IntegrationView />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/structure" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;