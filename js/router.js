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
import { renderAuthCallback } from "./views/auth-callback.js";
import { auth } from "./core/auth.js";
import { supabase } from "./services/supabase.js";
import { openSettingsModal } from "./widgets/settings-modal.js";

const routes = {
  today: renderToday,
  login: renderLogin,
  "reset-password": renderResetPassword,
  "auth-callback": renderAuthCallback,
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
  // Si hay un reset en curso, bloquear cualquier navegación que no sea reset-password
  const resetAt = parseInt(localStorage.getItem("reset_in_progress") || "0");
  const isResetInProgress = resetAt && (Date.now() - resetAt) < 60 * 60 * 1000;
  if (isResetInProgress && route !== "reset-password" && route !== "auth-callback") {
    console.log("[router] reset en curso: bloqueando navegación a", route);
    return;
  }

  setState({ currentRoute: route, ...params });
  const targetHash = "#/" + route;
  if (window.location.hash !== targetHash) { window.location.hash = targetHash; }
  render();
}

export async function render() {
  const rawHash = window.location.hash || "";
  const hashRoute = rawHash.replace(/^#\/?/, "").split("?")[0];
  const validRoutes = Object.keys(routes);
  if (hashRoute && validRoutes.includes(hashRoute)) {
    const { currentRoute } = getState();
    if (currentRoute !== hashRoute) {
      setState({ currentRoute: hashRoute });
    }
  }

  const { currentRoute } = getState();
  const view = document.getElementById("view");
  if (!view) return;

  document.body.style.overflow = "";

  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "block";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "";

  const route = currentRoute;

  // Guard: si esta pestaña está en modo "reset pendiente", mostrar modal bloqueante
  // y no renderizar ninguna vista
  try {
    const { isPendingReset, renderPendingResetModal } = await import("./views/pending-reset-modal.js");
    if (isPendingReset()) {
      console.log("[guard] reset pendiente: mostrando modal bloqueante");
      // Vaciar la vista para que no se vea nada detrás
      view.innerHTML = "";
      // Mostrar el modal
      renderPendingResetModal();
      return;
    }
  } catch (e) {
    console.warn("[guard] pending reset check failed:", e);
  }

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

  document.querySelectorAll("[data-route]").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.route === route);
  });

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
