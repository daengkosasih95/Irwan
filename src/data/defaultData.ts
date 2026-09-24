import {
  MineReserve,
  LocationAndRoadParams,
  WeatherAndCorrectionParams,
  HeavyEquipmentUnit,
  FinancialParameters,
  ProjectScenario,
  ProjectIdentityConfig,
} from '../types/mining';

export const DEFAULT_PROJECT_IDENTITY: ProjectIdentityConfig = {
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
  reportRemarks: 'Dokumen Feasibility Study Tekno-Ekonomi resmi ini disusun mengacu pada kaidah standar Kepmen ESDM No. 1827 K/30/MEM/2018, PP No. 26 Tahun 2022, dan SNI 5015:2019.',
  confidentialityLevel: 'RAHASIA INTERNAL PERUSAHAAN',
  documentDate: '18 September 2026',
  logoType: 'icon',
  logoIcon: 'pickaxe',
  logoCustomUrl: '',
};

export const DEFAULT_RESERVES: MineReserve = {
  mineName: 'Proyek Batubara Barito Prima Mandiri',
  location: 'Kutai Barat, Kalimantan Timur',
  pitArea: 'Pit Central - Block 01 & 02',
  totalReserveMt: 22.5, // 22.5 Juta Ton Cadangan Tertambang (Mineable)
  calorificValueGar: 5000, // 5,000 kcal/kg GAR
  calorificValueNar: 4680,
  targetAnnualProductionMt: 2.8, // 2.8 Juta Ton/Tahun
  plannedStrippingRatio: 5.4, // Nisbah Kupas Rencana 5.4 BCM/Ton
  mineLifeYears: 8, // Umur Tambang 8 Tahun
  insituDensityCoal: 1.30, // t/m3
  insituDensityOb: 2.20, // t/m3
  looseDensityOb: 1.80, // t/m3
  swellFactorOb: 0.82, // 1 / 1.22
  swellFactorCoal: 0.85,
};

export const DEFAULT_LOCATION_ROAD: LocationAndRoadParams = {
  obDumpDistanceKm: 2.2, // Jarak buang OB ke disposal area 2.2 km
  coalHaulDistanceKm: 16.5, // Jarak hauling batubara ke Stockpile Pelabuhan / Jetty 16.5 km
  roadGradePercent: 6.0, // Kemiringan rata-rata jalan 6%
  rollingResistancePercent: 3.5, // Tahanan gulir jalan tambang terawat 3.5%
  soilCondition: 'SEDANG_LEMPUNG',
  averageHaulSpeedLoadedKmh: 23, // km/jam saat muatan
  averageHaulSpeedEmptyKmh: 36, // km/jam saat kosongan
  speedRetardationDownhillFactor: 0.92, // Faktor pembatas turunan terjal
};

export const DEFAULT_WEATHER_CORRECTION: WeatherAndCorrectionParams = {
  scheduledWorkingDaysPerYear: 365,
  workingShiftsPerDay: 2,
  scheduledHoursPerShift: 12, // 24 jam / hari total terjadwal
  rainDelayHoursPerMonth: 42, // Rata-rata jam hujan per bulan di Kalimantan
  slipperyDelayHoursPerMonth: 48, // Waktu tunggu pengeringan jalan (slippery)
  fogAndSafetyDelayHoursPerMonth: 25, // Shifting, blasting, toolbox meeting
  dewateringDelayHoursPerMonth: 20, // Pemompaan air genangan & lumpur sump pit
  operatorSkillFactor: 0.90, // Operator berpengalaman 90%
  jobEfficiencyFactor: 0.83, // 50 menit kerja efektif per jam = 83.3%
  nightShiftFatigueFactor: 0.95, // Koreksi kelelahan shift malam 95%
  bucketFillFactorExcavator: 0.95, // Faktor pengisian bucket 95%
  mudRollingResistanceSurgePercent: 2.0, // Tambahan rolling resistance saat jalan becek/lumpur
};

