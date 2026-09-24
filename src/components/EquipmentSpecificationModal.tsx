import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Check,
  Fuel,
  Wrench,
  Layers,
  Gauge,
  Weight,
  Clock,
  DollarSign,
  Activity,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Info,
  Truck,
  Hash,
} from 'lucide-react';
import { HeavyEquipmentUnit, EquipmentType, CurrencyType } from '../types/mining';
import {
  EQUIPMENT_TYPE_DEFINITIONS,
  POPULAR_EQUIPMENT_PRESETS,
  EquipmentPresetItem,
} from '../data/equipmentTypes';
import { formatMoney } from '../utils/miningMath';

interface EquipmentSpecificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: HeavyEquipmentUnit | null;
  unitIndex: number;
  onSave: (index: number, updates: Partial<HeavyEquipmentUnit>) => void;
  currency: CurrencyType;
  exchangeRateIdr: number;
}

export const EquipmentSpecificationModal: React.FC<EquipmentSpecificationModalProps> = ({
  isOpen,
  onClose,
  unit,
  unitIndex,
  onSave,
  currency,
  exchangeRateIdr,
}) => {
  const [formData, setFormData] = useState<Partial<HeavyEquipmentUnit>>({});
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'PERFORMANCE' | 'COSTS' | 'AVAILABILITY' | 'WEAR'>('GENERAL');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  useEffect(() => {
    if (unit) {
      setFormData({ ...unit });
      setSelectedPresetId('');
    }
  }, [unit]);

  if (!isOpen || !unit) return null;

  const typeDef = EQUIPMENT_TYPE_DEFINITIONS[formData.type || unit.type] || EQUIPMENT_TYPE_DEFINITIONS.EXCAVATOR_OB;

  // Real-time calculation of Availability Indices
  const W = formData.workingHoursW ?? unit.workingHoursW ?? 450;
  const S = formData.idleHoursS ?? unit.idleHoursS ?? 80;
  const R = formData.repairHoursR ?? unit.repairHoursR ?? 70;
  const totalHours = Math.max(1, W + S + R);
  const ma = ((W / (W + R || 1)) * 100);
  const pa = (((W + S) / totalHours) * 100);
  const ua = ((W / (W + S || 1)) * 100);
  const eu = ((W / totalHours) * 100);

  const handleApplyPreset = (presetId: string) => {
    const preset = POPULAR_EQUIPMENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setFormData((prev) => ({
      ...prev,
      type: preset.type,
      brand: preset.brand,
      model: preset.model,
      name: preset.name,
      bucketOrVesselCapacity: preset.bucketOrVesselCapacity,
      enginePowerHp: preset.enginePowerHp,
      operatingWeightTon: preset.operatingWeightTon,
      fuelBurnRateLph: preset.fuelBurnRateLph,
      hourlyRateUsd: preset.hourlyRateUsd,
      maintenanceCostHourlyUsd: preset.maintenanceCostHourlyUsd,
      tyreOrTrackWearHourlyUsd: preset.tyreOrTrackWearHourlyUsd,
      purchasePriceUsd: preset.purchasePriceUsd,
      digCycleTimeSec: preset.type.startsWith('EXCAVATOR') ? preset.cycleTimeSec : (prev.digCycleTimeSec || 25),
      spotAndDumpingTimeSec: preset.type.startsWith('HAULER') ? preset.cycleTimeSec : (prev.spotAndDumpingTimeSec || 60),
      workingHoursW: preset.workingHoursW,
      idleHoursS: preset.idleHoursS,
      repairHoursR: preset.repairHoursR,
      ageYears: preset.ageYears,
      cumulativeHours: preset.cumulativeHours,
      wearAndTearPercent: preset.wearAndTearPercent,
      meanTimeBetweenFailuresHours: preset.meanTimeBetweenFailuresHours,
      meanTimeToRepairHours: preset.meanTimeToRepairHours,
      scheduledPmHoursPerMonth: preset.scheduledPmHoursPerMonth,
    }));
    setSelectedPresetId(presetId);
  };

  const handleSave = () => {
    onSave(unitIndex, formData);
    onClose();
  };

  return (
    <div
      id="equipment-spec-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white border border-slate-200 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Spesifikasi & Parameter Teknis Alat Berat
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${typeDef.badgeBg} ${typeDef.badgeText} ${typeDef.badgeBorder}`}>
                  {typeDef.shortLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kustomisasi tipe unit, jumlah fleet, dimensi kapasitas, konsumsi solar, jam kerja operasional & dinamika keausan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Quick Loader Bar */}
        <div className="px-5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Muat Rekomendasi Preset Pabrikan (OEM Benchmark):</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPresetId}
              onChange={(e) => handleApplyPreset(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-amber-500"
            >
              <option value="">-- Pilih Model Alat Teruji --</option>
              {POPULAR_EQUIPMENT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.model} ({p.classTag})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('GENERAL')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'GENERAL'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Identitas & Kategori
          </button>
          <button
            onClick={() => setActiveTab('PERFORMANCE')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'PERFORMANCE'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Kapasitas & Tenaga Mesin
          </button>
          <button
            onClick={() => setActiveTab('AVAILABILITY')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'AVAILABILITY'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Jam Operasi & Availability (W, S, R)
          </button>
          <button
            onClick={() => setActiveTab('COSTS')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'COSTS'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Biaya Operasi & Solar
          </button>
          <button
            onClick={() => setActiveTab('WEAR')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'WEAR'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            5. Keandalan & Keausan (Reliability)
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* TAB 1: IDENTITAS & KATEGORI */}
          {activeTab === 'GENERAL' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-amber-900 leading-relaxed">
                <Info className="w-4 h-4 text-amber-600 inline mr-1.5" />
                Pilih jenis tipe alat tambang dan tentukan jumlah unit dalam armada operasional. Perubahan jenis alat akan menyesuaikan satuan kapasitas dan perhitungan siklus secara dinamis.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Jenis Tipe Alat Berat (Mining Category)
                  </label>
                  <select
                    value={formData.type || unit.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EquipmentType })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.values(EQUIPMENT_TYPE_DEFINITIONS).map((def) => (
                      <option key={def.type} value={def.type}>
                        {def.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    {typeDef.description}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Jumlah Unit Armada (Fleet Quantity)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          fleetCount: Math.max(1, (formData.fleetCount || unit.fleetCount || 1) - 1),
                        })
                      }
                      className="w-10 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-sm border border-slate-300"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={formData.fleetCount ?? unit.fleetCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fleetCount: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      className="flex-1 px-3 py-2 text-center font-mono font-bold text-base bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          fleetCount: (formData.fleetCount || unit.fleetCount || 1) + 1,
                        })
                      }
                      className="w-10 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-sm border border-slate-300"
                    >
                      +
                    </button>
                    <span className="text-slate-600 font-semibold">Unit</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Total unit aktif yang beroperasi di pit tambang.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Merek / Pabrikan (Brand)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Komatsu, Caterpillar, Hitachi, Volvo, Scania"
                    value={formData.brand ?? unit.brand ?? ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Nama Seri / Model Unit
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PC2000-8, HD785-7, 777E, D375A"
                    value={formData.model ?? unit.model ?? ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KAPASITAS & TENAGA MESIN */}
          {activeTab === 'PERFORMANCE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {typeDef.capacityLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bucketOrVesselCapacity ?? unit.bucketOrVesselCapacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bucketOrVesselCapacity: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="font-bold text-slate-700 whitespace-nowrap px-2 py-1 bg-slate-100 rounded-lg">
                      {typeDef.capacityUnit}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Kapasitas nominal per siklus pemuatan atau angkut.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Tenaga Mesin Bersih (Engine Flywheel Power)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="10"
                      value={formData.enginePowerHp ?? unit.enginePowerHp ?? 500}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enginePowerHp: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="font-bold text-slate-700 whitespace-nowrap px-2 py-1 bg-slate-100 rounded-lg">
                      HP
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Daya mesin pada RPM standar kerja tambang.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Berat Operasi (Operating Weight)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="1"
                      value={formData.operatingWeightTon ?? unit.operatingWeightTon ?? 50}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          operatingWeightTon: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 font-mono font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="font-bold text-slate-700 whitespace-nowrap px-2 py-1 bg-slate-100 rounded-lg">
                      Ton
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Berat total unit siap operasi termasuk cairan & bahan bakar.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {typeDef.cycleTimeLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="1"
                      value={
                        formData.type?.startsWith('EXCAVATOR') || unit.type.startsWith('EXCAVATOR')
                          ? formData.digCycleTimeSec ?? unit.digCycleTimeSec ?? 26
                          : formData.spotAndDumpingTimeSec ?? unit.spotAndDumpingTimeSec ?? 60
                      }
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (
                          (formData.type && formData.type.startsWith('EXCAVATOR')) ||
                          unit.type.startsWith('EXCAVATOR')
                        ) {
                          setFormData({ ...formData, digCycleTimeSec: val });
                        } else {
                          setFormData({ ...formData, spotAndDumpingTimeSec: val });
                        }
                      }}
                      className="w-full px-3 py-2 font-mono font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="font-bold text-slate-700 whitespace-nowrap px-2 py-1 bg-slate-100 rounded-lg">
                      Detik
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Waktu siklus standar pemuatan gali atau manuver spot & dumping.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JAM KERJA & AVAILABILITY */}
          {activeTab === 'AVAILABILITY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <label className="block text-emerald-900 font-bold mb-1">
                    Jam Kerja Efektif (Working - W)
                  </label>
                  <input
                    type="number"
                    value={formData.workingHoursW ?? unit.workingHoursW}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workingHoursW: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 font-mono font-bold text-emerald-950 bg-white border border-emerald-300 rounded-lg"
                  />
                  <span className="text-[10px] text-emerald-700 block mt-1">
                    Jam mesin beroperasi produktif per bulan.
                  </span>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <label className="block text-amber-900 font-bold mb-1">
                    Jam Standby / Menganggur (Idle - S)
                  </label>
                  <input
                    type="number"
                    value={formData.idleHoursS ?? unit.idleHoursS}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        idleHoursS: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 font-mono font-bold text-amber-950 bg-white border border-amber-300 rounded-lg"
                  />
                  <span className="text-[10px] text-amber-700 block mt-1">
                    Siap operasi tapi tidak bekerja (hujan/shift change).
                  </span>
                </div>

                <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl">
                  <label className="block text-rose-900 font-bold mb-1">
                    Jam Perbaikan & Servis (Repair - R)
                  </label>
                  <input
                    type="number"
                    value={formData.repairHoursR ?? unit.repairHoursR}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        repairHoursR: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 font-mono font-bold text-rose-950 bg-white border border-rose-300 rounded-lg"
                  />
                  <span className="text-[10px] text-rose-700 block mt-1">
                    Waktu henti untuk PM berkala dan perbaikan breakdown.
                  </span>
                </div>
              </div>

              {/* Live Availability Calculation Strip */}
              <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs">
                <span className="text-xs font-bold text-amber-400 block mb-3 uppercase tracking-wider">
                  Hasil Kalkulasi Baku Kelaikan Operasi (Kepmen ESDM No. 1827/2018):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Mechanical Avail. (MA)</span>
                    <span className="text-lg font-mono font-black text-emerald-400">
                      {ma.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 block">W / (W + R)</span>
                  </div>

                  <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Physical Avail. (PA)</span>
                    <span className="text-lg font-mono font-black text-blue-400">
                      {pa.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 block">(W + S) / Total</span>
                  </div>

                  <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Use of Avail. (UA)</span>
                    <span className="text-lg font-mono font-black text-amber-400">
                      {ua.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 block">W / (W + S)</span>
                  </div>

                  <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Effective Util. (EU)</span>
                    <span className="text-lg font-mono font-black text-purple-400">
                      {eu.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 block">W / Total Hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BIAYA & SOLAR */}
          {activeTab === 'COSTS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-orange-50/60 border border-orange-200 rounded-xl">
                  <label className="block text-orange-950 font-bold mb-1.5 flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-orange-600" />
                    <span>Konsumsi BBM Solar (Fuel Burn Rate)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="1"
                      value={formData.fuelBurnRateLph ?? unit.fuelBurnRateLph}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fuelBurnRateLph: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 font-mono font-bold text-orange-900 bg-white border border-orange-300 rounded-lg"
                    />
                    <span className="font-bold text-slate-700 whitespace-nowrap px-2 py-1 bg-white border border-slate-200 rounded-lg">
                      Liter / Jam
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Biaya Sewa / Depresiasi Alat
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="5"
                      value={formData.hourlyRateUsd ?? unit.hourlyRateUsd}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hourlyRateUsd: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg"
                    />
                    <span className="font-bold text-slate-700 whitespace-nowrap px-2 py-1 bg-white border border-slate-200 rounded-lg">
                      $/Jam
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Suku Cadang & Pelumas ($/Jam)
                  </label>
                  <input
                    type="number"
                    step="2"
                    value={formData.maintenanceCostHourlyUsd ?? unit.maintenanceCostHourlyUsd ?? 40}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenanceCostHourlyUsd: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Keausan Ban / Track Pad ($/Jam)
                  </label>
                  <input
                    type="number"
                    step="2"
                    value={formData.tyreOrTrackWearHourlyUsd ?? unit.tyreOrTrackWearHourlyUsd ?? 20}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tyreOrTrackWearHourlyUsd: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Estimasi Harga Beli Baru (USD)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={formData.purchasePriceUsd ?? unit.purchasePriceUsd ?? 1000000}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchasePriceUsd: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KEANDALAN & KEAUSAN (RELIABILITY) */}
          {activeTab === 'WEAR' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Usia Unit Alat (Tahun)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.ageYears ?? unit.ageYears ?? 2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ageYears: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Total Jam SMU Kumulatif
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={formData.cumulativeHours ?? unit.cumulativeHours ?? 5000}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cumulativeHours: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tingkat Keausan Mekanis (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.wearAndTearPercent ?? unit.wearAndTearPercent ?? 15}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wearAndTearPercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 font-mono font-bold text-amber-700 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    MTBF (Mean Time Between Failures)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="10"
                      value={formData.meanTimeBetweenFailuresHours ?? unit.meanTimeBetweenFailuresHours ?? 120}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meanTimeBetweenFailuresHours: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                    />
                    <span className="text-slate-500 font-medium">Jam</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    MTTR (Mean Time To Repair)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      value={formData.meanTimeToRepairHours ?? unit.meanTimeToRepairHours ?? 4.5}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meanTimeToRepairHours: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                    />
                    <span className="text-slate-500 font-medium">Jam</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    PM Terjadwal (Jam / Bulan)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="5"
                      value={formData.scheduledPmHoursPerMonth ?? unit.scheduledPmHoursPerMonth ?? 30}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledPmHoursPerMonth: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                    />
                    <span className="text-slate-500 font-medium">Jam</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-200 font-semibold rounded-xl transition text-xs"
          >
            Batal
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Parameter otomatis disinkronkan ke Match Factor & Biaya ABC.
            </span>
            <button
              id="save-equipment-spec-btn"
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan Spesifikasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
