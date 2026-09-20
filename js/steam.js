// js/steam.js

const steamCard = document.getElementById('steam-card');
const steamLabel = steamCard?.querySelector('.card-label');
const steamBadge = document.getElementById('steam-badge');
const steamGame = document.getElementById('steam-game-name');
const steamDetail = document.getElementById('steam-game-detail');

function updateCardBackground(appId) {
  if (!steamCard) return;
  if (appId) {
    const bannerUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
    steamCard.style.backgroundImage = `linear-gradient(rgba(18, 20, 24, 0.85), rgba(18, 20, 24, 0.95)), url('${bannerUrl}')`;
    steamCard.style.backgroundSize = 'cover';
    steamCard.style.backgroundPosition = 'center';
    steamCard.style.backgroundRepeat = 'no-repeat';
  } else {
    steamCard.style.backgroundImage = 'none';
  }
}

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

      updateCardBackground(player.gameid);
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

      updateCardBackground(topGame.appid);
    } else {
      steamGame.textContent = "No recent activity";
      if (steamDetail) steamDetail.textContent = "Offline";
      updateCardBackground(null);
    }

  } catch (err) {
    console.error("Steam API error:", err);
    steamGame.textContent = "API Offline";
    if (steamDetail) steamDetail.textContent = "Connection error";
    updateCardBackground(null);
  }
}

fetchSteamStatus();
setInterval(fetchSteamStatus, 60000);