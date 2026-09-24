export interface RegulationItem {
  id: string;
  title: string;
  regulatoryCode: string;
  governingBody: string;
  formulaOrStandard: string;
  explanation: string;
  operationalImpact: string;
  complianceGuidelines: string[];
}

export const REGULATORY_DATABASE: Record<string, RegulationItem> = {
  // 1. Royalti PNBP
  ROYALTY_PP26_2022: {
    id: 'ROYALTY_PP26_2022',
    title: 'Tarif Royalti PNBP & Iuran Tetap Batubara Progresif Berjenjang',
    regulatoryCode: 'PP RI No. 26 Tahun 2022 (IUP) & PP RI No. 15 Tahun 2022 (IUPK)',
    governingBody: 'Kementerian Energi dan Sumber Daya Mineral (ESDM) & Kemenkeu',
    formulaOrStandard: `A. IUP OPERASI PRODUKSI (PP No. 26 Tahun 2022):
• Kalori < 4.200 kcal/kg GAR:
   - HBA < $70: 5.0%
   - HBA $70 - $90: 6.0%
   - HBA $90 - $110: 7.0%
   - HBA > $110: 8.0%
• Kalori 4.200 - 5.200 kcal/kg GAR:
   - HBA < $70: 6.0%
   - HBA $70 - $90: 8.5%
   - HBA $90 - $110: 9.5%
   - HBA > $110: 10.5%
• Kalori > 5.200 kcal/kg GAR:
   - HBA < $70: 8.0%
   - HBA $70 - $90: 10.5%
   - HBA $90 - $110: 12.0%
   - HBA > $110: 13.5%

B. IUPK KELANJUTAN OPERASI (PP No. 15 Tahun 2022):
• Rentang tarif berjenjang 14% s/d 28% sesuai level HBA (< $70, $70-$80, $80-$90, $90-$100, ≥ $100).

C. IURAN TETAP WILAYAH (DEAD RENT):
• Tarif iuran tahunan per luas konsesi (Ha) sesuai tahap izin (Eksplorasi/Operasi Produksi).`,
    explanation:
      'Peraturan Pemerintah No. 26/2022 dan No. 15/2022 memberlakukan tarif royalti progresif/berjenjang berdasarkan pergerakan Harga Batubara Acuan (HBA) dan tingkat kalori (GAR). Model finansial ini mengkalkulasi tarif royalti efektif secara otomatis sesuai harga jual ekspor, kuota DMO, dan kalori batubara proyek.',
    operationalImpact:
      'Mencegah risiko sanksi administrasi dan kekurangan bayar PNBP ke kas negara. Mengamankan arus kas operasional dari lonjakan kewajiban royalti pada saat siklus harga batubara tinggi dan memastikan dana bagi hasil (DBH) daerah teralokasikan secara akurat.',
    complianceGuidelines: [
      'Wajib disetorkan melalui aplikasi SIMPONI / e-PNBP Ditjen Minerba sebelum penerbitan LHV (Laporan Hasil Verifikasi) untuk pengapalan.',
      'Perhitungan menggunakan acuan harga indeks formula ESDM resmi bulan berjalan (HBA ESDM).',
      'Distribusi DBH Minerba sesuai UU No. 1/2022 (HKPD): 20% Pusat dan 80% Daerah (Provinsi 16%, Kab Penghasil 32%, Kab Sekitar 32%).',
    ],
  },

  // 2. DMO
  DMO_ESDM: {
    id: 'DMO_ESDM',
    title: 'Kewajiban Domestic Market Obligation (DMO) 25%',
    regulatoryCode: 'Kepmen ESDM No. 58.K/MB.01/MEM.B/2022 & Kepmen No. 139.K/2021',
    governingBody: 'Direktorat Jenderal Mineral dan Batubara - ESDM',
    formulaOrStandard: 'Volume DMO = 25% × Total Rencana Produksi Tahunan (Harga Cap Kelistrikan PLN: $70/Ton FOB Vessel)',
    explanation:
      'Pemegang IUP/IUPK Operasi Produksi wajib mengalokasikan minimal 25% dari total realisasi produksi batubara tahunan untuk kebutuhan dalam negeri (PLN & industri pupuk/semen). Harga jual untuk kelistrikan umum dibatasi maksimal USD 70/ton FOB Vessel.',
    operationalImpact:
      'Blended coal price (harga rata-rata tertimbang) harus dihitung dengan formula: (75% × Harga Pasar Ekspor) + (25% × Min(Harga Pasar, $70)). Kegagalan pemenuhan DMO dikenai denda/kompensasi berat dan pemblokiran izin ekspor (SPB/PEB).',
    complianceGuidelines: [
      'Pelaporan realisasi pemenuhan kontrak DMO setiap triwulan ke Ditjen Minerba.',
      'Penetapan klausul kontrak off-take domestik sejak awal tahun persetujuan RKAB.',
    ],
  },

  // 3. Kepmen 1827 K/30/MEM/2018 - Kaidah Teknik Pertambangan yang Baik
  KEPMEN_1827_2018: {
    id: 'KEPMEN_1827_2018',
    title: 'Pedoman Pelaksanaan Kaidah Teknik Pertambangan yang Baik',
    regulatoryCode: 'Kepmen ESDM No. 1827 K/30/MEM/2018 Lampiran II, III, & IV',
    governingBody: 'Inspektur Tambang / Kementerian ESDM',
    formulaOrStandard: `Standar Geometri Jalan Tambang & Kemiringan:
• Kemiringan jalan angkut (Grade) maks: 8% - 10% (sesuai spesifikasi alat)
• Lebar jalan lurus min: 3.5 × lebar dump truck terbesar
• Lebar jalan tikungan min: 4 × lebar dump truck terbesar + superelevasi
• Safety berm: min 2/3 tinggi diameter roda ban alat angkut terbesar`,
    explanation:
      'Kepmen 1827/2018 mengatur standarisasi teknis operasional penambangan terbuka, konservasi mineral dan batubara, keselamatan kerja pertambangan (K3), dan pengelolaan lingkungan tambang.',
    operationalImpact:
      'Grade jalan yang terlalu curam (>10%) akan menurunkan kecepatan alat angkut secara eksponensial (rimpull drop), meningkatkan konsumsi bahan bakar hingga 40%, mempercepat aus ban (tire wear), dan berisiko kecelakaan operasional.',
    complianceGuidelines: [
      'Wajib diawasi oleh KTT (Kepala Teknik Tambang) bersertifikasi POU/POM.',
      'Perawatan rutin jalan angkut menggunakan motor grader dan water truck untuk menjaga rolling resistance rendah (3% - 4%).',
    ],
  },

  // 4. Standar Ketersediaan Alat Mekanis
  EQUIPMENT_AVAILABILITY_STANDARDS: {
    id: 'EQUIPMENT_AVAILABILITY_STANDARDS',
    title: 'Standar Ketersediaan & Utilisasi Alat Berat (MA, PA, UA, EU)',
    regulatoryCode: 'Standar Industri Pertambangan Dunia & KCMI / Caterpillar Performance Handbook',
    governingBody: 'Perhimpunan Ahli Pertambangan Indonesia (PERHAPI) & Standar OEM',
    formulaOrStandard: `1. Mechanical Availability (MA) = [W / (W + R)] × 100%
   Target Standar: ≥ 85%
2. Physical Availability (PA) = [(W + S) / (W + S + R)] × 100%
   Target Standar: ≥ 90%
3. Use of Availability (UA) = [W / (W + S)] × 100%
   Target Standar: ≥ 80%
4. Effective Utilization (EU) = [W / (W + S + R)] × 100%
   Target Standar: ≥ 65% - 75%
Keterangan: W = Working Hours, S = Standby Hours, R = Repair/Maintenance Hours`,
    explanation:
      'Indikator fundamental untuk mengukur keandalan unit mekanis kontraktor atau armada sendiri. Menentukan apakah target produksi bulanan/tahunan secara fisik dapat dicapai oleh armada yang terpasang.',
    operationalImpact:
      'Penurunan MA mengindikasikan tingginya frekuensi breakdown (kualitas maintenance buruk). Penurunan UA mengindikasikan tingginya antrian, hambatan hujan, atau keterlambatan shifting kerja operator.',
    complianceGuidelines: [
      'Pencatatan daily dispatch sheet dan telemetri alat (FMS) yang transparan dan tervalidasi.',
      'Penerapan scheduled periodic servicing (PS 250, 500, 1000, 2000) tepat waktu.',
    ],
  },

  // 5. Match Factor
  MATCH_FACTOR: {
    id: 'MATCH_FACTOR',
    title: 'Faktor Keserasian Alat Muat dan Angkut (Match Factor)',
    regulatoryCode: 'Formula Teknis Teori Antrian Tambang (Pfleider & Hustrulid)',
    governingBody: 'Mining Engineering Practice Standards',
    formulaOrStandard: `Match Factor (MF) = (Na × Ctl) / (Nm × Cte)
Di mana:
• Na = Jumlah unit dump truck (alat angkut)
• Nm = Jumlah unit excavator (alat gali-muat)
• Ctl = Cycle time alat gali-muat mengisi 1 truck (menit)
• Cte = Total cycle time 1 unit dump truck (menit)

Interpretasi:
• MF = 1.00 : Sempurna, alat muat dan angkut seimbang 100%
• MF < 1.00 : Alat muat menunggu alat angkut (Loader Idle)
• MF > 1.00 : Alat angkut antri di loading point (Truck Queueing)`,
    explanation:
      'Match Factor adalah rasio sinkronisasi antara kapasitas muat excavator dan siklus tempuh dump truck. Digunakan untuk menghindari kerugian biaya operasional akibat alat mahal yang berdiri menganggur (idle burn solar).',
    operationalImpact:
      'Jika jarak buang bertambah (jarak dump lebih jauh), Cte membengkak, sehingga MF mengecil jika armada truk tidak ditambah. Mengoptimalkan MF menghemat jutaan dolar biaya sewa armada.',
    complianceGuidelines: [
      'Evaluasi berkala setiap perubahan posisi pit atau perubahan dump location.',
      'Optimalisasi rute hauling dan manajemen antrian di dumping area.',
    ],
  },

  // 6. Jaminan Reklamasi & Pascatambang
  RECLAMATION_BOND: {
    id: 'RECLAMATION_BOND',
    title: 'Jaminan Reklamasi dan Pascatambang (UU No. 3/2020)',
    regulatoryCode: 'Permen ESDM No. 26 Tahun 2018 & Kepmen No. 1827/2018 Lampiran VI',
    governingBody: 'Kementerian ESDM & KLHK',
    formulaOrStandard: 'Biaya Reklamasi = (Luas Lahan Terbuka ha × Standar Biaya ESDM) + Dana Pascatambang per Ton Batubara ($0.50 - $1.20/Ton)',
    explanation:
      'Setiap pemegang izin tambang wajib menempatkan Jaminan Reklamasi dan Jaminan Pascatambang pada bank pemerintah. Biaya ini wajib dicadangkan ke dalam struktur OPEX per ton batubara.',
    operationalImpact:
      'Mencegah pencabutan izin operasi (IUP), sanksi pidana lingkungan hidup, dan memastikan kewajiban penataan lahan kembali (revegetasi, revegetasi pit lake, backfilling) terpenuhi.',
    complianceGuidelines: [
      'Penyusunan Rencana Reklamasi 5 Tahun dan Dokumen Rencana Pascatambang (RPT).',
      'Penempatan dana jaminan dalam bentuk deposito berjangka atas nama kementerian/dinas.',
    ],
  },

  // 7. Evaluasi Kelayakan Finansial (NPV & IRR)
  FINANCIAL_METRICS_FEASIBILITY: {
    id: 'FINANCIAL_METRICS_FEASIBILITY',
    title: 'Standar Kelayakan Investasi Finansial Tambang (NPV, IRR, PBP)',
    regulatoryCode: 'Mining Feasibility Study Guidelines (SNI 5015:2019 & AusIMM)',
    governingBody: 'Badan Standardisasi Nasional (BSN) & Asosiasi Pertambangan',
    formulaOrStandard: `1. NPV = ∑ [CFt / (1 + WACC)^t] - Initial Capex
   Kriteria: NPV > 0 (Proyek Menghasilkan Nilai Tambah)
2. IRR = Tingkat diskonto yang membuat NPV = 0
   Kriteria: IRR > WACC (Threshold Pertambangan Indonesia: Minimal 18% - 22%)
3. Payback Period (PBP) = Waktu pengembalian modal awal Capex
   Kriteria: PBP < 50% dari total Life of Mine (LoM)`,
    explanation:
      'Analisis kelayakan diskonto kas terperinci memperhitungkan biaya modal (WACC), risiko volatilitas komoditas, inflasi, dan depresiasi aset.',
    operationalImpact:
      'Menjadi landasan mutlak bagi Direksi, Perbankan, dan Investor institusional dalam persetujuan Financial Close (FID - Final Investment Decision).',
    complianceGuidelines: [
      'Audit model finansial independen oleh Kantor Akuntan Publik (KAP) terdaftar.',
      'Uji sensitivitas terhadap skenario penurunan harga batubara -20% dan kenaikan stripping ratio +15%.',
    ],
  },

  // 8. Pelaporan Sumberdaya & Cadangan Batubara (JORC & KCMI)
  RESERVE_JORC_KCMI: {
    id: 'RESERVE_JORC_KCMI',
    title: 'Standar Estimasi & Pelaporan Cadangan Batubara (KCMI / JORC Code)',
    regulatoryCode: 'SNI 5015:2019 & Kode KCMI 2017 / JORC Code 2012',
    governingBody: 'Komite Bersama KCMI (PERHAPI & IAGI) & Kementerian ESDM',
    formulaOrStandard: `1. Cadangan Batubara Tertambang (Mineable Reserve):
   = Cadangan In-Situ × (1 - Geological Loss) × Mining Recovery × (1 + Dilution)
2. Klasifikasi Tingkat Keyakinan Geologi:
   - Terukur (Measured) → Cadangan Terbukti (Proved Reserve)
   - Terindikasi (Indicated) → Cadangan Terkira (Probable Reserve)
   - Tereka (Inferred) → Tidak dapat dikonversi menjadi Cadangan`,
    explanation:
      'Estimasi cadangan batubara wajib dihitung oleh Orang Yang Berkompeten (Competent Person Indonesia / CPI) bersertifikat. Faktor pengubah (modifying factors) seperti batas stripping ratio ekonomis, recovery penambangan, dilusi, dan kehilangan geologi wajib diterapkan secara transparan.',
    operationalImpact:
      'Menjadi dasar hukum pengajuan dokumen Rencana Kerja dan Anggaran Biaya (RKAB) dan studi kelayakan definitif (Bankable Feasibility Study) untuk perbankan dan bursa efek (IDX).',
    complianceGuidelines: [
      'Laporan ditandatangani oleh CPI Cadangan Batubara terdaftar di PERHAPI/IAGI.',
      'Jarak spasi titik bor eksplorasi memenuhi kriteria geologi moderat (≤ 250 m untuk Measured, ≤ 500 m untuk Indicated).',
      'Peta batas pit, penampang stratigrafi, dan blok model harus terdokumentasi dalam format CAD/GIS.',
    ],
  },
};
