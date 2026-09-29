import React from 'react';
import { Ship, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-6 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Mandatory Prototype Disclaimer */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5 shadow-2xs">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-slate-700 leading-relaxed font-medium">
            <strong className="text-emerald-800 font-bold">Prototype Demonstration Model:</strong> This prototype is a demonstration model using simulated hydrodynamic formulas (Admiralty displacement scaling, propeller cubic power laws, and IMO fuel emission factors such as 1.375 t CO₂/t methanol direct combustion). Calculated results are demonstration estimates and are not real-world measured results or scientifically validated measurements. Real-world commercial deployment requires operational calibration with physical vessel sea trials, high-frequency AIS logs, and certified bunker delivery notes.
          </p>
        </div>

        {/* Footer info line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">NautiQ</span>
            <span>·</span>
            <span>Smart India Hackathon 2026</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Clean Maritime Technology</span>
            <span>·</span>
            <span>IMO 2030 / 2050 Net-Zero Alignment</span>
            <span>·</span>
            <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">v1.0-prototype</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
