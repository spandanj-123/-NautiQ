export type VesselType = 'Container Ship' | 'Bulk Carrier' | 'Tanker' | 'Feeder Vessel';

export type FuelType = 'Marine Diesel' | 'LNG' | 'Methanol' | 'Hydrogen' | 'Ammonia';

export type WeatherCondition = 'Calm (Beaufort 0-2)' | 'Moderate (Beaufort 3-5)' | 'Severe / Rough (Beaufort 6+)';

export interface VesselSpecs {
  type: VesselType;
  defaultCapacity: number;
  unit: string;
  designSpeedKnots: number;
  baseFuelBurnPerDay: number; // tonnes/day at design speed
  deadweightTonnage: number;
  description: string;
}

export interface FuelSpecs {
  id: FuelType;
  name: string;
  chemicalFormula: string;
  energyDensityMJkg: number;
  wellToWakeEmissionsKgPerTonne: number; // kg CO2e / tonne fuel
  baseCostPerTonneINR: number;
  globalAvailabilityPct: number;
  infrastructureTRL: number; // 1-9 Technology Readiness Level
  bunkeringComplexity: 'Standard' | 'Cryogenic' | 'Toxic/Pressurized' | 'High Pressure Cryo';
  lifecycleReductionPct: number; // relative to MGO/Diesel
  color: string;
}

export interface PortNode {
  id: string;
  name: string;
  code: string;
  country: string;
  lat: number;
  lon: number;
  fuelsAvailable: Record<FuelType, boolean>;
  shorePowerAvailable: boolean;
  berthDelayHours: number;
}

export interface OptimisationParams {
  cargoDemand: number; // TEU or kDWT
  routeDistanceNM: number;
  vesselType: VesselType;
  vesselCapacity: number;
  cruisingSpeedKnots: number;
  currentFuel: FuelType;
  alternativeFuel: FuelType;
  fuelPriceINRPerTonne: number;
  weatherCondition: WeatherCondition;
  shorePowerAvailability: boolean;
  requiredArrivalHours: number;
  ports: PortNode[];
  optimizationMode?: 'Selected Vessel & Fuel' | 'Global Fleet Search';
}

export interface CandidateSolution {
  id: string;
  vesselType: VesselType;
  capacityTEU: number;
  speedKnots: number;
  fuelType: FuelType;
  fuelConsumptionTonnes: number;
  lifecycleCO2eTonnes: number;
  operatingCostINR: number;
  scheduleReliabilityPct: number;
  transitHours: number;
  utilizationPct: number;
  isParetoOptimal: boolean;
  archetype?: 'Lowest Cost' | 'Lowest Emissions' | 'Balanced Solution' | 'Current Baseline';
  score: number; // multi-objective scalar
  constraintViolations: string[];
}

export interface OptimisationRunResult {
  candidatesEvaluatedCount: number;
  quantumAnnealingIterations: number;
  selectedSolution: CandidateSolution;
  exactUserSolution: CandidateSolution;
  allCandidates: CandidateSolution[];
  paretoFrontier: CandidateSolution[];
  lowestCostSolution: CandidateSolution;
  lowestEmissionsSolution: CandidateSolution;
  balancedSolution: CandidateSolution;
  executionTimeMs: number;
  convergenceScore: number;
  infrastructureAlert?: string;
  recommendedFallbackFuel?: FuelType;
  explanation: {
    title: string;
    summary: string;
    factors: { name: string; weightPct: number; contribution: string }[];
    reasons: string[];
  };
}

export type ScenarioPreset = 'Normal Weather' | 'Bad Weather' | 'Fuel Price Increase' | 'Demand Increase' | 'Port Delay';

export interface ScenarioImpact {
  scenario: ScenarioPreset;
  fuelConsumptionTonnes: number;
  operatingCostINR: number;
  lifecycleCO2eTonnes: number;
  scheduleReliabilityPct: number;
  transitHours: number;
  notes: string;
}

export interface BenchmarkMetrics {
  metric: string;
  classicalBaseline: string;
  quantumInspired: string;
  delta: string;
  verdict: string;
}

