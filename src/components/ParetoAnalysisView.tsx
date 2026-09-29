import React, { useState } from 'react';
import {
  CandidateSolution,
  OptimisationRunResult,
  OptimisationParams,
} from '../types/maritime';
import {
  TrendingDown,
  Check,
  Info,
  DollarSign,
  Leaf,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Ship,
} from 'lucide-react';
import { FUEL_SPECIFICATIONS } from '../data/mockData';

interface Props {
  runResult: OptimisationRunResult;
  selectedSolution: CandidateSolution;
  onSelectSolution: (solution: CandidateSolution) => void;
  params: OptimisationParams;
  onNavigateTab: (tab: string) => void;
}

export const ParetoAnalysisView: React.FC<Props> = ({
  runResult,
  selectedSolution,
  onSelectSolution,
  params,
  onNavigateTab,
}) => {
  const [hoveredCandidate, setHoveredCandidate] = useState<CandidateSolution | null>(null);

  const {
    allCandidates,
    paretoFrontier,
    lowestCostSolution,
    lowestEmissionsSolution,
    balancedSolution,
  } = runResult;

  // Plot geometry
  const width = 820;
  const height = 440;
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };

  // Calculate bounds for X (Operating Cost) and Y (Lifecycle CO2e)
  const minCost = Math.min(...allCandidates.map((c) => c.operatingCostINR));
  const maxCost = Math.max(...allCandidates.map((c) => c.operatingCostINR));
  const minCO2 = Math.min(...allCandidates.map((c) => c.lifecycleCO2eTonnes));
  const maxCO2 = Math.max(...allCandidates.map((c) => c.lifecycleCO2eTonnes));

  const costRange = maxCost - minCost || 1;
  const co2Range = maxCO2 - minCO2 || 1;

  const scaleX = (cost: number) =>
    padding.left + ((cost - minCost) / costRange) * (width - padding.left - padding.right);

  const scaleY = (co2: number) =>
    height - padding.bottom - ((co2 - minCO2) / co2Range) * (height - padding.top - padding.bottom);

  // Sorted Pareto line points
  const sortedPareto = [...paretoFrontier].sort((a, b) => a.operatingCostINR - b.operatingCostINR);
  const paretoPathD = sortedPareto.length > 0
    ? sortedPareto
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.operatingCostINR)} ${scaleY(p.lifecycleCO2eTonnes)}`)
        .join(' ')
    : '';

  // 3 Archetype presets
  const presets = [
    {
      id: 'cost',
      title: '1. Lowest Cost',
      subtitle: 'Minimum voyage expenditure',
      icon: DollarSign,
      solution: lowestCostSolution,
      badgeColor: 'border-teal-300 text-teal-800 bg-teal-50',
    },
    {
      id: 'emissions',
      title: '2. Lowest Emissions',
      subtitle: 'Minimum Well-to-Wake CO₂e',
      icon: Leaf,
      solution: lowestEmissionsSolution,
      badgeColor: 'border-emerald-300 text-emerald-800 bg-emerald-50',
    },
    {
      id: 'balanced',
      title: '3. Balanced Solution',
      subtitle: 'Multi-objective optimal compromise',
      icon: Scale,
      solution: balancedSolution,
      badgeColor: 'border-amber-300 text-amber-800 bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Module 2 — Pareto Multi-Objective Frontier</h2>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono font-medium">250 Candidates</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Non-dominated solutions where operating cost cannot be lowered without increasing lifecycle carbon emissions. Select an archetype preset or click any candidate point to load into the active dispatch plan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg font-mono font-semibold">
            {paretoFrontier.length} Pareto-Efficient Points
          </span>
        </div>
      </div>

      {/* 3 Selectable Archetype Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const isSelected = selectedSolution.id === preset.solution.id;
          const Icon = preset.icon;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectSolution(preset.solution)}
              className={`text-left p-4 rounded-xl border transition-all relative ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${preset.badgeColor} border`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{preset.title}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{preset.subtitle}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 font-mono bg-emerald-100 px-1.5 py-0.5 rounded">
                    <Check className="w-3.5 h-3.5" /> ACTIVE
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Voyage Cost</span>
                  <p className="font-mono font-bold text-slate-900">
                    ₹{(preset.solution.operatingCostINR / 100000).toFixed(2)} L
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Lifecycle CO₂e</span>
                  <p className="font-mono font-bold text-emerald-700">
                    {preset.solution.lifecycleCO2eTonnes.toFixed(1)} t
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Config</span>
                  <p className="truncate text-slate-800 font-medium">
                    {preset.solution.fuelType}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Speed / Rel.</span>
                  <p className="font-mono text-slate-700 font-medium">
                    {preset.solution.speedKnots} kts · {preset.solution.scheduleReliabilityPct}%
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Scatter Plot Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Operating Cost vs. Lifecycle CO₂e Scatter Space</h3>
            <p className="text-xs text-slate-500">
              Interactive Pareto frontier derived from 250 combinatorial evaluations (QUBO state sampling).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
              <span className="text-slate-700">Pareto Frontier</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-500">Dominated Candidate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-200 animate-pulse" />
              <span className="text-amber-800 font-bold">Active Selection</span>
            </div>
          </div>
        </div>

        {/* SVG Scatter Plot */}
        <div className="relative w-full overflow-x-auto bg-slate-50 rounded-xl border border-slate-200 p-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[650px] select-none"
          >
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const yVal = minCO2 + pct * co2Range;
              const yPos = scaleY(yVal);
              return (
                <g key={`y-grid-${pct}`}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={width - padding.right}
                    y2={yPos}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 10}
                    y={yPos + 4}
                    fill="#64748b"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {Math.round(yVal)} t
                  </text>
                </g>
              );
            })}

            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const xVal = minCost + pct * costRange;
              const xPos = scaleX(xVal);
              return (
                <g key={`x-grid-${pct}`}>
                  <line
                    x1={xPos}
                    y1={padding.top}
                    x2={xPos}
                    y2={height - padding.bottom}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={xPos}
                    y={height - padding.bottom + 20}
                    fill="#64748b"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    ₹{(xVal / 100000).toFixed(1)}L
                  </text>
                </g>
              );
            })}

            {/* Axis Labels */}
            <text
              x={width / 2}
              y={height - 12}
              fill="#475569"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              Operating Cost (₹ Lakhs) →
            </text>

            <text
              transform={`rotate(-90) translate(-${height / 2}, 24)`}
              fill="#475569"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              ← Lifecycle CO₂e (Tonnes)
            </text>

            {/* Pareto Line */}
            {paretoPathD && (
              <path
                d={paretoPathD}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                opacity="0.9"
              />
            )}

            {/* Non-Pareto Candidate Dots */}
            {allCandidates
              .filter((c) => !c.isParetoOptimal)
              .map((c) => {
                const cx = scaleX(c.operatingCostINR);
                const cy = scaleY(c.lifecycleCO2eTonnes);
                const isSelected = selectedSolution.id === c.id;

                return (
                  <circle
                    key={c.id}
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 6 : 3.5}
                    fill={isSelected ? '#d97706' : '#94a3b8'}
                    opacity={isSelected ? 1 : 0.6}
                    className="cursor-pointer transition-all hover:opacity-100 hover:scale-125"
                    onClick={() => onSelectSolution(c)}
                    onMouseEnter={() => setHoveredCandidate(c)}
                    onMouseLeave={() => setHoveredCandidate(null)}
                  />
                );
              })}

            {/* Pareto Candidate Dots */}
            {paretoFrontier.map((c) => {
              const cx = scaleX(c.operatingCostINR);
              const cy = scaleY(c.lifecycleCO2eTonnes);
              const isSelected = selectedSolution.id === c.id;

              return (
                <g key={c.id} className="cursor-pointer">
                  {isSelected && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={10}
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2.5"
                      className="animate-ping opacity-75"
                    />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 7 : 5}
                    fill={isSelected ? '#d97706' : '#059669'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="hover:scale-150 transition-transform"
                    onClick={() => onSelectSolution(c)}
                    onMouseEnter={() => setHoveredCandidate(c)}
                    onMouseLeave={() => setHoveredCandidate(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card overlay */}
          {hoveredCandidate && (
            <div
              className="absolute pointer-events-none p-3 rounded-lg border border-slate-200 bg-white/95 backdrop-blur-md shadow-xl text-xs space-y-1 z-30"
              style={{
                left: `${Math.min(70, Math.max(10, (hoveredCandidate.operatingCostINR - minCost) / costRange * 100))}%`,
                top: '15px',
              }}
            >
              <div className="flex items-center justify-between gap-3 font-bold text-slate-900">
                <span>{hoveredCandidate.vesselType} ({hoveredCandidate.fuelType})</span>
                <span className={hoveredCandidate.isParetoOptimal ? 'text-emerald-700 font-mono font-bold' : 'text-slate-500 font-mono'}>
                  {hoveredCandidate.isParetoOptimal ? '★ Pareto' : 'Candidate'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-600 font-mono">
                <span>Cost: ₹{(hoveredCandidate.operatingCostINR / 100000).toFixed(2)}L</span>
                <span>CO₂e: {hoveredCandidate.lifecycleCO2eTonnes.toFixed(1)} t</span>
                <span>Speed: {hoveredCandidate.speedKnots} kts</span>
                <span>Reliability: {hoveredCandidate.scheduleReliabilityPct}%</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-medium italic">Click to adopt this plan</p>
            </div>
          )}
        </div>

        {/* Active Selection Details Card */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Active Dispatch: {selectedSolution.vesselType} with {selectedSolution.fuelType}
                </h4>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 font-mono">
                  {selectedSolution.archetype || 'Custom Pareto'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Cruising speed: {selectedSolution.speedKnots} knots · ETA: {selectedSolution.transitHours.toFixed(1)}h · Load: {selectedSolution.utilizationPct}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-slate-500 text-[10px] block uppercase font-semibold">Voyage Opex</span>
              <span className="text-teal-800 font-bold text-sm">
                ₹{(selectedSolution.operatingCostINR / 100000).toFixed(2)} Lakhs
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[10px] block uppercase font-semibold">Lifecycle CO₂e</span>
              <span className="text-emerald-700 font-bold text-sm">
                {selectedSolution.lifecycleCO2eTonnes.toFixed(1)} tonnes
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('xai')}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
            >
              Inspect XAI →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
