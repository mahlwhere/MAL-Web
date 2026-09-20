// js/countdown.js

// est helper function
function parseEasternTime(dateString) {
  const isoBase = dateString.replace(' ', 'T');
  
  // temp date to check daylight savings
  const tempDate = new Date(isoBase);
  const nyTimeStr = tempDate.toLocaleString("en-US", { 
    timeZone: "America/New_York", 
    timeZoneName: "short" 
  });
  
  // edt/est assignment
  const offset = nyTimeStr.includes("EDT") ? "-04:00" : "-05:00";
  return new Date(isoBase + offset).getTime();
}

// add events here
const trackedEvents = [
  { id: 'event-1', name: 'Ace Combat 8: Wings of Theve', date: parseEasternTime('2026-10-01 18:00:00') },
  { id: 'event-2', name: 'ArmA 4', date: parseEasternTime('2027-10-01 00:00:00') }
];

const container = document.getElementById('countdown-list');

function initCountdowns() {
  if (!container) return;
  
  // build elements
  trackedEvents.forEach(evt => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="primary-text" style="font-size: 0.95rem;">${evt.name}</div>
      <div id="${evt.id}-timer" style="font-family: monospace; font-size: 1.15rem; color: var(--arch-cyan); margin-top: 2px;">
        --d --h --m --s
      </div>
    `;
    container.appendChild(el);
  });

  // start the loop
  updateTimers();
  setInterval(updateTimers, 1000);
}

function updateTimers() {
  const now = new Date().getTime();

  trackedEvents.forEach(evt => {
    const timerEl = document.getElementById(`${evt.id}-timer`);
    if (!timerEl) return;

    const distance = evt.date - now;

    if (distance < 0) {
      timerEl.textContent = "LAUNCHED / ARRIVED";
      timerEl.style.color = "var(--green)";
      return;
    }

    // math stuff
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');

    // update the text node only
    timerEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  });
}

initCountdowns();