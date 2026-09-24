import React from 'react';
import { REGULATORY_DATABASE } from '../utils/regulatoryStandards';
import { X, BookOpen, ShieldCheck, Scale, AlertTriangle } from 'lucide-react';

interface RegulationPopupModalProps {
  regulationKey: string | null;
  onClose: () => void;
}

export const RegulationPopupModal: React.FC<RegulationPopupModalProps> = ({ regulationKey, onClose }) => {
  if (!regulationKey) return null;

  const reg = REGULATORY_DATABASE[regulationKey] || {
    id: regulationKey,
    title: 'Standar Teknis & Regulasi Pertambangan',
    regulatoryCode: 'Kepmen ESDM No. 1827 K/30/MEM/2018',
    governingBody: 'Kementerian ESDM Republik Indonesia',
    formulaOrStandard: 'Perhitungan mengacu pada kaidah teknik pertambangan yang baik dan standar keekonomian minerba.',
    explanation: 'Parameter ini dipantau secara ketat untuk menjamin keselamatan operasional, efisiensi modal, dan kepatuhan hukum.',
    operationalImpact: 'Mempengaruhi langsung biaya operasional (cash cost) dan kelayakan investasi.',
    complianceGuidelines: ['Mengikuti pedoman RKAB tahunan Ditjen Minerba.', 'Audit berkala oleh Inspektur Tambang.'],
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                {reg.governingBody}
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">{reg.title}</h3>
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
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* Regulatory Code Badge */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900">
            <Scale className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-800">Landasan Hukum & Regulasi Resmi:</p>
              <p className="font-semibold text-slate-900">{reg.regulatoryCode}</p>
            </div>
          </div>

          {/* Formula or Standard */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Formula Dasar Perhitungan / Standar Teknis
            </h4>
            <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed shadow-inner">
              {reg.formulaOrStandard}
            </div>
          </div>

          {/* Detailed Explanation */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Penjelasan Metodologi & Landasan Teknis
            </h4>
            <p className="text-slate-600 leading-relaxed">{reg.explanation}</p>
          </div>

          {/* Operational Impact */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-semibold mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Dampak Operasional & Risiko Bisnis:</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">{reg.operationalImpact}</p>
          </div>

          {/* Compliance Guidelines */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Panduan Kepatuhan & Tata Kelola (Good Mining Practice)</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
              {reg.complianceGuidelines.map((guide, idx) => (
                <li key={idx} className="leading-relaxed">
                  {guide}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            Tutup Penjelasan
          </button>
        </div>
      </div>
    </div>
  );
};
