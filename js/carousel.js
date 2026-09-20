// js/carousel.js
import { $, ui } from './ui.js';

let galleryData = [];
let currentMediaIndex = 0;

async function initCarousel() {
  if (!ui.media.viewer) return;

  setupLightbox();

  try {
    const res = await fetch('gallery.json');
    if (!res.ok) throw new Error('Gallery not found');
    
    galleryData = await res.json();
    
    if (galleryData.length > 0) {
      renderMediaItem();
      
      ui.media.prev.addEventListener('click', () => {
        currentMediaIndex = (currentMediaIndex - 1 + galleryData.length) % galleryData.length;
        renderMediaItem();
      });

      ui.media.next.addEventListener('click', () => {
        currentMediaIndex = (currentMediaIndex + 1) % galleryData.length;
        renderMediaItem();
      });
    } else {
      ui.media.viewer.innerHTML = '<span class="media-placeholder">Gallery is empty</span>';
      ui.media.count.textContent = '0 / 0';
    }
  } catch (err) {
    ui.media.viewer.innerHTML = `<span class="media-placeholder" style="color:#f85149;">Error: ${err.message}</span>`;
  }
}

function renderMediaItem() {
  const item = galleryData[currentMediaIndex];

  ui.media.count.textContent = `${currentMediaIndex + 1} / ${galleryData.length}`;
  ui.media.viewer.innerHTML = '';

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
  mediaEl.addEventListener('click', () => openLightbox(item));
  ui.media.viewer.appendChild(mediaEl);

  if (item.caption) {
    const cap = document.createElement('div');
    cap.className = 'carousel-caption';
    cap.textContent = item.caption;
    ui.media.viewer.appendChild(cap);
  }
}

function setupLightbox() {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.className = 'lightbox';
  
  const content = document.createElement('div');
  content.id = 'lightbox-content';
  
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === content) {
      overlay.classList.remove('active');
      content.innerHTML = ''; 
    }
  });
}

function openLightbox(item) {
  const overlay = $('lightbox-overlay');
  const content = $('lightbox-content');
  content.innerHTML = '';

  if (item.type === 'video') {
    const vid = document.createElement('video');
    vid.src = item.src;
    vid.className = 'lightbox-media';
    vid.autoplay = true;
    vid.controls = true; 
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