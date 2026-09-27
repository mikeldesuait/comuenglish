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
import { supabase } from "./services/supabase.js";
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
  const targetHash = "#/" + route;
  if (window.location.hash !== targetHash) { window.location.hash = targetHash; }
  render();
}

export async function render() {
  // El flujo de recovery lo gestiona el evento PASSWORD_RECOVERY en app.js
  // Aquí solo leemos rutas hash normales (#/today, #/login, etc.)
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

  // Restaurar overflow del body (por si alguna vista lo bloqueo)
  document.body.style.overflow = "";

  // Show sidebar by default; specific views may hide it
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "block";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "";

  const route = currentRoute;
  // Guard: si el usuario tiene una contraseña pendiente de cambio, forzar reset-password
  // EXCEPTO si esta pestaña solo envió el email (sent_reset_email), en cuyo caso
  // no debe reaccionar al recovery que se ejecuta en otra pestaña.
  if (sessionStorage.getItem("sent_reset_email") === "1") {
    console.log("[guard] ignorando guard: esta pestaña solo envió el email");
  } else {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { isPending } = await import("./core/password-guard.js");
        if (isPending(session.user.id) && route !== "reset-password") {
          console.log("[guard] forzando reset-password (pendiente de cambio)");
          return navigate("reset-password");
        }
      }
    } catch (e) {
      console.warn("[guard] error:", e);
    }
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
