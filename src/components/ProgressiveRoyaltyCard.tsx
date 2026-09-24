import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  Landmark,
  Building,
  MapPin,
  Flame,
  Layers,
  ChevronRight,
  Info,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import {
  MineReserve,
  FinancialParameters,
  FinancialResults,
  CurrencyType,
  ProgressiveRoyaltyBreakdown,
} from '../types/mining';
import {
  calculateProgressiveRoyaltyBreakdown,
  formatMoney,
  formatUnitRate,
} from '../utils/miningMath';

interface ProgressiveRoyaltyCardProps {
  reserves: MineReserve;
  financials: FinancialParameters;
  results?: FinancialResults;
  currency: CurrencyType;
  exchangeRateIdr: number;
  onUpdateFinancials: (updates: Partial<FinancialParameters>) => void;
  onOpenRegulationModal?: (key: string) => void;
}

export const ProgressiveRoyaltyCard: React.FC<ProgressiveRoyaltyCardProps> = ({
  reserves,
  financials,
  results,
  currency,
  exchangeRateIdr,
  onUpdateFinancials,
  onOpenRegulationModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tiers' | 'breakdown' | 'dbh' | 'stress'>('breakdown');

  const breakdown: ProgressiveRoyaltyBreakdown = calculateProgressiveRoyaltyBreakdown(
    reserves,
    financials
  );

  const permitType = financials.miningPermitType || 'IUP';

  return (
    <div
      id="progressive-royalty-module"
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6"
    >
      {/* Header and Regulatory Citation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Scale className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Beban Pajak Royalti & Iuran PNBP Progresif ESDM
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
              {permitType === 'IUPK' ? 'PP No. 15/2022 (IUPK)' : 'PP No. 26/2022 (IUP)'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Perhitungan tarif berjenjang berbasis Harga Batubara Acuan (HBA) dan Nilai Kalori GAR,
            dipisahkan antara alokasi ekspor pasar bebas dan pemenuhan kuota DMO PLN/Industri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Permit Type Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              id="select-permit-iup"
              onClick={() => onUpdateFinancials({ miningPermitType: 'IUP' })}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                permitType === 'IUP'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              IUP Operasi Produksi (PP 26/2022)
            </button>
            <button
              type="button"
              id="select-permit-iupk"
              onClick={() => onUpdateFinancials({ miningPermitType: 'IUPK' })}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                permitType === 'IUPK'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              IUPK PKP2B (PP 15/2022)
            </button>
          </div>

          {onOpenRegulationModal && (
            <button
              type="button"
              id="btn-royalty-regulations"
              onClick={() => onOpenRegulationModal('ROYALTY_PP26_2022')}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Dasar Hukum</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Indicator Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Kalori */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Kategori Kalori
          </span>
          <div className="font-mono font-black text-slate-900 text-base">
            {reserves.calorificValueGar.toLocaleString()} <span className="text-xs font-normal">kcal/kg</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-bold block truncate mt-0.5">
            {breakdown.calorieCategoryName.split('(')[0]}
          </span>
        </div>

        {/* Metric 2: HBA Ekspor */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            HBA Ekspor
          </span>
          <div className="font-mono font-black text-slate-900 text-base">
            ${breakdown.marketPriceUsd} <span className="text-xs font-normal">/ Ton</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
            Tarif: {breakdown.exportRoyaltyRatePercent}%
          </span>
        </div>

        {/* Metric 3: Harga DMO Cap */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Harga DMO ({financials.dmoObligationPercent}%)
          </span>
          <div className="font-mono font-black text-slate-900 text-base">
            ${breakdown.effectiveDmoPriceUsd} <span className="text-xs font-normal">/ Ton</span>
          </div>
          <span className="text-[10px] text-amber-600 font-bold block mt-0.5">
            Tarif DMO: {breakdown.dmoRoyaltyRatePercent}%
          </span>
        </div>

        {/* Metric 4: Blended Rate */}
        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
          <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider block mb-1">
            Tarif Efektif Blended
          </span>
          <div className="font-mono font-black text-indigo-900 text-base">
            {breakdown.effectiveBlendedRoyaltyRatePercent}%
          </div>
          <span className="text-[10px] text-indigo-700 font-semibold block mt-0.5">
            Ekspor & DMO Tertimbang
          </span>
        </div>

        {/* Metric 5: Beban per Ton */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Royalti / Ton Batubara
          </span>
          <div className="font-mono font-black text-slate-900 text-base">
            {formatUnitRate(breakdown.blendedRoyaltyUsdPerTon, currency, exchangeRateIdr, 't')}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            + Dead rent: ${breakdown.deadRentUsdPerTon.toFixed(2)}/t
          </span>
        </div>

        {/* Metric 6: Total PNBP Tahunan */}
        <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total PNBP / Tahun
          </span>
          <div className="font-mono font-black text-amber-400 text-base">
            {formatMoney(breakdown.annualTotalPnbpObligationUsd, currency, exchangeRateIdr, true)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Royalti + Iuran Tetap
          </span>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          type="button"
          id="subtab-royalty-breakdown"
          onClick={() => setActiveSubTab('breakdown')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'breakdown'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Rincian Ekspor vs DMO & Iuran Tetap</span>
        </button>
        <button
          type="button"
          id="subtab-royalty-tiers"
          onClick={() => setActiveSubTab('tiers')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'tiers'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Matriks Jenjang Tarif ESDM</span>
        </button>
        <button
          type="button"
          id="subtab-royalty-dbh"
          onClick={() => setActiveSubTab('dbh')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'dbh'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Alokasi Dana Bagi Hasil (DBH)</span>
        </button>
        <button
          type="button"
          id="subtab-royalty-stress"
          onClick={() => setActiveSubTab('stress')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'stress'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Sensitivitas Fluktuasi HBA</span>
        </button>
      </div>

      {/* Sub Tab 1: Detailed Breakdown Table (Ekspor vs DMO vs Dead Rent) */}
      {activeSubTab === 'breakdown' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Komponen Kewajiban Fiskal</th>
                  <th className="p-3 text-right">Volume Alokasi</th>
                  <th className="p-3 text-right">Harga Komoditas</th>
                  <th className="p-3 text-right">Nilai Penjualan Kotor</th>
                  <th className="p-3 text-right">Tarif Progresif</th>
                  <th className="p-3 text-right">Beban PNBP (USD)</th>
                  <th className="p-3 text-right">Beban PNBP (IDR)</th>
                  <th className="p-3 text-right">Beban / Ton</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {/* Export Coal */}
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-sans font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Penjualan Ekspor Pasar Bebas
                  </td>
                  <td className="p-3 text-right text-slate-700">
                    {(breakdown.annualExportCoalTon / 1_000_000).toFixed(2)}M Ton ({breakdown.exportFractionPercent}%)
                  </td>
                  <td className="p-3 text-right text-slate-700">
                    ${breakdown.marketPriceUsd}/t
                  </td>
                  <td className="p-3 text-right text-slate-800">
                    ${Math.round(breakdown.annualExportRevenueUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-700">
                    {breakdown.exportRoyaltyRatePercent}%
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    ${Math.round(breakdown.annualExportRoyaltyUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-slate-600">
                    Rp {Math.round(breakdown.annualExportRoyaltyUsd * exchangeRateIdr).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    ${breakdown.exportRoyaltyUsdPerTon.toFixed(2)}/t
                  </td>
                </tr>

                {/* DMO Coal */}
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-sans font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Kewajiban DMO (Kepmen ESDM 58.K/2022)
                  </td>
                  <td className="p-3 text-right text-slate-700">
                    {(breakdown.annualDmoCoalTon / 1_000_000).toFixed(2)}M Ton ({breakdown.dmoObligationPercent}%)
                  </td>
                  <td className="p-3 text-right text-slate-700">
                    ${breakdown.effectiveDmoPriceUsd}/t (Cap)
                  </td>
                  <td className="p-3 text-right text-slate-800">
                    ${Math.round(breakdown.annualDmoRevenueUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-bold text-amber-700">
                    {breakdown.dmoRoyaltyRatePercent}%
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    ${Math.round(breakdown.annualDmoRoyaltyUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-slate-600">
                    Rp {Math.round(breakdown.annualDmoRoyaltyUsd * exchangeRateIdr).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    ${breakdown.dmoRoyaltyUsdPerTon.toFixed(2)}/t
                  </td>
                </tr>

                {/* Subtotal Royalty */}
                <tr className="bg-indigo-50/30 font-bold">
                  <td className="p-3 font-sans text-indigo-900">
                    Subtotal Royalti Produksi Batubara
                  </td>
                  <td className="p-3 text-right text-indigo-900">
                    {(breakdown.annualProductionTon / 1_000_000).toFixed(2)}M Ton
                  </td>
                  <td className="p-3 text-right text-indigo-900">
                    ${breakdown.blendedCoalPriceUsd.toFixed(1)}/t (Avg)
                  </td>
                  <td className="p-3 text-right text-indigo-900">
                    ${Math.round(breakdown.annualGrossRevenueUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-indigo-700">
                    {breakdown.effectiveBlendedRoyaltyRatePercent}% (Blended)
                  </td>
                  <td className="p-3 text-right text-indigo-900">
                    ${Math.round(breakdown.annualTotalRoyaltyUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-indigo-800">
                    Rp {Math.round(breakdown.annualTotalRoyaltyIdr).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-indigo-900">
                    ${breakdown.blendedRoyaltyUsdPerTon.toFixed(2)}/t
                  </td>
                </tr>

                {/* Dead Rent (Iuran Tetap Wilayah) */}
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-sans font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Iuran Tetap PNBP Wilayah (Land Rent / Ha)
                  </td>
                  <td className="p-3 text-right text-slate-700">
                    {breakdown.concessionAreaHa.toLocaleString()} Hektar
                  </td>
                  <td className="p-3 text-right text-slate-700">
                    ${breakdown.deadRentRateUsdPerHa}/Ha/thn
                  </td>
                  <td className="p-3 text-right text-slate-500">-</td>
                  <td className="p-3 text-right text-slate-500">Tarif Tetap</td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    ${Math.round(breakdown.annualDeadRentUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-slate-600">
                    Rp {Math.round(breakdown.annualDeadRentIdr).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    ${breakdown.deadRentUsdPerTon.toFixed(2)}/t
                  </td>
                </tr>

                {/* Grand Total PNBP */}
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="p-3 font-sans text-amber-400">
                    TOTAL KEWAJIBAN PNBP PER TAMBANG
                  </td>
                  <td className="p-3 text-right text-slate-300">
                    {(breakdown.annualProductionTon / 1_000_000).toFixed(2)}M Ton
                  </td>
                  <td className="p-3 text-right text-slate-400">-</td>
                  <td className="p-3 text-right text-slate-300">
                    ${Math.round(breakdown.annualGrossRevenueUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-amber-400">
                    {breakdown.effectiveBlendedRoyaltyRatePercent}%
                  </td>
                  <td className="p-3 text-right text-amber-400 font-black">
                    ${Math.round(breakdown.annualTotalPnbpObligationUsd).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-slate-300">
                    Rp {Math.round(breakdown.annualTotalPnbpObligationIdr).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right text-amber-400 font-black">
                    ${breakdown.totalPnbpUsdPerTon.toFixed(2)}/t
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Info Bar */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">
                Korelasi Regulasi dengan Cash Flow Tambang:
              </p>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Kewajiban royalti dibayarkan per volume pengapalan batubara saat penerbitan LHV
                (Laporan Hasil Verifikasi) Surveyor dan sistem SIMPONI / MOMS Minerba.
                Nilai per-ton ${breakdown.totalPnbpUsdPerTon.toFixed(2)} secara langsung
                diperhitungkan ke dalam biaya FOB OPEX dan proyeksi arus kas tahunan LOM.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Tier Matrix Table */}
      {activeSubTab === 'tiers' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>
                Jenjang Tarif untuk Kualitas Batubara:{' '}
                <strong className="text-slate-900">{breakdown.calorieCategoryName}</strong>
              </span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {breakdown.regulatoryBasis}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {breakdown.allTiersForCalorie.map((tier) => (
              <div
                key={tier.tierNumber}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  tier.isActive
                    ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Tier {tier.tierNumber}
                  </span>
                  {tier.isActive ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      AKTIF SAAT INI
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Inaktif</span>
                  )}
                </div>

                <div className="space-y-1 my-2">
                  <div className="text-sm font-bold text-slate-900">
                    {tier.hbaRangeLabel}
                  </div>
                  <div className="text-2xl font-black font-mono text-indigo-900">
                    {tier.ratePercent}%
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Beban Est. ($/Ton):</span>
                  <span className="font-mono font-bold text-slate-800">
                    ~${((tier.ratePercent / 100) * (tier.maxHba || breakdown.marketPriceUsd)).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Reference Table for other Calorie Brackets */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-500" />
              <span>Ketentuan Lengkap Lampiran PP No. 26 Tahun 2022 (IUP Operasi Produksi)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  1. Kalori Rendah (&lt; 4.200 kcal/kg)
                </span>
                <ul className="space-y-0.5 text-slate-600 font-mono text-[10px]">
                  <li>• HBA &lt; $70: 5.0%</li>
                  <li>• HBA $70 - $90: 6.0%</li>
                  <li>• HBA $90 - $110: 7.0%</li>
                  <li>• HBA &gt; $110: 8.0%</li>
                </ul>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  2. Kalori Sedang (4.200 - 5.200 kcal/kg)
                </span>
                <ul className="space-y-0.5 text-slate-600 font-mono text-[10px]">
                  <li>• HBA &lt; $70: 6.0%</li>
                  <li>• HBA $70 - $90: 8.5%</li>
                  <li>• HBA $90 - $110: 9.5%</li>
                  <li>• HBA &gt; $110: 10.5%</li>
                </ul>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  3. Kalori Tinggi (&gt; 5.200 kcal/kg)
                </span>
                <ul className="space-y-0.5 text-slate-600 font-mono text-[10px]">
                  <li>• HBA &lt; $70: 8.0%</li>
                  <li>• HBA $70 - $90: 10.5%</li>
                  <li>• HBA $90 - $110: 12.0%</li>
                  <li>• HBA &gt; $110: 13.5%</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 3: Dana Bagi Hasil (DBH) Distribution */}
      {activeSubTab === 'dbh' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
            <Landmark className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Distribusi Penerimaan Daerah (UU No. 1 Tahun 2022 Hubungan Keuangan Pusat & Daerah / HKPD):
              </p>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Penerimaan royalti PNBP dialokasikan kembali sebesar <strong>80%</strong> ke kas daerah penghasil
                dan <strong>20%</strong> ke kas Pemerintah Pusat (APBN). Iuran tetap wilayah (dead rent) dibagi 16% pusat,
                dan 84% daerah.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Share 1: Pemerintah Pusat */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Pemerintah Pusat
                </span>
                <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                  20.0%
                </span>
              </div>
              <div className="text-lg font-black font-mono text-slate-900">
                {formatMoney(breakdown.centralGovShareUsd, currency, exchangeRateIdr, true)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Kementerian Keuangan / APBN Nasional
              </p>
            </div>

            {/* Share 2: Pemerintah Provinsi */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Pemerintah Provinsi
                </span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-[10px]">
                  16.0%
                </span>
              </div>
              <div className="text-lg font-black font-mono text-indigo-900">
                {formatMoney(breakdown.provincialGovShareUsd, currency, exchangeRateIdr, true)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Kas Daerah Provinsi Lokasi IUP
              </p>
            </div>

            {/* Share 3: Kabupaten Penghasil */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Kabupaten Penghasil
                </span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 text-[10px]">
                  32.0%
                </span>
              </div>
              <div className="text-lg font-black font-mono text-emerald-900">
                {formatMoney(breakdown.producingRegencyShareUsd, currency, exchangeRateIdr, true)}
              </div>
              <p className="text-[10px] text-emerald-700 mt-1">
                Daerah Otonom Wilayah Tambang
              </p>
            </div>

            {/* Share 4: Kab/Kota Sekitar */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Kab/Kota Sekitar
                </span>
                <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                  32.0%
                </span>
              </div>
              <div className="text-lg font-black font-mono text-slate-900">
                {formatMoney(breakdown.surroundingRegencyShareUsd, currency, exchangeRateIdr, true)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Pemerataan Antar Daerah Se-Provinsi
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 4: Price Stress Sensitivity Matrix */}
      {activeSubTab === 'stress' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Skenario Harga Komoditas</th>
                  <th className="p-3 text-right">HBA ($/t)</th>
                  <th className="p-3 text-right">Tarif Royalti Blended</th>
                  <th className="p-3 text-right">Beban Royalti ($/t)</th>
                  <th className="p-3 text-right">Estimasi Royalti Tahunan (USD)</th>
                  <th className="p-3 text-right">Estimasi Royalti Tahunan (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {breakdown.sensitivityTiers.map((tier, idx) => {
                  const isCurrent = Math.abs(tier.simulatedPriceUsd - breakdown.marketPriceUsd) < 0.5;
                  return (
                    <tr
                      key={idx}
                      className={
                        isCurrent
                          ? 'bg-indigo-50/50 font-bold text-indigo-900 border-l-4 border-l-indigo-600'
                          : 'hover:bg-slate-50 text-slate-800'
                      }
                    >
                      <td className="p-3 font-sans flex items-center gap-2">
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                        <span>{tier.scenarioLabel}</span>
                      </td>
                      <td className="p-3 text-right">${tier.simulatedPriceUsd}</td>
                      <td className="p-3 text-right font-bold text-indigo-700">
                        {tier.ratePercent}%
                      </td>
                      <td className="p-3 text-right">${tier.royaltyUsdPerTon.toFixed(2)}/t</td>
                      <td className="p-3 text-right font-bold">
                        ${tier.annualRoyaltyUsd.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right text-slate-600">
                        Rp {(tier.annualRoyaltyUsd * exchangeRateIdr).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500">
            * Simulasi memperhitungkan kuota DMO {financials.dmoObligationPercent}% dengan batas harga cap PLN ${financials.dmoPriceCapUsdPerTon}/t
            dan tarif progresif PP 26/2022 untuk setiap jenjang harga.
          </p>
        </div>
      )}
    </div>
  );
};
