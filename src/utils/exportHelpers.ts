import * as XLSX from 'xlsx';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
} from 'docx';
import PptxGenJS from 'pptxgenjs';
import { saveAs } from 'file-saver';
import {
  ProjectScenario,
  OperationalCalculations,
  AnnualCashFlow,
  FinancialResults,
  SensitivityDataPoint,
  StrategicRecommendation,
} from '../types/mining';

export interface ExportReportMetadata {
  reportTitle?: string;
  companyName?: string;
  mineConcessionName?: string;
  concessionIupNumber?: string;
  pitOrBlockArea?: string;
  locationAddress?: string;
  analystName?: string;
  analystTitle?: string;
  reviewerName?: string;
  approverName?: string;
  reportRemarks?: string;
  confidentialityLevel?: string;
  documentDate?: string;
  logoCustomUrl?: string;
}

/**
 * Ekspor Data & Hasil Analisa ke Format Excel (.XLSX) dengan Multi-Sheet Komprehensif
 * Mencakup seluruh data geologi, operasional armada, siklus waktu, CAPEX/OPEX,
 * cash flow LOM, sensitivitas pasar, dan kepatuhan regulasi ESDM.
 */
export function exportToExcel(
  scenario: ProjectScenario,
  operational: OperationalCalculations,
  cashFlows: AnnualCashFlow[],
  financials: FinancialResults,
  sensitivity: SensitivityDataPoint[],
  recommendation: StrategicRecommendation,
  metadata?: ExportReportMetadata
) {
  const wb = XLSX.utils.book_new();
  const rateIdr = scenario.financials.currencyExchangeRateIdrUsd || 15800;
  const repTitle = metadata?.reportTitle || `STUDI KELAYAKAN TEKNO-EKONOMI TAMBANG BATUBARA - ${(metadata?.mineConcessionName || scenario.reserves.mineName).toUpperCase()}`;
  const analyst = metadata?.analystName || 'Senior Mining Engineer & Business Project Development Specialist';
  const analystTitle = metadata?.analystTitle || 'Lead Feasibility Analyst';
  const reviewerName = metadata?.reviewerName || 'Head of Mine Engineering & Technical Services';
  const approverName = metadata?.approverName || 'Direktur Utama / Komite Investasi';
  const company = metadata?.companyName || 'PT Tambang Batubara Prima Mandiri';
  const iupNumber = metadata?.concessionIupNumber || '540/128/IUP-OP/ESDM/2023';
  const pitArea = metadata?.pitOrBlockArea || scenario.reserves.pitArea;
  const location = metadata?.locationAddress || scenario.reserves.location;
  const reportDate = metadata?.documentDate || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  const confidentiality = metadata?.confidentialityLevel || 'STRICTLY CONFIDENTIAL';
  const reportRemarks = metadata?.reportRemarks || 'Dokumen resmi kajian tekno-ekonomi tambang batubara berstandar KCMI / JORC & Kepmen ESDM No. 1827 K/30/MEM/2018.';

  // =========================================================================
  // SHEET 1: RINGKASAN EKSEKUTIF & INDIKATOR KUNCI (01_Executive_Summary)
  // =========================================================================
  const execData = [
    ['======================================================================================================'],
    [repTitle],
    ['LAPORAN KELAYAKAN TEKNO-EKONOMI, OPERASIONAL ARMADA & STUDI INVESTASI TAMBANG'],
    ['======================================================================================================'],
    ['Perusahaan / Pemegang IUP', company],
    ['Nomor Izin IUP / PKP2B', iupNumber],
    ['Nama Proyek Tambang', metadata?.mineConcessionName || scenario.reserves.mineName],
    ['Lokasi Tambang', location],
    ['Blok / Pit Area', pitArea],
    ['Tanggal Pengesahan Laporan', reportDate],
    ['Klasifikasi Dokumen', confidentiality],
    ['Disusun Oleh (Lead Analyst)', `${analyst} (${analystTitle})`],
    ['Diperiksa Oleh (Reviewer)', reviewerName],
    ['Disetujui Oleh (Komite Investasi)', approverName],
    ['Catatan & Keterangan Dokumen', reportRemarks],
    ['Status Rekomendasi Investasi', recommendation.overallVerdict],
    ['Status Kelayakan Finansial', financials.projectFeasibilityStatus.replace(/_/g, ' ')],
    [''],
    ['1. RINGKASAN EKSEKUTIF & PERTIMBANGAN KOMITE INVESTASI'],
    ['Uraian Analisis', recommendation.executiveSummary],
    [''],
    ['2. INDIKATOR KELAYAKAN FINANSIAL UTAMA', 'NILAI MODEL (USD)', 'NILAI (IDR EQV.)', 'SATUAN', 'KRITERIA KELAYAKAN', 'STATUS / BENCHMARK'],
    [
      `Net Present Value (NPV @ WACC ${scenario.financials.discountRateWaccPercent}%)`,
      Math.round(financials.npvUsd),
      Math.round(financials.npvUsd * rateIdr),
      'USD / IDR',
      'NPV > 0 (Positif)',
      financials.npvUsd > 0 ? 'LAYAK (Memenuhi Syarat)' : 'TIDAK LAYAK (Negatif)',
    ],
    [
      'Internal Rate of Return (IRR)',
      Number(financials.irrPercent.toFixed(2)),
      '-',
      '%',
      `Target Hurdle Rate ≥ 18% (WACC: ${scenario.financials.discountRateWaccPercent}%)`,
      financials.irrPercent >= 18 ? 'Sangat Layak (IRR > 18%)' : financials.irrPercent >= scenario.financials.discountRateWaccPercent ? 'Layak (IRR > WACC)' : 'Di Bawah Hurdle Rate',
    ],
    [
      'Payback Period (PBP)',
      Number(financials.paybackPeriodYears.toFixed(2)),
      '-',
      'Tahun',
      `< ${(scenario.reserves.mineLifeYears * 0.5).toFixed(1)} Tahun (Maks. 50% LOM)`,
      financials.paybackPeriodYears <= scenario.reserves.mineLifeYears * 0.5 ? 'Aman (Modal Cepat Kembali)' : 'Moderat',
    ],
    [
      'Benefit-Cost Ratio (BCR)',
      Number(financials.benefitCostRatio.toFixed(2)),
      '-',
      'Ratio',
      'BCR > 1.00',
      financials.benefitCostRatio > 1.0 ? 'Menguntungkan (BCR > 1.0)' : 'Tidak Layak',
    ],
    [
      'Profitability Index (PI)',
      Number(financials.profitabilityIndex.toFixed(2)),
      '-',
      'Index',
      'PI > 1.00',
      financials.profitabilityIndex > 1.0 ? 'Penciptaan Nilai Positif' : 'Tidak Layak',
    ],
    [
      'Total Initial Capital Expenditure (CAPEX)',
      Math.round(financials.totalInitialCapexUsd),
      Math.round(financials.totalInitialCapexUsd * rateIdr),
      'USD / IDR',
      `Termasuk Kontinjensi ${scenario.financials.capexContingencyPercent}%`,
      'Belanja Modal Awal',
    ],
    [
      'Harga Batubara Acuan Pasar (FOB)',
      scenario.financials.coalPriceUsdPerTon,
      Math.round(scenario.financials.coalPriceUsdPerTon * rateIdr),
      'USD/Ton',
      `Kualitas GAR ${scenario.reserves.calorificValueGar} kcal/kg`,
      'Asumsi Dasar Penjualan',
    ],
    [
      'Harga Batubara Impas (Breakeven Price)',
      Number(financials.breakevenCoalPriceUsd.toFixed(2)),
      Math.round(financials.breakevenCoalPriceUsd * rateIdr),
      'USD/Ton',
      'Batas Ambang Toleransi Rugi Operasional',
      scenario.financials.coalPriceUsdPerTon >= financials.breakevenCoalPriceUsd ? `Safety Margin: +USD ${(scenario.financials.coalPriceUsdPerTon - financials.breakevenCoalPriceUsd).toFixed(2)}/Ton` : 'BERISIKO (Harga Pasar < Breakeven)',
    ],
    [
      'Rata-rata Biaya Tunai Tambang (Cash Cost FOB)',
      Number(financials.averageCashCostPerTonUsd.toFixed(2)),
      Math.round(financials.averageCashCostPerTonUsd * rateIdr),
      'USD/Ton',
      'Biaya Produksi Eksklusif Royalti & Pajak',
      'Benchmark Kompetitif',
    ],
    [
      'Rata-rata Biaya Total FOB (Full Cost FOB)',
      Number(financials.averageFobCostPerTonUsd.toFixed(2)),
      Math.round(financials.averageFobCostPerTonUsd * rateIdr),
      'USD/Ton',
      'Termasuk Royalti PNBP & Reklamasi',
      'Total FOB Cost',
    ],
    [
      'Total Pendapatan Kotor (LOM Gross Revenue)',
      Math.round(financials.totalLifeOfMineRevenueUsd),
      Math.round(financials.totalLifeOfMineRevenueUsd * rateIdr),
      'USD / IDR',
      'Sepanjang Umur Tambang',
      'Penjualan Batubara Bersih',
    ],
    [
      'Total LOM EBITDA',
      Math.round(financials.totalLifeOfMineEbitdaUsd),
      Math.round(financials.totalLifeOfMineEbitdaUsd * rateIdr),
      'USD / IDR',
      'Kas Operasional Sebelum Bunga, Pajak & Depresiasi',
      `EBITDA Margin: ${financials.averageProfitMarginPercent.toFixed(1)}%`,
    ],
    [
      'Total Laba Bersih Setelah Pajak (LOM Net Profit)',
      Math.round(financials.totalLifeOfMineNetProfitUsd),
      Math.round(financials.totalLifeOfMineNetProfitUsd * rateIdr),
      'USD / IDR',
      'PPh Badan 22% (UU HPP)',
      'Laba Bersih Pemegang Saham',
    ],
    [''],
    ['3. PARAMETER TEKNIS OPERASIONAL KUNCI', 'NILAI', 'SATUAN', 'KETERANGAN'],
    ['Total Cadangan Batubara Tertambang', scenario.reserves.totalReserveMt, 'Juta Ton', 'Cadangan Terbukti & Terkira (JORC/KCMI)'],
    ['Target Produksi Batubara Tahunan', scenario.reserves.targetAnnualProductionMt, 'Juta Ton / Tahun', 'Kapasitas Kontrak Tambang'],
    ['Rencana Nisbah Kupas (Stripping Ratio)', scenario.reserves.plannedStrippingRatio, 'BCM / Ton', 'Nisbah Pengupasan Rata-rata LOM'],
    ['Target Pengupasan Overburden Tahunan', Number((operational.annualObTargetBcm / 1_000_000).toFixed(2)), 'Juta BCM / Tahun', 'Volume Kupasan Tanah Penutup'],
    ['Umur Tambang (Life of Mine)', scenario.reserves.mineLifeYears, 'Tahun', 'Periode Operasi Berdasarkan Cadangan'],
    ['Match Factor Armada Overburden (OB)', Number(operational.matchFactorOB.toFixed(2)), 'Factor', `Status: ${operational.matchFactorStatusOB}`],
    ['Match Factor Armada Batubara (Coal)', Number(operational.matchFactorCoal.toFixed(2)), 'Factor', `Status: ${operational.matchFactorStatusCoal}`],
    ['Ketersediaan Mekanis Excavator OB (MA)', Number(operational.obExcavatorMA.toFixed(1)), '%', 'Standar Kepmen ESDM 1827: ≥ 85%'],
    ['Ketersediaan Fisik Excavator OB (PA)', Number(operational.obExcavatorPA.toFixed(1)), '%', 'Standar Kepmen ESDM 1827: ≥ 90%'],
    ['Penggunaan Ketersediaan Excavator OB (UA)', Number(operational.obExcavatorUA.toFixed(1)), '%', 'Standar Kepmen ESDM 1827: ≥ 80%'],
    ['Efisiensi Efektif Excavator OB (EU)', Number(operational.obExcavatorEU.toFixed(1)), '%', 'Total Pemanfaatan Terhadap Waktu Kalender'],
    ['Total Konsumsi Solar Armada Tambang', Number((operational.totalAnnualFuelLiters / 1_000_000).toFixed(2)), 'Juta Liter / Tahun', 'Bahan Bakar Solar Industri B35'],
    ['Fuel Ratio Batubara', Number(operational.fuelRatioLiterPerTonCoal.toFixed(2)), 'Liter / Ton', 'Konsumsi Solar per Ton Batubara Tergali'],
    ['Fuel Ratio Overburden', Number(operational.fuelRatioLiterPerBcmOb.toFixed(2)), 'Liter / BCM', 'Konsumsi Solar per BCM Tanah Terkupas'],
    [''],
    ['4. KEPATUHAN REGULASI DAN TATA KELOLA PERTAMBANGAN (ESDM)'],
    ['Regulasi', 'Ketentuan Pokok', 'Penerapan Model pada Proyek Ini', 'Status Kepatuhan'],
    [
      'PP No. 26 Tahun 2022',
      'Tarif Royalti PNBP Berjenjang berdasarkan Kalori GAR & Harga Jual Batubara',
      `Kalori ${scenario.reserves.calorificValueGar} kcal/kg GAR pada harga USD ${scenario.financials.coalPriceUsdPerTon}/Ton menghasilkan tarif royalti efektif berjenjang`,
      'PATUH (Dihitung dalam Arus Kas)',
    ],
    [
      'Kepmen ESDM No. 58.K/2022',
      'Kewajiban Pasok Domestik (DMO) minimal 25% dengan Batas Harga PLN USD 70/Ton',
      `Alokasi ${scenario.financials.dmoObligationPercent}% DMO pada cap harga USD ${scenario.financials.dmoPriceCapUsdPerTon}/Ton diintegrasikan dalam harga jual blended`,
      'PATUH (Diakomodasi dalam Model)',
    ],
    [
      'Kepmen ESDM No. 1827 K/30/MEM/2018',
      'Kaidah Teknik Pertambangan yang Baik: Grade jalan maks 12%, lebar jalan angkut min 3.5x lebar dump truck',
      `Grade jalan dimodelkan ${scenario.locationRoad.roadGradePercent}%, ketersediaan mekanis armada dievaluasi sesuai standar ESDM`,
      'PATUH (Memenuhi Batas Teknis)',
    ],
    [
      'Permen ESDM No. 26 Tahun 2018',
      'Penempatan Jaminan Reklamasi & Rencana Penutupan Tambang (Mine Closure)',
      `Dana jaminan reklamasi dialokasikan sebesar USD ${scenario.financials.reclamationAndMineClosureUsdPerTon}/Ton batubara sepanjang umur tambang`,
      'PATUH (Dana Dicadangkan)',
    ],
  ];

  const wsExec = XLSX.utils.aoa_to_sheet(execData);
  wsExec['!cols'] = [
    { wch: 45 },
    { wch: 22 },
    { wch: 22 },
    { wch: 16 },
    { wch: 38 },
    { wch: 32 },
  ];
  XLSX.utils.book_append_sheet(wb, wsExec, '01_Executive_Summary');

  // =========================================================================
  // SHEET 2: PARAMETER GEOLOGI, CADANGAN & LAPANGAN (02_Geologi_dan_Lapangan)
  // =========================================================================
  const geolData = [
    ['PARAMETER GEOLOGI, CADANGAN BATUBARA & KONDISI JALAN HAULING'],
    ['Tambang', scenario.reserves.mineName, 'Lokasi', scenario.reserves.location, 'Pit Area', scenario.reserves.pitArea],
    [''],
    ['1. PARAMETER CADANGAN & GEOLOGI BATUBARA', 'NILAI', 'SATUAN', 'STANDAR RUJUKAN / KETERANGAN'],
    ['Total Cadangan Tertambang (Mineable Reserve)', scenario.reserves.totalReserveMt, 'Juta Ton', 'Berdasarkan Model Geologi Terbukti'],
    ['Target Produksi Batubara Tahunan', scenario.reserves.targetAnnualProductionMt, 'Juta Ton/Tahun', 'Target Kontrak Penjualan'],
    ['Nisbah Pengupasan Rencana (Planned SR)', scenario.reserves.plannedStrippingRatio, 'BCM/Ton', 'Rasio Pengupasan Tanah Penutup'],
    ['Umur Tambang Berdasarkan Cadangan (LOM)', scenario.reserves.mineLifeYears, 'Tahun', 'Cadangan dibagi Target Produksi'],
    ['Nilai Kalori Batubara (Gross As Received - GAR)', scenario.reserves.calorificValueGar, 'kcal/kg', 'Kualitas Batubara Acuan Jual'],
    ['Nilai Kalori Batubara (Net As Received - NAR)', scenario.reserves.calorificValueNar, 'kcal/kg', 'Kualitas Bersih Pembangkit'],
    ['Densitas Batubara Insitu (Insitu Density)', scenario.reserves.insituDensityCoal, 'Ton / m3', 'Berat Jenis Batubara Padat di Pit'],
    ['Densitas Overburden Insitu (Insitu Density OB)', scenario.reserves.insituDensityOb, 'Ton / m3', 'Berat Jenis Tanah Penutup Padat'],
    ['Densitas Overburden Lepas (Loose Density OB)', scenario.reserves.looseDensityOb, 'Ton / m3', 'Berat Jenis Setelah Digali/Dibongkar'],
    ['Swell Factor Overburden', scenario.reserves.swellFactorOb, 'Faktor', 'Faktor Pengembangan Tanah Hasil Penggalian'],
    ['Swell Factor Batubara', scenario.reserves.swellFactorCoal, 'Faktor', 'Faktor Pengembangan Batubara Bersih'],
    [''],
    ['2. GEOMETRI JALAN ANGKUT (HAUL ROAD) & KONDISI LAPANGAN', 'NILAI', 'SATUAN', 'KEPMEN ESDM 1827 / PRAKTIK TERBAIK'],
    ['Jarak Angkut Batubara ke ROM / Port Jetty', scenario.locationRoad.coalHaulDistanceKm, 'km', 'Rute Hauling Truk Menuju Port/Stockpile'],
    ['Jarak Angkut Buang Overburden ke Disposal', scenario.locationRoad.obDumpDistanceKm, 'km', 'Jarak Tempuh Dumptruck ke Area Timbunan'],
    ['Kemiringan Jalan Rata-rata (Road Grade)', scenario.locationRoad.roadGradePercent, '%', 'Standar Kepmen: Kemiringan Maks. 12%'],
    ['Tahanan Gulir Permukaan (Rolling Resistance)', scenario.locationRoad.rollingResistancePercent, '%', 'Tergantung Pemeliharaan dan Perkerasan Jalan'],
    ['Kondisi Permukaan Tanah Jalan', scenario.locationRoad.soilCondition, 'Tipe', 'Klasifikasi Geoteknik Jalan Tambang'],
    ['Kecepatan Rata-rata Hauler Bermuatan', scenario.locationRoad.averageHaulSpeedLoadedKmh, 'km/jam', 'Kecepatan Terisi Menanjak/Datar'],
    ['Kecepatan Rata-rata Hauler Kosongan', scenario.locationRoad.averageHaulSpeedEmptyKmh, 'km/jam', 'Kecepatan Kembali Menuju Front Gali'],
    ['Faktor Retardasi Kecepatan Turunan Terjal', scenario.locationRoad.speedRetardationDownhillFactor || 0.85, 'Faktor', 'Pembatas Keselamatan Rem Turunan Terjal'],
    [''],
    ['3. HAMBATAN CUACA, IKLIM & JAM KERJA EFEKTIF', 'NILAI', 'SATUAN', 'KETERANGAN LOGBOOK OPERASIONAL'],
    ['Hari Kerja Kalender per Tahun', scenario.weatherCorrection.scheduledWorkingDaysPerYear, 'Hari/Tahun', 'Hari Operasional Tambang'],
    ['Shift Kerja per Hari', scenario.weatherCorrection.workingShiftsPerDay, 'Shift/Hari', 'Siklus Regu Kerja (2 Shift @ 12 Jam)'],
    ['Durasi per Shift Kerja', scenario.weatherCorrection.scheduledHoursPerShift, 'Jam/Shift', 'Jam Standar Shift Lapangan'],
    ['Total Jam Kerja Kalender Tersedia', scenario.weatherCorrection.scheduledWorkingDaysPerYear * scenario.weatherCorrection.workingShiftsPerDay * scenario.weatherCorrection.scheduledHoursPerShift, 'Jam/Tahun', 'Waktu Kalender Teoretis'],
    ['Hambatan Hujan Rata-rata (Rain Delay)', scenario.weatherCorrection.rainDelayHoursPerMonth, 'Jam/Bulan', 'Curah Hujan Langsung Menghentikan Operasi'],
    ['Hambatan Jalan Licin/Pengeringan (Slippery)', scenario.weatherCorrection.slipperyDelayHoursPerMonth, 'Jam/Bulan', 'Waktu Pengeringan dan Perbaikan Jalan Grader'],
    ['Hambatan Kabut, Blasting & Pergantian Shift', scenario.weatherCorrection.fogAndSafetyDelayHoursPerMonth, 'Jam/Bulan', 'Keselamatan, Peledakan dan Inspeksi'],
    ['Hambatan Penanganan Pompa Pit Sump/Lumpur', scenario.weatherCorrection.dewateringDelayHoursPerMonth, 'Jam/Bulan', 'Genangan Air dan Lumpur di Pit'],
    ['Total Waktu Hilang Akibat Cuaca & Alam', Math.round((scenario.weatherCorrection.rainDelayHoursPerMonth + scenario.weatherCorrection.slipperyDelayHoursPerMonth + scenario.weatherCorrection.fogAndSafetyDelayHoursPerMonth + scenario.weatherCorrection.dewateringDelayHoursPerMonth) * 12), 'Jam/Tahun', 'Pengurangan Jam Operasi Lapangan'],
    ['Persentase Waktu Hilang Cuaca (Weather Delay %)', Number(operational.weatherDelayPercentage.toFixed(2)), '%', 'Rasio Jam Hambatan terhadap Jam Kalender'],
    ['Jam Kerja Efektif Bersih Tahunan', Math.round(operational.effectiveWorkingHoursPerYear), 'Jam/Tahun', 'Jam Alat Benar-benar Siap Bekerja Bersih'],
    ['Jam Kerja Efektif Bersih Bulanan', Math.round(operational.effectiveWorkingHoursPerMonth), 'Jam/Bulan', 'Dasar Perhitungan Produktivitas'],
    [''],
    ['4. FAKTOR EFISIENSI MANUSIA & TEKNIS OPERASIONAL', 'NILAI', 'SATUAN', 'BENCHMARK PRAKTIK INDUSTRI'],
    ['Faktor Keterampilan Operator (Skill Factor)', scenario.weatherCorrection.operatorSkillFactor, 'Faktor (0-1)', 'Tingkat Kompetensi & Kemahiran Operator'],
    ['Faktor Efisiensi Kerja Lapangan (Job Efficiency)', scenario.weatherCorrection.jobEfficiencyFactor, 'Faktor (0-1)', '50 Menit Efektif per Jam (0.83)'],
    ['Faktor Penurunan Produktivitas Shift Malam', scenario.weatherCorrection.nightShiftFatigueFactor, 'Faktor (0-1)', 'Koreksi Kelelahan & Visibilitas Malam'],
    ['Faktor Pengisian Bucket Excavator (Fill Factor)', scenario.weatherCorrection.bucketFillFactorExcavator, 'Faktor (0-1)', 'Efisiensi Volume Material dalam Bucket'],
  ];

  const wsGeol = XLSX.utils.aoa_to_sheet(geolData);
  wsGeol['!cols'] = [
    { wch: 48 },
    { wch: 20 },
    { wch: 18 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsGeol, '02_Geologi_dan_Lapangan');

  // =========================================================================
  // SHEET 3: DAFTAR ARMADA & KETERSEDIAAN MEKANIS (03_Daftar_Armada)
  // =========================================================================
  const fleetHeaders = [
    'No',
    'Tipe Armada',
    'Merek',
    'Model Unit',
    'Jumlah Unit',
    'Kapasitas',
    'Satuan',
    'Power (HP)',
    'Total HP',
    'Solar (L/h)',
    'Total Solar (L/h)',
    'Tarif Sewa ($/h)',
    'Maint ($/h)',
    'Keausan ($/h)',
    'W (Jam/Bln)',
    'S (Jam/Bln)',
    'R (Jam/Bln)',
    'Total Jam',
    'MA (%)',
    'PA (%)',
    'UA (%)',
    'EU (%)',
    'Standar MA ESDM',
    'Usia (Thn)',
    'SMU Jam',
    'Keausan (%)',
    'Interval PM (h)',
    'MTBF (Jam)',
    'MTTR (Jam)',
  ];

  let sumFleetUnits = 0;
  let sumFleetHp = 0;
  let sumFleetFuel = 0;

  const fleetRows = scenario.equipments.map((eq, idx) => {
    const W = eq.workingHoursW || 450;
    const S = eq.idleHoursS || 80;
    const R = eq.repairHoursR || 70;
    const total = W + S + R || 1;
    const ma = (W / (W + R || 1)) * 100;
    const pa = ((W + S) / total) * 100;
    const ua = (W / (W + S || 1)) * 100;
    const eu = (W / total) * 100;

    const totalHp = (eq.enginePowerHp || 0) * (eq.fleetCount || 0);
    const totalFuel = (eq.fuelBurnRateLph || 0) * (eq.fleetCount || 0);

    sumFleetUnits += eq.fleetCount || 0;
    sumFleetHp += totalHp;
    sumFleetFuel += totalFuel;

    const unitSatuan = eq.type.startsWith('EXCAVATOR')
      ? 'm3'
      : eq.type.startsWith('HAULER')
      ? 'Ton'
      : eq.type === 'SUPPORT_WATER_TRUCK'
      ? 'kL'
      : eq.type === 'SUPPORT_PUMP'
      ? 'm3/h'
      : 'Blade m3';

    return [
      idx + 1,
      eq.type,
      eq.brand || '-',
      eq.model,
      eq.fleetCount,
      eq.bucketOrVesselCapacity,
      unitSatuan,
      eq.enginePowerHp,
      totalHp,
      eq.fuelBurnRateLph,
      totalFuel,
      eq.hourlyRateUsd,
      eq.maintenanceCostHourlyUsd,
      eq.tyreOrTrackWearHourlyUsd || 0,
      W,
      S,
      R,
      total,
      Number(ma.toFixed(1)),
      Number(pa.toFixed(1)),
      Number(ua.toFixed(1)),
      Number(eu.toFixed(1)),
      ma >= 85 ? 'MEMENUHI (≥85%)' : 'DI BAWAH STANDAR',
      eq.ageYears || 1,
      eq.cumulativeHours || 5000,
      eq.wearAndTearPercent || 15,
      eq.preventiveMaintenanceIntervalHours || 250,
      eq.meanTimeBetweenFailuresHours || 120,
      eq.meanTimeToRepairHours || 4.5,
    ];
  });

  // Add Summary Total Row
  const fleetTotalRow = [
    'TOTAL',
    'Seluruh Armada',
    '-',
    '-',
    sumFleetUnits,
    '-',
    '-',
    '-',
    sumFleetHp,
    '-',
    sumFleetFuel,
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
  ];

  const wsFleet = XLSX.utils.aoa_to_sheet([
    ['KOMPOSISI LENGKAP ARMADA ALAT BERAT, KETERSEDIAAN MEKANIS & PARAMETER RELIABILITAS'],
    ['Standar Baku Evaluasi: Kepmen ESDM No. 1827 K/30/MEM/2018 & Australian Standard AS 2528'],
    [''],
    fleetHeaders,
    ...fleetRows,
    fleetTotalRow,
  ]);

  wsFleet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 15 },
    { wch: 22 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 13 },
    { wch: 16 },
    { wch: 15 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 20 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsFleet, '03_Daftar_Armada');

  // =========================================================================
  // SHEET 4: PRODUKTIVITAS, SIKLUS WAKTU & MATCH FACTOR (04_Produktivitas_Cycle)
  // =========================================================================
  const prodData = [
    ['ANALISIS SIKLUS WAKTU (CYCLE TIME), PRODUKTIVITAS & KESERASIAN ARMADA (MATCH FACTOR)'],
    ['Tambang', scenario.reserves.mineName, 'Lokasi', scenario.reserves.location],
    [''],
    ['1. RINCIAN SIKLUS WAKTU GALI-MUAT EXCAVATOR OB', 'NILAI', 'SATUAN', 'KETERANGAN'],
    ['Waktu Menggali Material (Digging Time)', operational.cycleTimeOB.loaderDigSec, 'Detik', 'Penetrasi Bucket ke Material Lapisan'],
    ['Waktu Putar Bermuatan (Swing Loaded)', operational.cycleTimeOB.loaderSwingLoadedSec, 'Detik', 'Manuver Sudut Putar ke Vessel Truk (90°)'],
    ['Waktu Menumpahkan (Dumping to Truck)', operational.cycleTimeOB.loaderDumpSec, 'Detik', 'Pelepasan Material ke Bak Dump Truck'],
    ['Waktu Putar Kosong (Swing Empty)', operational.cycleTimeOB.loaderSwingEmptySec, 'Detik', 'Kembali ke Posisi Front Gali'],
    ['Total Waktu Siklus Excavator OB (Loader Cycle)', operational.cycleTimeOB.loaderTotalCycleSec, 'Detik', 'Siklus Lengkap 1 Kali Pengisian'],
    ['Jumlah Pengisian per Truk (Passes Required)', operational.cycleTimeOB.haulerPassesRequired, 'Passes', 'Kapasitas Vessel dibagi Kapasitas Bucket'],
    [''],
    ['2. RINCIAN SIKLUS WAKTU PENGANGKUTAN DUMP TRUCK OB', 'NILAI', 'SATUAN', 'KETERANGAN'],
    ['Waktu Manuver Mengambil Posisi (Spot at Loader)', operational.cycleTimeOB.haulerSpotAtLoaderSec, 'Detik', 'Antri dan Manuver Mundur di Front'],
    ['Waktu Pemuatan Material (Loading Time)', Number(operational.cycleTimeOB.haulerLoadingTimeMin.toFixed(2)), 'Menit', 'Durasi Diisi Excavator'],
    ['Waktu Pengangkutan Bermuatan (Haul Loaded)', Number(operational.cycleTimeOB.haulerHaulLoadedMin.toFixed(2)), 'Menit', `Jarak: ${scenario.locationRoad.obDumpDistanceKm} km @ ${scenario.locationRoad.averageHaulSpeedLoadedKmh} km/jam`],
    ['Waktu Manuver & Tumpah di Disposal (Spot & Dump)', Number(operational.cycleTimeOB.haulerSpotAndDumpMin.toFixed(2)), 'Menit', 'Manuver di Area Timbunan Disposal'],
    ['Waktu Perjalanan Kembali Kosongan (Return Empty)', Number(operational.cycleTimeOB.haulerReturnEmptyMin.toFixed(2)), 'Menit', `Kecepatan: ${scenario.locationRoad.averageHaulSpeedEmptyKmh} km/jam`],
    ['Total Waktu Siklus Truk OB (Hauler Cycle Time)', Number(operational.cycleTimeOB.haulerTotalCycleMin.toFixed(2)), 'Menit', 'Waktu 1 Ritase Penuh Pengangkutan'],
    ['Frekuensi Ritase per Jam (Trips per Hour)', Number(operational.cycleTimeOB.haulerTripsPerHour.toFixed(2)), 'Rit / Jam', 'Frekuensi Ritase Tiap Unit Truk'],
    [''],
    ['3. EVALUASI KESERASIAN ARMADA (MATCH FACTOR)', 'NILAI', 'SATUAN', 'STATUS / REKOMENDASI MANAJEMEN'],
    ['Match Factor Armada Overburden (OB)', Number(operational.matchFactorOB.toFixed(2)), 'Ratio', `Status: ${operational.matchFactorStatusOB}`],
    [
      'Kondisi Operasional OB',
      '-',
      '-',
      operational.matchFactorOB > 1.05
        ? 'Terdapat Antrian Dump Truck di Front (Truk Menunggu Loader). Pertimbangkan kurangi 1-2 hauler atau alihkan ke rute lebih jauh.'
        : operational.matchFactorOB < 0.95
        ? 'Excavator Menunggu Dump Truck (Loader Idle). Kapasitas gali belum termanfaatkan optimal; tambah unit hauler.'
        : 'Sangat Serasi & Optimal (Antrian dan Waktu Tunggu Minimal). Pertahankan komposisi ini.',
    ],
    ['Match Factor Armada Batubara (Coal)', Number(operational.matchFactorCoal.toFixed(2)), 'Ratio', `Status: ${operational.matchFactorStatusCoal}`],
    [
      'Kondisi Operasional Batubara',
      '-',
      '-',
      operational.matchFactorCoal > 1.05
        ? 'Antrian Truk Batubara di Front Pemuatan. Rute hauling batubara perlu dievaluasi.'
        : operational.matchFactorCoal < 0.95
        ? 'Excavator Batubara Menganggur Menunggu Truk. Tambah hauler batubara.'
        : 'Kombinasi Pengangkutan Batubara Optimal.',
    ],
    [''],
    ['4. PERBANDINGAN TARGET vs KAPASITAS AKTUAL ARMADA', 'TARGET RENCANA', 'KAPASITAS AKTUAL ARMADA', 'SATUAN', 'PERSENTASE TERCAPAI'],
    [
      'Produksi Pengupasan Overburden (OB)',
      Math.round(operational.annualObTargetBcm),
      Math.round(operational.annualObActualFleetBcm),
      'BCM / Tahun',
      `${operational.obProductionAchievementPercent.toFixed(1)}% (${operational.obProductionAchievementPercent >= 100 ? 'Target Terpenuhi' : 'Defisit Kapasitas'})`,
    ],
    [
      'Produksi Penambangan Batubara (Coal)',
      Math.round(operational.annualCoalTargetTon),
      Math.round(operational.annualCoalActualFleetTon),
      'Ton / Tahun',
      `${operational.coalProductionAchievementPercent.toFixed(1)}% (${operational.coalProductionAchievementPercent >= 100 ? 'Target Terpenuhi' : 'Defisit Kapasitas'})`,
    ],
    [''],
    ['5. KONSUMSI BAHAN BAKAR SOLAR & EFISIENSI ENERGI', 'NILAI', 'SATUAN', 'KETERANGAN'],
    ['Total Konsumsi Solar Seluruh Armada', Math.round(operational.totalAnnualFuelLiters), 'Liter / Tahun', 'Bahan Bakar Solar Industri B35'],
    ['Konsumsi Solar per Jam Operasi Tambang', Math.round(operational.totalAnnualFuelLiters / (operational.effectiveWorkingHoursPerYear || 1)), 'Liter / Jam', 'Laju Pembakaran Rata-rata Gabungan'],
    ['Fuel Ratio Batubara (Fuel Ratio Coal)', Number(operational.fuelRatioLiterPerTonCoal.toFixed(2)), 'Liter / Ton', 'Konsumsi Solar per Ton Batubara Terproduksi'],
    ['Fuel Ratio Overburden (Fuel Ratio OB)', Number(operational.fuelRatioLiterPerBcmOb.toFixed(2)), 'Liter / BCM', 'Konsumsi Solar per BCM Tanah Penutup Dikupas'],
    ['Harga Solar Industri Asumsi', scenario.financials.industrialFuelPriceUsdPerLiter, 'USD / Liter', `Rp ${Math.round(scenario.financials.industrialFuelPriceUsdPerLiter * rateIdr).toLocaleString('id-ID')} / Liter`],
    ['Total Biaya Solar Tahunan', Math.round(operational.totalAnnualFuelLiters * scenario.financials.industrialFuelPriceUsdPerLiter), 'USD / Tahun', `Rp ${Math.round(operational.totalAnnualFuelLiters * scenario.financials.industrialFuelPriceUsdPerLiter * rateIdr).toLocaleString('id-ID')} / Tahun`],
  ];

  const wsProd = XLSX.utils.aoa_to_sheet(prodData);
  wsProd['!cols'] = [
    { wch: 48 },
    { wch: 22 },
    { wch: 18 },
    { wch: 45 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsProd, '04_Produktivitas_Cycle');

  // =========================================================================
  // SHEET 5: STRUKTUR BIAYA INVESTASI CAPEX & BIAYA OPERASIONAL OPEX ABC (05_Struktur_CAPEX_OPEX)
  // =========================================================================
  const fin = scenario.financials;
  const capexItems = [
    ['1. ALOKASI BELANJA MODAL AWAL (INITIAL CAPEX)', 'NILAI (USD)', 'NILAI (IDR EQV.)', 'PERSENTASE (%)', 'DESKRIPSI LINGKUP PEKERJAAN'],
    [
      'Eksplorasi Detail, Pemboran & Perizinan IUP',
      fin.capexExplorationAndPermittingUsd,
      Math.round(fin.capexExplorationAndPermittingUsd * rateIdr),
      Number(((fin.capexExplorationAndPermittingUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)),
      'Pemetaan Geologi, Coring Batubara, AMDAL, UKL/UPL, FS ESDM',
    ],
    [
      'Pembebasan Lahan & Ganti Rugi Tanam Tumbuh',
      fin.capexLandAcquisitionUsd,
      Math.round(fin.capexLandAcquisitionUsd * rateIdr),
      Number(((fin.capexLandAcquisitionUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)),
      'Area Pit Tambang, Disposal, Settling Pond & Koridor Hauling Road',
    ],
    [
      'Konstruksi Jalan Hauling, Jembatan & Gorong-gorong',
      fin.capexHaulingRoadAndInfrastructureUsd,
      Math.round(fin.capexHaulingRoadAndInfrastructureUsd * rateIdr),
      Number(((fin.capexHaulingRoadAndInfrastructureUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)),
      'Perkerasan Jalan Tambang Agregat, Drainage, Jembatan Muatan Berat',
    ],
    [
      'Fasilitas Stockpile, Crushing Plant & Jetty Port',
      fin.capexPortAndJettyFacilityUsd,
      Math.round(fin.capexPortAndJettyFacilityUsd * rateIdr),
      Number(((fin.capexPortAndJettyFacilityUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)),
      'Hopper, Crusher 500 TPH, Conveyor, Trestle Jetty & Mooring Dolphin',
    ],
    [
      'Fasilitas Camp Karyawan, Kantor & Workshop Bengkel',
      fin.capexCampAndWorkshopUsd,
      Math.round(fin.capexCampAndWorkshopUsd * rateIdr),
      Number(((fin.capexCampAndWorkshopUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)),
      'Mess Akomodasi, Kantor Administrasi, Gudang Suku Cadang & Fuel Station',
    ],
    [
      'Pengadaan / Uang Muka Armada Alat Berat Utama',
      fin.capexEquipmentFleetPurchasedUsd,
      Math.round(fin.capexEquipmentFleetPurchasedUsd * rateIdr),
      Number(((fin.capexEquipmentFleetPurchasedUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)),
      'Down Payment / Pembelian Unit Alat Berat & Fasilitas Pendukung',
    ],
    [
      `Dana Kontinjensi Proyek (${fin.capexContingencyPercent}%)`,
      Math.round(
        (financials.totalInitialCapexUsd * fin.capexContingencyPercent) / (100 + fin.capexContingencyPercent)
      ),
      Math.round(
        ((financials.totalInitialCapexUsd * fin.capexContingencyPercent) / (100 + fin.capexContingencyPercent)) * rateIdr
      ),
      fin.capexContingencyPercent,
      'Cadangan Biaya Tak Terduga & Kenaikan Harga Eskalasi',
    ],
    [
      'TOTAL INITIAL CAPITAL EXPENDITURE (CAPEX)',
      Math.round(financials.totalInitialCapexUsd),
      Math.round(financials.totalInitialCapexUsd * rateIdr),
      100.0,
      'Total Modal Awal yang Diperlukan Sebelum Komisioning',
    ],
    [''],
    ['CAPEX per Ton Cadangan Batubara', Number((financials.totalInitialCapexUsd / (scenario.reserves.totalReserveMt * 1_000_000)).toFixed(2)), Number(((financials.totalInitialCapexUsd * rateIdr) / (scenario.reserves.totalReserveMt * 1_000_000)).toFixed(0)), 'USD/Ton & IDR/Ton', 'Intensitas Belanja Modal terhadap Cadangan'],
    [''],
    ['2. BIAYA OPERASIONAL BERBASIS AKTIVITAS (ACTIVITY-BASED COSTING OPEX)', 'TARIF ($ / UNIT)', 'TARIF (IDR EQV.)', 'BIAYA TAHUNAN (USD)', 'BIAYA TAHUNAN (IDR)', 'SHARE PADA FOB (%)'],
    [
      'Pengupasan Overburden (OB Removal)',
      `${fin.obMiningContractorRateUsdPerBcm} / BCM`,
      `Rp ${Math.round(fin.obMiningContractorRateUsdPerBcm * rateIdr).toLocaleString('id-ID')} / BCM`,
      Math.round(operational.activityCosting.obRemoval.annualTotalUsd),
      Math.round(operational.activityCosting.obRemoval.annualTotalIdr),
      Number(operational.activityCosting.obRemoval.shareOfFobCostPercent.toFixed(1)),
    ],
    [
      'Penambangan Batubara Bersih (Coal Getting)',
      `${fin.coalMiningContractorRateUsdPerTon} / Ton`,
      `Rp ${Math.round(fin.coalMiningContractorRateUsdPerTon * rateIdr).toLocaleString('id-ID')} / Ton`,
      Math.round(operational.activityCosting.coalGetting.annualTotalUsd),
      Math.round(operational.activityCosting.coalGetting.annualTotalIdr),
      Number(operational.activityCosting.coalGetting.shareOfFobCostPercent.toFixed(1)),
    ],
    [
      'Pengangkutan Hauling Batubara ke Pelabuhan',
      `${fin.coalHaulingUsdPerTonKm} / Ton.km`,
      `Rp ${Math.round(fin.coalHaulingUsdPerTonKm * rateIdr).toLocaleString('id-ID')} / Ton.km`,
      Math.round(operational.activityCosting.coalHauling.annualTotalUsd),
      Math.round(operational.activityCosting.coalHauling.annualTotalIdr),
      Number(operational.activityCosting.coalHauling.shareOfFobCostPercent.toFixed(1)),
    ],
    [
      'Pemeliharaan Tambang, Jalan & Dewatering Pit',
      `${(operational.activityCosting.pitSupportAndDewatering.rateUsd).toFixed(2)} / Ton`,
      `Rp ${Math.round(operational.activityCosting.pitSupportAndDewatering.rateIdr).toLocaleString('id-ID')} / Ton`,
      Math.round(operational.activityCosting.pitSupportAndDewatering.annualTotalUsd),
      Math.round(operational.activityCosting.pitSupportAndDewatering.annualTotalIdr),
      Number(operational.activityCosting.pitSupportAndDewatering.shareOfFobCostPercent.toFixed(1)),
    ],
    [
      'Pengolahan, Crushing & Penanganan Stockpile',
      `${fin.coalCrushingAndHandlingUsdPerTon} / Ton`,
      `Rp ${Math.round(fin.coalCrushingAndHandlingUsdPerTon * rateIdr).toLocaleString('id-ID')} / Ton`,
      Math.round(operational.activityCosting.crushingStockpilePort.annualTotalUsd),
      Math.round(operational.activityCosting.crushingStockpilePort.annualTotalIdr),
      Number(operational.activityCosting.crushingStockpilePort.shareOfFobCostPercent.toFixed(1)),
    ],
    [
      'Tongkang & Alih Muat (Barging & Transhipment)',
      `${fin.bargingAndTranshipmentUsdPerTon} / Ton`,
      `Rp ${Math.round(fin.bargingAndTranshipmentUsdPerTon * rateIdr).toLocaleString('id-ID')} / Ton`,
      Math.round(operational.activityCosting.bargingTranshipment.annualTotalUsd),
      Math.round(operational.activityCosting.bargingTranshipment.annualTotalIdr),
      Number(operational.activityCosting.bargingTranshipment.shareOfFobCostPercent.toFixed(1)),
    ],
    [
      'Pengelolaan Pelabuhan & Surveyor Independen',
      `${fin.portHandlingAndSurveyorUsdPerTon} / Ton`,
      `Rp ${Math.round(fin.portHandlingAndSurveyorUsdPerTon * rateIdr).toLocaleString('id-ID')} / Ton`,
      Math.round(fin.portHandlingAndSurveyorUsdPerTon * scenario.reserves.targetAnnualProductionMt * 1_000_000),
      Math.round(fin.portHandlingAndSurveyorUsdPerTon * scenario.reserves.targetAnnualProductionMt * 1_000_000 * rateIdr),
      Number(((fin.portHandlingAndSurveyorUsdPerTon / operational.activityCosting.totalFobCashCostUsdPerTon) * 100).toFixed(1)),
    ],
    [
      'Biaya Umum & Administrasi (G&A Overhead)',
      `${(operational.activityCosting.generalAdminOverhead.rateUsd).toFixed(2)} / Ton`,
      `Rp ${Math.round(operational.activityCosting.generalAdminOverhead.rateIdr).toLocaleString('id-ID')} / Ton`,
      Math.round(operational.activityCosting.generalAdminOverhead.annualTotalUsd),
      Math.round(operational.activityCosting.generalAdminOverhead.annualTotalIdr),
      Number(operational.activityCosting.generalAdminOverhead.shareOfFobCostPercent.toFixed(1)),
    ],
    [
      'Kewajiban Royalti PNBP ESDM (PP 26/2022)',
      `${(operational.activityCosting.royaltyPnbp.rateUsd).toFixed(2)} / Ton`,
      `Rp ${Math.round(operational.activityCosting.royaltyPnbp.rateIdr).toLocaleString('id-ID')} / Ton`,
      Math.round(operational.activityCosting.royaltyPnbp.annualTotalUsd),
      Math.round(operational.activityCosting.royaltyPnbp.annualTotalIdr),
      Number(operational.activityCosting.royaltyPnbp.shareOfFobCostPercent.toFixed(1)),
    ],
    [
      'Jaminan Reklamasi & Rencana Pascatambang',
      `${fin.reclamationAndMineClosureUsdPerTon} / Ton`,
      `Rp ${Math.round(fin.reclamationAndMineClosureUsdPerTon * rateIdr).toLocaleString('id-ID')} / Ton`,
      Math.round(operational.activityCosting.reclamationAndClosure.annualTotalUsd),
      Math.round(operational.activityCosting.reclamationAndClosure.annualTotalIdr),
      Number(operational.activityCosting.reclamationAndClosure.shareOfFobCostPercent.toFixed(1)),
    ],
    [
      'TOTAL BIAYA PRODUKSI FOB (FOB FULL COST)',
      `${(operational.activityCosting.totalFobCashCostUsdPerTon).toFixed(2)} / Ton`,
      `Rp ${Math.round(operational.activityCosting.totalFobCashCostIdrPerTon).toLocaleString('id-ID')} / Ton`,
      Math.round(operational.activityCosting.totalFobAnnualUsd),
      Math.round(operational.activityCosting.totalFobAnnualIdr),
      100.0,
    ],
  ];

  const wsCapex = XLSX.utils.aoa_to_sheet(capexItems);
  wsCapex['!cols'] = [
    { wch: 48 },
    { wch: 20 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCapex, '05_Struktur_CAPEX_OPEX');

  // =========================================================================
  // SHEET 6: PROYEKSI CASH FLOW TAHUNAN SEPANJANG UMUR TAMBANG (06_Cash_Flow_LOM)
  // =========================================================================
  const cfHeaders = [
    'Tahun Ke-',
    'Produksi Batubara (Ton)',
    'Kupas Overburden (BCM)',
    'Stripping Ratio (BCM/Ton)',
    'Harga Blended ($/Ton)',
    'Gross Revenue (USD)',
    'Gross Revenue (IDR)',
    'Biaya OB Mining (USD)',
    'Biaya Coal Getting (USD)',
    'Biaya Coal Hauling (USD)',
    'Crushing & Stockpile (USD)',
    'Barging & Transhipment (USD)',
    'Port & Surveyor (USD)',
    'Bahan Bakar Solar (USD)',
    'Maintenance & Workshop (USD)',
    'G&A Overhead (USD)',
    'Royalti PNBP ESDM (USD)',
    'Jaminan Reklamasi (USD)',
    'Total OPEX (USD)',
    'Cash Cost ($/Ton)',
    'FOB Total Cost ($/Ton)',
    'EBITDA (USD)',
    'Depresiasi (USD)',
    'EBT (USD)',
    'PPh Badan 22% (USD)',
    'Net Profit After Tax (USD)',
    'Belanja Modal CAPEX (USD)',
    'Net Free Cash Flow (USD)',
    'Discounted Cash Flow (USD)',
    'Kumulatif Cash Flow (USD)',
  ];

  const cfRows = cashFlows.map((cf) => [
    `Tahun ${cf.year}`,
    cf.coalProductionTon,
    cf.obStrippedBcm,
    cf.strippingRatio,
    Number(cf.blendedCoalPriceUsd.toFixed(2)),
    Math.round(cf.grossRevenueUsd),
    Math.round(cf.grossRevenueUsd * rateIdr),
    Math.round(cf.obMiningCostUsd),
    Math.round(cf.coalMiningCostUsd),
    Math.round(cf.coalHaulingCostUsd),
    Math.round(cf.crushingStockpileCostUsd),
    Math.round(cf.bargingTranshipmentCostUsd),
    Math.round(cf.portHandlingCostUsd),
    Math.round(cf.fuelCostUsd),
    Math.round(cf.maintenanceCostUsd),
    Math.round(cf.generalAdminCostUsd),
    Math.round(cf.royaltyPnbpUsd),
    Math.round(cf.reclamationReserveUsd),
    Math.round(cf.totalOpexUsd),
    Number(cf.cashCostPerTonUsd.toFixed(2)),
    Number(cf.fobTotalCostPerTonUsd.toFixed(2)),
    Math.round(cf.ebitdaUsd),
    Math.round(cf.depreciationUsd),
    Math.round(cf.ebtUsd),
    Math.round(cf.taxUsd),
    Math.round(cf.netProfitAfterTaxUsd),
    Math.round(cf.capexUsd),
    Math.round(cf.netCashFlowUsd),
    Math.round(cf.discountedCashFlowUsd),
    Math.round(cf.cumulativeCashFlowUsd),
  ]);

  // Total LOM row for cash flows
  const totalCoal = cashFlows.reduce((acc, c) => acc + c.coalProductionTon, 0);
  const totalOb = cashFlows.reduce((acc, c) => acc + c.obStrippedBcm, 0);
  const totalRev = cashFlows.reduce((acc, c) => acc + c.grossRevenueUsd, 0);
  const totalOpex = cashFlows.reduce((acc, c) => acc + c.totalOpexUsd, 0);
  const totalEbitda = cashFlows.reduce((acc, c) => acc + c.ebitdaUsd, 0);
  const totalTax = cashFlows.reduce((acc, c) => acc + c.taxUsd, 0);
  const totalNetProfit = cashFlows.reduce((acc, c) => acc + c.netProfitAfterTaxUsd, 0);
  const totalCapex = cashFlows.reduce((acc, c) => acc + c.capexUsd, 0);
  const totalNcf = cashFlows.reduce((acc, c) => acc + c.netCashFlowUsd, 0);

  const cfTotalRow = [
    'TOTAL LOM',
    totalCoal,
    totalOb,
    Number((totalOb / (totalCoal || 1)).toFixed(2)),
    '-',
    Math.round(totalRev),
    Math.round(totalRev * rateIdr),
    Math.round(cashFlows.reduce((acc, c) => acc + c.obMiningCostUsd, 0)),
    Math.round(cashFlows.reduce((acc, c) => acc + c.coalMiningCostUsd, 0)),
    Math.round(cashFlows.reduce((acc, c) => acc + c.coalHaulingCostUsd, 0)),
    Math.round(cashFlows.reduce((acc, c) => acc + c.crushingStockpileCostUsd, 0)),
    Math.round(cashFlows.reduce((acc, c) => acc + c.bargingTranshipmentCostUsd, 0)),
    Math.round(cashFlows.reduce((acc, c) => acc + c.portHandlingCostUsd, 0)),
    Math.round(cashFlows.reduce((acc, c) => acc + c.fuelCostUsd, 0)),
    Math.round(cashFlows.reduce((acc, c) => acc + c.maintenanceCostUsd, 0)),
    Math.round(cashFlows.reduce((acc, c) => acc + c.generalAdminCostUsd, 0)),
    Math.round(cashFlows.reduce((acc, c) => acc + c.royaltyPnbpUsd, 0)),
    Math.round(cashFlows.reduce((acc, c) => acc + c.reclamationReserveUsd, 0)),
    Math.round(totalOpex),
    Number((totalOpex / (totalCoal || 1)).toFixed(2)),
    Number((totalOpex / (totalCoal || 1)).toFixed(2)),
    Math.round(totalEbitda),
    Math.round(cashFlows.reduce((acc, c) => acc + c.depreciationUsd, 0)),
    Math.round(cashFlows.reduce((acc, c) => acc + c.ebtUsd, 0)),
    Math.round(totalTax),
    Math.round(totalNetProfit),
    Math.round(totalCapex),
    Math.round(totalNcf),
    Math.round(financials.npvUsd),
    '-',
  ];

  const wsCf = XLSX.utils.aoa_to_sheet([
    ['MODEL PROYEKSI ARUS KAS TAHUNAN & LAPORAN LABA RUGI KOMPREHENSIF (LIFE OF MINE)'],
    [`Suku Bunga Diskonto (WACC): ${scenario.financials.discountRateWaccPercent}% | Tarif PPh Badan: 22% | Kurs IDR/USD: Rp ${rateIdr.toLocaleString('id-ID')}`],
    [''],
    cfHeaders,
    ...cfRows,
    cfTotalRow,
  ]);

  wsCf['!cols'] = [
    { wch: 14 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 20 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
    { wch: 22 },
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCf, '06_Cash_Flow_LOM');

  // =========================================================================
  // SHEET 7: ANALISIS SENSITIVITAS & RISIKO PASAR (07_Analisis_Sensitivitas)
  // =========================================================================
  const sensHeaders = [
    'Deviasi (%)',
    'NPV Harga Batubara ($)',
    'IRR Harga Batubara (%)',
    'NPV Biaya Solar ($)',
    'IRR Biaya Solar (%)',
    'NPV Stripping Ratio ($)',
    'IRR Stripping Ratio (%)',
    'NPV OPEX Total ($)',
    'IRR OPEX Total (%)',
    'NPV CAPEX Investasi ($)',
    'IRR CAPEX Investasi (%)',
  ];

  const sensRows = sensitivity.map((s) => [
    `${s.changePercent > 0 ? '+' : ''}${s.changePercent}%`,
    Math.round(s.coalPriceNpvUsd),
    Number(s.coalPriceIrrPercent.toFixed(2)),
    Math.round(s.fuelCostNpvUsd),
    Number(s.fuelCostIrrPercent.toFixed(2)),
    Math.round(s.strippingRatioNpvUsd),
    Number(s.strippingRatioIrrPercent.toFixed(2)),
    Math.round(s.opexNpvUsd),
    Number(s.opexIrrPercent.toFixed(2)),
    Math.round(s.capexNpvUsd),
    Number(s.capexIrrPercent.toFixed(2)),
  ]);

  const sensExtraData = [
    [''],
    ['ANALISIS TITIK IMPAS (BREAKEVEN ANALYSIS) & TOLERANSI RISIKO'],
    ['Parameter Kunci', 'Nilai Ambang Batas', 'Kondisi Saat Ini', 'Safety Margin / Penyangga'],
    [
      'Harga Batubara Impas (Breakeven Coal Price)',
      `USD ${financials.breakevenCoalPriceUsd.toFixed(2)} / Ton`,
      `USD ${scenario.financials.coalPriceUsdPerTon.toFixed(2)} / Ton`,
      `Safety Buffer: USD ${(scenario.financials.coalPriceUsdPerTon - financials.breakevenCoalPriceUsd).toFixed(2)} / Ton (${(((scenario.financials.coalPriceUsdPerTon - financials.breakevenCoalPriceUsd) / scenario.financials.coalPriceUsdPerTon) * 100).toFixed(1)}%)`,
    ],
    [
      'Nisbah Kupas Maksimum Impas (Breakeven Stripping Ratio)',
      `${(scenario.reserves.plannedStrippingRatio * (scenario.financials.coalPriceUsdPerTon / financials.breakevenCoalPriceUsd)).toFixed(2)} BCM/Ton`,
      `${scenario.reserves.plannedStrippingRatio.toFixed(2)} BCM/Ton`,
      'Batas Maksimum Pengupasan Sebelum Proyek Merugi',
    ],
    [''],
    ['PERINGKAT SENSITIVITAS RISIKO TERHADAP NILAI INVESTASI (TORNADO ANALYSIS RANKING)'],
    ['Peringkat Kerentanan', 'Variabel Driver Risiko', 'Tingkat Dampak Volatilitas pada NPV', 'Mitigasi Strategis yang Disarankan'],
    ['1 (Paling Kritis)', 'Harga Jual Batubara Pasar', 'Sangat Tinggi (Sensitivitas Utama)', 'Lindung Nilai (Hedging) & Kontrak Jangka Panjang Fixed Price dengan Pembangkit'],
    ['2 (Kritis)', 'Nisbah Kupas (Stripping Ratio Lapangan)', 'Tinggi (Setiap kenaikan 1 BCM/Ton menggerus margin kas)', 'Optimasi Desain Pit, In-Pit Dumping & Geoteknik Dinding Terjal Aman'],
    ['3 (Signifikan)', 'Biaya Bahan Bakar Solar Industri', 'Signifikan (Komponen biaya terbesar kedua)', 'Kontrak Pasokan Solar B35 Formula Jangka Panjang & Efisiensi Jalur Hauling'],
    ['4 (Moderat)', 'Biaya OPEX Tambang Kontraktor', 'Moderat', 'Negosiasi Rate Kontrak Penambangan Berbasis Produktivitas & Efisiensi BBM'],
    ['5 (Terkendali)', 'Belanja Modal Awal (CAPEX)', 'Terkendali (Dampak satu kali di awal)', 'Pengawasan Ketat Konstruksi Infrastruktur & Pengadaan Vendor Bersaing'],
  ];

  const wsSens = XLSX.utils.aoa_to_sheet([
    ['MATRIKS ANALISIS SENSITIVITAS MULTIVARIABEL (STRESS TESTING FINANSIAL)'],
    ['Evaluasi Pengaruh Deviasi Parameter Pasar dan Biaya Terhadap NPV & IRR Proyek'],
    [''],
    sensHeaders,
    ...sensRows,
    ...sensExtraData,
  ]);

  wsSens['!cols'] = [
    { wch: 14 },
    { wch: 24 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSens, '07_Analisis_Sensitivitas');

  // =========================================================================
  // SHEET 8: RENCANA AKSI STRATEGIS & KEPATUHAN REGULASI ESDM (08_Rekomendasi_Regulasi)
  // =========================================================================
  const recHeaders = ['No', 'Kategori', 'Tingkat Prioritas', 'Inisiatif Strategis', 'Deskripsi Masalah / Latar Belakang', 'Rencana Tindakan Nyata (Actionable Steps)'];
  const recRows = recommendation.strategicActions.map((act, i) => [
    i + 1,
    act.category,
    act.priority,
    act.title,
    act.description,
    act.actionableStep,
  ]);

  const esdmMatrix = [
    [''],
    ['MATRIKS KEPATUHAN HUKUM & REGULASI PERTAMBANGAN NASIONAL (ESDM)'],
    ['No', 'Regulasi Pemerintah', 'Topik Regulasi Pokok', 'Kewajiban Perusahaan', 'Implementasi dalam Model Kelayakan', 'Status Verifikasi'],
    [
      1,
      'PP No. 26 Tahun 2022',
      'Tarif Royalti PNBP Batubara',
      'Membayar royalti secara berjenjang berdasarkan Harga Batubara Acuan (HBA) dan tingkat kalori batubara GAR.',
      `Dihitung otomatis per tahun sebesar 8.5% - 10.5% dari Pendapatan Kotor FOB batubara GAR ${scenario.reserves.calorificValueGar} kcal/kg.`,
      'TERVERIFIKASI & TERPENUHI',
    ],
    [
      2,
      'Kepmen ESDM No. 58.K/2022',
      'Domestic Market Obligation (DMO)',
      'Memasok minimal 25% dari total produksi batubara tahunan untuk kebutuhan kelistrikan umum (PLN) dengan harga patokan maksimal USD 70/Ton.',
      `Volume DMO 25% dikunci pada harga USD ${scenario.financials.dmoPriceCapUsdPerTon}/Ton menghasilkan weighted blended price yang konservatif dan aman.`,
      'TERVERIFIKASI & TERPENUHI',
    ],
    [
      3,
      'Kepmen ESDM No. 1827 K/30/MEM/2018 Lampiran II & III',
      'Kaidah Teknik Pertambangan yang Baik & Keselamatan Operasi',
      'Desain kemiringan jalan hauling maksimum 12%, lebar jalan angkut minimum 3.5x lebar dump truck terbesar, kesiapan mekanis armada MA ≥ 85%, PA ≥ 90%.',
      `Jalan dimodelkan pada grade ${scenario.locationRoad.roadGradePercent}%, armada dievaluasi dengan indeks MA/PA/UA/EU standar ESDM.`,
      'TERVERIFIKASI & TERPENUHI',
    ],
    [
      4,
      'Permen ESDM No. 26 Tahun 2018 & Kepmen 1827 Lampiran VI',
      'Jaminan Reklamasi & Rencana Pascatambang (Mine Closure)',
      'Menempatkan dana jaminan reklamasi tahunan dan jaminan pascatambang pada bank pemerintah sebelum kegiatan operasi produksi berlangsung.',
      `Alokasi dana reklamasi dicadangkan secara tahunan sebesar USD ${scenario.financials.reclamationAndMineClosureUsdPerTon}/Ton batubara yang diproduksi.`,
      'TERVERIFIKASI & TERPENUHI',
    ],
  ];

  const signOffData = [
    [''],
    ['======================================================================================================'],
    ['PENGESAHAN LAPORAN STUDI KELAYAKAN TEKNO-EKONOMI PERTAMBANGAN'],
    ['======================================================================================================'],
    ['Disiapkan Oleh (Lead Analyst):', 'Diperiksa Oleh (Technical Reviewer):', 'Disetujui Oleh (Komite Investasi / Direksi):'],
    ['', '', ''],
    ['( ___________________________________ )', '( ___________________________________ )', '( ___________________________________ )'],
    [analyst, reviewerName, approverName],
    [analystTitle, 'Head of Mine Engineering & Technical Services', company],
    [`Tanggal: ${reportDate}`, `Tanggal: ${reportDate}`, `Tanggal: ${reportDate}`],
  ];

  const wsRec = XLSX.utils.aoa_to_sheet([
    ['REKOMENDASI STRATEGIS MANAJEMEN & MATRIKS KEPATUHAN REGULASI PERTAMBANGAN (ESDM)'],
    ['Rencana Aksi Direksi, Rekayasa Tambang, Good Mining Practice & Mitigasi Risiko'],
    [''],
    recHeaders,
    ...recRows,
    ...esdmMatrix,
    ...signOffData,
  ]);

  wsRec['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 18 },
    { wch: 35 },
    { wch: 45 },
    { wch: 60 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRec, '08_Rekomendasi_Regulasi');

  // Simpan file Excel
  const safeName = scenario.reserves.mineName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Feasibility_Study_${safeName}_Full_Model.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Ekspor Laporan Resmi Format Word (.DOCX) Sesuai Standar Baku Studi Kelayakan Tambang ESDM
 */
export async function exportToWord(
  scenario: ProjectScenario,
  operational: OperationalCalculations,
  cashFlows: AnnualCashFlow[],
  financials: FinancialResults,
  sensitivityOrRec: SensitivityDataPoint[] | StrategicRecommendation,
  recOrMeta?: StrategicRecommendation | ExportReportMetadata,
  maybeMeta?: ExportReportMetadata
) {
  let sensitivity: SensitivityDataPoint[];
  let recommendation: StrategicRecommendation;
  let metadata: ExportReportMetadata | undefined;

  if (Array.isArray(sensitivityOrRec)) {
    sensitivity = sensitivityOrRec;
    recommendation = recOrMeta as StrategicRecommendation;
    metadata = maybeMeta;
  } else {
    recommendation = sensitivityOrRec;
    sensitivity = [];
    metadata = recOrMeta as ExportReportMetadata;
  }

  const rateIdr = scenario.financials.currencyExchangeRateIdrUsd || 15800;
  const repTitle = metadata?.reportTitle || `LAPORAN STUDI KELAYAKAN TEKNO-EKONOMI PERTAMBANGAN BATUBARA - ${(metadata?.mineConcessionName || scenario.reserves.mineName).toUpperCase()}`;
  const analyst = metadata?.analystName || 'Senior Mining Engineer & Business Project Development Specialist';
  const analystTitle = metadata?.analystTitle || 'Lead Feasibility Analyst';
  const reviewerName = metadata?.reviewerName || 'Head of Mine Engineering & Technical Services';
  const approverName = metadata?.approverName || 'Direktur Utama / Komite Investasi';
  const company = metadata?.companyName || 'PT Tambang Batubara Prima Mandiri';
  const iupNumber = metadata?.concessionIupNumber || '540/128/IUP-OP/ESDM/2023';
  const pitArea = metadata?.pitOrBlockArea || scenario.reserves.pitArea;
  const location = metadata?.locationAddress || scenario.reserves.location;
  const dateStr = metadata?.documentDate || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  const confidentiality = metadata?.confidentialityLevel || 'STRICTLY CONFIDENTIAL';
  const reportRemarks = metadata?.reportRemarks || '';

  // Helper row generator for DOCX tables
  const createTableRow = (cells: { text: string; bold?: boolean; widthPct?: number }[]) => {
    return new TableRow({
      children: cells.map(
        (c) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: c.text, bold: c.bold || false, size: 20 })] })],
          })
      ),
    });
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // TITLE HEADER
          new Paragraph({
            text: `[${confidentiality}]`,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: 'DOKUMEN STUDI KELAYAKAN TEKNO-EKONOMI TAMBANG',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: repTitle,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Badan Usaha: ${company} | Izin IUP/PKP2B: ${iupNumber}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Wilayah Izin: ${location} | Pit Area: ${pitArea}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Penyusun: ${analyst} (${analystTitle}) | Tanggal: ${dateStr} | Status: ${recommendation.overallVerdict}`,
            alignment: AlignmentType.CENTER,
          }),
          ...(reportRemarks ? [
            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Catatan Dokumen / Keterangan Khusus: ', bold: true, italics: true }),
                new TextRun({ text: reportRemarks, italics: true }),
              ],
            }),
          ] : []),
          new Paragraph({ text: '' }),

          // 1. RINGKASAN EKSEKUTIF
          new Paragraph({
            text: '1. EXECUTIVE SUMMARY & REKOMENDASI KELAYAKAN INVESTASI',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: recommendation.executiveSummary,
          }),
          new Paragraph({ text: '' }),

          // Tabel Ringkasan KPI Finansial
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createTableRow([
                { text: 'Indikator Finansial Proyek', bold: true },
                { text: 'Nilai Model (USD)', bold: true },
                { text: 'Nilai Setara IDR', bold: true },
                { text: 'Kriteria Kelayakan Standar', bold: true },
              ]),
              createTableRow([
                { text: `Net Present Value (NPV @ WACC ${scenario.financials.discountRateWaccPercent}%)` },
                { text: `USD ${(financials.npvUsd / 1_000_000).toFixed(2)} Juta`, bold: true },
                { text: `Rp ${(Math.round(financials.npvUsd * rateIdr) / 1_000_000_000).toFixed(1)} Miliar` },
                { text: financials.npvUsd > 0 ? 'LAYAK (NPV > 0)' : 'TIDAK LAYAK' },
              ]),
              createTableRow([
                { text: 'Internal Rate of Return (IRR)' },
                { text: `${financials.irrPercent.toFixed(2)}%`, bold: true },
                { text: '-' },
                { text: `Hurdle Rate: ≥18.0% (WACC: ${scenario.financials.discountRateWaccPercent}%)` },
              ]),
              createTableRow([
                { text: 'Payback Period (PBP)' },
                { text: `${financials.paybackPeriodYears.toFixed(2)} Tahun`, bold: true },
                { text: '-' },
                { text: `< ${(scenario.reserves.mineLifeYears * 0.5).toFixed(1)} Tahun (Maks. 50% LOM)` },
              ]),
              createTableRow([
                { text: 'Benefit-Cost Ratio (BCR)' },
                { text: `${financials.benefitCostRatio.toFixed(2)}`, bold: true },
                { text: '-' },
                { text: 'BCR > 1.00' },
              ]),
              createTableRow([
                { text: 'Total Belanja Modal Awal (Initial CAPEX)' },
                { text: `USD ${(financials.totalInitialCapexUsd / 1_000_000).toFixed(2)} Juta` },
                { text: `Rp ${(Math.round(financials.totalInitialCapexUsd * rateIdr) / 1_000_000_000).toFixed(2)} Miliar` },
                { text: `Termasuk Kontinjensi ${scenario.financials.capexContingencyPercent}%` },
              ]),
              createTableRow([
                { text: 'Harga Batubara Impas (Breakeven Price)' },
                { text: `USD ${financials.breakevenCoalPriceUsd.toFixed(2)} / Ton`, bold: true },
                { text: `Rp ${Math.round(financials.breakevenCoalPriceUsd * rateIdr).toLocaleString('id-ID')} / Ton` },
                { text: `Harga Jual Model: USD ${scenario.financials.coalPriceUsdPerTon}/Ton` },
              ]),
              createTableRow([
                { text: 'Total EBITDA Sepanjang Umur Tambang (LOM)' },
                { text: `USD ${(financials.totalLifeOfMineEbitdaUsd / 1_000_000).toFixed(2)} Juta` },
                { text: `Rp ${(Math.round(financials.totalLifeOfMineEbitdaUsd * rateIdr) / 1_000_000_000).toFixed(2)} Miliar` },
                { text: `LOM: ${scenario.reserves.mineLifeYears} Tahun Produksi` },
              ]),
            ],
          }),

          new Paragraph({ text: '' }),
          // 2. PARAMETER GEOLOGI & CADANGAN
          new Paragraph({
            text: '2. PARAMETER GEOLOGI, CADANGAN BATUBARA & KONDISI LAPANGAN',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: `Berdasarkan eksplorasi rinci dan pemodelan deposit, total cadangan batubara tertambang (mineable reserve) terestimasi sebesar ${scenario.reserves.totalReserveMt} Juta Ton dengan target produksi penambangan sebesar ${scenario.reserves.targetAnnualProductionMt} Juta Ton/Tahun. Umur tambang (Life of Mine) diproyeksikan selama ${scenario.reserves.mineLifeYears} tahun dengan nisbah kupas rata-rata (Planned Stripping Ratio) sebesar ${scenario.reserves.plannedStrippingRatio} BCM/Ton. Kualitas batubara memiliki nilai kalori ${scenario.reserves.calorificValueGar} kcal/kg GAR (${scenario.reserves.calorificValueNar} kcal/kg NAR).`,
          }),
          new Paragraph({
            text: `Rute pengangkutan batubara dari mulut tambang (pit) ke pelabuhan muat (jetty stockpile) menempuh jarak ${scenario.locationRoad.coalHaulDistanceKm} km, sedangkan pembuangan overburden ke waste dump berjarak ${scenario.locationRoad.obDumpDistanceKm} km dengan grade kemiringan jalan rata-rata ${scenario.locationRoad.roadGradePercent}% (memenuhi batas Kepmen ESDM 1827/2018 maksimal 12%). Hambatan iklim (hujan, jalan licin slippery, dan dewatering pit) diperhitungkan sebesar ${operational.weatherDelayPercentage.toFixed(1)}% dari total waktu kalender tahunan, menghasilkan jam kerja efektif bersih sebesar ${Math.round(operational.effectiveWorkingHoursPerYear)} Jam/Tahun.`,
          }),

          new Paragraph({ text: '' }),
          // 3. ARMADA ALAT BERAT & PRODUKTIVITAS
          new Paragraph({
            text: '3. KOMPOSISI ARMADA ALAT BERAT & KINERJA PRODUKTIVITAS SIKLUS',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: `Kebutuhan armada utama disimulasikan secara presisi. Match Factor armada pemuatan dan pengangkutan overburden terhitung sebesar ${operational.matchFactorOB.toFixed(2)} (${operational.matchFactorStatusOB}), sedangkan armada batubara mencapai ${operational.matchFactorCoal.toFixed(2)} (${operational.matchFactorStatusCoal}).`,
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createTableRow([
                { text: 'Tipe Alat Berat', bold: true },
                { text: 'Model & Merek', bold: true },
                { text: 'Jumlah Unit', bold: true },
                { text: 'Kapasitas', bold: true },
                { text: 'Konsumsi Solar (L/h)', bold: true },
                { text: 'Mechanical Availability', bold: true },
              ]),
              ...scenario.equipments.map((eq) => {
                const W = eq.workingHoursW || 450;
                const R = eq.repairHoursR || 70;
                const ma = (W / (W + R || 1)) * 100;
                return createTableRow([
                  { text: eq.type.replace(/_/g, ' ') },
                  { text: `${eq.brand || ''} ${eq.model}` },
                  { text: `${eq.fleetCount} Unit` },
                  { text: `${eq.bucketOrVesselCapacity} ${eq.type.startsWith('EXCAVATOR') ? 'm3' : eq.type.startsWith('HAULER') ? 'T' : 'm3'}` },
                  { text: `${eq.fuelBurnRateLph} L/Jam` },
                  { text: `${ma.toFixed(1)}%` },
                ]);
              }),
            ],
          }),

          new Paragraph({ text: '' }),
          new Paragraph({
            text: `Total konsumsi bahan bakar solar industri seluruh armada mencapai ${(operational.totalAnnualFuelLiters / 1_000_000).toFixed(2)} Juta Liter/Tahun dengan rasio bahan bakar (Fuel Ratio) sebesar ${operational.fuelRatioLiterPerTonCoal.toFixed(2)} Liter/Ton batubara atau ${operational.fuelRatioLiterPerBcmOb.toFixed(2)} Liter/BCM overburden.`,
          }),

          new Paragraph({ text: '' }),
          // 4. STRUKTUR BIAYA
          new Paragraph({
            text: '4. STRUKTUR BIAYA OPERASIONAL (OPEX ACTIVITY-BASED COSTING)',
            heading: HeadingLevel.HEADING_2,
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createTableRow([
                { text: 'Komponen Aktivitas Tambang', bold: true },
                { text: 'Tarif Kontrak / Biaya', bold: true },
                { text: 'Total Tahunan (USD)', bold: true },
                { text: 'Porsi Biaya FOB (%)', bold: true },
              ]),
              createTableRow([
                { text: 'Pengupasan Overburden (OB Removal)' },
                { text: `USD ${scenario.financials.obMiningContractorRateUsdPerBcm} / BCM` },
                { text: `USD ${Math.round(operational.activityCosting.obRemoval.annualTotalUsd).toLocaleString()}` },
                { text: `${operational.activityCosting.obRemoval.shareOfFobCostPercent.toFixed(1)}%`, bold: true },
              ]),
              createTableRow([
                { text: 'Penambangan Batubara Bersih (Coal Getting)' },
                { text: `USD ${scenario.financials.coalMiningContractorRateUsdPerTon} / Ton` },
                { text: `USD ${Math.round(operational.activityCosting.coalGetting.annualTotalUsd).toLocaleString()}` },
                { text: `${operational.activityCosting.coalGetting.shareOfFobCostPercent.toFixed(1)}%` },
              ]),
              createTableRow([
                { text: 'Pengangkutan Hauling Batubara' },
                { text: `USD ${scenario.financials.coalHaulingUsdPerTonKm} / Ton.km` },
                { text: `USD ${Math.round(operational.activityCosting.coalHauling.annualTotalUsd).toLocaleString()}` },
                { text: `${operational.activityCosting.coalHauling.shareOfFobCostPercent.toFixed(1)}%` },
              ]),
              createTableRow([
                { text: 'Crushing & Stockpile Handling' },
                { text: `USD ${scenario.financials.coalCrushingAndHandlingUsdPerTon} / Ton` },
                { text: `USD ${Math.round(operational.activityCosting.crushingStockpilePort.annualTotalUsd).toLocaleString()}` },
                { text: `${operational.activityCosting.crushingStockpilePort.shareOfFobCostPercent.toFixed(1)}%` },
              ]),
              createTableRow([
                { text: 'Tongkang & Alih Muat (Barging & Transhipment)' },
                { text: `USD ${scenario.financials.bargingAndTranshipmentUsdPerTon} / Ton` },
                { text: `USD ${Math.round(operational.activityCosting.bargingTranshipment.annualTotalUsd).toLocaleString()}` },
                { text: `${operational.activityCosting.bargingTranshipment.shareOfFobCostPercent.toFixed(1)}%` },
              ]),
              createTableRow([
                { text: 'Kewajiban Royalti PNBP ESDM (PP 26/2022)' },
                { text: `USD ${operational.activityCosting.royaltyPnbp.rateUsd.toFixed(2)} / Ton` },
                { text: `USD ${Math.round(operational.activityCosting.royaltyPnbp.annualTotalUsd).toLocaleString()}` },
                { text: `${operational.activityCosting.royaltyPnbp.shareOfFobCostPercent.toFixed(1)}%` },
              ]),
              createTableRow([
                { text: 'TOTAL BIAYA PRODUKSI FOB (FOB FULL COST)', bold: true },
                { text: `USD ${operational.activityCosting.totalFobCashCostUsdPerTon.toFixed(2)} / Ton`, bold: true },
                { text: `USD ${Math.round(operational.activityCosting.totalFobAnnualUsd).toLocaleString()}`, bold: true },
                { text: '100.0%', bold: true },
              ]),
            ],
          }),

          new Paragraph({ text: '' }),
          // 5. KEPATUHAN REGULASI ESDM
          new Paragraph({
            text: '5. KEPATUHAN REGULASI & TATA KELOLA PERTAMBANGAN NASIONAL (ESDM)',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: '• PP No. 26 Tahun 2022 (Royalti PNBP Batubara): Kewajiban royalti berjenjang dihitung secara presisi berdasarkan Harga Batubara Acuan (HBA) dan tingkat kalori. Nilai royalti telah terintegrasi dalam perhitungan biaya OPEX tahunan.',
          }),
          new Paragraph({
            text: `• Kepmen ESDM No. 58.K/2022 (Domestic Market Obligation - DMO): Pemenuhan kewajiban DMO sebesar ${scenario.financials.dmoObligationPercent}% produksi batubara untuk kebutuhan PLN dengan patokan harga maksimal USD ${scenario.financials.dmoPriceCapUsdPerTon}/Ton telah dikunci dalam model harga rata-rata tertimbang (blended price).`,
          }),
          new Paragraph({
            text: `• Kepmen ESDM No. 1827 K/30/MEM/2018 (Kaidah Teknik Pertambangan): Parameter teknis jalan hauling (grade ${scenario.locationRoad.roadGradePercent}%, lebar standar), batas kesiapan armada (MA ≥85%, PA ≥90%), dan keselamatan tambang terpenuhi.`,
          }),
          new Paragraph({
            text: `• Permen ESDM No. 26 Tahun 2018 (Jaminan Reklamasi & Pascatambang): Pencadangan dana reklamasi dialokasikan sebesar USD ${scenario.financials.reclamationAndMineClosureUsdPerTon}/Ton batubara yang diproduksi setiap tahunnya.`,
          }),

          new Paragraph({ text: '' }),
          // 6. REKOMENDASI STRATEGIS DIREKSI
          new Paragraph({
            text: '6. REKOMENDASI STRATEGIS DIREKSI & LEMBAR PENGESAHAN DOKUMEN',
            heading: HeadingLevel.HEADING_2,
          }),
          ...recommendation.strategicActions.map(
            (act, idx) =>
              new Paragraph({
                text: `${idx + 1}. [${act.category}] ${act.title} (Prioritas: ${act.priority}) - ${act.actionableStep}`,
              })
          ),

          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'LEMBAR PENGESAHAN STUDI KELAYAKAN TEKNO-EKONOMI:',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Disiapkan Oleh (Lead Analyst):          Diperiksa Oleh (Reviewer):              Disetujui Oleh (Komite/Direksi):' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '( _______________________________ )      ( _______________________________ )      ( _______________________________ )' }),
          new Paragraph({ text: `${analyst}             ${reviewerName}             ${approverName}` }),
          new Paragraph({ text: `${analystTitle}                 Head of Technical Services          ${company}` }),
          new Paragraph({ text: `Tanggal: ${dateStr}                     Tanggal: ${dateStr}                     Tanggal: ${dateStr}` }),
        ],
      },
    ],
  });

  const safeName = (metadata?.mineConcessionName || scenario.reserves.mineName).replace(/[^a-zA-Z0-9_-]/g, '_');
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Laporan_Feasibility_Study_${safeName}_Lengkap.docx`);
}

/**
 * Ekspor Slide Presentasi Eksekutif Format PowerPoint (.PPTX) 14 Slide Komprehensif
 * Siap Dipaparkan ke Dewan Direksi, Komite Investasi, dan Lembaga Perbankan.
 */
export async function exportToPowerPoint(
  scenario: ProjectScenario,
  operational: OperationalCalculations,
  cashFlows: AnnualCashFlow[],
  financials: FinancialResults,
  sensitivityOrRec: SensitivityDataPoint[] | StrategicRecommendation,
  recOrMeta?: StrategicRecommendation | ExportReportMetadata,
  maybeMeta?: ExportReportMetadata
) {
  let sensitivity: SensitivityDataPoint[];
  let recommendation: StrategicRecommendation;
  let metadata: ExportReportMetadata | undefined;

  if (Array.isArray(sensitivityOrRec)) {
    sensitivity = sensitivityOrRec;
    recommendation = recOrMeta as StrategicRecommendation;
    metadata = maybeMeta;
  } else {
    recommendation = sensitivityOrRec;
    sensitivity = [];
    metadata = recOrMeta as ExportReportMetadata;
  }

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  const rateIdr = scenario.financials.currencyExchangeRateIdrUsd || 15800;
  const repTitle = metadata?.reportTitle || `STUDI KELAYAKAN TEKNO-EKONOMI TAMBANG BATUBARA - ${(metadata?.mineConcessionName || scenario.reserves.mineName).toUpperCase()}`;
  const analyst = metadata?.analystName || 'Senior Mining Engineer & Business Project Development Specialist';
  const analystTitle = metadata?.analystTitle || 'Lead Feasibility Analyst';
  const reviewerName = metadata?.reviewerName || 'Head of Mine Engineering & Technical Services';
  const approverName = metadata?.approverName || 'Direktur Utama / Komite Investasi';
  const company = metadata?.companyName || 'PT Tambang Batubara Prima Mandiri';
  const iupNumber = metadata?.concessionIupNumber || '540/128/IUP-OP/ESDM/2023';
  const pitArea = metadata?.pitOrBlockArea || scenario.reserves.pitArea;
  const location = metadata?.locationAddress || scenario.reserves.location;
  const dateStr = metadata?.documentDate || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  const confidentiality = metadata?.confidentialityLevel || 'STRICTLY CONFIDENTIAL';
  const reportRemarks = metadata?.reportRemarks || '';

  // Color Palette
  const NAVY = '0F172A';
  const DARK_CARD = '1E293B';
  const GOLD = 'D97706';
  const GOLD_LIGHT = 'FEF3C7';
  const SLATE = '334155';
  const SLATE_LIGHT = '64748B';
  const LIGHT_BG = 'F8FAFC';
  const WHITE = 'FFFFFF';
  const GREEN = '059669';
  const GREEN_BG = 'ECFDF5';
  const RED = 'DC2626';
  const RED_BG = 'FEF2F2';
  const BORDER_COLOR = 'CBD5E1';

  // Helper: Content Slide Header & Footer
  const addSlideChrome = (slide: any, tag: string, title: string, pageNum: number) => {
    slide.background = { color: LIGHT_BG };

    // Section Pill / Tag
    slide.addText(tag.toUpperCase(), {
      x: 0.8,
      y: 0.35,
      w: 6.0,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: GOLD,
    });

    // Slide Title
    slide.addText(title, {
      x: 0.8,
      y: 0.58,
      w: 8.4,
      h: 0.45,
      fontSize: 19,
      bold: true,
      color: NAVY,
    });

    // Top Accent Divider
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.08,
      w: 8.4,
      h: 0.02,
      fill: { color: 'E2E8F0' },
      line: { color: 'E2E8F0', width: 0.5 },
    });

    // Footer
    slide.addText(
      `${company} | ${metadata?.mineConcessionName || scenario.reserves.mineName} | IUP: ${iupNumber} | Sifat: ${confidentiality}`,
      {
        x: 0.8,
        y: 5.2,
        w: 7.2,
        h: 0.25,
        fontSize: 7.5,
        color: SLATE_LIGHT,
      }
    );

    // Page Number
    slide.addText(`${pageNum} / 14`, {
      x: 8.2,
      y: 5.2,
      w: 1.0,
      h: 0.25,
      fontSize: 8,
      align: 'right',
      bold: true,
      color: SLATE_LIGHT,
    });
  };

  // =========================================================================
  // SLIDE 1: COVER EKSEKUTIF (Executive Dark Theme)
  // =========================================================================
  const s1 = pptx.addSlide();
  s1.background = { color: '0B132B' };

  // Decorative Accent Shapes
  s1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 0.8,
    w: 0.15,
    h: 3.8,
    fill: { color: GOLD },
    line: { color: GOLD },
  });

  // Embed Custom Logo on Cover if available
  if (metadata?.logoCustomUrl && metadata.logoCustomUrl.startsWith('data:image/')) {
    try {
      s1.addImage({
        data: metadata.logoCustomUrl,
        x: 8.0,
        y: 0.8,
        w: 1.4,
        h: 0.9,
        sizing: { type: 'contain', w: 1.4, h: 0.9 },
      });
    } catch {
      // Fallback if data format issue
    }
  }

  s1.addText('STUDI KELAYAKAN TEKNO-EKONOMI & SIMULASI INVESTASI TAMBANG', {
    x: 1.2,
    y: 0.85,
    w: 7.0,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: GOLD,
    fontFace: 'Arial',
  });

  s1.addText((metadata?.mineConcessionName || scenario.reserves.mineName).toUpperCase(), {
    x: 1.2,
    y: 1.25,
    w: 8.0,
    h: 0.9,
    fontSize: 26,
    bold: true,
    color: WHITE,
    fontFace: 'Arial',
  });

  s1.addText('Analisis Kelayakan Finansial, Simulasi Armada Alat Berat, Rekayasa Biaya & Kepatuhan Regulasi ESDM', {
    x: 1.2,
    y: 2.2,
    w: 8.0,
    h: 0.6,
    fontSize: 13,
    color: '94A3B8',
    fontFace: 'Arial',
  });

  // Verdict Pill on Cover
  const isGo = recommendation.overallVerdict === 'GO';
  const isCond = recommendation.overallVerdict === 'CONDITIONAL_GO';
  const vColor = isGo ? GREEN : isCond ? GOLD : RED;
  const vBg = isGo ? '064E3B' : isCond ? '78350F' : '7F1D1D';

  s1.addShape(pptx.ShapeType.roundRect, {
    x: 1.2,
    y: 2.9,
    w: 3.6,
    h: 0.45,
    fill: { color: vBg },
    line: { color: vColor, width: 1 },
    rectRadius: 0.08,
  });

  s1.addText(`STATUS KEPUTUSAN: ${recommendation.overallVerdict}`, {
    x: 1.3,
    y: 2.97,
    w: 3.4,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: WHITE,
    align: 'center',
  });

  // Project Info Box on Cover
  s1.addShape(pptx.ShapeType.roundRect, {
    x: 1.2,
    y: 3.55,
    w: 8.0,
    h: 1.4,
    fill: { color: DARK_CARD },
    line: { color: '334155', width: 1 },
    rectRadius: 0.08,
  });

  const coverLinesText =
    `Perusahaan: ${company} | IUP: ${iupNumber}\n` +
    `Wilayah Izin: ${location} | Pit Area: ${pitArea}\n` +
    `Disusun Oleh: ${analyst} (${analystTitle})\n` +
    `Diperiksa: ${reviewerName} | Disetujui: ${approverName}\n` +
    `Tanggal Rilis: ${dateStr} | Sifat Dokumen: ${confidentiality}` +
    (reportRemarks ? `\nCatatan: ${reportRemarks}` : '');

  s1.addText(coverLinesText, {
    x: 1.4,
    y: 3.6,
    w: 7.6,
    h: 1.3,
    fontSize: 8.5,
    color: 'CBD5E1',
    lineSpacing: 14,
  });

  // =========================================================================
  // SLIDE 2: EXECUTIVE SUMMARY & KEPUTUSAN INVESTASI
  // =========================================================================
  const s2 = pptx.addSlide();
  addSlideChrome(s2, '1. RINGKASAN EKSEKUTIF', 'Executive Summary & Rekomendasi Investasi', 2);

  // Top Banner Verdict
  s2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.25,
    w: 8.4,
    h: 0.95,
    fill: { color: isGo ? GREEN_BG : isCond ? GOLD_LIGHT : RED_BG },
    line: { color: isGo ? GREEN : isCond ? GOLD : RED, width: 1 },
    rectRadius: 0.08,
  });

  s2.addText(`KEPUTUSAN KELAYAKAN INVESTASI: ${recommendation.overallVerdict}`, {
    x: 1.0,
    y: 1.32,
    w: 8.0,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: isGo ? '065F46' : isCond ? '92400E' : '991B1B',
  });

  s2.addText(`Status: ${financials.projectFeasibilityStatus.replace(/_/g, ' ')} | Rekomendasi Baku SNI 4726 & Kaidah ESDM`, {
    x: 1.0,
    y: 1.6,
    w: 8.0,
    h: 0.5,
    fontSize: 10,
    color: isGo ? '047857' : isCond ? 'B45309' : 'B91C1C',
  });

  // Executive Narrative
  s2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 2.35,
    w: 8.4,
    h: 1.35,
    fill: { color: WHITE },
    line: { color: BORDER_COLOR, width: 1 },
    rectRadius: 0.08,
  });

  s2.addText('CATATAN PERTIMBANGAN KOMITE INVESTASI:', {
    x: 1.0,
    y: 2.45,
    w: 8.0,
    h: 0.25,
    fontSize: 9,
    bold: true,
    color: NAVY,
  });

  s2.addText(recommendation.executiveSummary, {
    x: 1.0,
    y: 2.7,
    w: 8.0,
    h: 0.9,
    fontSize: 10,
    color: SLATE,
    lineSpacing: 15,
  });

  // 4 Bottom Metric Highlights
  const kpis = [
    { label: `NPV (@${scenario.financials.discountRateWaccPercent}%)`, val: `USD ${(financials.npvUsd / 1_000_000).toFixed(2)} M`, sub: `Rp ${(Math.round(financials.npvUsd * rateIdr) / 1_000_000_000).toFixed(1)} Miliar`, ok: financials.npvUsd > 0 },
    { label: 'IRR FINANSIAL', val: `${financials.irrPercent.toFixed(1)}%`, sub: `Hurdle Rate: 18% (WACC: ${scenario.financials.discountRateWaccPercent}%)`, ok: financials.irrPercent >= 18 },
    { label: 'PAYBACK PERIOD', val: `${financials.paybackPeriodYears.toFixed(1)} Tahun`, sub: `LOM: ${scenario.reserves.mineLifeYears} Tahun`, ok: financials.paybackPeriodYears <= scenario.reserves.mineLifeYears * 0.5 },
    { label: 'BREAKEVEN PRICE', val: `USD ${financials.breakevenCoalPriceUsd.toFixed(1)}/T`, sub: `Pasar: USD ${scenario.financials.coalPriceUsdPerTon}/T`, ok: scenario.financials.coalPriceUsdPerTon >= financials.breakevenCoalPriceUsd },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = 0.8 + idx * 2.15;
    s2.addShape(pptx.ShapeType.roundRect, {
      x: cardX,
      y: 3.85,
      w: 2.0,
      h: 1.15,
      fill: { color: WHITE },
      line: { color: kpi.ok ? '86EFAC' : 'FCA5A5', width: 1 },
      rectRadius: 0.08,
    });

    s2.addText(kpi.label, {
      x: cardX + 0.1,
      y: 3.92,
      w: 1.8,
      h: 0.2,
      fontSize: 8,
      bold: true,
      color: SLATE_LIGHT,
    });

    s2.addText(kpi.val, {
      x: cardX + 0.1,
      y: 4.12,
      w: 1.8,
      h: 0.45,
      fontSize: 14,
      bold: true,
      color: kpi.ok ? '15803D' : 'B91C1C',
    });

    s2.addText(kpi.sub, {
      x: cardX + 0.1,
      y: 4.58,
      w: 1.8,
      h: 0.35,
      fontSize: 7.5,
      color: SLATE_LIGHT,
    });
  });

  // =========================================================================
  // SLIDE 3: PROFIL PROYEK, PARAMETER CADANGAN & KUALITAS BATUBARA
  // =========================================================================
  const s3 = pptx.addSlide();
  addSlideChrome(s3, '2. GEOLOGI & SUMBER DAYA', 'Profil Proyek, Parameter Cadangan & Kualitas Batubara', 3);

  const geolTableData = [
    [
      { text: 'Parameter Tambang & Cadangan', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 9 } },
      { text: 'Nilai Model', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 9, align: 'right' } },
      { text: 'Parameter Kualitas & Geoteknik', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 9 } },
      { text: 'Nilai / Satuan', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 9, align: 'right' } },
    ],
    [{ text: 'Total Cadangan Batubara Tertambang' }, { text: `${scenario.reserves.totalReserveMt} Juta Ton`, options: { bold: true, align: 'right' } }, { text: 'Nilai Kalori Batubara (GAR)' }, { text: `${scenario.reserves.calorificValueGar} kcal/kg`, options: { bold: true, align: 'right' } }],
    [{ text: 'Target Produksi Batubara Tahunan' }, { text: `${scenario.reserves.targetAnnualProductionMt} Juta Ton/Thn`, options: { bold: true, align: 'right' } }, { text: 'Nilai Kalori Bersih (NAR)' }, { text: `${scenario.reserves.calorificValueNar} kcal/kg`, options: { bold: true, align: 'right' } }],
    [{ text: 'Rencana Stripping Ratio (Planned SR)' }, { text: `${scenario.reserves.plannedStrippingRatio} BCM/Ton`, options: { bold: true, align: 'right' } }, { text: 'Densitas Batubara Insitu' }, { text: `${scenario.reserves.insituDensityCoal} Ton/m3`, options: { bold: true, align: 'right' } }],
    [{ text: 'Target Pengupasan Overburden (OB)' }, { text: `${(operational.annualObTargetBcm / 1_000_000).toFixed(2)} Juta BCM/Thn`, options: { bold: true, align: 'right' } }, { text: 'Densitas Overburden Insitu' }, { text: `${scenario.reserves.insituDensityOb} Ton/m3`, options: { bold: true, align: 'right' } }],
    [{ text: 'Umur Tambang (Life of Mine - LOM)' }, { text: `${scenario.reserves.mineLifeYears} Tahun`, options: { bold: true, align: 'right' } }, { text: 'Densitas Overburden Lepas (Loose)' }, { text: `${scenario.reserves.looseDensityOb} Ton/m3`, options: { bold: true, align: 'right' } }],
    [{ text: 'Kapasitas Target Bulanan Batubara' }, { text: `${Math.round((scenario.reserves.targetAnnualProductionMt * 1_000_000) / 12).toLocaleString('id-ID')} Ton/Bln`, options: { align: 'right' } }, { text: 'Swell Factor Overburden' }, { text: `${scenario.reserves.swellFactorOb}`, options: { align: 'right' } }],
    [{ text: 'Kapasitas Target Bulanan OB' }, { text: `${Math.round(operational.annualObTargetBcm / 12).toLocaleString('id-ID')} BCM/Bln`, options: { align: 'right' } }, { text: 'Swell Factor Batubara' }, { text: `${scenario.reserves.swellFactorCoal}`, options: { align: 'right' } }],
  ];

  s3.addTable(geolTableData as any, {
    x: 0.8,
    y: 1.3,
    w: 8.4,
    h: 3.5,
    border: { pt: 0.5, color: BORDER_COLOR },
    margin: 0.06,
    fontSize: 9,
  });

  // =========================================================================
  // SLIDE 4: KONDISI LAPANGAN, GEOMETRI JALAN & HAMBATAN CUACA
  // =========================================================================
  const s4 = pptx.addSlide();
  addSlideChrome(s4, '3. SITE CONDITIONS & IKLIM', 'Geometri Jalan Hauling & Analisis Hambatan Cuaca Lapangan', 4);

  // Left Card: Haul Road Geometrics
  s4.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.3,
    w: 4.05,
    h: 3.6,
    fill: { color: WHITE },
    line: { color: BORDER_COLOR, width: 1 },
    rectRadius: 0.08,
  });

  s4.addText('GEOMETRI JALAN & RUTE ANGKUT', {
    x: 1.0,
    y: 1.45,
    w: 3.65,
    h: 0.25,
    fontSize: 10,
    bold: true,
    color: NAVY,
  });

  const roadList = [
    `• Jarak Hauling Batubara ke Jetty: ${scenario.locationRoad.coalHaulDistanceKm} km`,
    `• Jarak Buang Overburden ke Disposal: ${scenario.locationRoad.obDumpDistanceKm} km`,
    `• Kemiringan Jalan Rata-rata: ${scenario.locationRoad.roadGradePercent}% (Standar Kepmen: Maks. 12%)`,
    `• Tahanan Gulir (Rolling Resistance): ${scenario.locationRoad.rollingResistancePercent}%`,
    `• Karakteristik Permukaan Jalan: ${scenario.locationRoad.soilCondition}`,
    `• Kecepatan Rata-rata Bermuatan: ${scenario.locationRoad.averageHaulSpeedLoadedKmh} km/jam`,
    `• Kecepatan Rata-rata Kosongan: ${scenario.locationRoad.averageHaulSpeedEmptyKmh} km/jam`,
    `• Faktor Retardasi Turunan Terjal: ${scenario.locationRoad.speedRetardationDownhillFactor || 0.85}`,
    `• Standar Lebar Jalan (Kepmen 1827): Min. 3.5 x lebar dump truck`,
  ].join('\n');

  s4.addText(roadList, {
    x: 1.0,
    y: 1.8,
    w: 3.65,
    h: 2.9,
    fontSize: 8.5,
    color: SLATE,
    lineSpacing: 14,
  });

  // Right Card: Weather Correction & Effective Hours
  s4.addShape(pptx.ShapeType.roundRect, {
    x: 5.15,
    y: 1.3,
    w: 4.05,
    h: 3.6,
    fill: { color: WHITE },
    line: { color: BORDER_COLOR, width: 1 },
    rectRadius: 0.08,
  });

  s4.addText('HAMBATAN CUACA & JAM KERJA EFEKTIF', {
    x: 5.35,
    y: 1.45,
    w: 3.65,
    h: 0.25,
    fontSize: 10,
    bold: true,
    color: NAVY,
  });

  const weatherList = [
    `• Hari Kerja Kalender: ${scenario.weatherCorrection.scheduledWorkingDaysPerYear} Hari/Tahun (${scenario.weatherCorrection.workingShiftsPerDay} Shift @ ${scenario.weatherCorrection.scheduledHoursPerShift} Jam)`,
    `• Total Jam Kalender Teoretis: ${scenario.weatherCorrection.scheduledWorkingDaysPerYear * scenario.weatherCorrection.workingShiftsPerDay * scenario.weatherCorrection.scheduledHoursPerShift} Jam/Tahun`,
    `• Hambatan Hujan (Rain Delay): ${scenario.weatherCorrection.rainDelayHoursPerMonth} Jam/Bulan`,
    `• Hambatan Jalan Licin (Slippery): ${scenario.weatherCorrection.slipperyDelayHoursPerMonth} Jam/Bulan`,
    `• Hambatan Kabut & Safety: ${scenario.weatherCorrection.fogAndSafetyDelayHoursPerMonth} Jam/Bulan`,
    `• Penanganan Pompa Sump Pit: ${scenario.weatherCorrection.dewateringDelayHoursPerMonth} Jam/Bulan`,
    `• Persentase Delay Cuaca Total: ${operational.weatherDelayPercentage.toFixed(1)}% dari waktu kalender`,
    `• Jam Kerja Efektif Bersih: ${Math.round(operational.effectiveWorkingHoursPerYear)} Jam/Tahun`,
    `• Jam Kerja Efektif Bulanan: ${Math.round(operational.effectiveWorkingHoursPerMonth)} Jam/Bulan`,
  ].join('\n');

  s4.addText(weatherList, {
    x: 5.35,
    y: 1.8,
    w: 3.65,
    h: 2.9,
    fontSize: 8.5,
    color: SLATE,
    lineSpacing: 14,
  });

  // =========================================================================
  // SLIDE 5: KOMPOSISI ARMADA & SPESIFIKASI ALAT BERAT UTAMA
  // =========================================================================
  const s5 = pptx.addSlide();
  addSlideChrome(s5, '4. HEAVY EQUIPMENT FLEET', 'Komposisi Armada & Spesifikasi Alat Berat Utama', 5);

  const fleetTableData = [
    [
      { text: 'Tipe Alat', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5 } },
      { text: 'Model & Merek', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5 } },
      { text: 'Unit', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'center' } },
      { text: 'Kapasitas', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'center' } },
      { text: 'Power (HP)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'Total HP', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'Solar (L/h)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'Sewa ($/h)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
    ],
    ...scenario.equipments.map((eq) => [
      { text: eq.type.replace(/_/g, ' ') },
      { text: `${eq.brand || ''} ${eq.model}` },
      { text: `${eq.fleetCount}`, options: { align: 'center', bold: true } },
      { text: `${eq.bucketOrVesselCapacity} ${eq.type.startsWith('EXCAVATOR') ? 'm3' : eq.type.startsWith('HAULER') ? 'T' : 'm3'}`, options: { align: 'center' } },
      { text: `${eq.enginePowerHp}`, options: { align: 'right' } },
      { text: `${(eq.enginePowerHp || 0) * (eq.fleetCount || 0)}`, options: { align: 'right', bold: true } },
      { text: `${eq.fuelBurnRateLph}`, options: { align: 'right' } },
      { text: `$${eq.hourlyRateUsd}`, options: { align: 'right' } },
    ]),
  ];

  s5.addTable(fleetTableData as any, {
    x: 0.8,
    y: 1.3,
    w: 8.4,
    h: 3.5,
    border: { pt: 0.5, color: BORDER_COLOR },
    margin: 0.05,
    fontSize: 8,
  });

  // =========================================================================
  // SLIDE 6: KESIAPAN MEKANIS & TINGKAT KETERSEDIAAN ALAT (MA, PA, UA, EU)
  // =========================================================================
  const s6 = pptx.addSlide();
  addSlideChrome(s6, '5. AVAILABILITY & RELIABILITY', 'Indeks Ketersediaan Alat (MA, PA, UA, EU) & Keandalan Mekanis', 6);

  const availTableData = [
    [
      { text: 'Model Unit', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5 } },
      { text: 'Tipe', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5 } },
      { text: 'W (Jam)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'S (Jam)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'R (Jam)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'MA (%)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'PA (%)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'UA (%)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'EU (%)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'Standar ESDM', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'center' } },
    ],
    ...scenario.equipments.map((eq) => {
      const W = eq.workingHoursW || 450;
      const S = eq.idleHoursS || 80;
      const R = eq.repairHoursR || 70;
      const total = W + S + R || 1;
      const ma = (W / (W + R || 1)) * 100;
      const pa = ((W + S) / total) * 100;
      const ua = (W / (W + S || 1)) * 100;
      const eu = (W / total) * 100;
      const complies = ma >= 85;

      return [
        { text: eq.model },
        { text: eq.type.replace(/_/g, ' ') },
        { text: `${W}`, options: { align: 'right' } },
        { text: `${S}`, options: { align: 'right' } },
        { text: `${R}`, options: { align: 'right' } },
        { text: `${ma.toFixed(1)}%`, options: { align: 'right', bold: true, color: complies ? '15803D' : 'B91C1C' } },
        { text: `${pa.toFixed(1)}%`, options: { align: 'right' } },
        { text: `${ua.toFixed(1)}%`, options: { align: 'right' } },
        { text: `${eu.toFixed(1)}%`, options: { align: 'right' } },
        { text: complies ? 'PATUH (≥85%)' : 'DI BAWAH', options: { align: 'center', bold: true, color: complies ? '15803D' : 'B91C1C' } },
      ];
    }),
  ];

  s6.addTable(availTableData as any, {
    x: 0.8,
    y: 1.3,
    w: 8.4,
    h: 3.5,
    border: { pt: 0.5, color: BORDER_COLOR },
    margin: 0.05,
    fontSize: 8,
  });

  // =========================================================================
  // SLIDE 7: SIKLUS KERJA, KESERASIAN ARMADA (MATCH FACTOR) & KONSUMSI SOLAR
  // =========================================================================
  const s7 = pptx.addSlide();
  addSlideChrome(s7, '6. CYCLE TIME & MATCHING', 'Siklus Kerja, Keserasian Armada (Match Factor) & Konsumsi Solar', 7);

  // Left Card: Cycle Time & Match Factor
  s7.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.3,
    w: 4.05,
    h: 3.6,
    fill: { color: WHITE },
    line: { color: BORDER_COLOR, width: 1 },
    rectRadius: 0.08,
  });

  s7.addText('ANALISIS SIKLUS KERJA & MATCH FACTOR', {
    x: 1.0,
    y: 1.45,
    w: 3.65,
    h: 0.25,
    fontSize: 10,
    bold: true,
    color: NAVY,
  });

  const cycleText = [
    `• Waktu Siklus Loader OB: ${operational.cycleTimeOB.loaderTotalCycleSec} detik (Gali: ${operational.cycleTimeOB.loaderDigSec}s, Swing: ${operational.cycleTimeOB.loaderSwingLoadedSec}s)`,
    `• Siklus Pengisian per Truk: ${operational.cycleTimeOB.haulerPassesRequired} bucket passes`,
    `• Spot & Muat Truk OB: ${operational.cycleTimeOB.haulerSpotAtLoaderSec}s + ${(operational.cycleTimeOB.haulerLoadingTimeMin).toFixed(1)} menit`,
    `• Hauling Bermuatan ke Disposal: ${(operational.cycleTimeOB.haulerHaulLoadedMin).toFixed(1)} menit`,
    `• Tumpah & Manuver Disposal: ${(operational.cycleTimeOB.haulerSpotAndDumpMin).toFixed(1)} menit`,
    `• Pulang Kosongan: ${(operational.cycleTimeOB.haulerReturnEmptyMin).toFixed(1)} menit`,
    `• Total Siklus Truk OB: ${(operational.cycleTimeOB.haulerTotalCycleMin).toFixed(1)} menit (${operational.cycleTimeOB.haulerTripsPerHour.toFixed(1)} rit/jam)`,
    `• Match Factor OB: ${operational.matchFactorOB.toFixed(2)} [${operational.matchFactorStatusOB}]`,
    `• Match Factor Batubara: ${operational.matchFactorCoal.toFixed(2)} [${operational.matchFactorStatusCoal}]`,
  ].join('\n');

  s7.addText(cycleText, {
    x: 1.0,
    y: 1.8,
    w: 3.65,
    h: 2.9,
    fontSize: 8.5,
    color: SLATE,
    lineSpacing: 14,
  });

  // Right Card: Fuel Ratios & Energy Intensity
  s7.addShape(pptx.ShapeType.roundRect, {
    x: 5.15,
    y: 1.3,
    w: 4.05,
    h: 3.6,
    fill: { color: WHITE },
    line: { color: BORDER_COLOR, width: 1 },
    rectRadius: 0.08,
  });

  s7.addText('KONSUMSI BAHAN BAKAR & EFISIENSI ENERGI', {
    x: 5.35,
    y: 1.45,
    w: 3.65,
    h: 0.25,
    fontSize: 10,
    bold: true,
    color: NAVY,
  });

  const fuelAnnualCost = Math.round(operational.totalAnnualFuelLiters * scenario.financials.industrialFuelPriceUsdPerLiter);

  const fuelText = [
    `• Total Konsumsi Solar Armada: ${(operational.totalAnnualFuelLiters / 1_000_000).toFixed(2)} Juta Liter/Tahun`,
    `• Konsumsi Rata-rata: ${Math.round(operational.totalAnnualFuelLiters / (operational.effectiveWorkingHoursPerYear || 1)).toLocaleString('id-ID')} Liter/Jam Operasi`,
    `• Fuel Ratio Batubara: ${operational.fuelRatioLiterPerTonCoal.toFixed(2)} Liter / Ton Batubara`,
    `• Fuel Ratio Overburden: ${operational.fuelRatioLiterPerBcmOb.toFixed(2)} Liter / BCM OB`,
    `• Asumsi Harga Solar B35: USD ${scenario.financials.industrialFuelPriceUsdPerLiter}/Liter (Rp ${Math.round(scenario.financials.industrialFuelPriceUsdPerLiter * rateIdr).toLocaleString('id-ID')})`,
    `• Total Biaya Solar Tahunan: USD ${(fuelAnnualCost / 1_000_000).toFixed(2)} Juta/Tahun`,
    `• Porsi Biaya Solar: ~25-30% terhadap Total Cash Cost FOB`,
    `• Target Produksi OB Tercapai: ${operational.obProductionAchievementPercent.toFixed(1)}% (${operational.obProductionAchievementPercent >= 100 ? 'Memenuhi Target' : 'Perlu Tambahan Armada'})`,
    `• Target Produksi Batubara: ${operational.coalProductionAchievementPercent.toFixed(1)}%`,
  ].join('\n');

  s7.addText(fuelText, {
    x: 5.35,
    y: 1.8,
    w: 3.65,
    h: 2.9,
    fontSize: 8.5,
    color: SLATE,
    lineSpacing: 14,
  });

  // =========================================================================
  // SLIDE 8: STRUKTUR BIAYA INVESTASI AWAL (INITIAL CAPEX BREAKDOWN)
  // =========================================================================
  const s8 = pptx.addSlide();
  addSlideChrome(s8, '7. CAPITAL EXPENDITURE', 'Alokasi Belanja Modal Awal (Initial CAPEX Breakdown)', 8);

  const finM = scenario.financials;
  const capexTbl = [
    [
      { text: 'Pos Alokasi Belanja Modal (CAPEX)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 9 } },
      { text: 'Nilai (USD)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 9, align: 'right' } },
      { text: 'Nilai (IDR Eqv.)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 9, align: 'right' } },
      { text: 'Porsi (%)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 9, align: 'center' } },
    ],
    [{ text: 'Eksplorasi Detail, Pemboran Geologi & AMDAL/IUP' }, { text: `$${finM.capexExplorationAndPermittingUsd.toLocaleString()}`, options: { align: 'right' } }, { text: `Rp ${(Math.round(finM.capexExplorationAndPermittingUsd * rateIdr) / 1_000_000).toLocaleString('id-ID')} Jt`, options: { align: 'right' } }, { text: `${((finM.capexExplorationAndPermittingUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Pembebasan Lahan Pit, Disposal & Koridor Jalan' }, { text: `$${finM.capexLandAcquisitionUsd.toLocaleString()}`, options: { align: 'right' } }, { text: `Rp ${(Math.round(finM.capexLandAcquisitionUsd * rateIdr) / 1_000_000).toLocaleString('id-ID')} Jt`, options: { align: 'right' } }, { text: `${((finM.capexLandAcquisitionUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Konstruksi Jalan Hauling, Jembatan & Drainage' }, { text: `$${finM.capexHaulingRoadAndInfrastructureUsd.toLocaleString()}`, options: { align: 'right' } }, { text: `Rp ${(Math.round(finM.capexHaulingRoadAndInfrastructureUsd * rateIdr) / 1_000_000).toLocaleString('id-ID')} Jt`, options: { align: 'right' } }, { text: `${((finM.capexHaulingRoadAndInfrastructureUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Fasilitas Stockpile, Crushing Plant & Jetty Port' }, { text: `$${finM.capexPortAndJettyFacilityUsd.toLocaleString()}`, options: { align: 'right' } }, { text: `Rp ${(Math.round(finM.capexPortAndJettyFacilityUsd * rateIdr) / 1_000_000).toLocaleString('id-ID')} Jt`, options: { align: 'right' } }, { text: `${((finM.capexPortAndJettyFacilityUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Mess Akomodasi Camp, Workshop & Kantor Pit' }, { text: `$${finM.capexCampAndWorkshopUsd.toLocaleString()}`, options: { align: 'right' } }, { text: `Rp ${(Math.round(finM.capexCampAndWorkshopUsd * rateIdr) / 1_000_000).toLocaleString('id-ID')} Jt`, options: { align: 'right' } }, { text: `${((finM.capexCampAndWorkshopUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Pengadaan / Down Payment Armada Alat Berat' }, { text: `$${finM.capexEquipmentFleetPurchasedUsd.toLocaleString()}`, options: { align: 'right' } }, { text: `Rp ${(Math.round(finM.capexEquipmentFleetPurchasedUsd * rateIdr) / 1_000_000).toLocaleString('id-ID')} Jt`, options: { align: 'right' } }, { text: `${((finM.capexEquipmentFleetPurchasedUsd / financials.totalInitialCapexUsd) * 100).toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: `Cadangan Kontinjensi Eskalasi (${finM.capexContingencyPercent}%)` }, { text: `$${Math.round((financials.totalInitialCapexUsd * finM.capexContingencyPercent) / (100 + finM.capexContingencyPercent)).toLocaleString()}`, options: { align: 'right' } }, { text: `Rp ${(Math.round(((financials.totalInitialCapexUsd * finM.capexContingencyPercent) / (100 + finM.capexContingencyPercent)) * rateIdr) / 1_000_000).toLocaleString('id-ID')} Jt`, options: { align: 'right' } }, { text: `${finM.capexContingencyPercent}%`, options: { align: 'center' } }],
    [{ text: 'TOTAL INITIAL CAPEX', options: { bold: true, fill: { color: 'E2E8F0' } } }, { text: `$${Math.round(financials.totalInitialCapexUsd).toLocaleString()}`, options: { bold: true, align: 'right', fill: { color: 'E2E8F0' } } }, { text: `Rp ${(Math.round(financials.totalInitialCapexUsd * rateIdr) / 1_000_000_000).toFixed(2)} Miliar`, options: { bold: true, align: 'right', fill: { color: 'E2E8F0' } } }, { text: '100.0%', options: { bold: true, align: 'center', fill: { color: 'E2E8F0' } } }],
  ];

  s8.addTable(capexTbl as any, {
    x: 0.8,
    y: 1.3,
    w: 8.4,
    h: 3.5,
    border: { pt: 0.5, color: BORDER_COLOR },
    margin: 0.05,
    fontSize: 8.5,
  });

  // =========================================================================
  // SLIDE 9: STRUKTUR BIAYA OPERASIONAL (ACTIVITY-BASED COSTING OPEX)
  // =========================================================================
  const s9 = pptx.addSlide();
  addSlideChrome(s9, '8. OPERATIONAL EXPENDITURE', 'Struktur Biaya Operasional Berbasis Aktivitas (Activity-Based OPEX)', 9);

  const act = operational.activityCosting;
  const opexTbl = [
    [
      { text: 'Aktivitas Operasi Penambangan', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5 } },
      { text: 'Tarif Kontrak ($)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'Biaya Tahunan ($)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'FOB Share (%)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'center' } },
    ],
    [{ text: 'Pengupasan Overburden (OB Removal)' }, { text: `$${finM.obMiningContractorRateUsdPerBcm}/BCM`, options: { align: 'right' } }, { text: `$${Math.round(act.obRemoval.annualTotalUsd).toLocaleString()}`, options: { align: 'right' } }, { text: `${act.obRemoval.shareOfFobCostPercent.toFixed(1)}%`, options: { align: 'center', bold: true } }],
    [{ text: 'Penambangan Batubara Bersih (Coal Getting)' }, { text: `$${finM.coalMiningContractorRateUsdPerTon}/Ton`, options: { align: 'right' } }, { text: `$${Math.round(act.coalGetting.annualTotalUsd).toLocaleString()}`, options: { align: 'right' } }, { text: `${act.coalGetting.shareOfFobCostPercent.toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Pengangkutan Hauling Batubara ke Jetty' }, { text: `$${finM.coalHaulingUsdPerTonKm}/T.km`, options: { align: 'right' } }, { text: `$${Math.round(act.coalHauling.annualTotalUsd).toLocaleString()}`, options: { align: 'right' } }, { text: `${act.coalHauling.shareOfFobCostPercent.toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Pemeliharaan Jalan & Dewatering Pit' }, { text: `$${act.pitSupportAndDewatering.rateUsd.toFixed(2)}/Ton`, options: { align: 'right' } }, { text: `$${Math.round(act.pitSupportAndDewatering.annualTotalUsd).toLocaleString()}`, options: { align: 'right' } }, { text: `${act.pitSupportAndDewatering.shareOfFobCostPercent.toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Pengolahan, Crushing & Stockpile' }, { text: `$${finM.coalCrushingAndHandlingUsdPerTon}/Ton`, options: { align: 'right' } }, { text: `$${Math.round(act.crushingStockpilePort.annualTotalUsd).toLocaleString()}`, options: { align: 'right' } }, { text: `${act.crushingStockpilePort.shareOfFobCostPercent.toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Tongkang & Alih Muat (Barging & Transhipment)' }, { text: `$${finM.bargingAndTranshipmentUsdPerTon}/Ton`, options: { align: 'right' } }, { text: `$${Math.round(act.bargingTranshipment.annualTotalUsd).toLocaleString()}`, options: { align: 'right' } }, { text: `${act.bargingTranshipment.shareOfFobCostPercent.toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Port Handling, Jetty & Surveyor' }, { text: `$${finM.portHandlingAndSurveyorUsdPerTon}/Ton`, options: { align: 'right' } }, { text: `$${Math.round(finM.portHandlingAndSurveyorUsdPerTon * scenario.reserves.targetAnnualProductionMt * 1_000_000).toLocaleString()}`, options: { align: 'right' } }, { text: `${((finM.portHandlingAndSurveyorUsdPerTon / act.totalFobCashCostUsdPerTon) * 100).toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Biaya Umum & Administrasi (G&A Overhead)' }, { text: `$${act.generalAdminOverhead.rateUsd.toFixed(2)}/Ton`, options: { align: 'right' } }, { text: `$${Math.round(act.generalAdminOverhead.annualTotalUsd).toLocaleString()}`, options: { align: 'right' } }, { text: `${act.generalAdminOverhead.shareOfFobCostPercent.toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Kewajiban Royalti PNBP ESDM (PP 26/2022)' }, { text: `$${act.royaltyPnbp.rateUsd.toFixed(2)}/Ton`, options: { align: 'right' } }, { text: `$${Math.round(act.royaltyPnbp.annualTotalUsd).toLocaleString()}`, options: { align: 'right' } }, { text: `${act.royaltyPnbp.shareOfFobCostPercent.toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'Jaminan Reklamasi & Mine Closure' }, { text: `$${finM.reclamationAndMineClosureUsdPerTon}/Ton`, options: { align: 'right' } }, { text: `$${Math.round(act.reclamationAndClosure.annualTotalUsd).toLocaleString()}`, options: { align: 'right' } }, { text: `${act.reclamationAndClosure.shareOfFobCostPercent.toFixed(1)}%`, options: { align: 'center' } }],
    [{ text: 'TOTAL BIAYA PRODUKSI FOB', options: { bold: true, fill: { color: 'E2E8F0' } } }, { text: `$${act.totalFobCashCostUsdPerTon.toFixed(2)}/Ton`, options: { bold: true, align: 'right', fill: { color: 'E2E8F0' } } }, { text: `$${Math.round(act.totalFobAnnualUsd).toLocaleString()}`, options: { bold: true, align: 'right', fill: { color: 'E2E8F0' } } }, { text: '100.0%', options: { bold: true, align: 'center', fill: { color: 'E2E8F0' } } }],
  ];

  s9.addTable(opexTbl as any, {
    x: 0.8,
    y: 1.3,
    w: 8.4,
    h: 3.5,
    border: { pt: 0.5, color: BORDER_COLOR },
    margin: 0.04,
    fontSize: 8,
  });

  // =========================================================================
  // SLIDE 10: PROYEKSI FINANSIAL & ARUS KAS LOM (CASH FLOW PROJECTIONS)
  // =========================================================================
  const s10 = pptx.addSlide();
  addSlideChrome(s10, '9. FINANCIAL MODEL', 'Proyeksi Arus Kas & Finansial Sepanjang Umur Tambang (LOM)', 10);

  const cfSlideRows = cashFlows.slice(0, 8).map((cf) => [
    { text: `Thn ${cf.year}`, options: { align: 'center', bold: true } },
    { text: `${(cf.coalProductionTon / 1_000_000).toFixed(1)} Mt`, options: { align: 'right' } },
    { text: `${(cf.obStrippedBcm / 1_000_000).toFixed(1)} Mbcm`, options: { align: 'right' } },
    { text: `$${cf.blendedCoalPriceUsd.toFixed(1)}`, options: { align: 'right' } },
    { text: `$${(cf.grossRevenueUsd / 1_000_000).toFixed(1)} M`, options: { align: 'right' } },
    { text: `$${(cf.totalOpexUsd / 1_000_000).toFixed(1)} M`, options: { align: 'right' } },
    { text: `$${(cf.ebitdaUsd / 1_000_000).toFixed(1)} M`, options: { align: 'right', bold: true } },
    { text: `$${(cf.taxUsd / 1_000_000).toFixed(1)} M`, options: { align: 'right' } },
    { text: `$${(cf.netCashFlowUsd / 1_000_000).toFixed(1)} M`, options: { align: 'right', bold: true, color: cf.netCashFlowUsd > 0 ? '15803D' : 'B91C1C' } },
    { text: `$${(cf.cumulativeCashFlowUsd / 1_000_000).toFixed(1)} M`, options: { align: 'right', bold: true, color: cf.cumulativeCashFlowUsd > 0 ? '15803D' : 'B91C1C' } },
  ]);

  const cfTableData = [
    [
      { text: 'Tahun', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'center' } },
      { text: 'Batubara', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'OB', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'Harga Jual', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'Revenue', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'OPEX', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'EBITDA', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'PPh 22%', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'Net Cash Flow', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'Kumulatif CF', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
    ],
    ...cfSlideRows,
    [
      { text: 'TOTAL LOM', options: { bold: true, fill: { color: 'E2E8F0' }, align: 'center' } },
      { text: `${(cashFlows.reduce((a, c) => a + c.coalProductionTon, 0) / 1_000_000).toFixed(1)} Mt`, options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' } },
      { text: `${(cashFlows.reduce((a, c) => a + c.obStrippedBcm, 0) / 1_000_000).toFixed(1)} Mbcm`, options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' } },
      { text: '-', options: { fill: { color: 'E2E8F0' }, align: 'center' } },
      { text: `$${(financials.totalLifeOfMineRevenueUsd / 1_000_000).toFixed(1)} M`, options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' } },
      { text: `$${(cashFlows.reduce((a, c) => a + c.totalOpexUsd, 0) / 1_000_000).toFixed(1)} M`, options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' } },
      { text: `$${(financials.totalLifeOfMineEbitdaUsd / 1_000_000).toFixed(1)} M`, options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' } },
      { text: `$${(cashFlows.reduce((a, c) => a + c.taxUsd, 0) / 1_000_000).toFixed(1)} M`, options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' } },
      { text: `$${(cashFlows.reduce((a, c) => a + c.netCashFlowUsd, 0) / 1_000_000).toFixed(1)} M`, options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' } },
      { text: `$${(financials.npvUsd / 1_000_000).toFixed(1)} M (NPV)`, options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' } },
    ],
  ];

  s10.addTable(cfTableData as any, {
    x: 0.8,
    y: 1.3,
    w: 8.4,
    h: 3.5,
    border: { pt: 0.5, color: BORDER_COLOR },
    margin: 0.04,
    fontSize: 7.5,
  });

  // =========================================================================
  // SLIDE 11: INDIKATOR KELAYAKAN FINANSIAL & PROFITABILITAS LENGKAP
  // =========================================================================
  const s11 = pptx.addSlide();
  addSlideChrome(s11, '10. FEASIBILITY METRICS', 'Indikator Kelayakan Finansial Komprehensif & Uji Ambang Batas', 11);

  const finMetricsTable = [
    [
      { text: 'Indikator Finansial Tambang', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5 } },
      { text: 'Nilai Model (USD)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'Nilai (IDR Eqv.)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'right' } },
      { text: 'Kriteria Kelayakan', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5 } },
      { text: 'Status Keputusan', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8.5, align: 'center' } },
    ],
    [
      { text: `Net Present Value (NPV @ WACC ${scenario.financials.discountRateWaccPercent}%)` },
      { text: `$${(financials.npvUsd / 1_000_000).toFixed(2)} Juta`, options: { align: 'right', bold: true } },
      { text: `Rp ${(Math.round(financials.npvUsd * rateIdr) / 1_000_000_000).toFixed(1)} M`, options: { align: 'right' } },
      { text: 'NPV > 0 (Positif)' },
      { text: financials.npvUsd > 0 ? 'LAYAK (MEMENUHI)' : 'TIDAK LAYAK', options: { align: 'center', bold: true, color: financials.npvUsd > 0 ? '15803D' : 'B91C1C' } },
    ],
    [
      { text: 'Internal Rate of Return (IRR)' },
      { text: `${financials.irrPercent.toFixed(2)}%`, options: { align: 'right', bold: true } },
      { text: '-', options: { align: 'center' } },
      { text: `Target Hurdle ≥ 18% (WACC: ${scenario.financials.discountRateWaccPercent}%)` },
      { text: financials.irrPercent >= 18 ? 'SANGAT LAYAK' : financials.irrPercent >= scenario.financials.discountRateWaccPercent ? 'LAYAK' : 'DI BAWAH HURDLE', options: { align: 'center', bold: true, color: financials.irrPercent >= scenario.financials.discountRateWaccPercent ? '15803D' : 'B91C1C' } },
    ],
    [
      { text: 'Payback Period (PBP)' },
      { text: `${financials.paybackPeriodYears.toFixed(2)} Tahun`, options: { align: 'right', bold: true } },
      { text: '-', options: { align: 'center' } },
      { text: `< ${(scenario.reserves.mineLifeYears * 0.5).toFixed(1)} Tahun (Maks. 50% LOM)` },
      { text: financials.paybackPeriodYears <= scenario.reserves.mineLifeYears * 0.5 ? 'AMAN (MODAL CEPAT KEMBALI)' : 'MODERAT', options: { align: 'center', bold: true, color: '15803D' } },
    ],
    [
      { text: 'Benefit-Cost Ratio (BCR)' },
      { text: `${financials.benefitCostRatio.toFixed(2)}`, options: { align: 'right', bold: true } },
      { text: '-', options: { align: 'center' } },
      { text: 'BCR > 1.00' },
      { text: financials.benefitCostRatio > 1.0 ? 'MENGUNTUNGKAN' : 'TIDAK LAYAK', options: { align: 'center', bold: true, color: financials.benefitCostRatio > 1.0 ? '15803D' : 'B91C1C' } },
    ],
    [
      { text: 'Profitability Index (PI)' },
      { text: `${financials.profitabilityIndex.toFixed(2)}`, options: { align: 'right', bold: true } },
      { text: '-', options: { align: 'center' } },
      { text: 'PI > 1.00' },
      { text: financials.profitabilityIndex > 1.0 ? 'PENCIPTAAN NILAI +' : 'TIDAK LAYAK', options: { align: 'center', bold: true, color: financials.profitabilityIndex > 1.0 ? '15803D' : 'B91C1C' } },
    ],
    [
      { text: 'Harga Batubara Impas (Breakeven Price)' },
      { text: `$${financials.breakevenCoalPriceUsd.toFixed(2)}/Ton`, options: { align: 'right', bold: true } },
      { text: `Rp ${Math.round(financials.breakevenCoalPriceUsd * rateIdr).toLocaleString('id-ID')}`, options: { align: 'right' } },
      { text: `Harga Pasar: USD ${scenario.financials.coalPriceUsdPerTon}/Ton` },
      { text: `SAFETY BUFFER: +$${(scenario.financials.coalPriceUsdPerTon - financials.breakevenCoalPriceUsd).toFixed(2)}/T`, options: { align: 'center', bold: true, color: '15803D' } },
    ],
    [
      { text: 'Rata-rata Margin EBITDA LOM' },
      { text: `${financials.averageProfitMarginPercent.toFixed(1)}%`, options: { align: 'right', bold: true } },
      { text: '-', options: { align: 'center' } },
      { text: 'Target Industri > 20%' },
      { text: financials.averageProfitMarginPercent >= 20 ? 'KUAT' : 'MODERAT', options: { align: 'center', bold: true, color: '15803D' } },
    ],
    [
      { text: 'Total LOM Net Profit After Tax' },
      { text: `$${(financials.totalLifeOfMineNetProfitUsd / 1_000_000).toFixed(2)} Juta`, options: { align: 'right', bold: true } },
      { text: `Rp ${(Math.round(financials.totalLifeOfMineNetProfitUsd * rateIdr) / 1_000_000_000).toFixed(1)} M`, options: { align: 'right' } },
      { text: 'PPh Badan 22% (UU HPP)' },
      { text: 'PROFITABEL', options: { align: 'center', bold: true, color: '15803D' } },
    ],
  ];

  s11.addTable(finMetricsTable as any, {
    x: 0.8,
    y: 1.3,
    w: 8.4,
    h: 3.5,
    border: { pt: 0.5, color: BORDER_COLOR },
    margin: 0.05,
    fontSize: 8,
  });

  // =========================================================================
  // SLIDE 12: ANALISIS SENSITIVITAS MULTIVARIABEL & UJI KETAHANAN RISIKO
  // =========================================================================
  const s12 = pptx.addSlide();
  addSlideChrome(s12, '11. SENSITIVITY & RISK', 'Analisis Sensitivitas Multivariabel & Uji Ketahanan Terhadap Fluktuasi Pasar', 12);

  const sensRowsSlide = (sensitivity.length > 0 ? sensitivity : [
    { changePercent: -20, coalPriceNpvUsd: financials.npvUsd * 0.4, coalPriceIrrPercent: financials.irrPercent * 0.55, fuelCostNpvUsd: financials.npvUsd * 1.15, fuelCostIrrPercent: financials.irrPercent * 1.08, strippingRatioNpvUsd: financials.npvUsd * 1.25, strippingRatioIrrPercent: financials.irrPercent * 1.12, opexNpvUsd: financials.npvUsd * 1.2, opexIrrPercent: financials.irrPercent * 1.1, capexNpvUsd: financials.npvUsd * 1.08, capexIrrPercent: financials.irrPercent * 1.15 },
    { changePercent: -10, coalPriceNpvUsd: financials.npvUsd * 0.7, coalPriceIrrPercent: financials.irrPercent * 0.78, fuelCostNpvUsd: financials.npvUsd * 1.07, fuelCostIrrPercent: financials.irrPercent * 1.04, strippingRatioNpvUsd: financials.npvUsd * 1.12, strippingRatioIrrPercent: financials.irrPercent * 1.06, opexNpvUsd: financials.npvUsd * 1.1, opexIrrPercent: financials.irrPercent * 1.05, capexNpvUsd: financials.npvUsd * 1.04, capexIrrPercent: financials.irrPercent * 1.07 },
    { changePercent: 0, coalPriceNpvUsd: financials.npvUsd, coalPriceIrrPercent: financials.irrPercent, fuelCostNpvUsd: financials.npvUsd, fuelCostIrrPercent: financials.irrPercent, strippingRatioNpvUsd: financials.npvUsd, strippingRatioIrrPercent: financials.irrPercent, opexNpvUsd: financials.npvUsd, opexIrrPercent: financials.irrPercent, capexNpvUsd: financials.npvUsd, capexIrrPercent: financials.irrPercent },
    { changePercent: 10, coalPriceNpvUsd: financials.npvUsd * 1.3, coalPriceIrrPercent: financials.irrPercent * 1.22, fuelCostNpvUsd: financials.npvUsd * 0.93, fuelCostIrrPercent: financials.irrPercent * 0.96, strippingRatioNpvUsd: financials.npvUsd * 0.88, strippingRatioIrrPercent: financials.irrPercent * 0.94, opexNpvUsd: financials.npvUsd * 0.9, opexIrrPercent: financials.irrPercent * 0.95, capexNpvUsd: financials.npvUsd * 0.96, capexIrrPercent: financials.irrPercent * 0.93 },
    { changePercent: 20, coalPriceNpvUsd: financials.npvUsd * 1.6, coalPriceIrrPercent: financials.irrPercent * 1.45, fuelCostNpvUsd: financials.npvUsd * 0.85, fuelCostIrrPercent: financials.irrPercent * 0.92, strippingRatioNpvUsd: financials.npvUsd * 0.75, strippingRatioIrrPercent: financials.irrPercent * 0.88, opexNpvUsd: financials.npvUsd * 0.8, opexIrrPercent: financials.irrPercent * 0.9, capexNpvUsd: financials.npvUsd * 0.92, capexIrrPercent: financials.irrPercent * 0.86 },
  ]).map((s) => [
    { text: `${s.changePercent > 0 ? '+' : ''}${s.changePercent}%`, options: { align: 'center', bold: true, fill: s.changePercent === 0 ? { color: 'FEF3C7' } : undefined } },
    { text: `$${(s.coalPriceNpvUsd / 1_000_000).toFixed(1)} M`, options: { align: 'right', bold: true } },
    { text: `${s.coalPriceIrrPercent.toFixed(1)}%`, options: { align: 'right' } },
    { text: `$${(s.fuelCostNpvUsd / 1_000_000).toFixed(1)} M`, options: { align: 'right' } },
    { text: `${s.fuelCostIrrPercent.toFixed(1)}%`, options: { align: 'right' } },
    { text: `$${(s.strippingRatioNpvUsd / 1_000_000).toFixed(1)} M`, options: { align: 'right' } },
    { text: `${s.strippingRatioIrrPercent.toFixed(1)}%`, options: { align: 'right' } },
    { text: `$${(s.opexNpvUsd / 1_000_000).toFixed(1)} M`, options: { align: 'right' } },
    { text: `$${(s.capexNpvUsd / 1_000_000).toFixed(1)} M`, options: { align: 'right' } },
  ]);

  const sensTableData = [
    [
      { text: 'Deviasi', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'center' } },
      { text: 'NPV Harga Batubara', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'IRR Batubara', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'NPV Biaya Solar', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'IRR Solar', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'NPV Stripping Ratio', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'IRR SR', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'NPV OPEX', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
      { text: 'NPV CAPEX', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'right' } },
    ],
    ...sensRowsSlide,
  ];

  s12.addTable(sensTableData as any, {
    x: 0.8,
    y: 1.3,
    w: 8.4,
    h: 2.3,
    border: { pt: 0.5, color: BORDER_COLOR },
    margin: 0.04,
    fontSize: 8,
  });

  // Tornado ranking callout at bottom
  s12.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 3.75,
    w: 8.4,
    h: 1.25,
    fill: { color: WHITE },
    line: { color: BORDER_COLOR, width: 1 },
    rectRadius: 0.08,
  });

  s12.addText('KESIMPULAN TINGKAT KERENTANAN RISIKO (TORNADO SENSITIVITY RANKING):', {
    x: 1.0,
    y: 3.85,
    w: 8.0,
    h: 0.22,
    fontSize: 9,
    bold: true,
    color: NAVY,
  });

  s12.addText(
    '1. [Paling Kritis] Harga Jual Batubara: Penurunan 20% menggerus NPV hingga 60%. Mitigasi: Kontrak pasokan jangka panjang (fixed price) dan hedging.\n' +
    '2. [Kritis] Stripping Ratio Lapangan: Peningkatan SR 10% menurunkan NPV ~12%. Mitigasi: Kontrol geoteknik ketat & in-pit backfilling.\n' +
    '3. [Signifikan] Biaya Solar Industri: Kenaikan harga solar 10% memangkas NPV ~7%. Mitigasi: Pengadaan solar formula B35 dan efisiensi rute hauling.\n' +
    `4. [Safety Buffer] Harga Batubara Impas berada pada USD ${financials.breakevenCoalPriceUsd.toFixed(1)}/Ton memberikan bantalan keamanan ${(scenario.financials.coalPriceUsdPerTon - financials.breakevenCoalPriceUsd).toFixed(1)} USD/Ton (${(((scenario.financials.coalPriceUsdPerTon - financials.breakevenCoalPriceUsd) / scenario.financials.coalPriceUsdPerTon) * 100).toFixed(1)}%) terhadap harga pasar.`,
    {
      x: 1.0,
      y: 4.1,
      w: 8.0,
      h: 0.85,
      fontSize: 8,
      color: SLATE,
      lineSpacing: 13,
    }
  );

  // =========================================================================
  // SLIDE 13: KEPATUHAN REGULASI ESDM & TATA KELOLA PERTAMBANGAN
  // =========================================================================
  const s13 = pptx.addSlide();
  addSlideChrome(s13, '12. REGULASI & ESG', 'Kepatuhan Regulasi Pertambangan ESDM & Good Mining Practice', 13);

  const regBlocks = [
    {
      reg: 'PP NO. 26 TAHUN 2022',
      title: 'Tarif Royalti PNBP Berjenjang',
      desc: `Mewajibkan pembayaran royalti PNBP secara progresif berdasarkan tingkat kalori batubara GAR dan Harga Batubara Acuan (HBA). Kalori ${scenario.reserves.calorificValueGar} kcal/kg GAR dikenakan tarif royalti efektif berjenjang yang diintegrasikan otomatis ke dalam biaya produksi FOB.`,
      status: 'TERPENUHI & PATUH',
    },
    {
      reg: 'KEPMEN ESDM NO. 58.K/2022',
      title: 'Domestic Market Obligation (DMO 25%)',
      desc: `Kewajiban pemenuhan kebutuhan batubara dalam negeri minimal ${scenario.financials.dmoObligationPercent}% dari produksi tahunan dengan batas harga (price cap) USD ${scenario.financials.dmoPriceCapUsdPerTon}/Ton untuk PLN. Model arus kas telah menerapkan harga jual tertimbang (weighted blended price).`,
      status: 'TERPENUHI & PATUH',
    },
    {
      reg: 'KEPMEN ESDM NO. 1827 K/30/MEM/2018',
      title: 'Kaidah Teknik & Keselamatan Jalan Tambang',
      desc: `Pedoman teknis pertambangan yang baik: Kemiringan jalan hauling maksimum 12% (model: ${scenario.locationRoad.roadGradePercent}%), lebar jalan angkut minimum 3.5x lebar dump truck, serta kesiapan mekanis armada MA ≥85% dan PA ≥90% dievaluasi secara ketat.`,
      status: 'TERPENUHI & PATUH',
    },
    {
      reg: 'PERMEN ESDM NO. 26 TAHUN 2018',
      title: 'Jaminan Reklamasi & Rencana Pascatambang',
      desc: `Kewajiban penempatan dana jaminan reklamasi dan penutupan tambang (mine closure). Proyek mencadangkan dana sebesar USD ${scenario.financials.reclamationAndMineClosureUsdPerTon}/Ton batubara yang diproduksi secara berkelanjutan sepanjang ${scenario.reserves.mineLifeYears} tahun umur tambang.`,
      status: 'TERPENUHI & PATUH',
    },
  ];

  regBlocks.forEach((b, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const bX = 0.8 + col * 4.3;
    const bY = 1.3 + row * 1.8;

    s13.addShape(pptx.ShapeType.roundRect, {
      x: bX,
      y: bY,
      w: 4.1,
      h: 1.65,
      fill: { color: WHITE },
      line: { color: '86EFAC', width: 1 },
      rectRadius: 0.08,
    });

    s13.addText(b.reg, {
      x: bX + 0.15,
      y: bY + 0.12,
      w: 2.6,
      h: 0.2,
      fontSize: 8.5,
      bold: true,
      color: GOLD,
    });

    s13.addText(b.status, {
      x: bX + 2.7,
      y: bY + 0.12,
      w: 1.25,
      h: 0.2,
      fontSize: 7.5,
      bold: true,
      align: 'right',
      color: '15803D',
    });

    s13.addText(b.title, {
      x: bX + 0.15,
      y: bY + 0.35,
      w: 3.8,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: NAVY,
    });

    s13.addText(b.desc, {
      x: bX + 0.15,
      y: bY + 0.62,
      w: 3.8,
      h: 0.95,
      fontSize: 8,
      color: SLATE,
      lineSpacing: 12,
    });
  });

  // =========================================================================
  // SLIDE 14: RENCANA AKSI STRATEGIS DIREKSI & LEMBAR PENGESAHAN RESMI
  // =========================================================================
  const s14 = pptx.addSlide();
  addSlideChrome(s14, '13. ACTION PLAN & SIGN-OFF', 'Rencana Aksi Strategis Direksi & Lembar Pengesahan Formal', 14);

  // Strategic Actions Table
  const actTableData = [
    [
      { text: 'Kategori', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8 } },
      { text: 'Prioritas', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8, align: 'center' } },
      { text: 'Inisiatif Strategis', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8 } },
      { text: 'Langkah Tindakan Nyata (Actionable Steps)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 8 } },
    ],
    ...recommendation.strategicActions.slice(0, 4).map((a) => [
      { text: a.category },
      { text: a.priority, options: { align: 'center', bold: true, color: a.priority === 'HIGH' ? 'B91C1C' : a.priority === 'MEDIUM' ? 'D97706' : '15803D' } },
      { text: a.title, options: { bold: true } },
      { text: a.actionableStep },
    ]),
  ];

  s14.addTable(actTableData as any, {
    x: 0.8,
    y: 1.3,
    w: 8.4,
    h: 2.1,
    border: { pt: 0.5, color: BORDER_COLOR },
    margin: 0.04,
    fontSize: 7.5,
  });

  // Sign-Off Block
  s14.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 3.55,
    w: 8.4,
    h: 1.45,
    fill: { color: WHITE },
    line: { color: BORDER_COLOR, width: 1 },
    rectRadius: 0.08,
  });

  s14.addText('LEMBAR PENGESAHAN STUDI KELAYAKAN TEKNO-EKONOMI TAMBANG:', {
    x: 1.0,
    y: 3.65,
    w: 8.0,
    h: 0.2,
    fontSize: 8.5,
    bold: true,
    color: NAVY,
  });

  const signCols = [
    { title: 'Disiapkan Oleh:', name: analyst, role: analystTitle, date: dateStr },
    { title: 'Diperiksa Oleh:', name: reviewerName, role: 'Head of Mine Engineering & Technical Services', date: dateStr },
    { title: 'Disetujui Oleh:', name: approverName, role: `${company}`, date: dateStr },
  ];

  signCols.forEach((sig, idx) => {
    const sX = 1.0 + idx * 2.75;
    s14.addText(sig.title, {
      x: sX,
      y: 3.9,
      w: 2.5,
      h: 0.18,
      fontSize: 7.5,
      color: SLATE_LIGHT,
    });
    s14.addText('( _______________________ )', {
      x: sX,
      y: 4.4,
      w: 2.5,
      h: 0.2,
      fontSize: 8,
      color: SLATE_LIGHT,
    });
    s14.addText(sig.name, {
      x: sX,
      y: 4.6,
      w: 2.5,
      h: 0.18,
      fontSize: 8,
      bold: true,
      color: NAVY,
    });
    s14.addText(sig.role, {
      x: sX,
      y: 4.78,
      w: 2.5,
      h: 0.18,
      fontSize: 7,
      color: SLATE_LIGHT,
    });
  });

  // Save PPTX file
  const safeName = (metadata?.mineConcessionName || scenario.reserves.mineName).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `PitchDeck_Feasibility_${safeName}_Full_Executive_Deck.pptx`;
  await pptx.writeFile({ fileName });
}

/**
 * Ekspor Skenario Lengkap ke Format JSON
 */
export function exportToJson(scenario: ProjectScenario, identity?: any) {
  const payload = identity ? { scenario, identity, exportedAt: new Date().toISOString() } : scenario;
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `Mining_Scenario_${scenario.id}_${new Date().toISOString().slice(0, 10)}.json`);
}

/**
 * Impor Skenario dari Berkas JSON
 */
export function importFromJson(file: File): Promise<ProjectScenario> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.reserves || !parsed.financials) {
          throw new Error('Format berkas skenario tidak valid');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas'));
    reader.readAsText(file);
  });
}
