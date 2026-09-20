// js/steam.js
import { $, ui } from './ui.js';

async function fetchSteamActivity() {
  if (!ui.steam.name) return;

  try {
    const res = await fetch('/api/steam');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const games = data.response?.games;

    if (games && games.length > 0) {
      const recent = games[0];
      const hoursPast2Weeks = (recent.playtime_2weeks / 60).toFixed(1);
      const totalHours = (recent.playtime_forever / 60).toFixed(1);

      ui.steam.name.textContent = recent.name;
      ui.steam.detail.textContent = `${hoursPast2Weeks} hrs past 2 weeks • ${totalHours} hrs total`;

      ui.steam.badge.textContent = 'Active / Recent';
      ui.steam.badge.classList.add('online');

      let imgEl = $('steam-game-icon');
      if (!imgEl && recent.appid) {
        imgEl = document.createElement('img');
        imgEl.id = 'steam-game-icon';
        imgEl.style.width = '100%';
        imgEl.style.borderRadius = '4px';
        imgEl.style.marginTop = '8px';
        imgEl.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${recent.appid}/header.jpg`;
        ui.steam.card.appendChild(imgEl);
      }
    } else {
      ui.steam.name.textContent = 'Offline / Inactive';
      ui.steam.detail.textContent = 'No game played in the last 2 weeks';
      ui.steam.badge.textContent = 'Offline';
      ui.steam.badge.classList.remove('online');
    }
  } catch (err) {
    ui.steam.name.textContent = 'Steam Sync Unavailable';
    ui.steam.detail.textContent = 'Check API endpoint';
    ui.steam.badge.textContent = 'Error';
  }
}

fetchSteamActivity();
setInterval(fetchSteamActivity, 300000);