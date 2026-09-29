import React, { useState, useMemo } from 'react';
import {
  Play,
  Sparkles,
  Ship,
  Gauge,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  TrendingDown,
  Navigation,
  Compass,
  Zap,
  Leaf,
  IndianRupee,
  Clock,
  Waves,
  Wind,
  Check,
  Flame,
  Award,
} from 'lucide-react';
import {
  OptimisationParams,
  OptimisationRunResult,
  VesselType,
  FuelType,
  WeatherCondition,
  FleetPriorityNeed,
} from '../types/maritime';
import { VESSEL_SPECIFICATIONS, FUEL_SPECIFICATIONS } from '../data/mockData';
import { CORRIDOR_ROUTES } from '../data/routesData';
import { recommendBestFuelAndSpeed } from '../utils/optimisationEngine';

interface Props {
  params: OptimisationParams;
  setParams: React.Dispatch<React.SetStateAction<OptimisationParams>>;
  runResult: OptimisationRunResult | null;
  onRunOptimisation: () => void;
  onLoadDemo: () => void;
  isOptimising: boolean;
  onNavigateTab: (tab: string) => void;
}

export const FleetOptimisationView: React.FC<Props> = ({
  params,
  setParams,
  runResult,
  onRunOptimisation,
  onLoadDemo,
  isOptimising,
  onNavigateTab,
}) => {
  const [resultMode, setResultMode] = useState<'exact' | 'optimized'>('exact');
  const [selectedPriority, setSelectedPriority] = useState<FleetPriorityNeed>('balanced');
  const [showAdvisor, setShowAdvisor] = useState<boolean>(true);

  const vesselTypes: VesselType[] = [
    'Container Ship',
    'Bulk Carrier',
    'Tanker',
    'Feeder Vessel',
  ];

  const fuelTypes: FuelType[] = [
    'Marine Diesel',
    'LNG',
    'Methanol',
    'Hydrogen',
    'Ammonia',
  ];

  const weatherOptions: WeatherCondition[] = [
    'Calm (Beaufort 0-2)',
    'Moderate (Beaufort 3-5)',
    'Severe / Rough (Beaufort 6+)',
  ];

  // Dynamic automatic suggestion for best fuel and speed based on user's priority
  const recommendation = useMemo(
    () => recommendBestFuelAndSpeed(params, selectedPriority),
    [params, selectedPriority]
  );

  const isRecommendationActive =
    params.alternativeFuel === recommendation.recommendedFuel &&
    params.cruisingSpeedKnots === recommendation.recommendedSpeedKnots;

  const handleApplyRecommendation = (recFuel?: FuelType, recSpeed?: number) => {
    const fuel: FuelType = recFuel || recommendation.recommendedFuel;
    const speed = recSpeed || recommendation.recommendedSpeedKnots;
    const spec = FUEL_SPECIFICATIONS[fuel];

    setParams((prev) => ({
      ...prev,
      alternativeFuel: fuel,
      cruisingSpeedKnots: speed,
      fuelPriceINRPerTonne: spec.baseCostPerTonneINR,
    }));
    setResultMode('exact');
  };

  const handleVesselChange = (type: VesselType) => {
    const spec = VESSEL_SPECIFICATIONS[type];
    setParams((prev) => ({
      ...prev,
      vesselType: type,
      vesselCapacity: spec.defaultCapacity,
      cruisingSpeedKnots: spec.designSpeedKnots,
    }));
  };

  const handleAlternativeFuelChange = (fuel: FuelType) => {
    const spec = FUEL_SPECIFICATIONS[fuel];
    setParams((prev) => ({
      ...prev,
      alternativeFuel: fuel,
      fuelPriceINRPerTonne: spec.baseCostPerTonneINR,
    }));
  };

  // Extract both the exact user solution (strictly honoring every input)
  // and the quantum-annealed recommended tuning
  const exactPlan = runResult?.exactUserSolution;
  const aiPlan = runResult?.selectedSolution;

  // Active plan shown depends on user's active view tab (Exact vs AI Tuned)
  const activePlan = (resultMode === 'exact' && exactPlan) ? exactPlan : (aiPlan || exactPlan);

  const isOverloaded = params.cargoDemand > params.vesselCapacity;
  const currentVesselSpec = VESSEL_SPECIFICATIONS[params.vesselType];
  const currentFuelSpec = FUEL_SPECIFICATIONS[params.alternativeFuel];

  // Best Route detection from routes data for the corridor
  const activeCorridor = CORRIDOR_ROUTES[0];
  const bestRoute = activeCorridor.routes.find((r) => r.isRecommendedBest) || activeCorridor.routes[0];
  const isCurrentDistanceBestRoute = params.routeDistanceNM === bestRoute.distanceNM;

  const handleApplyBestRoute = () => {
    setParams((prev) => ({
      ...prev,
      routeDistanceNM: bestRoute.distanceNM,
      weatherCondition:
        bestRoute.weatherRisk === 'Low'
          ? 'Calm (Beaufort 0-2)'
          : bestRoute.weatherRisk === 'Moderate'
          ? 'Moderate (Beaufort 3-5)'
          : 'Severe / Rough (Beaufort 6+)',
    }));
  };

  const handleAdoptAiSpeed = () => {
    if (aiPlan) {
      setParams((prev) => ({
        ...prev,
        cruisingSpeedKnots: aiPlan.speedKnots,
      }));
      setResultMode('exact');
    }
  };

  const priorityOptions: { id: FleetPriorityNeed; label: string; icon: string; desc: string }[] = [
    { id: 'balanced', label: 'Balanced Optimal', icon: '⚖️', desc: 'Best trade-off between cost, emissions & schedule' },
    { id: 'min_cost', label: 'Lowest Cost', icon: '💰', desc: 'Minimise total voyage OPEX while meeting deadline' },
    { id: 'min_emissions', label: 'Maximum Green', icon: '🌿', desc: 'Deep decarbonisation for IMO 2030 compliance' },
    { id: 'fastest_arrival', label: 'Fastest Arrival', icon: '⚡', desc: 'Expedited sailing with maximum on-time buffer' },
  ];

  return (
    <div className="space-y-6">
      {/* View Header with Explanation & Demo Mode Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Module 1 — Fleet & Fuel Co-Optimisation</h2>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Live Interactive Physics
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Every choice you make below directly updates fuel burn, lifecycle emissions, voyage cost, and schedule reliability in real-time. NautiQ models hydrodynamic resistance, engine specific fuel consumption, and weather drag for your selected ship.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Load Demo Scenario</span>
          </button>
          <button
            type="button"
            disabled={isOptimising}
            onClick={onRunOptimisation}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isOptimising ? 'animate-spin' : ''}`} />
            <span>{isOptimising ? 'Evaluating 250 Candidates...' : 'RUN OPTIMISATION'}</span>
          </button>
        </div>
      </div>

      {/* AUTOMATIC AI DECISION ADVISOR: "Suggest Best Fuel & Speed According to My Needs" */}
      <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  AI Automatic Advisor — Best Fuel & Speed for Your Needs
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-mono">
                  Autonomous Solver
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Tell NautiQ your operational priority below. The engine evaluates all 5 fuels and speeds for your ship to recommend the optimal configuration.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvisor(!showAdvisor)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 underline self-start sm:self-auto cursor-pointer"
          >
            {showAdvisor ? 'Collapse Advisor' : 'Expand Advisor'}
          </button>
        </div>

        {showAdvisor && (
          <div className="space-y-4">
            {/* Priority Selector Pills */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2">
                Step 1: Select Your Current Voyage Need & Priority:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {priorityOptions.map((opt) => {
                  const isSelected = selectedPriority === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedPriority(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-sm'
                          : 'border-slate-200/80 bg-white/60 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight font-medium">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recommendation Showcase Card */}
            <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-2xs space-y-3.5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Recommended For You:
                  </span>
                  
                  {/* Fuel Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs shadow-2xs">
                    <Flame className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                    <span>Best Fuel: {recommendation.recommendedFuel}</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-medium">
                      (-{FUEL_SPECIFICATIONS[recommendation.recommendedFuel as FuelType]?.lifecycleReductionPct}% CO₂)
                    </span>
                  </div>

                  {/* Speed Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-300 font-bold text-xs shadow-2xs">
                    <Gauge className="w-3.5 h-3.5 text-teal-700" />
                    <span>Best Speed: {recommendation.recommendedSpeedKnots} knots</span>
                  </div>
                </div>

                {/* 1-Click Apply Button */}
                <div className="shrink-0">
                  {isRecommendationActive ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                      Active on Voyage Plan
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyRecommendation()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-700/20 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>Apply {recommendation.recommendedFuel} @ {recommendation.recommendedSpeedKnots} kts</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Natural language explanation */}
              <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                {recommendation.rationale}
              </p>

              {/* Key Drivers & Performance Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">Estimated Cost</span>
                  <span className="text-xs font-bold text-teal-800">
                    ₹{(recommendation.expectedCostINR / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">Well-to-Wake CO₂e</span>
                  <span className="text-xs font-bold text-emerald-700">
                    {recommendation.expectedLifecycleCO2eTonnes}t (-{recommendation.co2ReductionPctVsDiesel}%)
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">Transit Time</span>
                  <span className="text-xs font-bold text-slate-900">
                    {recommendation.expectedTransitHours}h (Deadline {params.requiredArrivalHours}h)
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">Punctuality</span>
                  <span className="text-xs font-bold text-sky-800">
                    {recommendation.expectedReliabilityPct}% Reliability
                  </span>
                </div>
              </div>

              {/* Quick Runner-Up Alternatives */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-500 font-semibold">
                  Or explore runner-up alternatives for this priority:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {recommendation.alternativeOptions.map((alt: { fuel: FuelType; speedKnots: number; costINR: number }) => (
                    <button
                      key={`${alt.fuel}-${alt.speedKnots}`}
                      type="button"
                      onClick={() => handleApplyRecommendation(alt.fuel, alt.speedKnots)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {alt.fuel} @ {alt.speedKnots} kts (₹{(alt.costINR / 100000).toFixed(1)}L)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Parameters Form (Left) & Result Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Voyage & Fleet Operational Parameters</h3>
            </div>
            
            {/* Optimization Scope Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setParams((prev) => ({ ...prev, optimizationMode: 'Selected Vessel & Fuel' }))}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  (params.optimizationMode || 'Selected Vessel & Fuel') === 'Selected Vessel & Fuel'
                    ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Target Selected Vessel
              </button>
              <button
                type="button"
                onClick={() => setParams((prev) => ({ ...prev, optimizationMode: 'Global Fleet Search' }))}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  params.optimizationMode === 'Global Fleet Search'
                    ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Global Fleet Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vessel Type */}
            <div className="sm:col-span-2 bg-slate-50/80 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-emerald-600" />
                  Select Target Vessel Type
                </label>
                <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                  Design: {currentVesselSpec.designSpeedKnots} kts · {currentVesselSpec.defaultCapacity} {currentVesselSpec.unit}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {vesselTypes.map((v) => {
                  const isSelected = params.vesselType === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleVesselChange(v)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 leading-tight">{v}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        {VESSEL_SPECIFICATIONS[v].defaultCapacity} {VESSEL_SPECIFICATIONS[v].unit}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                {currentVesselSpec.description}
              </p>
            </div>

            {/* Cruising Speed Slider */}
            <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  Cruising Speed Setting: <span className="text-emerald-700 font-mono text-sm">{params.cruisingSpeedKnots} knots</span>
                </label>
                <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Hydro Power Factor: {Math.pow(params.cruisingSpeedKnots / currentVesselSpec.designSpeedKnots, 3.2).toFixed(2)}x (P ∝ V³.²)
                </span>
              </div>
              <input
                type="range"
                min={11.0}
                max={22.0}
                step={0.5}
                value={params.cruisingSpeedKnots}
                onChange={(e) => setParams({ ...params, cruisingSpeedKnots: Number(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1.5 font-medium">
                <span>11.0 kts (Super Eco)</span>
                <span className="text-emerald-700 font-bold">Design: {currentVesselSpec.designSpeedKnots} kts</span>
                <span>22.0 kts (High Speed)</span>
              </div>
            </div>

            {/* Target Alternative Fuel Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Target Fuel Type
              </label>
              <select
                value={params.alternativeFuel}
                onChange={(e) => handleAlternativeFuelChange(e.target.value as FuelType)}
                className="w-full bg-white border-2 border-emerald-300 focus:border-emerald-600 rounded-lg px-3 py-2 text-sm text-emerald-900 font-bold outline-none transition-all cursor-pointer shadow-2xs"
              >
                {fuelTypes.map((f) => (
                  <option key={f} value={f}>
                    {f} ({FUEL_SPECIFICATIONS[f].lifecycleReductionPct > 0 ? `-${FUEL_SPECIFICATIONS[f].lifecycleReductionPct}% CO₂` : 'Baseline MGO'})
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Price (₹ / tonne) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  {params.alternativeFuel} Price (₹ / tonne)
                </label>
                <button
                  type="button"
                  onClick={() => setParams((prev) => ({ ...prev, fuelPriceINRPerTonne: currentFuelSpec.baseCostPerTonneINR }))}
                  className="text-[10px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                >
                  Reset: ₹{(currentFuelSpec.baseCostPerTonneINR / 1000).toFixed(0)}k
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={20000}
                  max={300000}
                  step={1000}
                  value={params.fuelPriceINRPerTonne}
                  onChange={(e) => setParams({ ...params, fuelPriceINRPerTonne: Math.max(1000, Number(e.target.value)) })}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono tabular-nums outline-none transition-all"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">₹/t</span>
              </div>
            </div>

            {/* Cargo Demand */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Cargo Demand ({currentVesselSpec.unit})
                </label>
                {isOverloaded && (
                  <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Exceeds capacity
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={100}
                  max={60000}
                  step={50}
                  value={params.cargoDemand}
                  onChange={(e) => setParams({ ...params, cargoDemand: Math.max(0, Number(e.target.value)) })}
                  className={`w-full bg-white border ${
                    isOverloaded ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-500/20' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/30'
                  } rounded-lg px-3 py-2 text-sm text-slate-900 font-mono tabular-nums outline-none transition-all`}
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                  {currentVesselSpec.unit}
                </span>
              </div>
            </div>

            {/* Vessel Capacity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Vessel Capacity ({currentVesselSpec.unit})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={500}
                  max={70000}
                  step={100}
                  value={params.vesselCapacity}
                  onChange={(e) => setParams({ ...params, vesselCapacity: Math.max(100, Number(e.target.value)) })}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono tabular-nums outline-none transition-all"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                  {currentVesselSpec.unit}
                </span>
              </div>
            </div>

            {/* Route Distance */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Corridor Distance (Nautical Miles)
                </label>
                <button
                  type="button"
                  onClick={handleApplyBestRoute}
                  className="text-[10px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                  title="Apply recommended eco-weather corridor distance"
                >
                  Set Best: {bestRoute.distanceNM} NM
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={100}
                  max={15000}
                  step={20}
                  value={params.routeDistanceNM}
                  onChange={(e) => setParams({ ...params, routeDistanceNM: Math.max(50, Number(e.target.value)) })}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono tabular-nums outline-none transition-all"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">NM</span>
              </div>
            </div>

            {/* Required Arrival Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Required Arrival Deadline (Hours)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={24}
                  max={500}
                  step={4}
                  value={params.requiredArrivalHours}
                  onChange={(e) => setParams({ ...params, requiredArrivalHours: Math.max(12, Number(e.target.value)) })}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono tabular-nums outline-none transition-all"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">Hours</span>
              </div>
            </div>

            {/* Weather Condition */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Corridor Weather State
              </label>
              <select
                value={params.weatherCondition}
                onChange={(e) => setParams({ ...params, weatherCondition: e.target.value as WeatherCondition })}
                className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none transition-all cursor-pointer font-medium"
              >
                {weatherOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Shore Power (Cold Ironing) */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <div>
                <span className="text-xs font-bold text-slate-800">Shore Power (Cold Ironing)</span>
                <p className="text-[10px] text-slate-500 font-medium">Zero auxiliary diesel burn while berthed</p>
              </div>
              <input
                type="checkbox"
                checked={params.shorePowerAvailability}
                onChange={(e) => setParams({ ...params, shorePowerAvailability: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={isOptimising}
              onClick={onRunOptimisation}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              <Play className={`w-4 h-4 fill-current ${isOptimising ? 'animate-spin' : ''}`} />
              <span>{isOptimising ? 'Evaluating 250 combinatorial states...' : 'RUN DEEP OPTIMISATION (QUBO SEARCH)'}</span>
            </button>
          </div>
        </div>

        {/* Result Card & Guidance (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {activePlan ? (
            <div className="rounded-2xl border-2 border-emerald-300 bg-white p-6 space-y-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

              {/* Status Banner & Mode Toggle */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setResultMode('exact')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      resultMode === 'exact'
                        ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Your Selected Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultMode('optimized')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      resultMode === 'optimized'
                        ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    AI-Tuned Plan
                  </button>
                </div>

                <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {runResult?.candidatesEvaluatedCount || 250} states evaluated
                </span>
              </div>

              {/* Recommended Plan Heading */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                    {resultMode === 'exact' ? 'User-Selected Plan' : 'AI-Optimised Recommendation'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    Mode: {params.optimizationMode || 'Targeted'}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">
                  {activePlan.vesselType} · {activePlan.fuelType}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Cruising at <strong className="text-emerald-700 font-mono">{activePlan.speedKnots} knots</strong> for {params.routeDistanceNM} NM
                </p>
              </div>

              {/* AI Speed Recommendation Callout if in exact mode and difference exists */}
              {resultMode === 'exact' && aiPlan && Math.abs(aiPlan.speedKnots - params.cruisingSpeedKnots) >= 0.5 && (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-900">AI Speed Recommendation:</span>
                    <p className="text-[11px] text-slate-700 mt-0.5">
                      {activePlan.operatingCostINR > aiPlan.operatingCostINR ? (
                        <>
                          Tuning speed to <strong className="font-mono text-emerald-800">{aiPlan.speedKnots} kts</strong> saves ₹{((activePlan.operatingCostINR - aiPlan.operatingCostINR) / 100000).toFixed(2)} Lakhs net opex while arriving in {aiPlan.transitHours.toFixed(1)}h.
                        </>
                      ) : (
                        <>
                          Sailing at <strong className="font-mono text-emerald-800">{aiPlan.speedKnots} kts</strong> expedites arrival to {aiPlan.transitHours.toFixed(1)}h (+₹{((aiPlan.operatingCostINR - activePlan.operatingCostINR) / 100000).toFixed(2)} Lakhs opex).
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAdoptAiSpeed}
                    className="shrink-0 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer"
                  >
                    Adopt Speed
                  </button>
                </div>
              )}

              {/* Core Output Metrics Table */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Vessel:</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{activePlan.vesselType}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {activePlan.capacityTEU} {VESSEL_SPECIFICATIONS[activePlan.vesselType].unit} cap
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Speed & ETA:</span>
                  <p className="text-sm font-bold font-mono text-emerald-700 mt-0.5">
                    {activePlan.speedKnots} knots
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ETA: {activePlan.transitHours.toFixed(1)} hrs
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Fuel Choice:</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{activePlan.fuelType}</p>
                  <span className="text-[10px] text-emerald-700 font-semibold font-mono">
                    -{FUEL_SPECIFICATIONS[activePlan.fuelType].lifecycleReductionPct}% CO₂ reduction
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Fuel Consumption:</span>
                  <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {activePlan.fuelConsumptionTonnes.toFixed(1)} tonnes
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {((activePlan.fuelConsumptionTonnes / (params.routeDistanceNM / (activePlan.speedKnots * 24)))).toFixed(1)} t/day
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Estimated CO₂e:</span>
                  <p className="text-sm font-bold font-mono text-emerald-700 mt-0.5">
                    {activePlan.lifecycleCO2eTonnes.toFixed(1)} tonnes
                  </p>
                  <span className="text-[10px] text-slate-500">Well-to-Wake Lifecycle</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Operating Cost:</span>
                  <p className="text-sm font-bold font-mono text-teal-800 mt-0.5">
                    ₹{(activePlan.operatingCostINR / 100000).toFixed(2)} Lakhs
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ₹{(activePlan.operatingCostINR / params.routeDistanceNM).toFixed(0)}/NM
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">Schedule Reliability:</span>
                    <span className="text-xs text-slate-500 font-mono">
                      Window: {params.requiredArrivalHours}h (Buffer: {(params.requiredArrivalHours - activePlan.transitHours).toFixed(1)}h)
                    </span>
                  </div>
                  <span className="text-base font-extrabold font-mono text-sky-800">
                    {activePlan.scheduleReliabilityPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Constraint Warning if any */}
              {activePlan.constraintViolations.length > 0 && (
                <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Operational Constraint Warning
                  </div>
                  {activePlan.constraintViolations.map((v) => (
                    <p key={v} className="text-[11px]">• {v}</p>
                  ))}
                </div>
              )}

              {/* Explainable Why This Solution Was Selected */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Physics & Operational Explanation:</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Dispatch calculated for <strong className="text-slate-900">{activePlan.vesselType}</strong> powered by <strong className="text-slate-900">{activePlan.fuelType}</strong> at <strong className="text-slate-900">{activePlan.speedKnots} knots</strong> across {params.routeDistanceNM} NM under {params.weatherCondition}.
                </p>
                <div className="mt-2.5 space-y-1 text-[11px] text-slate-600 font-medium">
                  <p>• Hydrodynamic power scale factor: {Math.pow(activePlan.speedKnots / currentVesselSpec.designSpeedKnots, 3.2).toFixed(2)}x design baseline resistance.</p>
                  <p>• Capacity utilization: {activePlan.utilizationPct}% ({params.cargoDemand} / {activePlan.capacityTEU} {currentVesselSpec.unit}).</p>
                  <p>• Arrival ETA of {activePlan.transitHours.toFixed(1)}h gives {(params.requiredArrivalHours - activePlan.transitHours).toFixed(1)}h safety margin against deadline.</p>
                </div>
              </div>

              {/* Quick links */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => onNavigateTab('pareto')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  View on Pareto Chart <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('fuels')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Fuel Comparison <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center flex flex-col items-center justify-center min-h-[400px] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                <Ship className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Loading Fleet State...</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
                Evaluating candidate ship-speed-fuel states.
              </p>
            </div>
          )}

          {/* Dedicated Best Route Guidance Card for the Fleet */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-mono">
                    NAVIGATIONAL ADVISOR
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    Best Route for This Ship: {bestRoute.name}
                  </h4>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                {bestRoute.distanceNM} NM
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {bestRoute.summaryRationale}
            </p>

            <div className="grid grid-cols-3 gap-2 bg-white/90 p-3 rounded-xl border border-emerald-200 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">Current Assist</span>
                <span className="text-xs font-bold text-emerald-700 font-mono">+{bestRoute.oceanCurrentEffectKnots} kts</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">Wave Swell</span>
                <span className="text-xs font-bold text-slate-900 font-mono">{bestRoute.significantWaveHeightMeters}m (Calm)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">Schedule Adherence</span>
                <span className="text-xs font-bold text-sky-700 font-mono">{bestRoute.scheduleReliabilityPct}%</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleApplyBestRoute}
                disabled={isCurrentDistanceBestRoute}
                className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-100 disabled:text-emerald-800 disabled:cursor-default"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isCurrentDistanceBestRoute ? 'Best Route Distance Active' : 'Adopt Best Route (2,120 NM)'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('routes')}
                className="w-full sm:w-auto text-xs text-emerald-800 hover:text-emerald-900 font-bold flex items-center justify-center gap-1 cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-emerald-100/70 transition-colors"
              >
                <span>Open Full Route Chart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
