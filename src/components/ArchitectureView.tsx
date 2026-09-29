import React, { useState } from 'react';
import {
  Database,
  Gauge,
  CloudSun,
  Cpu,
  TrendingDown,
  HelpCircle,
  ArrowDown,
  CheckCircle2,
  Code,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import portTerminalImg from '../assets/images/nautiq_port_terminal_1790601650003.jpg';

export const ArchitectureView: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(3); // default to Quantum stage

  const stages = [
    {
      id: 0,
      title: 'DATA',
      subtitle: 'Maritime & Port Ingestion',
      icon: Database,
      badge: 'Inputs',
      description:
        'Continuous ingestion of static ship particulars (DWT, Admiralty coefficient, design speed), corridor nautical distances, port bunkering availability, and weather forecasts (Beaufort scale).',
      mathEquation: 'Corridor Matrix: C = {Port_i, Distance_ij, Fuel_ik, Delay_i}',
      inputs: ['Vessel specifications', 'Cargo booking demand', 'Port bunkering readiness', 'Weather wave forecasts'],
      outputs: ['Normalized route profile', 'Displacement resistance curve'],
    },
    {
      id: 1,
      title: 'FUEL PREDICTION',
      subtitle: 'Hydrodynamic Drag Modeling',
      icon: Gauge,
      badge: 'Physics Model',
      description:
        'Predicts hourly and voyage fuel burn using cubic propulsion laws corrected for sea state resistance and specific fuel energy density (MJ/kg).',
      mathEquation: 'Power: P = c · Δ^(2/3) · V^3.2 · C_weather · (42.7 / E_fuel)',
      inputs: ['Cruising speed V (knots)', 'Vessel displacement Δ', 'Beaufort weather multiplier'],
      outputs: ['Sailing fuel burn (tonnes)', 'Auxiliary berth fuel (tonnes)'],
    },
    {
      id: 2,
      title: 'SCENARIO SIMULATION',
      subtitle: 'Uncertainty & Berth Dynamics',
      icon: CloudSun,
      badge: 'Stochastic Engine',
      description:
        'Monte Carlo scenario generator modeling swell storms, bunker market price shocks (+35%), surge cargo spikes (+25%), and berth congestion at transshipment ports.',
      mathEquation: 'ETA_stochastic = Σ (D_ij / V) + BerthQueue_i + SwellDelay_i',
      inputs: ['Storm probability', 'Fuel price escalation', 'Port turnaround latency'],
      outputs: ['Schedule reliability distribution (%)', 'Variance in voyage opex'],
    },
    {
      id: 3,
      title: 'QUANTUM-INSPIRED OPTIMISATION',
      subtitle: 'QUBO Simulated Annealing',
      icon: Cpu,
      badge: 'Core Engine (NautiQ)',
      description:
        'Maps non-linear dispatch trade-offs into a Quadratic Unconstrained Binary Optimization (QUBO) Hamiltonian. Simulated quantum annealing escapes local shallow cost traps to evaluate 250 candidate ship-speed-fuel states in under 450ms.',
      mathEquation: 'min H(x) = x^T Q x + Σ λ_c · (Ax - b)^2',
      inputs: ['Discrete vessel choices', 'Continuous speed range', 'Alternative fuel options', 'Arrival deadlines'],
      outputs: ['250 evaluated candidate states', 'Global optimum ranking'],
    },
    {
      id: 4,
      title: 'PARETO SOLUTIONS',
      subtitle: 'Multi-Objective Trade-off Frontier',
      icon: TrendingDown,
      badge: 'Pareto Front',
      description:
        'Identifies non-dominated candidate solutions balancing total operating cost (₹ Lakhs) against Well-to-Wake lifecycle greenhouse emissions (tonnes CO₂e). Extracts Lowest Cost, Lowest Emissions, and Balanced archetypes.',
      mathEquation: 'Pareto = {x* ∈ X | ∄ x : f_cost(x) ≤ f_cost(x*) ∧ f_co2(x) ≤ f_co2(x*)}',
      inputs: ['Candidate solution pool', 'Boundary constraints'],
      outputs: ['Pareto-efficient frontier', '3 Selectable operational archetypes'],
    },
    {
      id: 5,
      title: 'EXPLAINABLE DECISION',
      subtitle: 'Transparent Multi-Factor Rationale',
      icon: HelpCircle,
      badge: 'XAI Synthesis',
      description:
        'Decomposes recommendation into weighted attribution: Fuel Cost (25%), Emissions (30%), Schedule Reliability (20%), Fuel Availability (15%), and Vessel Utilisation (10%) with natural-language operational justification.',
      mathEquation: 'Score = Σ w_k · Norm(f_k(x)) + Penalty_infeasible',
      inputs: ['Optimal Pareto solution', 'Operational weighting priorities'],
      outputs: ['Factor contribution bars', 'Natural language dispatch rationale'],
    },
  ];

  const currentStage = stages[activeStage];
  const CurrentIcon = currentStage.icon;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">NautiQ Architecture</h2>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono font-medium">End-to-End Decision Pipeline</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Visual pipeline flow demonstrating how maritime operational data flows from physical vessel and port parameters through hydrodynamic modeling and quantum-inspired optimization into explainable dispatch directives.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <span>6-Stage Integrated Flow</span>
        </div>
      </div>

      {/* Visual Architecture Flow: DATA ↓ FUEL PREDICTION ↓ SCENARIO SIMULATION ↓ QUANTUM ↓ PARETO ↓ EXPLAINABLE */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {stages.map((stage, idx) => {
          const isSelected = activeStage === stage.id;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveStage(stage.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all relative ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">0{idx + 1}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight leading-tight">{stage.title}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 font-medium">{stage.subtitle}</p>

                {isSelected && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rotate-45 hidden md:block" />
                )}
              </button>

              {idx < stages.length - 1 && (
                <div className="md:hidden py-1 text-slate-400">
                  <ArrowDown className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Stage Deep-Dive Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-xs">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
              Stage 0{activeStage + 1} Details
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-700 font-bold">{currentStage.badge}</span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">{currentStage.title} — {currentStage.subtitle}</h3>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {currentStage.description}
          </p>

          {/* Mathematical Formulation */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-emerald-800">
            <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Mathematical Formulation:</span>
            <code className="text-xs font-bold">{currentStage.mathEquation}</code>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5">Primary Inputs</span>
              <ul className="space-y-1 text-slate-700 font-medium">
                {currentStage.inputs.map((inp) => (
                  <li key={inp} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1.5">Primary Outputs</span>
              <ul className="space-y-1 text-slate-700 font-medium">
                {currentStage.outputs.map((out) => (
                  <li key={out} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right side visual: Port Terminal Image */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 overflow-hidden relative h-64 bg-slate-900 shadow-xs">
          <img
            src={portTerminalImg}
            alt="Port Terminal & Alternative Bunkering"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-xs">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
              Smart Port Terminal Infrastructure
            </span>
            <p className="text-white font-medium text-xs mt-0.5">
              Corridor bunkering tanks for LNG, Methanol, Ammonia, and high-voltage shore power hookups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
