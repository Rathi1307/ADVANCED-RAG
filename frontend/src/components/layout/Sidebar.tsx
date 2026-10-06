import React from 'react';
import {
  Terminal,
  AlertOctagon,
  Server,
  BookOpen,
  Database,
  Layers,
  ShieldCheck,
  Zap,
  FileCheck2,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  pendingApprovalsCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  pendingApprovalsCount = 1
}) => {
  const navItems: NavSection[] = [
    {
      group: 'INVESTIGATION & INCIDENTS',
      items: [
        { id: 'investigation', label: 'AI Investigation', icon: Terminal, badge: 'Live' },
        { id: 'incidents', label: 'Incidents & Correlation', icon: AlertOctagon, badge: 'P1' },
        { id: 'services', label: 'Services & Pods', icon: Server },
        { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
      ]
    },
    {
      group: 'DATA & SAFETY CONTROLS',
      items: [
        { id: 'sql', label: 'SQL Approval & Safety', icon: Database, badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} req` : undefined, badgeColor: 'amber' },
        { id: 'traces', label: 'Investigation Traces', icon: Layers },
        { id: 'security', label: 'Security Center (L1-L9)', icon: ShieldCheck },
      ]
    },
    {
      group: 'OBSERVABILITY & COMPLIANCE',
      items: [
        { id: 'cache', label: '5-Tier Cache Observability', icon: Zap },
        { id: 'audit', label: 'Audit & Compliance Stream', icon: FileCheck2 },
        { id: 'evaluations', label: 'Ragas Evaluation Hub', icon: BarChart3 },
      ]
    }
  ];

  return (
    <aside
      className={`relative h-[calc(100vh-3rem)] bg-[#0A0C10] border-r border-[#1A1F2B] flex flex-col justify-between select-none transition-all duration-200 z-20 ${
        collapsed ? 'w-14' : 'w-60'
      }`}
    >
      <div className="py-3 px-2 space-y-5 overflow-y-auto">
        {navItems.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-2.5 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                {section.group}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors ${
                      isActive
                        ? 'bg-[#161B26] text-blue-400 font-semibold border border-[#21293A]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#10131B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          item.badgeColor === 'amber'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : item.badge === 'P1'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-[#1A1F2B]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1.5 rounded bg-[#0E1117] hover:bg-[#141822] text-slate-500 hover:text-slate-300 border border-[#1E232F] text-xs font-mono transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
};
