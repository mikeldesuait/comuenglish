// Progress bar and Cambridge Scale widget.
import { getState } from "../state.js";
import { toCambridgeScale } from "../core/scoring.js";

export function renderProgress() {
  const { level, progress } = getState();
  const units = progress[level].units;
  const done = Object.values(units).filter(u => u.completed).length;
  const total = Object.keys(units).length || 1;
  const percent = Math.round((done / total) * 100);
  const score = toCambridgeScale(level, percent / 100);

  setTimeout(() => {
    const fill = document.getElementById("global-progress");
    const label = document.getElementById("progress-label");
    const scale = document.getElementById("cambridge-score");
    if (fill) fill.style.width = percent + "%";
    if (label) label.textContent = percent + "%";
    if (scale) scale.textContent = score;
  }, 0);

  return percent + "% - Cambridge Scale: " + score;
}
