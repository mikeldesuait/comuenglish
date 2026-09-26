// Backup system: export/import progress + auto-backup in IndexedDB.
const STORAGE_KEY = "comuenglish-state-v1";
const AUTO_BACKUP_KEY = "comu-english-auto-backups";
const BACKUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 horas
const MAX_AUTO_BACKUPS = 5;

// ============================================================
// EXPORT: descarga un JSON con todo el progreso
// ============================================================
export function exportProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      throw new Error("No hay progreso para exportar");
    }

    const state = JSON.parse(raw);
    const backup = {
      version: "1.0",
      app: "ComuEnglish",
      exportedAt: new Date().toISOString(),
      data: state
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().slice(0, 10);
    const filename = "comuenglish-progress-" + date + ".json";

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// IMPORT: lee un JSON y devuelve el estado para fusionar
// ============================================================
export function readBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);

        // Validaciones basicas
        if (!backup.data) {
          throw new Error("Archivo invalido: falta el campo 'data'");
        }

        if (!backup.version) {
          throw new Error("Archivo invalido: falta la version");
        }

        resolve(backup);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsText(file);
  });
}

export function applyBackup(backup) {
  try {
    if (!backup.data) {
      throw new Error("Backup sin datos");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(backup.data));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// AUTO-BACKUP en IndexedDB
// ============================================================
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("comu-english-backups", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("backups")) {
        db.createObjectStore("backups", { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

export async function createAutoBackup() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { success: false, error: "No hay progreso" };

    const db = await openDB();
    const tx = db.transaction("backups", "readwrite");
    const store = tx.objectStore("backups");

    const backup = {
      createdAt: Date.now(),
      version: "1.0",
      app: "ComuEnglish",
      data: JSON.parse(raw)
    };

    await new Promise((resolve, reject) => {
      const req = store.add(backup);
      req.onsuccess = resolve;
      req.onerror = () => reject(req.error);
    });

    // Limpiar backups antiguos (dejar solo los MAX_AUTO_BACKUPS mas recientes)
    const allBackups = await getAllBackups();
    if (allBackups.length > MAX_AUTO_BACKUPS) {
      const toDelete = allBackups
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(MAX_AUTO_BACKUPS);

      for (const b of toDelete) {
        await deleteBackup(b.id);
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getAllBackups() {
  try {
    const db = await openDB();
    const tx = db.transaction("backups", "readonly");
    const store = tx.objectStore("backups");
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return [];
  }
}

export async function deleteBackup(id) {
  try {
    const db = await openDB();
    const tx = db.transaction("backups", "readwrite");
    const store = tx.objectStore("backups");
    store.delete(id);
  } catch (err) {
    console.error("Error deleting backup:", err);
  }
}

export async function restoreAutoBackup(id) {
  try {
    const db = await openDB();
    const tx = db.transaction("backups", "readonly");
    const store = tx.objectStore("backups");
    const request = store.get(id);

    const backup = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!backup || !backup.data) {
      throw new Error("Backup no encontrado");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(backup.data));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// AUTO-BACKUP programado (cada 6 horas)
// ============================================================
export function startAutoBackupScheduler() {
  const lastAutoBackup = parseInt(localStorage.getItem(AUTO_BACKUP_KEY) || "0", 10);
  const now = Date.now();

  if (now - lastAutoBackup >= BACKUP_INTERVAL_MS) {
    createAutoBackup().then((result) => {
      if (result.success) {
        localStorage.setItem(AUTO_BACKUP_KEY, now.toString());
        console.log("Auto-backup created");
      }
    });
  }

  // Revisar cada hora si toca hacer backup
  setInterval(() => {
    const last = parseInt(localStorage.getItem(AUTO_BACKUP_KEY) || "0", 10);
    if (Date.now() - last >= BACKUP_INTERVAL_MS) {
      createAutoBackup().then((result) => {
        if (result.success) {
          localStorage.setItem(AUTO_BACKUP_KEY, Date.now().toString());
          console.log("Auto-backup created");
        }
      });
    }
  }, 60 * 60 * 1000); // 1 hora
}
