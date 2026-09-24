import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Presentation,
  FileCode,
  Download,
  X,
  CheckCircle2,
  Building,
  User,
  Calendar,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import {
  ProjectScenario,
  OperationalCalculations,
  AnnualCashFlow,
  FinancialResults,
  SensitivityDataPoint,
  StrategicRecommendation,
  ProjectIdentityConfig,
} from '../types/mining';
import {
  exportToExcel,
  exportToWord,
  exportToPowerPoint,
  exportToJson,
  ExportReportMetadata,
} from '../utils/exportHelpers';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  operational: OperationalCalculations;
  cashFlows: AnnualCashFlow[];
  financials: FinancialResults;
  sensitivity: SensitivityDataPoint[];
  recommendation: StrategicRecommendation;
  identity?: ProjectIdentityConfig;
  onOpenIdentityModal?: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  scenario,
  operational,
  cashFlows,
  financials,
  sensitivity,
  recommendation,
  identity,
  onOpenIdentityModal,
}) => {
  const [reportTitle, setReportTitle] = useState(
    identity?.reportTitle ||
      `Laporan Studi Kelayakan Tekno-Ekonomi Pertambangan Batubara - ${identity?.mineConcessionName || scenario.reserves.mineName}`
  );
  const [companyName, setCompanyName] = useState(
    identity?.companyName || 'PT Tambang Batubara Prima Mandiri'
  );
  const [analystName, setAnalystName] = useState(
    identity?.analystName || 'Senior Mining Engineer & Business Project Development Specialist'
  );
  const [analystTitle, setAnalystTitle] = useState(
    identity?.analystTitle || 'Lead Feasibility Analyst'
  );
  const [iupNumber, setIupNumber] = useState(
    identity?.concessionIupNumber || '540/128/IUP-OP/ESDM/2023'
  );
  const [reviewerName, setReviewerName] = useState(
    identity?.reviewerName || 'Head of Mine Engineering & Technical Services'
  );
  const [approverName, setApproverName] = useState(
    identity?.approverName || 'Direktur Utama / Komite Investasi'
  );
  const [reportRemarks, setReportRemarks] = useState(
    identity?.reportRemarks || 'Dokumen resmi kajian tekno-ekonomi pertambangan berstandar KCMI / JORC & Kepmen ESDM No. 1827 K/30/MEM/2018.'
  );

  useEffect(() => {
    if (identity) {
      if (identity.reportTitle) setReportTitle(identity.reportTitle);
      if (identity.companyName) setCompanyName(identity.companyName);
      if (identity.analystName) setAnalystName(identity.analystName);
      if (identity.analystTitle) setAnalystTitle(identity.analystTitle);
      if (identity.concessionIupNumber) setIupNumber(identity.concessionIupNumber);
      if (identity.reviewerName) setReviewerName(identity.reviewerName);
      if (identity.approverName) setApproverName(identity.approverName);
      if (identity.reportRemarks) setReportRemarks(identity.reportRemarks);
    }
  }, [identity]);

  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerExport = async (type: 'xlsx' | 'docx' | 'pptx' | 'json') => {
    setIsExporting(type);
    setSuccessMessage(null);
    try {
      const meta: ExportReportMetadata = {
        reportTitle,
        companyName,
        analystName,
        analystTitle,
        reviewerName,
        approverName,
        reportRemarks,
        confidentialityLevel: identity?.confidentialityLevel || 'STRICTLY CONFIDENTIAL',
        concessionIupNumber: iupNumber,
        mineConcessionName: identity?.mineConcessionName || scenario.reserves.mineName,
        pitOrBlockArea: identity?.pitOrBlockArea || scenario.reserves.pitArea,
        locationAddress: identity?.locationAddress || scenario.reserves.location,
        documentDate: identity?.documentDate || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
        logoCustomUrl: identity?.logoCustomUrl,
      };

      if (type === 'xlsx') {
        exportToExcel(scenario, operational, cashFlows, financials, sensitivity, recommendation, meta);
        setSuccessMessage('Berkas Excel (.XLSX) 8 lembar kerja komprehensif berhasil diunduh!');
      } else if (type === 'docx') {
        await exportToWord(scenario, operational, cashFlows, financials, sensitivity, recommendation, meta);
        setSuccessMessage('Laporan Resmi Word (.DOCX) format baku studi kelayakan ESDM berhasil diunduh!');
      } else if (type === 'pptx') {
        await exportToPowerPoint(scenario, operational, cashFlows, financials, sensitivity, recommendation, meta);
        setSuccessMessage('Slide Presentasi Direksi (.PPTX) 14 slide komprehensif berhasil dibuat!');
      } else if (type === 'json') {
        exportToJson(scenario, identity);
        setSuccessMessage('Berkas Data & Skenario Proyek (.JSON) berhasil disimpan!');
      }
    } catch (err: any) {
      alert(`Gagal mengekspor laporan: ${err?.message || 'Error tidak diketahui'}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Dokumentasi & Pelaporan Baku Pertambangan
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                Ekspor Laporan & Data Analisa Kelayakan Tambang
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Metadata Proyek & Lembar Pengesahan */}
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-500" />
                <span>Identitas & Lembar Pengesahan Dokumen</span>
              </h4>
              {onOpenIdentityModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenIdentityModal();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Atur Logo & Profil Lengkap</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Judul Dokumen Laporan</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> Nama Badan Usaha / Perusahaan
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Nomor SK IUP / Izin Usaha
                  </label>
                  <input
                    type="text"
                    value={iupNumber}
                    onChange={(e) => setIupNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Penyusun (Lead Analyst)
                  </label>
                  <input
                    type="text"
                    value={analystName}
                    onChange={(e) => setAnalystName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Pemeriksa (Reviewer)
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Pengesah (Direksi / Komite)
                  </label>
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Catatan Dokumen / Keterangan Tambahan
                </label>
                <input
                  type="text"
                  value={reportRemarks}
                  onChange={(e) => setReportRemarks(e.target.value)}
                  placeholder="Catatan tambahan..."
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Export Options Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Pilih Format Berkas Ekspor Standar Pertambangan:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: XLSX */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500/60 bg-white hover:bg-emerald-50/20 transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-sm">Model Finansial (.XLSX)</h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                      8 Sheet Lengkap
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Buku kerja Excel 8 lembar kerja mencakup Ringkasan KPI, Geologi Cadangan, Daftar Armada & Kesiapan MA/PA/UA/EU, Siklus Cycle Time & Fuel Burn, Struktur CAPEX & OPEX ABC, Proyeksi Cashflow LOM, Matriks Sensitivitas, dan Regulasi ESDM.
                  </p>
                </div>
                <button
                  disabled={isExporting !== null}
                  onClick={() => triggerExport('xlsx')}
                  className="mt-3.5 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting === 'xlsx' ? 'Menyusun Spreadsheet...' : 'Unduh .XLSX (8 Sheets)'}
                </button>
              </div>

              {/* Option 2: PPTX */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-amber-500/60 bg-white hover:bg-amber-50/20 transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-sm">Presentasi Direksi (.PPTX)</h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                      14 Slide Eksekutif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Slide presentasi eksekutif siap paparan ke Direksi, Komite Investasi dan Perbankan dengan format 16:9, tata letak modern, kartu metrik KPI, visualisasi armada, struktur biaya, cash flow, dan lembar pengesahan.
                  </p>
                </div>
                <button
                  disabled={isExporting !== null}
                  onClick={() => triggerExport('pptx')}
                  className="mt-3.5 w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting === 'pptx' ? 'Menyusun Slide...' : 'Unduh .PPTX (14 Slides)'}
                </button>
              </div>

              {/* Option 3: DOCX */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-500/60 bg-white hover:bg-blue-50/20 transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-sm">Laporan Feasibility (.DOCX)</h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Format Resmi ESDM
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Dokumen resmi Word lengkap format formal studi kelayakan tambang, tabel ringkasan KPI, evaluasi geologi, kinerja alat berat, struktur OPEX ABC, kepatuhan PP 26/2022 & Kepmen 1827/2018, dan lembar pengesahan.
                  </p>
                </div>
                <button
                  disabled={isExporting !== null}
                  onClick={() => triggerExport('docx')}
                  className="mt-3.5 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting === 'docx' ? 'Menyusun Dokumen...' : 'Unduh .DOCX'}
                </button>
              </div>

              {/* Option 4: JSON */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-purple-500/60 bg-white hover:bg-purple-50/20 transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-sm">Backup Skenario (.JSON)</h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                      Raw Config
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Simpan seluruh parameter geologi, jalan, cuaca, konfigurasi alat berat kustom, dan asumsi finansial ke berkas JSON untuk dapat diimpor kembali sewaktu-waktu.
                  </p>
                </div>
                <button
                  disabled={isExporting !== null}
                  onClick={() => triggerExport('json')}
                  className="mt-3.5 w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting === 'json' ? 'Menyimpan...' : 'Unduh .JSON'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Kepatuhan: Kepmen ESDM 1827/2018, PP 26/2022 & Kepmen 58.K/2022</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

