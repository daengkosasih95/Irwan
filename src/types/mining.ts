export type CurrencyType = 'USD' | 'IDR';

export interface MineReserve {
  mineName: string;
  location: string;
  pitArea: string;
  totalReserveMt: number; // Juta Ton cadangan
  calorificValueGar: number; // kcal/kg GAR (e.g. 5000)
  calorificValueNar: number; // kcal/kg NAR (e.g. 4700)
  targetAnnualProductionMt: number; // Target produksi tahunan batubara (Juta Ton/tahun)
  plannedStrippingRatio: number; // Rencana Nisbah Kupas (BCM/Ton, e.g. 5.5)
  mineLifeYears: number; // Umur tambang (Tahun, e.g. 7)
  insituDensityCoal: number; // t/m3 (e.g. 1.30)
  insituDensityOb: number; // t/m3 (e.g. 2.20)
  looseDensityOb: number; // t/m3 (e.g. 1.80)
  swellFactorOb: number; // (e.g. 0.82)
  swellFactorCoal: number; // (e.g. 0.85)
}

export interface LocationAndRoadParams {
  obDumpDistanceKm: number; // Jarak buang OB (km, e.g. 2.5)
  coalHaulDistanceKm: number; // Jarak angkut batubara ke ROM/Port (km, e.g. 18.0)
  roadGradePercent: number; // Kemiringan jalan rata-rata (%, e.g. 6%)
  rollingResistancePercent: number; // Rolling resistance permukaan jalan (%, e.g. 3% jalan keras berkerikil, 6% becek)
  soilCondition: 'KERAS_KERIKIL' | 'SEDANG_LEMPUNG' | 'LUNAK_BECEK' | 'BATU_PECAH';
  averageHaulSpeedLoadedKmh: number; // Kecepatan bermuatan (km/jam, e.g. 24)
  averageHaulSpeedEmptyKmh: number; // Kecepatan kosongan (km/jam, e.g. 36)
  speedRetardationDownhillFactor?: number; // Faktor pembatas kecepatan turunan terjal (0.8 - 1.0)
}

export interface WeatherAndCorrectionParams {
  scheduledWorkingDaysPerYear: number; // Hari kerja kalender per tahun (e.g. 365)
  workingShiftsPerDay: number; // Shift per hari (e.g. 2 shift @ 12 jam atau 3 shift @ 8 jam)
  scheduledHoursPerShift: number; // Jam per shift (e.g. 12)
  rainDelayHoursPerMonth: number; // Jam hujan rata-rata (jam/bulan, e.g. 45)
  slipperyDelayHoursPerMonth: number; // Jam jalan licin/kering pasca hujan (jam/bulan, e.g. 50)
  fogAndSafetyDelayHoursPerMonth: number; // Jam kabut, blasting, pergeseran shift (jam/bulan, e.g. 30)
  dewateringDelayHoursPerMonth: number; // Jam pompa & lumpur genangan pit sump (jam/bulan, e.g. 20)
  operatorSkillFactor: number; // Faktor keterampilan operator (0.75 - 1.0, e.g. 0.90)
  jobEfficiencyFactor: number; // Efisiensi kerja umum lapangan (0.70 - 0.95, e.g. 0.83)
  nightShiftFatigueFactor: number; // Faktor penurunan produktivitas shift malam (0.90 - 0.98, e.g. 0.95)
  bucketFillFactorExcavator: number; // Faktor pengisian bucket (0.80 - 1.10, e.g. 0.95)
  mudRollingResistanceSurgePercent: number; // Kenaikan rolling resistance akibat kondisi lumpur/hujan (e.g. +2.0%)
}

export type EquipmentType =
  | 'EXCAVATOR_OB'
  | 'HAULER_OB'
  | 'EXCAVATOR_COAL'
  | 'HAULER_COAL'
  | 'SUPPORT_DOZER'
  | 'SUPPORT_GRADER'
  | 'SUPPORT_WATER_TRUCK'
  | 'SUPPORT_PUMP';

export interface HeavyEquipmentUnit {
  id: string;
  name?: string;
  type: EquipmentType;
  brand?: string;
  model: string;
  fleetCount: number;
  bucketOrVesselCapacity: number; // m3 bucket untuk excavator, ton untuk hauler
  enginePowerHp: number;
  operatingWeightTon?: number;
  purchasePriceUsd?: number;
  fuelBurnRateLph: number; // Konsumsi solar Liter/Jam operasi
  hourlyRateUsd: number; // Biaya sewa/depresiasi $/jam
  maintenanceCostHourlyUsd: number; // Biaya suku cadang & servis berkala $/jam
  tyreOrTrackWearHourlyUsd?: number; // Biaya keausan ban / track pad $/jam

