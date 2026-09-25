// DeepSeek settings modal widget.
import { saveApiKey, loadApiKey } from "../core/storage.js";

export function initSettingsModal() {
  const modal = document.getElementById("settings-modal");
  const keyInput = document.getElementById("deepseek-key");
  const saveBtn = document.getElementById("save-key");
  const closeBtn = document.getElementById("close-settings");

  if (!modal || !keyInput || !saveBtn || !closeBtn) return;

  const existing = loadApiKey();
  if (existing) keyInput.value = existing;

  saveBtn.addEventListener("click", () => {
    const key = keyInput.value.trim();
    if (key.startsWith("sk-")) {
      saveApiKey(key);
      alert("Key saved");
      modal.close();
    } else {
      alert("Invalid format. Must start with sk-");
    }
  });

  closeBtn.addEventListener("click", () => modal.close());
}

export function openSettingsModal() {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.showModal();
}
