let t_players = [];
let t_matchType = 'individual';
let t_rounds = [];
let t_isSetupExpanded = true;

function renderTournamentShell() {
  return `
    <div class="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-light flex items-center gap-2">
          <i data-lucide="users" class="w-6 h-6 text-gray-500"></i> Tournament Bracket
        </h2>
        <div class="flex bg-gray-100 p-1 rounded-lg" id="t-type-toggle"></div>
      </div>
      <div class="mb-4">
        <button id="t-expand-btn" class="text-sm font-medium text-blue-600 hover:text-blue-800 transition flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md border border-blue-200"></button>
      </div>
      <div id="t-grid-container" class="grid gap-8">
        <!-- Rendered by JS -->
      </div>
    </div>
  `;
}

function getScoreColor(score) {
  if (score === 0) return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200';
  if (score === 1) return 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200';
  if (score === 2) return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

function updateTournamentUI() {
  document.getElementById('t-type-toggle').innerHTML = `
    <button onclick="t_matchType='individual'; updateTournamentUI()" class="px-4 py-1.5 text-sm rounded-md transition font-medium ${t_matchType === 'individual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}">Individual</button>
    <button onclick="t_matchType='team'; updateTournamentUI()" class="px-4 py-1.5 text-sm rounded-md transition font-medium ${t_matchType === 'team' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}">Team Match</button>
  `;
  document.getElementById('t-expand-btn').innerText = t_isSetupExpanded ? 'Collapse Setup' : 'Expand Setup';
  document.getElementById('t-grid-container').className = `grid ${t_isSetupExpanded ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-8`;
  
  let setupHTML = t_isSetupExpanded ? `
    <div class="lg:col-span-1">
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <h3 class="font-semibold text-gray-700 mb-3">Add Competitor</h3>
        <div class="flex flex-col gap-3">
          <input type="text" id="t-inp-name" placeholder="${t_matchType === 'team' ? 'Team Name' : 'Name'}" class="px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-400 outline-none" />
          <input type="text" id="t-inp-club" placeholder="Club (Optional)" class="px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-400 outline-none" />
          <label class="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" id="t-inp-seed" class="rounded" /> Seeded
          </label>
          <button id="t-btn-add" class="mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
            <i data-lucide="plus" class="w-4 h-4"></i> Add
          </button>
        </div>
      </div>
      <div class="border border-gray-200 rounded-lg overflow-hidden flex flex-col max-h-80">
        <div class="bg-gray-100 px-4 py-2 font-semibold text-sm text-gray-600 flex justify-between shrink-0">
          <span>Roster (${t_players.length})</span>
          ${t_players.length > 1 ? '<button id="t-btn-gen" class="text-blue-600 hover:underline">Generate</button>' : ''}
        </div>
        <ul class="overflow-y-auto divide-y divide-gray-100 flex-1">
          ${t_players.length === 0 ? '<li class="p-4 text-gray-400 text-sm italic">No entries added.</li>' : t_players.map(p => `
            <li class="p-3 flex justify-between items-center hover:bg-gray-50">
              <div class="flex flex-col">
                <span class="font-medium text-gray-800 flex items-center gap-2">${p.name} ${p.seed ? '<span class="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Seed</span>' : ''}</span>
                ${p.club ? `<span class="text-xs text-gray-500">${p.club}</span>` : ''}
              </div>
              <button onclick="window.tRemove('${p.id}')" class="text-red-400 hover:text-red-600 ml-2 shrink-0"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  ` : '';

  let bracketHTML = `
    <div class="${t_isSetupExpanded ? 'lg:col-span-3' : 'lg:col-span-1'} bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-[80vh]">
      <h3 class="font-semibold text-gray-700 mb-4 sticky left-0">Bracket Progression</h3>
      ${t_rounds.length === 0 ? '<p class="text-sm text-gray-400 italic sticky left-0">Add at least 2 participants and generate bracket.</p>' : `
        <div class="flex gap-8 min-w-max pb-4 px-2">
          ${t_rounds.map((round, rIdx) => `
            <div class="flex flex-col justify-around gap-6 min-w-[300px]">
              <div class="text-xs font-bold text-gray-400 uppercase text-center mb-1 sticky left-0">${rIdx === t_rounds.length - 1 ? 'Final' : `Round ${rIdx + 1}`}</div>
              ${round.map((match, mIdx) => {
                const isP1W = match.winner?.id === match.p1?.id && match.p1 && !match.p1.isBye;
                const isP2W = match.winner?.id === match.p2?.id && match.p2 && !match.p2.isBye;
                const isP1L = match.winner && !isP1W && match.p1 && !match.p1.isBye;
                const isP2L = match.winner && !isP2W && match.p2 && !match.p2.isBye;
                
                const p1Row = `
                  <div class="p-2 border-b border-gray-100 flex items-center justify-between transition ${isP1W ? 'bg-green-50' : ''} ${isP1L ? 'opacity-50 bg-gray-50' : ''}">
                    <div class="flex flex-col overflow-hidden max-w-[150px]">
                      <span class="font-medium truncate ${match.p1?.isBye ? 'text-gray-400 italic' : isP1L ? 'text-gray-400 line-through' : 'text-gray-800'}">
                        ${match.p1 ? match.p1.name : 'TBD'} ${t_matchType === 'team' && isP1W ? '👑' : ''}
                      </span>
                      ${match.p1?.club ? `<span class="text-xs truncate ${isP1L ? 'text-gray-300' : 'text-gray-500'}">${match.p1.club}</span>` : ''}
                    </div>
                    ${!match.p1?.isBye && match.p1 && match.p2 && !match.p2.isBye ? `
                      <div class="flex items-center gap-2 ml-2 shrink-0">
                        <button onclick="window.tCycleScore(${rIdx}, ${mIdx}, 1)" class="w-8 h-8 rounded font-bold text-sm border transition ${getScoreColor(match.s1)}">${match.s1}</button>
                        <button onclick="window.tSetWinner(${rIdx}, ${mIdx}, 1)" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border rounded text-xs font-medium text-gray-700 transition shadow-sm">Win</button>
                      </div>
                    ` : ''}
                  </div>
                `;

                const p2Row = `
                  <div class="p-2 flex items-center justify-between transition ${isP2W ? 'bg-green-50' : ''} ${isP2L ? 'opacity-50 bg-gray-50' : ''}">
                    <div class="flex flex-col overflow-hidden max-w-[150px]">
                      <span class="font-medium truncate ${match.p2?.isBye ? 'text-gray-400 italic' : isP2L ? 'text-gray-400 line-through' : 'text-gray-800'}">
                        ${match.p2 ? match.p2.name : 'TBD'} ${t_matchType === 'team' && isP2W ? '👑' : ''}
                      </span>
                      ${match.p2?.club ? `<span class="text-xs truncate ${isP2L ? 'text-gray-300' : 'text-gray-500'}">${match.p2.club}</span>` : ''}
                    </div>
                    ${!match.p2?.isBye && match.p2 && match.p1 && !match.p1.isBye ? `
                      <div class="flex items-center gap-2 ml-2 shrink-0">
                        <button onclick="window.tCycleScore(${rIdx}, ${mIdx}, 2)" class="w-8 h-8 rounded font-bold text-sm border transition ${getScoreColor(match.s2)}">${match.s2}</button>
                        <button onclick="window.tSetWinner(${rIdx}, ${mIdx}, 2)" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border rounded text-xs font-medium text-gray-700 transition shadow-sm">Win</button>
                      </div>
                    ` : ''}
                  </div>
                `;

                return `<div class="flex flex-col bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden text-sm shrink-0">${p1Row}${p2Row}</div>`;
              }).join('')}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  document.getElementById('t-grid-container').innerHTML = setupHTML + bracketHTML;
  lucide.createIcons();
  
  if(document.getElementById('t-btn-add')) document.getElementById('t-btn-add').onclick = () => {
    const n = document.getElementById('t-inp-name').value;
    if(!n.trim()) return;
    t_players.push({ id: Date.now().toString(), name: n, club: document.getElementById('t-inp-club').value, seed: document.getElementById('t-inp-seed').checked });
    updateTournamentUI();
  };
  if(document.getElementById('t-btn-gen')) document.getElementById('t-btn-gen').onclick = generateBracket;
}

window.tRemove = (id) => { t_players = t_players.filter(p => p.id !== id); t_rounds = []; updateTournamentUI(); };
window.tCycleScore = (rIdx, mIdx, pNum) => {
  const current = pNum === 1 ? t_rounds[rIdx][mIdx].s1 : t_rounds[rIdx][mIdx].s2;
  const next = current === 0 ? 1 : current === 1 ? 2 : 0;
  if(pNum === 1) t_rounds[rIdx][mIdx].s1 = next; else t_rounds[rIdx][mIdx].s2 = next;
  updateTournamentUI();
};
window.tSetWinner = (rIdx, mIdx, pNum) => {
  const match = t_rounds[rIdx][mIdx];
  if(pNum === 1) match.winner = match.p1; else match.winner = match.p2;
  
  let cr = rIdx, cm = mIdx, cw = match.winner;
  while(cr < t_rounds.length - 1) {
    const nr = cr + 1, nm = Math.floor(cm / 2);
    if(cm % 2 === 0) t_rounds[nr][nm].p1 = cw; else t_rounds[nr][nm].p2 = cw;
    t_rounds[nr][nm].winner = null; t_rounds[nr][nm].s1 = 0; t_rounds[nr][nm].s2 = 0;
    cr = nr; cm = nm; cw = null;
  }
  updateTournamentUI();
};

function generateBracket() {
  if (t_players.length < 2) return;
  const seeds = t_players.filter(p => p.seed).sort(() => Math.random() - 0.5);
  const nonSeeds = t_players.filter(p => !p.seed).sort(() => Math.random() - 0.5);
  const total = t_players.length;
  const nextPower2 = Math.pow(2, Math.ceil(Math.log2(total)));
  const byesNeeded = nextPower2 - total;
  const mixed = [...seeds, ...nonSeeds];
  for (let i = 0; i < byesNeeded; i++) mixed.push({ id: `bye-${i}`, name: 'BYE', isBye: true });
  const numRounds = Math.log2(mixed.length);
  const newRounds = [];
  const r0 = [];
  for (let i = 0; i < mixed.length; i += 2) {
    let winner = mixed[i].isBye ? mixed[i+1] : mixed[i+1].isBye ? mixed[i] : null;
    r0.push({ id: `r0-${i/2}`, p1: mixed[i], p2: mixed[i+1], s1: 0, s2: 0, winner });
  }
  newRounds.push(r0);
  for (let r = 1; r < numRounds; r++) {
    const roundMatches = [];
    const prev = newRounds[r-1];
    for (let i = 0; i < prev.length; i += 2) {
      const p1 = prev[i].winner, p2 = prev[i+1].winner;
      let winner = p1?.isBye ? p2 : p2?.isBye ? p1 : null;
      roundMatches.push({ id: `r${r}-${i/2}`, p1, p2, s1: 0, s2: 0, winner });
    }
    newRounds.push(roundMatches);
  }
  t_rounds = newRounds; t_isSetupExpanded = false; updateTournamentUI();
}

function initTournament() {
  document.getElementById('t-expand-btn').onclick = () => { t_isSetupExpanded = !t_isSetupExpanded; updateTournamentUI(); };
  updateTournamentUI();
}
