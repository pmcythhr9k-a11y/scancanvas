'use client';

import React from 'react';
import { Home, Eye, BookOpen, GitCompare, PackageCheck } from 'lucide-react';

export type ActiveTab = 'case' | 'scan' | 'report' | 'changes' | 'handoff';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  reportCount?: number;
  questionCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  reportCount = 4,
  questionCount = 3,
}) => {
  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'case', label: 'Case Home', icon: <Home size={16} /> },
    { id: 'scan', label: 'Scan', icon: <Eye size={16} /> },
    { id: 'report', label: 'Report Guide', icon: <BookOpen size={16} />, badge: `${reportCount} linked` },
    { id: 'changes', label: 'Changes', icon: <GitCompare size={16} /> },
    { id: 'handoff', label: 'Appointment Pack', icon: <PackageCheck size={16} />, badge: `${questionCount} questions` },
  ];

  return (
    <nav style={{
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--brand)' : 'var(--ink-secondary)',
                backgroundColor: isActive ? 'var(--surface-subtle)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--brand)' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: isActive ? 'var(--brand-soft)' : 'var(--surface-subtle)',
                  color: isActive ? 'var(--brand)' : 'var(--muted)',
                  fontWeight: 600,
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
