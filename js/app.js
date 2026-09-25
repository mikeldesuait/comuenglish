// Bootstrap the app.
import { getState, setLevel, on } from "./state.js";
import { navigate, render, bindNav } from "./router.js";
import { initSettingsModal, openSettingsModal } from "./widgets/settings-modal.js";

function bootstrap() {
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
  bindNav();

  on("state:change", () => {
    const sel = document.getElementById("level-select");
    if (sel) sel.value = getState().level;
  });

  navigate("home");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
