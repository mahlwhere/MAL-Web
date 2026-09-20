// js/ui.js
export const $ = (id) => document.getElementById(id);

export const ui = {
  clock: $('live-clock'),
  themeBtn: $('theme-btn'),
  term: {
    drawer: $('dropdown-terminal'),
    toggleBtn: $('toggle-terminal-btn'),
    closeBtn: $('close-terminal-btn'),
    input: $('terminal-input'),
    output: $('terminal-output')
  },
  github: {
    events: $('github-events')
  },
  steam: {
    name: $('steam-game-name'),
    detail: $('steam-game-detail'),
    badge: $('steam-badge'),
    card: $('steam-card')
  },
  discord: {
    avatar: $('discord-avatar'),
    user: $('discord-username'),
    subtext: $('discord-subtext'),
    badge: $('discord-badge'),
    addBtn: $('discord-add-link')
  },
  media: {
    viewer: $('media-content'),
    count: $('carousel-count'),
    prev: $('carousel-prev'),
    next: $('carousel-next')
  }
};