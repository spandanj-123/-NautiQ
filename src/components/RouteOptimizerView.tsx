import React, { useState, useMemo } from 'react';
import {
  MaritimeRouteOption,
  CorridorDefinition,
  OptimisationParams,
  CandidateSolution,
  RouteWaypoint,
} from '../types/maritime';
import { CORRIDOR_ROUTES } from '../data/routesData';
import { FUEL_SPECIFICATIONS, VESSEL_SPECIFICATIONS } from '../data/mockData';
import {
  calculateFuelBurn,
  calculateCO2Emissions,
  calculateOperatingCost,
} from '../utils/optimisationEngine';
import {
  Compass,
  Navigation,
  Wind,
  Waves,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Clock,
  IndianRupee,
  Leaf,
  Flame,
  ShieldCheck,
  MapPin,
  Sparkles,
  Info,
  Layers,
  Eye,
  Crosshair,
  Anchor,
  FileText,
  Ship,
  Check,
  CloudSun,
  CloudRain,
  Sun,
  Thermometer,
  Gauge,
  Activity,
  CloudLightning,
  Droplets,
  Umbrella,
  AlertOctagon,
} from 'lucide-react';

interface Props {
  params: OptimisationParams;
  setParams: React.Dispatch<React.SetStateAction<OptimisationParams>>;
  selectedPlan: CandidateSolution;
  onNavigateTab: (tab: string) => void;
  onAdoptRoute?: (route: MaritimeRouteOption) => void;
}

