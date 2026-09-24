import React, { useState } from 'react';
import {
  Flame,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  ProjectScenario,
  FinancialResults,
  OperationalCalculations,
  SensitivityDataPoint,
} from '../types/mining';
import { calculateCashFlows } from '../utils/miningMath';

interface SensitivityAnalysisTabProps {
  scenario: ProjectScenario;
  financials: FinancialResults;
  operational: OperationalCalculations;
  sensitivity: SensitivityDataPoint[];
  onOpenRegulationModal: (key: string) => void;
}

export const SensitivityAnalysisTab: React.FC<SensitivityAnalysisTabProps> = ({
  scenario,
  financials,
  operational,
  sensitivity,
  onOpenRegulationModal,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'npv' | 'irr'>('npv');

  // Generate 2D Matrix: Coal Price vs Stripping Ratio
  const coalPrices = [60, 70, 80, 90, 100, 110, 120];
  const strippingRatios = [4.0, 4.8, 5.4, 6.0, 6.8, 7.5];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Breakeven Resilience Meter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Uji Ketahanan & Stress Testing Finansial
              </span>
              <button
                onClick={() => onOpenRegulationModal('FINANCIAL_METRICS_FEASIBILITY')}
                className="text-slate-400 hover:text-slate-600"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Analisis Sensitivitas Terhadap Fluktuasi Pasar Batubara & Biaya
            </h3>
            <p className="text-xs text-slate-500">
              Simulasi dampak perubahan harga komoditas, bahan bakar solar, nisbah kupas (SR), OPEX, dan CAPEX terhadap NPV dan IRR
            </p>
          </div>

          {/* Metric Selector: NPV vs IRR */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setSelectedMetric('npv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedMetric === 'npv'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Lihat Dampak NPV ($)
            </button>
            <button
              onClick={() => setSelectedMetric('irr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedMetric === 'irr'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Lihat Dampak IRR (%)
            </button>
          </div>
        </div>

        {/* Breakeven Safety Margin Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Harga Batubara Impas (Breakeven)</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                ${financials.breakevenCoalPriceUsd.toFixed(2)} / Ton
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Harga Pasar Saat Ini</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                ${scenario.financials.coalPriceUsdPerTon.toFixed(2)} / Ton
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Safety Headroom / Margin Aman</span>
              <span className="text-xl font-bold font-mono text-emerald-600">
                +{(
                  ((scenario.financials.coalPriceUsdPerTon - financials.breakevenCoalPriceUsd) /
                    scenario.financials.coalPriceUsdPerTon) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Spider Table & Multi-variable Curve View */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-1">
          Tabel Matriks Sensitivitas Variabel Tunggal (-30% s/d +30%)
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Menampilkan besaran {selectedMetric === 'npv' ? 'NPV (Juta USD)' : 'IRR (%)'} pada berbagai tingkat deviasi parameter dari nilai dasar (Base Case)
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="p-3">Variabel Sensitivitas</th>
                {sensitivity.map((s) => (
                  <th key={s.changePercent} className="p-3 text-center">
                    {s.changePercent > 0 ? `+${s.changePercent}%` : `${s.changePercent}%`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Coal Price */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shrink-0" />
                  Harga Batubara (FOB)
                </td>
                {sensitivity.map((s) => {
                  const val = selectedMetric === 'npv' ? s.coalPriceNpvUsd / 1_000_000 : s.coalPriceIrrPercent;
                  return (
                    <td
                      key={s.changePercent}
                      className={`p-3 text-center font-bold ${
                        val >= 0 ? 'text-emerald-700 bg-emerald-50/30' : 'text-rose-700 bg-rose-50/30'
                      }`}
                    >
                      {selectedMetric === 'npv' ? `$${val.toFixed(1)}M` : `${val.toFixed(1)}%`}
                    </td>
                  );
                })}
              </tr>

              {/* Stripping Ratio */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  Nisbah Kupas (Stripping Ratio)
                </td>
                {sensitivity.map((s) => {
                  const val = selectedMetric === 'npv' ? s.strippingRatioNpvUsd / 1_000_000 : s.strippingRatioIrrPercent;
                  return (
                    <td
                      key={s.changePercent}
                      className={`p-3 text-center font-bold ${
                        val >= 0 ? 'text-slate-800' : 'text-rose-700 bg-rose-50/30'
                      }`}
                    >
                      {selectedMetric === 'npv' ? `$${val.toFixed(1)}M` : `${val.toFixed(1)}%`}
                    </td>
                  );
                })}
              </tr>

              {/* Fuel Price */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  Harga Solar Industri
                </td>
                {sensitivity.map((s) => {
                  const val = selectedMetric === 'npv' ? s.fuelCostNpvUsd / 1_000_000 : s.fuelCostIrrPercent;
                  return (
                    <td
                      key={s.changePercent}
                      className={`p-3 text-center font-bold ${
                        val >= 0 ? 'text-slate-800' : 'text-rose-700 bg-rose-50/30'
                      }`}
                    >
                      {selectedMetric === 'npv' ? `$${val.toFixed(1)}M` : `${val.toFixed(1)}%`}
                    </td>
                  );
                })}
              </tr>

              {/* OPEX */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  Tarif Kontraktor (OPEX)
                </td>
                {sensitivity.map((s) => {
                  const val = selectedMetric === 'npv' ? s.opexNpvUsd / 1_000_000 : s.opexIrrPercent;
                  return (
                    <td
                      key={s.changePercent}
                      className={`p-3 text-center font-bold ${
                        val >= 0 ? 'text-slate-800' : 'text-rose-700 bg-rose-50/30'
                      }`}
                    >
                      {selectedMetric === 'npv' ? `$${val.toFixed(1)}M` : `${val.toFixed(1)}%`}
                    </td>
                  );
                })}
              </tr>

              {/* CAPEX */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  Infrastruktur Awal (CAPEX)
                </td>
                {sensitivity.map((s) => {
                  const val = selectedMetric === 'npv' ? s.capexNpvUsd / 1_000_000 : s.capexIrrPercent;
                  return (
                    <td
                      key={s.changePercent}
                      className={`p-3 text-center font-bold ${
                        val >= 0 ? 'text-slate-800' : 'text-rose-700 bg-rose-50/30'
                      }`}
                    >
                      {selectedMetric === 'npv' ? `$${val.toFixed(1)}M` : `${val.toFixed(1)}%`}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Cross-Matrix: Harga Batubara vs Stripping Ratio Heatmap */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Matriks Dua Dimensi: Harga Batubara ($/t) vs Stripping Ratio (BCM/t)</span>
            </h4>
            <p className="text-xs text-slate-500">
              Peta kelayakan NPV proyek (Juta USD) saat skenario harga dan kondisi geologi berubah bersamaan
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Hijau = Sangat Layak &bull; Oranye = Marjinal &bull; Merah = Negatif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="p-3 text-left">Harga \ SR</th>
                {strippingRatios.map((sr) => (
                  <th key={sr} className="p-3">
                    SR {sr.toFixed(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {coalPrices.map((price) => (
                <tr key={price} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-left bg-slate-100 text-slate-900">
                    ${price} / Ton
                  </td>
                  {strippingRatios.map((sr) => {
                    const tempFin = { ...scenario.financials, coalPriceUsdPerTon: price };
                    const tempRes = { ...scenario.reserves, plannedStrippingRatio: sr };
                    const calc = calculateCashFlows(tempRes, scenario.locationRoad, tempFin, operational);
                    const npvM = calc.results.npvUsd / 1_000_000;

                    let bgClass = 'bg-emerald-100 text-emerald-800';
                    if (npvM < 0) {
                      bgClass = 'bg-rose-100 text-rose-800';
                    } else if (npvM < 15) {
                      bgClass = 'bg-amber-100 text-amber-800';
                    }

                    return (
                      <td key={sr} className={`p-3 font-bold ${bgClass}`}>
                        ${npvM.toFixed(1)}M
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
