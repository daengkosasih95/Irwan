import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Wrench,
  ShieldAlert,
  Calendar,
  Layers,
  Fuel,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  ProjectScenario,
  OperationalCalculations,
  HeavyEquipmentUnit,
  CurrencyType,
} from '../types/mining';
import { formatMoney, formatUnitRate } from '../utils/miningMath';

interface EquipmentDegradationCardProps {
  scenario: ProjectScenario;
  operational: OperationalCalculations;
  currency?: CurrencyType;
  onOpenRegulationModal?: (key: string) => void;
}

type MaintenanceStrategy = 'STANDARD_REBUILD' | 'INTENSIVE_PM' | 'DEFERRED_MAINT';

interface DegradationYearData {
  year: number;
  cumulativeSmu: number;
  wearPercent: number;
  mtbfHours: number;
  mttrHours: number;
  mechanicalAvailability: number; // %
  productivityIndex: number; // % of baseline
  effectiveObProductivityBcmHr: number;
  effectiveCoalProductivityTonHr: number;
  fuelBurnMultiplier: number;
  maintenanceCostMultiplier: number;
  actionRequired: string;
  actionSeverity: 'normal' | 'warning' | 'rebuild' | 'critical';
}

export const EquipmentDegradationCard: React.FC<EquipmentDegradationCardProps> = ({
  scenario,
  operational,
  currency = 'USD',
  onOpenRegulationModal,
}) => {
  const [strategy, setStrategy] = useState<MaintenanceStrategy>('STANDARD_REBUILD');
  const [activeMetric, setActiveMetric] = useState<
    'productivity' | 'availability' | 'fuel' | 'maintenance'
  >('productivity');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const mineLifeYears = scenario.reserves.mineLifeYears || 8;
  const exchangeRate = scenario.financials.currencyExchangeRateIdrUsd;

  // Find dominant primary OB loader & hauler for baseline modeling
  const primaryObLoader = useMemo(() => {
    return (
      scenario.equipments.find((e) => e.type === 'EXCAVATOR_OB') ||
      scenario.equipments[0]
    );
  }, [scenario.equipments]);

  const primaryObHauler = useMemo(() => {
    return (
      scenario.equipments.find((e) => e.type === 'HAULER_OB') ||
      scenario.equipments[1]
    );
  }, [scenario.equipments]);

  // Baseline calculations
  const baselineObHourlyBcm = operational.obExcavatorProductivityBcmPerHour || 480;
  const baselineCoalHourlyTon = operational.coalExcavatorProductivityTonPerHour || 320;
  const baseMtbf = primaryObLoader?.meanTimeBetweenFailuresHours || 120;
  const baseMttr = primaryObLoader?.meanTimeToRepairHours || 4.5;
  const baseWear = primaryObLoader?.wearAndTearPercent || 15;
  const baseSmu = primaryObLoader?.cumulativeHours || 4500;
  const annualWorkingHours = (operational.effectiveWorkingHoursPerMonth || 450) * 12;

  // Generate Life of Mine degradation progression
  const degradationCurve: DegradationYearData[] = useMemo(() => {
    const data: DegradationYearData[] = [];
    const rebuildYear = Math.min(Math.max(4, Math.floor(mineLifeYears / 2)), 6);

    for (let y = 1; y <= mineLifeYears; y++) {
      const smu = Math.round(baseSmu + (y - 1) * annualWorkingHours);
      let wear = baseWear + (y - 1) * 4.2;
      let mtbf = Math.max(50, baseMtbf - (y - 1) * 8.5);
      let mttr = baseMttr + (y - 1) * 0.35;
      let prodIndex = 100 - (y - 1) * 2.8;
      let fuelMult = 1.0 + (y - 1) * 0.018;
      let maintMult = 1.0 + (y - 1) * 0.11;

      let action = 'Preventive Maintenance Rutin (250h / 500h / 1000h)';
      let severity: DegradationYearData['actionSeverity'] = 'normal';

      if (strategy === 'STANDARD_REBUILD') {
        if (y === rebuildYear) {
          action = 'Major Overhaul & Mid-Life Component Rebuild (Engine, Transmission, Hydraulic)';
          severity = 'rebuild';
          wear = 12; // refreshed
          mtbf = baseMtbf * 0.95;
          mttr = baseMttr * 1.05;
          prodIndex = 97;
          fuelMult = 1.02;
          maintMult = 1.15;
        } else if (y > rebuildYear) {
          const yrsAfterRebuild = y - rebuildYear;
          wear = 12 + yrsAfterRebuild * 4.0;
          mtbf = baseMtbf * 0.95 - yrsAfterRebuild * 7.0;
          mttr = baseMttr * 1.05 + yrsAfterRebuild * 0.3;
          prodIndex = 97 - yrsAfterRebuild * 2.5;
          fuelMult = 1.02 + yrsAfterRebuild * 0.015;
          maintMult = 1.15 + yrsAfterRebuild * 0.09;
          if (y >= mineLifeYears - 1) {
            action = 'Evaluasi Nilai Sisa (Residual Value) / Persiapan Re-fleeting';
            severity = 'warning';
          }
        } else if (y === rebuildYear - 1) {
          action = 'Inspeksi Non-Destructive (NDT) & Persiapan Suku Cadang Overhaul';
          severity = 'warning';
        }
      } else if (strategy === 'INTENSIVE_PM') {
        // High discipline reduces degradation by ~30%
        wear = baseWear + (y - 1) * 2.8;
        mtbf = Math.max(70, baseMtbf - (y - 1) * 5.0);
        mttr = baseMttr + (y - 1) * 0.2;
        prodIndex = Math.max(88, 100 - (y - 1) * 1.6);
        fuelMult = 1.0 + (y - 1) * 0.012;
        maintMult = 1.08 + (y - 1) * 0.07;
        action = 'Oil Sampling (SOS), Vibration Analysis, & Penggantian Komponen Terencana';
        severity = y > 5 ? 'warning' : 'normal';
      } else if (strategy === 'DEFERRED_MAINT') {
        // Deferred maintenance escalates wear quickly
        wear = Math.min(75, baseWear + (y - 1) * 7.5);
        mtbf = Math.max(35, baseMtbf - (y - 1) * 14.0);
        mttr = baseMttr + (y - 1) * 0.75;
        prodIndex = Math.max(65, 100 - (y - 1) * 4.9);
        fuelMult = 1.0 + (y - 1) * 0.032;
        maintMult = 1.0 + (y - 1) * 0.19;
        if (y >= 4) {
          action = 'Tingkat Breakdown Tinggi: Keausan Pompa Hidrolik & Turbocharger Kritis';
          severity = 'critical';
        } else {
          action = 'Preventive Maintenance Minimal (Risiko Unscheduled Breakdown Meningkat)';
          severity = 'warning';
        }
      }

      // Calculate Mechanical Availability (MA) = MTBF / (MTBF + MTTR)
      const maPercent = Math.min(94, Math.max(60, (mtbf / (mtbf + mttr)) * 100));

      // Final bounded metrics
      const clampedProdIndex = Math.max(60, Math.min(100, prodIndex));
      const effectiveOb = (baselineObHourlyBcm * clampedProdIndex) / 100;
      const effectiveCoal = (baselineCoalHourlyTon * clampedProdIndex) / 100;

      data.push({
        year: y,
        cumulativeSmu: smu,
        wearPercent: Math.round(wear),
        mtbfHours: Math.round(mtbf),
        mttrHours: parseFloat(mttr.toFixed(1)),
        mechanicalAvailability: parseFloat(maPercent.toFixed(1)),
        productivityIndex: parseFloat(clampedProdIndex.toFixed(1)),
        effectiveObProductivityBcmHr: Math.round(effectiveOb),
        effectiveCoalProductivityTonHr: Math.round(effectiveCoal),
        fuelBurnMultiplier: parseFloat(fuelMult.toFixed(3)),
        maintenanceCostMultiplier: parseFloat(maintMult.toFixed(2)),
        actionRequired: action,
        actionSeverity: severity,
      });
    }

    return data;
  }, [
    mineLifeYears,
    strategy,
    baseSmu,
    baseWear,
    baseMtbf,
    baseMttr,
    annualWorkingHours,
    baselineObHourlyBcm,
    baselineCoalHourlyTon,
  ]);

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 50 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Chart range calculations based on activeMetric
  const metricValues = degradationCurve.map((d) => {
    switch (activeMetric) {
      case 'productivity':
        return d.productivityIndex;
      case 'availability':
        return d.mechanicalAvailability;
      case 'fuel':
        return (d.fuelBurnMultiplier - 1.0) * 100; // % surge
      case 'maintenance':
        return d.maintenanceCostMultiplier;
    }
  });

  const minY = activeMetric === 'maintenance' ? 0.8 : Math.min(...metricValues) * 0.92;
  const maxY = activeMetric === 'maintenance' ? 2.5 : Math.max(...metricValues) * 1.05;

  const points = degradationCurve.map((d, index) => {
    const x = padding.left + (index / (degradationCurve.length - 1)) * graphWidth;
    let val = 0;
    switch (activeMetric) {
      case 'productivity':
        val = d.productivityIndex;
        break;
      case 'availability':
        val = d.mechanicalAvailability;
        break;
      case 'fuel':
        val = (d.fuelBurnMultiplier - 1.0) * 100;
        break;
      case 'maintenance':
        val = d.maintenanceCostMultiplier;
        break;
    }
    const y = padding.top + graphHeight - ((val - minY) / (maxY - minY)) * graphHeight;
    return { x, y, val, year: d.year, smu: d.cumulativeSmu };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    padding.top + graphHeight
  } L ${points[0].x} ${padding.top + graphHeight} Z`;

  const getMetricLabel = () => {
    switch (activeMetric) {
      case 'productivity':
        return 'Indeks Produktivitas Alat Efektif (%)';
      case 'availability':
        return 'Mechanical Availability (MA %)';
      case 'fuel':
        return 'Kenaikan Konsumsi Solar (%)';
      case 'maintenance':
        return 'Pengganda Biaya Servis / Spare Parts (x)';
    }
  };

  const getMetricColor = () => {
    switch (activeMetric) {
      case 'productivity':
        return { stroke: '#d97706', fill: '#fef3c7', text: 'text-amber-700' };
      case 'availability':
        return { stroke: '#2563eb', fill: '#dbeafe', text: 'text-blue-700' };
      case 'fuel':
        return { stroke: '#ea580c', fill: '#ffedd5', text: 'text-orange-700' };
      case 'maintenance':
        return { stroke: '#dc2626', fill: '#fee2e2', text: 'text-rose-700' };
    }
  };

  const color = getMetricColor();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* 1. Header & Technical Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Reliability & Life-of-Mine Engineering
            </span>
            {onOpenRegulationModal && (
              <button
                onClick={() => onOpenRegulationModal('EQUIPMENT_SAFETY_KEPMEN1827')}
                className="text-slate-400 hover:text-slate-600"
                title="Regulasi Kelaikan Peralatan Kepmen 1827/2018"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-600" />
            <span>Proyeksi Degradasi Kinerja & Keandalan Alat (Life-of-Mine)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Simulasi kurva penurunan kinerja alat berat akibat keausan komponen mekanis,
            penurunan MTBF, peningkatan MTTR, serta dampaknya terhadap produktivitas per jam dan
            biaya operasional selama umur tambang ({mineLifeYears} Tahun).
          </p>
        </div>

        {/* Strategy Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setStrategy('STANDARD_REBUILD')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              strategy === 'STANDARD_REBUILD'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mid-Life Rebuild (Pabrikan)
          </button>
          <button
            onClick={() => setStrategy('INTENSIVE_PM')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              strategy === 'INTENSIVE_PM'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Intensive PM
          </button>
          <button
            onClick={() => setStrategy('DEFERRED_MAINT')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              strategy === 'DEFERRED_MAINT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 hover:text-rose-700'
            }`}
          >
            Deferred (Tanpa Overhaul)
          </button>
        </div>
      </div>

      {/* 2. Interactive Degradation Curve Graph */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Pilih Parameter Kurva:</span>
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setActiveMetric('productivity')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeMetric === 'productivity'
                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Produktivitas (%)
              </button>
              <button
                onClick={() => setActiveMetric('availability')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeMetric === 'availability'
                    ? 'bg-blue-100 text-blue-900 font-bold border border-blue-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Mechanical Availability (%)
              </button>
              <button
                onClick={() => setActiveMetric('fuel')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeMetric === 'fuel'
                    ? 'bg-orange-100 text-orange-900 font-bold border border-orange-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Konsumsi Solar (+%)
              </button>
              <button
                onClick={() => setActiveMetric('maintenance')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeMetric === 'maintenance'
                    ? 'bg-rose-100 text-rose-900 font-bold border border-rose-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Biaya Perawatan (x)
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.stroke }} />
            <span className="font-semibold text-slate-700">{getMetricLabel()}</span>
          </div>
        </div>

        {/* SVG Curve Container */}
        <div className="relative w-full bg-slate-50/70 rounded-xl p-3 border border-slate-200 overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[620px] overflow-visible select-none"
          >
            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + graphHeight * (1 - ratio);
              const labelVal = minY + ratio * (maxY - minY);
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {activeMetric === 'maintenance' ? `${labelVal.toFixed(1)}x` : `${labelVal.toFixed(0)}%`}
                  </text>
                </g>
              );
            })}

            {/* Filled Gradient Area */}
            <defs>
              <linearGradient id="degradationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color.stroke} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color.stroke} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#degradationGradient)" />

            {/* Curve Path */}
            <path
              d={pathD}
              fill="none"
              stroke={color.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Data Points and Interactivity */}
            {points.map((p) => {
              const isHovered = hoveredYear === p.year;
              return (
                <g
                  key={p.year}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredYear(p.year)}
                  onMouseLeave={() => setHoveredYear(null)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : 4}
                    fill="#ffffff"
                    stroke={color.stroke}
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all"
                  />

                  {/* Year labels on x-axis */}
                  <text
                    x={p.x}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    className={`text-[11px] font-mono ${
                      isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-500'
                    }`}
                  >
                    Thn {p.year}
                  </text>

                  {/* Value tag on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={p.x - 35}
                        y={p.y - 30}
                        width="70"
                        height="22"
                        rx="5"
                        fill="#0f172a"
                      />
                      <text
                        x={p.x}
                        y={p.y - 15}
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-white font-mono"
                      >
                        {activeMetric === 'maintenance'
                          ? `${p.val.toFixed(2)}x`
                          : `${p.val.toFixed(1)}%`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 3. Year-by-Year Degradation & Action Matrix */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
              <th className="py-2.5 px-3">Tahun</th>
              <th className="py-2.5 px-3">Kumulatif SMU</th>
              <th className="py-2.5 px-3">Keausan</th>
              <th className="py-2.5 px-3">MTBF / MTTR</th>
              <th className="py-2.5 px-3">Ketersediaan (MA)</th>
              <th className="py-2.5 px-3">Prod OB (bcm/j)</th>
              <th className="py-2.5 px-3">Prod Batubara (t/j)</th>
              <th className="py-2.5 px-3">Fuel Surge</th>
              <th className="py-2.5 px-3">Biaya Servis</th>
              <th className="py-2.5 px-3">Rekomendasi Manajemen Alat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {degradationCurve.map((row) => {
              const isHovered = hoveredYear === row.year;
              return (
                <tr
                  key={row.year}
                  onMouseEnter={() => setHoveredYear(row.year)}
                  onMouseLeave={() => setHoveredYear(null)}
                  className={`transition-colors ${
                    isHovered ? 'bg-amber-50/60' : 'hover:bg-slate-50'
                  } ${
                    row.actionSeverity === 'rebuild'
                      ? 'bg-blue-50/40'
                      : row.actionSeverity === 'critical'
                      ? 'bg-rose-50/40'
                      : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    Tahun {row.year}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {row.cumulativeSmu.toLocaleString()} Jam
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-700">
                    {row.wearPercent}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {row.mtbfHours}j / {row.mttrHours}j
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        row.mechanicalAvailability >= 85
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.mechanicalAvailability >= 75
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {row.mechanicalAvailability}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {row.effectiveObProductivityBcmHr} bcm/j
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {row.effectiveCoalProductivityTonHr} t/j
                  </td>
                  <td className="py-2.5 px-3 text-orange-700 font-medium">
                    +{((row.fuelBurnMultiplier - 1.0) * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {row.maintenanceCostMultiplier.toFixed(2)}x
                  </td>
                  <td className="py-2.5 px-3 font-sans text-xs">
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        row.actionSeverity === 'rebuild'
                          ? 'text-blue-700 font-bold'
                          : row.actionSeverity === 'critical'
                          ? 'text-rose-700 font-bold'
                          : row.actionSeverity === 'warning'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {row.actionSeverity === 'rebuild' && (
                        <Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                      {row.actionSeverity === 'critical' && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      {row.actionSeverity === 'normal' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                      <span>{row.actionRequired}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Engineering Summary & Standards Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span className="font-bold text-slate-800 block mb-1">
            Standar Batas Overhaul (Caterpillar / Komatsu)
          </span>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Major engine and hydraulic component rebuild direkomendasikan pada rentang{' '}
            <strong>16,000 – 18,000 jam SMU</strong>. Melebihi ambang batas ini tanpa rebuild
            meningkatkan probabilitas breakdown mendadak hingga 4.2x lipat.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span className="font-bold text-slate-800 block mb-1">
            Kepmen ESDM No. 1827/2018 (Lampiran II)
          </span>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Regulasi teknis keselamatan operasi pertambangan mewajibkan kelaikan operasi alat berat
            (KTT/Pengawas Operasional) dengan inspeksi berkala (PPM) dan uji pengereman, kemudi, serta
            sistem pemadam kebakaran otomatis.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span className="font-bold text-slate-800 block mb-1">
            Implikasi Biaya Terhadap OPEX Tambang
          </span>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Pada skenario tanpa overhaul (Deferred), biaya suku cadang meningkat hingga{' '}
            <strong>2.1x lipat</strong> di Tahun ke-6, dan kehilangan produktivitas OB mencapai{' '}
            <strong>-28%</strong>, memicu kenaikan stripping cash cost per ton batubara.
          </p>
        </div>
      </div>
    </div>
  );
};
