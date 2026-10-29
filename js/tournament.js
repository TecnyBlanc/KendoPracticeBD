export function renderTournament() {
  return `
    <div class="w-full h-full bg-white p-6 rounded shadow overflow-hidden flex flex-col">
       <div id="t-setup" class="mb-4 transition-all">
          <label class="block font-bold mb-2">Participants (comma separated)</label>
          <textarea id="t-players" rows="3" class="w-full border p-2 mb-2 rounded" placeholder="A, B, C, D..."></textarea>
          <button id="t-generate" class="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">Generate Bracket</button>
       </div>
       <button id="t-toggle-setup" class="hidden self-start text-blue-600 underline font-bold mb-4">Show Setup</button>
       <div id="t-bracket" class="flex overflow-x-auto gap-12 mt-4 pb-8 min-h-[500px]"></div>
    </div>
  `;
}

export function initTournament() {
  let rounds = [];
  const getScoreColor = (score) => score === 0 ? 'bg-red-500 text-white' : score === 1 ? 'bg-yellow-400 text-black' : 'bg-green-500 text-white';
  
  const renderBracket = () => {
      const container = document.getElementById('t-bracket');
      container.innerHTML = '';
      rounds.forEach((round, rIdx) => {
          const col = document.createElement('div');
          col.className = 'flex flex-col justify-around min-w-[250px] border-r pr-8 relative';
          
          round.forEach((match, mIdx) => {
              const mDiv = document.createElement('div');
              mDiv.className = 'border-2 p-3 mb-4 rounded bg-gray-50 flex flex-col gap-3 shadow-sm';
              
              ['p1', 'p2'].forEach(p => {
                  if(!match[p]) return;
                  const isWinner = match.winner === match[p].name;
                  const isLoser = match.winner && !isWinner;
                  const divClass = isWinner ? 'bg-green-100 font-bold border-green-400' : isLoser ? 'opacity-40 line-through' : 'bg-white';
                  
                  const playerDiv = document.createElement('div');
                  playerDiv.className = `flex justify-between items-center p-2 border rounded ${divClass}`;
                  
                  const nameSpan = document.createElement('span');
                  nameSpan.innerText = match[p].name;
                  nameSpan.className = 'truncate max-w-[120px]';
                  
                  const controls = document.createElement('div');
                  controls.className = 'flex gap-2';
                  
                  const scoreBtn = document.createElement('button');
                  scoreBtn.innerText = match[p].score;
                  scoreBtn.className = `w-8 h-8 text-sm font-bold rounded ${getScoreColor(match[p].score)}`;
                  scoreBtn.onclick = () => {
                      match[p].score = (match[p].score + 1) % 3;
                      renderBracket();
                  };
                  
                  const winBtn = document.createElement('button');
                  winBtn.innerText = 'Win';
                  winBtn.className = 'text-sm font-bold bg-gray-200 hover:bg-gray-300 px-3 rounded';
                  winBtn.onclick = () => {
                      match.winner = match[p].name;
                      if(rIdx + 1 < rounds.length) {
                          const nextMatch = rounds[rIdx+1][Math.floor(mIdx/2)];
                          if(mIdx % 2 === 0) nextMatch.p1 = {name: match.winner, score: 0};
                          else nextMatch.p2 = {name: match.winner, score: 0};
                      }
                      renderBracket();
                  };
                  
                  controls.appendChild(scoreBtn);
                  if(!match.winner) controls.appendChild(winBtn);
                  
                  playerDiv.appendChild(nameSpan);
                  playerDiv.appendChild(controls);
                  mDiv.appendChild(playerDiv);
              });
              col.appendChild(mDiv);
          });
          container.appendChild(col);
      });
  };

  document.getElementById('t-generate').onclick = () => {
      const input = document.getElementById('t-players').value;
      const players = input.split(',').map(n => n.trim()).filter(n => n);
      if(players.length < 2) return alert("Need at least 2 players");
      
      rounds = [];
      let currentRound = [];
      for(let i=0; i<players.length; i+=2) {
          currentRound.push({
              p1: {name: players[i], score: 0},
              p2: players[i+1] ? {name: players[i+1], score: 0} : null,
              winner: players[i+1] ? null : players[i] 
          });
      }
      rounds.push(currentRound);
      
      let nextSize = Math.ceil(currentRound.length / 2);
      while(currentRound.length > 1) {
          let nextR = Array.from({length: nextSize}, () => ({p1: null, p2: null, winner: null}));
          rounds.push(nextR);
          currentRound = nextR;
          nextSize = Math.ceil(currentRound.length / 2);
      }
      
      document.getElementById('t-setup').classList.add('hidden');
      const toggle = document.getElementById('t-toggle-setup');
      toggle.classList.remove('hidden');
      toggle.innerText = 'Show Setup';
      renderBracket();
  };
  
  document.getElementById('t-toggle-setup').onclick = (e) => {
      const setup = document.getElementById('t-setup');
      if(setup.classList.contains('hidden')) {
          setup.classList.remove('hidden');
          e.target.innerText = 'Hide Setup';
      } else {
          setup.classList.add('hidden');
          e.target.innerText = 'Show Setup';
      }
  };
}