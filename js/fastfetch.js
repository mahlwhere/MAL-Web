// js/fastfetch.js
import { $ } from './ui.js';

async function loadFastfetchComponent() {
  const container = $('fastfetch-container');
  if (!container) return;

  try {
    const res = await fetch('components/fastfetch.html');
    if (!res.ok) throw new Error('Failed to load fastfetch component');
    
    // Convert the response to raw text (HTML) and inject it
    container.innerHTML = await res.text();
    
    // Optional: Unwrap the container so the <section> sits perfectly in the grid
    const section = container.firstElementChild;
    container.replaceWith(section);
    
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="card"><span style="color:#f85149">Error loading specs.</span></div>`;
  }
}

loadFastfetchComponent();