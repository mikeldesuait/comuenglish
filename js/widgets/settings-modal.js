// Settings modal widget: backups + account + logout.
import {
  exportProgress,
  readBackupFile,
  applyBackup,
  getAllBackups,
  restoreAutoBackup,
  createAutoBackup
} from "../core/backup.js";
import { auth } from "../core/auth.js";

export function initSettingsModal() {
  const modal = document.getElementById("settings-modal");
  const closeBtn = document.getElementById("close-settings");
  const exportBtn = document.getElementById("export-progress");
  const importBtn = document.getElementById("import-progress");
  const importFile = document.getElementById("import-progress-file");
  const viewBackupsBtn = document.getElementById("view-backups");

  if (!modal) return;

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

// ---------- Account UI + Logout ----------
async function refreshAccountUI() {
  const info = document.getElementById("account-info");
  const btn  = document.getElementById("logout-btn");
  if (!info || !btn) return;

  try {
    const user = await auth.getUser();
    if (user) {
      info.textContent = user.email || "(no email)";
      btn.style.display = "inline-block";
    } else {
      info.textContent = "Not signed in.";
      btn.style.display = "none";
    }
  } catch (e) {
    info.textContent = "Not signed in.";
    btn.style.display = "none";
  }
}

// Refrescar cuando Supabase termina de cargar la sesión
auth.onChange(() => refreshAccountUI());

// Refrescar cada vez que se abre el modal
const _origOpen = window.openSettingsModal;
window.openSettingsModal = function() {
  if (typeof _origOpen === "function") _origOpen.apply(this, arguments);
  refreshAccountUI();
  setTimeout(refreshAccountUI, 200);
  setTimeout(refreshAccountUI, 600);
};

// Refrescar cuando el usuario abre el modal por otras vías
document.addEventListener("click", (e) => {
  const t = e.target;
  if (t && (t.id === "open-settings" || t.closest?.("#open-settings"))) {
    refreshAccountUI();
    setTimeout(refreshAccountUI, 200);
    setTimeout(refreshAccountUI, 600);
  }
});

// Logout
document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "logout-btn") {
    await auth.signOut();
    const modal = document.getElementById("settings-modal");
    if (modal && modal.close) modal.close();
    window.location.hash = "#/home";
    window.location.reload();
  }
});

// Refrescar al arrancar
document.addEventListener("DOMContentLoaded", () => {
  refreshAccountUI();
  setTimeout(refreshAccountUI, 500);
  setTimeout(refreshAccountUI, 1500);
});
