// Login / sign up screen (v2 · pulido).
import { auth } from "../core/auth.js";
import { navigate } from "../router.js";
import { loadProgressFromCloud } from "../core/cloud.js";
import { hydrateState, setStateUser } from "../state.js";
import { supabase } from "../services/supabase.js";

export async function renderLogin(view) {
  // Ocultar sidebar
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  // Si ya hay sesión, redirigir
  const session = await auth.getSession();
  if (session) return navigate("today");

  view.innerHTML = `
    <style>
      .auth-wrap {
        min-height: calc(100vh - 64px);
        display: grid;
        place-items: center;
        padding: 3rem 1rem;
        background:
          radial-gradient(circle at 20% 20%, #fff7ed 0%, transparent 55%),
          radial-gradient(circle at 80% 70%, #fef3c7 0%, transparent 55%),
          #fafafa;
      }
      .auth-card {
        width: 100%;
        max-width: 440px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
        padding: 2.25rem 2rem 1.75rem;
        position: relative;
      }
      .auth-logo {
        width: 52px; height: 52px;
        background: #f97316;
        color: #fff;
        border-radius: 14px;
        display: grid; place-items: center;
        font-weight: 800; font-size: 1.15rem;
        margin: 0 auto 1rem;
        letter-spacing: -0.5px;
      }
      .auth-title {
        margin: 0 0 .35rem;
        font-size: 1.6rem;
        font-weight: 800;
        color: #0f172a;
        text-align: center;
        letter-spacing: -0.4px;
      }
      .auth-sub {
        margin: 0 0 1.5rem;
        font-size: .92rem;
        color: #64748b;
        text-align: center;
      }
      .auth-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: .25rem;
        background: #f1f5f9;
        padding: .3rem;
        border-radius: 10px;
        margin-bottom: 1.5rem;
      }
      .auth-tab {
        padding: .6rem .5rem;
        border: none;
        background: transparent;
        border-radius: 8px;
        font-size: .92rem;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        transition: all .15s;
      }
      .auth-tab.is-active {
        background: #fff;
        color: #0f172a;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
      }
      .auth-field {
        display: block;
        margin-bottom: 1rem;
      }
      .auth-field__label {
        display: block;
        font-size: .82rem;
        font-weight: 600;
        color: #334155;
        margin-bottom: .4rem;
      }
      .auth-field__wrap {
        position: relative;
      }
      .auth-input {
        width: 100%;
        padding: .75rem .9rem;
        border: 1.5px solid #d1d5db;
        border-radius: 10px;
        font-size: 1rem;
        box-sizing: border-box;
        color: #0f172a;
        transition: border-color .15s, box-shadow .15s;
        font-family: inherit;
        background: #fff;
      }
      .auth-input:focus {
        outline: none;
        border-color: #f97316;
        box-shadow: 0 0 0 3px rgba(249, 115, 22, .15);
      }
      .auth-input.is-error {
        border-color: #ef4444;
      }
      .auth-input.is-error:focus {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, .15);
      }
      .auth-input--with-toggle {
        padding-right: 2.75rem;
      }
      .auth-toggle-pass {
        position: absolute;
        right: .5rem; top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        cursor: pointer;
        padding: .4rem .55rem;
        color: #94a3b8;
        font-size: .75rem;
        font-weight: 600;
        border-radius: 6px;
        font-family: inherit;
      }
      .auth-toggle-pass:hover { color: #475569; background: #f1f5f9; }
      .auth-hint {
        font-size: .78rem;
        color: #94a3b8;
        margin-top: .3rem;
      }
      .auth-hint.is-error { color: #ef4444; }

      .auth-btn {
        width: 100%;
        padding: .85rem;
        border: none;
        border-radius: 10px;
        font-size: .98rem;
        font-weight: 700;
        cursor: pointer;
        font-family: inherit;
        transition: all .15s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: .5rem;
      }
      .auth-btn--primary {
        background: #f97316;
        color: #fff;
      }
      .auth-btn--primary:hover:not(:disabled) {
        background: #ea580c;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(249, 115, 22, .3);
      }
      .auth-btn:disabled {
        opacity: .6;
        cursor: not-allowed;
      }
      .auth-btn__spinner {
        width: 14px; height: 14px;
        border: 2px solid rgba(255,255,255,.35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: auth-spin .7s linear infinite;
      }
      @keyframes auth-spin { to { transform: rotate(360deg); } }

      .auth-forgot {
        display: block;
        text-align: right;
        font-size: .82rem;
        color: #f97316;
        text-decoration: none;
        font-weight: 600;
        margin: -.4rem 0 1rem;
        cursor: pointer;
      }
      .auth-forgot:hover { text-decoration: underline; }

      .auth-msg {
        margin: 1rem 0 0;
        padding: .65rem .85rem;
        border-radius: 8px;
        font-size: .87rem;
        display: none;
      }
      .auth-msg.is-visible { display: block; }
      .auth-msg--error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
      .auth-msg--ok    { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
      .auth-msg--info  { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

      .auth-footer {
        margin-top: 1.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid #f1f5f9;
        text-align: center;
        font-size: .85rem;
        color: #94a3b8;
      }
      .auth-footer a {
        color: #64748b;
        text-decoration: none;
        font-weight: 600;
        margin-left: .35rem;
      }
      .auth-footer a:hover { color: #0f172a; }
    </style>

    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-logo">CE</div>
        <h1 class="auth-title" id="auth-title">Bienvenido de vuelta</h1>
        <p class="auth-sub" id="auth-sub">Inicia sesión para acceder a tu plan de estudio.</p>

        <div class="auth-tabs" role="tablist">
          <button class="auth-tab is-active" id="tab-signin" role="tab">Iniciar sesión</button>
          <button class="auth-tab" id="tab-signup" role="tab">Crear cuenta</button>
        </div>

        <form id="auth-form" novalidate>
          <label class="auth-field">
            <span class="auth-field__label">Email</span>
            <div class="auth-field__wrap">
              <input class="auth-input" id="auth-email" type="email"
                autocomplete="email" placeholder="tu@email.com" spellcheck="false" />
            </div>
          </label>

          <label class="auth-field">
            <span class="auth-field__label">Contraseña</span>
            <div class="auth-field__wrap">
              <input class="auth-input auth-input--with-toggle" id="auth-pass" type="password"
                autocomplete="current-password" placeholder="Mínimo 6 caracteres" />
              <button type="button" class="auth-toggle-pass" id="toggle-pass">Ver</button>
            </div>
            <div class="auth-hint" id="pass-hint"></div>
          </label>

          <a class="auth-forgot" id="forgot-link">¿Olvidaste tu contraseña?</a>

          <button type="submit" class="auth-btn auth-btn--primary" id="auth-submit">
            <span id="submit-text">Iniciar sesión</span>
          </button>
        </form>

        <div class="auth-msg" id="auth-msg" role="status"></div>

        <div class="auth-footer">
          <a id="back-home">← Volver al inicio</a>
        </div>
      </div>
    </div>
  `;

  // ---------- Referencias ----------
  const $title   = view.querySelector("#auth-title");
  const $sub     = view.querySelector("#auth-sub");
  const $tabIn   = view.querySelector("#tab-signin");
  const $tabUp   = view.querySelector("#tab-signup");
  const $form    = view.querySelector("#auth-form");
  const $email   = view.querySelector("#auth-email");
  const $pass    = view.querySelector("#auth-pass");
  const $toggle  = view.querySelector("#toggle-pass");
  const $passHint= view.querySelector("#pass-hint");
  const $submit  = view.querySelector("#auth-submit");
  const $submitText = view.querySelector("#submit-text");
  const $msg     = view.querySelector("#auth-msg");
  const $forgot  = view.querySelector("#forgot-link");
  const $back    = view.querySelector("#back-home");

  let mode = "signin"; // "signin" | "signup" | "forgot"

  // ---------- Helpers ----------
  const setMsg = (text, kind = "info") => {
    if (!text) {
      $msg.className = "auth-msg";
      $msg.textContent = "";
      return;
    }
    $msg.className = `auth-msg is-visible auth-msg--${kind}`;
    $msg.textContent = text;
  };

  const setLoading = (on) => {
    $submit.disabled = on;
    if (on) {
      $submitText.innerHTML = `<span class="auth-btn__spinner"></span>`;
    } else {
      $submitText.textContent = labelForMode();
    }
  };

  const labelForMode = () => {
    if (mode === "signup") return "Crear cuenta";
    if (mode === "forgot") return "Enviar email de recuperación";
    return "Iniciar sesión";
  };

  const isEmailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validate = () => {
    $email.classList.remove("is-error");
    $pass.classList.remove("is-error");
    $passHint.textContent = "";
    $passHint.className = "auth-hint";

    const email = $email.value.trim();
    if (!email) return "Escribe tu email.";
    if (!isEmailValid(email)) {
      $email.classList.add("is-error");
      return "El email no parece válido.";
    }

    if (mode !== "forgot") {
      if (!$pass.value) {
        $pass.classList.add("is-error");
        return "Escribe tu contraseña.";
      }
      if (mode === "signup" && $pass.value.length < 6) {
        $pass.classList.add("is-error");
        $passHint.textContent = "Mínimo 6 caracteres";
        $passHint.className = "auth-hint is-error";
        return "La contraseña es demasiado corta.";
      }
    }
    return null;
  };

  const clearStatus = () => setMsg("");

  // ---------- Cambio de modo ----------
  const setMode = (newMode) => {
    mode = newMode;
    clearStatus();

    $tabIn.classList.toggle("is-active", mode === "signin");
    $tabUp.classList.toggle("is-active", mode === "signup");

    if (mode === "signin") {
      $title.textContent = "Bienvenido de vuelta";
      $sub.textContent = "Inicia sesión para acceder a tu plan de estudio.";
      $forgot.style.display = "block";
      $pass.parentElement.parentElement.style.display = "";
      $pass.setAttribute("autocomplete", "current-password");
    } else if (mode === "signup") {
      $title.textContent = "Crea tu cuenta";
      $sub.textContent = "Empieza tu plan de estudio personalizado.";
      $forgot.style.display = "none";
      $pass.parentElement.parentElement.style.display = "";
      $pass.setAttribute("autocomplete", "new-password");
    } else if (mode === "forgot") {
      $title.textContent = "Recuperar contraseña";
      $sub.textContent = "Te enviaremos un enlace para restablecerla.";
      $forgot.style.display = "none";
      $pass.parentElement.parentElement.style.display = "none";
    }
    $submitText.textContent = labelForMode();
  };

  // ---------- Eventos ----------
  $tabIn.addEventListener("click", () => setMode("signin"));
  $tabUp.addEventListener("click", () => setMode("signup"));

  $toggle.addEventListener("click", () => {
    const show = $pass.type === "password";
    $pass.type = show ? "text" : "password";
    $toggle.textContent = show ? "Ocultar" : "Ver";
  });

  $forgot.addEventListener("click", (e) => {
    e.preventDefault();
    setMode("forgot");
  });

  $back.addEventListener("click", (e) => {
    e.preventDefault();
    navigate("home");
  });

  $email.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (mode === "forgot") $form.requestSubmit();
      else $pass.focus();
    }
  });

  // Limpiar error de input al escribir
  $email.addEventListener("input", () => {
    $email.classList.remove("is-error");
    clearStatus();
  });
  $pass.addEventListener("input", () => {
    $pass.classList.remove("is-error");
    clearStatus();
  });

  // ---------- Submit ----------
  $form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    const err = validate();
    if (err) return setMsg(err, "error");

    const email = $email.value.trim();
    const pass  = $pass.value;

    setLoading(true);
    try {
      if (mode === "signin") {
        setMsg("Iniciando sesión…", "info");
        await auth.signIn(email, pass);
        await hydrateAfterLogin();
        setMsg("¡Listo! Entrando…", "ok");
        navigate("today");
        return;
      }

      if (mode === "signup") {
        setMsg("Creando cuenta…", "info");
        await auth.signUp(email, pass);
        await hydrateAfterLogin();
        setMsg("¡Cuenta creada! Entrando…", "ok");
        navigate("today");
        return;
      }

      if (mode === "forgot") {
        setMsg("Enviando enlace…", "info");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.href.split("#")[0] + "#/auth-callback"
        });
        if (error) throw error;
        setMsg("Te hemos enviado un email con el enlace para restablecer tu contraseña.", "ok");
        return;
      }
    } catch (err) {
      const msg = mapAuthError(err);
      setMsg(msg, "error");
    } finally {
      setLoading(false);
    }
  });

  // ---------- Hidratación tras login ----------
  async function hydrateAfterLogin() {
    try {
      const user = await auth.getUser();
      if (!user) return;
      setStateUser(user.id);
      const remote = await loadProgressFromCloud();
      if (remote && remote.data) hydrateState(remote.data);
    } catch (e) {
      console.warn("[login] hydrate failed:", e);
    }
  }

  // ---------- Mapeo de errores ----------
  function mapAuthError(err) {
    const m = (err?.message || "").toLowerCase();
    if (m.includes("invalid login credentials"))
      return "Email o contraseña incorrectos.";
    if (m.includes("email not confirmed"))
      return "Tu email no está confirmado. Revisa tu correo.";
    if (m.includes("user already registered"))
      return "Ese email ya tiene una cuenta. Prueba a iniciar sesión.";
    if (m.includes("password should be at least"))
      return "La contraseña debe tener al menos 6 caracteres.";
    if (m.includes("rate limit"))
      return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
    if (m.includes("network") || m.includes("fetch"))
      return "Problema de conexión. Comprueba tu internet.";
    return err?.message || "Algo ha ido mal. Inténtalo de nuevo.";
  }

  // Foco inicial
  setTimeout(() => $email.focus(), 100);
}
