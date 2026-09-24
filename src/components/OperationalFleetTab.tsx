import React, { useState } from 'react';
import {
  Gauge,
  Truck,
  Pickaxe,
  CloudRain,
  Fuel,
  Compass,
  Layers,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Clock,
  Wrench,
  Activity,
  PlusCircle,
  Timer,
  ChevronDown,
  ChevronUp,
  Sliders,
  DollarSign,
  Zap,
  Copy,
  Trash2,
  Edit3,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ProjectScenario,
  OperationalCalculations,
  HeavyEquipmentUnit,
  EquipmentType,
  CurrencyType,
} from '../types/mining';
import { EquipmentCatalogModal } from './EquipmentCatalogModal';
import { EquipmentSpecificationModal } from './EquipmentSpecificationModal';
import { AddEquipmentModal } from './AddEquipmentModal';
import { ActivityCostingCard } from './ActivityCostingCard';
import { EquipmentDegradationCard } from './EquipmentDegradationCard';
import { EquipmentCatalogItem } from '../data/equipmentCatalog';
import { EQUIPMENT_TYPE_DEFINITIONS } from '../data/equipmentTypes';
import { formatMoney, formatUnitRate } from '../utils/miningMath';

interface OperationalFleetTabProps {
  scenario: ProjectScenario;
  operational: OperationalCalculations;
  currency: CurrencyType;
  onUpdateReserves: (updates: Partial<ProjectScenario['reserves']>) => void;
  onUpdateLocation: (updates: Partial<ProjectScenario['locationRoad']>) => void;
  onUpdateWeather: (updates: Partial<ProjectScenario['weatherCorrection']>) => void;
  onUpdateEquipment: (index: number, updates: Partial<HeavyEquipmentUnit>) => void;
  onAddEquipment?: (unit: HeavyEquipmentUnit) => void;
  onDeleteEquipment?: (index: number) => void;
  onDuplicateEquipment?: (index: number) => void;
  onOpenRegulationModal: (key: string) => void;
}

