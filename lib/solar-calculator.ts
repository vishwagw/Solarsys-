export interface SolarPotential {
  annualIrradiance: number;
  monthlyIrradiance: number[];
  optimalTilt: number;
  optimalAzimuth: number;
  peakSunHours: number;
  irradianceClass: "excellent" | "good" | "moderate" | "poor";
}

export interface PanelConfig {
  panelCount: number;
  panelWattage: number;
  systemKw: number;
  areaRequired: number;
  rows: number;
  cols: number;
}

export interface EnergyAnalysis {
  annualProductionKwh: number;
  monthlyProductionKwh: number[];
  dailyAvgKwh: number;
  systemEfficiency: number;
  capacityFactor: number;
  co2OffsetKg: number;
  treesEquivalent: number;
}

export interface FinancialAnalysis {
  systemCostUsd: number;
  annualSavingsUsd: number;
  paybackYears: number;
  roi25Year: number;
  npv: number;
  lcoe: number;
  monthlyRevenue: number[];
}

export interface RoofAnalysis {
  area: number;
  usableArea: number;
  maxPanels: number;
  slopeFactor: number;
}

export async function fetchSolarData(lat: number, lng: number): Promise<SolarPotential> {
  try {
    const res = await fetch(`/api/solar?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const monthly = data.outputs?.monthly?.fixed || [];
    const monthlyIrradiance = monthly.map((m: { H_i_opt: number }) => m.H_i_opt || 0);
    const annualIrradiance = monthlyIrradiance.reduce((a: number, b: number) => a + b, 0);
    let irradianceClass: SolarPotential["irradianceClass"] = "poor";
    if (annualIrradiance > 1800) irradianceClass = "excellent";
    else if (annualIrradiance > 1400) irradianceClass = "good";
    else if (annualIrradiance > 1000) irradianceClass = "moderate";
    return {
      annualIrradiance: Math.round(annualIrradiance),
      monthlyIrradiance,
      optimalTilt: data.inputs?.mounting_system?.fixed?.slope?.value || calculateOptimalTilt(lat),
      optimalAzimuth: lat >= 0 ? 180 : 0,
      peakSunHours: Math.round((annualIrradiance / 365) * 10) / 10,
      irradianceClass,
    };
  } catch {
    return estimateSolarPotential(lat, lng);
  }
}

export function estimateSolarPotential(lat: number, _lng: number): SolarPotential {
  const absLat = Math.abs(lat);
  let base = 1800;
  if (absLat < 15) base = 2100;
  else if (absLat < 30) base = 1950;
  else if (absLat < 45) base = 1550;
  else if (absLat < 60) base = 1100;
  else base = 750;
  const monthlyIrradiance = generateMonthlyDistribution(base, lat);
  const annualIrradiance = monthlyIrradiance.reduce((a, b) => a + b, 0);
  let irradianceClass: SolarPotential["irradianceClass"] = "poor";
  if (annualIrradiance > 1800) irradianceClass = "excellent";
  else if (annualIrradiance > 1400) irradianceClass = "good";
  else if (annualIrradiance > 1000) irradianceClass = "moderate";
  return {
    annualIrradiance: Math.round(annualIrradiance),
    monthlyIrradiance,
    optimalTilt: calculateOptimalTilt(lat),
    optimalAzimuth: lat >= 0 ? 180 : 0,
    peakSunHours: Math.round((annualIrradiance / 365) * 10) / 10,
    irradianceClass,
  };
}

function calculateOptimalTilt(lat: number): number {
  return Math.round(Math.abs(lat) * 0.87 + 3.1);
}

function generateMonthlyDistribution(annualTotal: number, lat: number): number[] {
  const isNorth = lat >= 0;
  const base = annualTotal / 12;
  const amplitude = base * 0.38;
  return Array.from({ length: 12 }, (_, i) => {
    const angle = isNorth ? ((i - 5) / 12) * 2 * Math.PI : ((i - 11) / 12) * 2 * Math.PI;
    return Math.round((base + amplitude * Math.cos(angle)) * 10) / 10;
  });
}

export function calculateRoofAnalysis(areaM2: number, tiltDeg: number = 20): RoofAnalysis {
  const usableArea = areaM2 * 0.8;
  const panelArea = 1.7;
  const maxPanels = Math.floor(usableArea / panelArea);
  const slopeFactor = Math.cos((tiltDeg * Math.PI) / 180);
  return { area: areaM2, usableArea, maxPanels, slopeFactor };
}

export function designPanelSystem(roofAnalysis: RoofAnalysis, targetKw?: number, panelWattage: number = 400): PanelConfig {
  let panelCount = roofAnalysis.maxPanels;
  if (targetKw) {
    const targetPanels = Math.ceil((targetKw * 1000) / panelWattage);
    panelCount = Math.min(targetPanels, roofAnalysis.maxPanels);
  }
  panelCount = Math.max(1, panelCount);
  const aspectRatio = 1.5;
  const cols = Math.max(1, Math.ceil(Math.sqrt(panelCount * aspectRatio)));
  const rows = Math.max(1, Math.ceil(panelCount / cols));
  return {
    panelCount,
    panelWattage,
    systemKw: Math.round((panelCount * panelWattage) / 100) / 10,
    areaRequired: Math.round(panelCount * 1.7),
    rows,
    cols,
  };
}

export function calculateEnergyProduction(panelConfig: PanelConfig, solarPotential: SolarPotential, systemLosses: number = 0.14): EnergyAnalysis {
  const eff = 1 - systemLosses;
  const annual = panelConfig.systemKw * solarPotential.annualIrradiance * eff;
  const monthly = solarPotential.monthlyIrradiance.map(irr => Math.round(panelConfig.systemKw * irr * eff));
  const co2 = annual * 0.4;
  return {
    annualProductionKwh: Math.round(annual),
    monthlyProductionKwh: monthly,
    dailyAvgKwh: Math.round((annual / 365) * 10) / 10,
    systemEfficiency: Math.round(eff * 100),
    capacityFactor: Math.round((annual / (panelConfig.systemKw * 8760)) * 1000) / 10,
    co2OffsetKg: Math.round(co2),
    treesEquivalent: Math.round(co2 / 21),
  };
}

export function calculateFinancials(energyAnalysis: EnergyAnalysis, panelConfig: PanelConfig, electricityRate: number = 0.15, installCostPerKw: number = 1200): FinancialAnalysis {
  const cost = panelConfig.systemKw * installCostPerKw;
  const annualSavings = energyAnalysis.annualProductionKwh * electricityRate;
  const payback = cost / annualSavings;
  const discountRate = 0.05;
  const degradation = 0.005;
  let npv = -cost;
  for (let y = 1; y <= 25; y++) {
    const prod = energyAnalysis.annualProductionKwh * Math.pow(1 - degradation, y);
    npv += (prod * electricityRate) / Math.pow(1 + discountRate, y);
  }
  const lcoe = cost / (energyAnalysis.annualProductionKwh * 25);
  const totalSavings = annualSavings * 25;
  return {
    systemCostUsd: Math.round(cost),
    annualSavingsUsd: Math.round(annualSavings),
    paybackYears: Math.round(payback * 10) / 10,
    roi25Year: Math.round(((totalSavings - cost) / cost) * 100),
    npv: Math.round(npv),
    lcoe: Math.round(lcoe * 1000) / 1000,
    monthlyRevenue: energyAnalysis.monthlyProductionKwh.map(k => Math.round(k * electricityRate * 100) / 100),
  };
}

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const IRRADIANCE_COLORS = {
  excellent: "#ff6d00",
  good: "#ffc107",
  moderate: "#66bb6a",
  poor: "#42a5f5",
};
