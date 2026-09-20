// clock widget
function updateClocks() {
  const now = new Date();
  
  // local time format
  const localTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  // utc format
  const utcHours = String(now.getUTCHours()).padStart(2, '0');
  const utcMins = String(now.getUTCMinutes()).padStart(2, '0');
  
  const clockEl = document.getElementById('live-clock');
  if (clockEl) {
    clockEl.textContent = `LOCAL: ${localTime} | UTC: ${utcHours}:${utcMins}`;
  }
}
setInterval(updateClocks, 1000);
updateClocks();

// mode switch
const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// yaku logic
const terminalDrawer = document.getElementById('dropdown-terminal');
const toggleBtn = document.getElementById('toggle-terminal-btn');
const closeBtn = document.getElementById('close-terminal-btn');
const termInput = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');

function toggleTerminal() {
  terminalDrawer.classList.toggle('open');
  if (terminalDrawer.classList.contains('open')) {
    termInput.focus();
  }
}

toggleBtn.addEventListener('click', toggleTerminal);
closeBtn.addEventListener('click', toggleTerminal);

// listener for yaku keypress
window.addEventListener('keydown', (e) => {
  if (e.key === '`' || e.key === '~') {
    e.preventDefault();
    toggleTerminal();
  }
});

// yaku commands
termInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const rawCmd = termInput.value.trim();
    termInput.value = '';
    if (!rawCmd) return;

    printOutput(`$ ${rawCmd}`);
    handleCommand(rawCmd.toLowerCase());
    termOutput.scrollTop = termOutput.scrollHeight;
  }
});

function printOutput(text, isError = false) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  if (isError) line.style.color = '#f85149';
  line.textContent = text;
  termOutput.appendChild(line);
}

function handleCommand(cmd) {
  switch (cmd) {
    case 'help':
      printOutput("Available commands:");
      printOutput("help       - show this manual");
      printOutput("clear      - wipe terminal screen");
      printOutput("fastfetch  - print system summary");
      printOutput("theme light- switch to light theme");
      printOutput("theme dark - switch to dark theme");
      printOutput("repo       - link to MAL-Web GitHub repo");
      break;
    case 'clear':
      termOutput.innerHTML = '';
      break;
    case 'fastfetch':
    case 'neofetch':
      printOutput("OS: Arch Linux x86_64");
      printOutput("Host: mahlarch");
      printOutput("VPS: Debian 12 (OVH)");
      printOutput("Stack: Caddy/Docker");
      break;
    case 'theme light':
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      printOutput("Theme set to light.");
      break;
    case 'theme dark':
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      printOutput("Theme set to dark.");
      break;
    case 'repo':
      window.open('https://github.com/mahlwhere/MAL-Web', '_blank');
      printOutput("Opening GitHub repository...");
      break;
    default:
      printOutput(`command not found: ${cmd}. Type 'help' for options.`, true);
  }
}
// commit tracker stuff
const GITHUB_USER = 'mahlwhere';
const GITHUB_REPO = 'MAL-Web';

