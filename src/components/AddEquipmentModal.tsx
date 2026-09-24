import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Truck,
  Layers,
  Sparkles,
  Sliders,
  Fuel,
  Wrench,
  Check,
  Info,
} from 'lucide-react';
import { HeavyEquipmentUnit, EquipmentType, CurrencyType } from '../types/mining';
import {
  EQUIPMENT_TYPE_DEFINITIONS,
  POPULAR_EQUIPMENT_PRESETS,
  EquipmentPresetItem,
  createEquipmentUnitFromPreset,
} from '../data/equipmentTypes';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEquipment: (unit: HeavyEquipmentUnit) => void;
  currency: CurrencyType;
  exchangeRateIdr: number;
}

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  isOpen,
  onClose,
  onAddEquipment,
  currency,
  exchangeRateIdr,
}) => {
  const [activeMode, setActiveMode] = useState<'PRESET' | 'CUSTOM'>('PRESET');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(POPULAR_EQUIPMENT_PRESETS[0].id);
  const [presetCount, setPresetCount] = useState<number>(2);

  // Custom Form States
  const [customType, setCustomType] = useState<EquipmentType>('EXCAVATOR_OB');
  const [customBrand, setCustomBrand] = useState<string>('Komatsu');
  const [customModel, setCustomModel] = useState<string>('PC1250-8R');
  const [customCount, setCustomCount] = useState<number>(2);
  const [customCapacity, setCustomCapacity] = useState<number>(6.7);
  const [customPowerHp, setCustomPowerHp] = useState<number>(672);
  const [customWeightTon, setCustomWeightTon] = useState<number>(115);
  const [customFuelLph, setCustomFuelLph] = useState<number>(75);
  const [customHourlyRate, setCustomHourlyRate] = useState<number>(140);
  const [customCycleSec, setCustomCycleSec] = useState<number>(25);
  const [customMaintenanceCost, setCustomMaintenanceCost] = useState<number>(45);

  if (!isOpen) return null;

  const currentTypeDef = EQUIPMENT_TYPE_DEFINITIONS[customType];

  const handleAddFromPreset = () => {
    const preset = POPULAR_EQUIPMENT_PRESETS.find((p) => p.id === selectedPresetId);
    if (!preset) return;

    const unit = createEquipmentUnitFromPreset(preset, presetCount);
    onAddEquipment(unit);
    onClose();
  };

  const handleAddCustom = () => {
    const newUnit: HeavyEquipmentUnit = {
      id: `fleet-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: `${customBrand} ${customModel}`,
      type: customType,
      brand: customBrand,
      model: customModel,
      fleetCount: Math.max(1, customCount),
      bucketOrVesselCapacity: customCapacity,
      enginePowerHp: customPowerHp,
      operatingWeightTon: customWeightTon,
      fuelBurnRateLph: customFuelLph,
      hourlyRateUsd: customHourlyRate,
      maintenanceCostHourlyUsd: customMaintenanceCost,
      tyreOrTrackWearHourlyUsd: 15,
      purchasePriceUsd: customHourlyRate * 12000,
      digCycleTimeSec: customType.startsWith('EXCAVATOR') ? customCycleSec : 25,
      spotAndDumpingTimeSec: customType.startsWith('HAULER') ? customCycleSec : 60,
      workingHoursW: 450,
      idleHoursS: 80,
      repairHoursR: 70,
      ageYears: 2,
      cumulativeHours: 4500,
      wearAndTearPercent: 15,
      preventiveMaintenanceIntervalHours: 250,
      scheduledPmHoursPerMonth: 30,
      meanTimeBetweenFailuresHours: 120,
      meanTimeToRepairHours: 4.5,
    };

    onAddEquipment(newUnit);
    onClose();
  };

  return (
    <div
      id="add-equipment-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white border border-slate-200 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Tambah Armada Alat Berat Baru
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambahkan unit gali-muat, angkut, atau pendukung tambang dari preset teruji atau formulir kustom
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

        {/* Mode Selector Tabs */}
        <div className="px-5 border-b border-slate-200 bg-slate-100/70 flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveMode('PRESET')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeMode === 'PRESET'
                ? 'border-amber-600 text-amber-800 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Pilih Dari Preset Industri Teruji</span>
          </button>
          <button
            onClick={() => setActiveMode('CUSTOM')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeMode === 'CUSTOM'
                ? 'border-amber-600 text-amber-800 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Konfigurasi Kustom Penuh</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeMode === 'PRESET' ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                Pilih model alat berat yang telah dikonfigurasi dengan standar parameter ESDM dan OEM, lalu tentukan jumlah unit yang akan ditambahkan.
              </div>

              {/* Preset Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {POPULAR_EQUIPMENT_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  const typeDef = EQUIPMENT_TYPE_DEFINITIONS[preset.type];
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        setPresetCount(preset.defaultCount);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeDef.badgeBg} ${typeDef.badgeText}`}>
                            {typeDef.shortLabel}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {preset.brand}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">
                          {preset.model}
                        </h4>
                        <p className="text-[11px] text-slate-500 mb-2">
                          {preset.classTag}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 font-mono text-[10px]">
                        <div>
                          <span className="text-slate-400 block">Kapasitas:</span>
                          <span className="font-bold text-slate-800">
                            {preset.bucketOrVesselCapacity} {typeDef.capacityUnit}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Solar:</span>
                          <span className="font-bold text-amber-700">
                            {preset.fuelBurnRateLph} L/j
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Daya:</span>
                          <span className="font-bold text-slate-800">
                            {preset.enginePowerHp} HP
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quantity selector */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <label className="block text-slate-800 font-bold">Jumlah Unit Armada</label>
                  <span className="text-[11px] text-slate-500">
                    Berapa banyak unit model ini yang akan dimasukkan ke dalam simulasi?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetCount(Math.max(1, presetCount - 1))}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={presetCount}
                    onChange={(e) => setPresetCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1.5 text-center font-mono font-bold text-base bg-white border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setPresetCount(presetCount + 1)}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    +
                  </button>
                  <span className="text-slate-600 font-semibold">Unit</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Jenis Tipe Alat Berat
                  </label>
                  <select
                    value={customType}
                    onChange={(e) => {
                      const newType = e.target.value as EquipmentType;
                      setCustomType(newType);
                      // Update sensible defaults based on type
                      if (newType.startsWith('EXCAVATOR')) {
                        setCustomCapacity(12);
                        setCustomCycleSec(25);
                        setCustomFuelLph(120);
                      } else if (newType.startsWith('HAULER')) {
                        setCustomCapacity(90);
                        setCustomCycleSec(75);
                        setCustomFuelLph(85);
                      } else if (newType === 'SUPPORT_DOZER') {
                        setCustomCapacity(18);
                        setCustomCycleSec(45);
                        setCustomFuelLph(65);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.values(EQUIPMENT_TYPE_DEFINITIONS).map((def) => (
                      <option key={def.type} value={def.type}>
                        {def.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Jumlah Unit Armada
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomCount(Math.max(1, customCount - 1))}
                      className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-300 font-bold text-slate-700 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={customCount}
                      onChange={(e) => setCustomCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-3 py-2 text-center font-mono font-bold bg-white border border-slate-300 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomCount(customCount + 1)}
                      className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-300 font-bold text-slate-700 hover:bg-slate-200"
                    >
                      +
                    </button>
                    <span className="text-slate-600 font-semibold">Unit</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Merek / Brand Pabrikan
                  </label>
                  <input
                    type="text"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Model / Seri Unit
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {currentTypeDef.capacityLabel}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={customCapacity}
                    onChange={(e) => setCustomCapacity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Solar (Liter/Jam)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={customFuelLph}
                    onChange={(e) => setCustomFuelLph(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono font-bold text-amber-700 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {currentTypeDef.cycleTimeLabel}
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={customCycleSec}
                    onChange={(e) => setCustomCycleSec(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tenaga Mesin (HP)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={customPowerHp}
                    onChange={(e) => setCustomPowerHp(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Berat Operasi (Ton)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={customWeightTon}
                    onChange={(e) => setCustomWeightTon(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tarif Sewa/Depresiasi ($/Jam)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={customHourlyRate}
                    onChange={(e) => setCustomHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-200 font-semibold rounded-xl transition text-xs"
          >
            Batal
          </button>

          <button
            id="confirm-add-equipment-btn"
            type="button"
            onClick={activeMode === 'PRESET' ? handleAddFromPreset : handleAddCustom}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Check className="w-4 h-4" />
            <span>
              {activeMode === 'PRESET' ? 'Tambahkan Preset ke Armada' : 'Tambahkan Unit Kustom'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
