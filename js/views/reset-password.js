// Reset password screen: shown after user clicks the recovery link.
import { supabase } from "../services/supabase.js";
import { navigate } from "../router.js";

export async function renderResetPassword(view) {
  // Ocultar sidebar
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  // Comprobar si hay una sesión de recovery activa
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
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

  view.innerHTML = `
    <style>
      .rp-wrap {
        min-height: calc(100vh - 64px);
        display: grid;
        place-items: center;
        padding: 3rem 1rem;
        background:
          radial-gradient(circle at 20% 20%, #fff7ed 0%, transparent 55%),
          radial-gradient(circle at 80% 70%, #fef3c7 0%, transparent 55%),
          #fafafa;
      }
      .rp-card {
        width: 100%; max-width: 440px;
        background: #fff; border: 1px solid #e5e7eb;
        border-radius: 18px; padding: 2.25rem 2rem;
        box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
      }
      .rp-logo {
        width: 52px; height: 52px;
        background: #f97316; color: #fff;
        border-radius: 14px;
        display: grid; place-items: center;
        font-weight: 800; font-size: 1.15rem;
        margin: 0 auto 1rem;
      }
      .rp-title { margin: 0 0 .35rem; font-size: 1.5rem; font-weight: 800; color: #0f172a; text-align: center; }
      .rp-sub { margin: 0 0 1.75rem; font-size: .9rem; color: #64748b; text-align: center; }
      .rp-field { display: block; margin-bottom: 1rem; }
      .rp-label { display: block; font-size: .82rem; font-weight: 600; color: #334155; margin-bottom: .4rem; }
      .rp-input {
        width: 100%; padding: .75rem .9rem; border: 1.5px solid #d1d5db;
        border-radius: 10px; font-size: 1rem; box-sizing: border-box;
        font-family: inherit;
      }
      .rp-input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,.15); }
      .rp-input.is-error { border-color: #ef4444; }
      .rp-hint { font-size: .78rem; color: #94a3b8; margin-top: .35rem; }
      .rp-hint.is-error { color: #ef4444; }
      .rp-btn {
        width: 100%; padding: .85rem; border: none; border-radius: 10px;
        background: #f97316; color: #fff; font-size: .98rem; font-weight: 700;
        cursor: pointer; margin-top: .5rem; font-family: inherit;
      }
      .rp-btn:hover:not(:disabled) { background: #ea580c; }
      .rp-btn:disabled { opacity: .6; cursor: not-allowed; }
      .rp-msg {
        margin: 1rem 0 0; padding: .65rem .85rem; border-radius: 8px;
        font-size: .87rem; display: none;
      }
      .rp-msg.is-visible { display: block; }
      .rp-msg--error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
      .rp-msg--ok    { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
    </style>

    <div class="rp-wrap">
      <div class="rp-card">
        <div class="rp-logo">CE</div>
        <h1 class="rp-title">Nueva contraseña</h1>
        <p class="rp-sub">Escribe tu nueva contraseña para acceder a tu cuenta.</p>

        <form id="rp-form" novalidate>
          <label class="rp-field">
            <span class="rp-label">Nueva contraseña</span>
            <input class="rp-input" id="rp-pass" type="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres" />
          </label>

          <label class="rp-field">
            <span class="rp-label">Confirmar contraseña</span>
            <input class="rp-input" id="rp-pass2" type="password" autocomplete="new-password" placeholder="Repite la contraseña" />
            <div class="rp-hint" id="rp-hint"></div>
          </label>

          <button type="submit" class="rp-btn" id="rp-submit">Guardar contraseña</button>
        </form>

        <div class="rp-msg" id="rp-msg"></div>
      </div>
    </div>
  `;

  const $form = view.querySelector("#rp-form");
  const $pass = view.querySelector("#rp-pass");
  const $pass2 = view.querySelector("#rp-pass2");
  const $hint = view.querySelector("#rp-hint");
  const $submit = view.querySelector("#rp-submit");
  const $msg = view.querySelector("#rp-msg");

  const setMsg = (text, kind = "ok") => {
    if (!text) { $msg.className = "rp-msg"; return; }
    $msg.className = `rp-msg is-visible rp-msg--${kind}`;
    $msg.textContent = text;
  };

  $form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");

    const p1 = $pass.value;
    const p2 = $pass2.value;

    if (p1.length < 6) {
      $pass.classList.add("is-error");
      return setMsg("La contraseña debe tener al menos 6 caracteres.", "error");
    }
    if (p1 !== p2) {
      $pass2.classList.add("is-error");
      $hint.textContent = "Las contraseñas no coinciden";
      $hint.className = "rp-hint is-error";
      return setMsg("Las contraseñas no coinciden.", "error");
    }

    $submit.disabled = true;
    $submit.textContent = "Guardando…";

    try {
      const { error } = await supabase.auth.updateUser({ password: p1 });
      if (error) throw error;
      setMsg("¡Contraseña actualizada! Redirigiendo…", "ok");
      setTimeout(() => navigate("today"), 1200);
    } catch (err) {
      setMsg(err.message || "No se ha podido actualizar la contraseña.", "error");
      $submit.disabled = false;
      $submit.textContent = "Guardar contraseña";
    }
  });
}
