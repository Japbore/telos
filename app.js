// Imports eliminados para compatibilidad file://

// ===========================================
// app.js — UI Logic and Presenter
// ===========================================

let activeBook = null;
let timerStart = null;
let timerInterval = null;
let elapsedMs = 0;

const views = {
  setup: document.getElementById('view-setup'),
  test: document.getElementById('view-test'),
  dashboard: document.getElementById('view-dashboard'),
  config: document.getElementById('view-config')
};

function getConfigRecentLogs() {
  const v = localStorage.getItem('telosRecentLogs');
  return v ? parseInt(v, 10) : 3;
}

document.getElementById('btn-config-open').addEventListener('click', () => {
  document.getElementById('input-config-recent').value = getConfigRecentLogs();
  showView('config');
});

document.getElementById('btn-config-close').addEventListener('click', async () => {
  await loadState();
});

document.getElementById('form-config').addEventListener('submit', async (e) => {
  e.preventDefault();
  const v = parseInt(document.getElementById('input-config-recent').value, 10);
  if (v > 0) {
    localStorage.setItem('telosRecentLogs', v.toString());
  }
  await loadState();
});

async function appInit() {
  await initDB();
  await loadState();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  }
}

async function loadState() {
  activeBook = await getActiveBook();
  
  if (!activeBook) {
    showView('setup');
  } else if (activeBook.pageSpeedMs === 0) {
    document.getElementById('test-title').textContent = activeBook.title;
    showView('test');
  } else {
    await renderDashboard();
    showView('dashboard');
  }
}

function showView(viewId) {
  Object.values(views).forEach(v => v.classList.add('d-none'));
  views[viewId].classList.remove('d-none');
}

// --- SETUP VIEW ---
document.getElementById('form-setup').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('input-title').value.trim();
  const pages = parseInt(document.getElementById('input-pages').value, 10);
  
  if (title && pages > 0) {
    await addBook(title, pages);
    await loadState();
  }
});

// --- TEST VIEW ---
const btnToggleTimer = document.getElementById('btn-toggle-timer');
const timeDisplay = document.getElementById('time-display');

btnToggleTimer.addEventListener('click', () => {
  if (!timerStart) {
    // Iniciar
    timerStart = Date.now() - elapsedMs;
    timerInterval = setInterval(() => {
      elapsedMs = Date.now() - timerStart;
      updateTimeDisplay(elapsedMs);
    }, 100); // 100ms smooth refresh
    btnToggleTimer.textContent = 'Parar reloj';
    btnToggleTimer.classList.replace('btn-primary', 'btn-danger');
  } else {
    // Parar
    clearInterval(timerInterval);
    timerStart = null;
    btnToggleTimer.textContent = 'Continuar reloj';
    btnToggleTimer.classList.replace('btn-danger', 'btn-primary');
  }
});

function updateTimeDisplay(ms) {
   let text = msToPadString(ms);
   timeDisplay.textContent = text;
}

