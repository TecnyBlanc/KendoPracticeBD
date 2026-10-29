let k_phase = 'stopped'; // stopped, round, idle, finished
let k_roundTime = 180;
let k_idleTime = 30;
let k_totalRounds = 0;
let k_currentRound = 1;
let k_timeLeft = 180;
window.k_timerRef = null;

function renderKeikoShell() {
  return `
    <div class="max-w-5xl w-full mx-auto p-4 md:p-10 bg-white rounded-2xl shadow-sm border border-gray-200">
      <h2 class="text-3xl md:text-4xl font-light mb-8 flex items-center gap-3">
        <i data-lucide="timer" class="w-8 h-8 md:w-10 md:h-10 text-gray-500"></i> Mawari Geiko Timer
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div>
          <label class="block text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wider mb-2">Round (sec)</label>
          <input type="number" id="k-inp-round" class="w-full px-4 py-3 text-lg md:text-xl border rounded-lg focus:ring-2 focus:ring-gray-400 outline-none" />
        </div>
        <div>
          <label class="block text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wider mb-2">Rest 交代 (sec)</label>
          <input type="number" id="k-inp-rest" class="w-full px-4 py-3 text-lg md:text-xl border rounded-lg focus:ring-2 focus:ring-gray-400 outline-none" />
        </div>
        <div>
          <label class="block text-sm md:text-base font-semibold text-gray-500 uppercase tracking-wider mb-2">Rounds (0=∞)</label>
          <input type="number" id="k-inp-rounds" class="w-full px-4 py-3 text-lg md:text-xl border rounded-lg focus:ring-2 focus:ring-gray-400 outline-none" />
        </div>
      </div>

      <div class="flex flex-col items-center justify-center p-8 md:p-16 bg-gray-50 rounded-2xl mb-10">
        <div id="k-status-text" class="text-lg md:text-2xl font-bold text-gray-400 tracking-widest uppercase mb-4">Ready</div>
        <div id="k-time-display" class="text-[6rem] sm:text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none font-mono tabular-nums font-light text-gray-900">03:00</div>
        <div id="k-round-display" class="mt-4 md:mt-8 text-2xl md:text-4xl text-gray-500 font-light">Round 1 (Infinite)</div>
      </div>

      <div class="flex flex-wrap justify-center gap-4 md:gap-8" id="k-controls">
        <!-- Buttons injected by JS -->
      </div>
    </div>
  `;
}

function updateKeikoUI() {
  const timeDisplay = document.getElementById('k-time-display');
  timeDisplay.innerText = formatTime(k_timeLeft);
  
  if(k_phase === 'idle') { timeDisplay.className = "text-[6rem] sm:text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none font-mono tabular-nums font-light text-blue-600"; }
  else { timeDisplay.className = "text-[6rem] sm:text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none font-mono tabular-nums font-light text-gray-900"; }

  document.getElementById('k-status-text').innerText = k_phase === 'round' ? 'Keiko' : k_phase === 'idle' ? '交代 (Rest)' : k_phase === 'finished' ? 'Finished' : 'Ready';
  document.getElementById('k-round-display').innerText = `Round ${k_currentRound} ${k_totalRounds > 0 ? `/ ${k_totalRounds}` : '(Infinite)'}`;
  
  const inps = ['k-inp-round', 'k-inp-rest', 'k-inp-rounds'];
  inps.forEach(id => document.getElementById(id).disabled = (k_phase !== 'stopped' && k_phase !== 'finished'));

  const controls = document.getElementById('k-controls');
  if (k_phase === 'stopped' || k_phase === 'finished') {
    controls.innerHTML = `
      <button id="k-btn-start" class="flex items-center justify-center gap-3 px-8 py-4 md:px-14 md:py-6 text-xl md:text-3xl font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition w-full sm:w-auto">
        <i data-lucide="play" class="w-6 h-6 md:w-10 md:h-10"></i> Start
      </button>
      <button id="k-btn-reset" class="flex items-center justify-center gap-3 px-8 py-4 md:px-12 md:py-6 text-xl md:text-2xl font-semibold bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition w-full sm:w-auto">
        <i data-lucide="rotate-ccw" class="w-6 h-6 md:w-8 md:h-8"></i> Reset
      </button>
    `;
  } else {
    controls.innerHTML = `
      <button id="k-btn-pause" class="flex items-center justify-center gap-3 px-8 py-4 md:px-14 md:py-6 text-xl md:text-3xl font-semibold bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition w-full sm:w-auto">
        <i data-lucide="pause" class="w-6 h-6 md:w-10 md:h-10"></i> Pause
      </button>
      <button id="k-btn-reset" class="flex items-center justify-center gap-3 px-8 py-4 md:px-12 md:py-6 text-xl md:text-2xl font-semibold bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition w-full sm:w-auto">
        <i data-lucide="rotate-ccw" class="w-6 h-6 md:w-8 md:h-8"></i> Reset
      </button>
    `;
  }
  lucide.createIcons();

  // Re-bind buttons after innerHTML swap
  if(document.getElementById('k-btn-start')) document.getElementById('k-btn-start').onclick = startKeiko;
  if(document.getElementById('k-btn-pause')) document.getElementById('k-btn-pause').onclick = pauseKeiko;
  document.getElementById('k-btn-reset').onclick = resetKeiko;
}

function handlePhaseTransition() {
  if (k_phase === 'round') {
    if (k_totalRounds > 0 && k_currentRound >= k_totalRounds) {
      k_phase = 'finished'; playSound('end'); clearInterval(window.k_timerRef);
    } else {
      k_phase = 'idle'; k_timeLeft = k_idleTime; playSound('idle');
    }
  } else if (k_phase === 'idle') {
    k_currentRound++; k_phase = 'round'; k_timeLeft = k_roundTime; playSound('start');
  }
  updateKeikoUI();
}

function startKeiko() {
  if (k_phase === 'stopped' || k_phase === 'finished') { k_currentRound = 1; k_timeLeft = k_roundTime; }
  k_phase = 'round'; playSound('start'); updateKeikoUI();
  window.k_timerRef = setInterval(() => {
    k_timeLeft--;
    if (k_timeLeft <= 0) handlePhaseTransition();
    else updateKeikoUI();
  }, 1000);
}

function pauseKeiko() { k_phase = 'stopped'; clearInterval(window.k_timerRef); updateKeikoUI(); }
function resetKeiko() { k_phase = 'stopped'; clearInterval(window.k_timerRef); k_currentRound = 1; k_timeLeft = k_roundTime; updateKeikoUI(); }

function initKeiko() {
  document.getElementById('k-inp-round').value = k_roundTime;
  document.getElementById('k-inp-rest').value = k_idleTime;
  document.getElementById('k-inp-rounds').value = k_totalRounds;

  document.getElementById('k-inp-round').oninput = (e) => { k_roundTime = Number(e.target.value); k_timeLeft = k_roundTime; updateKeikoUI(); };
  document.getElementById('k-inp-rest').oninput = (e) => k_idleTime = Number(e.target.value);
  document.getElementById('k-inp-rounds').oninput = (e) => k_totalRounds = Number(e.target.value);
  updateKeikoUI();
}
