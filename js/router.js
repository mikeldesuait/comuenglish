// SPA router.
import { getState, setState } from "./state.js";
import { renderHome } from "./views/home.js";
import { renderFundamentals } from "./views/fundamentals.js";
import { renderComprehension } from "./views/comprehension.js";
import { renderProduction } from "./views/production.js";
import { renderMock } from "./views/mock.js";
import { renderToday } from "./views/today.js";
import { renderHow } from "./views/how.js";
import { renderProgress } from "./views/progress.js";
import { renderOnboarding } from "./views/onboarding.js";
import { renderLogin } from "./views/login.js";
import { renderResetPassword } from "./views/reset-password.js";
import { auth } from "./core/auth.js";
import { openSettingsModal } from "./widgets/settings-modal.js";

const routes = {
  today: renderToday,
  login: renderLogin,
  "reset-password": renderResetPassword,
  how: renderHow,
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
  // Detectar flujos especiales en el hash de la URL
  const rawHash = window.location.hash || "";

  // Caso 1: Supabase recovery link (contiene type=recovery)
  if (rawHash.includes("type=recovery") || rawHash.includes("access_token=")) {
    setState({ currentRoute: "reset-password" });
  } else {
    // Caso 2: hash route normal (#/algo)
    const hashRoute = rawHash.replace(/^#\/?/, "").split("?")[0];
    const validRoutes = Object.keys(routes);
    if (hashRoute && validRoutes.includes(hashRoute)) {
      const { currentRoute } = getState();
      if (currentRoute !== hashRoute) {
        setState({ currentRoute: hashRoute });
      }
    }
  }

  const { currentRoute } = getState();
  const view = document.getElementById("view");
  if (!view) return;

  // Restaurar overflow del body (por si alguna vista lo bloqueo)
  document.body.style.overflow = "";

  // Show sidebar by default; specific views may hide it
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "block";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "";

  const route = currentRoute;

  // Proteger "today" (My Plan): requiere sesión
  if (route === "today") {
    const session = await auth.getSession();
    if (!session) {
      return navigate("login");
    }
  }

  const renderer = routes[route] || renderToday;
  view.innerHTML = "";
  await renderer(view);

  // Marcar botones activos (topbar y sidebar)
  document.querySelectorAll("[data-route]").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.route === route);
  });

  // Marcar sidebar link activo
  document.querySelectorAll(".sidebar__link").forEach(link => {
    link.classList.toggle("is-active", link.dataset.route === route);
  });
}


export function bindNav() {
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-route]");
    if (btn) navigate(btn.dataset.route);
  });
}
