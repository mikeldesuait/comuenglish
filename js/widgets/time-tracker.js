// Widget modal para registrar el tiempo dedicado a una tarea.
import { logSession } from "../state.js";

export function showTimeTrackerModal(options) {
  const { itemId, itemType, itemLabel, onComplete } = options;

  // Crear overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.bottom = "0";
  overlay.style.background = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  // Modal
  const modal = document.createElement("div");
  modal.style.background = "#fff";
  modal.style.borderRadius = "14px";
  modal.style.padding = "28px";
  modal.style.maxWidth = "440px";
  modal.style.width = "90%";
  modal.style.boxShadow = "0 20px 60px rgba(0,0,0,.3)";

  // Icono
  const icon = document.createElement("div");
  icon.textContent = "✅";
  icon.style.fontSize = "2.5rem";
  icon.style.textAlign = "center";
  icon.style.marginBottom = "8px";
  modal.appendChild(icon);

  // Titulo
  const title = document.createElement("h3");
  title.textContent = "Task completed!";
  title.style.textAlign = "center";
  title.style.marginBottom = "6px";
  title.style.fontSize = "1.2rem";
  modal.appendChild(title);

  // Subtitulo (nombre de la tarea)
  const sub = document.createElement("p");
  sub.textContent = itemLabel || "";
  sub.style.textAlign = "center";
  sub.style.color = "#64748b";
  sub.style.fontSize = ".85rem";
  sub.style.marginBottom = "20px";
  modal.appendChild(sub);

  // Pregunta
  const question = document.createElement("p");
  question.textContent = "How long did it take?";
  question.style.textAlign = "center";
  question.style.fontWeight = "600";
  question.style.marginBottom = "14px";
  modal.appendChild(question);

  // Botones de tiempo
  const timesRow = document.createElement("div");
  timesRow.style.display = "grid";
  timesRow.style.gridTemplateColumns = "repeat(3, 1fr)";
  timesRow.style.gap = "8px";
  timesRow.style.marginBottom = "14px";

  const defaultMinutes = 30;
  const options_ = [10, 15, 20, 30, 45, 60];

  let selectedMinutes = defaultMinutes;

  options_.forEach(mins => {
    const btn = document.createElement("button");
    btn.textContent = mins + " min";
    btn.style.padding = "10px";
    btn.style.border = mins === defaultMinutes ? "2px solid #2563eb" : "1px solid #e2e8f0";
    btn.style.background = mins === defaultMinutes ? "#eff6ff" : "#fff";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "600";
    btn.style.fontSize = ".85rem";
    btn.style.color = mins === defaultMinutes ? "#2563eb" : "#334155";
    btn.style.transition = "all .15s";

    btn.addEventListener("click", () => {
      selectedMinutes = mins;
      timesRow.querySelectorAll("button").forEach(b => {
        b.style.border = "1px solid #e2e8f0";
        b.style.background = "#fff";
        b.style.color = "#334155";
      });
      btn.style.border = "2px solid #2563eb";
      btn.style.background = "#eff6ff";
      btn.style.color = "#2563eb";
      customInput.value = "";
    });

    timesRow.appendChild(btn);
  });
  modal.appendChild(timesRow);

  // Input custom
  const customRow = document.createElement("div");
  customRow.style.display = "flex";
  customRow.style.gap = "8px";
  customRow.style.alignItems = "center";
  customRow.style.marginBottom = "20px";

  const customLabel = document.createElement("span");
  customLabel.textContent = "Or custom:";
  customLabel.style.fontSize = ".85rem";
  customLabel.style.color = "#64748b";
  customRow.appendChild(customLabel);

  const customInput = document.createElement("input");
  customInput.type = "number";
  customInput.min = "1";
  customInput.max = "300";
  customInput.placeholder = "min";
  customInput.style.flex = "1";
  customInput.style.padding = "8px";
  customInput.style.border = "1px solid #e2e8f0";
  customInput.style.borderRadius = "8px";
  customInput.style.fontSize = ".85rem";
  customInput.addEventListener("input", () => {
    if (customInput.value) {
      selectedMinutes = parseInt(customInput.value);
      timesRow.querySelectorAll("button").forEach(b => {
        b.style.border = "1px solid #e2e8f0";
        b.style.background = "#fff";
        b.style.color = "#334155";
      });
    }
  });
  customRow.appendChild(customInput);
  modal.appendChild(customRow);

  // Botones accion
  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "10px";

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn--primary";
  saveBtn.textContent = "Save";
  saveBtn.style.flex = "1";
  saveBtn.style.padding = "12px";
  saveBtn.style.fontWeight = "bold";
  saveBtn.addEventListener("click", () => {
    logSession(itemId, itemType, selectedMinutes);
    if (onComplete) onComplete(selectedMinutes);
    document.body.removeChild(overlay);
  });
  actions.appendChild(saveBtn);

  const skipBtn = document.createElement("button");
  skipBtn.className = "btn btn--ghost";
  skipBtn.textContent = "Skip";
  skipBtn.style.flex = "1";
  skipBtn.style.padding = "12px";
  skipBtn.addEventListener("click", () => {
    // Estimar con el tiempo por defecto
    const defaults = { fundamentals: 45, reading: 20, listening: 15, writing: 30, speaking: 10 };
    const mins = defaults[itemType] || 20;
    logSession(itemId, itemType, mins);
    if (onComplete) onComplete(mins);
    document.body.removeChild(overlay);
  });
  actions.appendChild(skipBtn);

  modal.appendChild(actions);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