export const DEFAULT_EQUIPMENTS: HeavyEquipmentUnit[] = [
  {
    id: 'eq-ob-excavator',
    type: 'EXCAVATOR_OB',
    brand: 'Komatsu',
    model: 'Komatsu PC2000-8 Backhoe',
    fleetCount: 4,
    bucketOrVesselCapacity: 12.0, // 12 m3 bucket
    enginePowerHp: 1046,
    operatingWeightTon: 200,
    fuelBurnRateLph: 125, // Liter/Jam
    hourlyRateUsd: 185, // $/jam
    maintenanceCostHourlyUsd: 38,
    tyreOrTrackWearHourlyUsd: 14,
    ageYears: 2.0,
    cumulativeHours: 9500,
    wearAndTearPercent: 12.0, // Keausan 12%
    preventiveMaintenanceIntervalHours: 250,
    meanTimeBetweenFailuresHours: 140,
    meanTimeToRepairHours: 6.5,
    workingHoursW: 460, // jam/bulan
    idleHoursS: 75,
    repairHoursR: 65,
    digCycleTimeSec: 26, // Cycle time gali 26 detik
    spotAndDumpingTimeSec: 0,
  },
  {
    id: 'eq-ob-hauler',
    type: 'HAULER_OB',
    brand: 'Komatsu',
    model: 'Komatsu HD785-7 (Rigid Dump Truck 91t)',
    fleetCount: 22,
    bucketOrVesselCapacity: 91.0, // 91 ton payload
    enginePowerHp: 1200,
    operatingWeightTon: 166,
    fuelBurnRateLph: 90, // Liter/Jam
    hourlyRateUsd: 140,
    maintenanceCostHourlyUsd: 28,
    tyreOrTrackWearHourlyUsd: 16,
    ageYears: 2.5,
    cumulativeHours: 11200,
    wearAndTearPercent: 14.0,
    preventiveMaintenanceIntervalHours: 250,
    meanTimeBetweenFailuresHours: 125,
    meanTimeToRepairHours: 5.0,
    workingHoursW: 450,
    idleHoursS: 85,
    repairHoursR: 65,
    digCycleTimeSec: 0,
    spotAndDumpingTimeSec: 75, // Manuver, spotting, dump 75 detik
  },
  {
    id: 'eq-coal-excavator',
    type: 'EXCAVATOR_COAL',
    brand: 'Komatsu',
    model: 'Komatsu PC850-8 Coal Loader',
    fleetCount: 2,
    bucketOrVesselCapacity: 5.5, // 5.5 m3 bucket batubara
    enginePowerHp: 510,
    operatingWeightTon: 80,
    fuelBurnRateLph: 68,
    hourlyRateUsd: 110,
    maintenanceCostHourlyUsd: 22,
    tyreOrTrackWearHourlyUsd: 8,
    ageYears: 1.5,
    cumulativeHours: 7200,
    wearAndTearPercent: 9.0,
    preventiveMaintenanceIntervalHours: 250,
    meanTimeBetweenFailuresHours: 145,
    meanTimeToRepairHours: 5.0,
    workingHoursW: 440,
    idleHoursS: 90,
    repairHoursR: 70,
    digCycleTimeSec: 23,
    spotAndDumpingTimeSec: 0,
  },
  {
    id: 'eq-coal-hauler',
    type: 'HAULER_COAL',
    brand: 'Scania',
    model: 'Scania P460 CB 8x4 Heavy Tipper (32t)',
    fleetCount: 16,
    bucketOrVesselCapacity: 32.0, // 32 ton payload per rit
    enginePowerHp: 460,
    operatingWeightTon: 48,
    fuelBurnRateLph: 36,
    hourlyRateUsd: 75,
    maintenanceCostHourlyUsd: 16,
    tyreOrTrackWearHourlyUsd: 8,
    ageYears: 2.0,
    cumulativeHours: 9800,
    wearAndTearPercent: 12.5,
    preventiveMaintenanceIntervalHours: 250,
    meanTimeBetweenFailuresHours: 150,
    meanTimeToRepairHours: 3.8,
    workingHoursW: 430,
    idleHoursS: 95,
    repairHoursR: 75,
    digCycleTimeSec: 0,
    spotAndDumpingTimeSec: 90,
  },
  {
    id: 'eq-support-dozer',
    type: 'SUPPORT_DOZER',
    brand: 'Komatsu',
    model: 'Komatsu D375A-6 Crawler Dozer',
    fleetCount: 3,
    bucketOrVesselCapacity: 18.5,
    enginePowerHp: 610,
    operatingWeightTon: 71,
    fuelBurnRateLph: 65,
    hourlyRateUsd: 95,
    maintenanceCostHourlyUsd: 22,
    tyreOrTrackWearHourlyUsd: 12,
    ageYears: 3.0,
    cumulativeHours: 13500,
    wearAndTearPercent: 16.0,
    preventiveMaintenanceIntervalHours: 250,
    meanTimeBetweenFailuresHours: 130,
    meanTimeToRepairHours: 5.0,
    workingHoursW: 420,
    idleHoursS: 100,
    repairHoursR: 80,
    digCycleTimeSec: 0,
    spotAndDumpingTimeSec: 0,
  },
  {
    id: 'eq-support-grader',
    type: 'SUPPORT_GRADER',
    brand: 'Komatsu',
    model: 'Komatsu GD705-5 Motor Grader',
    fleetCount: 2,
    bucketOrVesselCapacity: 4.9,
    enginePowerHp: 250,
    operatingWeightTon: 24,
    fuelBurnRateLph: 32,
    hourlyRateUsd: 65,
    maintenanceCostHourlyUsd: 14,
    tyreOrTrackWearHourlyUsd: 7,
    ageYears: 2.2,
    cumulativeHours: 8900,
    wearAndTearPercent: 11.0,
    preventiveMaintenanceIntervalHours: 250,
    meanTimeBetweenFailuresHours: 145,
    meanTimeToRepairHours: 4.0,
    workingHoursW: 430,
    idleHoursS: 90,
    repairHoursR: 80,
    digCycleTimeSec: 0,
    spotAndDumpingTimeSec: 0,
  },
];

