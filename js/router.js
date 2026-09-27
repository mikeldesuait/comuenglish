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

  // Banner de aviso si el usuario llegó por email de recovery
  // (se inserta AQUÍ porque renderToday limpia view.innerHTML)
  if (route === "today" && sessionStorage.getItem("show_change_password_notice") === "1") {
    const notice = document.createElement("div");
    notice.style.cssText = "background:#fef3c7;border:1px solid #fcd34d;color:#92400e;border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:.75rem;font-size:.92rem;font-weight:600;";
    notice.innerHTML = '<span style="font-size:1.5rem;">⚠️</span><div style="flex:1;">Has entrado con un enlace de recuperación. <a href="#" id="go-to-settings-notice" style="color:#92400e;text-decoration:underline;font-weight:700;">Ve a Settings → Cambiar contraseña</a> para establecer una nueva.</div><button id="close-notice" style="background:none;border:none;color:#92400e;font-size:1.25rem;cursor:pointer;padding:0 .25rem;">×</button>';
    view.prepend(notice);

    setTimeout(() => {
      const b = document.getElementById("go-to-settings-notice");
      if (b) b.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("open-settings")?.click();
      });
      const c = document.getElementById("close-notice");
      if (c) c.addEventListener("click", () => {
        sessionStorage.removeItem("show_change_password_notice");
        notice.remove();
      });
    }, 50);
  }

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
