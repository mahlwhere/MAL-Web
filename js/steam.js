// js/steam.js

const steamTitle = document.querySelector('.steam-card .card-label');
const steamGame = document.querySelector('.steam-card .primary-text');

async function fetchSteamStatus() {
  if (!steamTitle || !steamGame) return;

  try {
    const summaryRes = await fetch('/api/steam/summary');
    const summaryData = await summaryRes.json();
    const player = summaryData.response.players[0];

    if (player && player.gameextrainfo) {
      steamTitle.textContent = "Currently Playing";
      steamTitle.style.color = "var(--green)";
      steamGame.textContent = player.gameextrainfo;
      return;
    }

    const recentRes = await fetch('/api/steam');
    const recentData = await recentRes.json();
    
    if (recentData.response.games && recentData.response.games.length > 0) {
      steamTitle.textContent = "Recently Played";
      steamTitle.style.color = "var(--subtext)"; 
      steamGame.textContent = recentData.response.games[0].name;
    } else {
      steamGame.textContent = "No recent activity";
    }

  } catch (err) {
    console.error("Steam API error:", err);
    steamGame.textContent = "API Offline";
  }
}

fetchSteamStatus();
setInterval(fetchSteamStatus, 60000);