export const DEFAULT_FINANCIALS: FinancialParameters = {
  currencyExchangeRateIdrUsd: 15850,
  coalPriceUsdPerTon: 86.00, // Harga pasar acuan FOB Vessel $86/ton
  industrialFuelPriceUsdPerLiter: 1.05, // Solar industri B35 ($1.05 / Liter = ~Rp 16.600/L)
  discountRateWaccPercent: 11.5, // WACC / Discount Rate industri tambang 11.5%
  inflationRatePercent: 3.5, // Inflasi rata-rata 3.5%
  corporateTaxRatePercent: 22.0, // PPh Badan 22%
  dmoObligationPercent: 25.0, // DMO 25%
  dmoPriceCapUsdPerTon: 70.0, // DMO PLN Cap $70/ton
  miningPermitType: 'IUP', // IUP Operasi Produksi (PP 26/2022)
  concessionAreaHa: 2850, // Luas konsesi tambang 2.850 Hektar
  deadRentRateUsdPerHa: 4.0, // Tarif PNBP Iuran Tetap ~$4.00/Ha/thn (~Rp 60.000)
  applyDeadRentInCashFlow: true,
  royaltyCalculationMethod: 'PROGRESSIVE_SPLIT_DMO', // Realistis split Ekspor dan DMO sesuai regulasi ESDM
  
  // Capex items (Total ~ $34.1M)
  capexExplorationAndPermittingUsd: 2800000, // Eksplorasi detail, infill drilling, AMDAL, FS
  capexLandAcquisitionUsd: 6500000, // Pembebasan lahan tambang & koridor jalan
  capexHaulingRoadAndInfrastructureUsd: 9200000, // Pembangunan jalan hauling 16.5 km & jembatan
  capexPortAndJettyFacilityUsd: 7500000, // Pembangunan Jetty, conveyor loading, settling pond
  capexCampAndWorkshopUsd: 3200000, // Mess karyawan, kantor tambang, workshop alat berat
  capexEquipmentFleetPurchasedUsd: 2100000, // Armada penunjang, genset, fuel storage, water treatment
  capexContingencyPercent: 8.0, // Cadangan kontinjensi 8%
  
  // Opex items
  obMiningContractorRateUsdPerBcm: 2.25, // Biaya pengupasan OB per bcm
  coalMiningContractorRateUsdPerTon: 1.55, // Biaya coal getting per ton
  coalCrushingAndHandlingUsdPerTon: 1.15, // Biaya crushing, screening & stockpile
  coalHaulingUsdPerTonKm: 0.085, // Biaya angkut per ton-km ($0.085 × 16.5 km = $1.40/ton)
  bargingAndTranshipmentUsdPerTon: 4.80, // Tongkang 300ft & floating crane ke mother vessel
  portHandlingAndSurveyorUsdPerTon: 1.10, // Biaya pelabuhan, dermaga, independent surveyor (Sucofindo/SGS)
  generalAndAdminAnnualUsd: 1450000, // Biaya G&A, CSR, community development, gaji ekspat/manajemen
  reclamationAndMineClosureUsdPerTon: 0.75, // Jaminan reklamasi & pascatambang per ton batubara
};

