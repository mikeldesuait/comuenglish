// Bootstrap the app.
import { getState, setLevel, on, hydrateState, setStateUser } from "./state.js";
import { navigate, render, bindNav } from "./router.js";
import { initSettingsModal, openSettingsModal } from "./widgets/settings-modal.js";
import { startAutoBackupScheduler } from "./core/backup.js";
import { auth } from "./core/auth.js";
import { loadProgressFromCloud, flushToCloud, resetCloudSession } from "./core/cloud.js";
import { supabase } from "./services/supabase.js";
import { injectTempPasswordBanner, markTempPassword } from "./widgets/temp-password-banner.js";

let passwordJustChanged = false;
window.__setPasswordChanged = (v) => { passwordJustChanged = v; };

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

  auth.onChange(async (event, user) => {
    if (event === "SIGNED_OUT") {
      resetCloudSession();
      navigate("home");
      return;
    }
    if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && user) {
      // Si hay un reset en curso (bandera GLOBAL), NO navegar a today.
      // La pestaña debe quedarse en la pantalla de reset-password hasta que
      // el usuario cambie la contraseña.
      const resetAt = parseInt(localStorage.getItem("reset_in_progress") || "0");
      const isResetInProgress = resetAt && (Date.now() - resetAt) < 60 * 60 * 1000; // 1 hora
      if (isResetInProgress) {
        console.log("[auth] reset_in_progress activo: no navegando a today");
        // Si estamos en la pantalla de reset-password, quedarnos ahí
        const { currentRoute } = getState();
        if (currentRoute === "reset-password") {
          console.log("[auth] ya estamos en reset-password, quedándonos");
          return;
        }
        // Si estamos en otra ruta, forzar reset-password
        console.log("[auth] forzando reset-password");
        return navigate("reset-password");
      }
      setStateUser(user.id);
      try {
        const remote = await loadProgressFromCloud();
        if (remote && remote.data) {
          hydrateState(remote.data);
          console.log("[cloud] hydrated after login");
        }
        if (passwordJustChanged) {
          console.log("[auth] skipping navigate (password just changed)");
          return;
        }
        // Inyectar banner de contraseña temporal tras el render
        setTimeout(() => {
          injectTempPasswordBanner(user.id);
        }, 100);
        navigate("today");
      } catch (e) {
        console.warn("[cloud] hydrate after login failed:", e);
      }
    }
  });

  window.addEventListener("beforeunload", () => {
    flushToCloud(getState());
  });

  // No navegar a Home si la URL ya es una ruta específica (auth-callback, reset-password, etc.)
  const rawHash = window.location.hash || "";
  const hashRoute = rawHash.replace(/^#\/?/, "").split("?")[0];

  // Si ya estamos en una ruta válida distinta a home/today, respetarla
  if (hashRoute === "auth-callback" || hashRoute === "reset-password") {
    console.log("[app] preservando ruta:", hashRoute);
    // Forzar render para que el router procese la URL actual
    const { render } = await import("./router.js");
    await render();
  } else {
    navigate("home");
  }

  // Marcar contraseña temporal si es la primera vez que entra
  try {
    const session = await auth.getSession();
    if (session?.user) {
      const uid = session.user.id;
      const key = "temp_password_" + uid;
      const alreadyChanged = localStorage.getItem("password_changed_" + uid);
      if (!localStorage.getItem(key) && !alreadyChanged) {
        localStorage.setItem(key, "1");
        console.log("[app] marcando temp_password para:", uid);
      }
    }
  } catch (e) { console.warn("[app] temp password check failed:", e); }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
