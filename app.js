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
  const targetDate = document.getElementById('input-setup-target-date').value || null;
  
  if (title && pages > 0) {
    await addBook(title, pages, targetDate);
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
   
   const targetInfoContainer = document.getElementById('target-info-container');
   const targetSetupContainer = document.getElementById('target-setup-container');
   const targetNoDate = document.getElementById('target-no-date');
   const targetStats = document.getElementById('target-stats');
   
   targetInfoContainer.classList.remove('d-none');
   targetSetupContainer.classList.add('d-none');
   
   if (!activeBook.targetDate) {
       targetNoDate.classList.remove('d-none');
       targetStats.classList.add('d-none');
   } else {
       targetNoDate.classList.add('d-none');
       targetStats.classList.remove('d-none');
       
       /* Fix timezone issue from simple string */
       const targetDateObj = new Date(activeBook.targetDate + "T00:00:00");
       const todayDate = new Date();
       todayDate.setHours(0,0,0,0);
       
       document.getElementById('target-date-display').textContent = targetDateObj.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
       
       let daysLeft = Math.ceil((targetDateObj.getTime() - todayDate.getTime()) / (1000*3600*24));
       if (daysLeft < 1) daysLeft = 1; // avoid division by 0 and allow same-day finish
       
       if (remainingPages === 0) {
           document.getElementById('target-pages-day').textContent = "0";
           document.getElementById('target-mins-day').textContent = "0";
       } else {
           const pagesPerDay = Math.ceil(remainingPages / daysLeft);
           document.getElementById('target-pages-day').textContent = pagesPerDay.toString();
           const minsPerDay = Math.ceil((pagesPerDay * msPage) / (1000 * 60));
           document.getElementById('target-mins-day').textContent = minsPerDay.toString();
       }
   }
   
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
            div.className = 'list-group-item text-white px-3 py-2 log-row';
            div.style.border = 'none';
            div.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            const colors = getLogColors(i, logs, activeBook);
            if (colors) {
                div.style.backgroundColor = colors.bg;
                div.style.borderLeft = `3px solid ${colors.border}`;
            } else {
                div.style.backgroundColor = 'transparent';
            }
            
            const dStr = new Date(log.date + "T00:00:00").toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
            let pagesDelDia = log.lastPageRead;
            if (i > 0) pagesDelDia = log.lastPageRead - logs[i-1].lastPageRead;
            
            let btnDelHtml = '';
            if (i === logs.length - 1) {
                btnDelHtml = '<button class="btn btn-sm btn-outline-danger py-0 px-2 log-del-btn" style="font-size:0.7rem; flex:0 0 auto; white-space:nowrap; margin-left:2px;">Borrar</button>';
            }
            
            div.innerHTML = `
                <div class="log-entry-row">
                    <span class="small text-secondary fw-semibold log-date">${dStr}</span>
                    <span class="fw-bold small log-center">Pág. ${log.lastPageRead} <span style="color: var(--telos-success)">+${pagesDelDia}</span></span>
                    ${btnDelHtml}
                </div>
            `;
            
            const logIndex = i;
            const logData = log;
            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('log-del-btn')) return;
                showLogDetail(logIndex, logs, activeBook);
            });
            
            if (i === logs.length - 1) {
                div.querySelector('.log-del-btn').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm("¿Borrar de forma permanente este registro?")) {
                        await deleteLog(logData.id);
                        await loadState();
                    }
                });
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

function getLogColors(logIndex, logs, book) {
   if (logIndex === 0) return null;
   if (!book.targetDate) return null;

   const log = logs[logIndex];
   const prevLog = logs[logIndex - 1];
   const msPage = book.pageSpeedMs;

   const logDate = new Date(log.date + "T00:00:00");
   const targetDate = new Date(book.targetDate + "T00:00:00");
   const daysUntilTarget = Math.max(1, Math.ceil((targetDate - logDate) / (1000 * 3600 * 24)));
   const pagesRemainingAtStart = Math.max(0, book.totalPages - prevLog.lastPageRead);
   const dailyTargetPages = Math.ceil(pagesRemainingAtStart / daysUntilTarget);
   const dailyTargetMs = dailyTargetPages * msPage;

   const increment = log.lastPageRead - prevLog.lastPageRead;
   const minutesRead = (increment * msPage) / 60000;
   const dailyTargetMinutes = dailyTargetMs / 60000;

   if (dailyTargetMinutes <= 0) return null;

   const ratio = minutesRead / dailyTargetMinutes;
   const t = Math.min(ratio / 1.2, 1);

   const RED = [239, 68, 68];
   const AMBER = [245, 158, 11];
   const GREEN = [16, 185, 129];

   let r, g, b;
   if (t < 0.5) {
      const u = t * 2;
      r = Math.round(RED[0] + (AMBER[0] - RED[0]) * u);
      g = Math.round(RED[1] + (AMBER[1] - RED[1]) * u);
      b = Math.round(RED[2] + (AMBER[2] - RED[2]) * u);
   } else {
      const u = (t - 0.5) * 2;
      r = Math.round(AMBER[0] + (GREEN[0] - AMBER[0]) * u);
      g = Math.round(AMBER[1] + (GREEN[1] - AMBER[1]) * u);
      b = Math.round(AMBER[2] + (GREEN[2] - AMBER[2]) * u);
   }

   const solid = `rgb(${r}, ${g}, ${b})`;
   const bg = `rgba(${r}, ${g}, ${b}, 0.12)`;
   return { bg, border: solid };
}

function showLogDetail(logIndex, logs, book) {
   const log = logs[logIndex];
   const msPage = book.pageSpeedMs;
   
   const dStr = new Date(log.date + "T00:00:00").toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' });
   document.getElementById('detail-date').textContent = dStr;
   document.getElementById('detail-last-page').textContent = log.lastPageRead;
   
   let increment = log.lastPageRead;
   if (logIndex > 0) {
       increment = log.lastPageRead - logs[logIndex - 1].lastPageRead;
   }
   document.getElementById('detail-increment').textContent = `+${increment}`;
   
   const totalTimeMs = log.lastPageRead * msPage;
   document.getElementById('detail-time-read').textContent = msToText(totalTimeMs);
   
   let avgTimeText = '-';
   if (logIndex > 0) {
       const prevLog = logs[logIndex - 1];
       const diasEntre = Math.max(1, Math.ceil((new Date(log.date) - new Date(prevLog.date)) / (1000 * 3600 * 24)));
       const pagDiff = log.lastPageRead - prevLog.lastPageRead;
       const avgMsPerDay = (pagDiff / diasEntre) * msPage;
       avgTimeText = msToText(Math.round(avgMsPerDay)) + '/d';
   }
   document.getElementById('detail-avg-time').textContent = avgTimeText;
   
   const modal = new bootstrap.Modal(document.getElementById('log-detail-modal'));
   modal.show();
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

document.getElementById('btn-edit-target').addEventListener('click', () => {
   document.getElementById('target-info-container').classList.add('d-none');
   document.getElementById('target-setup-container').classList.remove('d-none');
   if (activeBook && activeBook.targetDate) {
       document.getElementById('input-target-date').value = activeBook.targetDate;
   } else {
       document.getElementById('input-target-date').value = "";
   }
});

document.getElementById('form-target-date').addEventListener('submit', async (e) => {
   e.preventDefault();
   const v = document.getElementById('input-target-date').value;
   await updateBookTargetDate(activeBook.id, v || null);
   await loadState();
});

// Run Init
appInit();
