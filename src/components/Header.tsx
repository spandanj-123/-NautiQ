import React from 'react';
import { Play, Sparkles, Ship } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLoadDemo: () => void;
  onRunOptimisation: () => void;
  isOptimising: boolean;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onLoadDemo,
  onRunOptimisation,
  isOptimising,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'optimisation', label: 'Fleet Optimisation' },
    { id: 'routes', label: 'Route Optimizer', badge: 'Best Route' },
    { id: 'fuels', label: 'Fuel Scenarios' },
    { id: 'scenarios', label: 'Scenario Analysis' },
    { id: 'pareto', label: 'Results & Pareto' },
    { id: 'architecture', label: 'Architecture' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20">
            <Ship className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">NautiQ</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5 hidden sm:block">
              Quantum-Inspired Fuel & Fleet Decision Engine
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'text-emerald-800 bg-white shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            title="Load Smart India Hackathon 2026 pre-configured scenario"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Load Demo Scenario</span>
          </button>

          <button
            type="button"
            disabled={isOptimising}
            onClick={onRunOptimisation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-lg shadow-sm shadow-emerald-700/20 transition-all whitespace-nowrap"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isOptimising ? 'animate-spin' : ''}`} />
            <span>{isOptimising ? 'Optimising (QUBO)...' : 'Run Optimisation'}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto pt-2.5 pb-0.5 mt-2 border-t border-slate-200 no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