export const OperationalFleetTab: React.FC<OperationalFleetTabProps> = ({
  scenario,
  operational,
  currency,
  onUpdateReserves,
  onUpdateLocation,
  onUpdateWeather,
  onUpdateEquipment,
  onAddEquipment,
  onDeleteEquipment,
  onDuplicateEquipment,
  onOpenRegulationModal,
}) => {
  const { reserves, locationRoad, weatherCorrection, equipments } = scenario;
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSpecIndex, setSelectedSpecIndex] = useState<number | null>(null);
  const [showAdvancedWear, setShowAdvancedWear] = useState(true);
  const [activeCycleTab, setActiveCycleTab] = useState<'OB' | 'COAL'>('OB');
  const exchangeRateIdr = scenario.financials.currencyExchangeRateIdrUsd;

  const handleApplyCatalogEquipment = (
    item: EquipmentCatalogItem,
    targetFleetId?: string
  ) => {
    let targetIdx = -1;
    if (targetFleetId) {
      targetIdx = equipments.findIndex((eq) => eq.id === targetFleetId);
    } else {
      targetIdx = equipments.findIndex((eq) => eq.type === item.category);
    }

    const updates: Partial<HeavyEquipmentUnit> = {
      brand: item.brand,
      model: item.model,
      bucketOrVesselCapacity: item.bucketOrVesselCapacity,
      fuelBurnRateLph: item.fuelBurnRateLph,
      meanTimeBetweenFailuresHours: item.standardMtbfHours,
      meanTimeToRepairHours: item.standardMttrHours,
      enginePowerHp: item.enginePowerHp,
      operatingWeightTon: item.operatingWeightTon,
      purchasePriceUsd: item.purchasePriceUsd,
      maintenanceCostHourlyUsd: item.hourlyMaintenanceCostUsd,
      tyreOrTrackWearHourlyUsd: item.tyreOrTrackWearHourlyUsd,
    };

    if (item.standardCycleTimeSec > 0) {
      if (item.category.startsWith('EXCAVATOR')) {
        updates.digCycleTimeSec = item.standardCycleTimeSec;
      } else {
        updates.spotAndDumpingTimeSec = item.standardCycleTimeSec;
      }
    }

    if (targetIdx !== -1) {
      onUpdateEquipment(targetIdx, updates);
    } else if (onAddEquipment) {
      onAddEquipment({
        id: `fleet-${Date.now()}`,
        name: `${item.brand} ${item.model}`,
        type: item.category as any,
        brand: item.brand,
        model: item.model,
        fleetCount: 2,
        bucketOrVesselCapacity: item.bucketOrVesselCapacity,
        fuelBurnRateLph: item.fuelBurnRateLph,
        hourlyRateUsd: item.purchasePriceUsd ? Math.round(item.purchasePriceUsd / 12000) : 120,
        digCycleTimeSec: item.category.startsWith('EXCAVATOR')
          ? item.standardCycleTimeSec
          : 25,
        spotAndDumpingTimeSec: item.category.startsWith('HAULER')
          ? item.standardCycleTimeSec
          : 60,
        workingHoursW: 450,
        idleHoursS: 80,
        repairHoursR: 70,
        wearAndTearPercent: 15,
        ageYears: 2,
        cumulativeHours: 4500,
        preventiveMaintenanceIntervalHours: 250,
        scheduledPmHoursPerMonth: 35,
        meanTimeBetweenFailuresHours: item.standardMtbfHours,
        meanTimeToRepairHours: item.standardMttrHours,
        purchasePriceUsd: item.purchasePriceUsd,
        maintenanceCostHourlyUsd: item.hourlyMaintenanceCostUsd,
        tyreOrTrackWearHourlyUsd: item.tyreOrTrackWearHourlyUsd,
        enginePowerHp: item.enginePowerHp,
        operatingWeightTon: item.operatingWeightTon,
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Operational Overview & Fleet Matching Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Pfleider & Caterpillar Mining Performance Standards
              </span>
              <button
                onClick={() => onOpenRegulationModal('MATCH_FACTOR')}
                className="text-slate-400 hover:text-slate-600"
                title="Penjelasan Match Factor"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Analisa Sinkronisasi Fleet (Match Factor) & Target Produksi
            </h3>
            <p className="text-xs text-slate-500">
              Keseimbangan alat gali-muat & alat angkut overburden serta batubara dengan koreksi dinamika keausan dan cuaca
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Match Factor OB Card */}
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  MF Overburden
                </span>
                <span className="text-lg font-mono font-bold text-slate-900">
                  {operational.matchFactorOB.toFixed(2)}
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                  operational.matchFactorStatusOB === 'OPTIMAL'
                    ? 'bg-emerald-100 text-emerald-800'
                    : operational.matchFactorStatusOB === 'LOADER_IDLE'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {operational.matchFactorStatusOB === 'OPTIMAL'
                  ? 'Sinkron Sempurna'
                  : operational.matchFactorStatusOB === 'LOADER_IDLE'
                  ? 'Loader Idle (Truk Kurang)'
                  : 'Truk Antri (Truck Queue)'}
              </span>
            </div>

            {/* Match Factor Coal Card */}
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  MF Batubara
                </span>
                <span className="text-lg font-mono font-bold text-slate-900">
                  {operational.matchFactorCoal.toFixed(2)}
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                  operational.matchFactorStatusCoal === 'OPTIMAL'
                    ? 'bg-emerald-100 text-emerald-800'
                    : operational.matchFactorStatusCoal === 'LOADER_IDLE'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {operational.matchFactorStatusCoal === 'OPTIMAL'
                  ? 'Optimal'
                  : operational.matchFactorStatusCoal === 'LOADER_IDLE'
                  ? 'Loader Idle'
                  : 'Truk Antri'}
              </span>
            </div>
          </div>
        </div>

        {/* Fleet Gap Analysis: Real vs Target Rencana */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
          {/* OB Gap */}
          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-800">
                Pengupasan Overburden (OB Removal)
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {operational.obProductionAchievementPercent.toFixed(1)}% Ketercapaian
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all ${
                  operational.obProductionAchievementPercent >= 100
                    ? 'bg-emerald-500'
                    : operational.obProductionAchievementPercent >= 90
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{
                  width: `${Math.min(100, operational.obProductionAchievementPercent)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
              <span>
                Target:{' '}
                <strong className="text-slate-700">
                  {(operational.annualObTargetBcm / 1_000_000).toFixed(2)}M BCM
                </strong>
              </span>
              <span>
                Kapasitas Armada:{' '}
                <strong
                  className={
                    operational.annualObActualFleetBcm >= operational.annualObTargetBcm
                      ? 'text-emerald-600 font-bold'
                      : 'text-rose-600 font-bold'
                  }
                >
                  {(operational.annualObActualFleetBcm / 1_000_000).toFixed(2)}M BCM
                </strong>
              </span>
            </div>
          </div>

          {/* Coal Gap */}
          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-800">
                Produksi Batubara (Coal Getting & Hauling)
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {operational.coalProductionAchievementPercent.toFixed(1)}% Ketercapaian
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all ${
                  operational.coalProductionAchievementPercent >= 100
                    ? 'bg-emerald-500'
                    : operational.coalProductionAchievementPercent >= 90
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{
                  width: `${Math.min(100, operational.coalProductionAchievementPercent)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
              <span>
                Target:{' '}
                <strong className="text-slate-700">
                  {(operational.annualCoalTargetTon / 1_000_000).toFixed(2)}M Ton
                </strong>
              </span>
              <span>
                Kapasitas Armada:{' '}
                <strong
                  className={
                    operational.annualCoalActualFleetTon >= operational.annualCoalTargetTon
                      ? 'text-emerald-600 font-bold'
                      : 'text-rose-600 font-bold'
                  }
                >
                  {(operational.annualCoalActualFleetTon / 1_000_000).toFixed(2)}M Ton
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Granular Cycle Time Breakdown Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Timer className="w-5 h-5 text-amber-500" />
              <span>Komponen Granular Waktu Siklus (Cycle Time Breakdown)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Analisa mendalam elemen gali, swing berbeban, dumping, swing kosong, waktu antri/manuver truk, waktu angkut, dan passing bucket
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              id="cycle-tab-ob"
              onClick={() => setActiveCycleTab('OB')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                activeCycleTab === 'OB'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Armada Overburden (OB)
            </button>
            <button
              id="cycle-tab-coal"
              onClick={() => setActiveCycleTab('COAL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                activeCycleTab === 'COAL'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Armada Batubara (Coal)
            </button>
          </div>
        </div>

        {activeCycleTab === 'OB' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
            {/* Loader Cycle OB */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Pickaxe className="w-4 h-4 text-amber-600" />
                  Siklus Loader OB (Excavator Gali-Muat)
                </span>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Total: {operational.cycleTimeOB.loaderTotalCycleSec} detik
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Digging (Gali)</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {operational.cycleTimeOB.loaderDigSec}s
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Swing Muat</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {operational.cycleTimeOB.loaderSwingLoadedSec}s
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Dumping (Tumpah)</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {operational.cycleTimeOB.loaderDumpSec}s
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Swing Kosong</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {operational.cycleTimeOB.loaderSwingEmptySec}s
                  </strong>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 flex justify-between">
                <span>Passes ke Dump Truck: <strong>{operational.cycleTimeOB.haulerPassesRequired} Pass Bucket</strong></span>
                <span>Produktivitas: <strong>{Math.round(operational.obExcavatorProductivityBcmPerHour)} BCM/jam</strong></span>
              </div>
            </div>

            {/* Hauler Cycle OB */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Siklus Hauler OB (Dump Truck ke Disposal)
                </span>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Total: {operational.cycleTimeOB.haulerTotalCycleMin} menit
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Spot Antri</span>
                  <strong className="text-slate-900 font-mono">
                    {operational.cycleTimeOB.haulerSpotAtLoaderSec}s
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Loading</span>
                  <strong className="text-slate-900 font-mono">
                    {operational.cycleTimeOB.haulerLoadingTimeMin}m
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Haul Isi</span>
                  <strong className="text-slate-900 font-mono">
                    {operational.cycleTimeOB.haulerHaulLoadedMin}m
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Dump & Spot</span>
                  <strong className="text-slate-900 font-mono">
                    {operational.cycleTimeOB.haulerSpotAndDumpMin}m
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Return</span>
                  <strong className="text-slate-900 font-mono">
                    {operational.cycleTimeOB.haulerReturnEmptyMin}m
                  </strong>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 flex justify-between">
                <span>Ritase: <strong>{operational.cycleTimeOB.haulerTripsPerHour} Rit/Jam</strong></span>
                <span>Jarak Disposal: <strong>{locationRoad.obDumpDistanceKm} km</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
            {/* Loader Cycle Coal */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Pickaxe className="w-4 h-4 text-emerald-600" />
                  Siklus Loader Batubara (Seam Loading)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Total: {operational.cycleTimeCoal.loaderTotalCycleSec} detik
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Digging (Gali)</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {operational.cycleTimeCoal.loaderDigSec}s
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Swing Muat</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {operational.cycleTimeCoal.loaderSwingLoadedSec}s
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Dumping (Tumpah)</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {operational.cycleTimeCoal.loaderDumpSec}s
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Swing Kosong</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {operational.cycleTimeCoal.loaderSwingEmptySec}s
                  </strong>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 flex justify-between">
                <span>Passes ke Hauler Coal: <strong>{operational.cycleTimeCoal.haulerPassesRequired} Pass Bucket</strong></span>
                <span>Produktivitas: <strong>{Math.round(operational.coalExcavatorProductivityTonPerHour)} Ton/jam</strong></span>
              </div>
            </div>

            {/* Hauler Cycle Coal */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-purple-600" />
                  Siklus Hauler Batubara ke ROM / Jetty
                </span>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Total: {operational.cycleTimeCoal.haulerTotalCycleMin} menit
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Spot Antri</span>
                  <strong className="text-slate-900 font-mono">
                    {operational.cycleTimeCoal.haulerSpotAtLoaderSec}s
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Loading</span>
                  <strong className="text-slate-900 font-mono">
                    {operational.cycleTimeCoal.haulerLoadingTimeMin}m
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Haul Isi</span>
                  <strong className="text-slate-900 font-mono">
                    {operational.cycleTimeCoal.haulerHaulLoadedMin}m
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Dump Hopper</span>
                  <strong className="text-slate-900 font-mono">
                    {operational.cycleTimeCoal.haulerSpotAndDumpMin}m
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Return</span>
                  <strong className="text-slate-900 font-mono">
                    {operational.cycleTimeCoal.haulerReturnEmptyMin}m
                  </strong>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 flex justify-between">
                <span>Ritase: <strong>{operational.cycleTimeCoal.haulerTripsPerHour} Rit/Jam</strong></span>
                <span>Jarak ke ROM/Port: <strong>{locationRoad.coalHaulDistanceKm} km</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Operational Environment: Geology, Road, Weather Correction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geologi & Cadangan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Geologi & Cadangan</span>
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              KCMI / JORC
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                Target Produksi Batubara (Juta Ton / Tahun)
              </label>
              <input
                type="number"
                step="0.1"
                value={reserves.targetAnnualProductionMt}
                onChange={(e) =>
                  onUpdateReserves({ targetAnnualProductionMt: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                Rencana Stripping Ratio (BCM / Ton)
              </label>
              <input
                type="number"
                step="0.1"
                value={reserves.plannedStrippingRatio}
                onChange={(e) =>
                  onUpdateReserves({ plannedStrippingRatio: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                Total Cadangan Tertambang (Juta Ton)
              </label>
              <input
                type="number"
                step="0.5"
                value={reserves.totalReserveMt}
                onChange={(e) =>
                  onUpdateReserves({ totalReserveMt: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Kalori (kcal/kg GAR)</label>
                <input
                  type="number"
                  step="50"
                  value={reserves.calorificValueGar}
                  onChange={(e) =>
                    onUpdateReserves({ calorificValueGar: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Umur Tambang (Thn)</label>
                <input
                  type="number"
                  step="1"
                  value={reserves.mineLifeYears}
                  onChange={(e) =>
                    onUpdateReserves({ mineLifeYears: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Swell Factor OB</label>
                <input
                  type="number"
                  step="0.01"
                  value={reserves.swellFactorOb}
                  onChange={(e) =>
                    onUpdateReserves({ swellFactorOb: parseFloat(e.target.value) || 0.8 })
                  }
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Densitas Insitu Coal</label>
                <input
                  type="number"
                  step="0.05"
                  value={reserves.insituDensityCoal}
                  onChange={(e) =>
                    onUpdateReserves({ insituDensityCoal: parseFloat(e.target.value) || 1.3 })
                  }
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lokasi & Jalan Tambang */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-500" />
              <span>Lokasi, Jalan & Elevasi</span>
            </h4>
            <button
              onClick={() => onOpenRegulationModal('KEPMEN_1827_2018')}
              className="text-slate-400 hover:text-slate-600"
              title="Standar Geometri Jalan Tambang ESDM"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                Jarak Buang OB ke Disposal (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={locationRoad.obDumpDistanceKm}
                onChange={(e) =>
                  onUpdateLocation({ obDumpDistanceKm: parseFloat(e.target.value) || 0.1 })
                }
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                Jarak Hauling Batubara ke ROM / Jetty (km)
              </label>
              <input
                type="number"
                step="0.5"
                value={locationRoad.coalHaulDistanceKm}
                onChange={(e) =>
                  onUpdateLocation({ coalHaulDistanceKm: parseFloat(e.target.value) || 0.5 })
                }
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Grade Jalan (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={locationRoad.roadGradePercent}
                  onChange={(e) =>
                    onUpdateLocation({ roadGradePercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Rolling Resist (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={locationRoad.rollingResistancePercent}
                  onChange={(e) =>
                    onUpdateLocation({
                      rollingResistancePercent: parseFloat(e.target.value) || 2,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Kondisi Jalan</label>
                <select
                  value={locationRoad.soilCondition}
                  onChange={(e) =>
                    onUpdateLocation({ soilCondition: e.target.value as any })
                  }
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-800"
                >
                  <option value="KERAS_PADAT">Keras & Padat</option>
                  <option value="SEDANG">Sedang</option>
                  <option value="LUNAK_BECEK">Lunak / Berlumpur</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Kecepatan Muat (km/h)</label>
                <input
                  type="number"
                  step="1"
                  value={locationRoad.averageHaulSpeedLoadedKmh}
                  onChange={(e) =>
                    onUpdateLocation({
                      averageHaulSpeedLoadedKmh: parseFloat(e.target.value) || 15,
                    })
                  }
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cuaca & Koreksi Efisiensi Operasional */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-purple-500" />
              <span>Hujan, Lumpur & Operator</span>
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              Loss Hours: {operational.weatherDelayPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                Hambatan Hujan Langsung (Jam / Bulan)
              </label>
              <input
                type="number"
                step="5"
                value={weatherCorrection.rainDelayHoursPerMonth}
                onChange={(e) =>
                  onUpdateWeather({ rainDelayHoursPerMonth: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                Waktu Jalan Licin / Slippery (Jam / Bulan)
              </label>
              <input
                type="number"
                step="5"
                value={weatherCorrection.slipperyDelayHoursPerMonth}
                onChange={(e) =>
                  onUpdateWeather({ slipperyDelayHoursPerMonth: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Faktor Operator (0.7-1)</label>
                <input
                  type="number"
                  step="0.05"
                  value={weatherCorrection.operatorSkillFactor}
                  onChange={(e) =>
                    onUpdateWeather({ operatorSkillFactor: parseFloat(e.target.value) || 0.8 })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Job Efficiency (0.7-1)</label>
                <input
                  type="number"
                  step="0.05"
                  value={weatherCorrection.jobEfficiencyFactor}
                  onChange={(e) =>
                    onUpdateWeather({ jobEfficiencyFactor: parseFloat(e.target.value) || 0.8 })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Jam Kerja Efektif Tahunan:</span>
                <strong className="text-slate-900 font-mono">
                  {Math.round(operational.effectiveWorkingHoursPerYear).toLocaleString('id-ID')} Jam
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Jam Kerja Efektif Bulanan:</span>
                <strong className="text-slate-900 font-mono">
                  {Math.round(operational.effectiveWorkingHoursPerMonth)} Jam / Bln
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Heavy Equipment Fleet Composition & Availability Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pickaxe className="w-5 h-5 text-slate-800" />
                <span>Komposisi Alat Berat, Siklus Kerja & Ketersediaan Mekanis (MA, PA, UA, EU)</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilihan jenis tipe alat, jumlah unit, dimensi kapasitas, konsumsi solar, dan spesifikasi mekanis dapat disesuaikan secara dinamis.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="add-equipment-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Unit Baru</span>
            </button>

            <button
              id="open-catalog-top-btn"
              onClick={() => setIsCatalogOpen(true)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-300/70"
            >
              <Truck className="w-3.5 h-3.5 text-slate-600" />
              <span>Katalog Alat OEM & ESDM</span>
            </button>

            <button
              id="toggle-wear-details-btn"
              onClick={() => setShowAdvancedWear(!showAdvancedWear)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>{showAdvancedWear ? 'Sembunyikan' : 'Tampilkan'} Keausan & MTBF</span>
              {showAdvancedWear ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => onOpenRegulationModal('EQUIPMENT_AVAILABILITY_STANDARDS')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Standar MA/PA/UA/EU</span>
            </button>
          </div>
        </div>

        {/* Fleet Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Total Armada Aktif</span>
            <span className="text-base font-bold font-mono text-slate-900">
              {equipments.reduce((acc, eq) => acc + (eq.fleetCount || 0), 0)} Unit
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Total Daya Mesin</span>
            <span className="text-base font-bold font-mono text-amber-700">
              {equipments.reduce((acc, eq) => acc + (eq.enginePowerHp || 0) * (eq.fleetCount || 0), 0).toLocaleString('id-ID')} HP
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Total Konsumsi Solar</span>
            <span className="text-base font-bold font-mono text-orange-700">
              {equipments.reduce((acc, eq) => acc + (eq.fuelBurnRateLph || 0) * (eq.fleetCount || 0), 0).toLocaleString('id-ID')} L/jam
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Model Terpasang</span>
            <span className="text-base font-bold font-mono text-blue-700">
              {equipments.length} Jenis Tipe
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="p-3 rounded-tl-xl min-w-[170px]">Jenis Tipe Alat</th>
                <th className="p-3 min-w-[130px]">Model & Merek</th>
                <th className="p-3 text-center min-w-[95px]">Jumlah Unit</th>
                <th className="p-3 text-center min-w-[85px]">Kapasitas</th>
                <th className="p-3 text-center min-w-[70px]">Cycle (s)</th>
                <th className="p-3 text-center min-w-[75px]">Solar (L/h)</th>
                <th className="p-3 text-center min-w-[65px]">W (Jam)</th>
                <th className="p-3 text-center min-w-[65px]">S (Jam)</th>
                <th className="p-3 text-center min-w-[65px]">R (Jam)</th>
                <th className="p-3 text-center">MA (%)</th>
                <th className="p-3 text-center">PA (%)</th>
                <th className="p-3 text-center">UA (%)</th>
                <th className="p-3 text-center">EU (%)</th>
                <th className="p-3 text-center rounded-tr-xl min-w-[110px]">Aksi & Spesifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {equipments.map((eq, idx) => {
                const W = eq.workingHoursW || 450;
                const S = eq.idleHoursS || 80;
                const R = eq.repairHoursR || 70;
                const total = W + S + R || 1;
                const ma = (W / (W + R || 1)) * 100;
                const pa = ((W + S) / total) * 100;
                const ua = (W / (W + S || 1)) * 100;
                const eu = (W / total) * 100;

                const typeDef = EQUIPMENT_TYPE_DEFINITIONS[eq.type] || EQUIPMENT_TYPE_DEFINITIONS.EXCAVATOR_OB;

                return (
                  <React.Fragment key={eq.id}>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Tipe Alat Selector */}
                      <td className="p-3">
                        <select
                          value={eq.type}
                          onChange={(e) =>
                            onUpdateEquipment(idx, { type: e.target.value as EquipmentType })
                          }
                          className={`w-full px-2 py-1 rounded-lg border text-xs font-semibold focus:ring-1 focus:ring-amber-500 ${typeDef.badgeBg} ${typeDef.badgeText} ${typeDef.badgeBorder}`}
                        >
                          {Object.values(EQUIPMENT_TYPE_DEFINITIONS).map((def) => (
                            <option key={def.type} value={def.type}>
                              {def.shortLabel}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* 2. Model & Merek */}
                      <td className="p-3 text-slate-700">
                        <input
                          type="text"
                          title="Model Unit"
                          value={eq.model}
                          onChange={(e) =>
                            onUpdateEquipment(idx, { model: e.target.value })
                          }
                          className="w-full font-bold px-2 py-1 bg-white border border-slate-200 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-slate-900"
                        />
                        <input
                          type="text"
                          title="Merek / Pabrikan"
                          placeholder="Merek (e.g. Komatsu)"
                          value={eq.brand || ''}
                          onChange={(e) =>
                            onUpdateEquipment(idx, { brand: e.target.value })
                          }
                          className="w-full text-[11px] text-slate-500 px-2 py-0.5 mt-1 bg-transparent border border-transparent hover:border-slate-200 rounded"
                        />
                      </td>

                      {/* 3. Jumlah Unit (with quick stepper) */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateEquipment(idx, {
                                fleetCount: Math.max(1, (eq.fleetCount || 1) - 1),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-300"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={eq.fleetCount}
                            onChange={(e) =>
                              onUpdateEquipment(idx, {
                                fleetCount: Math.max(1, parseInt(e.target.value) || 1),
                              })
                            }
                            className="w-11 px-1 py-1 text-center font-mono font-bold text-xs bg-amber-50/50 border border-amber-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateEquipment(idx, {
                                fleetCount: (eq.fleetCount || 1) + 1,
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-300"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* 4. Kapasitas (with dynamic unit) */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            value={eq.bucketOrVesselCapacity}
                            onChange={(e) =>
                              onUpdateEquipment(idx, {
                                bucketOrVesselCapacity: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-14 px-1 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded"
                          />
                          <span className="text-[10px] font-semibold text-slate-500">
                            {typeDef.capacityUnit}
                          </span>
                        </div>
                      </td>

                      {/* 5. Cycle Time */}
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={eq.type.startsWith('EXCAVATOR') ? (eq.digCycleTimeSec ?? 26) : (eq.spotAndDumpingTimeSec ?? 60)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            if (eq.type.startsWith('EXCAVATOR')) {
                              onUpdateEquipment(idx, { digCycleTimeSec: val });
                            } else {
                              onUpdateEquipment(idx, { spotAndDumpingTimeSec: val });
                            }
                          }}
                          className="w-14 px-1 py-1 text-center font-mono bg-white border border-slate-300 rounded"
                        />
                      </td>

                      {/* 6. Solar (L/h) */}
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={eq.fuelBurnRateLph}
                          onChange={(e) =>
                            onUpdateEquipment(idx, {
                              fuelBurnRateLph: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-14 px-1 py-1 text-center font-mono font-semibold text-orange-700 bg-orange-50/50 border border-orange-200 rounded"
                        />
                      </td>

                      {/* 7. Working W */}
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={eq.workingHoursW}
                          onChange={(e) =>
                            onUpdateEquipment(idx, {
                              workingHoursW: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-12 px-1 py-1 text-center font-mono bg-white border border-slate-200 rounded"
                        />
                      </td>

                      {/* 8. Standby S */}
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={eq.idleHoursS}
                          onChange={(e) =>
                            onUpdateEquipment(idx, {
                              idleHoursS: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-12 px-1 py-1 text-center font-mono bg-white border border-slate-200 rounded"
                        />
                      </td>

                      {/* 9. Repair R */}
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={eq.repairHoursR}
                          onChange={(e) =>
                            onUpdateEquipment(idx, {
                              repairHoursR: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-12 px-1 py-1 text-center font-mono bg-white border border-slate-200 rounded"
                        />
                      </td>

                      {/* 10-13. Availability Indices */}
                      <td className="p-3 text-center font-mono font-bold text-slate-800">
                        {ma.toFixed(1)}%
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800">
                        {pa.toFixed(1)}%
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800">
                        {ua.toFixed(1)}%
                      </td>
                      <td className="p-3 text-center font-mono font-black text-slate-900 bg-slate-50">
                        {eu.toFixed(1)}%
                      </td>

                      {/* 14. Action Buttons */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title="Buka Spesifikasi Detail & Parameter Teknis"
                            onClick={() => setSelectedSpecIndex(idx)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 transition"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {onDuplicateEquipment && (
                            <button
                              type="button"
                              title="Duplikat Unit Ini"
                              onClick={() => onDuplicateEquipment(idx)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onDeleteEquipment && (
                            <button
                              type="button"
                              title={
                                equipments.length <= 1
                                  ? 'Armada minimal harus memiliki 1 unit'
                                  : 'Hapus Unit dari Armada'
                              }
                              disabled={equipments.length <= 1}
                              onClick={() => onDeleteEquipment(idx)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-700 disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-700 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Advanced Dynamic Degradation & Maintenance Sub-row */}
                    {showAdvancedWear && (
                      <tr className="bg-slate-50/90 text-[11px] border-b border-slate-200">
                        <td colSpan={14} className="px-4 py-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-3 text-slate-600">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              <Wrench className="w-3.5 h-3.5 text-amber-600" />
                              <span>Keandalan & Dinamika Keausan:</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span>Umur:</span>
                              <input
                                type="number"
                                step="0.5"
                                value={eq.ageYears ?? 2}
                                onChange={(e) =>
                                  onUpdateEquipment(idx, {
                                    ageYears: parseFloat(e.target.value) || 1,
                                  })
                                }
                                className="w-12 px-1 py-0.5 font-mono bg-white border border-slate-300 rounded text-center"
                              />
                              <span>Thn</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span>Jam SMU:</span>
                              <input
                                type="number"
                                step="500"
                                value={eq.cumulativeHours ?? 5000}
                                onChange={(e) =>
                                  onUpdateEquipment(idx, {
                                    cumulativeHours: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-16 px-1 py-0.5 font-mono bg-white border border-slate-300 rounded text-center"
                              />
                              <span>Jam</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span>Keausan:</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={eq.wearAndTearPercent ?? 15}
                                onChange={(e) =>
                                  onUpdateEquipment(idx, {
                                    wearAndTearPercent: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-12 px-1 py-0.5 font-mono bg-white border border-slate-300 rounded text-center font-bold text-amber-700"
                              />
                              <span>%</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span>PM Berkala:</span>
                              <input
                                type="number"
                                step="5"
                                value={eq.scheduledPmHoursPerMonth ?? 35}
                                onChange={(e) =>
                                  onUpdateEquipment(idx, {
                                    scheduledPmHoursPerMonth: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-12 px-1 py-0.5 font-mono bg-white border border-slate-300 rounded text-center"
                              />
                              <span>Jam/Bln</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span>MTBF:</span>
                              <input
                                type="number"
                                step="20"
                                value={eq.meanTimeBetweenFailuresHours ?? 120}
                                onChange={(e) =>
                                  onUpdateEquipment(idx, {
                                    meanTimeBetweenFailuresHours: parseFloat(e.target.value) || 100,
                                  })
                                }
                                className="w-14 px-1 py-0.5 font-mono bg-white border border-slate-300 rounded text-center"
                              />
                              <span>Jam</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span>MTTR:</span>
                              <input
                                type="number"
                                step="0.5"
                                value={eq.meanTimeToRepairHours ?? 4.5}
                                onChange={(e) =>
                                  onUpdateEquipment(idx, {
                                    meanTimeToRepairHours: parseFloat(e.target.value) || 4,
                                  })
                                }
                                className="w-12 px-1 py-0.5 font-mono bg-white border border-slate-300 rounded text-center"
                              />
                              <span>Jam</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedSpecIndex(idx)}
                              className="text-amber-700 hover:text-amber-800 font-bold hover:underline ml-auto"
                            >
                              Edit Spesifikasi Lengkap &rarr;
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Activity-Based Costing (ABC) Granular Unit Rate Breakdown */}
      <ActivityCostingCard
        activityCosting={operational.activityCosting}
        currency={currency}
        exchangeRateIdr={exchangeRateIdr}
      />

      {/* 6. Life-of-Mine Equipment Degradation & Reliability Curve */}
      <EquipmentDegradationCard
        scenario={scenario}
        operational={operational}
        currency={currency}
        onOpenRegulationModal={onOpenRegulationModal}
      />

      {/* 7. Fuel & Energy Consumption Efficiency Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">
              Total Konsumsi Solar Armada
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {(operational.totalAnnualFuelLiters / 1_000_000).toFixed(2)} Juta L / Thn
            </div>
            <span className="text-[11px] text-slate-400">
              Solar B35 Industri ESDM
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">
              Fuel Ratio per Ton Batubara
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {operational.fuelRatioLiterPerTonCoal.toFixed(2)} Liter / Ton
            </div>
            <span className="text-[11px] text-slate-400">
              Gali + Hauling ke ROM/Port
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">
              Fuel Ratio per BCM Overburden
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {operational.fuelRatioLiterPerBcmOb.toFixed(2)} Liter / BCM
            </div>
            <span className="text-[11px] text-slate-400">
              Pengupasan OB + Dumping
            </span>
          </div>
        </div>
      </div>

      {/* Equipment Catalog Modal */}
      <EquipmentCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectEquipment={handleApplyCatalogEquipment}
        currentFleet={equipments}
        currency={currency}
        exchangeRateIdr={exchangeRateIdr}
      />

      {/* Equipment Detailed Specification Customizer Modal */}
      {selectedSpecIndex !== null && equipments[selectedSpecIndex] && (
        <EquipmentSpecificationModal
          isOpen={selectedSpecIndex !== null}
          onClose={() => setSelectedSpecIndex(null)}
          unit={equipments[selectedSpecIndex]}
          unitIndex={selectedSpecIndex}
          onSave={onUpdateEquipment}
          currency={currency}
          exchangeRateIdr={exchangeRateIdr}
        />
      )}

      {/* Add Equipment Modal */}
      {onAddEquipment && (
        <AddEquipmentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddEquipment={onAddEquipment}
          currency={currency}
          exchangeRateIdr={exchangeRateIdr}
        />
      )}
    </div>
  );
};
