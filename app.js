// --- Shared Utility: Web Audio API Sound Generator ---
window.playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    const now = ctx.currentTime;
    
    if (type === 'start') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, now);
      gainNode.gain.setValueAtTime(1, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'idle') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(600, now);
      gainNode.gain.setValueAtTime(0.5, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      osc.start(now); osc.stop(now + 1.5);
    } else if (type === 'end') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now);
      gainNode.gain.setValueAtTime(1, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
      osc.start(now); osc.stop(now + 1.0);
    }
  } catch (err) { console.warn("Audio playback failed.", err); }
};

window.formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// --- App Navigation Logic ---
const tabs = {
  keiko: document.getElementById('tab-keiko'),
  tournament: document.getElementById('tab-tournament'),
  scoreboard: document.getElementById('tab-scoreboard')
};

window.switchTab = (tab) => {
  // Clear any running timers from other modules
  if (window.k_timerRef) clearInterval(window.k_timerRef);
  if (window.sb_timerRef) clearInterval(window.sb_timerRef);

  // Update Nav Styling
  Object.keys(tabs).forEach(k => {
    tabs[k].className = k === tab 
      ? 'tab-btn px-4 py-1.5 rounded-md text-sm font-medium transition bg-white shadow-sm text-gray-900' 
      : 'tab-btn px-4 py-1.5 rounded-md text-sm font-medium transition text-gray-500 hover:text-gray-700';
  });

  const content = document.getElementById('app-content');
  
  if (tab === 'keiko') {
    content.innerHTML = renderKeikoShell();
    initKeiko();
  } else if (tab === 'tournament') {
    content.innerHTML = renderTournamentShell();
    initTournament();
  } else if (tab === 'scoreboard') {
    content.innerHTML = renderScoreboardShell();
    initScoreboard();
  }
  
  // Render Lucide icons after injecting HTML
  lucide.createIcons();
};

Object.keys(tabs).forEach(tab => {
  tabs[tab].addEventListener('click', () => switchTab(tab));
});

document.getElementById('bg-color').addEventListener('input', (e) => {
  document.getElementById('app-body').style.backgroundColor = e.target.value;
});
