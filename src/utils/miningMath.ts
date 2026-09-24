import {
  MineReserve,
  LocationAndRoadParams,
  WeatherAndCorrectionParams,
  HeavyEquipmentUnit,
  FinancialParameters,
  OperationalCalculations,
  AnnualCashFlow,
  FinancialResults,
  SensitivityDataPoint,
  StrategicRecommendation,
  CycleTimeBreakdown,
  ActivityBasedCosting,
  CurrencyType,
  ProgressiveRoyaltyBreakdown,
  ProgressiveRoyaltyTierInfo,
} from '../types/mining';

/**
 * Format mata uang USD atau IDR dengan opsi compact
 */
export function formatMoney(
  amountUsd: number,
  currency: CurrencyType = 'USD',
  exchangeRateIdr: number = 15800,
  compact: boolean = false
): string {
  if (currency === 'IDR') {
    const idrValue = amountUsd * exchangeRateIdr;
    if (compact) {
      if (Math.abs(idrValue) >= 1_000_000_000_000) {
        return `Rp ${(idrValue / 1_000_000_000_000).toFixed(2)} T`;
      }
      if (Math.abs(idrValue) >= 1_000_000_000) {
        return `Rp ${(idrValue / 1_000_000_000).toFixed(2)} M`;
      }
      if (Math.abs(idrValue) >= 1_000_000) {
        return `Rp ${(idrValue / 1_000_000).toFixed(2)} Jt`;
      }
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(idrValue);
  }

  if (compact) {
    if (Math.abs(amountUsd) >= 1_000_000_000) {
      return `$${(amountUsd / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(amountUsd) >= 1_000_000) {
      return `$${(amountUsd / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(amountUsd) >= 1_000) {
      return `$${(amountUsd / 1_000).toFixed(1)}k`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amountUsd);
}

/**
 * Format Unit Rate (misal $/BCM atau Rp/BCM, $/Ton atau Rp/Ton)
 */
export function formatUnitRate(
  amountUsd: number,
  currency: CurrencyType = 'USD',
  exchangeRateIdr: number = 15800,
  unit: string = 'Ton'
): string {
  if (currency === 'IDR') {
    const idr = Math.round(amountUsd * exchangeRateIdr);
    return `Rp ${idr.toLocaleString('id-ID')} / ${unit}`;
  }
  return `$${amountUsd.toFixed(2)} / ${unit}`;
}

/**
 * Menghitung tarif royalti PNBP progresif berjenjang berdasarkan peraturan ESDM terkini:
 * - IUP Operasi Produksi: Peraturan Pemerintah (PP) No. 26 Tahun 2022
 * - IUPK Kelanjutan Operasi: Peraturan Pemerintah (PP) No. 15 Tahun 2022
 */
export function calculateRoyaltyRatePercent(
  coalPriceUsd: number,
  calorificValueGar: number,
  permitType: 'IUP' | 'IUPK' = 'IUP'
): number {
  if (permitType === 'IUPK') {
    // Tarif Royalti IUPK berdasarkan PP No. 15 Tahun 2022
    if (calorificValueGar < 4200) {
      if (coalPriceUsd < 70) return 14.0;
      if (coalPriceUsd < 80) return 17.0;
      if (coalPriceUsd < 90) return 23.0;
      if (coalPriceUsd < 100) return 25.0;
      return 28.0;
    } else if (calorificValueGar <= 5200) {
      if (coalPriceUsd < 70) return 17.0;
      if (coalPriceUsd < 80) return 20.0;
      if (coalPriceUsd < 90) return 25.0;
      if (coalPriceUsd < 100) return 27.0;
      return 28.0;
    } else {
      // > 5200 kcal/kg GAR
      if (coalPriceUsd < 70) return 20.0;
      if (coalPriceUsd < 80) return 23.0;
      if (coalPriceUsd < 90) return 25.0;
      if (coalPriceUsd < 100) return 27.0;
      return 28.0;
    }
  }

  // IUP Operasi Produksi berdasarkan PP No. 26 Tahun 2022 Lampiran ESDM
  if (calorificValueGar < 4200) {
    if (coalPriceUsd < 70) return 5.0;
    if (coalPriceUsd <= 90) return 6.0;
    if (coalPriceUsd <= 110) return 7.0;
    return 8.0;
  } else if (calorificValueGar <= 5200) {
    if (coalPriceUsd < 70) return 6.0;
    if (coalPriceUsd <= 90) return 8.5;
    if (coalPriceUsd <= 110) return 9.5;
    return 10.5;
  } else {
    // > 5200 kcal/kg GAR
    if (coalPriceUsd < 70) return 8.0;
    if (coalPriceUsd <= 90) return 10.5;
    if (coalPriceUsd <= 110) return 12.0;
    return 13.5;
  }
}

/**
 * Mengidentifikasi kategori kalori batubara standar ESDM
 */
export function getCalorieCategoryName(calorificValueGar: number): string {
  if (calorificValueGar < 4200) return 'Kalori Rendah (< 4.200 kcal/kg GAR)';
  if (calorificValueGar <= 5200) return 'Kalori Sedang (4.200 - 5.200 kcal/kg GAR)';
  return 'Kalori Tinggi (> 5.200 kcal/kg GAR)';
}

/**
 * Menghasilkan daftar seluruh jenjang tarif progresif (Tier Matrix) untuk kalori & izin yang dipilih
 */
export function getProgressiveRoyaltyTiers(
  calorificValueGar: number,
  permitType: 'IUP' | 'IUPK' = 'IUP',
  activePriceUsd: number = 86
): ProgressiveRoyaltyTierInfo[] {
  if (permitType === 'IUPK') {
    // IUPK PP 15/2022 Tiers
    const isLow = calorificValueGar < 4200;
    const isMed = calorificValueGar >= 4200 && calorificValueGar <= 5200;

    const tiers = [
      {
        tierNumber: 1,
        hbaRangeLabel: 'HBA < USD 70 / Ton',
        minHba: 0,
        maxHba: 70,
        ratePercent: isLow ? 14.0 : isMed ? 17.0 : 20.0,
      },
      {
        tierNumber: 2,
        hbaRangeLabel: 'USD 70 ≤ HBA < USD 80 / Ton',
        minHba: 70,
        maxHba: 80,
        ratePercent: isLow ? 17.0 : isMed ? 20.0 : 23.0,
      },
      {
        tierNumber: 3,
        hbaRangeLabel: 'USD 80 ≤ HBA < USD 90 / Ton',
        minHba: 80,
        maxHba: 90,
        ratePercent: isLow ? 23.0 : isMed ? 25.0 : 25.0,
      },
      {
        tierNumber: 4,
        hbaRangeLabel: 'USD 90 ≤ HBA < USD 100 / Ton',
        minHba: 90,
        maxHba: 100,
        ratePercent: isLow ? 25.0 : isMed ? 27.0 : 27.0,
      },
      {
        tierNumber: 5,
        hbaRangeLabel: 'HBA ≥ USD 100 / Ton',
        minHba: 100,
        maxHba: null,
        ratePercent: 28.0,
      },
    ];

    return tiers.map((t) => {
      const isActive =
        t.maxHba === null
          ? activePriceUsd >= t.minHba
          : activePriceUsd >= t.minHba && activePriceUsd < t.maxHba;
      return { ...t, isActive };
    });
  }

  // IUP PP 26/2022 Tiers
  const isLow = calorificValueGar < 4200;
  const isMed = calorificValueGar >= 4200 && calorificValueGar <= 5200;

  const tiers = [
    {
      tierNumber: 1,
      hbaRangeLabel: 'HBA < USD 70 / Ton',
      minHba: 0,
      maxHba: 70,
      ratePercent: isLow ? 5.0 : isMed ? 6.0 : 8.0,
    },
    {
      tierNumber: 2,
      hbaRangeLabel: 'USD 70 ≤ HBA ≤ USD 90 / Ton',
      minHba: 70,
      maxHba: 90,
      ratePercent: isLow ? 6.0 : isMed ? 8.5 : 10.5,
    },
    {
      tierNumber: 3,
      hbaRangeLabel: 'USD 90 < HBA ≤ USD 110 / Ton',
      minHba: 90.01,
      maxHba: 110,
      ratePercent: isLow ? 7.0 : isMed ? 9.5 : 12.0,
    },
    {
      tierNumber: 4,
      hbaRangeLabel: 'HBA > USD 110 / Ton',
      minHba: 110.01,
      maxHba: null,
      ratePercent: isLow ? 8.0 : isMed ? 10.5 : 13.5,
    },
  ];

  return tiers.map((t) => {
    let isActive = false;
    if (t.tierNumber === 1 && activePriceUsd < 70) isActive = true;
    else if (t.tierNumber === 2 && activePriceUsd >= 70 && activePriceUsd <= 90) isActive = true;
    else if (t.tierNumber === 3 && activePriceUsd > 90 && activePriceUsd <= 110) isActive = true;
    else if (t.tierNumber === 4 && activePriceUsd > 110) isActive = true;

    return { ...t, isActive };
  });
}

/**
 * Kalkulasi Lengkap & Rinci Beban Pajak Royalti Progresif ESDM (PP 26/2022 & PP 15/2022)
 */
export function calculateProgressiveRoyaltyBreakdown(
  reserves: MineReserve,
  financials: FinancialParameters
): ProgressiveRoyaltyBreakdown {
  const permitType = financials.miningPermitType || 'IUP';
  const regulatoryBasis =
    permitType === 'IUPK'
      ? 'PP No. 15 Tahun 2022 (IUPK Kelanjutan Operasi PKP2B)'
      : 'PP No. 26 Tahun 2022 (IUP Operasi Produksi Terbuka)';

  const calorificValueGar = reserves.calorificValueGar || 5100;
  const calorieCategoryName = getCalorieCategoryName(calorificValueGar);
  const marketPriceUsd = financials.coalPriceUsdPerTon || 86;
  const dmoPriceCapUsd = financials.dmoPriceCapUsdPerTon || 70;
  const effectiveDmoPriceUsd = Math.min(marketPriceUsd, dmoPriceCapUsd);

  const dmoObligationPercent = financials.dmoObligationPercent ?? 25;
  const exportFractionPercent = 100 - dmoObligationPercent;

  const blendedCoalPriceUsd = calculateBlendedCoalPrice(
    marketPriceUsd,
    dmoObligationPercent,
    dmoPriceCapUsd
  );

  // Progressive rates
  const exportRoyaltyRatePercent = calculateRoyaltyRatePercent(
    marketPriceUsd,
    calorificValueGar,
    permitType
  );
  const dmoRoyaltyRatePercent = calculateRoyaltyRatePercent(
    effectiveDmoPriceUsd,
    calorificValueGar,
    permitType
  );

  // Production and revenue breakdown
  const annualProductionTon = reserves.targetAnnualProductionMt * 1_000_000;
  const annualExportCoalTon = annualProductionTon * (exportFractionPercent / 100);
  const annualDmoCoalTon = annualProductionTon * (dmoObligationPercent / 100);

  const annualExportRevenueUsd = annualExportCoalTon * marketPriceUsd;
  const annualDmoRevenueUsd = annualDmoCoalTon * effectiveDmoPriceUsd;
  const annualGrossRevenueUsd = annualExportRevenueUsd + annualDmoRevenueUsd;

  // Royalty amounts
  const annualExportRoyaltyUsd = annualExportRevenueUsd * (exportRoyaltyRatePercent / 100);
  const annualDmoRoyaltyUsd = annualDmoRevenueUsd * (dmoRoyaltyRatePercent / 100);
  const annualTotalRoyaltyUsd = annualExportRoyaltyUsd + annualDmoRoyaltyUsd;

  const exchangeRate = financials.currencyExchangeRateIdrUsd || 15850;
  const annualTotalRoyaltyIdr = annualTotalRoyaltyUsd * exchangeRate;

  // Effective blended rate
  const effectiveBlendedRoyaltyRatePercent =
    annualGrossRevenueUsd > 0 ? (annualTotalRoyaltyUsd / annualGrossRevenueUsd) * 100 : 0;

  // PNBP Iuran Tetap (Dead Rent / Land Rent)
  const concessionAreaHa = financials.concessionAreaHa || 2850;
  const deadRentRateUsdPerHa = financials.deadRentRateUsdPerHa ?? 4.0; // ~$4/Ha/thn (~Rp 60.000/Ha)
  const annualDeadRentUsd = concessionAreaHa * deadRentRateUsdPerHa;
  const annualDeadRentIdr = annualDeadRentUsd * exchangeRate;

  const annualTotalPnbpObligationUsd = annualTotalRoyaltyUsd + annualDeadRentUsd;
  const annualTotalPnbpObligationIdr = annualTotalPnbpObligationUsd * exchangeRate;

  // Per ton metrics
  const exportRoyaltyUsdPerTon =
    annualExportCoalTon > 0 ? annualExportRoyaltyUsd / annualExportCoalTon : 0;
  const dmoRoyaltyUsdPerTon =
    annualDmoCoalTon > 0 ? annualDmoRoyaltyUsd / annualDmoCoalTon : 0;
  const blendedRoyaltyUsdPerTon =
    annualProductionTon > 0 ? annualTotalRoyaltyUsd / annualProductionTon : 0;
  const deadRentUsdPerTon =
    annualProductionTon > 0 ? annualDeadRentUsd / annualProductionTon : 0;
  const totalPnbpUsdPerTon = blendedRoyaltyUsdPerTon + deadRentUsdPerTon;

  // Active tiers
  const allTiersForCalorie = getProgressiveRoyaltyTiers(
    calorificValueGar,
    permitType,
    marketPriceUsd
  );
  const activeExportTier = allTiersForCalorie.find((t) => t.isActive);
  const activeExportTierLabel = activeExportTier
    ? `${activeExportTier.hbaRangeLabel} (${activeExportTier.ratePercent}%)`
    : `Tarif ${exportRoyaltyRatePercent}%`;

  const dmoTiers = getProgressiveRoyaltyTiers(
    calorificValueGar,
    permitType,
    effectiveDmoPriceUsd
  );
  const activeDmoTier = dmoTiers.find((t) => t.isActive);
  const activeDmoTierLabel = activeDmoTier
    ? `${activeDmoTier.hbaRangeLabel} (${activeDmoTier.ratePercent}%)`
    : `Tarif DMO ${dmoRoyaltyRatePercent}%`;

  // Dana Bagi Hasil (DBH) PNBP Distribution (UU No. 1/2022 HKPD & PP 26/2022)
  // 20% Pemerintah Pusat, 80% Daerah (Provinsi 16%, Kab Penghasil 32%, Kab Pemerataan 32%)
  const centralGovShareUsd = annualTotalRoyaltyUsd * 0.20;
  const provincialGovShareUsd = annualTotalRoyaltyUsd * 0.16;
  const producingRegencyShareUsd = annualTotalRoyaltyUsd * 0.32;
  const surroundingRegencyShareUsd = annualTotalRoyaltyUsd * 0.32;

  // Sensitivity Tiers simulation across representative prices
  const simulatedPricePoints = [
    { price: 65, label: 'Downturn Siklus Lemah ($65)' },
    { price: 78, label: 'Pasar Moderat Bawah ($78)' },
    { price: marketPriceUsd, label: `Asumsi Saat Ini ($${marketPriceUsd})` },
    { price: 102, label: 'Lonjakan Permintaan ($102)' },
    { price: 125, label: 'Supercycle Boom ($125)' },
  ];

  const sensitivityTiers = simulatedPricePoints.map((pt) => {
    const simRate = calculateRoyaltyRatePercent(pt.price, calorificValueGar, permitType);
    const simDmoPrice = Math.min(pt.price, dmoPriceCapUsd);
    const simDmoRate = calculateRoyaltyRatePercent(simDmoPrice, calorificValueGar, permitType);
    const simBlendedPrice =
      (exportFractionPercent / 100) * pt.price + (dmoObligationPercent / 100) * simDmoPrice;
    const simRoyaltyPerTon =
      (exportFractionPercent / 100) * pt.price * (simRate / 100) +
      (dmoObligationPercent / 100) * simDmoPrice * (simDmoRate / 100);
    const simAnnualRoyalty = simRoyaltyPerTon * annualProductionTon;

    return {
      simulatedPriceUsd: pt.price,
      scenarioLabel: pt.label,
      ratePercent: Number(((simRoyaltyPerTon / simBlendedPrice) * 100).toFixed(2)),
      royaltyUsdPerTon: Number(simRoyaltyPerTon.toFixed(2)),
      annualRoyaltyUsd: Math.round(simAnnualRoyalty),
    };
  });

  return {
    permitType,
    regulatoryBasis,
    calorificValueGar,
    calorieCategoryName,
    marketPriceUsd,
    effectiveDmoPriceUsd,
    blendedCoalPriceUsd,
    dmoObligationPercent,
    exportFractionPercent,
    exportRoyaltyRatePercent,
    dmoRoyaltyRatePercent,
    effectiveBlendedRoyaltyRatePercent: Number(effectiveBlendedRoyaltyRatePercent.toFixed(2)),
    activeExportTierLabel,
    activeDmoTierLabel,
    allTiersForCalorie,
    exportRoyaltyUsdPerTon,
    dmoRoyaltyUsdPerTon,
    blendedRoyaltyUsdPerTon,
    deadRentUsdPerTon,
    totalPnbpUsdPerTon,
    annualProductionTon,
    annualExportCoalTon,
    annualDmoCoalTon,
    annualExportRevenueUsd,
    annualDmoRevenueUsd,
    annualGrossRevenueUsd,
    annualExportRoyaltyUsd,
    annualDmoRoyaltyUsd,
    annualTotalRoyaltyUsd,
    annualTotalRoyaltyIdr,
    concessionAreaHa,
    deadRentRateUsdPerHa,
    annualDeadRentUsd,
    annualDeadRentIdr,
    annualTotalPnbpObligationUsd,
    annualTotalPnbpObligationIdr,
    centralGovShareUsd,
    provincialGovShareUsd,
    producingRegencyShareUsd,
    surroundingRegencyShareUsd,
    sensitivityTiers,
  };
}

/**
 * Menghitung Blended Coal Price berdasarkan kewajiban DMO (Kepmen ESDM No. 58.K/2022)
 */
export function calculateBlendedCoalPrice(
  marketPriceUsd: number,
  dmoPercent: number,
  dmoPriceCapUsd: number
): number {
  const exportPercent = (100 - dmoPercent) / 100;
  const dmoFraction = dmoPercent / 100;
  const effectiveDmoPrice = Math.min(marketPriceUsd, dmoPriceCapUsd);
  return exportPercent * marketPriceUsd + dmoFraction * effectiveDmoPrice;
}

/**
 * Kalkulasi Presisi Operasional Alat Berat, Siklus Kerja Dinamis, Degradasi Keausan,
 * Hambatan Cuaca, dan Pemisahan Biaya Kegiatan (Activity-Based Costing)
 */
export function calculateOperationalMetrics(
  reserves: MineReserve,
  location: LocationAndRoadParams,
  weather: WeatherAndCorrectionParams,
  equipments: HeavyEquipmentUnit[],
  financials?: FinancialParameters
): OperationalCalculations {
  // Exchange rate & default rates fallback
  const exchangeRate = financials?.currencyExchangeRateIdrUsd || 15800;
  const fuelPriceUsd = financials?.industrialFuelPriceUsdPerLiter || 1.05;

  // 1. Waktu Kerja Kalender & Efektif (Standar Industri ESDM)
  const totalCalendarHours =
    weather.scheduledWorkingDaysPerYear *
    weather.workingShiftsPerDay *
    weather.scheduledHoursPerShift; // 365 * 2 * 12 = 8,760 jam/thn

  const monthlyDelayHours =
    weather.rainDelayHoursPerMonth +
    weather.slipperyDelayHoursPerMonth +
    weather.fogAndSafetyDelayHoursPerMonth +
    (weather.dewateringDelayHoursPerMonth || 20);
  const annualDelayHours = monthlyDelayHours * 12;
  const weatherDelayPercentage = (annualDelayHours / totalCalendarHours) * 100;

  // Compound efficiency: General Job Efficiency * Operator Skill * Night Shift Fatigue Factor
  const shiftFatigue = weather.nightShiftFatigueFactor || 0.95;
  const compoundEfficiency = weather.jobEfficiencyFactor * weather.operatorSkillFactor * shiftFatigue;

  const effectiveWorkingHoursPerYear = Math.max(
    0,
    (totalCalendarHours - annualDelayHours) * compoundEfficiency
  );
  const effectiveWorkingHoursPerMonth = effectiveWorkingHoursPerYear / 12;

  // 2. Filter equipment fleets
  const obExcavator = equipments.find((e) => e.type === 'EXCAVATOR_OB') || equipments[0];
  const obHauler = equipments.find((e) => e.type === 'HAULER_OB') || equipments[1];
  const coalExcavator =
    equipments.find((e) => e.type === 'EXCAVATOR_COAL') || equipments[2] || equipments[0];
  const coalHauler =
    equipments.find((e) => e.type === 'HAULER_COAL') || equipments[3] || equipments[1];
  const dozer = equipments.find((e) => e.type === 'SUPPORT_DOZER') || equipments[4];
  const grader = equipments.find((e) => e.type === 'SUPPORT_GRADER') || equipments[5];

  // Helper: Model Simulasi Kinerja Dinamis (Keausan, MTBF, MTTR, PM schedule)
  const calcDynamicUnitPerformance = (eq: HeavyEquipmentUnit) => {
    const wear = eq.wearAndTearPercent || 12;
    const baseW = eq.workingHoursW || 450;
    const baseS = eq.idleHoursS || 80;

    // Preventive Maintenance (PM) per bulan
    const pmInterval = eq.preventiveMaintenanceIntervalHours || 250;
    const pmEventsPerMonth = Math.max(1, baseW / pmInterval);
    const scheduledPmHours = pmEventsPerMonth * 16; // Rata-rata 16 jam per PM servis berkala

    // Unscheduled Breakdowns (Korektif) dari MTBF & MTTR
    // Keausan memperpendek MTBF efektif dan memperpanjang MTTR
    const mtbf = Math.max(50, (eq.meanTimeBetweenFailuresHours || 135) * (1 - (wear / 100) * 0.4));
    const mttr = (eq.meanTimeToRepairHours || 5.0) * (1 + (wear / 100) * 0.35);
    const failureCountPerMonth = baseW / mtbf;
    const unscheduledRepairHours = failureCountPerMonth * mttr;

    const dynamicRepairHoursR = Math.round(scheduledPmHours + unscheduledRepairHours);
    const dynamicW = Math.max(200, 720 - baseS - dynamicRepairHoursR);
    const total = dynamicW + baseS + dynamicRepairHoursR || 1;

    // Availability formulas baku ESDM / AS 2528
    const ma = (dynamicW / (dynamicW + dynamicRepairHoursR || 1)) * 100;
    const pa = ((dynamicW + baseS) / total) * 100;
    const ua = (dynamicW / (dynamicW + baseS || 1)) * 100;
    const eu = (dynamicW / total) * 100;

    // Degradasi performa mekanik: keausan menurunkan kecepatan siklus dan menambah konsumsi fuel
    const speedDegradationFactor = Math.max(0.75, 1 - (wear / 100) * 0.28);
    const fuelSurgeFactor = 1 + (wear / 100) * 0.18;

    return {
      ma,
      pa,
      ua,
      eu,
      dynamicW,
      dynamicR: dynamicRepairHoursR,
      scheduledPmHours,
      unscheduledRepairHours,
      speedDegradationFactor,
      fuelSurgeFactor,
    };
  };

  const obExcPerf = calcDynamicUnitPerformance(obExcavator);
  const obHlPerf = calcDynamicUnitPerformance(obHauler);
  const coalExcPerf = calcDynamicUnitPerformance(coalExcavator);
  const coalHlPerf = calcDynamicUnitPerformance(coalHauler);

  // 3. Hambatan Jalan & Kondisi Lumpur (Total Resistance)
  const baseRR = location.rollingResistancePercent || 3.5;
  const mudSurge = weather.mudRollingResistanceSurgePercent || 2.0;
  const effectiveRollingResistance =
    location.soilCondition === 'LUNAK_BECEK' ? baseRR + mudSurge : baseRR;
  const totalResistanceLoaded = effectiveRollingResistance + (location.roadGradePercent || 6.0);
  const totalResistanceEmpty = effectiveRollingResistance - (location.roadGradePercent || 6.0) * 0.3;

  // Kecepatan riil setelah memperhitungkan hambatan kemiringan, lumpur, dan degradasi mesin
  const trPenaltyFactor = Math.min(1.0, 10.0 / Math.max(6.0, totalResistanceLoaded));
  const retardation = location.speedRetardationDownhillFactor || 0.92;

  const actualSpeedLoadedObKmh = Math.max(
    12,
    location.averageHaulSpeedLoadedKmh * trPenaltyFactor * obHlPerf.speedDegradationFactor
  );
  const actualSpeedEmptyObKmh = Math.max(
    18,
    location.averageHaulSpeedEmptyKmh * retardation * obHlPerf.speedDegradationFactor
  );

  const actualSpeedLoadedCoalKmh = Math.max(
    15,
    (location.averageHaulSpeedLoadedKmh + 4) * trPenaltyFactor * coalHlPerf.speedDegradationFactor
  );
  const actualSpeedEmptyCoalKmh = Math.max(
    22,
    (location.averageHaulSpeedEmptyKmh + 6) * retardation * coalHlPerf.speedDegradationFactor
  );

  // 4. Perhitungan Granular Siklus Kerja (Cycle Time Breakdown) - OB Fleet
  const baseObExcCycleSec = Math.max(16, obExcavator.digCycleTimeSec || 26);
  // Koreksi siklus loader: dipengaruhi keterampilan operator, pengisian bucket, dan keausan alat
  const obExcavatorCycleSec =
    (baseObExcCycleSec / weather.operatorSkillFactor) * (1 / obExcPerf.speedDegradationFactor);
  
  const obLoaderDigSec = obExcavatorCycleSec * 0.38;
  const obLoaderSwingLoadedSec = obExcavatorCycleSec * 0.24;
  const obLoaderDumpSec = obExcavatorCycleSec * 0.16;
  const obLoaderSwingEmptySec = obExcavatorCycleSec * 0.22;

  const obBucketCapacity = obExcavator.bucketOrVesselCapacity || 12;
  const obExcavatorPayPerCycleBcm =
    obBucketCapacity * weather.bucketFillFactorExcavator * reserves.swellFactorOb;
  const obExcavatorProdBcmPerHour =
    (3600 / obExcavatorCycleSec) * obExcavatorPayPerCycleBcm * (obExcPerf.eu / 100);
  const obExcavatorAnnualCapacityBcm =
    obExcavatorProdBcmPerHour * effectiveWorkingHoursPerYear * obExcavator.fleetCount;

  // Hauler OB
  const obHaulerCapacityBcm = (obHauler.bucketOrVesselCapacity || 50) * reserves.swellFactorOb;
  const passesOb = Math.max(3, Math.round(obHaulerCapacityBcm / obExcavatorPayPerCycleBcm));
  const obHaulerLoadingTimeMin = (passesOb * obExcavatorCycleSec) / 60;
  const obHaulDistKm = location.obDumpDistanceKm;
  const obHaulerHaulLoadedMin = (obHaulDistKm / actualSpeedLoadedObKmh) * 60;
  const obHaulerSpotAndDumpMin = ((obHauler.spotAndDumpingTimeSec || 75) * 0.65) / 60;
  const obHaulerReturnEmptyMin = (obHaulDistKm / actualSpeedEmptyObKmh) * 60;
  const obHaulerSpotAtLoaderMin = ((obHauler.spotAndDumpingTimeSec || 75) * 0.35) / 60;

  const obHaulerTotalCycleMin =
    obHaulerLoadingTimeMin +
    obHaulerHaulLoadedMin +
    obHaulerSpotAndDumpMin +
    obHaulerReturnEmptyMin +
    obHaulerSpotAtLoaderMin;
  const obHaulerTripsPerHour = obHaulerTotalCycleMin > 0 ? 60 / obHaulerTotalCycleMin : 0;
  const obHaulerProdBcmPerHour =
    obHaulerTripsPerHour * obHaulerCapacityBcm * (obHlPerf.eu / 100);
  const obHaulerAnnualCapacityBcm =
    obHaulerProdBcmPerHour * effectiveWorkingHoursPerYear * obHauler.fleetCount;

  const cycleTimeOB: CycleTimeBreakdown = {
    loaderDigSec: Math.round(obLoaderDigSec * 10) / 10,
    loaderSwingLoadedSec: Math.round(obLoaderSwingLoadedSec * 10) / 10,
    loaderDumpSec: Math.round(obLoaderDumpSec * 10) / 10,
    loaderSwingEmptySec: Math.round(obLoaderSwingEmptySec * 10) / 10,
    loaderTotalCycleSec: Math.round(obExcavatorCycleSec * 10) / 10,
    haulerPassesRequired: passesOb,
    haulerSpotAtLoaderSec: Math.round(obHaulerSpotAtLoaderMin * 60),
    haulerLoadingTimeMin: Math.round(obHaulerLoadingTimeMin * 100) / 100,
    haulerHaulLoadedMin: Math.round(obHaulerHaulLoadedMin * 100) / 100,
    haulerSpotAndDumpMin: Math.round(obHaulerSpotAndDumpMin * 100) / 100,
    haulerReturnEmptyMin: Math.round(obHaulerReturnEmptyMin * 100) / 100,
    haulerTotalCycleMin: Math.round(obHaulerTotalCycleMin * 100) / 100,
    haulerTripsPerHour: Math.round(obHaulerTripsPerHour * 100) / 100,
  };

  // 5. Perhitungan Granular Siklus Kerja (Coal Fleet)
  const baseCoalExcCycleSec = Math.max(16, coalExcavator.digCycleTimeSec || 23);
  const coalExcCycleSec =
    (baseCoalExcCycleSec / weather.operatorSkillFactor) * (1 / coalExcPerf.speedDegradationFactor);

  const coalLoaderDigSec = coalExcCycleSec * 0.38;
  const coalLoaderSwingLoadedSec = coalExcCycleSec * 0.24;
  const coalLoaderDumpSec = coalExcCycleSec * 0.16;
  const coalLoaderSwingEmptySec = coalExcCycleSec * 0.22;

  const coalBucketCapacity = coalExcavator.bucketOrVesselCapacity || 5.5;
  const coalExcPayPerCycleTon =
    coalBucketCapacity *
    weather.bucketFillFactorExcavator *
    reserves.insituDensityCoal *
    reserves.swellFactorCoal;
  const coalExcProdTonPerHour =
    (3600 / coalExcCycleSec) * coalExcPayPerCycleTon * (coalExcPerf.eu / 100);
  const coalExcAnnualCapacityTon =
    coalExcProdTonPerHour * effectiveWorkingHoursPerYear * coalExcavator.fleetCount;

  // Hauler Batubara
  const coalHaulerVesselTon = coalHauler.bucketOrVesselCapacity || 32;
  const passesCoal = Math.max(3, Math.round(coalHaulerVesselTon / coalExcPayPerCycleTon));
  const coalHaulerLoadingTimeMin = (passesCoal * coalExcCycleSec) / 60;
  const coalHaulDistKm = location.coalHaulDistanceKm;
  const coalHaulerHaulLoadedMin = (coalHaulDistKm / actualSpeedLoadedCoalKmh) * 60;
  const coalHaulerSpotAndDumpMin = ((coalHauler.spotAndDumpingTimeSec || 90) * 0.65) / 60;
  const coalHaulerReturnEmptyMin = (coalHaulDistKm / actualSpeedEmptyCoalKmh) * 60;
  const coalHaulerSpotAtLoaderMin = ((coalHauler.spotAndDumpingTimeSec || 90) * 0.35) / 60;

  const coalHaulerTotalCycleMin =
    coalHaulerLoadingTimeMin +
    coalHaulerHaulLoadedMin +
    coalHaulerSpotAndDumpMin +
    coalHaulerReturnEmptyMin +
    coalHaulerSpotAtLoaderMin;
  const coalHaulerTripsPerHour = coalHaulerTotalCycleMin > 0 ? 60 / coalHaulerTotalCycleMin : 0;
  const coalHaulerProdTonPerHour =
    coalHaulerTripsPerHour * coalHaulerVesselTon * (coalHlPerf.eu / 100);
  const coalHaulerAnnualCapacityTon =
    coalHaulerProdTonPerHour * effectiveWorkingHoursPerYear * coalHauler.fleetCount;

  const cycleTimeCoal: CycleTimeBreakdown = {
    loaderDigSec: Math.round(coalLoaderDigSec * 10) / 10,
    loaderSwingLoadedSec: Math.round(coalLoaderSwingLoadedSec * 10) / 10,
    loaderDumpSec: Math.round(coalLoaderDumpSec * 10) / 10,
    loaderSwingEmptySec: Math.round(coalLoaderSwingEmptySec * 10) / 10,
    loaderTotalCycleSec: Math.round(coalExcCycleSec * 10) / 10,
    haulerPassesRequired: passesCoal,
    haulerSpotAtLoaderSec: Math.round(coalHaulerSpotAtLoaderMin * 60),
    haulerLoadingTimeMin: Math.round(coalHaulerLoadingTimeMin * 100) / 100,
    haulerHaulLoadedMin: Math.round(coalHaulerHaulLoadedMin * 100) / 100,
    haulerSpotAndDumpMin: Math.round(coalHaulerSpotAndDumpMin * 100) / 100,
    haulerReturnEmptyMin: Math.round(coalHaulerReturnEmptyMin * 100) / 100,
    haulerTotalCycleMin: Math.round(coalHaulerTotalCycleMin * 100) / 100,
    haulerTripsPerHour: Math.round(coalHaulerTripsPerHour * 100) / 100,
  };

  // 6. Match Factor Formula (Standar Industri Pertambangan)
  // MF = (N_truck * C_loader) / (N_loader * C_truck)
  const matchFactorOB =
    obHauler.fleetCount * obHaulerLoadingTimeMin > 0 &&
    obExcavator.fleetCount * obHaulerTotalCycleMin > 0
      ? (obHauler.fleetCount * obHaulerLoadingTimeMin) /
        (obExcavator.fleetCount * obHaulerTotalCycleMin)
      : 1.0;

  const matchFactorCoal =
    coalHauler.fleetCount * coalHaulerLoadingTimeMin > 0 &&
    coalExcavator.fleetCount * coalHaulerTotalCycleMin > 0
      ? (coalHauler.fleetCount * coalHaulerLoadingTimeMin) /
        (coalExcavator.fleetCount * coalHaulerTotalCycleMin)
      : 1.0;

  const getMfStatus = (mf: number): 'TRUCK_QUEUE' | 'OPTIMAL' | 'LOADER_IDLE' => {
    if (mf < 0.94) return 'LOADER_IDLE';
    if (mf > 1.06) return 'TRUCK_QUEUE';
    return 'OPTIMAL';
  };

  // 7. Target vs Realisasi Armada
  const annualCoalTargetTon = reserves.targetAnnualProductionMt * 1_000_000;
  const annualObTargetBcm = annualCoalTargetTon * reserves.plannedStrippingRatio;

  const annualObActualFleetBcm = Math.min(obExcavatorAnnualCapacityBcm, obHaulerAnnualCapacityBcm);
  const annualCoalActualFleetTon = Math.min(
    coalExcAnnualCapacityTon,
    coalHaulerAnnualCapacityTon
  );

  const obProductionAchievementPercent =
    annualObTargetBcm > 0 ? (annualObActualFleetBcm / annualObTargetBcm) * 100 : 0;
  const coalProductionAchievementPercent =
    annualCoalTargetTon > 0 ? (annualCoalActualFleetTon / annualCoalTargetTon) * 100 : 0;

  // 8. Fuel Burn Rate & Ratios
  let totalAnnualFuelLiters = 0;
  equipments.forEach((eq) => {
    const wear = eq.wearAndTearPercent || 12;
    const fuelSurge = 1 + (wear / 100) * 0.18;
    const hoursPerYear = effectiveWorkingHoursPerYear;
    totalAnnualFuelLiters += eq.fuelBurnRateLph * fuelSurge * hoursPerYear * eq.fleetCount;
  });

  const fuelRatioLiterPerTonCoal =
    annualCoalActualFleetTon > 0 ? totalAnnualFuelLiters / annualCoalActualFleetTon : 0;
  const fuelRatioLiterPerBcmOb =
    annualObActualFleetBcm > 0 ? totalAnnualFuelLiters / annualObActualFleetBcm : 0;

  // 9. Activity-Based Costing (ABC) Model - Pemisahan Biaya Per Kegiatan Operasional
  const obRateUsd = financials?.obMiningContractorRateUsdPerBcm || 2.35;
  const coalRateUsd = financials?.coalMiningContractorRateUsdPerTon || 1.6;
  const haulRatePerTonKmUsd = financials?.coalHaulingUsdPerTonKm || 0.08;
  const coalHaulRateUsd = haulRatePerTonKmUsd * location.coalHaulDistanceKm;
  const crushingRateUsd = financials?.coalCrushingAndHandlingUsdPerTon || 1.2;
  const bargingRateUsd = financials?.bargingAndTranshipmentUsdPerTon || 4.5;
  const portRateUsd = financials?.portHandlingAndSurveyorUsdPerTon || 1.1;
  const reclamationRateUsd = financials?.reclamationAndMineClosureUsdPerTon || 0.8;
  const genAdminAnnual = financials?.generalAndAdminAnnualUsd || 1200000;
  const genAdminPerTonUsd = annualCoalTargetTon > 0 ? genAdminAnnual / annualCoalTargetTon : 0.48;

  const coalPrice = financials?.coalPriceUsdPerTon || 86;
  const permitType = financials?.miningPermitType || 'IUP';
  const progressiveRoyalty = calculateProgressiveRoyaltyBreakdown(
    reserves,
    financials || {
      currencyExchangeRateIdrUsd: 15850,
      coalPriceUsdPerTon: coalPrice,
      industrialFuelPriceUsdPerLiter: 1.05,
      discountRateWaccPercent: 11.5,
      inflationRatePercent: 3.5,
      corporateTaxRatePercent: 22,
      dmoObligationPercent: 25,
      dmoPriceCapUsdPerTon: 70,
      miningPermitType: 'IUP',
      concessionAreaHa: 2850,
      deadRentRateUsdPerHa: 4.0,
      applyDeadRentInCashFlow: true,
      capexExplorationAndPermittingUsd: 2800000,
      capexLandAcquisitionUsd: 6500000,
      capexHaulingRoadAndInfrastructureUsd: 9200000,
      capexPortAndJettyFacilityUsd: 7500000,
      capexCampAndWorkshopUsd: 3200000,
      capexEquipmentFleetPurchasedUsd: 2100000,
      capexContingencyPercent: 8,
      obMiningContractorRateUsdPerBcm: 2.25,
      coalMiningContractorRateUsdPerTon: 1.55,
      coalCrushingAndHandlingUsdPerTon: 1.15,
      coalHaulingUsdPerTonKm: 0.085,
      bargingAndTranshipmentUsdPerTon: 4.5,
      portHandlingAndSurveyorUsdPerTon: 1.1,
      generalAndAdminAnnualUsd: 1200000,
      reclamationAndMineClosureUsdPerTon: 0.8,
    }
  );
  const royaltyPerTonUsd = progressiveRoyalty.totalPnbpUsdPerTon;

  // Pit Support, Dewatering, & Haul Road maintenance per Ton
  const pitSupportPerTonUsd = 0.95;

  // Total OB cost converted per ton batubara = obRate * SR
  const obCostPerTonCoal = obRateUsd * reserves.plannedStrippingRatio;

  const totalFobCashCostPerTonUsd =
    obCostPerTonCoal +
    coalRateUsd +
    coalHaulRateUsd +
    pitSupportPerTonUsd +
    crushingRateUsd +
    portRateUsd +
    bargingRateUsd +
    royaltyPerTonUsd +
    reclamationRateUsd +
    genAdminPerTonUsd;

  const makeCostItem = (
    name: string,
    unit: string,
    volume: number,
    rateUsd: number,
    costComponentBreakdown: {
      equipmentDepreciationPercent: number;
      fuelConsumptionPercent: number;
      maintenanceAndPartsPercent: number;
      operatorLaborPercent: number;
      supportFleetSharePercent: number;
    },
    isPerTonCostEquivalent: number
  ) => {
    const rateIdr = Math.round(rateUsd * exchangeRate);
    const annualTotalUsd = volume * rateUsd;
    const annualTotalIdr = annualTotalUsd * exchangeRate;
    const sharePercent =
      totalFobCashCostPerTonUsd > 0
        ? (isPerTonCostEquivalent / totalFobCashCostPerTonUsd) * 100
        : 0;
    return {
      activityName: name,
      unit,
      volume,
      rateUsd,
      rateIdr,
      annualTotalUsd,
      annualTotalIdr,
      shareOfFobCostPercent: Math.round(sharePercent * 10) / 10,
      costComponentBreakdown,
    };
  };

  const activityCosting: ActivityBasedCosting = {
    obRemoval: makeCostItem(
      'Overburden (OB) Removal & Disposal',
      'BCM',
      annualObTargetBcm,
      obRateUsd,
      {
        equipmentDepreciationPercent: 28,
        fuelConsumptionPercent: 36,
        maintenanceAndPartsPercent: 18,
        operatorLaborPercent: 10,
        supportFleetSharePercent: 8,
      },
      obCostPerTonCoal
    ),
    coalGetting: makeCostItem(
      'Coal Getting (Cleaning & Mining)',
      'Ton',
      annualCoalTargetTon,
      coalRateUsd,
      {
        equipmentDepreciationPercent: 30,
        fuelConsumptionPercent: 25,
        maintenanceAndPartsPercent: 20,
        operatorLaborPercent: 15,
        supportFleetSharePercent: 10,
      },
      coalRateUsd
    ),
    coalHauling: {
      ...makeCostItem(
        'Coal Hauling (Pit ke ROM / Jetty Port)',
        'Ton',
        annualCoalTargetTon,
        coalHaulRateUsd,
        {
          equipmentDepreciationPercent: 26,
          fuelConsumptionPercent: 40,
          maintenanceAndPartsPercent: 22,
          operatorLaborPercent: 12,
          supportFleetSharePercent: 0,
        },
        coalHaulRateUsd
      ),
      rateUsdPerTonKm: haulRatePerTonKmUsd,
      rateIdrPerTonKm: Math.round(haulRatePerTonKmUsd * exchangeRate),
    },
    pitSupportAndDewatering: makeCostItem(
      'Pit Support, Dewatering Sump & Haul Road Maintenance',
      'Ton',
      annualCoalTargetTon,
      pitSupportPerTonUsd,
      {
        equipmentDepreciationPercent: 22,
        fuelConsumptionPercent: 42,
        maintenanceAndPartsPercent: 24,
        operatorLaborPercent: 12,
        supportFleetSharePercent: 0,
      },
      pitSupportPerTonUsd
    ),
    crushingStockpilePort: makeCostItem(
      'Crushing, Stockpile Management & Jetty Facility',
      'Ton',
      annualCoalTargetTon,
      crushingRateUsd + portRateUsd,
      {
        equipmentDepreciationPercent: 32,
        fuelConsumptionPercent: 28,
        maintenanceAndPartsPercent: 25,
        operatorLaborPercent: 15,
        supportFleetSharePercent: 0,
      },
      crushingRateUsd + portRateUsd
    ),
    bargingTranshipment: makeCostItem(
      'Barging (Tongkang) & Transhipment Mother Vessel',
      'Ton',
      annualCoalTargetTon,
      bargingRateUsd,
      {
        equipmentDepreciationPercent: 24,
        fuelConsumptionPercent: 46,
        maintenanceAndPartsPercent: 16,
        operatorLaborPercent: 14,
        supportFleetSharePercent: 0,
      },
      bargingRateUsd
    ),
    royaltyPnbp: makeCostItem(
      permitType === 'IUPK'
        ? 'Royalti & Iuran PNBP ESDM (PP 15/2022 IUPK)'
        : 'Royalti & Iuran PNBP ESDM (PP 26/2022 IUP)',
      'Ton',
      annualCoalTargetTon,
      royaltyPerTonUsd,
      {
        equipmentDepreciationPercent: 0,
        fuelConsumptionPercent: 0,
        maintenanceAndPartsPercent: 0,
        operatorLaborPercent: 0,
        supportFleetSharePercent: 0,
      },
      royaltyPerTonUsd
    ),
    reclamationAndClosure: makeCostItem(
      'Jaminan Reklamasi & Rencana Pascatambang (ESDM)',
      'Ton',
      annualCoalTargetTon,
      reclamationRateUsd,
      {
        equipmentDepreciationPercent: 15,
        fuelConsumptionPercent: 35,
        maintenanceAndPartsPercent: 15,
        operatorLaborPercent: 15,
        supportFleetSharePercent: 20,
      },
      reclamationRateUsd
    ),
    generalAdminOverhead: makeCostItem(
      'General & Administrative (G&A) Overhead',
      'Ton',
      annualCoalTargetTon,
      genAdminPerTonUsd,
      {
        equipmentDepreciationPercent: 10,
        fuelConsumptionPercent: 10,
        maintenanceAndPartsPercent: 10,
        operatorLaborPercent: 60,
        supportFleetSharePercent: 10,
      },
      genAdminPerTonUsd
    ),
    totalFobCashCostUsdPerTon: Math.round(totalFobCashCostPerTonUsd * 100) / 100,
    totalFobCashCostIdrPerTon: Math.round(totalFobCashCostPerTonUsd * exchangeRate),
    totalFobAnnualUsd: annualCoalTargetTon * totalFobCashCostPerTonUsd,
    totalFobAnnualIdr: annualCoalTargetTon * totalFobCashCostPerTonUsd * exchangeRate,
  };

  return {
    effectiveWorkingHoursPerYear,
    effectiveWorkingHoursPerMonth,
    weatherDelayPercentage,
    dewateringDelayHours: weather.dewateringDelayHoursPerMonth || 20,
    obExcavatorMA: obExcPerf.ma,
    obExcavatorPA: obExcPerf.pa,
    obExcavatorUA: obExcPerf.ua,
    obExcavatorEU: obExcPerf.eu,
    obHaulerMA: obHlPerf.ma,
    obHaulerPA: obHlPerf.pa,
    obHaulerUA: obHlPerf.ua,
    obHaulerEU: obHlPerf.eu,
    cycleTimeOB,
    cycleTimeCoal,
    obExcavatorProductivityBcmPerHour: obExcavatorProdBcmPerHour,
    obExcavatorAnnualCapacityBcm,
    obHaulerCycleTimeMinutes: obHaulerTotalCycleMin,
    obHaulerTripsPerHour,
    obHaulerProductivityBcmPerHour: obHaulerProdBcmPerHour,
    obHaulerAnnualCapacityBcm,
    coalExcavatorProductivityTonPerHour: coalExcProdTonPerHour,
    coalExcavatorAnnualCapacityTon: coalExcAnnualCapacityTon,
    coalHaulerCycleTimeMinutes: coalHaulerTotalCycleMin,
    coalHaulerProductivityTonPerHour: coalHaulerProdTonPerHour,
    coalHaulerAnnualCapacityTon,
    matchFactorOB,
    matchFactorCoal,
    matchFactorStatusOB: getMfStatus(matchFactorOB),
    matchFactorStatusCoal: getMfStatus(matchFactorCoal),
    annualObTargetBcm,
    annualObActualFleetBcm,
    obProductionAchievementPercent,
    annualCoalTargetTon,
    annualCoalActualFleetTon,
    coalProductionAchievementPercent,
    totalAnnualFuelLiters,
    fuelRatioLiterPerTonCoal,
    fuelRatioLiterPerBcmOb,
    activityCosting,
  };
}

/**
 * Menghitung Proyeksi Cash Flow Tahunan Sepanjang Umur Tambang (Life of Mine)
 */
export function calculateCashFlows(
  reserves: MineReserve,
  location: LocationAndRoadParams,
  financials: FinancialParameters,
  operational: OperationalCalculations
): { cashFlows: AnnualCashFlow[]; results: FinancialResults } {
  const mineLife = Math.max(1, Math.min(25, reserves.mineLifeYears));
  const permitType = financials.miningPermitType || 'IUP';
  const exportFraction = (100 - (financials.dmoObligationPercent ?? 25)) / 100;
  const dmoFraction = (financials.dmoObligationPercent ?? 25) / 100;
  const marketPrice = financials.coalPriceUsdPerTon;
  const dmoCapPrice = financials.dmoPriceCapUsdPerTon || 70;
  const effectiveDmoPrice = Math.min(marketPrice, dmoCapPrice);

  const blendedPrice = calculateBlendedCoalPrice(
    marketPrice,
    financials.dmoObligationPercent ?? 25,
    dmoCapPrice
  );

  // Progressive royalty rates
  const exportRoyaltyRatePercent = calculateRoyaltyRatePercent(
    marketPrice,
    reserves.calorificValueGar,
    permitType
  );
  const dmoRoyaltyRatePercent = calculateRoyaltyRatePercent(
    effectiveDmoPrice,
    reserves.calorificValueGar,
    permitType
  );

  // PNBP Iuran Tetap Tahunan (Dead Rent)
  const concessionAreaHa = financials.concessionAreaHa || 2850;
  const deadRentRateUsdPerHa = financials.deadRentRateUsdPerHa ?? 4.0;
  const annualDeadRentPnbp =
    financials.applyDeadRentInCashFlow !== false ? concessionAreaHa * deadRentRateUsdPerHa : 0;

  // Initial Capex
  const baseCapex =
    financials.capexExplorationAndPermittingUsd +
    financials.capexLandAcquisitionUsd +
    financials.capexHaulingRoadAndInfrastructureUsd +
    financials.capexPortAndJettyFacilityUsd +
    financials.capexCampAndWorkshopUsd +
    financials.capexEquipmentFleetPurchasedUsd;
  const totalInitialCapex = baseCapex * (1 + financials.capexContingencyPercent / 100);

  // Depresiasi Garis Lurus (Straight line depreciation)
  const annualDepreciation = totalInitialCapex / mineLife;

  const cashFlows: AnnualCashFlow[] = [];
  let cumulativeCash = -totalInitialCapex;
  let totalRevenue = 0;
  let totalOpex = 0;
  let totalEbitda = 0;
  let totalNetProfit = 0;
  let totalCoalTon = 0;
  let totalLomRoyaltyPnbp = 0;
  let totalLomExportRoyalty = 0;
  let totalLomDmoRoyalty = 0;
  let totalLomDeadRent = 0;

  for (let year = 1; year <= mineLife; year++) {
    // Ramp up produksi: Tahun 1 85%, Tahun 2 95%, Tahun 3-N 100%
    let rampUpFactor = 1.0;
    if (year === 1) rampUpFactor = 0.85;
    else if (year === 2) rampUpFactor = 0.95;

    const coalProduction = reserves.targetAnnualProductionMt * 1_000_000 * rampUpFactor;
    const obStripped = coalProduction * reserves.plannedStrippingRatio;
    totalCoalTon += coalProduction;

    // Inflasi bertahap
    const inflationFactor = Math.pow(1 + financials.inflationRatePercent / 100, year - 1);

    // Revenue breakdown (Ekspor & DMO)
    const exportCoalTon = coalProduction * exportFraction;
    const dmoCoalTon = coalProduction * dmoFraction;
    const exportRevenue = exportCoalTon * marketPrice;
    const dmoRevenue = dmoCoalTon * effectiveDmoPrice;
    const grossRevenue = exportRevenue + dmoRevenue;
    totalRevenue += grossRevenue;

    // Opex items
    const obMiningCost = obStripped * financials.obMiningContractorRateUsdPerBcm * inflationFactor;
    const coalMiningCost = coalProduction * financials.coalMiningContractorRateUsdPerTon * inflationFactor;
    const coalHaulingCost =
      coalProduction *
      (financials.coalHaulingUsdPerTonKm * location.coalHaulDistanceKm) *
      inflationFactor;
    const crushingStockpileCost =
      coalProduction * financials.coalCrushingAndHandlingUsdPerTon * inflationFactor;
    const bargingTranshipmentCost =
      coalProduction * financials.bargingAndTranshipmentUsdPerTon * inflationFactor;
    const portHandlingCost =
      coalProduction * financials.portHandlingAndSurveyorUsdPerTon * inflationFactor;
    
    // Biaya bahan bakar tambahan (jika ada selisih dari asumsi kontraktor)
    const fuelCost =
      (operational.totalAnnualFuelLiters * rampUpFactor * financials.industrialFuelPriceUsdPerLiter * 0.35) *
      inflationFactor;
    
    const maintenanceCost = 850000 * rampUpFactor * inflationFactor;
    const generalAdminCost = financials.generalAndAdminAnnualUsd * inflationFactor;

    // Perhitungan Royalti Progresif ESDM (PP 26/2022 / PP 15/2022)
    const royaltyExportUsd = exportRevenue * (exportRoyaltyRatePercent / 100);
    const royaltyDmoUsd = dmoRevenue * (dmoRoyaltyRatePercent / 100);
    const deadRentYearlyUsd = annualDeadRentPnbp;
    const royaltyPnbp = royaltyExportUsd + royaltyDmoUsd + deadRentYearlyUsd;

    totalLomRoyaltyPnbp += royaltyPnbp;
    totalLomExportRoyalty += royaltyExportUsd;
    totalLomDmoRoyalty += royaltyDmoUsd;
    totalLomDeadRent += deadRentYearlyUsd;

    const effectiveRoyaltyRateYearly =
      grossRevenue > 0 ? ((royaltyExportUsd + royaltyDmoUsd) / grossRevenue) * 100 : 0;

    const reclamationReserve =
      coalProduction * financials.reclamationAndMineClosureUsdPerTon * inflationFactor;

    const yearOpex =
      obMiningCost +
      coalMiningCost +
      coalHaulingCost +
      crushingStockpileCost +
      bargingTranshipmentCost +
      portHandlingCost +
      fuelCost +
      maintenanceCost +
      generalAdminCost +
      royaltyPnbp +
      reclamationReserve;

    totalOpex += yearOpex;

    const cashCostPerTon = (yearOpex - royaltyPnbp) / coalProduction;
    const fobTotalCostPerTon = yearOpex / coalProduction;

    const ebitda = grossRevenue - yearOpex;
    totalEbitda += ebitda;

    const ebt = ebitda - annualDepreciation;
    const tax = ebt > 0 ? ebt * (financials.corporateTaxRatePercent / 100) : 0;
    const netProfitAfterTax = ebt - tax;
    totalNetProfit += netProfitAfterTax;

    const netOperatingCashFlow = ebitda - tax;
    const yearCapex = year === 1 ? 0 : year === Math.round(mineLife / 2) ? totalInitialCapex * 0.08 : 0; // Sustaining capex
    const netCashFlow = netOperatingCashFlow - yearCapex;

    const discountFactor = Math.pow(1 + financials.discountRateWaccPercent / 100, year);
    const discountedCashFlow = netCashFlow / discountFactor;
    cumulativeCash += netCashFlow;

    cashFlows.push({
      year,
      coalProductionTon: coalProduction,
      obStrippedBcm: obStripped,
      strippingRatio: reserves.plannedStrippingRatio,
      blendedCoalPriceUsd: blendedPrice,
      grossRevenueUsd: grossRevenue,
      obMiningCostUsd: obMiningCost,
      coalMiningCostUsd: coalMiningCost,
      coalHaulingCostUsd: coalHaulingCost,
      crushingStockpileCostUsd: crushingStockpileCost,
      bargingTranshipmentCostUsd: bargingTranshipmentCost,
      portHandlingCostUsd: portHandlingCost,
      fuelCostUsd: fuelCost,
      maintenanceCostUsd: maintenanceCost,
      generalAdminCostUsd: generalAdminCost,
      royaltyPnbpUsd: royaltyPnbp,
      royaltyExportUsd: royaltyExportUsd,
      royaltyDmoUsd: royaltyDmoUsd,
      deadRentPnbpUsd: deadRentYearlyUsd,
      effectiveRoyaltyRatePercent: Number(effectiveRoyaltyRateYearly.toFixed(2)),
      reclamationReserveUsd: reclamationReserve,
      totalOpexUsd: yearOpex,
      cashCostPerTonUsd: cashCostPerTon,
      fobTotalCostPerTonUsd: fobTotalCostPerTon,
      ebitdaUsd: ebitda,
      depreciationUsd: annualDepreciation,
      ebtUsd: ebt,
      taxUsd: tax,
      netProfitAfterTaxUsd: netProfitAfterTax,
      capexUsd: yearCapex,
      netCashFlowUsd: netCashFlow,
      discountedCashFlowUsd: discountedCashFlow,
      cumulativeCashFlowUsd: cumulativeCash,
    });
  }

  // NPV Calculation
  let sumDiscountedCashFlows = 0;
  cashFlows.forEach((cf) => {
    sumDiscountedCashFlows += cf.discountedCashFlowUsd;
  });
  const npv = sumDiscountedCashFlows - totalInitialCapex;

  // IRR Calculation via Newton-Raphson or Binary Search
  const calculateIrr = (): number => {
    let low = -0.5; // -50%
    let high = 2.0; // 200%
    let guess = 0.15;

    for (let i = 0; i < 60; i++) {
      let npvAtGuess = -totalInitialCapex;
      for (const cf of cashFlows) {
        npvAtGuess += cf.netCashFlowUsd / Math.pow(1 + guess, cf.year);
      }

      if (Math.abs(npvAtGuess) < 100) break;

      let npvLow = -totalInitialCapex;
      for (const cf of cashFlows) {
        npvLow += cf.netCashFlowUsd / Math.pow(1 + low, cf.year);
      }

      if (npvAtGuess > 0) {
        low = guess;
      } else {
        high = guess;
      }
      guess = (low + high) / 2;
    }
    return guess * 100;
  };

  const irrPercent = calculateIrr();

  // Payback Period (PBP)
  let paybackPeriodYears = mineLife;
  let runningCash = -totalInitialCapex;
  for (let i = 0; i < cashFlows.length; i++) {
    const prev = runningCash;
    runningCash += cashFlows[i].netCashFlowUsd;
    if (runningCash >= 0) {
      const fraction = Math.abs(prev) / cashFlows[i].netCashFlowUsd;
      paybackPeriodYears = i + fraction;
      break;
    }
  }

  const benefitCostRatio = totalInitialCapex > 0 ? sumDiscountedCashFlows / totalInitialCapex : 1;
  const profitabilityIndex = totalInitialCapex > 0 ? (npv + totalInitialCapex) / totalInitialCapex : 1;

  // Breakeven Coal Price Estimation
  // Menghitung harga batubara di mana NPV = 0
  const avgCostPerTon = totalCoalTon > 0 ? totalOpex / totalCoalTon : 60;
  const capexPerTon = totalCoalTon > 0 ? totalInitialCapex / totalCoalTon : 15;
  const breakevenCoalPriceUsd = avgCostPerTon + capexPerTon * 1.35;

  let feasibilityStatus: 'SANGAT_LAYAK' | 'LAYAK' | 'MARGINAL_BERSYARAT' | 'TIDAK_LAYAK' = 'TIDAK_LAYAK';
  if (npv > 20000000 && irrPercent >= 22 && paybackPeriodYears <= mineLife * 0.45) {
    feasibilityStatus = 'SANGAT_LAYAK';
  } else if (npv > 0 && irrPercent >= financials.discountRateWaccPercent) {
    feasibilityStatus = 'LAYAK';
  } else if (npv > -5000000 && irrPercent >= financials.discountRateWaccPercent * 0.8) {
    feasibilityStatus = 'MARGINAL_BERSYARAT';
  } else {
    feasibilityStatus = 'TIDAK_LAYAK';
  }

  const results: FinancialResults = {
    totalInitialCapexUsd: totalInitialCapex,
    totalLifeOfMineRevenueUsd: totalRevenue,
    totalLifeOfMineOpexUsd: totalOpex,
    totalLifeOfMineEbitdaUsd: totalEbitda,
    totalLifeOfMineNetProfitUsd: totalNetProfit,
    averageCashCostPerTonUsd: totalCoalTon > 0 ? (totalOpex * 0.88) / totalCoalTon : 0,
    averageFobCostPerTonUsd: totalCoalTon > 0 ? totalOpex / totalCoalTon : 0,
    averageProfitMarginPercent: totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0,
    npvUsd: npv,
    irrPercent: Math.max(-50, Math.min(250, irrPercent)),
    paybackPeriodYears: Number(paybackPeriodYears.toFixed(2)),
    benefitCostRatio: Number(benefitCostRatio.toFixed(2)),
    profitabilityIndex: Number(profitabilityIndex.toFixed(2)),
    projectFeasibilityStatus: feasibilityStatus,
    breakevenCoalPriceUsd: Number(breakevenCoalPriceUsd.toFixed(2)),
    totalLifeOfMineRoyaltyPnbpUsd: totalLomRoyaltyPnbp,
    averageRoyaltyRatePercent:
      totalRevenue > 0
        ? Number((((totalLomExportRoyalty + totalLomDmoRoyalty) / totalRevenue) * 100).toFixed(2))
        : 0,
    averageRoyaltyUsdPerTon:
      totalCoalTon > 0 ? Number((totalLomRoyaltyPnbp / totalCoalTon).toFixed(2)) : 0,
    totalLifeOfMineDeadRentUsd: totalLomDeadRent,
    totalLifeOfMineExportRoyaltyUsd: totalLomExportRoyalty,
    totalLifeOfMineDmoRoyaltyUsd: totalLomDmoRoyalty,
    regionalSharingPusatUsd: Math.round(totalLomRoyaltyPnbp * 0.20),
    regionalSharingProvinsiUsd: Math.round(totalLomRoyaltyPnbp * 0.16),
    regionalSharingKabPenghasilUsd: Math.round(totalLomRoyaltyPnbp * 0.32),
    regionalSharingKabPemerataanUsd: Math.round(totalLomRoyaltyPnbp * 0.32),
  };

  return { cashFlows, results };
}

/**
 * Analisis Sensitivitas Multidimensi terhadap Fluktuasi Pasar & Teknis
 */
export function calculateSensitivityMatrix(
  reserves: MineReserve,
  location: LocationAndRoadParams,
  financials: FinancialParameters,
  operational: OperationalCalculations
): SensitivityDataPoint[] {
  const variations = [-30, -20, -10, 0, 10, 20, 30];
  const dataPoints: SensitivityDataPoint[] = [];

  for (const pct of variations) {
    const factor = 1 + pct / 100;

    // 1. Variasi Harga Batubara
    const modFinCoal = { ...financials, coalPriceUsdPerTon: financials.coalPriceUsdPerTon * factor };
    const resCoal = calculateCashFlows(reserves, location, modFinCoal, operational);

    // 2. Variasi Harga Solar (Fuel)
    const modFinFuel = {
      ...financials,
      industrialFuelPriceUsdPerLiter: financials.industrialFuelPriceUsdPerLiter * factor,
    };
    const resFuel = calculateCashFlows(reserves, location, modFinFuel, operational);

    // 3. Variasi Stripping Ratio (SR)
    const modResSr = { ...reserves, plannedStrippingRatio: reserves.plannedStrippingRatio * factor };
    const resSr = calculateCashFlows(modResSr, location, financials, operational);

    // 4. Variasi Opex
    const modFinOpex = {
      ...financials,
      obMiningContractorRateUsdPerBcm: financials.obMiningContractorRateUsdPerBcm * factor,
      coalMiningContractorRateUsdPerTon: financials.coalMiningContractorRateUsdPerTon * factor,
      bargingAndTranshipmentUsdPerTon: financials.bargingAndTranshipmentUsdPerTon * factor,
    };
    const resOpex = calculateCashFlows(reserves, location, modFinOpex, operational);

    // 5. Variasi Capex
    const modFinCapex = {
      ...financials,
      capexHaulingRoadAndInfrastructureUsd: financials.capexHaulingRoadAndInfrastructureUsd * factor,
      capexPortAndJettyFacilityUsd: financials.capexPortAndJettyFacilityUsd * factor,
    };
    const resCapex = calculateCashFlows(reserves, location, modFinCapex, operational);

    dataPoints.push({
      changePercent: pct,
      coalPriceNpvUsd: resCoal.results.npvUsd,
      coalPriceIrrPercent: resCoal.results.irrPercent,
      fuelCostNpvUsd: resFuel.results.npvUsd,
      fuelCostIrrPercent: resFuel.results.irrPercent,
      strippingRatioNpvUsd: resSr.results.npvUsd,
      strippingRatioIrrPercent: resSr.results.irrPercent,
      opexNpvUsd: resOpex.results.npvUsd,
      opexIrrPercent: resOpex.results.irrPercent,
      capexNpvUsd: resCapex.results.npvUsd,
      capexIrrPercent: resCapex.results.irrPercent,
    });
  }

  return dataPoints;
}

/**
 * Advisory Engine Rekomendasi Strategis Manajemen oleh Senior Business Project Development Specialist
 */
export function generateStrategicRecommendations(
  reserves: MineReserve,
  location: LocationAndRoadParams,
  financials: FinancialParameters,
  operational: OperationalCalculations,
  results: FinancialResults
): StrategicRecommendation {
  let verdict: 'GO' | 'CONDITIONAL_GO' | 'NO_GO' = 'GO';
  if (results.projectFeasibilityStatus === 'TIDAK_LAYAK') {
    verdict = 'NO_GO';
  } else if (results.projectFeasibilityStatus === 'MARGINAL_BERSYARAT') {
    verdict = 'CONDITIONAL_GO';
  }

  const strengths: string[] = [];
  const risks: string[] = [];
  const actions: StrategicRecommendation['strategicActions'] = [];

  // Analisa Finansial
  if (results.npvUsd > 0 && results.irrPercent >= financials.discountRateWaccPercent) {
    strengths.push(
      `Proyeksi NPV positif USD ${(results.npvUsd / 1_000_000).toFixed(1)} Juta dengan IRR ${results.irrPercent.toFixed(1)}% melampaui hurdle rate (WACC ${financials.discountRateWaccPercent}%).`
    );
    strengths.push(
      `Payback period ${results.paybackPeriodYears.toFixed(1)} tahun tercapai jauh sebelum separuh umur tambang (${reserves.mineLifeYears} tahun).`
    );
  } else {
    risks.push(
      `Profitabilitas marjinal atau negatif di bawah asumsi harga batubara saat ini ($${financials.coalPriceUsdPerTon}/ton). Memerlukan restrukturisasi Capex & negosiasi ulang rate kontraktor.`
    );
  }

  // Analisa Fleet & Match Factor
  if (operational.matchFactorStatusOB === 'LOADER_IDLE') {
    risks.push(
      `Match Factor armada OB rendah (${operational.matchFactorOB.toFixed(2)}): Excavator mengalami idle time menunggu dump truck karena jarak buang ${location.obDumpDistanceKm} km.`
    );
    actions.push({
      category: 'FLEET',
      priority: 'HIGH',
      title: 'Penambahan Unit Hauler OB atau Relokasi In-Pit Dumping',
      description: `Armada excavator kelas 12m3 menganggur ~${((1 - operational.matchFactorOB) * 100).toFixed(0)}% dari waktu kerja. Disarankan menambah 3-4 unit rigid dump truck atau memperpendek rute dumping.`,
      actionableStep:
        'Tinjau pit design jangka pendek untuk mengalokasikan area in-pit disposal guna memangkas jarak buang OB dari 2.2 km menjadi 1.4 km.',
    });
  } else if (operational.matchFactorStatusOB === 'TRUCK_QUEUE') {
    risks.push(
      `Match Factor armada OB terlalu tinggi (${operational.matchFactorOB.toFixed(2)}): Terjadi antrian truk (truck bunching) di loading point yang memboroskan bahan bakar solar.`
    );
    actions.push({
      category: 'FLEET',
      priority: 'MEDIUM',
      title: 'Optimasi Dispatching & Re-alokasi Truk OB',
      description: 'Implementasikan Fleet Management System (FMS) dinamis untuk meredistribusi kelebihan truk ke pit batubara atau penyiapan area settling pond.',
      actionableStep: 'Audit delay time di loading pocket dan percepat double-side loading pada excavator.',
    });
  } else {
    strengths.push(
      `Keseimbangan armada OB optimal dengan Match Factor ${operational.matchFactorOB.toFixed(2)}, meminimalkan waktu tunggu dan antrian bahan bakar.`
    );
  }

  // Analisa Ketercapaian Produksi
  if (operational.obProductionAchievementPercent < 95) {
    risks.push(
      `Kapasitas terpasang armada OB hanya mampu mencapai ${operational.obProductionAchievementPercent.toFixed(1)}% dari target rencana tahunan (${(operational.annualObTargetBcm / 1_000_000).toFixed(1)} Juta BCM). Defisit berisiko mengekspos batubara terlambat.`
    );
    actions.push({
      category: 'FLEET',
      priority: 'HIGH',
      title: 'Penambahan 1 Fleet Excavator Tambahan atau Sewa Musiman',
      description: 'Dibutuhkan tambahan kapasitas kupas OB minimal 1.5 - 2.0 Juta BCM/tahun untuk menjamin kesinambungan ekspos cadangan batubara tertambang.',
      actionableStep: 'Tender sub-kontraktor lokal untuk sewa 1 fleet 90-ton class excavator selama periode cuaca kering (dry season).',
    });
  }

  // Analisa Jalan Hauling & Kemiringan
  if (location.roadGradePercent > 7.0 || location.rollingResistancePercent > 4.0) {
    risks.push(
      `Kemiringan jalan ${location.roadGradePercent}% atau rolling resistance ${location.rollingResistancePercent}% melebihi rekomendasi Kepmen ESDM 1827/2018, menaikkan fuel burn rate hingga 25%.`
    );
    actions.push({
      category: 'OPERATIONAL',
      priority: 'HIGH',
      title: 'Grade Cut & Road Resurfacing Berkala',
      description: 'Lakukan perbaikan geometri jalan angkut batubara dan pemadatan agregat batu pecah pada tanjakan kritis untuk memangkas Total Resistance (TR) menjadi < 8%.',
      actionableStep: 'Instruksikan tim civil mining untuk merestrukturisasi tikungan radius sempit dan menurunkan grade maksimal ke 6%.',
    } as any);
  }

  // Analisa Pasar & DMO
  actions.push({
    category: 'REGULATORY',
    priority: 'MEDIUM',
    title: 'Kontrak Jangka Panjang Off-Take DMO 25% dengan PLN/IPP',
    description: `Kewajiban DMO 25% (@ cap $${financials.dmoPriceCapUsdPerTon}/ton) wajib diikat kontrak sejak awal kuartal untuk mengamankan Surat Persetujuan Ekspor (SPE/PEB) bagi 75% sisa kuota pasar bebas.`,
    actionableStep: 'Ajukan alokasi pasokan ke konsorsium PLN Batubara dengan spesifikasi kalori 5.000 GAR.',
  });

  // Analisa Keuangan & Hedging
  actions.push({
    category: 'FINANCIAL',
    priority: 'MEDIUM',
    title: 'Hedging Solar Industri & Penguncian Rate Kontraktor',
    description: `Biaya bahan bakar (${operational.fuelRatioLiterPerTonCoal.toFixed(1)} Liter/Ton) dan tarif kontraktor OB menyumbang >65% total OPEX. Lindungi risiko volatilitas minyak dunia.`,
    actionableStep: 'Terapkan fuel collar hedging pada level harga $1.00 - $1.15/Liter dan formula eskalasi tarif kontraktor berbasis fuel baseline transparan.',
  });

  const execSummary =
    verdict === 'GO'
      ? `Berdasarkan evaluasi tekno-ekonomi komprehensif, Proyek ${reserves.mineName} dinyatakan SANGAT LAYAK (GO DECISION) untuk dilanjutkan ke tahap Financial Close & Eksekusi Konstruksi. Model finansial menunjukkan ketahanan kuat terhadap penurunan harga batubara hingga batas breakeven $${results.breakevenCoalPriceUsd}/ton.`
      : verdict === 'CONDITIONAL_GO'
      ? `Proyek ${reserves.mineName} berada pada level MARGINAL BERSYARAT (CONDITIONAL GO). Direksi direkomendasikan memberi persetujuan investasi bersyarat dengan klausul pemangkasan Capex infrastruktur awal minimal 12% dan renegosiasi mining contractor rate sebelum Final Investment Decision.`
      : `Proyek ${reserves.mineName} TIDAK LAYAK (NO-GO) untuk dieksekusi dengan parameter saat ini. Risiko arus kas negatif sangat tinggi jika terjadi koreksi harga batubara global. Segera lakukan redesign pit untuk memangkas stripping ratio.`;

  return {
    overallVerdict: verdict,
    executiveSummary: execSummary,
    operationalStrengths: strengths,
    operationalRisks: risks,
    strategicActions: actions,
  };
}