  // Kondisi Keausan & Jadwal Perawatan (Maintenance & Wear)
  ageYears: number; // Usia unit saat ini (tahun, e.g. 2.5)
  cumulativeHours: number; // Total jam operasi mesin kumulatif (e.g. 14,000 jam)
  wearAndTearPercent: number; // Persentase keausan mekanis (0% baru s/d 40% aus)
  preventiveMaintenanceIntervalHours: number; // Interval PM (e.g. 250 jam)
  meanTimeBetweenFailuresHours: number; // MTBF (e.g. 130 jam)
  meanTimeToRepairHours: number; // MTTR (e.g. 5.5 jam)
  scheduledPmHoursPerMonth?: number; // Jam PM terjadwal per bulan
  unscheduledRepairHoursPerMonth?: number; // Jam perbaikan breakdown tak terjadwal per bulan
  degradationEfficiencyFactor?: number; // Faktor efisiensi setelah degradasi keausan

  // Availability Factors (Baku Kepmen ESDM / AS 2528)
  workingHoursW: number; // Jam kerja produktif (Working)
  idleHoursS: number; // Jam standby/idle (Standby)
  repairHoursR: number; // Jam perawatan & perbaikan (Repair)

  // Cycle time specifics
  digCycleTimeSec: number; // Excavator: waktu siklus gali (detik, e.g. 24s)
  spotAndDumpingTimeSec: number; // Hauler: waktu manuver tumpah & antri (detik, e.g. 70s)
}

export interface FinancialParameters {
  currencyExchangeRateIdrUsd: number; // Kurs Rp / USD (e.g. 15,800)
  coalPriceUsdPerTon: number; // Harga jual batubara FOB ($/ton, e.g. 85.00)
  industrialFuelPriceUsdPerLiter: number; // Harga solar industri ($/liter, e.g. 1.05)
  discountRateWaccPercent: number; // Suku bunga diskonto / WACC (%, e.g. 11.5%)
  inflationRatePercent: number; // Tingkat inflasi tahunan (%, e.g. 3.5%)
  corporateTaxRatePercent: number; // PPh Badan UU HPP (22%)
  // Kewajiban Regulasi & Perpajakan ESDM Terkini
  dmoObligationPercent: number; // DMO Persentase (25% kewajiban pasok domestik)
  dmoPriceCapUsdPerTon: number; // Batas harga DMO PLN ($70/ton atau regulasi berlaku)
  miningPermitType?: 'IUP' | 'IUPK'; // Jenis Izin: IUP (PP 26/2022) vs IUPK (PP 15/2022)
  concessionAreaHa?: number; // Luas Wilayah Izin Usaha Pertambangan (Ha) untuk PNBP Iuran Tetap
  deadRentRateUsdPerHa?: number; // Tarif PNBP Iuran Tetap ($/Ha/thn, PP 26/2022 e.g. $4.00 atau Rp 60.000/Ha)
  applyDeadRentInCashFlow?: boolean; // Sertakan PNBP Iuran Tetap dalam arus kas operasional
  royaltyCalculationMethod?: 'PROGRESSIVE_SPLIT_DMO' | 'PROGRESSIVE_BLENDED'; // Metode: Split DMO vs Ekspor (Realistis) atau Blended
  
  // Capex items (USD)
  capexExplorationAndPermittingUsd: number;
  capexLandAcquisitionUsd: number;
  capexHaulingRoadAndInfrastructureUsd: number;
  capexPortAndJettyFacilityUsd: number;
  capexCampAndWorkshopUsd: number;
  capexEquipmentFleetPurchasedUsd: number;
  capexContingencyPercent: number; // e.g. 10%
  
  // Opex parameters
  obMiningContractorRateUsdPerBcm: number; // Kontraktor OB removal ($/bcm, e.g. 2.35)
  coalMiningContractorRateUsdPerTon: number; // Coal getting rate ($/ton, e.g. 1.60)
  coalCrushingAndHandlingUsdPerTon: number; // Crushing & stockpile ($/ton, e.g. 1.20)
  coalHaulingUsdPerTonKm: number; // Transport hauling ke port ($/ton.km, e.g. 0.08)
  bargingAndTranshipmentUsdPerTon: number; // Tongkang & alih muat ($/ton, e.g. 4.50)
  portHandlingAndSurveyorUsdPerTon: number; // Port charges & independent surveyor ($/ton, e.g. 1.10)
  generalAndAdminAnnualUsd: number; // G&A tetap tahunan (USD, e.g. 1,200,000)
  reclamationAndMineClosureUsdPerTon: number; // Jaminan reklamasi & pascatambang ($/ton, e.g. 0.80)
}

