"use client";

import { useState } from "react";

export default function Home() {

  const [steamId, setSteamId] = useState("");
  const [stats, setStats] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [showProfiles, setShowProfiles] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  async function handleSearch() {
    if (!steamId.trim()) {
      setError("Please enter a Steam ID");
      return;
    }

    setError("");
    setStats(null);
    setLoading(true);
    setSaveMessage("");

    try {
      const res = await fetch(`/api/stats?steamId=${steamId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch stats");
        return;
      }

      if (data.playerstats?.error) {
        setError(data.playerstats.error);
        return;
      }

      setStats(data.playerstats);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error - please try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!stats) return;

    setSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steamId: steamId,
          stats: stats.stats,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSaveMessage("Profile saved successfully!");
        // refresh the saved profiles list
        if (showProfiles) {
          loadSavedProfiles();
        }
      } else {
        setSaveMessage("Failed to save profile: " + data.error);
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveMessage("could not save profile");
    } finally {
      setSaving(false);
    }
  }

  async function loadSavedProfiles() {
    setLoadingProfiles(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setSavedProfiles(data);
      } else {
        setSavedProfiles([]);
      }
    } catch (err) {
      console.error("Load profiles error:", err);
      setSavedProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  }

  async function handleLoadProfile(profileSteamId: string) {
    setSteamId(profileSteamId);
    setShowProfiles(false);
    
    // search with the loaded Steam ID
    setError("");
    setStats(null);
    setLoading(true);
    setSaveMessage("");

    try {
      const res = await fetch(`/api/stats?steamId=${profileSteamId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch stats");
        return;
      }

      if (data.playerstats?.error) {
        setError(data.playerstats.error);
        return;
      }

      setStats(data.playerstats);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("please try again");
    } finally {
      setLoading(false);
    }
  }

  function toggleSavedProfiles() {
    if (!showProfiles) {
      loadSavedProfiles();
    }
    setShowProfiles(!showProfiles);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        padding: "40px",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{
            fontSize: "42px",
            margin: "0 0 10px 0",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "black",
            fontWeight: "bold"
          }}>CS2 Stats Lookup</h1>
          <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
            Enter a Steam ID or username to view Counter-Strike 2 statistics
          </p>
        </div>

        {/* Search Box */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px",
          flexWrap: "wrap"
        }}>
          <input
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter Steam ID64 or username"
            style={{
              flex: "1",
              minWidth: "250px",
              padding: "14px 18px",
              fontSize: "16px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.3s",
              color: "black",
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: "14px 32px",
              fontSize: "16px",
              fontWeight: "600",
              background: loading ? "#000000ff" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: loading ? "none" : "0 4px 15px rgba(102, 126, 234, 0.4)"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {loading ? "Loading..." : "Search"}
          </button>

          <button
            onClick={toggleSavedProfiles}
            style={{
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: "600",
              background: showProfiles ? "#000000ff" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
            }}
          >{showProfiles ? "Hide" : "Saved Profiles"}
          </button>
        </div>

        {/* Saved Profiles List */}
        {showProfiles && (
          <div style={{
            background: "#f8f9fa",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            border: "2px solid #e9ecef"
          }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "20px", color: "#333" }}>
              Saved Profiles
            </h3>
            
            {loadingProfiles ? (
              <p style={{ color: "#666", textAlign: "center" }}>Loading profiles...</p>
            ) : savedProfiles.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center" }}>No saved profiles yet. Search and save a profile to get started!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {savedProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    style={{
                      background: "white",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #dee2e6",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px"
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ fontWeight: "bold", color: "#333", marginBottom: "4px" }}>
                        Steam ID: {profile.steam_id}
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        K/D: {profile.kd_ratio} | Win Rate: {profile.win_rate}% | {profile.hours_played}h played
                      </div>
                      <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                        Last updated: {new Date(profile.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLoadProfile(profile.steam_id)}
                      style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "600",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "transform 0.2s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >Load</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#fee",
            border: "2px solid #fcc",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            color: "#c33"
          }}>
            <strong>Error:</strong> {error}
            <br />
            <small style={{ color: "#999", marginTop: "8px", display: "block" }}>
              Note: The user's Steam profile and game details must be set to Public
            </small>
          </div>
        )}

        {/* Stats Display */}
        {stats && (() => {
          const getStatValue = (name: string) => {
            const stat = stats.stats.find((s: any) => s.name === name);
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

          const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
          const winRate = roundsPlayed > 0 ? ((wins / roundsPlayed) * 100).toFixed(1) : "0.0";
          const headshotRate = kills > 0 ? ((headshots / kills) * 100).toFixed(1) : "0.0";
          const hoursPlayed = (timePlayed / 3600).toFixed(0);

          return (
            <div style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: "24px",
              border: "2px solid #e9ecef"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "20px",
                paddingBottom: "12px",
                borderBottom: "3px solid #000000ff"
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: "28px",
                  color: "#333",
                }}>CS2 Stats</h2>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  style={{
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    background: saving ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: saving ? "not-allowed" : "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    boxShadow: saving ? "none" : "0 4px 15px rgba(102, 126, 234, 0.4)"
                  }}
                  onMouseOver={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                    }
                  }}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>

              {saveMessage && (
                <div style={{
                  padding: "12px",
                  marginBottom: "16px",
                  borderRadius: "6px",
                  background: saveMessage.includes("✅") ? "#d4edda" : "#f8d7da",
                  color: saveMessage.includes("✅") ? "#155724" : "#721c24",
                  border: `1px solid ${saveMessage.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`,
                  fontSize: "14px"
                }}>
                  {saveMessage}
                </div>
              )}

              {/* Key Stats Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "20px"
              }}>
                <div style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "2px solid #000000ff",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#000000ff" }}>{kd}</div>
                  <div style={{ color: "#666", fontSize: "14px", marginTop: "8px" }}>K/D Ratio</div>
                </div>

                <div style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "2px solid #000000ff",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#000000ff" }}>{winRate}%</div>
                  <div style={{ color: "#666", fontSize: "14px", marginTop: "8px" }}>Win Rate</div>
                </div>

                <div style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "2px solid #000000ff",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#000000ff" }}>{headshotRate}%</div>
                  <div style={{ color: "#666", fontSize: "14px", marginTop: "8px" }}>Headshot Rate</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div style={{
                background: "white",
                borderRadius: "8px",
                padding: "20px",
                border: "1px solid #dee2e6"
              }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#333" }}>Overall Stats</h3>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  fontSize: "14px",
                  color:"black"
                }}>
                  <div style={{ padding: "8px", background: "#f8f9fa", borderRadius: "4px" }}>
                    <strong>Total Kills:</strong> {kills.toLocaleString()}
                  </div>
                  <div style={{ padding: "8px", background: "#f8f9fa", borderRadius: "4px" }}>
                    <strong>Total Deaths:</strong> {deaths.toLocaleString()}
                  </div>
                  <div style={{ padding: "8px", background: "#f8f9fa", borderRadius: "4px" }}>
                    <strong>Total Wins:</strong> {wins.toLocaleString()}
                  </div>
                  <div style={{ padding: "8px", background: "#f8f9fa", borderRadius: "4px" }}>
                    <strong>MVPs:</strong> {mvps.toLocaleString()}
                  </div>
                  <div style={{ padding: "8px", background: "#f8f9fa", borderRadius: "4px" }}>
                    <strong>Headshots:</strong> {headshots.toLocaleString()}
                  </div>
                  <div style={{ padding: "8px", background: "#f8f9fa", borderRadius: "4px" }}>
                    <strong>Hours Played:</strong> {hoursPlayed}
                  </div>
                </div>
              </div>

              {/* Weapon Stats */}
              <div style={{
                background: "white",
                borderRadius: "8px",
                padding: "20px",
                border: "1px solid #dee2e6",
                marginTop: "16px",
                color :"black"
              }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#333" }}>Top Weapons</h3>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  fontSize: "14px"
                }}>
                  <div style={{ padding: "8px", background: "#f8f9fa", borderRadius: "4px" }}>
                    <strong>AWP Kills:</strong> {awpKills.toLocaleString()}
                  </div>
                  <div style={{ padding: "8px", background: "#f8f9fa", borderRadius: "4px" }}>
                    <strong>AK-47 Kills:</strong> {ak47Kills.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Footer */}
        {!stats && !error && !loading && (
          <div style={{
            textAlign: "center",
            marginTop: "40px",
            padding: "30px",
            background: "#f8f9fa",
            borderRadius: "12px",
            border: "2px dashed #dee2e6"
          }}>
            <p style={{ fontSize: "48px", margin: "0 0 16px 0" }}></p>
            <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
              Enter a Steam ID or username above to get started
            </p>
          </div>
        )}

        {/* Project Info */}
        <div style={{
          marginTop: "40px",
          padding: "20px",
          background: "#f8f9fa",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "14px",
          color: "#999"
        }}>
          <p style={{ margin: 0 }}>
            CS2 Stats Lookup
          </p>
        </div>
      </div>
    </div>
  );
}