export const RouteOptimizerView: React.FC<Props> = ({
  params,
  setParams,
  selectedPlan,
  onNavigateTab,
  onAdoptRoute,
}) => {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('corridor-jnpt-singapore');
  const activeCorridor = CORRIDOR_ROUTES.find((c) => c.id === selectedCorridorId) || CORRIDOR_ROUTES[0];
  
  // Default selected route is the recommended best route
  const defaultBest = activeCorridor.routes.find((r) => r.isRecommendedBest) || activeCorridor.routes[0];
  const [selectedRouteId, setSelectedRouteId] = useState<string>(defaultBest.id);
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number>(0);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<RouteWaypoint | null>(null);

  // ECDIS Chart Layer Toggles
  const [showRadarRain, setShowRadarRain] = useState<boolean>(true);
  const [showCurrents, setShowCurrents] = useState<boolean>(true);
  const [showWaves, setShowWaves] = useState<boolean>(true);
  const [showWindVectors, setShowWindVectors] = useState<boolean>(true);
  const [showBathymetry, setShowBathymetry] = useState<boolean>(true);
  const [showTSS, setShowTSS] = useState<boolean>(true);
  const [showWaypoints, setShowWaypoints] = useState<boolean>(true);

  // Active view tab for bottom telemetry: 'area_scanner' | 'weather_timeline' | 'waypoint_log' | 'comparison'
  const [telemetryTab, setTelemetryTab] = useState<'area_scanner' | 'weather_timeline' | 'waypoint_log' | 'comparison'>('area_scanner');

  // Mouse coordinate & weather tracker for realistic ECDIS readout
  const [cursorTelemetry, setCursorTelemetry] = useState<{
    lat: string;
    lon: string;
    depth: string;
    wind: string;
    rain: string;
    swell: string;
    temp: string;
  }>({
    lat: "07°42.4'N",
    lon: "084°18.6'E",
    depth: '3,450m Abyssal Plain',
    wind: '14 kts WSW (Gusts 18)',
    rain: '15% Chance (0.1 mm/h)',
    swell: '1.8m @ 8.2s',
    temp: '29.4°C SST',
  });

  // Dynamically compute route metrics using active vessel, speed, cargo load, fuel, and price
  const routeCalculations = useMemo(() => {
    return activeCorridor.routes.map((route) => {
      // Speed through water accounting for ocean current effect
      const stw = Math.max(9.0, params.cruisingSpeedKnots - route.oceanCurrentEffectKnots);
      const weatherRiskStr =
        route.weatherRisk === 'Low'
          ? 'Calm (Beaufort 0-2)'
          : route.weatherRisk === 'Moderate'
          ? 'Moderate (Beaufort 3-5)'
          : 'Severe / Rough (Beaufort 6+)';

      const fuelTons = calculateFuelBurn(
        params.vesselType,
        stw,
        route.distanceNM,
        weatherRiskStr,
        params.alternativeFuel,
        params.vesselCapacity,
        params.cargoDemand
      );
      const co2Tonnes = calculateCO2Emissions(params.alternativeFuel, fuelTons);
      const costResult = calculateOperatingCost(
        params.vesselType,
        params.cruisingSpeedKnots,
        route.distanceNM,
        fuelTons,
        params.fuelPriceINRPerTonne,
        params.shorePowerAvailability
      );

      return {
        ...route,
        fuelConsumptionTonnes: Math.round(fuelTons * 10) / 10,
        lifecycleCO2eTonnes: Math.round(co2Tonnes * 10) / 10,
        operatingCostINR: costResult.totalOperatingCostINR,
        transitHours: Math.round(costResult.transitHours * 10) / 10,
      };
    });
  }, [activeCorridor.routes, params]);

  const selectedRoute = routeCalculations.find((r) => r.id === selectedRouteId) || routeCalculations[0];
  const bestRoute = routeCalculations.find((r) => r.isRecommendedBest) || routeCalculations[0];
  const isCurrentRouteAdopted = params.routeDistanceNM === selectedRoute.distanceNM;

  // Active inspected waypoint for the specific area weather inspector
  const inspectedWp = selectedRoute.waypoints[selectedWaypointIndex] || selectedRoute.waypoints[0];

  // Direct comparison reference (usually Great Circle Direct track)
  const directRoute = routeCalculations.find((r) => r.category === 'Direct Great Circle') || routeCalculations[1];
  const fuelSavingsTons = Math.max(0, Math.round((directRoute.fuelConsumptionTonnes - selectedRoute.fuelConsumptionTonnes) * 10) / 10);
  const costSavingsINR = directRoute.operatingCostINR - selectedRoute.operatingCostINR;

  const handleAdoptRoute = (route: MaritimeRouteOption) => {
    setParams((prev) => ({
      ...prev,
      routeDistanceNM: route.distanceNM,
      weatherCondition:
        route.weatherRisk === 'Low'
          ? 'Calm (Beaufort 0-2)'
          : route.weatherRisk === 'Moderate'
          ? 'Moderate (Beaufort 3-5)'
          : 'Severe / Rough (Beaufort 6+)',
    }));

    if (onAdoptRoute) {
      onAdoptRoute(route);
    }
  };

  const handleMouseMoveChart = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;

    // Approximate geographic interpolation for Indian Ocean / Malacca chart
    const latDeg = Math.round((20.0 - yPct * 20.0) * 10) / 10;
    const lonDeg = Math.round((70.0 + xPct * 35.0) * 10) / 10;
    const depth = yPct > 0.65 ? '3,800m Abyssal Plain' : yPct < 0.25 ? '45m Continental Shelf' : '2,600m Deep Basin';
    const windSpeed = Math.round(10 + Math.sin(xPct * Math.PI) * 6);
    const gust = windSpeed + 4;
    const waveH = (1.2 + yPct * 0.9).toFixed(1);
    
    // Check if cursor is over coastal squall sector
    const isCoastalSquallArea = xPct > 0.18 && xPct < 0.38 && yPct > 0.45 && yPct < 0.72;
    const rainText = isCoastalSquallArea
      ? '78% High Rain Chance (18.5 mm/h Squall)'
      : `${Math.round(10 + xPct * 12)}% Rain Chance (Light)`;

    setCursorTelemetry({
      lat: `${latDeg.toFixed(1)}°N`,
      lon: `${lonDeg.toFixed(1)}°E`,
      depth,
      wind: `${windSpeed} kts (Gusts ${gust})`,
      rain: rainText,
      swell: `${waveH}m @ 7.8s`,
      temp: `${(28.5 + xPct * 1.8).toFixed(1)}°C SST`,
    });
  };

  const weatherSum = selectedRoute.weatherSummary || {
    avgWindSpeedKnots: 13.0,
    maxWindGustKnots: 20.0,
    predominantWindDir: 'WSW',
    meanSignificantWaveHeightM: selectedRoute.significantWaveHeightMeters,
    maxWaveHeightM: selectedRoute.significantWaveHeightMeters + 0.4,
    seaSurfaceTempAvgC: 29.4,
    weatherResistancePenaltyPct: 3.5,
    stormRiskLevel: selectedRoute.weatherRisk,
    heavyRainZoneCount: 0,
    maxRainIntensityMmHr: 1.1,
    maxRainProbabilityPct: 25,
    lowestVisibilityNM: 9.0,
  };

  const getWeatherIcon = (iconType?: string) => {
    switch (iconType) {
      case 'clear':
        return <Sun className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'partly_cloudy':
        return <CloudSun className="w-4 h-4 text-sky-500 shrink-0" />;
      case 'rain':
        return <CloudRain className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'squall':
        return <CloudLightning className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <CloudSun className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Professional Maritime ECDIS Operations Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Navigation className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Electronic Chart Display & Information System (ECDIS) Weather Router
            </h2>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono font-semibold">
              IMO MSC.232(82) Standard Compatible
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Multi-track voyage optimizer integrating whole-trip NOAA WaveWatch-III swell data, live Doppler precipitation radar, heavy rainfall probabilities, wind speed gusts, and added wave drag.
          </p>
        </div>

        {/* Corridor Selector & Active Ship Context */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono">
            <Ship className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-700 font-semibold">{selectedPlan.vesselType}</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-700 font-bold">{selectedPlan.fuelType}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">{selectedPlan.speedKnots} kts</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Corridor:</label>
            <select
              value={selectedCorridorId}
              onChange={(e) => {
                setSelectedCorridorId(e.target.value);
                const newCorr = CORRIDOR_ROUTES.find((c) => c.id === e.target.value) || CORRIDOR_ROUTES[0];
                const best = newCorr.routes.find((r) => r.isRecommendedBest) || newCorr.routes[0];
                setSelectedRouteId(best.id);
                setSelectedWaypointIndex(0);
              }}
              className="bg-white border border-slate-300 focus:border-emerald-600 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold outline-none shadow-2xs cursor-pointer"
            >
              {CORRIDOR_ROUTES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BEST RECOMMENDED ROUTE HERO BANNER */}
      <div className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-200/80 pb-3.5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0 mt-0.5">
              <Compass className="w-6 h-6 animate-spin-slow text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100/90 px-2.5 py-0.5 rounded-md border border-emerald-300 font-mono shadow-2xs">
                  ★ RECOMMENDED BEST ROUTE (RANK #1)
                </span>
                <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Hydrodynamic Efficiency Score: {bestRoute.score}/100
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                {bestRoute.name} ({bestRoute.distanceNM} Nautical Miles)
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium mt-0.5 max-w-3xl">
                {bestRoute.summaryRationale}
              </p>
            </div>
          </div>

          {/* Action Button: Adopt Best Route */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdoptRoute(bestRoute)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-700/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCurrentRouteAdopted && selectedRoute.id === bestRoute.id ? 'Best Route Active on Fleet' : `Adopt Best Route (${bestRoute.distanceNM} NM)`}</span>
            </button>
          </div>
        </div>

        {/* 6 Key Reasons Why This is the Best Route */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-center">
          <div className="bg-white/95 p-2.5 rounded-xl border border-emerald-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">1. Fuel Savings</span>
            <span className="text-xs font-extrabold text-emerald-700 block mt-0.5">
              {directRoute.fuelConsumptionTonnes >= bestRoute.fuelConsumptionTonnes
                ? `-${((directRoute.fuelConsumptionTonnes - bestRoute.fuelConsumptionTonnes) / directRoute.fuelConsumptionTonnes * 100).toFixed(1)}%`
                : `+${((bestRoute.fuelConsumptionTonnes - directRoute.fuelConsumptionTonnes) / directRoute.fuelConsumptionTonnes * 100).toFixed(1)}%`}
            </span>
            <span className="text-[10px] text-slate-500">
              {directRoute.fuelConsumptionTonnes >= bestRoute.fuelConsumptionTonnes
                ? `${(directRoute.fuelConsumptionTonnes - bestRoute.fuelConsumptionTonnes).toFixed(1)}t saved`
                : `${(bestRoute.fuelConsumptionTonnes - directRoute.fuelConsumptionTonnes).toFixed(1)}t extra burn`}
            </span>
          </div>

          <div className="bg-white/95 p-2.5 rounded-xl border border-emerald-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">2. Voyage Cost</span>
            <span className="text-xs font-extrabold text-teal-800 block mt-0.5">
              {directRoute.operatingCostINR >= bestRoute.operatingCostINR
                ? `-₹${((directRoute.operatingCostINR - bestRoute.operatingCostINR) / 100000).toFixed(2)}L`
                : `+₹${((bestRoute.operatingCostINR - directRoute.operatingCostINR) / 100000).toFixed(2)}L`}
            </span>
            <span className="text-[10px] text-slate-500">
              {directRoute.operatingCostINR >= bestRoute.operatingCostINR ? 'Net opex reduction' : 'Differential opex'}
            </span>
          </div>

          <div className="bg-white/95 p-2.5 rounded-xl border border-emerald-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">3. Current Assist</span>
            <span className="text-xs font-extrabold text-emerald-700 block mt-0.5">
              +{bestRoute.oceanCurrentEffectKnots} kts
            </span>
            <span className="text-[10px] text-slate-500">Equatorial Jet ride</span>
          </div>

          <div className="bg-white/95 p-2.5 rounded-xl border border-emerald-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">4. Heavy Rain Risk</span>
            <span className="text-xs font-extrabold text-emerald-800 block mt-0.5">
              0 Danger Zones
            </span>
            <span className="text-[10px] text-slate-500">Max rain &lt; 25%</span>
          </div>

          <div className="bg-white/95 p-2.5 rounded-xl border border-emerald-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">5. Wind & Gusts</span>
            <span className="text-xs font-extrabold text-slate-900 block mt-0.5">
              12.8 kts (Gust 19)
            </span>
            <span className="text-[10px] text-slate-500">Following sea</span>
          </div>

          <div className="bg-white/95 p-2.5 rounded-xl border border-emerald-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-sans block uppercase font-bold">6. IMO Rating</span>
            <span className="text-xs font-extrabold text-emerald-800 block mt-0.5">
              CII Grade A
            </span>
            <span className="text-[10px] text-slate-500">Lowest gCO₂/t-NM</span>
          </div>
        </div>
      </div>

      {/* WHOLE-VOYAGE METOCEAN & HEAVY RAIN PROFILE STRIP */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Corridor Weather & Severe Precipitation Intelligence — {selectedRoute.name}
              </h3>
              <p className="text-xs text-slate-500">
                Real-time Doppler radar rain mapping, maximum sustained winds & gusts, and visibility thresholds across all voyage areas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedRoute.weatherSummary?.heavyRainZoneCount && selectedRoute.weatherSummary.heavyRainZoneCount > 0 ? (
              <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                {selectedRoute.weatherSummary.heavyRainZoneCount} SEVERE RAINFALL SECTORS DETECTED
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ZERO HEAVY RAINFALL HAZARDS ON ROUTE
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1 text-xs">
          {/* Heavy Rainfall Probability */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span>Rainfall Probability</span>
            </div>
            <div className="font-mono text-slate-900 font-bold text-sm">
              Max {weatherSum.maxRainProbabilityPct || 25}%
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Intensity: {weatherSum.maxRainIntensityMmHr || 1.1} mm/h (Light)
            </span>
          </div>

          {/* Wind Speed & Max Gusts */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
              <Wind className="w-3.5 h-3.5 text-sky-600" />
              <span>Wind & Gusts</span>
            </div>
            <div className="font-mono text-slate-900 font-bold text-sm">
              {weatherSum.avgWindSpeedKnots} kts avg
            </div>
            <span className="text-[11px] text-amber-700 font-mono font-semibold">
              Max Gusts: {weatherSum.maxWindGustKnots} kts ({weatherSum.predominantWindDir.split(' ')[0]})
            </span>
          </div>

          {/* Sea Swell (Hs) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
              <Waves className="w-3.5 h-3.5 text-indigo-600" />
              <span>Significant Swell (Hs)</span>
            </div>
            <div className="font-mono text-slate-900 font-bold text-sm">
              {weatherSum.meanSignificantWaveHeightM}m swell
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Peak: {weatherSum.maxWaveHeightM}m (Calm Swell)
            </span>
          </div>

          {/* Minimum Visibility */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>Lowest Visibility</span>
            </div>
            <div className="font-mono text-slate-900 font-bold text-sm">
              {weatherSum.lowestVisibilityNM || 9.0} NM
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {(weatherSum.lowestVisibilityNM || 9.0) >= 8.0 ? 'Clear Horizon (>8 NM)' : 'Degraded in Downpours'}
            </span>
          </div>

          {/* Barometric Trend */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
              <Gauge className="w-3.5 h-3.5 text-purple-600" />
              <span>Barometer State</span>
            </div>
            <div className="font-mono text-slate-900 font-bold text-sm">
              1011 - 1013 hPa
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Equatorial Stability
            </span>
          </div>

          {/* Added Weather Hull Drag */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Weather Drag (Raw)</span>
            </div>
            <div className="font-mono text-emerald-700 font-bold text-sm">
              +{weatherSum.weatherResistancePenaltyPct}% Fuel
            </div>
            <span className="text-[11px] text-slate-500">
              Low wave pitching drag
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive ECDIS Chart & Route Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Nautical Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          {/* Chart Header & Layer Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Admiralty Electronic Navigational Chart (ENC)
                </h3>
                <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                  WGS 84 Datum
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Indian Ocean & Malacca Strait Nautical Corridor
              </p>
            </div>

            {/* Layer Control Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setShowRadarRain(!showRadarRain)}
                className={`px-2 py-1 rounded-md border transition-all cursor-pointer ${
                  showRadarRain ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                🌧️ Rain Radar
              </button>
              <button
                type="button"
                onClick={() => setShowWindVectors(!showWindVectors)}
                className={`px-2 py-1 rounded-md border transition-all cursor-pointer ${
                  showWindVectors ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                🌬️ Wind (kts)
              </button>
              <button
                type="button"
                onClick={() => setShowCurrents(!showCurrents)}
                className={`px-2 py-1 rounded-md border transition-all cursor-pointer ${
                  showCurrents ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                🌊 Currents
              </button>
              <button
                type="button"
                onClick={() => setShowWaves(!showWaves)}
                className={`px-2 py-1 rounded-md border transition-all cursor-pointer ${
                  showWaves ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                📈 Swells (Hs)
              </button>
              <button
                type="button"
                onClick={() => setShowTSS(!showTSS)}
                className={`px-2 py-1 rounded-md border transition-all cursor-pointer ${
                  showTSS ? 'bg-purple-50 text-purple-800 border-purple-300 font-bold' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                🚦 TSS
              </button>
            </div>
          </div>

          {/* ECDIS High-Fidelity SVG Nautical Chart Canvas */}
          <div className="relative w-full aspect-[16/10] bg-[#071224] rounded-xl overflow-hidden border border-slate-300 shadow-inner select-none">
            <svg
              viewBox="0 0 740 460"
              onMouseMove={handleMouseMoveChart}
              className="w-full h-full cursor-crosshair"
            >
              <defs>
                <pattern id="ecdis-graticule" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#13233c" strokeWidth="0.6" strokeDasharray="2 2" />
                </pattern>

                <marker id="current-arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
                </marker>
                <marker id="wind-arrow-amber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
                </marker>
                <marker id="tss-chevron" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                  <path d="M 2 2 L 7 5 L 2 8" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
                </marker>
              </defs>

              {/* 1. Ocean Background */}
              <rect width="100%" height="100%" fill="#071224" />
              <rect width="100%" height="100%" fill="url(#ecdis-graticule)" />

              {/* 2. Bathymetry Depth Contours & Shelf Shading */}
              {showBathymetry && (
                <g opacity="0.65">
                  <path
                    d="M 50 0 L 140 0 L 165 70 L 145 150 L 160 230 L 205 300 L 235 320 L 260 290 L 290 230 L 330 170 L 380 120 L 430 80 L 460 0 Z"
                    fill="#0f2942"
                    stroke="#1e4768"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                  />
                  <text x="148" y="195" fill="#38bdf8" fontSize="8" fontFamily="monospace" opacity="0.8">
                    100m Shelf Contour
                  </text>
                  <path
                    d="M 200 370 Q 360 410 520 425 Q 400 450 220 440 Z"
                    fill="#040d1a"
                    stroke="#0b223d"
                    strokeWidth="1"
                  />
                </g>
              )}

              {/* 3. Live Doppler Rainfall Radar Overlay (Shows where heavy rain is occurring) */}
              {showRadarRain && (
                <g opacity="0.75">
                  {/* Heavy Rainfall & Squall Zone along Coastal Karnataka & Mangalore Shelf (78% rain, 18.5 mm/h) */}
                  <ellipse cx="160" cy="245" rx="35" ry="40" fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" />
                  <ellipse cx="160" cy="245" rx="20" ry="25" fill="#dc2626" fillOpacity="0.35" />
                  <text x="140" y="245" fill="#f87171" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    🌧️ HEAVY RAIN (18 mm/h)
                  </text>

                  {/* Gulf of Mannar Torrential Squall Zone (84% rain, 24 mm/h) */}
                  <ellipse cx="230" cy="315" rx="42" ry="32" fill="#ef4444" fillOpacity="0.3" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="4 2" />
                  <text x="210" y="315" fill="#fb7185" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    ⛈️ SQUALL (24 mm/h)
                  </text>

                  {/* Clear Weather Zone south of Sri Lanka (Best Route path) */}
                  <rect x="220" y="380" width="280" height="45" rx="8" fill="#10b981" fillOpacity="0.08" stroke="#10b981" strokeWidth="0.8" strokeDasharray="3 3" />
                  <text x="260" y="405" fill="#34d399" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    ✓ Clear Equatorial Deep Sea (&lt;20% Rain · No Squalls)
                  </text>
                </g>
              )}

              {/* 4. Landmasses */}
              <g fill="#182635" stroke="#334b64" strokeWidth="1.2">
                <path d="M 50 0 L 130 0 L 150 70 L 125 150 L 140 230 L 180 300 L 220 320 L 250 290 L 280 230 L 320 170 L 370 120 L 420 80 L 460 0 L 50 0 Z" />
                <path d="M 215 325 C 235 325, 245 350, 235 365 C 225 380, 210 375, 205 355 Z" />
                <g>
                  <ellipse cx="450" cy="270" rx="4" ry="12" />
                  <ellipse cx="460" cy="315" rx="5" ry="16" />
                  <ellipse cx="475" cy="365" rx="7" ry="14" />
                </g>
                <path d="M 540 180 L 570 240 L 600 310 L 630 370 L 675 415 L 720 425 L 740 420 L 740 180 Z" />
                <path d="M 480 430 L 530 400 L 610 420 L 680 460 L 480 460 Z" />
              </g>

              {/* Geographical Text Labels */}
              <text x="175" y="80" fill="#64748b" fontSize="12" fontWeight="bold" letterSpacing="3">INDIA</text>
              <text x="245" y="355" fill="#64748b" fontSize="9" fontStyle="italic">Sri Lanka</text>
              <text x="480" y="325" fill="#475569" fontSize="8" letterSpacing="1">Andaman Sea</text>
              <text x="615" y="270" fill="#64748b" fontSize="11" fontWeight="bold">MALAYSIA</text>
              <text x="540" y="445" fill="#64748b" fontSize="10">Sumatra</text>

              {/* 5. Wind Vectors */}
              {showWindVectors && (
                <g opacity="0.75">
                  <g stroke="#f59e0b" strokeWidth="1.2">
                    <line x1="210" y1="360" x2="250" y2="375" markerEnd="url(#wind-arrow-amber)" />
                    <line x1="310" y1="380" x2="355" y2="390" markerEnd="url(#wind-arrow-amber)" />
                    <line x1="420" y1="390" x2="465" y2="400" markerEnd="url(#wind-arrow-amber)" />
                  </g>
                  <text x="320" y="375" fill="#f59e0b" fontSize="8" fontFamily="monospace">
                    🌬️ WSW Wind 14-16 kts (Following)
                  </text>
                </g>
              )}

              {/* 6. Ocean Surface Current Vectors */}
              {showCurrents && (
                <g opacity="0.8">
                  <g stroke="#10b981" strokeWidth="1.6" strokeDasharray="4 3">
                    <path d="M 230 395 L 300 395" markerEnd="url(#current-arrow-green)" />
                    <path d="M 330 405 L 400 405" markerEnd="url(#current-arrow-green)" />
                    <path d="M 430 412 L 500 412" markerEnd="url(#current-arrow-green)" />
                  </g>
                  <text x="310" y="420" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    +1.2 kts North Equatorial Current (Eastward Assist)
                  </text>
                </g>
              )}

              {/* 7. Wave Swells */}
              {showWaves && (
                <g opacity="0.6">
                  <path
                    d="M 260 280 Q 330 260 410 270 Q 360 310 280 320 Z"
                    fill="#3b82f6"
                    fillOpacity="0.12"
                    stroke="#3b82f6"
                    strokeWidth="0.8"
                    strokeDasharray="3 3"
                  />
                  <text x="310" y="295" fill="#60a5fa" fontSize="8" fontFamily="monospace">
                    🌊 2.8m Monsoonal Wave Chop
                  </text>
                </g>
              )}

              {/* 8. TSS Malacca */}
              {showTSS && (
                <g opacity="0.85">
                  <line x1="535" y1="365" x2="655" y2="415" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 3" />
                  <line x1="540" y1="380" x2="660" y2="430" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 3" />
                  <path d="M 570 375 L 595 385" stroke="#a855f7" strokeWidth="2" markerEnd="url(#tss-chevron)" />
                </g>
              )}

              {/* 9. Candidate Route Tracks */}
              {activeCorridor.routes.map((route) => {
                const isSelected = route.id === selectedRouteId;
                const isBest = route.isRecommendedBest;

                return (
                  <g
                    key={route.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedRouteId(route.id);
                      setSelectedWaypointIndex(0);
                    }}
                  >
                    {isSelected && (
                      <path
                        d={route.svgPath}
                        fill="none"
                        stroke={route.color}
                        strokeWidth="8"
                        opacity="0.3"
                        strokeLinecap="round"
                      />
                    )}

                    <path
                      d={route.svgPath}
                      fill="none"
                      stroke={route.color}
                      strokeWidth={isSelected ? 3.5 : isBest ? 2.5 : 1.6}
                      strokeDasharray={isBest ? 'none' : isSelected ? 'none' : '5 3'}
                      strokeLinecap="round"
                      opacity={isSelected ? 1.0 : 0.65}
                      className="transition-all hover:stroke-width-[4]"
                    />
                  </g>
                );
              })}

              {/* 10. Waypoints with Weather Indicators */}
              {showWaypoints &&
                selectedRoute.waypoints.map((wp, i) => {
                  const cx = 115 + (i / (selectedRoute.waypoints.length - 1)) * (670 - 115);
                  const cy =
                    selectedRoute.category === 'Storm Avoidance Arc'
                      ? 150 + Math.sin((i / (selectedRoute.waypoints.length - 1)) * Math.PI) * 270
                      : selectedRoute.category === 'Direct Great Circle'
                      ? 150 + Math.sin((i / (selectedRoute.waypoints.length - 1)) * Math.PI) * 155 + (i * 26)
                      : 150 + Math.sin((i / (selectedRoute.waypoints.length - 1)) * Math.PI) * 230 + (i * 20);

                  const isOrigin = i === 0;
                  const isDest = i === selectedRoute.waypoints.length - 1;
                  const isInspected = selectedWaypointIndex === i;
                  const isHovered = hoveredWaypoint?.name === wp.name;

                  return (
                    <g
                      key={wp.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWaypointIndex(i);
                      }}
                      onMouseEnter={() => setHoveredWaypoint(wp)}
                      onMouseLeave={() => setHoveredWaypoint(null)}
                      className="cursor-pointer"
                    >
                      {wp.heavyRainAlert && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="14"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                          className="animate-spin"
                        />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isOrigin || isDest ? 6.5 : isInspected ? 6.0 : isHovered ? 5.5 : 4}
                        fill={wp.heavyRainAlert ? '#ef4444' : isOrigin || isDest ? '#ffffff' : isInspected ? '#38bdf8' : isHovered ? '#f59e0b' : selectedRoute.color}
                        stroke="#071224"
                        strokeWidth="2"
                      />
                      <text
                        x={cx + (isDest ? -10 : 8)}
                        y={cy - 8}
                        fill={wp.heavyRainAlert ? '#f87171' : isOrigin || isDest ? '#ffffff' : isInspected ? '#38bdf8' : isHovered ? '#f59e0b' : '#cbd5e1'}
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight={isOrigin || isDest || isInspected || isHovered ? 'bold' : 'normal'}
                        textAnchor={isDest ? 'end' : 'start'}
                      >
                        {wp.name.split(' ')[0]} {wp.rainProbabilityPct !== undefined ? `(${wp.rainProbabilityPct}% 🌧)` : ''}
                      </text>
                    </g>
                  );
                })}

              {/* 11. Origin & Destination Pins */}
              <g transform="translate(115, 150)">
                <circle r="7" fill="#10b981" />
                <circle r="13" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping opacity-50" />
                <text x="12" y="4" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  JNPT (Mumbai)
                </text>
              </g>

              <g transform="translate(670, 415)">
                <circle r="7" fill="#10b981" />
                <circle r="13" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping opacity-50" />
                <text x="-15" y="-10" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="end">
                  Singapore
                </text>
              </g>

              {/* 12. Animated Sailing Vessel Position */}
              <g transform="translate(365, 375)">
                <polygon points="0,-7 5,6 -5,6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.2" transform="rotate(108)" />
                <circle r="11" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />
                <text x="12" y="3" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  SOG 16.2 kts · Rain 15% (Dry)
                </text>
              </g>

              {/* 13. Nautical Compass Rose */}
              <g transform="translate(680, 55)" opacity="0.8">
                <circle r="24" fill="none" stroke="#334b64" strokeWidth="0.8" />
                <circle r="16" fill="none" stroke="#334b64" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="0" y1="-24" x2="0" y2="24" stroke="#64748b" strokeWidth="1" />
                <line x1="-24" y1="0" x2="24" y2="0" stroke="#64748b" strokeWidth="1" />
                <polygon points="0,-24 4,-6 0,-2 -4,-6" fill="#10b981" />
                <text x="0" y="-28" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  N
                </text>
                <text x="0" y="36" fill="#64748b" fontSize="7" textAnchor="middle" fontFamily="monospace">
                  Var 1°15'W
                </text>
              </g>
            </svg>

            {/* Bottom Live ECDIS Telemetry Strip with Weather & Rain Data */}
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 border-t border-slate-700/80 flex items-center justify-between text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">POS:</span> <strong className="text-white">{cursorTelemetry.lat} {cursorTelemetry.lon}</strong>
                </span>
                <span className="hidden sm:inline text-slate-400">|</span>
                <span className="hidden sm:inline">
                  <span className="text-slate-400">RAIN:</span> <strong className="text-sky-300">{cursorTelemetry.rain}</strong>
                </span>
                <span className="hidden md:inline text-slate-400">|</span>
                <span className="hidden md:inline">
                  <span className="text-slate-400">WIND:</span> <strong className="text-amber-300">{cursorTelemetry.wind}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{selectedRoute.name}</span>
                <span className="text-slate-400">({selectedRoute.distanceNM} NM)</span>
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-red-500/30 border border-red-500 rounded-sm" />
                <span className="font-semibold text-rose-700">Monsoon Rain Radar (&gt;15 mm/h)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-emerald-600 rounded-full" />
                <span className="font-semibold text-slate-900">Rank #1 Best Route</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-blue-500 rounded-full" />
                <span>Direct Coastal Route</span>
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">Scale: 1:2,500,000</span>
          </div>
        </div>

        {/* Right Column: Selected Route Technical Performance Dossier (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-md font-mono"
                  style={{
                    backgroundColor: `${selectedRoute.color}15`,
                    color: selectedRoute.color,
                    border: `1px solid ${selectedRoute.color}40`,
                  }}
                >
                  {selectedRoute.category}
                </span>
                {selectedRoute.isRecommendedBest && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                    ★ RANK #1 BEST
                  </span>
                )}
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                Score: {selectedRoute.score}/100
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mt-2.5">
              {selectedRoute.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
              {selectedRoute.tagline}
            </p>

            {/* Core Navigational Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3 my-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">1. Total Distance</span>
                <span className="text-base font-bold text-slate-900">
                  {selectedRoute.distanceNM.toLocaleString()} NM
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">
                  {selectedRoute.distanceNM < directRoute.distanceNM
                    ? 'Shortest track'
                    : `+${selectedRoute.distanceNM - directRoute.distanceNM} NM vs direct track`}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">2. Current Effect</span>
                <span className="text-base font-bold text-emerald-700">
                  {selectedRoute.oceanCurrentEffectKnots > 0 ? `+${selectedRoute.oceanCurrentEffectKnots}` : selectedRoute.oceanCurrentEffectKnots} kts
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">
                  {selectedRoute.oceanCurrentEffectKnots > 0 ? 'Favorable tail assist' : 'Adverse resistance'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">3. Fuel Consumption</span>
                <span className="text-base font-bold text-slate-900">
                  {selectedRoute.fuelConsumptionTonnes.toFixed(1)} tonnes
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold font-sans block">
                  {selectedRoute.fuelConsumptionTonnes <= directRoute.fuelConsumptionTonnes
                    ? `-${(directRoute.fuelConsumptionTonnes - selectedRoute.fuelConsumptionTonnes).toFixed(1)}t vs coastal`
                    : `+${(selectedRoute.fuelConsumptionTonnes - directRoute.fuelConsumptionTonnes).toFixed(1)}t extra burn`}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">4. Heavy Rain Sectors</span>
                <span className={`text-base font-bold ${
                  (selectedRoute.weatherSummary?.heavyRainZoneCount || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {selectedRoute.weatherSummary?.heavyRainZoneCount || 0} Risk Zones
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">
                  Max Rain: {selectedRoute.weatherSummary?.maxRainProbabilityPct || 25}%
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">5. Voyage OPEX</span>
                <span className="text-base font-bold text-teal-800">
                  ₹{(selectedRoute.operatingCostINR / 100000).toFixed(2)} Lakhs
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">
                  Bunkers + charter hire
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">6. Transit & Arrival</span>
                <span className="text-base font-bold text-sky-800">
                  {selectedRoute.transitHours.toFixed(1)}h ({selectedRoute.scheduleReliabilityPct}%)
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">
                  Buffer: +{(params.requiredArrivalHours - selectedRoute.transitHours).toFixed(1)}h
                </span>
              </div>
            </div>

            {/* Pros and Cons Cards */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-900 uppercase block mb-1">
                  Navigational Operational Strengths
                </span>
                <ul className="space-y-1 text-slate-700 font-medium text-[11px]">
                  {selectedRoute.pros.map((p) => (
                    <li key={p} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Navigational Constraints & Watchpoints
                </span>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  {selectedRoute.cons.map((c) => (
                    <li key={c} className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-bold shrink-0">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleAdoptRoute(selectedRoute)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isCurrentRouteAdopted
                  ? `Active on Voyage Plan (${selectedRoute.distanceNM} NM)`
                  : `Adopt This Route (${selectedRoute.distanceNM} NM)`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* AREA-BY-AREA WEATHER & HEAVY RAINFALL SCANNER */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Umbrella className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Area-by-Area Weather & Heavy Rainfall Scanner
              </h3>
              <span className="text-[10px] font-extrabold font-mono text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Live Zone Inspector
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any particular geographical sector of your route to inspect chance of heavy rainfall, wind speed gusts, and sea state
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setTelemetryTab('area_scanner')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                telemetryTab === 'area_scanner' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Area Weather Inspector
            </button>
            <button
              type="button"
              onClick={() => setTelemetryTab('weather_timeline')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                telemetryTab === 'weather_timeline' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timeline Grid ({selectedRoute.waypoints.length} Legs)
            </button>
            <button
              type="button"
              onClick={() => setTelemetryTab('waypoint_log')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                telemetryTab === 'waypoint_log' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ECDIS Navigation Log
            </button>
            <button
              type="button"
              onClick={() => setTelemetryTab('comparison')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                telemetryTab === 'comparison' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Multi-Track Matrix
            </button>
          </div>
        </div>

        {/* Tab 1: Area-by-Area Weather Inspector (Answers the user's prompt directly!) */}
        {telemetryTab === 'area_scanner' && (
          <div className="space-y-4">
            {/* Sector Selector Ribbon */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Select a particular area / sector along your route to analyze:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {selectedRoute.waypoints.map((wp, idx) => {
                  const isSelected = selectedWaypointIndex === idx;
                  const isHeavyRain = wp.heavyRainAlert;

                  return (
                    <button
                      key={wp.name}
                      type="button"
                      onClick={() => setSelectedWaypointIndex(idx)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                          : isHeavyRain
                          ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-slate-500 font-bold">Leg {idx + 1}</span>
                        {isHeavyRain ? (
                          <span className="text-rose-700 font-bold flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> RAIN
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold">SAFE</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {wp.areaZoneName || wp.name.split(' ')[0]}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 mt-1 flex items-center justify-between">
                        <span>{wp.rainProbabilityPct}% 🌧</span>
                        <span className="font-semibold text-amber-700">{wp.windSpeedKnots} kts</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deep-Dive Weather Card for the Selected Particular Area */}
            <div className={`p-5 rounded-2xl border-2 transition-all ${
              inspectedWp.heavyRainAlert
                ? 'border-rose-400 bg-rose-50/40'
                : 'border-blue-200 bg-gradient-to-r from-blue-50/60 via-sky-50/40 to-white'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      Sector {selectedWaypointIndex + 1} of {selectedRoute.waypoints.length}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      ETA: Hour {inspectedWp.elapsedHours?.toFixed(1) || 0.0} ({inspectedWp.coordinatesFormatted || 'Coordinates'})
                    </span>
                    {inspectedWp.heavyRainAlert ? (
                      <span className="text-xs font-extrabold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 font-mono flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                        HEAVY RAINFALL & SQUALL HAZARD
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 font-mono flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        SAFE PASSAGE — LOW RAIN RISK
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900 mt-1">
                    {inspectedWp.areaZoneName || inspectedWp.name}
                  </h4>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    {inspectedWp.safetyAlertText || inspectedWp.note}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono block">Depth Sounding</span>
                    <span className="text-xs font-bold font-mono text-slate-800">{inspectedWp.depthMeters} meters</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono block">Leg Distance</span>
                    <span className="text-xs font-bold font-mono text-slate-800">{inspectedWp.legDistanceNM} NM</span>
                  </div>
                </div>
              </div>

              {/* 4 Deep-Dive Area MetOcean Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 text-xs font-mono">
                {/* Column 1: Rainfall & Precipitation */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-bold flex items-center gap-1 text-slate-800 font-sans">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      Rainfall Forecast
                    </span>
                    <span className={`font-bold ${
                      (inspectedWp.rainProbabilityPct || 0) > 50 ? 'text-rose-600' : 'text-blue-700'
                    }`}>
                      {inspectedWp.rainProbabilityPct}% Chance
                    </span>
                  </div>
                  
                  {/* Visual Rain Probability Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (inspectedWp.rainProbabilityPct || 0) > 60
                          ? 'bg-rose-500'
                          : (inspectedWp.rainProbabilityPct || 0) > 30
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${inspectedWp.rainProbabilityPct || 10}%` }}
                    />
                  </div>

                  <div className="space-y-1 text-[11px] pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Rain Rate:</span>
                      <strong className="text-slate-900">{inspectedWp.rainIntensityMmHr || 0.0} mm/hr</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Heavy Rain Risk:</span>
                      <strong className={inspectedWp.heavyRainAlert ? 'text-rose-700' : 'text-emerald-700'}>
                        {inspectedWp.heavyRainAlert ? 'YES — Torrential' : 'NO — Light / Dry'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Column 2: Wind Speed & Gusts */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-bold flex items-center gap-1 text-slate-800 font-sans">
                      <Wind className="w-4 h-4 text-sky-600" />
                      Wind & Gusts
                    </span>
                    <span className="font-bold text-amber-700">
                      Beaufort F{inspectedWp.windBeaufort || 3}
                    </span>
                  </div>

                  <div className="text-base font-extrabold text-slate-900">
                    {inspectedWp.windSpeedKnots || 12} kts <span className="text-xs font-normal text-slate-500 font-sans">sustained</span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Max Gusts:</span>
                      <strong className="text-amber-700">{inspectedWp.gustKnots || 16} knots</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Direction:</span>
                      <strong className="text-slate-800">{inspectedWp.windDirection || 'W'}</strong>
                    </div>
                  </div>
                </div>

                {/* Column 3: Wave State & Pitching */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-bold flex items-center gap-1 text-slate-800 font-sans">
                      <Waves className="w-4 h-4 text-indigo-600" />
                      Sea State (Hs)
                    </span>
                    <span className="font-bold text-indigo-700">
                      {inspectedWp.waveHeightM || 1.8}m Swell
                    </span>
                  </div>

                  <div className="text-base font-extrabold text-slate-900">
                    {inspectedWp.wavePeriodSec || 7.5}s <span className="text-xs font-normal text-slate-500 font-sans">period</span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Wave Direction:</span>
                      <strong className="text-slate-800">{inspectedWp.waveDirection || 'SW'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Added Weather Drag:</span>
                      <strong className="text-emerald-700">+{inspectedWp.addedResistancePct || 2.5}%</strong>
                    </div>
                  </div>
                </div>

                {/* Column 4: Visibility & Atmosphere */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-bold flex items-center gap-1 text-slate-800 font-sans">
                      <Eye className="w-4 h-4 text-teal-600" />
                      Visibility & Cloud
                    </span>
                    <span className="font-bold text-teal-800">
                      {inspectedWp.visibilityNM || 11.0} NM
                    </span>
                  </div>

                  <div className="text-base font-extrabold text-slate-900">
                    {inspectedWp.cloudCoverPct || 25}% <span className="text-xs font-normal text-slate-500 font-sans">cloud cover</span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Barometer:</span>
                      <strong className="text-slate-800">{inspectedWp.pressureHpa || 1012} hPa</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Sea Surface Temp:</span>
                      <strong className="text-slate-800">{inspectedWp.seaTempC || 29.4}°C</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Timeline Grid */}
        {telemetryTab === 'weather_timeline' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedRoute.waypoints.map((wp, idx) => (
                <div
                  key={wp.name}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    hoveredWaypoint?.name === wp.name || selectedWaypointIndex === idx
                      ? 'border-blue-400 bg-blue-50/50 shadow-xs'
                      : wp.heavyRainAlert
                      ? 'border-rose-300 bg-rose-50/50'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedWaypointIndex(idx)}
                  onMouseEnter={() => setHoveredWaypoint(wp)}
                  onMouseLeave={() => setHoveredWaypoint(null)}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-slate-800 text-[11px] truncate">
                      {wp.name}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                      Hour {wp.elapsedHours?.toFixed(1) || (idx * 22).toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200/80">
                    {getWeatherIcon(wp.weatherIcon)}
                    <span className="text-xs font-semibold text-slate-800">
                      {wp.weatherCondition || 'Normal Marine Weather'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Rainfall Chance:</span>
                      <span className={`font-bold ${
                        (wp.rainProbabilityPct || 0) > 50 ? 'text-rose-600' : 'text-blue-700'
                      }`}>
                        {wp.rainProbabilityPct || 10}% ({wp.rainIntensityMmHr || 0} mm/h)
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Wind (Gusts):</span>
                      <span className="font-bold text-slate-800">
                        {wp.windSpeedKnots || 12} kts (G {wp.gustKnots || 16})
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Swell (Hs / Tp):</span>
                      <span className="font-bold text-indigo-700">
                        {wp.waveHeightM || 1.8}m @ {wp.wavePeriodSec || 7.5}s
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Visibility:</span>
                      <span className="text-slate-700">
                        {wp.visibilityNM || 11.0} NM
                      </span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-sans font-semibold">Weather Drag:</span>
                      <span className="font-bold text-emerald-700">
                        +{wp.addedResistancePct || 2.5}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: ECDIS Waypoint Telemetry Log Table */}
        {telemetryTab === 'waypoint_log' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Area / Waypoint</th>
                  <th className="py-2.5 px-3">Coordinates</th>
                  <th className="py-2.5 px-3">ETA (Hour)</th>
                  <th className="py-2.5 px-3">Rain Probability</th>
                  <th className="py-2.5 px-3">Wind & Gusts</th>
                  <th className="py-2.5 px-3">Swell (Hs)</th>
                  <th className="py-2.5 px-3">Visibility</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {selectedRoute.waypoints.map((wp, idx) => (
                  <tr
                    key={wp.name}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedWaypointIndex(idx)}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {wp.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {wp.coordinatesFormatted || `${wp.lat}°N, ${wp.lon}°E`}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      Hour {wp.elapsedHours?.toFixed(1) || (idx * 22).toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-bold ${
                        (wp.rainProbabilityPct || 0) > 50 ? 'text-rose-600' : 'text-blue-700'
                      }`}>
                        {wp.rainProbabilityPct || 10}% ({wp.rainIntensityMmHr || 0} mm/h)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {wp.windSpeedKnots || 12} kts (G {wp.gustKnots || 16}) {wp.windDirection || 'W'}
                    </td>
                    <td className="py-2.5 px-3 text-indigo-700 font-bold">
                      {wp.waveHeightM || 1.8}m
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {wp.visibilityNM || 11.0} NM
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        wp.heavyRainAlert
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {wp.heavyRainAlert ? 'Heavy Rain Alert' : 'Safe'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: All 4 Tracks Comparative Matrix */}
        {telemetryTab === 'comparison' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {routeCalculations.map((route) => {
              const isSelected = route.id === selectedRouteId;
              const isBest = route.isRecommendedBest;

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded font-mono"
                        style={{
                          backgroundColor: `${route.color}15`,
                          color: route.color,
                          border: `1px solid ${route.color}40`,
                        }}
                      >
                        {route.category}
                      </span>
                      {isBest && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                          ★ BEST
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {route.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {route.tagline}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans font-medium">Distance:</span>
                        <span className="font-bold text-slate-900">{route.distanceNM} NM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans font-medium">Heavy Rain Sectors:</span>
                        <span className={`font-bold ${
                          (route.weatherSummary?.heavyRainZoneCount || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}>
                          {route.weatherSummary?.heavyRainZoneCount || 0} Sectors
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans font-medium">Max Rain Probability:</span>
                        <span className="font-semibold text-blue-700">
                          {route.weatherSummary?.maxRainProbabilityPct || 25}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans font-medium">Max Wind Gusts:</span>
                        <span className="font-semibold text-amber-700">
                          {route.weatherSummary?.maxWindGustKnots || 20} kts
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans font-medium">Fuel Burn:</span>
                        <span className="font-bold text-slate-900">{route.fuelConsumptionTonnes.toFixed(1)} t</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      ETA {route.transitHours.toFixed(0)}h ({route.scheduleReliabilityPct}%)
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRouteId(route.id);
                        handleAdoptRoute(route);
                      }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Adopt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Explainable Decision Summary Callout */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-900">Why the Recommended Best Route Avoids Severe Weather: </span>
            Coastal routes often look shorter on maps, but passing close to Karnataka and the Gulf of Mannar exposes your ship to <strong>3 severe rainfall sectors (up to 84% heavy rain probability and 24 mm/hr squalls)</strong>, triggering wind gusts up to <strong>34 knots</strong> and degrading navigation visibility to <strong>2.0 NM</strong>. By choosing the <strong>Eco-Weather Current-Assist Route</strong>, your vessel navigates through deep equatorial waters where rainfall chance stays <strong>under 25% (dry / light showers only)</strong>, preserving radar clarity, cargo safety, and saving <strong>{fuelSavingsTons} tonnes of fuel</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
