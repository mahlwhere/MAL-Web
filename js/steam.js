// js/steam.js
import { $, ui } from './ui.js';

function updateGameBanner(appId) {
  let imgEl = $('steam-game-icon');
  
  if (appId) {
    if (!imgEl) {
      imgEl = document.createElement('img');
      imgEl.id = 'steam-game-icon';
      imgEl.style.width = '100%';
      imgEl.style.borderRadius = '4px';
      imgEl.style.marginTop = '8px';
      ui.steam.card.appendChild(imgEl);
    }
    imgEl.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
    imgEl.style.display = 'block';
  } else if (imgEl) {
    imgEl.style.display = 'none';
  }
}

async function fetchSteamActivity() {
  if (!ui.steam.name) return;

  try {
    const summaryRes = await fetch('/api/steam/summary');
    if (summaryRes.ok) {
      const summaryData = await summaryRes.json();
      const player = summaryData.response?.players?.[0];

      if (player && player.gameextrainfo) {
        ui.steam.name.textContent = player.gameextrainfo;
        ui.steam.detail.textContent = 'Currently in-game';
        ui.steam.badge.textContent = 'Playing';
        ui.steam.badge.classList.add('online');

        updateGameBanner(player.gameid);
        return;
      }
    }

    const recentRes = await fetch('/api/steam');
    if (!recentRes.ok) throw new Error(`HTTP ${recentRes.status}`);

    const recentData = await recentRes.json();
    const games = recentData.response?.games;

    if (games && games.length > 0) {
      const recent = games[0];
      const hoursPast2Weeks = (recent.playtime_2weeks / 60).toFixed(1);
      const totalHours = (recent.playtime_forever / 60).toFixed(1);

      ui.steam.name.textContent = recent.name;
      ui.steam.detail.textContent = `${hoursPast2Weeks} hrs past 2 weeks • ${totalHours} hrs total`;
      ui.steam.badge.textContent = 'Recent';
      ui.steam.badge.classList.remove('online');

      updateGameBanner(recent.appid);
    } else {
      ui.steam.name.textContent = 'Offline / Inactive';
      ui.steam.detail.textContent = 'No game played in the last 2 weeks';
      ui.steam.badge.textContent = 'Offline';
      ui.steam.badge.classList.remove('online');

      updateGameBanner(null);
    }

  } catch (err) {
    console.error('Steam sync failed:', err);
    ui.steam.name.textContent = 'Steam Sync Unavailable';
    ui.steam.detail.textContent = 'Check API endpoint';
    ui.steam.badge.textContent = 'Error';
    ui.steam.badge.classList.remove('online');
    updateGameBanner(null);
  }
}

fetchSteamActivity();
setInterval(fetchSteamActivity, 60000);