import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  Fuel,
  Wrench,
  Gauge,
  Weight,
  Layers,
  Clock,
  DollarSign,
  PlusCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import {
  MINING_EQUIPMENT_CATALOG,
  EquipmentCatalogItem,
} from '../data/equipmentCatalog';
import { HeavyEquipmentUnit, CurrencyType } from '../types/mining';
import { formatMoney } from '../utils/miningMath';

interface EquipmentCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEquipment: (item: EquipmentCatalogItem, targetFleetId?: string) => void;
  currentFleet: HeavyEquipmentUnit[];
  currency: CurrencyType;
  exchangeRateIdr: number;
}

export const EquipmentCatalogModal: React.FC<EquipmentCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectEquipment,
  currentFleet,
  currency,
  exchangeRateIdr,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [targetReplaceId, setTargetReplaceId] = useState<string>('');
  const [appliedSuccessId, setAppliedSuccessId] = useState<string | null>(null);

  const categories = [
    { key: 'ALL', label: 'Semua Alat' },
    { key: 'EXCAVATOR_OB', label: 'Excavator OB' },
    { key: 'HAULER_OB', label: 'Dump Truck OB' },
    { key: 'EXCAVATOR_COAL', label: 'Excavator Batubara' },
    { key: 'HAULER_COAL', label: 'Hauler Batubara' },
    { key: 'SUPPORT_DOZER', label: 'Dozer' },
    { key: 'SUPPORT_GRADER', label: 'Motor Grader' },
    { key: 'SUPPORT_WATER_TRUCK', label: 'Water Truck' },
    { key: 'SUPPORT_PUMP', label: 'Pompa Sump' },
  ];

  const filteredItems = useMemo(() => {
    return MINING_EQUIPMENT_CATALOG.filter((item) => {
      const matchCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchSearch =
        item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.classDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleApply = (item: EquipmentCatalogItem) => {
    onSelectEquipment(item, targetReplaceId || undefined);
    setAppliedSuccessId(item.id);
    setTimeout(() => {
      setAppliedSuccessId(null);
    }, 2000);
  };

  return (
    <div
      id="equipment-catalog-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Katalog Alat Berat Pertambangan Batubara
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                  Standard ESDM & OEM Specs
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Spesifikasi teknis baku komprehensif, kapasitas vessel/bucket, fuel burn rate, dan siklus standar industri
              </p>
            </div>
          </div>
          <button
            id="close-equipment-catalog-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Category Filter, and Fleet Target Selector */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-wrap gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-equipment-catalog"
              type="text"
              placeholder="Cari model alat (Komatsu, CAT, Scania, PC2000, HD785...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Target replace fleet selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Terapkan ke Armada:</span>
            <select
              id="target-fleet-selector"
              value={targetReplaceId}
              onChange={(e) => setTargetReplaceId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-amber-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="">Otomatis (Sesuai Kategori Alat)</option>
              {currentFleet.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  Gantikan: {eq.model} ({eq.fleetCount} unit)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.key}
              id={`cat-filter-${cat.key.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.key
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Catalog Items Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isJustApplied = appliedSuccessId === item.id;
            return (
              <div
                key={item.id}
                id={`catalog-card-${item.id}`}
                className="bg-slate-800/60 border border-slate-700/80 hover:border-amber-500/60 rounded-xl p-5 flex flex-col justify-between transition group hover:shadow-lg"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-700 text-amber-300">
                      {item.brand}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.category.replace('EXCAVATOR_', 'Exc. ').replace('HAULER_', 'Hauler ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                    {item.model}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {item.classDescription}
                  </p>

                  {/* Specs Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800 mb-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Kapasitas:{' '}
                        <strong className="text-white font-semibold">
                          {item.bucketOrVesselCapacity} {item.capacityUnit}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Gauge className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        Tenaga:{' '}
                        <strong className="text-white font-semibold">
                          {item.enginePowerHp} HP
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Fuel className="w-3.5 h-3.5 text-rose-400" />
                      <span>
                        Fuel:{' '}
                        <strong className="text-white font-semibold">
                          {item.fuelBurnRateLph} L/jam
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Weight className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        Berat:{' '}
                        <strong className="text-white font-semibold">
                          {item.operatingWeightTon} Ton
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-violet-400" />
                      <span>
                        Cycle:{' '}
                        <strong className="text-white font-semibold">
                          {item.standardCycleTimeSec > 0 ? `${item.standardCycleTimeSec}s` : 'N/A'}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        MTBF:{' '}
                        <strong className="text-white font-semibold">
                          {item.standardMtbfHours} jam
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="flex items-center justify-between text-xs px-1 text-slate-400 mb-4">
                    <span>
                      Harga Baru:{' '}
                      <span className="text-white font-semibold">
                        {formatMoney(item.purchasePriceUsd, currency, exchangeRateIdr, true)}
                      </span>
                    </span>
                    <span>
                      Parts/Ban:{' '}
                      <span className="text-amber-300 font-semibold">
                        ${item.hourlyMaintenanceCostUsd + item.tyreOrTrackWearHourlyUsd}/jam
                      </span>
                    </span>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  id={`apply-btn-${item.id}`}
                  onClick={() => handleApply(item)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                    isJustApplied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {isJustApplied ? (
                    <>
                      <Check className="w-4 h-4" /> Berhasil Diterapkan ke Armada
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" /> Terapkan ke Simulasi Armada
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            Total <strong className="text-white">{filteredItems.length}</strong> model alat berat siap pakai. Spesifikasi dapat disesuaikan lebih lanjut secara manual di tabel armada.
          </div>
          <button
            id="close-footer-catalog-btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
