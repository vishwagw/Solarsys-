"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search, Sun, Zap, BarChart3, DollarSign, Leaf,
  Download, RefreshCw, ChevronDown, AlertCircle, MapPin,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
} from "recharts";
import dynamic from "next/dynamic";
import {
  fetchSolarData, calculateRoofAnalysis, designPanelSystem,
  calculateEnergyProduction, calculateFinancials,
  MONTHS, IRRADIANCE_COLORS,
  type SolarPotential, type PanelConfig, type EnergyAnalysis, type FinancialAnalysis,
} from "@/lib/solar-calculator";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#090d13]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-t-[#ffc107] border-[rgba(255,193,7,0.2)] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[var(--text-secondary)]">Loading map...</p>
      </div>
    </div>
  ),
});

interface Location { lat: number; lng: number; address: string; }
interface SystemParams {
  roofAreaM2: number; panelWattage: number; targetKw: number | undefined;
  electricityRate: number; installCostPerKw: number; systemLosses: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SolarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-elevated)] border border-[rgba(255,193,7,0.2)] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[var(--text-secondary)] mb-1 font-mono">{label}</p>
      {payload.map((p: { color: string; name: string; value: number }, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

function MetricCard({ label, value, unit, sub, color = "#ffc107", icon: Icon }: {
  label: string; value: string | number; unit?: string; sub?: string; color?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="card p-4 hover:border-[rgba(255,193,7,0.25)] transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-mono">{label}</span>
        {Icon && <Icon size={13} style={{ color }} />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-xs text-[var(--text-secondary)]">{unit}</span>}
      </div>
      {sub && <p className="text-[10px] text-[var(--text-muted)] mt-1">{sub}</p>}
    </div>
  );
}

export default function SolarDashboard() {
  const [location, setLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [params, setParams] = useState<SystemParams>({
    roofAreaM2: 150, panelWattage: 400, targetKw: undefined,
    electricityRate: 0.15, installCostPerKw: 1200, systemLosses: 0.14,
  });
  const [solar, setSolar] = useState<SolarPotential | null>(null);
  const [panels, setPanels] = useState<PanelConfig | null>(null);
  const [energy, setEnergy] = useState<EnergyAnalysis | null>(null);
  const [fin, setFin] = useState<FinancialAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"energy" | "financial" | "layout">("energy");
  const [roofArea, setRoofArea] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true); setError(null);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data.length > 0) {
        setLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), address: data[0].display_name });
      } else { setError("Location not found. Try a more specific address."); }
    } catch { setError("Failed to search location."); }
    finally { setIsSearching(false); }
  };

  const runAnalysis = useCallback(async () => {
    if (!location) return;
    setIsAnalyzing(true); setError(null);
    try {
      const area = roofArea || params.roofAreaM2;
      const solarData = await fetchSolarData(location.lat, location.lng);
      const roof = calculateRoofAnalysis(area, solarData.optimalTilt);
      const panelCfg = designPanelSystem(roof, params.targetKw, params.panelWattage);
      const energyData = calculateEnergyProduction(panelCfg, solarData, params.systemLosses);
      const finData = calculateFinancials(energyData, panelCfg, params.electricityRate, params.installCostPerKw);
      setSolar(solarData); setPanels(panelCfg); setEnergy(energyData); setFin(finData);
    } catch (e) { setError("Analysis failed. Please try again."); console.error(e); }
    finally { setIsAnalyzing(false); }
  }, [location, params, roofArea]);

  useEffect(() => { if (location) runAnalysis(); }, [location, runAnalysis]);

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    production: energy?.monthlyProductionKwh[i] || 0,
    irradiance: solar?.monthlyIrradiance[i] || 0,
    revenue: fin?.monthlyRevenue[i] || 0,
  }));

  const iColor = solar ? IRRADIANCE_COLORS[solar.irradianceClass] : "#ffc107";

  const paramFields = [
    { label: "Roof Area", key: "roofAreaM2", min: 10, max: 2000, step: 10, suffix: "m²" },
    { label: "Panel Wattage", key: "panelWattage", min: 250, max: 700, step: 25, suffix: "W" },
    { label: "Electricity Rate", key: "electricityRate", min: 0.05, max: 0.5, step: 0.01, suffix: "$/kWh", decimals: 2 },
    { label: "Install Cost/kW", key: "installCostPerKw", min: 500, max: 3000, step: 50, suffix: "$/kW" },
    { label: "System Losses", key: "systemLosses", min: 0.05, max: 0.3, step: 0.01, suffix: "%", isPercent: true },
  ];

  return (
    <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 57px)" }}>
      {/* ── LEFT SIDEBAR ── */}
      <div className="w-[280px] flex-shrink-0 flex flex-col border-r border-[rgba(255,193,7,0.1)] bg-[var(--bg-secondary)] overflow-y-auto">
        {/* Search */}
        <div className="p-4 border-b border-[rgba(255,193,7,0.08)]">
          <p className="text-[10px] font-mono text-[var(--solar-primary)] mb-3 tracking-widest uppercase">Location</p>
          <div className="flex gap-2">
            <input
              className="input-solar flex-1 text-sm"
              placeholder="Search address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchLocation()}
            />
            <button onClick={searchLocation} disabled={isSearching}
              className="px-3 py-2 bg-[#ffc107] text-[#050810] rounded-lg hover:bg-[#ffca28] disabled:opacity-50 transition-colors flex-shrink-0">
              {isSearching ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
            </button>
          </div>
          {error && <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={11} />{error}</p>}
          {location && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
              <MapPin size={11} className="text-[#ffc107] mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2 leading-relaxed">{location.address}</span>
            </div>
          )}
        </div>

        {/* Solar Potential */}
        {solar && (
          <div className="p-4 border-b border-[rgba(255,193,7,0.08)]">
            <p className="text-[10px] font-mono text-[var(--solar-primary)] mb-3 tracking-widest uppercase">Solar Potential</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--text-secondary)]">Resource Class</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${iColor}1a`, color: iColor }}>
                {solar.irradianceClass.toUpperCase()}
              </span>
            </div>
            {[
              ["Annual Irradiance", `${solar.annualIrradiance} kWh/m²/yr`],
              ["Peak Sun Hours", `${solar.peakSunHours} h/day`],
              ["Optimal Tilt", `${solar.optimalTilt}°`],
              ["Azimuth", `${solar.optimalAzimuth}° (${solar.optimalAzimuth === 180 ? "South" : "North"})`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-1">
                <span className="text-xs text-[var(--text-muted)]">{k}</span>
                <span className="text-xs font-mono text-[var(--text-primary)]">{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* System Parameters */}
        <div className="p-4 border-b border-[rgba(255,193,7,0.08)]">
          <button onClick={() => setShowSettings(s => !s)}
            className="flex items-center justify-between w-full text-[10px] font-mono text-[var(--solar-primary)] tracking-widest uppercase">
            <span>Parameters</span>
            <ChevronDown size={11} className={`transition-transform ${showSettings ? "rotate-180" : ""}`} />
          </button>
          {showSettings && (
            <div className="mt-3 space-y-3">
              {paramFields.map(f => {
                const val = params[f.key as keyof SystemParams] as number;
                const display = f.isPercent ? `${Math.round(val * 100)}${f.suffix}` : f.decimals ? val.toFixed(f.decimals) + " " + f.suffix : `${val} ${f.suffix}`;
                return (
                  <div key={f.key}>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-[var(--text-muted)]">{f.label}</label>
                      <span className="text-xs font-mono text-[var(--solar-primary)]">{display}</span>
                    </div>
                    <input type="range" min={f.min} max={f.max} step={f.step} value={val}
                      onChange={e => setParams(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                      className="w-full h-1 rounded-full cursor-pointer appearance-none" style={{ accentColor: "#ffc107" }} />
                  </div>
                );
              })}
              {location && (
                <button onClick={runAnalysis} disabled={isAnalyzing}
                  className="w-full py-2 text-xs bg-[#ffc107] text-[#050810] rounded-lg font-semibold hover:bg-[#ffca28] disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors">
                  {isAnalyzing ? <><RefreshCw size={11} className="animate-spin" />Analyzing...</> : <><RefreshCw size={11} />Recalculate</>}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Panel Config */}
        {panels && (
          <div className="p-4">
            <p className="text-[10px] font-mono text-[var(--solar-primary)] mb-3 tracking-widest uppercase">System Design</p>
            {[
              ["Panels", `${panels.panelCount} × ${panels.panelWattage}W`],
              ["System Size", `${panels.systemKw.toFixed(1)} kWp`],
              ["Layout", `${panels.rows}R × ${panels.cols}C`],
              ["Footprint", `${panels.areaRequired} m²`],
              ["Inverter", `${Math.ceil(panels.systemKw * 0.9)} kW String`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-1">
                <span className="text-xs text-[var(--text-muted)]">{k}</span>
                <span className="text-xs font-mono text-[var(--text-primary)]">{v}</span>
              </div>
            ))}
          </div>
        )}

        {!location && (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div>
              <MapPin size={28} className="text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
              <p className="text-xs text-[var(--text-muted)]">Search a location to begin analysis</p>
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Map panel */}
        <div className="h-[42%] flex-shrink-0 relative border-b border-[rgba(255,193,7,0.1)]">
          {isAnalyzing && (
            <div className="absolute inset-0 bg-[rgba(5,8,16,0.75)] z-20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-2 border-t-[#ffc107] border-[rgba(255,193,7,0.15)] animate-spin mx-auto mb-3" />
                <p className="text-sm text-[var(--solar-primary)] font-mono">Fetching solar data...</p>
              </div>
            </div>
          )}
          <MapView location={location} onAreaDrawn={area => { setRoofArea(area); setParams(p => ({ ...p, roofAreaM2: area })); }} solarPotential={solar} />
          {!location && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="card px-8 py-5 text-center solar-glow border-[rgba(255,193,7,0.2)]">
                <Sun size={28} className="text-[#ffc107] mx-auto mb-2" />
                <p className="text-sm font-semibold mb-1">Search a location to start</p>
                <p className="text-xs text-[var(--text-muted)]">Draw a roof rectangle to measure area</p>
              </div>
            </div>
          )}
        </div>

        {/* Results panel */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!energy ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-[var(--text-muted)]">
                <BarChart3 size={36} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Analysis results appear here after selecting a location</p>
              </div>
            </div>
          ) : (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard label="Annual Yield" value={energy.annualProductionKwh.toLocaleString()} unit="kWh/yr" sub="AC output" color="#ffc107" icon={Zap} />
                <MetricCard label="System Size" value={panels!.systemKw.toFixed(1)} unit="kWp" sub={`${panels!.panelCount} panels`} color="#00e5ff" icon={Sun} />
                <MetricCard label="Annual Savings" value={`$${fin!.annualSavingsUsd.toLocaleString()}`} sub={`Payback: ${fin!.paybackYears}yr`} color="#00e676" icon={DollarSign} />
                <MetricCard label="CO₂ Offset" value={(energy.co2OffsetKg / 1000).toFixed(1)} unit="t/yr" sub={`${energy.treesEquivalent} trees equiv.`} color="#ce93d8" icon={Leaf} />
              </div>

              {/* Tab nav */}
              <div className="flex gap-1 border-b border-[rgba(255,193,7,0.1)]">
                {(["energy", "financial", "layout"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 text-xs font-medium transition-colors capitalize rounded-t-md ${activeTab === tab ? "text-[#ffc107] bg-[rgba(255,193,7,0.06)] border-b-2 border-[#ffc107]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {tab === "energy" ? "Energy Production" : tab === "financial" ? "Financial Analysis" : "Panel Layout"}
                  </button>
                ))}
              </div>

              {/* ─── Energy Tab ─── */}
              {activeTab === "energy" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <MetricCard label="Daily Average" value={energy.dailyAvgKwh} unit="kWh" color="#ffc107" />
                    <MetricCard label="Capacity Factor" value={`${energy.capacityFactor}%`} color="#00e5ff" />
                    <MetricCard label="System Efficiency" value={`${energy.systemEfficiency}%`} color="#00e676" />
                  </div>
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="card p-4">
                      <p className="text-[10px] font-mono text-[var(--solar-primary)] uppercase tracking-widest mb-4">Monthly Production (kWh)</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData} barSize={18}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,193,7,0.07)" />
                          <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
                          <Tooltip content={<SolarTooltip />} />
                          <Bar dataKey="production" name="kWh" fill="#ffc107" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="card p-4">
                      <p className="text-[10px] font-mono text-[var(--solar-primary)] uppercase tracking-widest mb-4">Solar Irradiance (kWh/m²/month)</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="irrGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ff8f00" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#ff8f00" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,193,7,0.07)" />
                          <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                          <Tooltip content={<SolarTooltip />} />
                          <Area type="monotone" dataKey="irradiance" name="kWh/m²" stroke="#ff8f00" fill="url(#irrGrad)" strokeWidth={2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Financial Tab ─── */}
              {activeTab === "financial" && fin && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <MetricCard label="System Cost" value={`$${fin.systemCostUsd.toLocaleString()}`} sub="Installed" color="#ffc107" icon={DollarSign} />
                    <MetricCard label="Payback Period" value={`${fin.paybackYears}yr`} sub="Simple payback" color="#00e5ff" />
                    <MetricCard label="25yr NPV" value={`$${fin.npv.toLocaleString()}`} sub="@ 5% discount rate" color={fin.npv > 0 ? "#00e676" : "#ff1744"} />
                    <MetricCard label="25yr ROI" value={`${fin.roi25Year}%`} sub="Total return" color="#ce93d8" icon={BarChart3} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="card p-4 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">LCOE</p>
                        <p className="text-lg font-bold text-[#ffc107]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>${fin.lcoe.toFixed(3)}/kWh</p>
                      </div>
                      <Zap size={20} className="text-[#ffc107] opacity-40" />
                    </div>
                    <div className="card p-4 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">Annual Revenue</p>
                        <p className="text-lg font-bold text-[#00e676]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>${fin.annualSavingsUsd.toLocaleString()}</p>
                      </div>
                      <DollarSign size={20} className="text-[#00e676] opacity-40" />
                    </div>
                  </div>
                  <div className="card p-4">
                    <p className="text-[10px] font-mono text-[var(--solar-primary)] uppercase tracking-widest mb-4">Monthly Revenue ($)</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,193,7,0.07)" />
                        <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
                        <Tooltip content={<SolarTooltip />} />
                        <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#00e676" strokeWidth={2} dot={{ fill: "#00e676", r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Cumulative cashflow */}
                  <div className="card p-4">
                    <p className="text-[10px] font-mono text-[var(--solar-primary)] uppercase tracking-widest mb-4">25-Year Cumulative Cashflow ($)</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={Array.from({ length: 26 }, (_, yr) => {
                        const savings = fin.annualSavingsUsd * yr;
                        const net = savings - fin.systemCostUsd;
                        return { year: `Yr ${yr}`, cumulative: Math.round(net) };
                      })}>
                        <defs>
                          <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00e676" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,193,7,0.07)" />
                        <XAxis dataKey="year" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
                        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<SolarTooltip />} />
                        <Area type="monotone" dataKey="cumulative" name="Net ($)" stroke="#00e676" fill="url(#cashGrad)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ─── Layout Tab ─── */}
              {activeTab === "layout" && panels && (
                <div className="space-y-4">
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="card p-5">
                      <p className="text-[10px] font-mono text-[var(--solar-primary)] uppercase tracking-widest mb-4">Array Layout — {panels.rows}R × {panels.cols}C</p>
                      <div className="bg-[#090d13] rounded-xl p-4 border border-[rgba(0,229,255,0.08)]">
                        <div className="flex flex-wrap gap-[3px] justify-center"
                          style={{ maxWidth: Math.min(panels.cols * 22, 380) + "px", margin: "0 auto" }}>
                          {Array.from({ length: Math.min(panels.panelCount, 80) }).map((_, i) => (
                            <div key={i} className="panel-cell" style={{ width: 18, height: 12, borderRadius: 2 }} />
                          ))}
                        </div>
                        {panels.panelCount > 80 && (
                          <p className="text-center text-xs text-[var(--text-muted)] mt-3">+{panels.panelCount - 80} more panels</p>
                        )}
                        <p className="text-center text-xs text-[var(--text-secondary)] mt-3 font-mono">
                          {panels.panelCount} panels · {panels.systemKw.toFixed(1)} kWp · {panels.areaRequired} m²
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="card p-4">
                        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-3">Equipment Spec</p>
                        {[
                          ["Module", `Mono PERC ${panels.panelWattage}W`],
                          ["Inverter Size", `${Math.ceil(panels.systemKw * 0.9)} kW`],
                          ["Inverter Type", "String Inverter"],
                          ["Strings", `${panels.rows}`],
                          ["Modules/String", `${panels.cols}`],
                          ["DC/AC Ratio", `${((panels.systemKw) / (Math.ceil(panels.systemKw * 0.9))).toFixed(2)}`],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between py-1">
                            <span className="text-xs text-[var(--text-muted)]">{k}</span>
                            <span className="text-xs font-mono text-[#00e5ff]">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="card p-4">
                        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-3">Mounting</p>
                        {[
                          ["Tilt Angle", `${solar?.optimalTilt}°`],
                          ["Azimuth", `${solar?.optimalAzimuth}°`],
                          ["Mounting Type", "Flush Roof Mount"],
                          ["Rail System", "Aluminum"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between py-1">
                            <span className="text-xs text-[var(--text-muted)]">{k}</span>
                            <span className="text-xs font-mono text-[#ff8f00]">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => window.print()}
                    className="w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold bg-[rgba(255,193,7,0.08)] border border-[rgba(255,193,7,0.25)] text-[#ffc107] rounded-xl hover:bg-[rgba(255,193,7,0.14)] transition-colors"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Download size={15} />Export Full Design Report (PDF)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
