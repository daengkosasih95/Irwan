import React, { useState, useRef } from 'react';
import {
  X,
  Building2,
  Building,
  Pickaxe,
  Gem,
  Flame,
  Mountain,
  Layers,
  HardHat,
  Factory,
  Gauge,
  ShieldCheck,
  TrendingUp,
  Truck,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  FileText,
  User,
  Calendar,
  AlertCircle,
  HelpCircle,
  Sparkles,
  MapPin,
  Trash2,
} from 'lucide-react';
import { ProjectIdentityConfig, ConfidentialityLevel } from '../types/mining';
import { DEFAULT_PROJECT_IDENTITY } from '../data/defaultData';

interface ProjectIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: ProjectIdentityConfig;
  onSaveIdentity: (newIdentity: ProjectIdentityConfig) => void;
  onSyncWithScenarioMineName?: (mineName: string, location: string, pitArea: string) => void;
}

const AVAILABLE_ICONS = [
  { id: 'pickaxe', label: 'Pickaxe Tambang', icon: Pickaxe },
  { id: 'mountain', label: 'Gunung & Kontur', icon: Mountain },
  { id: 'layers', label: 'Lapisan Geologi / Seam', icon: Layers },
  { id: 'gem', label: 'Mineral / Kristal', icon: Gem },
  { id: 'flame', label: 'Kalori Batubara', icon: Flame },
  { id: 'hard-hat', label: 'K3 & Safety Helm', icon: HardHat },
  { id: 'truck', label: 'Armada Hauling', icon: Truck },
  { id: 'factory', label: 'Fasilitas ROM / Port', icon: Factory },
  { id: 'gauge', label: 'Kinerja Operasional', icon: Gauge },
  { id: 'shield', label: 'Kepatuhan & Tata Kelola', icon: ShieldCheck },
  { id: 'trending-up', label: 'Pertumbuhan Finansial', icon: TrendingUp },
  { id: 'building', label: 'Gedung Korporasi', icon: Building2 },
];

const PRESET_TEMPLATES = [
  {
    label: 'PT Tambang Batubara Prima Mandiri (Kaltim)',
    data: {
      appTitle: 'MINING FEASIBILITY SIMULATOR',
      appSubtitle: '10+ Yrs Exp. Mining & BizDev Engine',
      companyName: 'PT Tambang Batubara Prima Mandiri',
      mineConcessionName: 'Proyek Batubara Barito Prima Mandiri',
      concessionIupNumber: '540/012/IUP-OP/ESDM/2023',
      pitOrBlockArea: 'Pit Central - Block 01 & 02',
      locationAddress: 'Kutai Barat, Kalimantan Timur',
      analystName: 'Senior Mining Engineer & Business Project Development Specialist',
      analystTitle: 'Lead Feasibility Mining Engineer & Valuation Specialist',
      reviewerName: 'Head of Mine Planning & Technical Services',
      approverName: 'Direktur Utama / Komite Investasi',
      reportRemarks:
        'Dokumen Feasibility Study Tekno-Ekonomi resmi ini disusun mengacu pada kaidah standar Kepmen ESDM No. 1827 K/30/MEM/2018, PP No. 26 Tahun 2022, dan SNI 5015:2019.',
      confidentialityLevel: 'RAHASIA INTERNAL PERUSAHAAN' as ConfidentialityLevel,
      logoType: 'icon' as const,
      logoIcon: 'pickaxe',
      logoCustomUrl: '',
    },
  },
  {
    label: 'PT Borneo Coal Resources Energy (Sumsel)',
    data: {
      appTitle: 'COAL FEASIBILITY VALUATION SYSTEM',
      appSubtitle: 'Corporate Planning & Investment Committee',
      companyName: 'PT Borneo Coal Resources Energy Tbk',
      mineConcessionName: 'Konsesi Batubara Enim Prima Mandiri',
      concessionIupNumber: '503/488/IUP-OP/DISTAMBEN/2022',
      pitOrBlockArea: 'Blok Barat Seam 5 & 6',
      locationAddress: 'Muara Enim, Sumatera Selatan',
      analystName: 'Ir. Hendra Wijaya, S.T., M.Eng., IPM.',
      analystTitle: 'Principal Mining Consultant & Competent Person Indonesia (CPI)',
      reviewerName: 'Chief Technical Officer (CTO)',
      approverName: 'Board of Directors & Investment Review Committee',
      reportRemarks:
        'Analisa kelayakan tekno-ekonomi komprehensif mengintegrasikan estimasi cadangan tertambang JORC 2012, studi armada kontraktor, dan pemenuhan DMO kelistrikan nasional.',
      confidentialityLevel: 'SANGAT RAHASIA (STRICTLY CONFIDENTIAL)' as ConfidentialityLevel,
      logoType: 'icon' as const,
      logoIcon: 'mountain',
      logoCustomUrl: '',
    },
  },
  {
    label: 'PT Kaltim Nusantara Coal Project (Kutim)',
    data: {
      appTitle: 'MINE TECHNO-ECONOMIC FEASIBILITY MODEL',
      appSubtitle: 'Mining Engineering & Financial Valuation',
      companyName: 'PT Kaltim Nusantara Minerals & Energy',
      mineConcessionName: 'Proyek Batubara Sangatta North Concession',
      concessionIupNumber: '540/731/IUP-OP/DPMPTSP/2024',
      pitOrBlockArea: 'Pit Alpha Seam B, C, & D',
      locationAddress: 'Kutai Timur, Kalimantan Timur',
      analystName: 'Bambang Kusuma, S.T., M.T.',
      analystTitle: 'Senior Mine Economics & Operations Research Specialist',
      reviewerName: 'General Manager of Mine Engineering',
      approverName: 'Presiden Direktur / Chief Executive Officer',
      reportRemarks:
        'Dibuat untuk evaluasi kelayakan pendanaan perbankan (Bankable Feasibility Study) dan rencana kerja anggaran biaya (RKAB) operasional tahunan.',
      confidentialityLevel: 'DOKUMEN RESMI TERBATAS' as ConfidentialityLevel,
      logoType: 'icon' as const,
      logoIcon: 'layers',
      logoCustomUrl: '',
    },
  },
];