export interface CycleTimeBreakdown {
  loaderDigSec: number;
  loaderSwingLoadedSec: number;
  loaderDumpSec: number;
  loaderSwingEmptySec: number;
  loaderTotalCycleSec: number;
  haulerPassesRequired: number;
  haulerSpotAtLoaderSec: number;
  haulerLoadingTimeMin: number;
  haulerHaulLoadedMin: number;
  haulerSpotAndDumpMin: number;
  haulerReturnEmptyMin: number;
  haulerTotalCycleMin: number;
  haulerTripsPerHour: number;
}

export interface ActivityCostItem {
  activityName: string;
  unit: string;
  volume: number;
  rateUsd: number;
  rateIdr: number;
  annualTotalUsd: number;
  annualTotalIdr: number;
  shareOfFobCostPercent: number;
  costComponentBreakdown: {
    equipmentDepreciationPercent: number;
    fuelConsumptionPercent: number;
    maintenanceAndPartsPercent: number;
    operatorLaborPercent: number;
    supportFleetSharePercent: number;
  };
}

export interface ActivityBasedCosting {
  obRemoval: ActivityCostItem;
  coalGetting: ActivityCostItem;
  coalHauling: ActivityCostItem & { rateUsdPerTonKm: number; rateIdrPerTonKm: number };
  pitSupportAndDewatering: ActivityCostItem;
  crushingStockpilePort: ActivityCostItem;
  bargingTranshipment: ActivityCostItem;
  royaltyPnbp: ActivityCostItem;
  reclamationAndClosure: ActivityCostItem;
  generalAdminOverhead: ActivityCostItem;
  totalFobCashCostUsdPerTon: number;
  totalFobCashCostIdrPerTon: number;
  totalFobAnnualUsd: number;
  totalFobAnnualIdr: number;
}

export interface OperationalCalculations {
  effectiveWorkingHoursPerYear: number;
  effectiveWorkingHoursPerMonth: number;
  weatherDelayPercentage: number;
  dewateringDelayHours: number;
  
  // Availability metrics for OB Fleet
  obExcavatorMA: number; // Mechanical Availability (%)
  obExcavatorPA: number; // Physical Availability (%)
  obExcavatorUA: number; // Use of Availability (%)
  obExcavatorEU: number; // Effective Utilization (%)
  
  obHaulerMA: number;
  obHaulerPA: number;
  obHaulerUA: number;
  obHaulerEU: number;
  
  // Detailed Cycle Times
  cycleTimeOB: CycleTimeBreakdown;
  cycleTimeCoal: CycleTimeBreakdown;

  // Productivity calculations
  obExcavatorProductivityBcmPerHour: number;
  obExcavatorAnnualCapacityBcm: number;
  obHaulerCycleTimeMinutes: number;
  obHaulerTripsPerHour: number;
  obHaulerProductivityBcmPerHour: number;
  obHaulerAnnualCapacityBcm: number;
  
  coalExcavatorProductivityTonPerHour: number;
  coalExcavatorAnnualCapacityTon: number;
  coalHaulerCycleTimeMinutes: number;
  coalHaulerProductivityTonPerHour: number;
  coalHaulerAnnualCapacityTon: number;
  
  // Match factor
  matchFactorOB: number; // (N_truck * Cycle_loader) / (N_loader * Cycle_truck)
  matchFactorCoal: number;
  matchFactorStatusOB: 'TRUCK_QUEUE' | 'OPTIMAL' | 'LOADER_IDLE';
  matchFactorStatusCoal: 'TRUCK_QUEUE' | 'OPTIMAL' | 'LOADER_IDLE';
  
  // Fleet comparison
  annualObTargetBcm: number;
  annualObActualFleetBcm: number;
  obProductionAchievementPercent: number;
  
  annualCoalTargetTon: number;
  annualCoalActualFleetTon: number;
  coalProductionAchievementPercent: number;
  
