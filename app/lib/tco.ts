export type VehicleClass = "small" | "medium" | "large";
export type FossilFuelType = "petrol" | "diesel";

export const DEFAULTS = {
  ownershipYears: 3,
  annualMiles: 1500,
  capitalCostRate: 0.045,
  electricity: {
    homeOrePerKwh: 180,
    publicOrePerKwh: 500,
    homeChargingSharePct: 80,
  },
  fossilFuel: {
    defaultType: "petrol" as FossilFuelType,
    petrolSekPerLiter: 18,
    dieselSekPerLiter: 19,
  },
  // Kalibrerat mot KVD (mars 2025), Teknikens Värld, omev.se, Transportstyrelsen.
  // Restvärden: bensin ~52-55%, elbil ~50-52% efter 3 år (nybil).
  // Försäkring: KVD Golf ~3 800, e-2008 ~5 300. Skatt: elbil 360 kr, fossil CO2-baserad.
  vehicleClasses: {
    small: {
      label: "Kompakt",
      fossil: {
        purchasePrice: 250_000,
        insuranceAnnual: 4_000,
        taxAnnual: 4_500,
        maintenanceFundAnnual: 7_000,
        residualValueShareAfterPeriod: 0.55,
        litersPerMileCity: 0.55,
        litersPerMileHighway: 0.48,
      },
      ev: {
        purchasePrice: 300_000,
        insuranceAnnual: 5_500,
        taxAnnual: 360,
        maintenanceFundAnnual: 3_000,
        residualValueShareAfterPeriod: 0.52,
        kwhPerMileCity: 1.75,
        kwhPerMileHighway: 1.95,
      },
    },
    medium: {
      label: "Mellanklass",
      fossil: {
        purchasePrice: 350_000,
        insuranceAnnual: 5_000,
        taxAnnual: 5_500,
        maintenanceFundAnnual: 8_000,
        residualValueShareAfterPeriod: 0.52,
        litersPerMileCity: 0.65,
        litersPerMileHighway: 0.55,
      },
      ev: {
        purchasePrice: 400_000,
        insuranceAnnual: 6_500,
        taxAnnual: 360,
        maintenanceFundAnnual: 4_000,
        residualValueShareAfterPeriod: 0.52,
        kwhPerMileCity: 1.90,
        kwhPerMileHighway: 2.10,
      },
    },
    large: {
      label: "Stor/SUV",
      fossil: {
        purchasePrice: 450_000,
        insuranceAnnual: 6_000,
        taxAnnual: 6_500,
        maintenanceFundAnnual: 10_000,
        residualValueShareAfterPeriod: 0.50,
        litersPerMileCity: 0.78,
        litersPerMileHighway: 0.68,
      },
      ev: {
        purchasePrice: 500_000,
        insuranceAnnual: 8_000,
        taxAnnual: 360,
        maintenanceFundAnnual: 5_000,
        residualValueShareAfterPeriod: 0.50,
        kwhPerMileCity: 2.10,
        kwhPerMileHighway: 2.40,
      },
    },
  },
} as const;

export interface VehicleTcoResult {
  purchasePrice: number;
  depreciationAnnual: number;
  residualValue: number;
  capitalCostAnnual: number;
  insuranceAnnual: number;
  taxAnnual: number;
  maintenanceFundAnnual: number;
  energyAnnual: number;
  annualTotal: number;
  monthlyTotal: number;
  periodTotal: number;
  costPerMile: number;
}

export interface CalculationResults {
  ownershipYears: number;
  annualMiles: number;
  vehicleClass: VehicleClass;
  vehicleClassLabel: string;
  ev: VehicleTcoResult;
  fossil: VehicleTcoResult;
  savings: { annual: number; period: number; perMile: number };
  assumptions: {
    cityPct: number;
    highwayPct: number;
    fossilFuelType: FossilFuelType;
    fossilFuelPriceSekPerLiter: number;
    electricityHomeOrePerKwh: number;
    electricityPublicOrePerKwh: number;
    assumedHomeChargingSharePct: number;
    defaultsUsed: string[];
  };
}

