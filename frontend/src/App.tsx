import React, { useState, useEffect } from 'react';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { InvestigationWorkspace } from './components/investigation/InvestigationWorkspace';
import { IncidentsView } from './components/incidents/IncidentsView';
import { ServicesView } from './components/services/ServicesView';
import { KnowledgeBase } from './components/KnowledgeBase';
import { SQLApprovalView } from './components/sql/SQLApprovalModal';
import { SecurityCenterView } from './components/security/SecurityCenterView';
import { CacheObservabilityView } from './components/cache/CacheObservabilityView';
import { EvaluationView } from './components/evaluations/EvaluationView';
import { AuditTrail } from './components/AuditTrail';
import { LoginModal } from './components/LoginModal';
import { UserInfo } from './types';
import { ApiService } from './services/api';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activeTab, setActiveTab] = useState('investigation');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Auto login with default sre_lead for instant frictionless demo
  useEffect(() => {
    const autoAuth = async () => {
      try {
        const u = await ApiService.login('sre_lead', 'Password123!');
        setUser(u);
      } catch (e) {
        console.warn('Auto auth initialization:', e);
      }
    };
    autoAuth();
  }, []);

  const handleLogout = () => {
    ApiService.setToken(null);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Precision Top Bar */}
      <TopBar
        user={user}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onNavigateToIncident={() => setActiveTab('incidents')}
      />

      {/* Main Container with Collapsible Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          pendingApprovalsCount={1}
        />

        {/* Central Workspace Canvas */}
        <main className="flex-1 h-[calc(100vh-3rem)] overflow-y-auto p-5">
          {activeTab === 'investigation' && <InvestigationWorkspace />}
          {activeTab === 'incidents' && <IncidentsView onSelectIncident={() => setActiveTab('investigation')} />}
          {activeTab === 'services' && <ServicesView />}
          {activeTab === 'knowledge' && <KnowledgeBase />}
          {activeTab === 'sql' && <SQLApprovalView />}
          {activeTab === 'traces' && <InvestigationWorkspace />}
          {activeTab === 'security' && <SecurityCenterView />}
          {activeTab === 'cache' && <CacheObservabilityView />}
          {activeTab === 'evaluations' && <EvaluationView />}
          {activeTab === 'audit' && <AuditTrail />}
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={(tab) => setActiveTab(tab)}
      />

      {/* Auth Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />
    </div>
  );
};

export default App;
