import React from 'react';
import {
  Flame,
  Leaf,
  IndianRupee,
  Clock,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Anchor,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
} from 'lucide-react';
import { CandidateSolution, OptimisationParams } from '../types/maritime';
import { VESSEL_SPECIFICATIONS, FUEL_SPECIFICATIONS } from '../data/mockData';
import {
  calculateFuelBurn,
  calculateCO2Emissions,
  calculateOperatingCost,
} from '../utils/optimisationEngine';

// Generated image asset
import heroShipImg from '../assets/images/nautiq_vessel_hero_1790601618703.jpg';

interface Props {
  plan: CandidateSolution;
  params: OptimisationParams;
  onNavigateTab: (tab: string) => void;
  onRunOptimisation: () => void;
}

export const DashboardView: React.FC<Props> = ({
  plan,
  params,
  onNavigateTab,
  onRunOptimisation,
}) => {
  const vSpec = VESSEL_SPECIFICATIONS[plan.vesselType];
  const fSpec = FUEL_SPECIFICATIONS[plan.fuelType];

  // Baseline scenario comparison on the exact same vessel, same distance, same cargo/load, same weather, at design speed with Marine Diesel
  const baselineSpeed = vSpec.designSpeedKnots;
  const baselineFuelTons = calculateFuelBurn(
    params.vesselType,
    baselineSpeed,
    params.routeDistanceNM,
    params.weatherCondition,
    'Marine Diesel',
    params.vesselCapacity,
    params.cargoDemand
  );
  const baselineCO2 = calculateCO2Emissions('Marine Diesel', baselineFuelTons);
  const baselineCostResult = calculateOperatingCost(
    params.vesselType,
    baselineSpeed,
    params.routeDistanceNM,
    baselineFuelTons,
    58000,
    params.shorePowerAvailability
  );
  const baselineCost = baselineCostResult.totalOperatingCostINR;

  const costSavingsINR = baselineCost - plan.operatingCostINR;
  const costSavings = baselineCost > 0 ? Math.round((costSavingsINR / baselineCost) * 100) : 0;
  const co2Savings = baselineCO2 - plan.lifecycleCO2eTonnes;
  const emissionsSaved = baselineCO2 > 0 ? Math.round((co2Savings / baselineCO2) * 100) : 0;
  const fuelDeltaTonnes = baselineFuelTons - plan.fuelConsumptionTonnes;
  const fuelDeltaPct = baselineFuelTons > 0 ? Math.round(((baselineFuelTons - plan.fuelConsumptionTonnes) / baselineFuelTons) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-emerald-900">
          <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-bold">NautiQ Decision Engine Active</span>
          <span className="text-emerald-300 hidden sm:inline">|</span>
          <span className="text-slate-700 font-medium">
            Active Plan: <strong className="text-slate-900">{plan.vesselType}</strong> cruising at <strong className="text-emerald-700">{plan.speedKnots} kts</strong> with <strong className="text-slate-900">{plan.fuelType}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('optimisation')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Auto-Suggest Fuel & Speed</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('optimisation')}
            className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2 flex items-center gap-0.5"
          >
            Adjust Inputs <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 5 Main KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Predicted Fuel Consumption */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">1. Predicted Fuel</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900">
              {plan.fuelConsumptionTonnes.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-medium">tonnes</span>
          </div>
          <div className={`flex items-center gap-1.5 mt-2.5 text-xs font-mono font-medium ${fuelDeltaTonnes >= 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{fuelDeltaTonnes >= 0 ? `-${Math.abs(fuelDeltaPct)}%` : `+${Math.abs(fuelDeltaPct)}%`} vs design baseline</span>
          </div>
        </div>

        {/* KPI 2: Estimated CO2e Emissions */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">2. Estimated CO₂e</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-emerald-700">
              {plan.lifecycleCO2eTonnes.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-medium">tonnes</span>
          </div>
          <div className={`flex items-center gap-1.5 mt-2.5 text-xs font-mono font-medium ${emissionsSaved >= 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{emissionsSaved >= 0 ? `-${emissionsSaved}%` : `+${Math.abs(emissionsSaved)}%`} vs diesel baseline</span>
          </div>
        </div>

        {/* KPI 3: Operating Cost */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">3. Operating Cost</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-500 font-mono">₹</span>
            <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900">
              {(plan.operatingCostINR / 100000).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-medium">Lakhs</span>
          </div>
          <div className={`flex items-center gap-1.5 mt-2.5 text-xs font-mono font-medium ${costSavingsINR >= 0 ? 'text-teal-700' : 'text-slate-600'}`}>
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>
              {costSavingsINR >= 0
                ? `-${costSavings}% (₹${(costSavingsINR / 100000).toFixed(2)}L saved)`
                : `+${Math.abs(costSavings)}% (+₹${(Math.abs(costSavingsINR) / 100000).toFixed(2)}L opex)`}
            </span>
          </div>
        </div>

        {/* KPI 4: Schedule Reliability */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">4. Schedule Reliability</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-sky-700">
              {plan.scheduleReliabilityPct.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-mono">
            <span>ETA {plan.transitHours.toFixed(0)}h / window {params.requiredArrivalHours}h</span>
          </div>
        </div>

        {/* KPI 5: Fleet Utilisation */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">5. Fleet Utilisation</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-purple-800">
              {plan.utilizationPct}%
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-mono">
            <span>{params.cargoDemand} / {plan.capacityTEU} {vSpec.unit}</span>
          </div>
        </div>
      </div>

      {/* Hero Visual Section + Corridor Route */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recommended Plan Vessel Showcase */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="relative h-56 sm:h-64 w-full bg-slate-900">
            <img
              src={heroShipImg}
              alt="Hybrid Maritime Vessel"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md text-emerald-800 shadow-sm border border-emerald-200">
                RECOMMENDED DISPATCH PLAN
              </span>
              <span className="text-xs text-slate-900 font-mono font-semibold bg-white/95 px-2.5 py-1 rounded-md shadow-sm border border-slate-200">
                {plan.vesselType} · {plan.capacityTEU} {vSpec.unit}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {plan.vesselType} — {plan.fuelType} Configuration
              </h2>
              <p className="text-xs text-slate-200 mt-1 max-w-xl">
                Operating at {plan.speedKnots} knots hydro-cruising speed along the Indian Ocean corridor.
              </p>
            </div>
          </div>

          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 bg-slate-50/60">
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold">Fuel Selection</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{plan.fuelType}</p>
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                {emissionsSaved >= 0 ? `-${emissionsSaved}% CO₂ vs diesel` : `+${Math.abs(emissionsSaved)}% CO₂`}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold">Cruising Speed</p>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">{plan.speedKnots} kts</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Design: {vSpec.designSpeedKnots} kts</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold">Transit Time</p>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">{plan.transitHours.toFixed(1)} hrs</p>
              <p className="text-[10px] text-sky-700 font-medium mt-0.5">Buffer: +{(params.requiredArrivalHours - plan.transitHours).toFixed(1)} hrs</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold">Pareto Status</p>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                {plan.archetype || 'Balanced Pareto'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Rank 1/250 states</p>
            </div>
          </div>
        </div>

        {/* Right Column: Route Corridor & Infrastructure Bunkering Status */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">4-Port Corridor Infrastructure</h3>
                <p className="text-xs text-slate-500">Voyage: JNPT Mumbai → Singapore ({params.routeDistanceNM} NM)</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('routes')}
                  className="text-xs text-emerald-800 hover:text-emerald-900 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 transition-colors"
                >
                  Best Route →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('scenarios')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Port Matrix →
                </button>
              </div>
            </div>

            {/* Stepper Route */}
            <div className="space-y-3 my-4">
              {params.ports.map((port, idx) => {
                const isStart = idx === 0;
                const isEnd = idx === params.ports.length - 1;
                const fuelAvail = port.fuelsAvailable[plan.fuelType];

                return (
                  <div key={port.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        isStart || isEnd
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </div>
                      {idx < params.ports.length - 1 && (
                        <div className="w-0.5 h-8 bg-slate-200 my-0.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200/90 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {port.name} <span className="text-slate-500 font-normal">({port.code})</span>
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {fuelAvail ? (
                            <span className="text-emerald-700 flex items-center gap-1 font-mono font-medium">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {plan.fuelType}
                            </span>
                          ) : (
                            <span className="text-amber-700 flex items-center gap-1 font-mono font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> No Bunkering
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span>Berth delay: {port.berthDelayHours}h</span>
                        <span>·</span>
                        <span className={port.shorePowerAvailable ? 'text-teal-700 font-medium' : 'text-slate-500'}>
                          {port.shorePowerAvailable ? '⚡ Shore Power Ready' : 'No Shore Power'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Weather: <strong className="text-slate-700">{params.weatherCondition}</strong></span>
            <button
              type="button"
              onClick={onRunOptimisation}
              className="text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Re-run Annealer
            </button>
          </div>
        </div>
      </div>

      {/* Quick Trade-off Summary */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Why was this plan selected?</h4>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Selected because it provides a lower-emission solution while satisfying cargo demand and the required arrival window. The quantum-inspired search evaluated 250 candidate ship-speed-fuel profiles and determined that <strong className="text-slate-900">{plan.vesselType}</strong> at <strong className="text-emerald-700">{plan.speedKnots} knots</strong> with <strong className="text-slate-900">{plan.fuelType}</strong> delivers optimal balance across cost, lifecycle carbon, and schedule adherence.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('pareto')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
          >
            Explore Pareto Curve
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('fuels')}
            className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            Fuel Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