export interface TCOFormData {
  ownershipYears: string;
  vehicleClass: VehicleClass;
  annualKm: string;
  cityPercentage: string;
  highwayPercentage: string;
  electricityPrice: string;
  publicChargingPrice: string;
  homeChargingShare: string;
  chargingAtHome: boolean;
  fossilFuelType: FossilFuelType;
  fossilFuelPricePerLiter: string;
  evModel: string;
  fossilModel: string;
  evPrice: string;
  fossilPrice: string;
  evAnnualInsurance: string;
  evAnnualTax: string;
  fossilAnnualInsurance: string;
  fossilAnnualTax: string;
  evAnnualMaintenanceFund: string;
  fossilAnnualMaintenanceFund: string;
  evResidualValueShare: string;
  fossilResidualValueShare: string;
  evKwhPerMileCity: string;
  evKwhPerMileHighway: string;
  fossilLitersPerMileCity: string;
  fossilLitersPerMileHighway: string;
}

export type ScenarioOverride = { annualMiles: number; cityPct: number; highwayPct: number };
export type VariantOverride = {
  ownershipYears?: number;
  homeChargingSharePct?: number;
  electricityHomeOreDelta?: number;
  evResidualValueShareDelta?: number;
};

export function getDefaultFormData(): TCOFormData {
  return {
    ownershipYears: String(DEFAULTS.ownershipYears),
    vehicleClass: "medium",
    annualKm: String(DEFAULTS.annualMiles),
    cityPercentage: "50",
    highwayPercentage: "50",
    electricityPrice: String(DEFAULTS.electricity.homeOrePerKwh),
    publicChargingPrice: String(DEFAULTS.electricity.publicOrePerKwh),
    homeChargingShare: String(DEFAULTS.electricity.homeChargingSharePct),
    chargingAtHome: true,
    fossilFuelType: DEFAULTS.fossilFuel.defaultType,
    fossilFuelPricePerLiter: String(DEFAULTS.fossilFuel.petrolSekPerLiter),
    evModel: "",
    fossilModel: "",
    evPrice: "",
    fossilPrice: "",
    evAnnualInsurance: "",
    evAnnualTax: "",
    fossilAnnualInsurance: "",
    fossilAnnualTax: "",
    evAnnualMaintenanceFund: "",
    fossilAnnualMaintenanceFund: "",
    evResidualValueShare: "",
    fossilResidualValueShare: "",
    evKwhPerMileCity: "",
    evKwhPerMileHighway: "",
    fossilLitersPerMileCity: "",
    fossilLitersPerMileHighway: "",
  };
}