  // Fuel Burn & Ratios
  totalAnnualFuelLiters: number;
  fuelRatioLiterPerTonCoal: number;
  fuelRatioLiterPerBcmOb: number;

  // Activity Based Costing Breakdown
  activityCosting: ActivityBasedCosting;
}

export interface AnnualCashFlow {
  year: number;
  coalProductionTon: number;
  obStrippedBcm: number;
  strippingRatio: number;
  blendedCoalPriceUsd: number;
  grossRevenueUsd: number;
  
  // Opex items
  obMiningCostUsd: number;
  coalMiningCostUsd: number;
  coalHaulingCostUsd: number;
  crushingStockpileCostUsd: number;
  bargingTranshipmentCostUsd: number;
  portHandlingCostUsd: number;
  fuelCostUsd: number;
  maintenanceCostUsd: number;
  generalAdminCostUsd: number;
  royaltyPnbpUsd: number;
  royaltyExportUsd?: number;
  royaltyDmoUsd?: number;
  deadRentPnbpUsd?: number;
  effectiveRoyaltyRatePercent?: number;
  reclamationReserveUsd: number;
  totalOpexUsd: number;
  
  cashCostPerTonUsd: number;
  fobTotalCostPerTonUsd: number;
  
  ebitdaUsd: number;
  depreciationUsd: number;
  ebtUsd: number;
  taxUsd: number;
  netProfitAfterTaxUsd: number;
  
  capexUsd: number;
  netCashFlowUsd: number;
  discountedCashFlowUsd: number;
  cumulativeCashFlowUsd: number;
}

export interface FinancialResults {
  totalInitialCapexUsd: number;
  totalLifeOfMineRevenueUsd: number;
  totalLifeOfMineOpexUsd: number;
  totalLifeOfMineEbitdaUsd: number;
  totalLifeOfMineNetProfitUsd: number;
  averageCashCostPerTonUsd: number;
  averageFobCostPerTonUsd: number;
  averageProfitMarginPercent: number;
  
  npvUsd: number;
  irrPercent: number;
  paybackPeriodYears: number;
  benefitCostRatio: number;
  profitabilityIndex: number;
  projectFeasibilityStatus: 'SANGAT_LAYAK' | 'LAYAK' | 'MARGINAL_BERSYARAT' | 'TIDAK_LAYAK';
  breakevenCoalPriceUsd: number;

  // Beban Royalti PNBP & Kewajiban Fiskal Terkini (PP 26/2022 & PP 15/2022)
  totalLifeOfMineRoyaltyPnbpUsd: number;
  averageRoyaltyRatePercent: number;
  averageRoyaltyUsdPerTon: number;
  totalLifeOfMineDeadRentUsd: number;
  totalLifeOfMineExportRoyaltyUsd: number;
  totalLifeOfMineDmoRoyaltyUsd: number;
  regionalSharingPusatUsd: number; // 20% Kas Pusat
  regionalSharingProvinsiUsd: number; // 16% Pemda Provinsi
  regionalSharingKabPenghasilUsd: number; // 32% Pemda Kab Penghasil
  regionalSharingKabPemerataanUsd: number; // 32% Pemda Kab/Kota Sekitar
}

export interface ProgressiveRoyaltyTierInfo {
  tierNumber: number;
  hbaRangeLabel: string;
  minHba: number;
  maxHba: number | null;
  ratePercent: number;
  isActive: boolean;
}

export interface ProgressiveRoyaltyBreakdown {
  permitType: 'IUP' | 'IUPK';
  regulatoryBasis: string;
  calorificValueGar: number;
  calorieCategoryName: string;
  marketPriceUsd: number;
  effectiveDmoPriceUsd: number;
  blendedCoalPriceUsd: number;
  dmoObligationPercent: number;
  exportFractionPercent: number;
  
  // Rates
  exportRoyaltyRatePercent: number;
  dmoRoyaltyRatePercent: number;
  effectiveBlendedRoyaltyRatePercent: number;
  
  // Tier info
  activeExportTierLabel: string;
  activeDmoTierLabel: string;
  allTiersForCalorie: ProgressiveRoyaltyTierInfo[];
  
  // Per Ton metrics
  exportRoyaltyUsdPerTon: number;
  dmoRoyaltyUsdPerTon: number;
  blendedRoyaltyUsdPerTon: number;
  deadRentUsdPerTon: number;
  totalPnbpUsdPerTon: number;
  
