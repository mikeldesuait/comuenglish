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

// ---------- Cambiar contraseña ----------
document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "change-password-btn") {
    e.preventDefault();
    const newPass = document.getElementById("new-password")?.value;
    const newPass2 = document.getElementById("new-password2")?.value;
    const msg = document.getElementById("change-password-msg");

    const setMsg = (text, color = "#64748b") => {
      if (msg) { msg.textContent = text; msg.style.color = color; }
    };

    if (!newPass || !newPass2) return setMsg("Rellena todos los campos.", "#dc2626");
    if (newPass.length < 6) return setMsg("Mínimo 6 caracteres.", "#dc2626");
    if (newPass !== newPass2) return setMsg("Las contraseñas no coinciden.", "#dc2626");

    setMsg("Cambiando…");
    try {
      const { supabase } = await import("../services/supabase.js");
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      setMsg("¡Contraseña cambiada correctamente!", "#16a34a");
      sessionStorage.removeItem("show_change_password_notice");
      const cp = document.getElementById("current-password");
      const np = document.getElementById("new-password");
      const np2 = document.getElementById("new-password2");
      if (cp) cp.value = "";
      if (np) np.value = "";
      if (np2) np2.value = "";
    } catch (err) {
      setMsg(err.message || "Error al cambiar la contraseña.", "#dc2626");
    }
  }
});


// ---------- Toggle "Cambiar contraseña" ----------
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "toggle-change-password") {
    const block = document.getElementById("change-password-block");
    const btn = document.getElementById("toggle-change-password");
    if (block) {
      const visible = block.style.display !== "none";
      block.style.display = visible ? "none" : "block";
      btn.textContent = visible ? "Cambiar contraseña" : "Cancelar";
    }
  }
});


// ---------- Reset progress ----------
document.addEventListener("click", async (e) => {
  if (!e.target || e.target.id !== "reset-progress-btn") return;

  // Confirmación doble
  const step1 = confirm(
    "⚠️ ¿Estás seguro de que quieres reiniciar TODO tu progreso?\n\n" +
    "Se borrará:\n" +
    "- Tu plan y calendario\n" +
    "- Tu nivel actual\n" +
    "- Todas las tareas completadas\n" +
    "- Rachas y tiempo de estudio\n\n" +
    "Tu cuenta NO se elimina.\n\n" +
    "Esta acción NO se puede deshacer."
  );
  if (!step1) return;

  const step2 = prompt(
    'Para confirmar, escribe la palabra RESET en mayúsculas:'
  );
  if (!step2 || step2.trim() !== "RESET") {
    alert("Cancelado. No se ha borrado nada.");
    return;
  }

  // Deshabilitar botón mientras se procesa
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = "Borrando…";

  try {
    // 1. Borrar de Supabase
    const { deleteCloudProgress } = await import("../core/cloud.js");
    const cloudResult = await deleteCloudProgress();
    if (!cloudResult.success) {
      console.warn("[reset] error borrando de la nube:", cloudResult.error);
    }

    // 2. Borrar de localStorage
    try { localStorage.removeItem("comuenglish-state-v1"); } catch {}

    // 3. Borrar backups automáticos (opcional)
    try { localStorage.removeItem("comu-english-auto-backups"); } catch {}

    // 4. Cerrar el modal
    const modal = document.getElementById("settings-modal");
    if (modal && modal.close) modal.close();

    // 5. Recargar la app
    alert("Progreso reiniciado. La app se va a recargar.");
    window.location.href = window.location.pathname + "#/home";
    window.location.reload();

  } catch (err) {
    console.error("[reset] error:", err);
    alert("Error al reiniciar: " + err.message);
    btn.disabled = false;
    btn.textContent = "🔄 Reiniciar todo mi progreso";
  }
});
