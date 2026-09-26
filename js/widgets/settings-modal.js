// Settings modal widget: DeepSeek key + backup system.
import { saveApiKey, loadApiKey } from "../core/storage.js";
import {
  exportProgress,
  readBackupFile,
  applyBackup,
  getAllBackups,
  restoreAutoBackup,
  createAutoBackup
} from "../core/backup.js";

export function initSettingsModal() {
  const modal = document.getElementById("settings-modal");
  const keyInput = document.getElementById("deepseek-key");
  const saveBtn = document.getElementById("save-key");
  const closeBtn = document.getElementById("close-settings");
  const exportBtn = document.getElementById("export-progress");
  const importBtn = document.getElementById("import-progress");
  const importFile = document.getElementById("import-progress-file");
  const viewBackupsBtn = document.getElementById("view-backups");

  if (!modal) return;

  const existing = loadApiKey();
  if (existing && keyInput) keyInput.value = existing;

  if (saveBtn && keyInput) {
    saveBtn.addEventListener("click", () => {
      const key = keyInput.value.trim();
      if (key.startsWith("sk-")) {
        saveApiKey(key);
        alert("API Key saved");
        modal.close();
      } else {
        alert("Invalid format. Must start with sk-");
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => modal.close());
  }

  // ---- EXPORT ----
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const result = exportProgress();
      if (result.success) {
        alert("Progress exported as: " + result.filename);
      } else {
        alert("Error: " + result.error);
      }
    });
  }

  // ---- IMPORT ----
  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => importFile.click());

    importFile.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const backup = await readBackupFile(file);
        const confirmMsg = "This will REPLACE your current progress.\n\n" +
          "Backup version: " + backup.version + "\n" +
          "Exported at: " + new Date(backup.exportedAt).toLocaleString() + "\n\n" +
          "Continue?";

        if (!confirm(confirmMsg)) {
          importFile.value = "";
          return;
        }

        const result = applyBackup(backup);
        if (result.success) {
          alert("Progress imported. The page will reload.");
          location.reload();
        } else {
          alert("Error: " + result.error);
        }
      } catch (err) {
        alert("Invalid file: " + err.message);
      }

      importFile.value = "";
    });
  }

  // ---- VIEW AUTO-BACKUPS ----
  if (viewBackupsBtn) {
    viewBackupsBtn.addEventListener("click", async () => {
      const backups = await getAllBackups();

      if (backups.length === 0) {
        alert("No auto-backups yet. They are created every 6 hours.");
        return;
      }

      const list = backups
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((b, i) => {
          const date = new Date(b.createdAt).toLocaleString();
          return (i + 1) + ". " + date + " (id: " + b.id + ")";
        })
        .join("\n");

      const msg = "Auto-backups found:\n\n" + list +
        "\n\nEnter the id of the backup to restore (or 0 to cancel):";

      const input = prompt(msg);
      if (!input || input === "0") return;

      const id = parseInt(input, 10);
      if (isNaN(id)) {
        alert("Invalid id");
        return;
      }

      if (!confirm("Restore backup " + id + "? Current progress will be replaced.")) {
        return;
      }

      const result = await restoreAutoBackup(id);
      if (result.success) {
        alert("Backup restored. The page will reload.");
        location.reload();
      } else {
        alert("Error: " + result.error);
      }
    });
  }
}

export function openSettingsModal() {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.showModal();
}
