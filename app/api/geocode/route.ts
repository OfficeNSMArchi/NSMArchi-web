import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address parameter required" }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_KEY;
  if (!key) {
    return NextResponse.json({ error: "GOOGLE_MAPS_KEY not configured" }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.[0]) {
    return NextResponse.json({ error: "Location not found", status: data.status }, { status: 404 });
  }

  const { lat, lng } = data.results[0].geometry.location;
  const formattedAddress: string = data.results[0].formatted_address;

  return NextResponse.json({ lat, lng, formattedAddress });
}