async function fetchLatestCommits() {
  const container = document.getElementById('github-events');
  if (!container) return;

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/commits?per_page=4`);
    
    if (!res.ok) {
      if (res.status === 403) {
        container.innerHTML = '<div class="feed-item" style="color: #d29922;">Rate limit reached. Try again later.</div>';
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const commits = await res.json();
    container.innerHTML = '';

    commits.forEach(item => {
      // get first line of commit
      const fullMessage = item.commit.message;
      const title = fullMessage.split('\n')[0];
      
      // relative time format conversion
      const commitDate = new Date(item.commit.author.date);
      const timeAgo = formatTimeAgo(commitDate);

      // sha hash truncate
      const shortSha = item.sha.substring(0, 7);

      const el = document.createElement('div');
      el.className = 'feed-item';
      el.innerHTML = `
        <div style="display: flex; justify-content: space-between; gap: 8px;">
          <a href="${item.html_url}" target="_blank" class="commit-msg" title="${fullMessage.replace(/"/g, '&quot;')}">${title}</a>
          <span class="commit-time">${timeAgo}</span>
        </div>
        <div style="font-size: 0.72rem; color: var(--subtext); margin-top: 2px;">
          <code style="color: var(--arch-cyan);">${shortSha}</code> by ${item.commit.author.name}
        </div>
      `;
      container.appendChild(el);
    });

  } catch (err) {
    container.innerHTML = `<div class="feed-item" style="color: #f85149;">Failed to load commits: ${err.message}</div>`;
  }
}

// relative timestamp stuff
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// initial fetch and refresh (2 mins)
fetchLatestCommits();
setInterval(fetchLatestCommits, 120000);

// steam tracker stuff
async function fetchSteamActivity() {
  const gameNameEl = document.getElementById('steam-game-name');
  const gameDetailEl = document.getElementById('steam-game-detail');
  const badgeEl = document.getElementById('steam-badge');
  const steamCard = document.getElementById('steam-card');

  if (!gameNameEl) return;

  try {
    const res = await fetch('/api/steam');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const games = data.response?.games;

    if (games && games.length > 0) {
      const recent = games[0];
      const hoursPast2Weeks = (recent.playtime_2weeks / 60).toFixed(1);
      const totalHours = (recent.playtime_forever / 60).toFixed(1);

      gameNameEl.textContent = recent.name;
      gameDetailEl.textContent = `${hoursPast2Weeks} hrs past 2 weeks • ${totalHours} hrs total`;

      // header badge
      badgeEl.textContent = 'Active / Recent';
      badgeEl.classList.add('online');

      // game logo banner stuff
      let imgEl = document.getElementById('steam-game-icon');
      if (!imgEl && recent.appid) {
        imgEl = document.createElement('img');
        imgEl.id = 'steam-game-icon';
        imgEl.style.width = '100%';
        imgEl.style.borderRadius = '4px';
        imgEl.style.marginTop = '8px';
        imgEl.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${recent.appid}/header.jpg`;
        steamCard.appendChild(imgEl);
      }
    } else {
      gameNameEl.textContent = 'Offline / Inactive';
      gameDetailEl.textContent = 'No game played in the last 2 weeks';
      badgeEl.textContent = 'Offline';
      badgeEl.classList.remove('online');
    }
  } catch (err) {
    gameNameEl.textContent = 'Steam Sync Unavailable';
    gameDetailEl.textContent = 'Check API endpoint';
    badgeEl.textContent = 'Error';
  }
}

// fetch & poll (5 min)
fetchSteamActivity();
setInterval(fetchSteamActivity, 300000);

// discord live presence (lanyard)
const DISCORD_USER_ID = '800566082448392222';

function initLanyard() {
  const avatarEl = document.getElementById('discord-avatar');
  const userEl = document.getElementById('discord-username');
  const subtextEl = document.getElementById('discord-subtext');
  const badgeEl = document.getElementById('discord-badge');
  const addBtn = document.getElementById('discord-add-link');

  if (addBtn) {
    addBtn.href = `https://discord.com/users/${DISCORD_USER_ID}`;
  }

  const socket = new WebSocket('wss://api.lanyard.rest/socket');

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const { op, t, d } = data;

    // lanyard heartbeat start
    if (op === 1) {
      const heartbeatInterval = d.heartbeat_interval;
      setInterval(() => {
        socket.send(JSON.stringify({ op: 3 }));
      }, heartbeatInterval);

      // init presence sub
      socket.send(JSON.stringify({
        op: 2,
        d: { subscribe_to_id: DISCORD_USER_ID }
      }));
    }

    // event updates
    if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
      updateDiscordUI(d);
    }
  };

  socket.onclose = () => {
    // reconnect after 5 seconds
    setTimeout(initLanyard, 5000);
  };
}

