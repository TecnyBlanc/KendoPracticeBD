export function renderScoreboard() {
  return `
    <div class="w-full flex flex-col h-full bg-white rounded shadow p-4">
       <div class="flex gap-4 justify-center mb-6">
          <button id="sb-undo" class="px-6 py-2 bg-gray-200 font-bold rounded hover:bg-gray-300">Undo Last Action</button>
          <select id="sb-team-type" class="border p-2 font-bold rounded">
             <option value="individual">Individual</option>
             <option value="3">3-Person Team</option>
             <option value="5">5-Person Team</option>
          </select>
       </div>
       
       <div class="flex w-full h-[600px] border-4 border-black">
          <!-- AKA (Red) -->
          <div class="w-1/2 bg-red-600 text-white flex flex-col items-center justify-center p-8">
             <h2 class="text-6xl font-bold mb-4 tracking-widest">AKA</h2>
             <div id="aka-score" class="text-[14rem] font-bold leading-none mb-8">0</div>
             <div class="flex gap-4">
                <button id="aka-add" class="px-8 py-4 bg-white text-red-600 text-2xl font-bold rounded hover:bg-gray-100">+1 Point</button>
                <button id="aka-han" class="px-8 py-4 bg-yellow-400 text-black text-2xl font-bold rounded hover:bg-yellow-500">Hansoku</button>
             </div>
             <p class="mt-6 text-2xl font-bold">Hansoku count: <span id="aka-hc">0</span></p>
          </div>
          
          <!-- SHIRO (White) -->
          <div class="w-1/2 bg-white text-black flex flex-col items-center justify-center p-8 border-l-4 border-black">
             <h2 class="text-6xl font-bold mb-4 tracking-widest">SHIRO</h2>
             <div id="shiro-score" class="text-[14rem] font-bold leading-none mb-8">0</div>
             <div class="flex gap-4">
                <button id="shiro-add" class="px-8 py-4 bg-black text-white text-2xl font-bold rounded hover:bg-gray-800">+1 Point</button>
                <button id="shiro-han" class="px-8 py-4 bg-yellow-400 text-black text-2xl font-bold rounded hover:bg-yellow-500">Hansoku</button>
             </div>
             <p class="mt-6 text-2xl font-bold">Hansoku count: <span id="shiro-hc">0</span></p>
          </div>
       </div>
    </div>
  `;
}

export function initScoreboard() {
    let state = { rP: 0, wP: 0, rH: 0, wH: 0 };
    let history = [];
    
    const saveState = () => history.push({...state});
    
    const updateUI = () => {
        document.getElementById('aka-score').innerText = state.rP;
        document.getElementById('shiro-score').innerText = state.wP;
        document.getElementById('aka-hc').innerText = state.rH;
        document.getElementById('shiro-hc').innerText = state.wH;

        // Auto-stop match when someone hits 2 Ippon
        const isOver = state.rP >= 2 || state.wP >= 2;
        ['aka-add','aka-han','shiro-add','shiro-han'].forEach(id => {
            const btn = document.getElementById(id);
            btn.disabled = isOver;
            btn.style.opacity = isOver ? '0.4' : '1';
            btn.style.cursor = isOver ? 'not-allowed' : 'pointer';
        });
    };

    document.getElementById('aka-add').onclick = () => { saveState(); state.rP++; updateUI(); };
    document.getElementById('shiro-add').onclick = () => { saveState(); state.wP++; updateUI(); };
    
    document.getElementById('aka-han').onclick = () => { 
        saveState(); 
        state.rH++; 
        if(state.rH % 2 === 0) state.wP++; 
        updateUI(); 
    };
    document.getElementById('shiro-han').onclick = () => { 
        saveState(); 
        state.wH++; 
        if(state.wH % 2 === 0) state.rP++; 
        updateUI(); 
    };
    
    document.getElementById('sb-undo').onclick = () => {
        if(history.length > 0) {
            state = history.pop();
            updateUI();
        }
    };
    
    document.getElementById('sb-team-type').onchange = () => {
        history = [];
        state = { rP: 0, wP: 0, rH: 0, wH: 0 };
        updateUI();
    };
}