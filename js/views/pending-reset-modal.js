// Modal bloqueante que aparece mientras hay un reset pendiente.
// El usuario no puede hacer nada en esta pestaña hasta que:
//   - Abra su correo
//   - O cierre la pestaña
// Se muestra cuando sessionStorage tiene "pending_reset".

export function renderPendingResetModal() {
  // Evitar duplicados
  const existing = document.getElementById("pending-reset-modal");
  if (existing) return;

  const overlay = document.createElement("div");
  overlay.id = "pending-reset-modal";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: grid;
    place-items: center;
    padding: 1rem;
    z-index: 9999;
  `;

  overlay.innerHTML = `
    <div style="
      background: #fff;
      border-radius: 18px;
      max-width: 440px;
      width: 100%;
      padding: 2.25rem 2rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    ">
      <div style="font-size: 3rem; margin-bottom: 1rem;">📧</div>
      <h2 style="margin: 0 0 .5rem; font-size: 1.5rem; font-weight: 800; color: #0f172a;">
        Te hemos enviado un email
      </h2>
      <p style="margin: 0 0 1.75rem; font-size: .95rem; color: #64748b; line-height: 1.5;">
        Abre el enlace que te hemos enviado desde tu correo para cambiar la contraseña.
        Cuando lo hayas hecho, puedes cerrar esta pestaña.
      </p>

      <button id="prm-open-mail" style="
        width: 100%;
        padding: .85rem;
        border: none;
        border-radius: 10px;
        background: #f97316;
        color: #fff;
        font-size: .98rem;
        font-weight: 700;
        cursor: pointer;
        margin-bottom: .75rem;
        font-family: inherit;
      ">Abrir mi correo</button>

      <button id="prm-close-tab" style="
        width: 100%;
        padding: .85rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 10px;
        background: #fff;
        color: #334155;
        font-size: .98rem;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      ">Cerrar esta pestaña</button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Botón "Abrir mi correo"
  document.getElementById("prm-open-mail").addEventListener("click", () => {
    window.location.href = "mailto:";
  });

  // Botón "Cerrar esta pestaña"
  document.getElementById("prm-close-tab").addEventListener("click", () => {
    // Intentar cerrar
    window.close();
    // Si no funciona (lo normal), redirigir a Home y quitar el modal
    setTimeout(() => {
      // Por si no se ha cerrado
      const el = document.getElementById("pending-reset-modal");
      if (el) el.remove();
      if (window.location.hash !== "#/home") {
        window.location.hash = "#/home";
      }
    }, 200);
  });
}

export function removePendingResetModal() {
  const el = document.getElementById("pending-reset-modal");
  if (el) el.remove();
}

export function isPendingReset() {
  const pendingAt = parseInt(sessionStorage.getItem("pending_reset") || "0");
  return pendingAt && (Date.now() - pendingAt) < 60 * 60 * 1000; // 1 hora
}
