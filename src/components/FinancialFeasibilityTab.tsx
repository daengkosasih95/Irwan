import React from 'react';
import {
  DollarSign,
  FileSpreadsheet,
  HelpCircle,
  Percent,
  Coins,
  ShieldAlert,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  Scale,
} from 'lucide-react';
import {
  ProjectScenario,
  FinancialResults,
  AnnualCashFlow,
  CurrencyType,
} from '../types/mining';
import { formatMoney, formatUnitRate } from '../utils/miningMath';
import { ProgressiveRoyaltyCard } from './ProgressiveRoyaltyCard';

interface FinancialFeasibilityTabProps {
  scenario: ProjectScenario;
  financials: FinancialResults;
  cashFlows: AnnualCashFlow[];
  currency?: CurrencyType;
  onUpdateFinancials: (updates: Partial<ProjectScenario['financials']>) => void;
  onOpenRegulationModal: (key: string) => void;
}

export const FinancialFeasibilityTab: React.FC<FinancialFeasibilityTabProps> = ({
  scenario,
  financials,
  cashFlows,
  currency = 'USD',
  onUpdateFinancials,
  onOpenRegulationModal,
}) => {
  const fin = scenario.financials;
  const exchangeRate = scenario.financials.currencyExchangeRateIdrUsd;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Macro & Market Assumption Inputs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              <span>Parameter Ekonomi Makro, Harga Komoditas & Pajak</span>
            </h3>
            <p className="text-xs text-slate-500">
              Harga pasar batubara FOB, kurs valas, solar industri B35, suku bunga diskonto (WACC), DMO, dan royalti ESDM
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenRegulationModal('ROYALTY_PP26_2022')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Royalti PP 26/2022</span>
            </button>
            <button
              onClick={() => onOpenRegulationModal('DMO_ESDM')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-2"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>DMO 25%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 text-xs">
          {/* Harga Batubara */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-slate-600 mb-1 font-semibold">
              Harga Batubara Acuan (USD / Ton)
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                value={fin.coalPriceUsdPerTon}
                onChange={(e) =>
                  onUpdateFinancials({ coalPriceUsdPerTon: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-black text-slate-900 focus:ring-2 focus:ring-amber-500/20"
              />
              <span className="absolute right-3 top-1.5 text-slate-400 font-bold">$</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">FOB Mother Vessel</p>
          </div>

          {/* Harga Solar Industri */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-slate-600 mb-1 font-semibold">
              Solar Industri B35 (USD / Liter)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                value={fin.industrialFuelPriceUsdPerLiter}
                onChange={(e) =>
                  onUpdateFinancials({
                    industrialFuelPriceUsdPerLiter: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-black text-slate-900 focus:ring-2 focus:ring-amber-500/20"
              />
              <span className="absolute right-3 top-1.5 text-slate-400 font-bold">$/L</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              ~Rp {(fin.industrialFuelPriceUsdPerLiter * fin.currencyExchangeRateIdrUsd).toLocaleString('id-ID')} / L
            </p>
          </div>

          {/* Discount Rate WACC */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-slate-600 mb-1 font-semibold">
              Discount Rate / WACC (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                value={fin.discountRateWaccPercent}
                onChange={(e) =>
                  onUpdateFinancials({
                    discountRateWaccPercent: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-black text-slate-900 focus:ring-2 focus:ring-amber-500/20"
              />
              <span className="absolute right-3 top-1.5 text-slate-400 font-bold">%</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Biaya Modal Rata-rata Tertimbang</p>
          </div>

          {/* Kurs Valas IDR / USD */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-slate-600 mb-1 font-semibold">
              Kurs Valas (IDR / USD)
            </label>
            <div className="relative">
              <input
                type="number"
                step="50"
                value={fin.currencyExchangeRateIdrUsd}
                onChange={(e) =>
                  onUpdateFinancials({
                    currencyExchangeRateIdrUsd: parseFloat(e.target.value) || 15000,
                  })
                }
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-black text-slate-900 focus:ring-2 focus:ring-amber-500/20"
              />
              <span className="absolute right-3 top-1.5 text-slate-400 font-bold">Rp</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Asumsi Kurs Bank Indonesia</p>
          </div>

          {/* Inflasi */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-slate-600 mb-1 font-semibold">
              Tingkat Inflasi Tahunan (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={fin.inflationRatePercent}
              onChange={(e) =>
                onUpdateFinancials({ inflationRatePercent: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
            />
          </div>

          {/* PPh Badan */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-slate-600 mb-1 font-semibold">
              PPh Badan UU HPP (%)
            </label>
            <input
              type="number"
              step="1"
              value={fin.corporateTaxRatePercent}
              onChange={(e) =>
                onUpdateFinancials({
                  corporateTaxRatePercent: parseFloat(e.target.value) || 22,
                })
              }
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
            />
          </div>

          {/* Kewajiban DMO (%) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-slate-600 mb-1 font-semibold">
              Kewajiban DMO (%)
            </label>
            <input
              type="number"
              step="5"
              value={fin.dmoObligationPercent}
              onChange={(e) =>
                onUpdateFinancials({
                  dmoObligationPercent: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
            />
          </div>

          {/* DMO Price Cap */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-slate-600 mb-1 font-semibold">
              DMO Price Cap PLN ($/Ton)
            </label>
            <input
              type="number"
              step="5"
              value={fin.dmoPriceCapUsdPerTon}
              onChange={(e) =>
                onUpdateFinancials({
                  dmoPriceCapUsdPerTon: parseFloat(e.target.value) || 70,
                })
              }
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
            />
          </div>

          {/* Jenis Izin Pertambangan */}
          <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200">
            <label className="block text-indigo-900 mb-1 font-semibold">
              Jenis Izin Tambang (Regulasi Royalti)
            </label>
            <select
              value={fin.miningPermitType || 'IUP'}
              onChange={(e) =>
                onUpdateFinancials({
                  miningPermitType: e.target.value as 'IUP' | 'IUPK',
                })
              }
              className="w-full px-3 py-1.5 bg-white border border-indigo-300 rounded-lg font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="IUP">IUP Operasi Produksi (PP 26/2022)</option>
              <option value="IUPK">IUPK Kelanjutan Operasi (PP 15/2022)</option>
            </select>
            <p className="text-[10px] text-indigo-700 mt-1">Dasar tarif progresif berjenjang</p>
          </div>

          {/* Luas Wilayah Konsesi */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-slate-600 mb-1 font-semibold">
              Luas Konsesi IUP (Hektar / Ha)
            </label>
            <input
              type="number"
              step="50"
              value={fin.concessionAreaHa || 2850}
              onChange={(e) =>
                onUpdateFinancials({
                  concessionAreaHa: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
            />
            <p className="text-[10px] text-slate-500 mt-1">Dasar perhitungan iuran tetap wilayah</p>
          </div>

          {/* Tarif Iuran Tetap Wilayah (Dead Rent) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-slate-600 mb-1 font-semibold">
              Iuran Tetap / Land Rent ($/Ha/thn)
            </label>
            <input
              type="number"
              step="0.5"
              value={fin.deadRentRateUsdPerHa ?? 4.0}
              onChange={(e) =>
                onUpdateFinancials({
                  deadRentRateUsdPerHa: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
            />
            <p className="text-[10px] text-slate-500 mt-1">~Rp 60.000 / Ha / Tahun</p>
          </div>

          {/* Toggle Dead Rent in Cash Flow */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
            <label className="block text-slate-600 mb-1 font-semibold">
              Beban Iuran Tetap ke Cash Flow
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="checkbox-apply-dead-rent"
                checked={fin.applyDeadRentInCashFlow !== false}
                onChange={(e) =>
                  onUpdateFinancials({
                    applyDeadRentInCashFlow: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                {fin.applyDeadRentInCashFlow !== false ? 'Aktif (Termasuk OPEX)' : 'Hanya Royalti Batubara'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">PNBP Non-Royalti Produksi</p>
          </div>
        </div>
      </div>

      {/* 2. Modul Perhitungan Pajak Royalti Progresif ESDM */}
      <ProgressiveRoyaltyCard
        reserves={scenario.reserves}
        financials={scenario.financials}
        results={financials}
        currency={currency}
        exchangeRateIdr={exchangeRate}
        onUpdateFinancials={onUpdateFinancials}
        onOpenRegulationModal={onOpenRegulationModal}
      />

      {/* 3. Capex & Opex Cost Breakdown Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CAPEX Structure */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Rincian Capital Expenditure (CAPEX Awal)
            </h4>
            <span className="text-xs font-mono font-black text-slate-900">
              Total: ${(financials.totalInitialCapexUsd / 1_000_000).toFixed(2)}M
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Eksplorasi Detail, FS & AMDAL:</span>
              <input
                type="number"
                step="100000"
                value={fin.capexExplorationAndPermittingUsd}
                onChange={(e) =>
                  onUpdateFinancials({
                    capexExplorationAndPermittingUsd: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pembebasan Lahan Tambang & Koridor:</span>
              <input
                type="number"
                step="500000"
                value={fin.capexLandAcquisitionUsd}
                onChange={(e) =>
                  onUpdateFinancials({
                    capexLandAcquisitionUsd: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Konstruksi Jalan Hauling & Jembatan:</span>
              <input
                type="number"
                step="500000"
                value={fin.capexHaulingRoadAndInfrastructureUsd}
                onChange={(e) =>
                  onUpdateFinancials({
                    capexHaulingRoadAndInfrastructureUsd: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pembangunan Port, Jetty & Conveyor:</span>
              <input
                type="number"
                step="500000"
                value={fin.capexPortAndJettyFacilityUsd}
                onChange={(e) =>
                  onUpdateFinancials({
                    capexPortAndJettyFacilityUsd: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Mess Camp, Workshop & Kantor Tambang:</span>
              <input
                type="number"
                step="200000"
                value={fin.capexCampAndWorkshopUsd}
                onChange={(e) =>
                  onUpdateFinancials({
                    capexCampAndWorkshopUsd: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Peralatan Penunjang & Utilitas:</span>
              <input
                type="number"
                step="200000"
                value={fin.capexEquipmentFleetPurchasedUsd}
                onChange={(e) =>
                  onUpdateFinancials({
                    capexEquipmentFleetPurchasedUsd: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-600 font-semibold">Cadangan Kontinjensi Capex (%):</span>
              <input
                type="number"
                step="1"
                value={fin.capexContingencyPercent}
                onChange={(e) =>
                  onUpdateFinancials({
                    capexContingencyPercent: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-20 px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded text-right font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* OPEX Unit Rates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tarif Biaya Operasional Satuan (OPEX Rates)
            </h4>
            <span className="text-xs font-mono font-black text-slate-900">
              FOB Cost: ${financials.averageFobCostPerTonUsd.toFixed(2)}/t
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Tarif Kontraktor OB Removal ($/BCM):</span>
              <input
                type="number"
                step="0.05"
                value={fin.obMiningContractorRateUsdPerBcm}
                onChange={(e) =>
                  onUpdateFinancials({
                    obMiningContractorRateUsdPerBcm: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Tarif Coal Getting Kontraktor ($/Ton):</span>
              <input
                type="number"
                step="0.05"
                value={fin.coalMiningContractorRateUsdPerTon}
                onChange={(e) =>
                  onUpdateFinancials({
                    coalMiningContractorRateUsdPerTon: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Tarif Angkut Hauling ($/Ton.km):</span>
              <input
                type="number"
                step="0.005"
                value={fin.coalHaulingUsdPerTonKm}
                onChange={(e) =>
                  onUpdateFinancials({
                    coalHaulingUsdPerTonKm: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Crushing, Screening & Stockpile ($/Ton):</span>
              <input
                type="number"
                step="0.05"
                value={fin.coalCrushingAndHandlingUsdPerTon}
                onChange={(e) =>
                  onUpdateFinancials({
                    coalCrushingAndHandlingUsdPerTon: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Barging & Transhipment Tongkang ($/Ton):</span>
              <input
                type="number"
                step="0.1"
                value={fin.bargingAndTranshipmentUsdPerTon}
                onChange={(e) =>
                  onUpdateFinancials({
                    bargingAndTranshipmentUsdPerTon: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Port Dues, Dermaga & Surveyor ($/Ton):</span>
              <input
                type="number"
                step="0.05"
                value={fin.portHandlingAndSurveyorUsdPerTon}
                onChange={(e) =>
                  onUpdateFinancials({
                    portHandlingAndSurveyorUsdPerTon: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono font-bold"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-600 font-semibold">Jaminan Reklamasi UU 3/2020 ($/Ton):</span>
              <input
                type="number"
                step="0.05"
                value={fin.reclamationAndMineClosureUsdPerTon}
                onChange={(e) =>
                  onUpdateFinancials({
                    reclamationAndMineClosureUsdPerTon: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-28 px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-right font-mono font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Cash Flow Projection Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <span>Tabel Proyeksi Arus Kas & Finansial Tahunan (LOM {scenario.reserves.mineLifeYears} Tahun)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Proyeksi pendapatan, rincian biaya operasional, EBITDA, depresiasi, pajak, dan arus kas bersih terdiskonto
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold whitespace-nowrap">
                <th className="p-3 sticky left-0 bg-slate-900 z-10">Tahun</th>
                <th className="p-3 text-right">Batubara (Ton)</th>
                <th className="p-3 text-right">Kupas OB (BCM)</th>
                <th className="p-3 text-right">Harga ($/t)</th>
                <th className="p-3 text-right">Gross Revenue ($)</th>
                <th className="p-3 text-right text-indigo-300">Royalti Ekspor ($)</th>
                <th className="p-3 text-right text-indigo-300">Royalti DMO ($)</th>
                <th className="p-3 text-right text-amber-300">Royalti PNBP ($)</th>
                <th className="p-3 text-right text-amber-300">Tarif (%)</th>
                <th className="p-3 text-right">Total OPEX ($)</th>
                <th className="p-3 text-right">Cash Cost ($/t)</th>
                <th className="p-3 text-right">EBITDA ($)</th>
                <th className="p-3 text-right">Depresiasi ($)</th>
                <th className="p-3 text-right">PPh 22% ($)</th>
                <th className="p-3 text-right">Net Profit ($)</th>
                <th className="p-3 text-right font-bold text-emerald-400">Net FCF ($)</th>
                <th className="p-3 text-right">Discounted CF ($)</th>
                <th className="p-3 text-right font-black">Kumulatif ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono whitespace-nowrap">
              {/* Year 0 Row */}
              <tr className="bg-slate-50 text-slate-600">
                <td className="p-3 font-bold sticky left-0 bg-slate-50 z-10 text-slate-900">
                  Tahun 0 (Capex)
                </td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right text-rose-600 font-bold">
                  -${Math.round(financials.totalInitialCapexUsd).toLocaleString('id-ID')}
                </td>
                <td className="p-3 text-right text-rose-600">
                  -${Math.round(financials.totalInitialCapexUsd).toLocaleString('id-ID')}
                </td>
                <td className="p-3 text-right text-rose-600 font-bold">
                  -${Math.round(financials.totalInitialCapexUsd).toLocaleString('id-ID')}
                </td>
              </tr>

              {/* Cash Flow Rows */}
              {cashFlows.map((cf) => (
                <tr key={cf.year} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold sticky left-0 bg-white hover:bg-slate-50 z-10 text-slate-900">
                    Tahun {cf.year}
                  </td>
                  <td className="p-3 text-right">
                    {(cf.coalProductionTon / 1_000_000).toFixed(2)}M
                  </td>
                  <td className="p-3 text-right">
                    {(cf.obStrippedBcm / 1_000_000).toFixed(2)}M
                  </td>
                  <td className="p-3 text-right">${cf.blendedCoalPriceUsd.toFixed(1)}</td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    ${Math.round(cf.grossRevenueUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-indigo-700">
                    ${Math.round(cf.royaltyExportUsd || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-indigo-700">
                    ${Math.round(cf.royaltyDmoUsd || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-bold text-amber-700">
                    ${Math.round(cf.royaltyPnbpUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    {cf.effectiveRoyaltyRatePercent ? `${cf.effectiveRoyaltyRatePercent}%` : '-'}
                  </td>
                  <td className="p-3 text-right text-rose-700">
                    ${Math.round(cf.totalOpexUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right">${cf.cashCostPerTonUsd.toFixed(2)}</td>
                  <td className="p-3 text-right font-semibold text-slate-900">
                    ${Math.round(cf.ebitdaUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-slate-500">
                    ${Math.round(cf.depreciationUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-slate-600">
                    ${Math.round(cf.taxUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    ${Math.round(cf.netProfitAfterTaxUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600">
                    ${Math.round(cf.netCashFlowUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-slate-600">
                    ${Math.round(cf.discountedCashFlowUsd).toLocaleString('id-ID')}
                  </td>
                  <td
                    className={`p-3 text-right font-black ${
                      cf.cumulativeCashFlowUsd >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    ${Math.round(cf.cumulativeCashFlowUsd).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
