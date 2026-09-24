import React, { useState, useRef } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Upload,
  Download,
  X,
  Check,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { ProjectScenario } from '../types/mining';
import { PRESET_SCENARIOS } from '../data/defaultData';
import { exportToJson, importFromJson } from '../utils/exportHelpers';

interface ScenarioManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScenario: ProjectScenario;
  onSelectScenario: (scenario: ProjectScenario) => void;
  savedScenarios: ProjectScenario[];
  onSaveCurrentAsNew: (name: string, description: string) => void;
  onDeleteScenario: (id: string) => void;
}

export const ScenarioManagerModal: React.FC<ScenarioManagerModalProps> = ({
  isOpen,
  onClose,
  currentScenario,
  onSelectScenario,
  savedScenarios,
  onSaveCurrentAsNew,
  onDeleteScenario,
}) => {
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDesc, setNewScenarioDesc] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    onSaveCurrentAsNew(newScenarioName.trim(), newScenarioDesc.trim());
    setNewScenarioName('');
    setNewScenarioDesc('');
    setIsCreatingNew(false);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importFromJson(file);
      onSelectScenario(imported);
      alert(`Skenario "${imported.name}" berhasil diimpor!`);
      onClose();
    } catch (err: any) {
      alert(`Gagal membaca berkas JSON: ${err?.message || 'Format tidak valid'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Manajemen Simulasi & Skenario
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                Penyimpanan & Komparasi Skenario Tambang
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Quick Actions: Import / Export / Save Current */}
          <div className="flex flex-wrap gap-2.5 items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Simpan Skenario Saat Ini
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Impor dari .JSON
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
            </div>

            <button
              onClick={() => exportToJson(currentScenario)}
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              Unduh Skenario Aktif (.JSON)
            </button>
          </div>

          {/* New Scenario Form */}
          {isCreatingNew && (
            <form
              onSubmit={handleSaveNew}
              className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3 animate-in fade-in"
            >
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                Simpan Konfigurasi Saat Ini Sebagai Skenario Baru
              </h4>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Skenario Kustom
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Skenario Optimasi Pit 3 & Fuel Collar"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/30 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Catatan Asumsi Teknis
                </label>
                <input
                  type="text"
                  placeholder="Catatan parameter kunci atau kondisi pasar..."
                  value={newScenarioDesc}
                  onChange={(e) => setNewScenarioDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg font-bold shadow-xs"
                >
                  Simpan Skenario
                </button>
              </div>
            </form>
          )}

          {/* Preset Skenario Utama */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Skenario Standar Industri (Presets)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_SCENARIOS.map((preset) => {
                const isActive = currentScenario.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                    onClick={() => onSelectScenario(preset)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {preset.id === 'base-case'
                            ? 'Dasar'
                            : preset.id === 'optimistic-case'
                            ? 'Terbaik'
                            : 'Terburuk'}
                        </span>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700">
                            <Check className="w-3.5 h-3.5" /> Aktif
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-slate-900 text-sm mb-1">{preset.name}</h5>
                      <p className="text-xs text-slate-500 leading-relaxed">{preset.description}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Harga Batubara:</span>
                        <span className="font-bold text-slate-900">
                          ${preset.financials.coalPriceUsdPerTon}/t
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stripping Ratio:</span>
                        <span className="font-bold text-slate-900">
                          {preset.reserves.plannedStrippingRatio} BCM/t
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bahan Bakar Solar:</span>
                        <span className="font-bold text-slate-900">
                          ${preset.financials.industrialFuelPriceUsdPerLiter}/L
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skenario Kustom Tersimpan */}
          {savedScenarios.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Skenario Kustom Anda ({savedScenarios.length})
              </h4>
              <div className="space-y-2">
                {savedScenarios.map((scen) => {
                  const isActive = currentScenario.id === scen.id;
                  return (
                    <div
                      key={scen.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isActive
                          ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="cursor-pointer flex-1"
                        onClick={() => onSelectScenario(scen)}
                      >
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-900 text-sm">{scen.name}</h5>
                          {isActive && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{scen.description || 'Tidak ada deskripsi'}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportToJson(scen)}
                          title="Unduh Berkas JSON"
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteScenario(scen.id)}
                          title="Hapus Skenario"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