export const ProjectIdentityModal: React.FC<ProjectIdentityModalProps> = ({
  isOpen,
  onClose,
  identity,
  onSaveIdentity,
  onSyncWithScenarioMineName,
}) => {
  const [formData, setFormData] = useState<ProjectIdentityConfig>(identity);
  const [activeTab, setActiveTab] = useState<'branding' | 'company' | 'personnel' | 'notes'>('branding');
  const [syncWithScenario, setSyncWithScenario] = useState<boolean>(true);
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof ProjectIdentityConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar yang valid (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        logoType: 'image',
        logoCustomUrl: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (presetData: Partial<ProjectIdentityConfig>) => {
    setFormData((prev) => ({
      ...prev,
      ...presetData,
    }));
  };

  const handleResetToDefault = () => {
    setFormData(DEFAULT_PROJECT_IDENTITY);
    setConfirmReset(false);
  };

  const handleSave = () => {
    onSaveIdentity(formData);
    if (syncWithScenario && onSyncWithScenarioMineName) {
      onSyncWithScenarioMineName(
        formData.mineConcessionName,
        formData.locationAddress,
        formData.pitOrBlockArea
      );
    }
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 450);
  };

  const SelectedIconComp =
    AVAILABLE_ICONS.find((i) => i.id === formData.logoIcon)?.icon || Pickaxe;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white leading-tight">
                  Pengaturan Identitas, Judul & Logo Proyek
                </h3>
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  Custom Branding & Keterangan
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kustomisasi nama, logo, keterangan, dan identitas perusahaan yang otomatis tampil pada Dashboard dan seluruh berkas ekspor laporan (.xlsx, .docx, .pptx, .json).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Bar */}
        <div className="bg-slate-800/90 border-b border-slate-700/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">Gunakan Template Cepat:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_TEMPLATES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p.data)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-700/70 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-medium transition-colors border border-slate-600/60"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'branding'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>1. Logo & Judul Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'company'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>2. Identitas Perusahaan & Izin IUP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('personnel')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'personnel'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>3. Tim Analis & Pengesah</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'notes'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>4. Keterangan, Tanggal & Kerahasiaan</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* TAB 1: LOGO & JUDUL DASHBOARD */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* Preview Banner */}
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 overflow-hidden">
                  {formData.logoType === 'image' && formData.logoCustomUrl ? (
                    <img
                      src={formData.logoCustomUrl}
                      alt="Logo Proyek"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <SelectedIconComp className="w-7 h-7" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black tracking-tight text-white uppercase truncate">
                      {formData.appTitle || 'MINING FEASIBILITY SIMULATOR'}
                    </span>
                    <span className="text-[9px] uppercase font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      {formData.appSubtitle || '10+ Yrs Exp.'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {formData.companyName} &bull; {formData.mineConcessionName} &bull; {formData.locationAddress}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    No. IUP: {formData.concessionIupNumber} | Sifat: {formData.confidentialityLevel}
                  </p>
                </div>
              </div>

              {/* Title & Subtitle Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Utama Dashboard / Aplikasi
                  </label>
                  <input
                    type="text"
                    value={formData.appTitle}
                    onChange={(e) => handleChange('appTitle', e.target.value)}
                    placeholder="Contoh: MINING FEASIBILITY SIMULATOR"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Tampil pada bar navigasi atas dan cover laporan resmi.
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sub-judul / Tagline / Badge Versi
                  </label>
                  <input
                    type="text"
                    value={formData.appSubtitle}
                    onChange={(e) => handleChange('appSubtitle', e.target.value)}
                    placeholder="Contoh: 10+ Yrs Exp. Mining & BizDev Engine"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Badge kuning di sebelah judul aplikasi.
                  </span>
                </div>
              </div>

              {/* Logo Selection: Icon vs Custom Image */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>Pilihan Logo Proyek / Perusahaan</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange('logoType', 'icon')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        formData.logoType === 'icon'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Icon Vektor Tambang
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('logoType', 'image')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        formData.logoType === 'image'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Upload Gambar / URL Logo
                    </button>
                  </div>
                </div>

                {/* If Icon Mode */}
                {formData.logoType === 'icon' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Pilih Icon Representasi Bidang Usaha:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {AVAILABLE_ICONS.map((item) => {
                        const IconComponent = item.icon;
                        const isSelected = formData.logoIcon === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleChange('logoIcon', item.id)}
                            className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-amber-500 text-slate-950' : 'bg-white text-slate-600'
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-semibold text-center leading-tight">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* If Custom Image Mode */}
                {formData.logoType === 'image' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                      <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        {formData.logoCustomUrl ? (
                          <img
                            src={formData.logoCustomUrl}
                            alt="Preview Logo"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div className="text-xs font-bold text-slate-800">
                          {formData.logoCustomUrl
                            ? 'Logo Perusahaan Terpasang'
                            : 'Unggah Berkas Logo Perusahaan / IUP'}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Format PNG transparan, JPG, SVG, atau WebP (Maksimal 2 MB). Logo akan disematkan pada bar navigasi dashboard dan cover slide laporan.
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Pilih Berkas Logo...</span>
                          </button>
                          {formData.logoCustomUrl && (
                            <button
                              type="button"
                              onClick={() => handleChange('logoCustomUrl', '')}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Logo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Or Image URL */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Atau Masukkan Tautan Web Gambar Logo (Image URL):
                      </label>
                      <input
                        type="url"
                        value={formData.logoCustomUrl || ''}
                        onChange={(e) => handleChange('logoCustomUrl', e.target.value)}
                        placeholder="https://example.com/assets/logo-perusahaan.png"
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITAS PERUSAHAAN & IUP */}
          {activeTab === 'company' && (
            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-600" />
                <span>Identitas Badan Usaha & Legalitas Wilayah Tambang</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Badan Usaha / Perusahaan Pemegang Izin
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Contoh: PT Tambang Batubara Prima Mandiri"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Nama resmi perseroan tercantum pada kop laporan dan cover ekspor.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor SK Izin Usaha Pertambangan (IUP / PKP2B / SIPB)
                  </label>
                  <input
                    type="text"
                    value={formData.concessionIupNumber}
                    onChange={(e) => handleChange('concessionIupNumber', e.target.value)}
                    placeholder="Contoh: 540/012/IUP-OP/ESDM/2023"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Nomor izin resmi ESDM / DPMPTSP.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Proyek / Nama Konsesi Tambang
                  </label>
                  <input
                    type="text"
                    value={formData.mineConcessionName}
                    onChange={(e) => handleChange('mineConcessionName', e.target.value)}
                    placeholder="Contoh: Proyek Batubara Barito Prima Mandiri"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Blok / Area Pit Penambangan
                  </label>
                  <input
                    type="text"
                    value={formData.pitOrBlockArea}
                    onChange={(e) => handleChange('pitOrBlockArea', e.target.value)}
                    placeholder="Contoh: Pit Central - Block 01 & 02"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi Geografis & Administratif Tambang
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.locationAddress}
                    onChange={(e) => handleChange('locationAddress', e.target.value)}
                    placeholder="Contoh: Kutai Barat, Kalimantan Timur"
                    className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Kabupaten, Provinsi, atau koordinat wilayah konsesi.
                </span>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncWithScenario}
                    onChange={(e) => setSyncWithScenario(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>
                    Sinkronkan otomatis Nama Tambang, Lokasi, dan Pit dengan Skenario Aktif saat disimpan.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: TIM ANALIS & PENGESAH */}
          {activeTab === 'personnel' && (
            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" />
                <span>Penyusun Dokumen & Pejabat Pengesahan Kelayakan</span>
              </h4>
              <p className="text-xs text-slate-500">
                Nama dan jabatan berikut akan dicetak pada lembar tanda tangan pengesahan kelayakan di dokumen Word (.DOCX), PowerPoint (.PPTX), dan Excel (.XLSX).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Senior Mining Engineer / Analis Kelayakan
                  </label>
                  <input
                    type="text"
                    value={formData.analystName}
                    onChange={(e) => handleChange('analystName', e.target.value)}
                    placeholder="Contoh: Ir. Daeng Kosasih, S.T., M.T., IPM."
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Analis / Spesialis
                  </label>
                  <input
                    type="text"
                    value={formData.analystTitle}
                    onChange={(e) => handleChange('analystTitle', e.target.value)}
                    placeholder="Contoh: Lead Feasibility Mining Engineer & Valuation Specialist"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pemeriksa Teknis (Reviewer)
                  </label>
                  <input
                    type="text"
                    value={formData.reviewerName}
                    onChange={(e) => handleChange('reviewerName', e.target.value)}
                    placeholder="Contoh: Head of Mine Planning & Technical Services"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pengesah / Approver / Komite Investasi
                  </label>
                  <input
                    type="text"
                    value={formData.approverName}
                    onChange={(e) => handleChange('approverName', e.target.value)}
                    placeholder="Contoh: Direktur Utama / Komite Investasi"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KETERANGAN, TANGGAL & KERAHASIAAN */}
          {activeTab === 'notes' && (
            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Keterangan Khusus, Tanggal Dokumen & Status Kerahasiaan</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Klasifikasi Kerahasiaan Dokumen
                  </label>
                  <select
                    value={formData.confidentialityLevel}
                    onChange={(e) => handleChange('confidentialityLevel', e.target.value as ConfidentialityLevel)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="SANGAT RAHASIA (STRICTLY CONFIDENTIAL)">
                      SANGAT RAHASIA (STRICTLY CONFIDENTIAL)
                    </option>
                    <option value="RAHASIA INTERNAL PERUSAHAAN">
                      RAHASIA INTERNAL PERUSAHAAN
                    </option>
                    <option value="DOKUMEN RESMI TERBATAS">
                      DOKUMEN RESMI TERBATAS
                    </option>
                    <option value="DOKUMEN PUBLIK / TERBUKA">
                      DOKUMEN PUBLIK / TERBUKA
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Rilis / Pengesahan Laporan
                  </label>
                  <input
                    type="text"
                    value={formData.documentDate}
                    onChange={(e) => handleChange('documentDate', e.target.value)}
                    placeholder="Contoh: 18 September 2026"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan Khusus / Catatan Kaki / Disclaimer Dokumen
                </label>
                <textarea
                  rows={4}
                  value={formData.reportRemarks}
                  onChange={(e) => handleChange('reportRemarks', e.target.value)}
                  placeholder="Tuliskan catatan khusus, acuan standar perundangan, batas keandalan kajian, atau disclaimer investasi..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Keterangan ini dicantumkan pada bagian catatan eksekutif dan footer laporan resmi.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {confirmReset ? (
              <div className="flex items-center gap-1.5 p-1 bg-amber-50 rounded-lg border border-amber-300 animate-in fade-in">
                <span className="text-[11px] font-bold text-amber-900 px-1">Reset identitas ke standar?</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(DEFAULT_PROJECT_IDENTITY);
                    setConfirmReset(false);
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold cursor-pointer"
                >
                  Ya, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-200/80 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Standar</span>
              </button>
            )}
            {isSavedNotice && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Berhasil disimpan & diterapkan!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan & Terapkan Identitas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
