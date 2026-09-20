// js/clock.js
import { ui } from './ui.js';

function updateClocks() {
  const now = new Date();
  const localTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const utcHours = String(now.getUTCHours()).padStart(2, '0');
  const utcMins = String(now.getUTCMinutes()).padStart(2, '0');
  
  if (ui.clock) {
    ui.clock.textContent = `LOCAL: ${localTime} | UTC: ${utcHours}:${utcMins}`;
  }
}

setInterval(updateClocks, 1000);
updateClocks();