// js/github.js
import { $, ui } from './ui.js';

const GITHUB_USER = 'mahlwhere';
const GITHUB_REPO = 'MAL-Web';

async function fetchLatestCommits() {
  if (!ui.github.events) return;

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/commits?per_page=4`);
    
    if (!res.ok) {
      if (res.status === 403) {
        ui.github.events.innerHTML = '<div class="feed-item" style="color: #d29922;">Rate limit reached. Try again later.</div>';
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const commits = await res.json();
    ui.github.events.innerHTML = '';
    
    // Grab the template and create the staging area
    const template = $('commit-template');
    const fragment = document.createDocumentFragment();

    commits.forEach(item => {
      // Clone the template's internal structure
      const clone = template.content.cloneNode(true);
      
      // Populate the cloned elements using querySelector
      const link = clone.querySelector('.commit-msg');
      link.href = item.html_url;
      link.textContent = item.commit.message.split('\n')[0];
      
      clone.querySelector('.commit-time').textContent = formatTimeAgo(new Date(item.commit.author.date));
      clone.querySelector('.commit-sha').textContent = item.sha.substring(0, 7);
      clone.querySelector('.commit-author').textContent = item.commit.author.name;
      
      fragment.appendChild(clone);
    });

    ui.github.events.appendChild(fragment);

  } catch (err) {
    ui.github.events.innerHTML = `<div class="feed-item" style="color: #f85149;">Failed to load commits: ${err.message}</div>`;
  }
}

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

fetchLatestCommits();
setInterval(fetchLatestCommits, 120000);