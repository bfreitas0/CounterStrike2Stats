import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get("steamId");

  if (!steamId) {
    return NextResponse.json({ error: "Missing steamId" }, { status: 400 });
  }

  const key = process.env.STEAM_API_KEY;

  if (!key) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?appid=730&steamid=${steamId}&key=${key}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Steam API error:", error);
    return NextResponse.json({ error: "Failed to fetch from Steam API" }, { status: 500 });
  }
}