function updateDiscordUI(data) {
  const avatarEl = document.getElementById('discord-avatar');
  const userEl = document.getElementById('discord-username');
  const subtextEl = document.getElementById('discord-subtext');
  const badgeEl = document.getElementById('discord-badge');

  if (!data) return;

  const user = data.discord_user;
  const status = data.discord_status; // online, idle, dnd, offline

  // pfp & username
  if (user) {
    userEl.textContent = user.global_name || user.username;
    if (user.avatar) {
      avatarEl.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
    }
  }

  // status styling
  badgeEl.textContent = status.toUpperCase();
  badgeEl.className = 'badge';
  if (status === 'online') badgeEl.classList.add('online');
  else if (status === 'idle') badgeEl.classList.add('idle');
  else if (status === 'dnd') badgeEl.classList.add('dnd');

  // detailed activity
  if (data.listening_to_spotify && data.spotify) {
    subtextEl.textContent = `🎵 ${data.spotify.song} - ${data.spotify.artist}`;
  } else if (data.activities && data.activities.length > 0) {
    // first non-custom activity
    const game = data.activities.find(a => a.type === 0);
    const custom = data.activities.find(a => a.type === 4);
    
    if (game) {
      subtextEl.textContent = `Playing ${game.name}`;
    } else if (custom && custom.state) {
      subtextEl.textContent = custom.state;
    } else {
      subtextEl.textContent = 'Active on Discord';
    }
  } else {
    subtextEl.textContent = status === 'offline' ? 'Currently Offline' : 'No active game/music';
  }
}

initLanyard();

// carousel & lightbox
let galleryData = [];
let currentMediaIndex = 0;

async function initCarousel() {
  const viewer = document.getElementById('media-content');
  const countEl = document.getElementById('carousel-count');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!viewer) return;

  setupLightbox();

  try {
    const res = await fetch('gallery.json');
    if (!res.ok) throw new Error('Gallery not found');
    
    galleryData = await res.json();
    
    if (galleryData.length > 0) {
      renderMediaItem();
      
      prevBtn.addEventListener('click', () => {
        currentMediaIndex = (currentMediaIndex - 1 + galleryData.length) % galleryData.length;
        renderMediaItem();
      });

      nextBtn.addEventListener('click', () => {
        currentMediaIndex = (currentMediaIndex + 1) % galleryData.length;
        renderMediaItem();
      });
    } else {
      viewer.innerHTML = '<span class="media-placeholder">Gallery is empty</span>';
      countEl.textContent = '0 / 0';
    }
  } catch (err) {
    viewer.innerHTML = `<span class="media-placeholder" style="color:#f85149;">Error: ${err.message}</span>`;
  }
}

function renderMediaItem() {
  const viewer = document.getElementById('media-content');
  const countEl = document.getElementById('carousel-count');
  const item = galleryData[currentMediaIndex];

  countEl.textContent = `${currentMediaIndex + 1} / ${galleryData.length}`;
  viewer.innerHTML = '';

  let mediaEl;
  if (item.type === 'video') {
    mediaEl = document.createElement('video');
    mediaEl.src = item.src;
    mediaEl.autoplay = true;
    mediaEl.loop = true;
    mediaEl.muted = true;
  } else {
    mediaEl = document.createElement('img');
    mediaEl.src = item.src;
    mediaEl.alt = item.caption || 'Gallery image';
  }

  mediaEl.className = 'carousel-media';
  
  // more lightbox
  mediaEl.addEventListener('click', () => openLightbox(item));
  
  viewer.appendChild(mediaEl);

  if (item.caption) {
    const cap = document.createElement('div');
    cap.className = 'carousel-caption';
    cap.textContent = item.caption;
    viewer.appendChild(cap);
  }
}

// even more lightbox
function setupLightbox() {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.className = 'lightbox';
  
  const content = document.createElement('div');
  content.id = 'lightbox-content';
  
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // close lightbox
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === content) {
      overlay.classList.remove('active');
      content.innerHTML = ''; // wipe content to prevent background audio
    }
  });
}

function openLightbox(item) {
  const overlay = document.getElementById('lightbox-overlay');
  const content = document.getElementById('lightbox-content');
  content.innerHTML = '';

  if (item.type === 'video') {
    const vid = document.createElement('video');
    vid.src = item.src;
    vid.className = 'lightbox-media';
    vid.autoplay = true;
    vid.controls = true; // fullscreen scrub/mute controls
    content.appendChild(vid);
  } else {
    const img = document.createElement('img');
    img.src = item.src;
    img.className = 'lightbox-media';
    content.appendChild(img);
  }
  
  overlay.classList.add('active');
}

initCarousel();