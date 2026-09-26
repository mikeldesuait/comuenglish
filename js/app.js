// Bootstrap the app.
import { getState, setLevel, on, hydrateState, setStateUser } from "./state.js";
import { navigate, render, bindNav } from "./router.js";
import { initSettingsModal, openSettingsModal } from "./widgets/settings-modal.js";
import { startAutoBackupScheduler } from "./core/backup.js";
import { auth } from "./core/auth.js";
import { loadProgressFromCloud, flushToCloud, resetCloudSession } from "./core/cloud.js";

async function bootstrap() {
  // 1. Si hay sesión, cargar progreso de Supabase y aplicar
  try {
    const session = await auth.getSession();
    if (session?.user) {
      setStateUser(session.user.id);
      const remote = await loadProgressFromCloud();
      if (remote && remote.data) {
        hydrateState(remote.data);
        console.log("[cloud] hydrated from remote");
      } else {
        console.log("[cloud] no remote data, keeping local");
      }
    }
  } catch (e) {
    console.warn("[cloud] bootstrap hydrate failed:", e);
  }

  const levelSelect = document.getElementById("level-select");

  if (levelSelect) {
    levelSelect.value = getState().level;
    levelSelect.addEventListener("change", e => {
      setLevel(e.target.value);
      render();
    });
  }

  const settingsBtn = document.getElementById("open-settings");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => openSettingsModal());
  }

  initSettingsModal();
  startAutoBackupScheduler();
  bindNav();

  on("state:change", () => {
    const sel = document.getElementById("level-select");
    if (sel) sel.value = getState().level;
  });

  // Reaccionar a cambios de sesión
  auth.onChange(async (event, user) => {
    if (event === "SIGNED_OUT") {
      resetCloudSession();
      navigate("home");
      return;
    }
    if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && user) {
      setStateUser(user.id);
      try {
        const remote = await loadProgressFromCloud();
        if (remote && remote.data) {
          hydrateState(remote.data);
          console.log("[cloud] hydrated after login");
        }
        navigate("today");
      } catch (e) {
        console.warn("[cloud] hydrate after login failed:", e);
      }
    }
  });

  // If plan exists, go to Today; otherwise go to Today (which will redirect to onboarding)
  // Flush a la nube al cerrar la pestaña (por si hay cambios pendientes)
  window.addEventListener("beforeunload", () => {
    flushToCloud(getState());
  });

  navigate("home");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