export function calculateTCO(
  formData: TCOFormData,
  scenarioOverride?: ScenarioOverride,
  variantOverride?: VariantOverride
): CalculationResults {
  const defaultsUsed: string[] = [];
  const vehicleClass = formData.vehicleClass;
  const classDefaults = DEFAULTS.vehicleClasses[vehicleClass];

  let ownershipYearsRaw = parseFloat(formData.ownershipYears);
  let ownershipYears =
    Number.isFinite(ownershipYearsRaw) && ownershipYearsRaw > 0 ? ownershipYearsRaw : DEFAULTS.ownershipYears;
  if (variantOverride?.ownershipYears != null) ownershipYears = variantOverride.ownershipYears;

  const annualMilesRaw = parseFloat(formData.annualKm);
  const annualMiles = scenarioOverride
    ? scenarioOverride.annualMiles
    : Number.isFinite(annualMilesRaw) && annualMilesRaw > 0
      ? annualMilesRaw
      : DEFAULTS.annualMiles;

  const cityPctRaw = parseFloat(formData.cityPercentage);
  const highwayPctRaw = parseFloat(formData.highwayPercentage);
  const cityPct = scenarioOverride ? scenarioOverride.cityPct : (Number.isFinite(cityPctRaw) ? cityPctRaw : 50);
  const highwayPct = scenarioOverride ? scenarioOverride.highwayPct : (Number.isFinite(highwayPctRaw) ? highwayPctRaw : 50);
  const pctSum = Math.max(0, cityPct) + Math.max(0, highwayPct);
  const cityShare = pctSum > 0 ? Math.max(0, cityPct) / pctSum : 0.5;
  const highwayShare = pctSum > 0 ? Math.max(0, highwayPct) / pctSum : 0.5;

  let electricityHomeOre =
    Number.isFinite(parseFloat(formData.electricityPrice)) && parseFloat(formData.electricityPrice) > 0
      ? parseFloat(formData.electricityPrice)
      : DEFAULTS.electricity.homeOrePerKwh;
  if (variantOverride?.electricityHomeOreDelta != null)
    electricityHomeOre = Math.max(50, electricityHomeOre + variantOverride.electricityHomeOreDelta);

  const electricityPublicOreRaw = parseFloat(formData.publicChargingPrice);
  const electricityPublicOre =
    Number.isFinite(electricityPublicOreRaw) && electricityPublicOreRaw > 0
      ? electricityPublicOreRaw
      : DEFAULTS.electricity.publicOrePerKwh;

  let homeChargingSharePct =
    formData.chargingAtHome && Number.isFinite(parseFloat(formData.homeChargingShare))
      ? Math.min(100, Math.max(0, parseFloat(formData.homeChargingShare)))
      : formData.chargingAtHome
        ? DEFAULTS.electricity.homeChargingSharePct
        : 0;
  if (variantOverride?.homeChargingSharePct != null) homeChargingSharePct = variantOverride.homeChargingSharePct;

  const fossilFuelType = formData.fossilFuelType;
  const fossilFuelPriceRaw = parseFloat(formData.fossilFuelPricePerLiter);
  const fossilFuelPriceSekPerLiter =
    Number.isFinite(fossilFuelPriceRaw) && fossilFuelPriceRaw > 0
      ? fossilFuelPriceRaw
      : fossilFuelType === "diesel"
        ? DEFAULTS.fossilFuel.dieselSekPerLiter
        : DEFAULTS.fossilFuel.petrolSekPerLiter;

  const evPurchasePrice = Number.isFinite(parseFloat(formData.evPrice)) ? parseFloat(formData.evPrice) : classDefaults.ev.purchasePrice;
  const fossilPurchasePrice = Number.isFinite(parseFloat(formData.fossilPrice)) ? parseFloat(formData.fossilPrice) : classDefaults.fossil.purchasePrice;
  const evInsuranceAnnual = Number.isFinite(parseFloat(formData.evAnnualInsurance)) ? parseFloat(formData.evAnnualInsurance) : classDefaults.ev.insuranceAnnual;
  const evTaxAnnual = Number.isFinite(parseFloat(formData.evAnnualTax)) ? parseFloat(formData.evAnnualTax) : classDefaults.ev.taxAnnual;
  const fossilInsuranceAnnual = Number.isFinite(parseFloat(formData.fossilAnnualInsurance)) ? parseFloat(formData.fossilAnnualInsurance) : classDefaults.fossil.insuranceAnnual;
  const fossilTaxAnnual = Number.isFinite(parseFloat(formData.fossilAnnualTax)) ? parseFloat(formData.fossilAnnualTax) : classDefaults.fossil.taxAnnual;
  const evMaintenanceFundAnnual = Number.isFinite(parseFloat(formData.evAnnualMaintenanceFund)) ? parseFloat(formData.evAnnualMaintenanceFund) : classDefaults.ev.maintenanceFundAnnual;
  const fossilMaintenanceFundAnnual = Number.isFinite(parseFloat(formData.fossilAnnualMaintenanceFund)) ? parseFloat(formData.fossilAnnualMaintenanceFund) : classDefaults.fossil.maintenanceFundAnnual;

  let evResidualValueShare = Number.isFinite(parseFloat(formData.evResidualValueShare))
    ? Math.min(0.95, Math.max(0.05, parseFloat(formData.evResidualValueShare)))
    : classDefaults.ev.residualValueShareAfterPeriod;
  if (variantOverride?.evResidualValueShareDelta != null)
    evResidualValueShare = Math.min(0.95, Math.max(0.05, evResidualValueShare + variantOverride.evResidualValueShareDelta));

  const fossilResidualValueShare = Number.isFinite(parseFloat(formData.fossilResidualValueShare))
    ? Math.min(0.95, Math.max(0.05, parseFloat(formData.fossilResidualValueShare)))
    : classDefaults.fossil.residualValueShareAfterPeriod;

  const evKwhPerMileCity = Number.isFinite(parseFloat(formData.evKwhPerMileCity)) ? parseFloat(formData.evKwhPerMileCity) : classDefaults.ev.kwhPerMileCity;
  const evKwhPerMileHighway = Number.isFinite(parseFloat(formData.evKwhPerMileHighway)) ? parseFloat(formData.evKwhPerMileHighway) : classDefaults.ev.kwhPerMileHighway;
  const fossilLitersPerMileCity = Number.isFinite(parseFloat(formData.fossilLitersPerMileCity)) ? parseFloat(formData.fossilLitersPerMileCity) : classDefaults.fossil.litersPerMileCity;
  const fossilLitersPerMileHighway = Number.isFinite(parseFloat(formData.fossilLitersPerMileHighway)) ? parseFloat(formData.fossilLitersPerMileHighway) : classDefaults.fossil.litersPerMileHighway;

  const evKwhPerMileAvg = evKwhPerMileCity * cityShare + evKwhPerMileHighway * highwayShare;
  const fossilLitersPerMileAvg = fossilLitersPerMileCity * cityShare + fossilLitersPerMileHighway * highwayShare;

  const electricityHomeSekPerKwh = electricityHomeOre / 100;
  const electricityPublicSekPerKwh = electricityPublicOre / 100;
  const homeShare = variantOverride?.homeChargingSharePct != null ? variantOverride.homeChargingSharePct / 100 : (formData.chargingAtHome ? homeChargingSharePct / 100 : 0);
  const publicShare = 1 - homeShare;
  const blendedElectricitySekPerKwh = electricityHomeSekPerKwh * homeShare + electricityPublicSekPerKwh * publicShare;
  const evEnergyAnnual = annualMiles * evKwhPerMileAvg * blendedElectricitySekPerKwh;
  const fossilEnergyAnnual = annualMiles * fossilLitersPerMileAvg * fossilFuelPriceSekPerLiter;

  const evResidualValue = evPurchasePrice * evResidualValueShare;
  const fossilResidualValue = fossilPurchasePrice * fossilResidualValueShare;
  const evDepreciationAnnual = (evPurchasePrice - evResidualValue) / ownershipYears;
  const fossilDepreciationAnnual = (fossilPurchasePrice - fossilResidualValue) / ownershipYears;

  const capitalRate = DEFAULTS.capitalCostRate;
  const evCapitalCostAnnual = ((evPurchasePrice + evResidualValue) / 2) * capitalRate;
  const fossilCapitalCostAnnual = ((fossilPurchasePrice + fossilResidualValue) / 2) * capitalRate;

  const evAnnualTotal = evDepreciationAnnual + evCapitalCostAnnual + evInsuranceAnnual + evTaxAnnual + evMaintenanceFundAnnual + evEnergyAnnual;
  const fossilAnnualTotal = fossilDepreciationAnnual + fossilCapitalCostAnnual + fossilInsuranceAnnual + fossilTaxAnnual + fossilMaintenanceFundAnnual + fossilEnergyAnnual;
  const evPeriodTotal = evAnnualTotal * ownershipYears;
  const fossilPeriodTotal = fossilAnnualTotal * ownershipYears;
  const savingsAnnual = fossilAnnualTotal - evAnnualTotal;
  const savingsPeriod = fossilPeriodTotal - evPeriodTotal;
  const savingsPerMile = annualMiles > 0 ? savingsAnnual / annualMiles : 0;
  const evCostPerMile = annualMiles > 0 ? evAnnualTotal / annualMiles : 0;
  const fossilCostPerMile = annualMiles > 0 ? fossilAnnualTotal / annualMiles : 0;

  return {
    ownershipYears,
    annualMiles,
    vehicleClass,
    vehicleClassLabel: classDefaults.label,
    ev: {
      purchasePrice: evPurchasePrice,
      depreciationAnnual: evDepreciationAnnual,
      residualValue: evResidualValue,
      capitalCostAnnual: evCapitalCostAnnual,
      insuranceAnnual: evInsuranceAnnual,
      taxAnnual: evTaxAnnual,
      maintenanceFundAnnual: evMaintenanceFundAnnual,
      energyAnnual: evEnergyAnnual,
      annualTotal: evAnnualTotal,
      monthlyTotal: evAnnualTotal / 12,
      periodTotal: evPeriodTotal,
      costPerMile: evCostPerMile,
    },
    fossil: {
      purchasePrice: fossilPurchasePrice,
      depreciationAnnual: fossilDepreciationAnnual,
      residualValue: fossilResidualValue,
      capitalCostAnnual: fossilCapitalCostAnnual,
      insuranceAnnual: fossilInsuranceAnnual,
      taxAnnual: fossilTaxAnnual,
      maintenanceFundAnnual: fossilMaintenanceFundAnnual,
      energyAnnual: fossilEnergyAnnual,
      annualTotal: fossilAnnualTotal,
      monthlyTotal: fossilAnnualTotal / 12,
      periodTotal: fossilPeriodTotal,
      costPerMile: fossilCostPerMile,
    },
    savings: { annual: savingsAnnual, period: savingsPeriod, perMile: savingsPerMile },
    assumptions: {
      cityPct,
      highwayPct,
      fossilFuelType,
      fossilFuelPriceSekPerLiter,
      electricityHomeOrePerKwh: electricityHomeOre,
      electricityPublicOrePerKwh: electricityPublicOre,
      assumedHomeChargingSharePct: homeChargingSharePct,
      defaultsUsed,
    },
  };
}
