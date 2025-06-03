const API_URL = '/api/data';

// Open IndexedDB
const dbPromise = idb.openDB('offline-db', 1, {
  upgrade(db) {
    db.createObjectStore('pending', { autoIncrement: true });
  }
});

// Load initial data from backend 
async function loadData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const list = document.getElementById('dataList');
    list.innerHTML = '';
    data.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.name;
      list.appendChild(li);
    });
  } catch (err) {
    console.warn('Failed to load data from server', err);
  }
}

// Send data to server
async function sendToServer(name) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!response.ok) throw new Error('Server error');
}

// Save data to IndexedDB if POST fails
async function saveOffline(name) {
  const db = await dbPromise;
  await db.add('pending', { name });
  console.log('Saved offline:', name);
}

// Handle form submission
document.getElementById('dataForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value;
  
    try {
      await sendToServer(name);
      showMessage("Saved successfully.");
      nameInput.value = '';
    } catch {
      await saveOffline(name);
      showMessage("Saved offline. Will sync when online.");
      nameInput.value = '';
    }
  
    loadData();
  });

// Sync offline queue when back online
async function syncPending() {
    const db = await dbPromise;
    const all = await db.getAll('pending');
  
    if (all.length === 0) return;
  
    let synced = 0;
    for (const item of all) {
      try {
        await sendToServer(item.name);
        console.log('Synced:', item.name);
        synced++;
      } catch {
        console.warn('Failed to sync:', item.name);
        continue;
      }
    }
  
    if (synced > 0) {
      showMessage(`Synced ${synced} items from offline queue.`);
    }
  
    await db.clear('pending');

    loadData();
  }
  
  

function showMessage(msg) {
    const status = document.getElementById('status');
    status.textContent = msg;
    setTimeout(() => {
      status.textContent = "";
    }, 3000);
  }

// Sync on reconnect
window.addEventListener('online', syncPending);

// Sync immediately on load
window.addEventListener('load', () => {
  if (navigator.onLine) {
    syncPending();
  }
  loadData();
});
