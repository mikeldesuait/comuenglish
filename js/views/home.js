// Home view.
import { getState } from "../state.js";
import { renderProgress } from "../widgets/progress.js";

export function renderHome(view) {
  const { level } = getState();

  view.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Welcome to Cambridge Prep";
  view.appendChild(h2);

  const p1 = document.createElement("p");
  p1.innerHTML = "Current level: <strong>" + level.toUpperCase() + "</strong>";
  view.appendChild(p1);

  const p2 = document.createElement("p");
  p2.textContent = "Select a module from the top bar to start.";
  view.appendChild(p2);

  const progressBox = document.createElement("div");
  progressBox.innerHTML = renderProgress();
  view.appendChild(progressBox);
}
