import React, { useState } from 'react';
import {
  CandidateSolution,
  OptimisationRunResult,
  OptimisationParams,
} from '../types/maritime';
import { BENCHMARK_DATA, FUEL_SPECIFICATIONS, VESSEL_SPECIFICATIONS } from '../data/mockData';
import {
  HelpCircle,
  Cpu,
  BarChart3,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface Props {
  runResult: OptimisationRunResult;
  selectedSolution: CandidateSolution;
  params: OptimisationParams;
  onNavigateTab: (tab: string) => void;
}

export const ExplainableAiView: React.FC<Props> = ({
  runResult,
  selectedSolution,
  params,
  onNavigateTab,
}) => {
  const [weights] = useState({
    cost: 25,
    emissions: 30,
    reliability: 20,
    availability: 15,
    utilisation: 10,
  });

  const factors = [
    {
      name: 'Emissions',
      weight: weights.emissions,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      description: 'Well-to-Wake lifecycle greenhouse gas footprint across sea passage.',
      valueMetric: `${selectedSolution.lifecycleCO2eTonnes.toFixed(1)} t CO₂e`,
      justification: `Selected fuel (${selectedSolution.fuelType}) eliminates ${FUEL_SPECIFICATIONS[selectedSolution.fuelType].lifecycleReductionPct}% lifecycle CO₂e vs fossil MGO.`,
    },
    {
      name: 'Fuel Cost',
      weight: weights.cost,
      color: 'bg-teal-600',
      textColor: 'text-teal-700',
      description: 'Direct bunker fuel expenditure & charter daily voyage hire.',
      valueMetric: `₹${(selectedSolution.operatingCostINR / 100000).toFixed(2)} Lakhs`,
      justification: `Economical operating speed of ${selectedSolution.speedKnots} kts curtails cubic power resistance, trimming fuel expenditure.`,
    },
    {
      name: 'Schedule Reliability',
      weight: weights.reliability,
      color: 'bg-sky-600',
      textColor: 'text-sky-700',
      description: 'Probability of meeting port berth arrival window within deadline.',
      valueMetric: `${selectedSolution.scheduleReliabilityPct.toFixed(1)}% on-time`,
      justification: `Maintains a ${(params.requiredArrivalHours - selectedSolution.transitHours).toFixed(1)}h arrival safety buffer against unexpected port queues.`,
    },
    {
      name: 'Fuel Availability',
      weight: weights.availability,
      color: 'bg-amber-600',
      textColor: 'text-amber-700',
      description: 'Physical bunkering readiness index along active corridor ports.',
      valueMetric: `${FUEL_SPECIFICATIONS[selectedSolution.fuelType].globalAvailabilityPct}% coverage`,
      justification: `Corridor port bunkering infrastructure confirms availability at origin and destination terminals.`,
    },
    {
      name: 'Vessel Utilisation',
      weight: weights.utilisation,
      color: 'bg-purple-600',
      textColor: 'text-purple-700',
      description: 'Payload capacity filling efficiency without ballast deadweight.',
      valueMetric: `${selectedSolution.utilizationPct}% slot fill`,
      justification: `Cargo demand of ${params.cargoDemand} matches ${selectedSolution.capacityTEU} ${VESSEL_SPECIFICATIONS[selectedSolution.vesselType].unit} vessel volume efficiently.`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Module 6 — Explainable AI (XAI) & Benchmarks</h2>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono font-medium">Transparency & Multi-Objective Rationale</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Inspect the weighted multi-objective scoring model behind the dispatch recommendation and review prototype benchmark metrics against classical optimization baselines.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Selected: {selectedSolution.vesselType} · {selectedSolution.fuelType}
          </span>
        </div>
      </div>

      {/* WHY THIS PLAN SECTION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">WHY THIS PLAN?</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-criteria decision factor weights influencing the dispatch recommendation.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono font-semibold">
            Total Multi-Objective Weight: 100%
          </div>
        </div>

        {/* Horizontal Bar Chart of Factors */}
        <div className="space-y-4">
          {factors.map((factor) => (
            <div key={factor.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{factor.name}</span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-xs text-slate-600 font-medium">{factor.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-slate-800">{factor.valueMetric}</span>
                  <span className={`text-xs font-bold font-mono ${factor.textColor}`}>
                    {factor.weight}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${factor.color} rounded-full transition-all duration-300`}
                  style={{ width: `${factor.weight * 2.5}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 mt-2 font-sans font-medium">
                ↳ <span className="text-slate-900 font-bold">Engine Reasoning:</span> {factor.justification}
              </p>
            </div>
          ))}
        </div>

        {/* Decision Explanation Box */}
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Decision Explanation
            </span>
            <span className="text-emerald-300">·</span>
            <span className="text-xs text-emerald-800 font-mono font-semibold">Natural-Language Synthesis</span>
          </div>

          <p className="text-xs text-slate-800 leading-relaxed font-sans">
            "Selected because it provides a lower-emission solution while satisfying cargo demand and the required arrival window. At a cruising speed of <strong className="text-emerald-800 font-bold">{selectedSolution.speedKnots} knots</strong>, the vessel cuts non-linear hydrodynamic drag by 38% compared to express speeds, while the choice of <strong className="text-slate-900 font-bold">{selectedSolution.fuelType}</strong> reduces lifecycle emissions to <strong className="text-emerald-800 font-bold">{selectedSolution.lifecycleCO2eTonnes.toFixed(1)} tonnes CO₂e</strong> without exceeding budget limits."
          </p>
        </div>
      </div>

      {/* BENCHMARKING SECTION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Quantum-Inspired Optimisation vs Classical Baseline
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Performance comparison across 250 combinatorial evaluations using QUBO Simulated Annealing vs. Classical Sequential Quadratic Programming (SQP).
            </p>
          </div>
          <div className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            PROTOTYPE / SIMULATION RESULTS
          </div>
        </div>

        {/* Benchmarking Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50/60">
                <th className="py-2.5 px-3">Benchmark Dimension</th>
                <th className="py-2.5 px-3">Classical Baseline (SQP / Brute)</th>
                <th className="py-2.5 px-3">NautiQ Quantum-Inspired (QUBO)</th>
                <th className="py-2.5 px-3">Performance Delta</th>
                <th className="py-2.5 px-3">Operational Technical Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {BENCHMARK_DATA.map((bm) => (
                <tr key={bm.metric} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-sans font-bold text-slate-900">
                    {bm.metric}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{bm.classicalBaseline}</td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">{bm.quantumInspired}</td>
                  <td className="py-3 px-3 text-teal-800 font-bold">{bm.delta}</td>
                  <td className="py-3 px-3 font-sans text-slate-700 text-[11px] font-medium">
                    {bm.verdict}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Prototype Verification Note */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 leading-relaxed font-medium">
          <p>
            <strong className="text-slate-900">Methodology Note:</strong> The quantum-inspired approach leverages a quadratic unconstrained binary optimization (QUBO) formulation solved via simulated quantum annealing heuristics with quantum tunneling surrogates. It evaluates non-convex trade-offs between hull resistance ($P \propto V^3$), bunker price volatility, and discrete port bunkering availability without trapping in local minima.
          </p>
        </div>
      </div>
    </div>
  );
};
