import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FleetOptimisationView } from './components/FleetOptimisationView';
import { FuelScenariosView } from './components/FuelScenariosView';
import { ScenarioAnalysisView } from './components/ScenarioAnalysisView';
import { ParetoAnalysisView } from './components/ParetoAnalysisView';
import { ExplainableAiView } from './components/ExplainableAiView';
import { RouteOptimizerView } from './components/RouteOptimizerView';
import { ArchitectureView } from './components/ArchitectureView';
import { Footer } from './components/Footer';

import {
  DEFAULT_OPTIMISATION_PARAMS,
  DEMO_PRESET_SCENARIO,
} from './data/mockData';
import {
  OptimisationParams,
  OptimisationRunResult,
  CandidateSolution,
  FuelType,
  MaritimeRouteOption,
} from './types/maritime';
import { runQuantumInspiredOptimisation } from './utils/optimisationEngine';
import { CheckCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [params, setParams] = useState<OptimisationParams>(DEFAULT_OPTIMISATION_PARAMS);
  const [runResult, setRunResult] = useState<OptimisationRunResult | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<CandidateSolution | null>(null);
  const [isOptimising, setIsOptimising] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Re-run optimisation engine reactively whenever params change so the user's
  // chosen vessel, fuel, speed, and environmental conditions directly shape the result
  useEffect(() => {
    const res = runQuantumInspiredOptimisation(params);
    setRunResult(res);
    setSelectedSolution(res.selectedSolution);
  }, [params]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleRunOptimisation = () => {
    setIsOptimising(true);
    setTimeout(() => {
      const res = runQuantumInspiredOptimisation(params);
      setRunResult(res);
      setSelectedSolution(res.selectedSolution);
      setIsOptimising(false);
      showToast(`Optimisation converged: ${params.vesselType} with ${params.alternativeFuel} evaluated across 250 candidate annealing states.`);
    }, 420);
  };

  const handleLoadDemo = () => {
    setParams(DEMO_PRESET_SCENARIO);
    setIsOptimising(true);
    setTimeout(() => {
      const res = runQuantumInspiredOptimisation(DEMO_PRESET_SCENARIO);
      setRunResult(res);
      setSelectedSolution(res.selectedSolution);
      setIsOptimising(false);
      showToast('Loaded Demo Scenario: JNPT → Singapore, 1,420 TEU Feeder Vessel, Methanol.');
    }, 350);
  };

  const handleSelectSolution = (sol: CandidateSolution) => {
    setSelectedSolution(sol);
    showToast(`Adopted ${sol.archetype || 'Selected'} Plan: ${sol.vesselType} with ${sol.fuelType} (${sol.speedKnots} kts).`);
  };

  const handleSelectFuelFromScenarios = (fuel: FuelType) => {
    setParams((prev) => ({ ...prev, alternativeFuel: fuel }));
    showToast(`Target alternative fuel updated to ${fuel}.`);
  };

  const handleAdoptRoute = (route: MaritimeRouteOption) => {
    showToast(`Adopted ${route.name} (${route.distanceNM} NM). Dispatch plan updated.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 bg-white/95 backdrop-blur-md shadow-xl text-xs text-slate-900 animate-fade-in font-mono">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoadDemo={handleLoadDemo}
        onRunOptimisation={handleRunOptimisation}
        isOptimising={isOptimising}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && selectedSolution && (
          <DashboardView
            plan={selectedSolution}
            params={params}
            onNavigateTab={setActiveTab}
            onRunOptimisation={handleRunOptimisation}
          />
        )}

        {activeTab === 'optimisation' && (
          <FleetOptimisationView
            params={params}
            setParams={setParams}
            runResult={runResult}
            onRunOptimisation={handleRunOptimisation}
            onLoadDemo={handleLoadDemo}
            isOptimising={isOptimising}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'routes' && selectedSolution && (
          <RouteOptimizerView
            params={params}
            setParams={setParams}
            selectedPlan={selectedSolution}
            onNavigateTab={setActiveTab}
            onAdoptRoute={handleAdoptRoute}
          />
        )}

        {activeTab === 'fuels' && (
          <FuelScenariosView
            activeFuel={params.alternativeFuel}
            onSelectFuel={handleSelectFuelFromScenarios}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'scenarios' && selectedSolution && (
          <ScenarioAnalysisView
            selectedPlan={selectedSolution}
            params={params}
            setParams={setParams}
            onRunOptimisation={handleRunOptimisation}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'pareto' && runResult && selectedSolution && (
          <div className="space-y-8">
            <ParetoAnalysisView
              runResult={runResult}
              selectedSolution={selectedSolution}
              onSelectSolution={handleSelectSolution}
              params={params}
              onNavigateTab={setActiveTab}
            />

            {/* Explainable AI & Benchmarking Section */}
            <ExplainableAiView
              runResult={runResult}
              selectedSolution={selectedSolution}
              params={params}
              onNavigateTab={setActiveTab}
            />
          </div>
        )}

        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Footer with mandatory disclaimer */}
      <Footer />
    </div>
  );
}