  // Annual metrics
  annualProductionTon: number;
  annualExportCoalTon: number;
  annualDmoCoalTon: number;
  annualExportRevenueUsd: number;
  annualDmoRevenueUsd: number;
  annualGrossRevenueUsd: number;
  annualExportRoyaltyUsd: number;
  annualDmoRoyaltyUsd: number;
  annualTotalRoyaltyUsd: number;
  annualTotalRoyaltyIdr: number;
  
  // Land Rent (Iuran Tetap PNBP)
  concessionAreaHa: number;
  deadRentRateUsdPerHa: number;
  annualDeadRentUsd: number;
  annualDeadRentIdr: number;
  annualTotalPnbpObligationUsd: number;
  annualTotalPnbpObligationIdr: number;
  
  // Dana Bagi Hasil (DBH) PNBP Distribution
  centralGovShareUsd: number; // 20%
  provincialGovShareUsd: number; // 16%
  producingRegencyShareUsd: number; // 32%
  surroundingRegencyShareUsd: number; // 32%
  
  // Sensitivity Tiers
  sensitivityTiers: {
    simulatedPriceUsd: number;
    scenarioLabel: string;
    ratePercent: number;
    royaltyUsdPerTon: number;
    annualRoyaltyUsd: number;
  }[];
}

export interface SensitivityDataPoint {
  changePercent: number; // e.g. -30%, -20%, -10%, 0%, +10%, +20%, +30%
  coalPriceNpvUsd: number;
  coalPriceIrrPercent: number;
  fuelCostNpvUsd: number;
  fuelCostIrrPercent: number;
  strippingRatioNpvUsd: number;
  strippingRatioIrrPercent: number;
  opexNpvUsd: number;
  opexIrrPercent: number;
  capexNpvUsd: number;
  capexIrrPercent: number;
}

export interface StrategicRecommendation {
  overallVerdict: 'GO' | 'CONDITIONAL_GO' | 'NO_GO';
  executiveSummary: string;
  operationalStrengths: string[];
  operationalRisks: string[];
  strategicActions: {
    category: 'FLEET' | 'FINANCIAL' | 'REGULATORY' | 'MARKET';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    actionableStep: string;
  }[];
}

export interface ProjectScenario {
  id: string;
  name: string;
  description: string;
  isPreset?: boolean;
  reserves: MineReserve;
  locationRoad: LocationAndRoadParams;
  weatherCorrection: WeatherAndCorrectionParams;
  equipments: HeavyEquipmentUnit[];
  financials: FinancialParameters;
}

export type ConfidentialityLevel =
  | 'SANGAT RAHASIA (STRICTLY CONFIDENTIAL)'
  | 'RAHASIA INTERNAL PERUSAHAAN'
  | 'DOKUMEN RESMI TERBATAS'
  | 'DOKUMEN PUBLIK / TERBUKA';

export interface ProjectIdentityConfig {
  appTitle: string; // Judul Dashboard / Aplikasi (e.g. "MINING FEASIBILITY SIMULATOR")
  appSubtitle: string; // Sub-judul / Tagline (e.g. "10+ Yrs Exp. Mining & BizDev Engine")
  reportTitle?: string; // Judul Dokumen Laporan Studi Kelayakan Tekno-Ekonomi
  companyName: string; // Nama Badan Usaha / Perusahaan (PT ...)
  mineConcessionName: string; // Nama Konsesi Tambang / IUP
  concessionIupNumber: string; // Nomor Izin Usaha Pertambangan (IUP / PKP2B)
  pitOrBlockArea: string; // Area Blok / Pit Penambangan
  locationAddress: string; // Lokasi (Kabupaten, Provinsi)
  analystName: string; // Nama Analis / Senior Mining Engineer
  analystTitle: string; // Jabatan Analis
  reviewerName: string; // Nama Pemeriksa Teknis (Reviewer)
  approverName: string; // Nama Pejabat Pengesah (Approver / Direktur)
  reportRemarks: string; // Keterangan Dokumen / Catatan Kaki / Disclaimer
  confidentialityLevel: ConfidentialityLevel;
  documentDate: string; // Tanggal Pengesahan / Rilis Dokumen
  logoType: 'icon' | 'image';
  logoIcon: string; // 'pickaxe' | 'gem' | 'flame' | 'mountain' | 'layers' | 'hard-hat' | 'factory' | 'gauge' | 'shield' | 'trending-up' | 'building'
  logoCustomUrl?: string; // Data URL dari file upload atau link gambar eksternal
}
