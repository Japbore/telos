// ===========================================
// db.js — Módulo IndexedDB
// ===========================================

const DB_NAME = 'telos-db';
const DB_VERSION = 1;
let db = null;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = e => {
      const dbInstance = e.target.result;
      if (!dbInstance.objectStoreNames.contains('books')) {
        const storeB = dbInstance.createObjectStore('books', { keyPath: 'id', autoIncrement: true });
        storeB.createIndex('status', 'status', { unique: false });
      }
      if (!dbInstance.objectStoreNames.contains('logs')) {
        const storeL = dbInstance.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
        storeL.createIndex('bookId', 'bookId', { unique: false });
        storeL.createIndex('bookId_date', ['bookId', 'date'], { unique: true });
      }
    };

    request.onsuccess = e => {
      db = e.target.result;
      resolve();
    };

    request.onerror = e => reject(e.target.error);
  });
}

function getActiveBook() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', 'readonly');
    const store = tx.objectStore('books');
    const idx = store.index('status');
    const req = idx.get('active');
    
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function addBook(title, totalPages) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', 'readwrite');
    const store = tx.objectStore('books');
    const req = store.add({
      title,
      totalPages,
      pageSpeedMs: 0,
      status: 'active',
      createdAt: Date.now()
    });
    
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function updateBookPageSpeed(bookId, speedMs) {
  return new Promise((resolve, reject) => {
    const store = db.transaction('books', 'readwrite').objectStore('books');
    const req = store.get(bookId);
    
    req.onsuccess = () => {
      const book = req.result;
      if (book) {
        book.pageSpeedMs = speedMs;
        store.put(book).onsuccess = () => resolve();
      } else reject('Book not found');
    };
    req.onerror = () => reject(req.error);
  });
}

function updateBookStatus(bookId, status) {
  return new Promise((resolve, reject) => {
    const store = db.transaction('books', 'readwrite').objectStore('books');
    const req = store.get(bookId);
    
    req.onsuccess = () => {
      const book = req.result;
      if (book) {
        book.status = status;
        store.put(book).onsuccess = () => resolve();
      } else reject('Book not found');
    };
    req.onerror = () => reject(req.error);
  });
}

function getLogs(bookId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('logs', 'readonly');
    const store = tx.objectStore('logs');
    const idx = store.index('bookId');
    const req = idx.getAll(bookId);
    
    req.onsuccess = () => {
      // sort by date asc
      const logs = req.result.sort((a, b) => a.date.localeCompare(b.date));
      resolve(logs);
    };
    req.onerror = () => reject(req.error);
  });
}

function deleteLog(logId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('logs', 'readwrite');
    const store = tx.objectStore('logs');
    const req = store.delete(logId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function addOrUpdateLog(bookId, dateStr, lastPageRead) {
  const logs = await getLogs(bookId);
  const existing = logs.find(l => l.date === dateStr);
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction('logs', 'readwrite');
    const store = tx.objectStore('logs');
    let req;
    
    if (existing) {
      existing.lastPageRead = lastPageRead;
      req = store.put(existing);
    } else {
      req = store.add({
        bookId,
        date: dateStr,
        lastPageRead,
        createdAt: Date.now()
      });
    }
    
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