export interface RouteWaypoint {
  name: string;
  lat: number;
  lon: number;
  type: 'Origin Port' | 'Waypoint' | 'Bunkering Hub' | 'Strait Pass' | 'Destination Port';
  note?: string;
  coordinatesFormatted?: string;
  depthMeters?: number;
  courseBearingDeg?: number;
  legDistanceNM?: number;
  currentAssistKnots?: number;
  waveHeightM?: number;
  // Comprehensive Voyage Weather Telemetry along route:
  elapsedHours?: number;
  areaZoneName?: string;
  windSpeedKnots?: number;
  gustKnots?: number;
  windDirection?: string;
  windBeaufort?: number;
  wavePeriodSec?: number;
  waveDirection?: string;
  airTempC?: number;
  seaTempC?: number;
  pressureHpa?: number;
  weatherCondition?: string;
  weatherIcon?: 'clear' | 'partly_cloudy' | 'overcast' | 'rain' | 'squall';
  addedResistancePct?: number; // % added hull drag from wind/waves
  // Specific rainfall and visibility hazard telemetry:
  rainProbabilityPct?: number;
  rainIntensityMmHr?: number;
  heavyRainAlert?: boolean;
  visibilityNM?: number;
  cloudCoverPct?: number;
  navSafetyStatus?: 'Safe' | 'Moderate' | 'Warning';
  safetyAlertText?: string;
}

export interface RouteWeatherSummary {
  avgWindSpeedKnots: number;
  maxWindGustKnots: number;
  predominantWindDir: string;
  meanSignificantWaveHeightM: number;
  maxWaveHeightM: number;
  seaSurfaceTempAvgC: number;
  weatherResistancePenaltyPct: number;
  stormRiskLevel: string;
  heavyRainZoneCount?: number;
  maxRainIntensityMmHr?: number;
  maxRainProbabilityPct?: number;
  lowestVisibilityNM?: number;
}

export interface MaritimeRouteOption {
  id: string;
  name: string;
  category: 'Eco-Weather Assist' | 'Direct Great Circle' | 'Green Bunkering Corridor' | 'Storm Avoidance Arc';
  tagline: string;
  distanceNM: number;
  oceanCurrentEffectKnots: number; // positive = favorable current assist, negative = adverse
  significantWaveHeightMeters: number;
  fuelConsumptionTonnes: number;
  lifecycleCO2eTonnes: number;
  operatingCostINR: number;
  transitHours: number;
  scheduleReliabilityPct: number;
  isRecommendedBest: boolean;
  score: number;
  waypoints: RouteWaypoint[];
  bunkeringStops: string[];
  weatherRisk: 'Low' | 'Moderate' | 'High';
  trafficCongestion: 'Low' | 'Medium' | 'High';
  summaryRationale: string;
  pros: string[];
  cons: string[];
  svgPath: string;
  color: string;
  weatherSummary?: RouteWeatherSummary;
}

export interface CorridorDefinition {
  id: string;
  name: string;
  origin: string;
  destination: string;
  defaultDistanceNM: number;
  routes: MaritimeRouteOption[];
}

export type FleetPriorityNeed = 'balanced' | 'min_cost' | 'min_emissions' | 'fastest_arrival';

export interface FuelAndSpeedRecommendation {
  priority: FleetPriorityNeed;
  recommendedFuel: FuelType;
  recommendedSpeedKnots: number;
  expectedFuelBurnTonnes: number;
  expectedCostINR: number;
  expectedLifecycleCO2eTonnes: number;
  expectedTransitHours: number;
  expectedReliabilityPct: number;
  co2ReductionPctVsDiesel: number;
  costSavingsPctVsDiesel: number;
  rationale: string;
  keyDrivers: string[];
  infrastructureFeasible: boolean;
  alternativeOptions: {
    fuel: FuelType;
    speedKnots: number;
    tag: string;
    costINR: number;
    co2eTonnes: number;
    transitHours: number;
  }[];
}
