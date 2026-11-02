let sb_matchMode = 'individual';
let sb_teamSize = 5;
let sb_matchTime = 180;
let sb_timeLeft = 180;
let sb_isRunning = false;
let sb_shiroPoints = [];
let sb_akaPoints = [];
let sb_shiroHansoku = 0;
let sb_akaHansoku = 0;
let sb_isEnchou = false;
let sb_isDaihyousen = false;
let sb_teamPos = 0;
let sb_teamStats = { shiroWins: 0, shiroPts: 0, akaWins: 0, akaPts: 0 };
let sb_history = [];
window.sb_timerRef = null;

const pos5 = ['先鋒 Senpo', '次鋒 Jiho', '中堅 Chuken', '副将 Fukusho', '大将 Taisho'];
const pos3 = ['先鋒 Senpo', '中堅 Chuken', '大将 Taisho'];

function renderScoreboardShell() {
  return `<div id="sb-main" class="max-w-[1400px] w-full mx-auto bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-800 text-white"></div>`;
}

function updateScoreboardUI() {
  const isMatchOver = sb_shiroPoints.length >= 2 || sb_akaPoints.length >= 2;
  const activePos = sb_teamSize === 3 ? pos3 : pos5;
  
  if (sb_isRunning && sb_timeLeft > 0 && !isMatchOver && !window.sb_timerRef) {
    window.sb_timerRef = setInterval(() => {
      sb_timeLeft--;
      if (sb_timeLeft <= 0) { sb_isRunning = false; clearInterval(window.sb_timerRef); window.sb_timerRef=null; window.playSound('end'); }
      updateScoreboardUI();
    }, 1000);
  } else if ((!sb_isRunning || isMatchOver) && window.sb_timerRef) {
    clearInterval(window.sb_timerRef); window.sb_timerRef=null;
  }

  // Highly compacted circles and triangles
  const renderPts = (pts) => `<div class="flex gap-3 md:gap-4 min-h-[48px] md:min-h-[64px]">${pts.map(p => `<div class="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-current flex items-center justify-center text-2xl md:text-4xl font-black">${p}</div>`).join('')}</div>`;
  const renderHans = (cnt) => `<div class="flex gap-1.5 mt-1 md:mt-2 min-h-[16px] md:min-h-[20px]">${Array(cnt).fill(0).map(()=>`<div class="w-0 h-0 border-l-[8px] md:border-l-[12px] border-l-transparent border-r-[8px] md:border-r-[12px] border-r-transparent border-b-[12px] md:border-b-[20px] border-b-yellow-500"></div>`).join('')}</div>`;

  document.getElementById('sb-main').innerHTML = `
    <!-- Top Mode Toggle (Squashed margins) -->
    <div class="bg-gray-800 p-1.5 md:p-2 flex flex-wrap justify-center gap-2 text-xs md:text-sm font-semibold border-b border-gray-700">
      <button onclick="sb_matchMode='individual'; updateScoreboardUI()" class="px-4 py-1 md:px-5 md:py-1.5 rounded-full transition ${sb_matchMode === 'individual' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}">Individual Match</button>
      <button onclick="sb_matchMode='team'; updateScoreboardUI()" class="px-4 py-1 md:px-5 md:py-1.5 rounded-full transition ${sb_matchMode === 'team' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}">Team Match (Dantai-sen)</button>
    </div>

    ${sb_matchMode === 'team' ? `
      <div class="bg-gray-800 pb-2 flex flex-wrap justify-center gap-3 text-xs font-semibold border-b border-gray-700">
        <span class="text-gray-400 self-center mr-2">Team Size:</span>
        <button onclick="sb_teamSize=3; sb_teamPos=0; updateScoreboardUI()" class="px-3 py-1 rounded transition ${sb_teamSize === 3 ? 'bg-gray-200 text-gray-900' : 'bg-gray-900 text-gray-400 hover:bg-gray-700'}">3 Players</button>
        <button onclick="sb_teamSize=5; sb_teamPos=0; updateScoreboardUI()" class="px-3 py-1 rounded transition ${sb_teamSize === 5 ? 'bg-gray-200 text-gray-900' : 'bg-gray-900 text-gray-400 hover:bg-gray-700'}">5 Players</button>
      </div>
      <div class="bg-gray-950 p-2 md:p-3 border-b border-gray-800 flex flex-col gap-2">
        <div class="flex justify-between items-center px-4 md:px-8">
          <div class="text-white font-bold text-sm md:text-lg">Shiro: ${sb_teamStats.shiroWins} Wins <span class="text-gray-400 font-normal text-xs md:text-sm">(${sb_teamStats.shiroPts} Pts)</span></div>
          <div class="flex gap-1 md:gap-2 overflow-x-auto">
            ${activePos.map((pos, idx) => `<div class="text-[9px] md:text-xs px-2 py-1 rounded border whitespace-nowrap ${sb_teamPos === idx ? 'bg-blue-600 border-blue-500 text-white font-bold' : sb_teamPos > idx ? 'bg-gray-800 border-gray-700 text-gray-400' : 'border-gray-700 text-gray-600'}">${pos}</div>`).join('')}
          </div>
          <div class="text-red-500 font-bold text-sm md:text-lg">Aka: ${sb_teamStats.akaWins} Wins <span class="text-gray-400 font-normal text-xs md:text-sm">(${sb_teamStats.akaPts} Pts)</span></div>
        </div>
      </div>
    ` : ''}

    <!-- Timer Section (Reduced font sizes to stop pushing the layout down) -->
    <div class="bg-gray-950 p-2 md:p-4 flex flex-col items-center border-b border-gray-800">
      <div class="text-5xl md:text-7xl lg:text-8xl leading-none font-mono tabular-nums mb-2 md:mb-3">${formatTime(sb_timeLeft)}</div>
      
      <div class="flex gap-2 mb-3 h-5 md:h-6 items-center">
        ${sb_isEnchou ? '<span class="bg-yellow-500 text-yellow-900 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded animate-pulse tracking-wider">ENCHOU</span>' : ''}
        ${sb_isDaihyousen ? '<span class="bg-purple-600 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded tracking-wider">DAIHYOUSEN</span>' : ''}
      </div>

      <div class="flex gap-2 md:gap-3 flex-wrap justify-center w-full">
        <button onclick="window.sbPlayPause()" class="px-4 py-1.5 md:px-5 md:py-2 md:text-base font-bold bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2">
          <i data-lucide="${sb_isRunning ? 'pause' : 'play'}" class="w-4 h-4 md:w-5 md:h-5"></i> ${sb_isRunning ? 'Pause' : 'Start'}
        </button>
        <button onclick="window.sbFullReset()" class="px-3 py-1.5 md:px-4 md:py-2 md:text-base font-semibold bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 md:w-4 md:h-4"></i> Reset
        </button>
        <button onclick="window.sbUndo()" class="px-3 py-1.5 md:px-4 md:py-2 md:text-base font-semibold rounded-lg transition flex items-center gap-2 ${sb_history.length === 0 ? 'bg-gray-900 text-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'}">
          <i data-lucide="undo" class="w-3.5 h-3.5 md:w-4 md:h-4"></i> Undo
        </button>
        <button onclick="window.sbEnchou()" class="px-3 py-1.5 md:px-4 md:py-2 md:text-base font-semibold bg-yellow-900/50 text-yellow-500 border border-yellow-900 hover:bg-yellow-900/80 rounded-lg transition">Enchou</button>
        ${sb_matchMode === 'team' ? `
          <button onclick="window.sbNextPlayer()" class="px-3 py-1.5 md:px-4 md:py-2 md:text-base font-semibold bg-blue-900/50 text-blue-400 border border-blue-900 hover:bg-blue-900/80 rounded-lg transition">Next Player</button>
          <button onclick="window.sbDaihyousen()" class="px-3 py-1.5 md:px-4 md:py-2 md:text-base font-semibold bg-purple-900/50 text-purple-400 border border-purple-900 hover:bg-purple-900/80 rounded-lg transition">Daihyousen</button>
        ` : ''}
      </div>
    </div>

    <!-- Scoring Panels (Highly compacted paddings & margins) -->
    <div class="grid grid-cols-1 md:grid-cols-2">
      <!-- Shiro -->
      <div class="bg-white text-gray-900 p-4 md:p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-300 relative">
        <h3 class="text-2xl md:text-4xl font-black tracking-widest uppercase mb-3 md:mb-4">白 Shiro</h3>
        <div class="mb-3 md:mb-4">${renderPts(sb_shiroPoints)}</div>
        <div class="w-full flex flex-col items-center mb-3 md:mb-4">
           <span class="text-sm md:text-base text-gray-500 font-bold mb-1 md:mb-2">HANSOKU</span>
           ${renderHans(sb_shiroHansoku)}
        </div>
        <div class="grid grid-cols-2 gap-2 md:gap-3 w-full max-w-sm md:max-w-md mt-auto">
          ${['M', 'K', 'D', 'T'].map(p => `<button onclick="window.sbAddPt('shiro', '${p}')" ${isMatchOver?'disabled':''} class="py-2 md:py-3 border-2 md:border-4 rounded-xl text-xl md:text-3xl font-black transition ${isMatchOver ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-100'}">+${p}</button>`).join('')}
          <button onclick="window.sbAddHansoku('shiro')" ${isMatchOver?'disabled':''} class="col-span-2 py-2 md:py-3 mt-1 md:mt-2 border-2 md:border-4 rounded-xl text-base md:text-xl font-black transition ${isMatchOver ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'}">+ Hansoku</button>
        </div>
      </div>
      <!-- Aka -->
      <div class="bg-red-600 text-white p-4 md:p-6 flex flex-col items-center relative">
        <h3 class="text-2xl md:text-4xl font-black tracking-widest uppercase mb-3 md:mb-4">赤 Aka</h3>
        <div class="mb-3 md:mb-4">${renderPts(sb_akaPoints)}</div>
        <div class="w-full flex flex-col items-center mb-3 md:mb-4">
           <span class="text-sm md:text-base text-red-200 font-bold mb-1 md:mb-2">HANSOKU</span>
           ${renderHans(sb_akaHansoku)}
        </div>
        <div class="grid grid-cols-2 gap-2 md:gap-3 w-full max-w-sm md:max-w-md mt-auto">
          ${['M', 'K', 'D', 'T'].map(p => `<button onclick="window.sbAddPt('aka', '${p}')" ${isMatchOver?'disabled':''} class="py-2 md:py-3 border-2 md:border-4 rounded-xl text-xl md:text-3xl font-black transition ${isMatchOver ? 'border-red-400 text-red-400 cursor-not-allowed' : 'border-red-500 hover:bg-red-700'}">+${p}</button>`).join('')}
          <button onclick="window.sbAddHansoku('aka')" ${isMatchOver?'disabled':''} class="col-span-2 py-2 md:py-3 mt-1 md:mt-2 border-2 md:border-4 rounded-xl text-base md:text-xl font-black transition ${isMatchOver ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed' : 'bg-yellow-500 text-yellow-900 border-yellow-400 hover:bg-yellow-400'}">+ Hansoku</button>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

window.sbPlayPause = () => { sb_isRunning = !sb_isRunning; updateScoreboardUI(); };
window.sbSaveState = () => { sb_history.push({ shiroPoints: [...sb_shiroPoints], akaPoints: [...sb_akaPoints], shiroHansoku: sb_shiroHansoku, akaHansoku: sb_akaHansoku }); };
window.sbUndo = () => { if(sb_history.length===0)return; const l=sb_history.pop(); sb_shiroPoints=l.shiroPoints; sb_akaPoints=l.akaPoints; sb_shiroHansoku=l.shiroHansoku; sb_akaHansoku=l.akaHansoku; updateScoreboardUI(); };
window.sbAddPt = (side, pt) => { window.sbSaveState(); if(side==='shiro') sb_shiroPoints.push(pt); else sb_akaPoints.push(pt); updateScoreboardUI(); };
window.sbAddHansoku = (side) => {
  window.sbSaveState();
  if(side==='shiro') { sb_shiroHansoku++; if(sb_shiroHansoku%2===0 && sb_akaPoints.length<2) sb_akaPoints.push('反'); }
  else { sb_akaHansoku++; if(sb_akaHansoku%2===0 && sb_shiroPoints.length<2) sb_shiroPoints.push('反'); }
  updateScoreboardUI();
};
window.sbResetBoard = () => { sb_isRunning=false; sb_timeLeft=sb_matchTime; sb_shiroPoints=[]; sb_akaPoints=[]; sb_shiroHansoku=0; sb_akaHansoku=0; sb_isEnchou=false; sb_history=[]; if(window.sb_timerRef){clearInterval(window.sb_timerRef); window.sb_timerRef=null;} };
window.sbFullReset = () => { window.sbResetBoard(); sb_teamPos=0; sb_teamStats={shiroWins:0,shiroPts:0,akaWins:0,akaPts:0}; sb_isDaihyousen=false; updateScoreboardUI(); };
window.sbEnchou = () => { window.sbResetBoard(); sb_isEnchou=true; updateScoreboardUI(); };
window.sbDaihyousen = () => { window.sbResetBoard(); sb_isDaihyousen=true; updateScoreboardUI(); };
window.sbNextPlayer = () => {
  let sWins=sb_teamStats.shiroWins, aWins=sb_teamStats.akaWins, sPts=sb_teamStats.shiroPts+sb_shiroPoints.length, aPts=sb_teamStats.akaPts+sb_akaPoints.length;
  if(sb_shiroPoints.length>sb_akaPoints.length) sWins++; else if(sb_akaPoints.length>sb_shiroPoints.length) aWins++;
  sb_teamStats = {shiroWins:sWins, shiroPts:sPts, akaWins:aWins, akaPts:aPts};
  if(sb_teamPos < (sb_teamSize===3?2:4)) sb_teamPos++;
  window.sbResetBoard(); updateScoreboardUI();
};

function initScoreboard() { updateScoreboardUI(); }
