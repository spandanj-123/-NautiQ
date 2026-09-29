import React, { useState } from 'react';
import { FuelType } from '../types/maritime';
import { FUEL_SPECIFICATIONS } from '../data/mockData';
import {
  Flame,
  Leaf,
  DollarSign,
  Globe2,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  Info,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

interface Props {
  activeFuel: FuelType;
  onSelectFuel: (fuel: FuelType) => void;
  onNavigateTab: (tab: string) => void;
}

export const FuelScenariosView: React.FC<Props> = ({
  activeFuel,
  onSelectFuel,
  onNavigateTab,
}) => {
  const [metricTab, setMetricTab] = useState<'all' | 'emissions' | 'readiness'>('all');

  const fuels = Object.values(FUEL_SPECIFICATIONS);

  return (
    <div className="space-y-6">
      {/* Header with Demo Data Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Module 3 — Alternative Fuel Scenario Comparison</h2>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              SIMULATED BENCHMARK DATA
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Evaluate decarbonisation pathways across lifecycle greenhouse gas emissions (Well-to-Wake ISO 14067), bunkering capital expenditure, energy density penalties, and corridor port readiness.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
          <button
            type="button"
            onClick={() => setMetricTab('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              metricTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Full Matrix
          </button>
          <button
            type="button"
            onClick={() => setMetricTab('emissions')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              metricTab === 'emissions' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Emissions Focus
          </button>
          <button
            type="button"
            onClick={() => setMetricTab('readiness')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              metricTab === 'readiness' ? 'bg-white text-sky-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TRL & Readiness
          </button>
        </div>
      </div>

      {/* Fuel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {fuels.map((f) => {
          const isSelected = activeFuel === f.id;
          return (
            <div
              key={f.id}
              onClick={() => onSelectFuel(f.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-semibold text-slate-500">{f.chemicalFormula}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded uppercase font-mono">
                      Selected
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{f.id}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{f.name}</p>

                {/* Emissions Reduction Bar */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 text-[11px] font-medium">CO₂e Reduction</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {f.lifecycleReductionPct > 0 ? `-${f.lifecycleReductionPct}%` : 'Baseline'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.max(5, f.lifecycleReductionPct)}%` }}
                    />
                  </div>
                </div>

                {/* Key specs */}
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Base Cost:</span>
                    <span className="font-mono font-semibold">₹{(f.baseCostPerTonneINR / 1000).toFixed(0)}k/t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Energy Density:</span>
                    <span className="font-mono font-semibold">{f.energyDensityMJkg} MJ/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">TRL Level:</span>
                    <span className="font-mono font-semibold text-sky-700">TRL {f.infrastructureTRL}/9</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Global Avail:</span>
                    <span className="font-mono font-semibold">{f.globalAvailabilityPct}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium truncate">{f.bunkeringComplexity}</span>
                <span className="text-emerald-700 font-bold hover:underline">Apply</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Matrix Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Comparative Techno-Economic Fuel Matrix</h3>
            <p className="text-xs text-slate-500">
              Detailed breakdown of alternative bunker fuels for green shipping corridors.
            </p>
          </div>
          <span className="text-[11px] text-amber-700 font-mono font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            * All figures represent calibrated simulation models
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50/60">
                <th className="py-2.5 px-3">Fuel Pathway</th>
                <th className="py-2.5 px-3">Well-to-Wake (gCO₂e/MJ)</th>
                <th className="py-2.5 px-3">Voyage Cost Index</th>
                <th className="py-2.5 px-3">Corridor Availability</th>
                <th className="py-2.5 px-3">Tech Readiness Level</th>
                <th className="py-2.5 px-3">Operational Suitability & Safety</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {fuels.map((fuel) => {
                const isSelected = activeFuel === fuel.id;
                const gPerMJ = Math.round((fuel.wellToWakeEmissionsKgPerTonne / (fuel.energyDensityMJkg * 1000)) * 1000);

                return (
                  <tr
                    key={fuel.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: fuel.color }}
                        />
                        {fuel.id}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{fuel.name}</span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className={fuel.lifecycleReductionPct > 50 ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                        {gPerMJ} gCO₂e/MJ
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ({fuel.wellToWakeEmissionsKgPerTonne} kg/tonne)
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className="text-slate-900 font-bold">
                        ₹{(fuel.baseCostPerTonneINR / 1000).toFixed(0)}k / tonne
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {fuel.id === 'Marine Diesel' ? '1.0x baseline' : `${(fuel.baseCostPerTonneINR / 58000).toFixed(2)}x baseline`}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold">{fuel.globalAvailabilityPct}%</span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-600 rounded-full"
                            style={{ width: `${fuel.globalAvailabilityPct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {fuel.globalAvailabilityPct > 50 ? 'Major Hubs Ready' : 'Corridor Dependent'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className="text-sky-800 font-bold">TRL {fuel.infrastructureTRL} / 9</span>
                      <span className="text-[10px] text-slate-500 block">
                        {fuel.infrastructureTRL >= 8 ? 'Commercial Fleet' : fuel.infrastructureTRL >= 6 ? 'Pilot / Dual-Fuel' : 'R&D Demonstration'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-800 font-semibold block">{fuel.bunkeringComplexity}</span>
                      <span className="text-[10px] text-slate-600 leading-normal block">
                        {fuel.id === 'Methanol'
                          ? 'Liquid at ambient temp; straightforward bunkering retrofit'
                          : fuel.id === 'LNG'
                          ? 'Requires -162°C cryogenic tanks; established supply chains'
                          : fuel.id === 'Ammonia'
                          ? 'Zero carbon but toxicity protocols & NOx abatement needed'
                          : fuel.id === 'Hydrogen'
                          ? 'Volumetric storage challenge (-253°C or 700 bar fuel cells)'
                          : 'High sulfur legacy fuel; IMO 2020 scrubbers required'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {isSelected ? (
                        <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded font-mono">
                          Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectFuel(fuel.id);
                            onNavigateTab('optimisation');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors"
                        >
                          Optimize
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Explainable Callout */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="text-slate-900 font-bold">Maritime Decarbonisation Insight: </span>
            While Green Hydrogen offers 93% emission reduction, its low volumetric energy density requires 4.2x larger storage tanks compared to diesel. For short-to-medium container corridors (JNPT Mumbai to Singapore), <strong className="text-emerald-800">E-Methanol</strong> and <strong className="text-sky-800">Dual-Fuel LNG</strong> provide the most pragmatic Pareto trade-off between retrofitting capex, cargo space preservation, and corridor bunkering availability.
          </div>
        </div>
      </div>
    </div>
  );
};