export const PRESET_SCENARIOS: ProjectScenario[] = [
  {
    id: 'base-case',
    name: 'Skenario Dasar (Base Case)',
    description: 'Parameter realistis pasar batubara saat ini ($86/ton, SR 5.4, Fuel $1.05/L)',
    isPreset: true,
    reserves: { ...DEFAULT_RESERVES },
    locationRoad: { ...DEFAULT_LOCATION_ROAD },
    weatherCorrection: { ...DEFAULT_WEATHER_CORRECTION },
    equipments: JSON.parse(JSON.stringify(DEFAULT_EQUIPMENTS)),
    financials: { ...DEFAULT_FINANCIALS },
  },
  {
    id: 'optimistic-case',
    name: 'Skenario Terbaik (Optimistic Case)',
    description: 'Harga batubara menguat ($108/ton), SR lebih rendah (4.9), efisiensi cuaca & alat tinggi',
    isPreset: true,
    reserves: {
      ...DEFAULT_RESERVES,
      plannedStrippingRatio: 4.9,
      targetAnnualProductionMt: 3.1,
    },
    locationRoad: {
      ...DEFAULT_LOCATION_ROAD,
      obDumpDistanceKm: 1.9,
      roadGradePercent: 5.0,
      rollingResistancePercent: 3.0,
      averageHaulSpeedLoadedKmh: 26,
    },
    weatherCorrection: {
      ...DEFAULT_WEATHER_CORRECTION,
      rainDelayHoursPerMonth: 30,
      slipperyDelayHoursPerMonth: 35,
      operatorSkillFactor: 0.95,
      jobEfficiencyFactor: 0.88,
    },
    equipments: JSON.parse(JSON.stringify(DEFAULT_EQUIPMENTS)),
    financials: {
      ...DEFAULT_FINANCIALS,
      coalPriceUsdPerTon: 108.00,
      industrialFuelPriceUsdPerLiter: 0.95,
      discountRateWaccPercent: 10.5,
      obMiningContractorRateUsdPerBcm: 2.15,
    },
  },
  {
    id: 'pessimistic-case',
    name: 'Skenario Terburuk (Worst / Stress Test)',
    description: 'Tekanan harga batubara turun ($64/ton), kenaikan harga solar ($1.25/L), curah hujan tinggi, SR membengkak (6.2)',
    isPreset: true,
    reserves: {
      ...DEFAULT_RESERVES,
      plannedStrippingRatio: 6.2,
      targetAnnualProductionMt: 2.4,
    },
    locationRoad: {
      ...DEFAULT_LOCATION_ROAD,
      obDumpDistanceKm: 2.8,
      roadGradePercent: 7.5,
      rollingResistancePercent: 4.8,
      soilCondition: 'LUNAK_BECEK',
      averageHaulSpeedLoadedKmh: 19,
    },
    weatherCorrection: {
      ...DEFAULT_WEATHER_CORRECTION,
      rainDelayHoursPerMonth: 65,
      slipperyDelayHoursPerMonth: 75,
      operatorSkillFactor: 0.82,
      jobEfficiencyFactor: 0.75,
    },
    equipments: JSON.parse(JSON.stringify(DEFAULT_EQUIPMENTS)),
    financials: {
      ...DEFAULT_FINANCIALS,
      coalPriceUsdPerTon: 64.00,
      industrialFuelPriceUsdPerLiter: 1.25,
      discountRateWaccPercent: 13.0,
      obMiningContractorRateUsdPerBcm: 2.45,
    },
  },
];
