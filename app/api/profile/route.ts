import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { steamId, stats } = body;

    if (!steamId || !stats) {
      return NextResponse.json(
        { error: "Missing steamId or stats" },
        { status: 400 }
      );
    }

    // get stats
    const getStatValue = (name: string) => {
      const stat = stats.find((s: any) => s.name === name);
      return stat ? stat.value : 0;
    };

    const kills = getStatValue("total_kills");
    const deaths = getStatValue("total_deaths");
    const wins = getStatValue("total_wins");
    const roundsPlayed = getStatValue("total_rounds_played");
    const headshots = getStatValue("total_kills_headshot");
    const timePlayed = getStatValue("total_time_played");
    const mvps = getStatValue("total_mvps");
    const awpKills = getStatValue("total_kills_awp");
    const ak47Kills = getStatValue("total_kills_ak47");

    const kdRatio = deaths > 0 ? (kills / deaths) : kills;
    const winRate = roundsPlayed > 0 ? (wins / roundsPlayed) * 100 : 0;
    const headshotRate = kills > 0 ? (headshots / kills) * 100 : 0;
    const hoursPlayed = Math.floor(timePlayed / 3600);

    const query = `
      INSERT INTO profiles (
        steam_id, kills, deaths, wins, rounds_played, headshots,
        time_played, mvps, awp_kills, ak47_kills, kd_ratio,
        win_rate, headshot_rate, hours_played, raw_stats
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        kills = VALUES(kills),
        deaths = VALUES(deaths),
        wins = VALUES(wins),
        rounds_played = VALUES(rounds_played),
        headshots = VALUES(headshots),
        time_played = VALUES(time_played),
        mvps = VALUES(mvps),
        awp_kills = VALUES(awp_kills),
        ak47_kills = VALUES(ak47_kills),
        kd_ratio = VALUES(kd_ratio),
        win_rate = VALUES(win_rate),
        headshot_rate = VALUES(headshot_rate),
        hours_played = VALUES(hours_played),
        raw_stats = VALUES(raw_stats),
        updated_at = CURRENT_TIMESTAMP
    `;

    const values = [
      steamId,
      kills,
      deaths,
      wins,
      roundsPlayed,
      headshots,
      timePlayed,
      mvps,
      awpKills,
      ak47Kills,
      kdRatio,
      winRate,
      headshotRate,
      hoursPlayed,
      JSON.stringify(stats),
    ];

    await pool.execute(query, values);

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}

// get req to get from profiles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get("steamId");

    if (steamId) {

      // get data from specific profile
      const [rows]: any = await pool.execute(
        "SELECT * FROM profiles WHERE steam_id = ?",
        [steamId]
      );
      return NextResponse.json(rows[0] || null);
    } else {

      // all
      const [rows] = await pool.execute(
        "SELECT * FROM profiles ORDER BY updated_at DESC LIMIT 50"
      );
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}