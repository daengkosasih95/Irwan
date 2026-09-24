import React from 'react';
import {
  Layers,
  Truck,
  Fuel,
  TrendingDown,
  DollarSign,
  Droplets,
  Ship,
  ShieldCheck,
  Scale,
  FileSpreadsheet,
} from 'lucide-react';
import { ActivityBasedCosting, CurrencyType } from '../types/mining';
import { formatMoney, formatUnitRate } from '../utils/miningMath';

interface ActivityCostingCardProps {
  activityCosting: ActivityBasedCosting;
  currency: CurrencyType;
  exchangeRateIdr: number;
}

export const ActivityCostingCard: React.FC<ActivityCostingCardProps> = ({
  activityCosting,
  currency,
  exchangeRateIdr,
}) => {
  const items = [
    {
      key: 'obRemoval',
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      item: activityCosting.obRemoval,
      color: 'border-amber-500/40 bg-amber-500/5',
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      key: 'coalGetting',
      icon: <Truck className="w-4 h-4 text-emerald-400" />,
      item: activityCosting.coalGetting,
      color: 'border-emerald-500/40 bg-emerald-500/5',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      key: 'coalHauling',
      icon: <Truck className="w-4 h-4 text-blue-400" />,
      item: activityCosting.coalHauling,
      color: 'border-blue-500/40 bg-blue-500/5',
      badgeColor: 'bg-blue-500/20 text-blue-300',
      extraRate: `(${formatUnitRate(
        activityCosting.coalHauling.rateUsdPerTonKm,
        currency,
        exchangeRateIdr,
        'Ton.km'
      )})`,
    },
    {
      key: 'pitSupport',
      icon: <Droplets className="w-4 h-4 text-cyan-400" />,
      item: activityCosting.pitSupportAndDewatering,
      color: 'border-cyan-500/40 bg-cyan-500/5',
      badgeColor: 'bg-cyan-500/20 text-cyan-300',
    },
    {
      key: 'crushingPort',
      icon: <Scale className="w-4 h-4 text-violet-400" />,
      item: activityCosting.crushingStockpilePort,
      color: 'border-violet-500/40 bg-violet-500/5',
      badgeColor: 'bg-violet-500/20 text-violet-300',
    },
    {
      key: 'barging',
      icon: <Ship className="w-4 h-4 text-indigo-400" />,
      item: activityCosting.bargingTranshipment,
      color: 'border-indigo-500/40 bg-indigo-500/5',
      badgeColor: 'bg-indigo-500/20 text-indigo-300',
    },
    {
      key: 'royalty',
      icon: <ShieldCheck className="w-4 h-4 text-rose-400" />,
      item: activityCosting.royaltyPnbp,
      color: 'border-rose-500/40 bg-rose-500/5',
      badgeColor: 'bg-rose-500/20 text-rose-300',
    },
    {
      key: 'reclamation',
      icon: <FileSpreadsheet className="w-4 h-4 text-teal-400" />,
      item: activityCosting.reclamationAndClosure,
      color: 'border-teal-500/40 bg-teal-500/5',
      badgeColor: 'bg-teal-500/20 text-teal-300',
    },
    {
      key: 'overhead',
      icon: <TrendingDown className="w-4 h-4 text-slate-400" />,
      item: activityCosting.generalAdminOverhead,
      color: 'border-slate-500/40 bg-slate-500/5',
      badgeColor: 'bg-slate-500/20 text-slate-300',
    },
  ];

  return (
    <div id="activity-costing-section" className="space-y-6">
      {/* Top Banner KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-medium">Total FOB Cash Cost</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {formatUnitRate(
              activityCosting.totalFobCashCostUsdPerTon,
              currency,
              exchangeRateIdr,
              'Ton'
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {currency === 'IDR'
              ? `$${activityCosting.totalFobCashCostUsdPerTon.toFixed(2)} / Ton FOB`
              : `Rp ${Math.round(
                  activityCosting.totalFobCashCostUsdPerTon * exchangeRateIdr
                ).toLocaleString('id-ID')} / Ton`}
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-medium">Overburden Removal Rate</div>
          <div className="text-2xl font-bold text-white mt-1">
            {formatUnitRate(
              activityCosting.obRemoval.rateUsd,
              currency,
              exchangeRateIdr,
              'BCM'
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Porsi biaya: {activityCosting.obRemoval.shareOfFobCostPercent}% dari FOB
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-medium">Coal Getting (Mining)</div>
          <div className="text-2xl font-bold text-white mt-1">
            {formatUnitRate(
              activityCosting.coalGetting.rateUsd,
              currency,
              exchangeRateIdr,
              'Ton'
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Cleaning seam + gali muat batubara
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-medium">Coal Hauling ke Port/ROM</div>
          <div className="text-2xl font-bold text-white mt-1">
            {formatUnitRate(
              activityCosting.coalHauling.rateUsd,
              currency,
              exchangeRateIdr,
              'Ton'
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Tarif:{' '}
            {formatUnitRate(
              activityCosting.coalHauling.rateUsdPerTonKm,
              currency,
              exchangeRateIdr,
              'Ton.km'
            )}
          </div>
        </div>
      </div>

      {/* Main Breakdown Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Pemisahan Biaya Kegiatan Operasional (Activity-Based Costing)
            </h3>
            <p className="text-xs text-slate-400">
              Analisa tarif per satuan unit kegiatan, pembagian komponen biaya (alat, bahan bakar, suku cadang/ban, operator), dan porsi FOB
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            Kurs Konversi: <strong className="text-amber-300">1 USD = Rp {exchangeRateIdr.toLocaleString('id-ID')}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Kegiatan Operasional</th>
                <th className="py-3 px-3">Satuan</th>
                <th className="py-3 px-3 text-right">Volume Tahunan</th>
                <th className="py-3 px-3 text-right">Tarif per Unit (USD)</th>
                <th className="py-3 px-3 text-right">Tarif per Unit (IDR)</th>
                <th className="py-3 px-3 text-right">Total Tahunan</th>
                <th className="py-3 px-3 text-right">Porsi FOB</th>
                <th className="py-3 px-4 text-center">Komposisi (Alat / Fuel / Parts / Naker)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {items.map(({ key, icon, item, badgeColor, extraRate }) => (
                <tr key={key} className="hover:bg-slate-700/30 transition">
                  <td className="py-3 px-4 font-medium text-white flex items-center gap-2.5">
                    {icon}
                    <span>{item.activityName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${badgeColor}`}>
                      {item.unit}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {item.volume.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                    ${item.rateUsd.toFixed(2)} {extraRate && <span className="text-[10px] text-slate-400 block">{extraRate}</span>}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    Rp {item.rateIdr.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                    {formatMoney(item.annualTotalUsd, currency, exchangeRateIdr, true)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-300">
                    {item.shareOfFobCostPercent}%
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 w-full">
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex">
                        <div
                          title={`Alat: ${item.costComponentBreakdown.equipmentDepreciationPercent}%`}
                          style={{ width: `${item.costComponentBreakdown.equipmentDepreciationPercent}%` }}
                          className="bg-blue-500 h-full"
                        />
                        <div
                          title={`BBM/Solar: ${item.costComponentBreakdown.fuelConsumptionPercent}%`}
                          style={{ width: `${item.costComponentBreakdown.fuelConsumptionPercent}%` }}
                          className="bg-rose-500 h-full"
                        />
                        <div
                          title={`Parts/Ban: ${item.costComponentBreakdown.maintenanceAndPartsPercent}%`}
                          style={{ width: `${item.costComponentBreakdown.maintenanceAndPartsPercent}%` }}
                          className="bg-amber-500 h-full"
                        />
                        <div
                          title={`Tenaga Kerja: ${item.costComponentBreakdown.operatorLaborPercent}%`}
                          style={{ width: `${item.costComponentBreakdown.operatorLaborPercent}%` }}
                          className="bg-emerald-500 h-full"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900/95 font-bold text-slate-100 border-t-2 border-slate-600">
              <tr>
                <td className="py-3 px-4 text-amber-400">TOTAL BIAYA KAS FOB (FOB CASH COST)</td>
                <td className="py-3 px-3">Ton Batubara</td>
                <td className="py-3 px-3 text-right font-mono">
                  {activityCosting.coalGetting.volume.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-3 text-right font-mono text-amber-400 text-sm">
                  ${activityCosting.totalFobCashCostUsdPerTon.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-amber-300 text-sm">
                  Rp {activityCosting.totalFobCashCostIdrPerTon.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-3 text-right font-mono text-white text-sm">
                  {formatMoney(activityCosting.totalFobAnnualUsd, currency, exchangeRateIdr, true)}
                </td>
                <td className="py-3 px-3 text-right text-emerald-400">100.0%</td>
                <td className="py-3 px-4 text-center text-[10px] text-slate-400">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />Alat
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-500 ml-2 mr-1" />BBM
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 ml-2 mr-1" />Parts
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-2 mr-1" />Naker
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
