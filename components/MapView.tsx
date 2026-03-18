"use client";
import { useEffect, useRef, useState } from "react";
import type { SolarPotential } from "@/lib/solar-calculator";
import { IRRADIANCE_COLORS } from "@/lib/solar-calculator";

interface MapViewProps {
  location: { lat: number; lng: number; address: string } | null;
  onAreaDrawn: (areaM2: number) => void;
  solarPotential: SolarPotential | null;
}

export default function MapView({ location, onAreaDrawn, solarPotential }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drawnLayersRef = useRef<any>(null);
  const [isSatellite, setIsSatellite] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [drawMode, setDrawMode] = useState<"none" | "rectangle">("none");
  const [drawnArea, setDrawnArea] = useState<number | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      const map = L.map(mapRef.current!, { center: [20, 0], zoom: 3, zoomControl: true });
      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Esri", maxZoom: 20 }
      );
      const streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "OpenStreetMap", maxZoom: 19 }
      );
      satelliteLayer.addTo(map);
      tileLayerRef.current = { satellite: satelliteLayer, street: streetLayer, current: "satellite" };
      const drawnItems = new L.FeatureGroup();
      drawnItems.addTo(map);
      drawnLayersRef.current = drawnItems;
      mapInstanceRef.current = map;
    };
    initMap();
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !location) return;
    const updateLocation = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;
      if (markerRef.current) markerRef.current.remove();
      map.flyTo([location.lat, location.lng], 18, { animate: true, duration: 1.5 });
      const solarIcon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:#ffc107;border:2px solid #050810;border-radius:50%;box-shadow:0 0 16px rgba(255,193,7,0.7);display:flex;align-items:center;justify-content:center;font-size:14px;">☀</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker([location.lat, location.lng], { icon: solarIcon })
        .addTo(map)
        .bindPopup(`<div style="background:#0f1520;border:1px solid rgba(255,193,7,0.3);border-radius:8px;padding:10px;font-family:DM Sans,sans-serif;min-width:160px;">
          <div style="color:#ffc107;font-size:11px;font-weight:600;margin-bottom:6px;">☀ SOLAR SITE</div>
          <div style="color:#8892a4;font-size:10px;margin-bottom:6px;">${location.address.substring(0, 50)}...</div>
          <div style="display:flex;gap:12px;">
            <div><div style="color:#ffc107;font-size:12px;font-family:monospace">${location.lat.toFixed(4)}°</div><div style="color:#4a5568;font-size:9px;">Lat</div></div>
            <div><div style="color:#ffc107;font-size:12px;font-family:monospace">${location.lng.toFixed(4)}°</div><div style="color:#4a5568;font-size:9px;">Lng</div></div>
          </div></div>`);
      markerRef.current = marker;
      setTimeout(() => marker.openPopup(), 1800);
    };
    updateLocation();
  }, [location]);

  const toggleMapType = async () => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const map = mapInstanceRef.current;
    const layers = tileLayerRef.current;
    if (layers.current === "satellite") {
      map.removeLayer(layers.satellite);
      layers.street.addTo(map);
      layers.current = "street";
      setIsSatellite(false);
    } else {
      map.removeLayer(layers.street);
      layers.satellite.addTo(map);
      layers.current = "satellite";
      setIsSatellite(true);
    }
  };

  const startDrawing = async () => {
    if (!mapInstanceRef.current || !drawnLayersRef.current) return;
    const L = (await import("leaflet")).default;
    const map = mapInstanceRef.current;
    setDrawMode("rectangle");
    map.getContainer().style.cursor = "crosshair";
    drawnLayersRef.current.clearLayers();
    setDrawnArea(null);
    let startPoint: { lat: number; lng: number } | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rect: any = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onMouseDown = (e: any) => { startPoint = e.latlng; };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onMouseMove = (e: any) => {
      if (!startPoint) return;
      const bounds = L.latLngBounds(startPoint, e.latlng);
      if (rect) { rect.setBounds(bounds); }
      else { rect = L.rectangle(bounds, { color: "#ffc107", weight: 2, fillColor: "rgba(255,193,7,0.15)", fillOpacity: 0.3 }).addTo(drawnLayersRef.current); }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onMouseUp = (e: any) => {
      if (!startPoint) return;
      const bounds = L.latLngBounds(startPoint, e.latlng);
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const lat = (sw.lat + ne.lat) / 2;
      const metersPerDegreeLat = 111320;
      const metersPerDegreeLng = metersPerDegreeLat * Math.cos((lat * Math.PI) / 180);
      const areaM2 = Math.abs((ne.lng - sw.lng) * metersPerDegreeLng) * Math.abs((ne.lat - sw.lat) * metersPerDegreeLat);
      const rounded = Math.max(10, Math.round(areaM2));
      setDrawnArea(rounded);
      onAreaDrawn(rounded);
      if (rect) {
        rect.bindPopup(`<div style="background:#0f1520;border:1px solid rgba(255,193,7,0.3);border-radius:8px;padding:10px;font-family:DM Sans,sans-serif;">
          <div style="color:#ffc107;font-size:11px;font-weight:600;margin-bottom:4px;">📐 ROOF AREA</div>
          <div style="color:#f0f4ff;font-size:16px;font-weight:700;font-family:monospace">${rounded.toLocaleString()} m²</div>
          <div style="color:#8892a4;font-size:10px;margin-top:2px;">Usable: ${Math.round(rounded * 0.8).toLocaleString()} m²</div>
        </div>`).openPopup();
      }
      map.off("mousedown", onMouseDown);
      map.off("mousemove", onMouseMove);
      map.off("mouseup", onMouseUp);
      map.getContainer().style.cursor = "";
      setDrawMode("none");
    };
    map.on("mousedown", onMouseDown);
    map.on("mousemove", onMouseMove);
    map.on("mouseup", onMouseUp);
  };

  const clearDrawings = () => {
    if (drawnLayersRef.current) { drawnLayersRef.current.clearLayers(); setDrawnArea(null); }
  };

  const irradianceColor = solarPotential ? IRRADIANCE_COLORS[solarPotential.irradianceClass] : null;

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button onClick={toggleMapType} className="px-3 py-2 text-xs font-medium rounded-lg bg-[var(--bg-card)] border border-[rgba(255,193,7,0.3)] text-[var(--solar-primary)] hover:bg-[var(--bg-elevated)] transition-colors shadow-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {isSatellite ? "🗺 Street" : "🛰 Satellite"}
        </button>
        <div className="bg-[var(--bg-card)] border border-[rgba(255,193,7,0.2)] rounded-lg overflow-hidden shadow-lg">
          <div className="px-3 py-1.5 text-xs text-[var(--text-muted)] border-b border-[rgba(255,193,7,0.1)]">Draw Roof</div>
          <button onClick={startDrawing} disabled={drawMode !== "none"} className={`w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-[var(--bg-elevated)] transition-colors ${drawMode === "rectangle" ? "text-[#ffc107]" : "text-[var(--text-secondary)]"}`}>
            <span>⬜</span>{drawMode === "rectangle" ? "Drawing..." : "Draw Rectangle"}
          </button>
          {drawnArea && (
            <button onClick={clearDrawings} className="w-full px-3 py-2 text-xs text-red-400 hover:bg-[var(--bg-elevated)] border-t border-[rgba(255,193,7,0.1)] transition-colors">
              🗑 Clear ({drawnArea.toLocaleString()} m²)
            </button>
          )}
        </div>
      </div>
      {solarPotential && irradianceColor && (
        <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg border" style={{ background: "rgba(5,8,16,0.9)", borderColor: `${irradianceColor}40`, backdropFilter: "blur(8px)" }}>
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)]">Solar Resource</span>
            <span className="text-sm font-semibold" style={{ color: irradianceColor, fontFamily: "'Space Grotesk', sans-serif" }}>{solarPotential.irradianceClass.toUpperCase()}</span>
          </div>
          <div className="w-px h-8 bg-[rgba(255,255,255,0.1)]" />
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)]">Irradiance</span>
            <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">{solarPotential.annualIrradiance.toFixed(0)} kWh/m²</span>
          </div>
          <div className="w-px h-8 bg-[rgba(255,255,255,0.1)]" />
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)]">Peak Sun Hrs</span>
            <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">{solarPotential.peakSunHours.toFixed(1)}/day</span>
          </div>
        </div>
      )}
      {drawMode !== "none" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
          <div className="px-5 py-3 rounded-xl bg-[rgba(5,8,16,0.85)] border border-[rgba(255,193,7,0.4)] text-sm text-[#ffc107] text-center shadow-xl" style={{ backdropFilter: "blur(8px)", fontFamily: "'Space Grotesk', sans-serif" }}>
            Click and drag to draw roof boundary
          </div>
        </div>
      )}
    </div>
  );
}