function msToPadString(ms) {
   let s = Math.floor(ms / 1000);
   let m = Math.floor(s / 60);
   s = s % 60;
   let cs = Math.floor((ms % 1000) / 10);
   return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

document.getElementById('btn-save-test').addEventListener('click', async () => {
   if (elapsedMs < 1000) {
      alert("Demasiado rápido... ¡Cronometra al menos 1 segundo neto de lectura!");
      return;
   }
   await updateBookPageSpeed(activeBook.id, elapsedMs);
   await loadState();
});

document.getElementById('form-manual-test').addEventListener('submit', async (e) => {
   e.preventDefault();
   const m = parseInt(document.getElementById('input-test-min').value || 0, 10);
   const s = parseInt(document.getElementById('input-test-sec').value || 0, 10);
   const totalMs = (m * 60 + s) * 1000;
   
   if (totalMs < 1000) {
       alert("Introduce un tiempo válido (mínimo 1 segundo).");
       return;
   }
   await updateBookPageSpeed(activeBook.id, totalMs);
   await loadState();
});

// --- DASHBOARD VIEW ---
async function renderDashboard() {
   document.getElementById('dash-title').textContent = activeBook.title;
   const startDateStr = new Date(activeBook.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
   document.getElementById('dash-totals').innerHTML = `Velocidad: ${msToText(activeBook.pageSpeedMs)} / pág.  —  Objetivo: ${activeBook.totalPages} págs<br>Inicio: ${startDateStr}`;
   
   const logs = await getLogs(activeBook.id);
   const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
   const lastPage = lastLog ? lastLog.lastPageRead : 0;
   
   const todayStr = new Date().toISOString().split('T')[0];
   document.getElementById('input-log-date').value = todayStr;
   document.getElementById('input-log-page').max = activeBook.totalPages;
   document.getElementById('input-log-page').min = lastPage;
   if(lastPage > 0) document.getElementById('input-log-page').value = lastPage;
   
   const msPage = activeBook.pageSpeedMs;
   const totalMsSpent = lastPage * msPage;
   const remainingPages = Math.max(0, activeBook.totalPages - lastPage);
   const remainingMs = remainingPages * msPage;
   
   document.getElementById('stat-time-spent').textContent = msToText(totalMsSpent);
   document.getElementById('stat-time-left').textContent = msToText(remainingMs);
   document.getElementById('stat-pages-left').textContent = remainingPages.toString();
   document.getElementById('stat-last-page').textContent = lastPage > 0 ? lastPage.toString() : "-";
   
   const pct = activeBook.totalPages > 0 ? Math.min(100, (lastPage / activeBook.totalPages) * 100) : 0;
   const bar = document.getElementById('dash-progress');
   bar.style.width = `${pct}%`;
   bar.textContent = `${Math.floor(pct)}%`;
   
   const recentCount = getConfigRecentLogs();
   document.getElementById('lbl-recent-count').textContent = recentCount;
   
   let endTextGlobal = "---";
   let endTextRecent = "---";
   
   const estimationInfo = document.getElementById('estimation-info');
   if (estimationInfo) {
       estimationInfo.style.display = (logs.length === 1 && remainingPages > 0) ? 'block' : 'none';
   }
   
   if (logs.length > 1) {
       const todayDate = new Date();
       todayDate.setHours(0,0,0,0);
       
       // GLOBAL
       const firstLog = logs[0];
       const firstDate = new Date(firstLog.date);
       firstDate.setHours(0,0,0,0);
       
       const ellapsedDaysSinceStart = Math.ceil((todayDate.getTime() - firstDate.getTime()) / (1000*3600*24));
       const activeDaysGlobal = ellapsedDaysSinceStart === 0 ? 1 : ellapsedDaysSinceStart;
       const pagesReadSinceFirst = lastPage - firstLog.lastPageRead;
       const avgPagesGlobal = activeDaysGlobal > 0 && pagesReadSinceFirst > 0 ? pagesReadSinceFirst / activeDaysGlobal : 0;
       
       if (remainingPages > 0 && avgPagesGlobal > 0) {
           const remainingDaysGlobal = Math.ceil(remainingPages / avgPagesGlobal);
           const targetDateGlobal = new Date(todayDate.getTime() + (remainingDaysGlobal * 1000*3600*24));
           endTextGlobal = targetDateGlobal.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
       } else if (remainingPages === 0) {
           endTextGlobal = "¡Completado!";
           bar.classList.replace('progress-bar-animated', 'bg-success');
           bar.style.background = 'var(--telos-success)';
       }
       
       // RECIENTE
       let recentRate = avgPagesGlobal;
       const limit = Math.min(recentCount, logs.length - 1);
       const comparisonLog = logs[logs.length - 1 - limit]; 
       const comparisonDate = new Date(comparisonLog.date);
       comparisonDate.setHours(0,0,0,0);
       const logLastDate = new Date(lastLog.date);
       logLastDate.setHours(0,0,0,0);
       
       const recentDaysElapsed = Math.max(1, Math.ceil((logLastDate.getTime() - comparisonDate.getTime()) / (1000*3600*24)));
       const recentPagesDiff = lastPage - comparisonLog.lastPageRead;
       if (recentPagesDiff > 0) {
           recentRate = recentPagesDiff / recentDaysElapsed;
       }
       
       if (remainingPages > 0 && recentRate > 0) {
           const remainingDaysRecent = Math.ceil(remainingPages / recentRate);
           const targetDateRecent = new Date(todayDate.getTime() + (remainingDaysRecent * 1000*3600*24));
           endTextRecent = targetDateRecent.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
       } else if (remainingPages === 0) {
           endTextRecent = "¡Completado!";
       }
   } else if (remainingPages === 0) {
       endTextGlobal = "¡Completado!";
       endTextRecent = "¡Completado!";
       bar.classList.replace('progress-bar-animated', 'bg-success');
       bar.style.background = 'var(--telos-success)';
   }
   
   document.getElementById('stat-end-date').textContent = endTextGlobal;
   document.getElementById('stat-end-date-recent').textContent = endTextRecent;
   
   // Render history
   const logList = document.getElementById('log-list');
   logList.innerHTML = '';
   
   if (logs.length === 0) {
       logList.innerHTML = '<div class="p-3 text-center text-secondary small">Aún no hay registros.</div>';
   } else {
       for (let i = logs.length - 1; i >= 0; i--) {
           const log = logs[i];
           const div = document.createElement('div');
           div.className = 'list-group-item bg-transparent text-white border-0 d-flex justify-content-between align-items-center px-3 py-2';
           div.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
           
           const dStr = new Date(log.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
           let pagesDelDia = log.lastPageRead;
           if (i > 0) pagesDelDia = log.lastPageRead - logs[i-1].lastPageRead;
           
           div.innerHTML = `
               <span class="small text-secondary fw-semibold">${dStr}</span>
               <div class="text-center w-50">
                 <span class="fw-bold">Pág. ${log.lastPageRead}</span>
                 <span class="small mx-2" style="color: var(--telos-success)">+${pagesDelDia}</span>
               </div>
           `;
           
           if (i === logs.length - 1) {
               const btnDel = document.createElement('button');
               btnDel.className = 'btn btn-sm btn-outline-danger py-0 px-2';
               btnDel.style.fontSize = '0.75rem';
               btnDel.innerHTML = 'Borrar';
               btnDel.onclick = async () => {
                   if (confirm("¿Borrar de forma permanente este registro?")) {
                       await deleteLog(log.id);
                       await loadState();
                   }
               };
               div.appendChild(btnDel);
           } else {
               div.innerHTML += `<div style="width: 50px;"></div>`;
           }
           logList.appendChild(div);
       }
   }
}

function msToText(ms) {
   if (ms === 0) return "0s";
   let s = Math.floor(ms / 1000);
   let m = Math.floor(s / 60);
   s = s % 60;
   let h = Math.floor(m / 60);
   m = m % 60;
   
   if (h > 0) return `${h}h ${m}m`;
   if (m > 0) return `${m}m ${s}s`;
   return `${s}s`;
}

document.getElementById('form-log').addEventListener('submit', async (e) => {
   e.preventDefault();
   const logDate = document.getElementById('input-log-date').value;
   const logPage = parseInt(document.getElementById('input-log-page').value, 10);
   
   if (logPage > activeBook.totalPages) {
       return alert("No puedes superar el total de páginas del libro.");
   }
   
   await addOrUpdateLog(activeBook.id, logDate, logPage);
   
   if (logPage === activeBook.totalPages) {
       alert("¡Enhorabuena! Has llegado a la última página del libro. 🎉");
   }
   await loadState();
});

document.getElementById('btn-reset').addEventListener('click', async () => {
    if (confirm("Si reinicias o archivas el libro, dejará de estar activo y podrás empezar uno nuevo. ¿Estás seguro?")) {
       await updateBookStatus(activeBook.id, 'reset');
       timerStart = null;
       elapsedMs = 0;
       if (timerInterval) clearInterval(timerInterval);
       timeDisplay.textContent = "00:00.00";
       document.getElementById('form-setup').reset();
       document.getElementById('form-log').reset();
       document.getElementById('form-manual-test').reset();
       await loadState();
    }
});

// Run Init
appInit();
