import { renderKeiko, initKeiko } from './keiko.js';
import { renderTournament, initTournament } from './tournament.js';
import { renderScoreboard, initScoreboard } from './scoreboard.js';

const content = document.getElementById('app-content');
const body = document.getElementById('app-body');
const bgColor = document.getElementById('bg-color');
const tabs = {
  keiko: document.getElementById('tab-keiko'),
  tournament: document.getElementById('tab-tournament'),
  scoreboard: document.getElementById('tab-scoreboard')
};

function switchTab(tab) {
  // Update Tab Styling
  Object.keys(tabs).forEach(k => {
    tabs[k].className = k === tab 
      ? 'tab-btn px-4 py-2 font-bold text-red-600 border-b-2 border-red-600' 
      : 'tab-btn px-4 py-2 font-bold text-gray-500 hover:text-gray-800';
  });

  // Inject HTML and Initialize Logic
  if (tab === 'keiko') {
    content.innerHTML = renderKeiko();
    initKeiko();
  } else if (tab === 'tournament') {
    content.innerHTML = renderTournament();
    initTournament();
  } else if (tab === 'scoreboard') {
    content.innerHTML = renderScoreboard();
    initScoreboard();
  }
}

// Bind Events
Object.keys(tabs).forEach(tab => {
  tabs[tab].addEventListener('click', () => switchTab(tab));
});

bgColor.addEventListener('input', (e) => {
  body.style.backgroundColor = e.target.value;
});

// Load default view
switchTab('keiko');