// js/discord.js
import { ui } from './ui.js';

const DISCORD_USER_ID = '800566082448392222';

function initLanyard() {
  if (ui.discord.addBtn) {
    ui.discord.addBtn.href = `https://discord.com/users/${DISCORD_USER_ID}`;
  }

  const socket = new WebSocket('wss://api.lanyard.rest/socket');

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const { op, t, d } = data;

    if (op === 1) {
      const heartbeatInterval = d.heartbeat_interval;
      setInterval(() => {
        socket.send(JSON.stringify({ op: 3 }));
      }, heartbeatInterval);

      socket.send(JSON.stringify({
        op: 2,
        d: { subscribe_to_id: DISCORD_USER_ID }
      }));
    }

    if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
      updateDiscordUI(d);
    }
  };

  socket.onclose = () => {
    setTimeout(initLanyard, 5000);
  };
}

function updateDiscordUI(data) {
  if (!data) return;

  const user = data.discord_user;
  const status = data.discord_status;

  if (user) {
    ui.discord.user.textContent = user.global_name || user.username;
    if (user.avatar) {
      ui.discord.avatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
    }
  }

  ui.discord.badge.textContent = status.toUpperCase();
  ui.discord.badge.className = 'badge';
  if (status === 'online') ui.discord.badge.classList.add('online');
  else if (status === 'idle') ui.discord.badge.classList.add('idle');
  else if (status === 'dnd') ui.discord.badge.classList.add('dnd');

  if (data.listening_to_spotify && data.spotify) {
    ui.discord.subtext.textContent = `🎵 ${data.spotify.song} - ${data.spotify.artist}`;
  } else if (data.activities && data.activities.length > 0) {
    const game = data.activities.find(a => a.type === 0);
    const custom = data.activities.find(a => a.type === 4);
    
    if (game) {
      ui.discord.subtext.textContent = `Playing ${game.name}`;
    } else if (custom && custom.state) {
      ui.discord.subtext.textContent = custom.state;
    } else {
      ui.discord.subtext.textContent = 'Active on Discord';
    }
  } else {
    ui.discord.subtext.textContent = status === 'offline' ? 'Currently Offline' : 'No active game/music';
  }
}

initLanyard();