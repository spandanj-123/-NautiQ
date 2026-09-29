import React, { useState } from 'react';
import {
  CandidateSolution,
  OptimisationParams,
  PortNode,
  ScenarioPreset,
  FuelType,
} from '../types/maritime';
import { computeScenarioComparison } from '../utils/optimisationEngine';
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Anchor,
  Compass,
  ArrowRight,
  TrendingUp,
  CloudRain,
  Flame,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Props {
  selectedPlan: CandidateSolution;
  params: OptimisationParams;
  setParams: React.Dispatch<React.SetStateAction<OptimisationParams>>;
  onRunOptimisation: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ScenarioAnalysisView: React.FC<Props> = ({
  selectedPlan,
  params,
  setParams,
  onRunOptimisation,
  onNavigateTab,
}) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioPreset>('Normal Weather');
  const [selectedMetric, setSelectedMetric] = useState<'cost' | 'fuel' | 'emissions' | 'reliability'>('cost');

  const scenarios: ScenarioPreset[] = [
    'Normal Weather',
    'Bad Weather',
    'Fuel Price Increase',
    'Demand Increase',
    'Port Delay',
  ];

  const scenarioData = computeScenarioComparison(
    selectedPlan,
    params.routeDistanceNM,
    params.vesselType,
    params.fuelPriceINRPerTonne,
    params.shorePowerAvailability
  );
  const activeScenarioImpact = scenarioData.find((s) => s.scenario === activeScenario) || scenarioData[0];

  // Port infrastructure checks for Module 4
  const togglePortFuel = (portId: string, fuel: FuelType) => {
    setParams((prev) => ({
      ...prev,
      ports: prev.ports.map((p) =>
        p.id === portId
          ? {
              ...p,
              fuelsAvailable: {
                ...p.fuelsAvailable,
                [fuel]: !p.fuelsAvailable[fuel],
              },
            }
          : p
      ),
    }));
  };

  const toggleShorePower = (portId: string) => {
    setParams((prev) => ({
      ...prev,
      ports: prev.ports.map((p) =>
        p.id === portId ? { ...p, shorePowerAvailable: !p.shorePowerAvailable } : p
      ),
    }));
  };

  // Intermediate ports (Port B Colombo, Port C Port Klang)
  const intermediatePorts = params.ports.slice(1, -1);
  const missingPorts = intermediatePorts.filter((p) => !p.fuelsAvailable[selectedPlan.fuelType]);
  const hasInfrastructureConstraint = missingPorts.length > 0;

  // Feasible alternative fuel fallback
  const allCorridorFuels: FuelType[] = ['LNG', 'Methanol', 'Marine Diesel'];
  const recommendedAlternativeFuel: FuelType =
    allCorridorFuels.find((f) => params.ports.every((p) => p.fuelsAvailable[f])) || 'Marine Diesel';

  const fuelsToDisplay: FuelType[] = ['LNG', 'Methanol', 'Hydrogen', 'Ammonia'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Module 4 & 5 — Infrastructure & Uncertainty Stress Testing
            </h2>
            <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono font-medium">Dynamic Simulation</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Audit corridor bunkering bottlenecks across 4 major ports and simulate operational resilience against weather degradation, bunker price shocks, cargo spikes, and berth congestion.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRunOptimisation}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            Re-run Stress Annealing
          </button>
        </div>
      </div>

      {/* MODULE 4: INFRASTRUCTURE-AWARE FUEL SELECTION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Module 4: 4-Port Corridor Bunkering Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Route: Port A (JNPT) → Port B (Colombo) → Port C (Port Klang) → Port D (Singapore)
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Interactive: Click port checkmarks to test constraint detection
          </span>
        </div>

        {/* Infrastructure Constraint Alert */}
        {hasInfrastructureConstraint ? (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Fuel infrastructure constraint detected
                </h4>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                  Selected fuel <strong className="text-slate-900">{selectedPlan.fuelType}</strong> is unavailable at intermediate transshipment hub{' '}
                  <strong className="text-amber-900 font-bold">
                    {missingPorts.map((p) => `${p.name} (${p.code})`).join(', ')}
                  </strong>
                  .
                </p>
                <p className="text-xs text-emerald-800 mt-1 font-semibold">
                  → Engine recommendation: Fallback to feasible fuel{' '}
                  <strong className="text-slate-900 underline">{recommendedAlternativeFuel}</strong> or configure dual-fuel reserve.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setParams((prev) => ({ ...prev, alternativeFuel: recommendedAlternativeFuel }));
                onRunOptimisation();
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shrink-0 transition-colors shadow-2xs"
            >
              Switch to {recommendedAlternativeFuel}
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-center gap-2.5 text-xs text-emerald-900 shadow-2xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              All required corridor ports have verified bunkering readiness for{' '}
              <strong className="text-emerald-950 font-bold">{selectedPlan.fuelType}</strong>. Feasible green corridor pathway confirmed.
            </span>
          </div>
        )}

        {/* Ports Table Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50/60">
                <th className="py-2.5 px-3">Port Node & Role</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3">Berth Turnaround</th>
                <th className="py-2.5 px-3 text-center">LNG</th>
                <th className="py-2.5 px-3 text-center">Methanol</th>
                <th className="py-2.5 px-3 text-center">Hydrogen</th>
                <th className="py-2.5 px-3 text-center">Ammonia</th>
                <th className="py-2.5 px-3 text-center">Shore Power</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {params.ports.map((port, idx) => {
                const isSelectedFuelMissing = !port.fuelsAvailable[selectedPlan.fuelType];

                return (
                  <tr
                    key={port.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelectedFuelMissing ? 'bg-amber-50/60' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-700">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {port.name}
                        <span className="text-[10px] text-slate-500 font-mono">({port.code})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block ml-7">
                        {idx === 0 ? 'Origin Port' : idx === params.ports.length - 1 ? 'Destination Port' : 'Transshipment Hub'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-sans text-slate-700">{port.country}</td>

                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {port.berthDelayHours.toFixed(1)} hrs delay
                    </td>

                    {fuelsToDisplay.map((fuel) => {
                      const avail = port.fuelsAvailable[fuel];
                      const isCurrentFuel = selectedPlan.fuelType === fuel;

                      return (
                        <td key={fuel} className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => togglePortFuel(port.id, fuel)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                              avail
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 hover:text-slate-600'
                            } ${isCurrentFuel && !avail ? 'ring-2 ring-amber-500' : ''}`}
                            title={`Click to toggle ${fuel} at ${port.name}`}
                          >
                            {avail ? 'Ready ✓' : 'None ✗'}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleShorePower(port.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                          port.shorePowerAvailable
                            ? 'bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 hover:text-slate-600'
                        }`}
                        title="Click to toggle shore power"
                      >
                        {port.shorePowerAvailable ? '⚡ Active' : 'Offline'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODULE 5: UNCERTAINTY / SCENARIO ANALYSIS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Module 5: Uncertainty & Stress Scenario Analysis
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Test resilience across weather storms, bunker market shocks, cargo demand spikes, and berth congestion.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedMetric('cost')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedMetric === 'cost' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cost (₹)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('emissions')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedMetric === 'emissions' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CO₂e (t)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('fuel')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedMetric === 'fuel' ? 'bg-white text-orange-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fuel (t)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('reliability')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedMetric === 'reliability' ? 'bg-white text-sky-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reliability (%)
            </button>
          </div>
        </div>

        {/* 5 Scenario Presets Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {scenarios.map((sc) => {
            const isSelected = activeScenario === sc;
            const data = scenarioData.find((s) => s.scenario === sc)!;

            return (
              <button
                key={sc}
                type="button"
                onClick={() => setActiveScenario(sc)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <span className="text-[11px] font-bold text-slate-800 block truncate">{sc}</span>
                <div className="mt-2 text-xs font-mono space-y-0.5">
                  <div className="text-teal-800 font-bold">₹{(data.operatingCostINR / 100000).toFixed(1)}L</div>
                  <div className="text-emerald-700 font-semibold">{data.lifecycleCO2eTonnes.toFixed(1)}t CO₂e</div>
                  <div className="text-sky-700">{data.scheduleReliabilityPct}% rel</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Comparative Horizontal Bar Chart between Scenarios */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold pb-1 border-b border-slate-200">
            <span>Scenario Comparison: {selectedMetric.toUpperCase()}</span>
            <span>Impact Range</span>
          </div>

          {scenarioData.map((sc) => {
            const isSelected = activeScenario === sc.scenario;

            let val = 0;
            let valFormatted = '';
            let maxVal = 1;
            let barColor = 'bg-teal-600';

            if (selectedMetric === 'cost') {
              val = sc.operatingCostINR;
              maxVal = Math.max(...scenarioData.map((s) => s.operatingCostINR));
              valFormatted = `₹${(val / 100000).toFixed(2)} Lakhs`;
              barColor = 'bg-teal-600';
            } else if (selectedMetric === 'emissions') {
              val = sc.lifecycleCO2eTonnes;
              maxVal = Math.max(...scenarioData.map((s) => s.lifecycleCO2eTonnes));
              valFormatted = `${val.toFixed(1)} tonnes CO₂e`;
              barColor = 'bg-emerald-600';
            } else if (selectedMetric === 'fuel') {
              val = sc.fuelConsumptionTonnes;
              maxVal = Math.max(...scenarioData.map((s) => s.fuelConsumptionTonnes));
              valFormatted = `${val.toFixed(1)} tonnes`;
              barColor = 'bg-orange-500';
            } else {
              val = sc.scheduleReliabilityPct;
              maxVal = 100;
              valFormatted = `${val.toFixed(1)}%`;
              barColor = 'bg-sky-600';
            }

            const pct = Math.min(100, Math.max(10, Math.round((val / maxVal) * 100)));

            return (
              <div
                key={sc.scenario}
                onClick={() => setActiveScenario(sc.scenario)}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                  isSelected ? 'bg-white border border-emerald-300 shadow-2xs' : 'hover:bg-white/80'
                }`}
              >
                <div className="flex justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{sc.scenario}</span>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">SELECTED</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-slate-800">{valFormatted}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">{sc.notes}</p>
              </div>
            );
          })}
        </div>

        {/* Selected Scenario Deep-Dive Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Scenario Status</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{activeScenarioImpact.scenario}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{activeScenarioImpact.notes}</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Estimated Voyage Fuel</span>
            <p className="text-sm font-bold font-mono text-orange-600 mt-0.5">
              {activeScenarioImpact.fuelConsumptionTonnes.toFixed(1)} tonnes
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Delta vs Normal: {(activeScenarioImpact.fuelConsumptionTonnes - scenarioData[0].fuelConsumptionTonnes).toFixed(1)}t
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Voyage Opex</span>
            <p className="text-sm font-bold font-mono text-teal-800 mt-0.5">
              ₹{(activeScenarioImpact.operatingCostINR / 100000).toFixed(2)} Lakhs
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Delta: ₹{((activeScenarioImpact.operatingCostINR - scenarioData[0].operatingCostINR) / 100000).toFixed(2)}L
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Schedule Adherence</span>
            <p className="text-sm font-bold font-mono text-sky-800 mt-0.5">
              {activeScenarioImpact.scheduleReliabilityPct.toFixed(1)}% ({activeScenarioImpact.transitHours.toFixed(1)}h)
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Arrival window: {params.requiredArrivalHours}h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
