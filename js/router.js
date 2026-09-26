// SPA router.
import { getState, setState } from "./state.js";
import { renderHome } from "./views/home.js";
import { renderFundamentals } from "./views/fundamentals.js";
import { renderComprehension } from "./views/comprehension.js";
import { renderProduction } from "./views/production.js";
import { renderMock } from "./views/mock.js";
import { renderToday } from "./views/today.js";
import { renderProgress } from "./views/progress.js";
import { renderOnboarding } from "./views/onboarding.js";
import { openSettingsModal } from "./widgets/settings-modal.js";

const routes = {
  today: renderToday,
  progress: renderProgress,
  home: renderHome,
  fundamentals: renderFundamentals,
  comprehension: renderComprehension,
  production: renderProduction,
  mock: renderMock,
  onboarding: renderOnboarding,
  settings: openSettingsModal
};

export function navigate(route, params = {}) {
  setState({ currentRoute: route, ...params });
  render();
}

export async function render() {
  const { currentRoute } = getState();
  const view = document.getElementById("view");
  if (!view) return;

  const renderer = routes[currentRoute] || renderToday;
  view.innerHTML = "";
  await renderer(view);

  document.querySelectorAll("[data-route]").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.route === currentRoute);
  });
}


export function bindNav() {
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-route]");
    if (btn) navigate(btn.dataset.route);
  });
}
