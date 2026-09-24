import React from 'react';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  AlertOctagon,
  Clock,
  ArrowUpRight,
  HelpCircle,
  BarChart3,
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  Building2,
  MapPin,
  FileCheck,
  UserCheck,
  Info,
  Edit3,
} from 'lucide-react';
import {
  ProjectScenario,
  FinancialResults,
  OperationalCalculations,
  AnnualCashFlow,
  StrategicRecommendation,
  CurrencyType,
  ProjectIdentityConfig,
} from '../types/mining';
import { formatMoney, formatUnitRate } from '../utils/miningMath';

interface ExecutiveSummaryTabProps {
  scenario: ProjectScenario;
  financials: FinancialResults;
  operational: OperationalCalculations;
  cashFlows: AnnualCashFlow[];
  recommendation: StrategicRecommendation;
  identity?: ProjectIdentityConfig;
  currency?: CurrencyType;
  onOpenRegulationModal: (key: string) => void;
  onOpenExportModal: () => void;
  onOpenIdentityModal?: () => void;
}

export const ExecutiveSummaryTab: React.FC<ExecutiveSummaryTabProps> = ({
  scenario,
  financials,
  operational,
  cashFlows,
  recommendation,
  identity,
  currency = 'USD',
  onOpenRegulationModal,
  onOpenExportModal,
  onOpenIdentityModal,
}) => {
  const isGo = recommendation.overallVerdict === 'GO';
  const isConditional = recommendation.overallVerdict === 'CONDITIONAL_GO';
  const isNoGo = recommendation.overallVerdict === 'NO_GO';
  const exchangeRate = scenario.financials.currencyExchangeRateIdrUsd;

  return (
    <div className="space-y-6 pb-12">
      {/* 0. Project Identity & Concession Card */}
      {identity && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0 overflow-hidden shadow-xs">
              {identity.logoType === 'image' && identity.logoCustomUrl ? (
                <img
                  src={identity.logoCustomUrl}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Building2 className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {identity.companyName}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300">
                  {identity.confidentialityLevel}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  IUP: {identity.concessionIupNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-800">{identity.mineConcessionName}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {identity.pitOrBlockArea}, {identity.locationAddress}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-slate-500">
                <span>
                  <strong>Lead Engineer:</strong> {identity.analystName} ({identity.analystTitle})
                </span>
                <span>&bull;</span>
                <span>
                  <strong>Tanggal Dokumen:</strong> {identity.documentDate}
                </span>
              </div>
            </div>
          </div>

          {onOpenIdentityModal && (
            <button
              onClick={onOpenIdentityModal}
              className="self-start md:self-center px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 shrink-0"
              title="Ubah judul, logo, nama perusahaan, IUP, atau analis"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Ubah Identitas Proyek</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Executive Verdict Banner */}
      <div
        className={`rounded-2xl p-6 border shadow-sm transition-all ${
          isGo
            ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/60 border-emerald-500/40 text-white'
            : isConditional
            ? 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 border-amber-500/40 text-white'
            : 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/60 border-rose-500/40 text-white'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                  isGo
                    ? 'bg-emerald-500 text-slate-950'
                    : isConditional
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-rose-500 text-white'
                }`}
              >
                VERDICT: {recommendation.overallVerdict}
              </span>
              <span className="text-xs font-medium text-slate-300">
                Status Kelayakan: <strong className="text-white">{financials.projectFeasibilityStatus.replace(/_/g, ' ')}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {identity?.mineConcessionName || scenario.reserves.mineName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {recommendation.executiveSummary}
            </p>
            {identity?.reportRemarks && (
              <div className="pt-2">
                <p className="text-[11px] text-amber-300/90 italic bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="font-semibold text-amber-200 not-italic">Catatan Pengkaji: </span>
                  {identity.reportRemarks}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={onOpenExportModal}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Dokumen Kelayakan</span>
            </button>
            <button
              onClick={() => onOpenRegulationModal('FINANCIAL_METRICS_FEASIBILITY')}
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Standar Penilaian SNI/AusIMM</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: NPV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Present Value (NPV)
            </span>
            <button
              onClick={() => onOpenRegulationModal('FINANCIAL_METRICS_FEASIBILITY')}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Formula NPV"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {formatMoney(financials.npvUsd, currency, exchangeRate, true)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Discount Rate WACC: <strong>{scenario.financials.discountRateWaccPercent}%</strong>
            </p>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Profitability Index:</span>
            <span className="font-bold text-slate-800 font-mono">{financials.profitabilityIndex}x</span>
          </div>
        </div>

        {/* Metric 2: IRR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Internal Rate of Return (IRR)
            </span>
            <button
              onClick={() => onOpenRegulationModal('FINANCIAL_METRICS_FEASIBILITY')}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Formula IRR"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {financials.irrPercent.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hurdle Rate: <strong>18.0%</strong> (Spread: +{(financials.irrPercent - scenario.financials.discountRateWaccPercent).toFixed(1)}%)
            </p>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Benefit-Cost Ratio:</span>
            <span className="font-bold text-slate-800 font-mono">{financials.benefitCostRatio}x</span>
          </div>
        </div>

        {/* Metric 3: Payback Period & Capex */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Payback Period (PBP)
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {financials.paybackPeriodYears.toFixed(1)} Tahun
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Umur Tambang (LoM): <strong>{scenario.reserves.mineLifeYears} Tahun</strong>
            </p>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Initial CAPEX:</span>
            <span className="font-bold text-slate-800 font-mono">
              {formatMoney(financials.totalInitialCapexUsd, currency, exchangeRate, true)}
            </span>
          </div>
        </div>

        {/* Metric 4: Breakeven Coal Price & Cash Cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Harga Batubara Impas
            </span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {formatUnitRate(financials.breakevenCoalPriceUsd, currency, exchangeRate, 't')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Harga Acuan: <strong>{formatUnitRate(scenario.financials.coalPriceUsdPerTon, currency, exchangeRate, 't')}</strong>
            </p>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Avg FOB Cash Cost:</span>
            <span className="font-bold text-slate-800 font-mono">
              {formatUnitRate(financials.averageCashCostPerTonUsd, currency, exchangeRate, 't')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Cash Flow Projection Chart & Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <span>Proyeksi Arus Kas Tahunan (Life of Mine {scenario.reserves.mineLifeYears} Tahun)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Perbandingan Gross Revenue, Total OPEX, dan Net Free Cash Flow (FCF) per tahun
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-900" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500" />
              <span>OPEX</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span>Net Cash Flow</span>
            </div>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="space-y-3.5">
          {cashFlows.map((cf) => {
            const maxVal = Math.max(...cashFlows.map((c) => c.grossRevenueUsd)) * 1.05;
            const revPct = (cf.grossRevenueUsd / maxVal) * 100;
            const opexPct = (cf.totalOpexUsd / maxVal) * 100;
            const fcfPct = (Math.max(0, cf.netCashFlowUsd) / maxVal) * 100;

            return (
              <div key={cf.year} className="grid grid-cols-12 items-center gap-3 text-xs">
                <div className="col-span-2 sm:col-span-1 font-bold text-slate-700">
                  Thn {cf.year}
                </div>
                <div className="col-span-10 sm:col-span-11 space-y-1">
                  {/* Revenue Bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                      <div
                        className="bg-slate-900 h-full rounded-full transition-all"
                        style={{ width: `${revPct}%` }}
                      />
                    </div>
                    <span className="w-20 text-right font-mono text-[11px] text-slate-900 font-semibold">
                      ${(cf.grossRevenueUsd / 1_000_000).toFixed(1)}M
                    </span>
                  </div>

                  {/* Opex & FCF Sub-bars */}
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden flex gap-1">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${opexPct}%` }}
                        title={`OPEX: $${(cf.totalOpexUsd / 1_000_000).toFixed(1)}M`}
                      />
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${fcfPct}%` }}
                        title={`FCF: $${(cf.netCashFlowUsd / 1_000_000).toFixed(1)}M`}
                      />
                    </div>
                    <span className="w-20 text-right font-mono text-[10px] text-emerald-600 font-bold">
                      +${(cf.netCashFlowUsd / 1_000_000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Strategic Strengths, Risks & Management Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Strengths & Risks */}
        <div className="space-y-6">
          {/* Strengths */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Keunggulan & Daya Saing Proyek (Strengths)</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {recommendation.operationalStrengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Risiko Kritis & Bottleneck Operasional (Risks)</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {recommendation.operationalRisks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Action Plan for Board of Directors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Strategic Action Plan & Decision Matrix</span>
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                Senior Advisor Directives
              </span>
            </div>

            <div className="space-y-3">
              {recommendation.strategicActions.map((act, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{act.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        act.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {act.priority}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mb-2 leading-relaxed">{act.description}</p>
                  <div className="p-2 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-800 font-medium">
                    <strong className="text-slate-900 font-bold">Langkah Tindakan:</strong> {act.actionableStep}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Standar Kepatuhan: Kepmen ESDM 1827/2018 & PP 26/2022</span>
            <button
              onClick={() => onOpenRegulationModal('KEPMEN_1827_2018')}
              className="text-blue-600 hover:text-blue-700 font-bold"
            >
              Lihat Kaidah Teknik
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
