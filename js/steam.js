// js/steam.js

const steamCard = document.getElementById('steam-card');
const steamLabel = steamCard?.querySelector('.card-label');
const steamBadge = document.getElementById('steam-badge');
const steamGame = document.getElementById('steam-game-name');
const steamDetail = document.getElementById('steam-game-detail');

async function fetchSteamStatus() {
  if (!steamGame) return;

  try {
    const summaryRes = await fetch('/api/steam/summary');
    const summaryData = await summaryRes.json();
    const player = summaryData?.response?.players?.[0];

    if (player && player.gameextrainfo) {
      if (steamLabel) steamLabel.textContent = "Steam Activity";
      if (steamBadge) {
        steamBadge.textContent = "In-Game";
        steamBadge.style.color = "var(--green, #a6e3a1)";
      }
      steamGame.textContent = player.gameextrainfo;
      if (steamDetail) steamDetail.textContent = "Currently playing";
      return;
    }

    const recentRes = await fetch('/api/steam');
    const recentData = await recentRes.json();
    
    if (recentData?.response?.games && recentData.response.games.length > 0) {
      const topGame = recentData.response.games[0];
      if (steamLabel) steamLabel.textContent = "Steam Activity";
      if (steamBadge) {
        steamBadge.textContent = "Away";
        steamBadge.style.color = "";
      }
      steamGame.textContent = topGame.name;
      if (steamDetail) {
        const hours = Math.round(topGame.playtime_2weeks / 60);
        steamDetail.textContent = `${hours} hrs past 2 weeks`;
      }
    } else {
      steamGame.textContent = "No recent activity";
      if (steamDetail) steamDetail.textContent = "Offline";
    }

  } catch (err) {
    console.error("Steam API error:", err);
    steamGame.textContent = "API Offline";
    if (steamDetail) steamDetail.textContent = "Connection error";
  }
}

fetchSteamStatus();
setInterval(fetchSteamStatus, 60000);