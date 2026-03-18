import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if (!lat || !lng) return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  try {
    const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lng}&peakpower=1&loss=14&outputformat=json&browser=0`;
    const response = await fetch(url, {
      headers: { "User-Agent": "SolarSense/1.0" },
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error(`PVGIS ${response.status}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
