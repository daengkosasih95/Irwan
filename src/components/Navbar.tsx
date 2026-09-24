import React from 'react';
import {
  Pickaxe,
  TrendingUp,
  FileSpreadsheet,
  BookOpen,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  Flame,
  Gauge,
  HelpCircle,
  DollarSign,
  Building2,
  Mountain,
  Layers,
  Gem,
  HardHat,
  Truck,
  Factory,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { ProjectScenario, FinancialResults, OperationalCalculations, CurrencyType, ProjectIdentityConfig } from '../types/mining';
import { formatMoney } from '../utils/miningMath';

interface NavbarProps {
  currentScenario: ProjectScenario;
  financials: FinancialResults;
  operational: OperationalCalculations;
  currency: CurrencyType;
  identity: ProjectIdentityConfig;
  onToggleCurrency: (currency: CurrencyType) => void;
  onOpenScenarioModal: () => void;
  onOpenExportModal: () => void;
  onOpenRegulationModal: (key: string) => void;
  onOpenIdentityModal: () => void;
  activeTab: 'executive' | 'operational' | 'financial' | 'sensitivity';
  setActiveTab: (tab: 'executive' | 'operational' | 'financial' | 'sensitivity') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScenario,
  financials,
  operational,
  currency,
  identity,
  onToggleCurrency,
  onOpenScenarioModal,
  onOpenExportModal,
  onOpenRegulationModal,
  onOpenIdentityModal,
  activeTab,
  setActiveTab,
}) => {
  const isProfitable = financials.npvUsd > 0;
  const exchangeRate = currentScenario.financials.currencyExchangeRateIdrUsd;

  // Icon Resolver
  const renderLogoIcon = () => {
    switch (identity.logoIcon) {
      case 'mountain':
        return <Mountain className="w-5 h-5" />;
      case 'layers':
        return <Layers className="w-5 h-5" />;
      case 'gem':
        return <Gem className="w-5 h-5" />;
      case 'flame':
        return <Flame className="w-5 h-5" />;
      case 'hard-hat':
        return <HardHat className="w-5 h-5" />;
      case 'truck':
        return <Truck className="w-5 h-5" />;
      case 'factory':
        return <Factory className="w-5 h-5" />;
      case 'gauge':
        return <Gauge className="w-5 h-5" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5" />;
      case 'trending-up':
        return <TrendingUp className="w-5 h-5" />;
      case 'building':
        return <Building2 className="w-5 h-5" />;
      case 'pickaxe':
      default:
        return <Pickaxe className="w-5 h-5" />;
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Bar: Brand & Global Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Persona - Clickable to open identity settings */}
        <div
          onClick={onOpenIdentityModal}
          className="flex items-center gap-3 cursor-pointer group select-none"
          title="Klik untuk mengubah Judul, Logo, Nama Perusahaan & Identitas Proyek"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 overflow-hidden group-hover:scale-105 group-hover:border-amber-400 transition-all">
            {identity.logoType === 'image' && identity.logoCustomUrl ? (
              <img
                src={identity.logoCustomUrl}
                alt="Logo Perusahaan"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              renderLogoIcon()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-amber-300 transition-colors">
                {identity.appTitle || 'MINING FEASIBILITY SIMULATOR'}
              </span>
              <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md">
                {identity.appSubtitle || '10+ Yrs Exp.'}
              </span>
              <Edit3 className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors hidden sm:inline" />
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md">
              <span className="text-slate-300 font-medium">{identity.companyName}</span>
              {' &bull; '}
              <span>{identity.mineConcessionName || currentScenario.reserves.mineName}</span>
              {' &bull; '}
              <span>{identity.locationAddress || currentScenario.reserves.location}</span>
            </p>
          </div>
        </div>

        {/* Quick KPI Strip & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Identity & Branding Button */}
          <button
            id="open-identity-modal-btn"
            onClick={onOpenIdentityModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition-all shadow-xs"
            title="Ubah Judul, Logo, Identitas Badan Usaha, Keterangan & Tim Analis"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Identitas & Logo</span>
            <span className="sm:hidden">Branding</span>
          </button>

          {/* Currency Toggle (USD / IDR) */}
          <div
            id="currency-toggle-group"
            className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5 text-xs shadow-xs"
          >
            <button
              id="currency-usd-btn"
              type="button"
              onClick={() => onToggleCurrency('USD')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                currency === 'USD'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              id="currency-idr-btn"
              type="button"
              onClick={() => onToggleCurrency('IDR')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                currency === 'IDR'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              IDR (Rp)
            </button>
          </div>

          {/* Quick Metrics Badge */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">NPV (@{currentScenario.financials.discountRateWaccPercent}%)</span>
              <span
                className={`font-mono font-bold ${
                  isProfitable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatMoney(financials.npvUsd, currency, exchangeRate, true)}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px]">IRR</span>
              <span className="font-mono font-bold text-amber-400">
                {financials.irrPercent.toFixed(1)}%
              </span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px]">PBP</span>
              <span className="font-mono font-bold text-sky-400">
                {financials.paybackPeriodYears.toFixed(1)} Thn
              </span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px]">Match Factor OB</span>
              <span
                className={`font-mono font-bold ${
                  operational.matchFactorStatusOB === 'OPTIMAL'
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {operational.matchFactorOB.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Scenario Button */}
          <button
            id="scenario-selector-btn"
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="truncate max-w-[130px]">{currentScenario.name}</span>
          </button>

          {/* Regulation Guide */}
          <button
            id="regulation-guide-btn"
            onClick={() => onOpenRegulationModal('ROYALTY_PP26_2022')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
            title="Lihat Referensi Regulasi ESDM & Kaidah Teknik Pertambangan"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Regulasi ESDM</span>
          </button>

          {/* Export Report */}
          <button
            id="export-report-btn"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Laporan (.xlsx, .docx, .pptx)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto border-t border-slate-800/80">
        <button
          id="tab-executive-btn"
          onClick={() => setActiveTab('executive')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'executive'
              ? 'border-amber-400 text-amber-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Ringkasan Eksekutif & Keputusan</span>
        </button>

        <button
          id="tab-operational-btn"
          onClick={() => setActiveTab('operational')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'operational'
              ? 'border-amber-400 text-amber-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>Teknis Operasional & Fleet Matching</span>
        </button>

        <button
          id="tab-financial-btn"
          onClick={() => setActiveTab('financial')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'financial'
              ? 'border-amber-400 text-amber-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Kelayakan Finansial & Cash Flow</span>
        </button>

        <button
          id="tab-sensitivity-btn"
          onClick={() => setActiveTab('sensitivity')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'sensitivity'
              ? 'border-amber-400 text-amber-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Analisis Sensitivitas Pasar</span>
        </button>
      </div>
    </header>
  );
};

