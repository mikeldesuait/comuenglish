// Auth callback: procesa el token_hash que Supabase manda tras verificar el email.
// El enlace del email lleva a "#/auth-callback?token_hash=XXX&type=recovery".

import { supabase } from "../services/supabase.js";
import { navigate } from "../router.js";

export async function renderAuthCallback(view) {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  // Pantalla de "verificando"
  view.innerHTML = `
    <div style="min-height: calc(100vh - 64px); display: grid; place-items: center; padding: 3rem 1rem; background: #fafafa;">
      <div style="text-align: center;">
        <div style="width: 44px; height: 44px; border: 3px solid #e5e7eb; border-top-color: #f97316; border-radius: 50%; margin: 0 auto 1rem; animation: spin 0.8s linear infinite;"></div>
        <p style="color: #64748b; font-size: .95rem;">Verificando el enlace…</p>
      </div>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `;

  // Leer token_hash y type de la URL
  const hash = window.location.hash || "";
  const queryStart = hash.indexOf("?");
  const params = new URLSearchParams(queryStart >= 0 ? hash.slice(queryStart + 1) : "");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") || "recovery";

  if (!tokenHash) {
    view.innerHTML = `
      <div style="max-width:420px;margin:6rem auto;padding:2rem;background:#fff;border:1px solid #e5e7eb;border-radius:16px;text-align:center;">
        <h1 style="margin:0 0 1rem;font-size:1.4rem;color:#0f172a;">Enlace no válido</h1>
        <p style="color:#64748b;margin:0 0 1.5rem;">El enlace ha caducado o no es válido. Pide uno nuevo desde la pantalla de inicio de sesión.</p>
        <button id="back-to-login" style="width:100%;padding:.8rem;background:#f97316;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">Volver al inicio de sesión</button>
      </div>
    `;
    view.querySelector("#back-to-login").addEventListener("click", () => navigate("login"));
    return;
  }

  console.log("[callback] verificando token_hash");
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery"
  });

  if (error) {
    console.error("[callback] verifyOtp failed:", error.message);
    view.innerHTML = `
      <div style="max-width:420px;margin:6rem auto;padding:2rem;background:#fff;border:1px solid #e5e7eb;border-radius:16px;text-align:center;">
        <h1 style="margin:0 0 1rem;font-size:1.4rem;color:#0f172a;">Enlace no válido</h1>
        <p style="color:#64748b;margin:0 0 1.5rem;">${error.message || "El enlace ha caducado."}</p>
        <button id="back-to-login" style="width:100%;padding:.8rem;background:#f97316;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">Volver al inicio de sesión</button>
      </div>
    `;
    view.querySelector("#back-to-login").addEventListener("click", () => navigate("login"));
    return;
  }

  console.log("[callback] sesión de recovery creada, navegando a reset-password");
  navigate("reset-password");
}
