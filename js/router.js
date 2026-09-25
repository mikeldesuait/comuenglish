// SPA router.
import { getState, setState } from "./state.js";
import { renderHome } from "./views/home.js";
import { renderFundamentals } from "./views/fundamentals.js";
import { renderComprehension } from "./views/comprehension.js";
import { renderProduction } from "./views/production.js";
import { openSettingsModal } from "./widgets/settings-modal.js";

const routes = {
  home: renderHome,
  fundamentals: renderFundamentals,
  comprehension: renderComprehension,
  production: renderProduction,
  mock: renderMock,
  settings: openSettingsModal
};

export function navigate(route, params = {}) {
  setState({ currentRoute: route, ...params });
  render();
}

export function render() {
  const { currentRoute } = getState();
  const view = document.getElementById("view");
  if (!view) return;

  const renderer = routes[currentRoute] || renderHome;
  view.innerHTML = "";
  renderer(view);

  document.querySelectorAll("[data-route]").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.route === currentRoute);
  });
}

function renderMock(view) {
  const h2 = document.createElement("h2");
  h2.textContent = "Mock Exam";
  view.appendChild(h2);

  const p = document.createElement("p");
  p.textContent = "Full timed mock exam for the selected level will run here.";
  view.appendChild(p);
}

export function bindNav() {
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-route]");
    if (btn) navigate(btn.dataset.route);
  });
}
