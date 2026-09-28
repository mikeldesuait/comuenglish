// Banner global que avisa al usuario de que su contraseña es temporal.
// Se muestra en todas las vistas hasta que el usuario cambie su contraseña.
// Se puede cerrar con la X, pero vuelve al recargar.

import { getState } from "../state.js";

const BANNER_ID = "temp-password-banner";
const FLAG_PREFIX = "temp_password_";

export function getFlagKey(userId) {
  return FLAG_PREFIX + userId;
}

export function markTempPassword(userId) {
  if (!userId) return;
  try { localStorage.setItem(FLAG_PREFIX + userId, "1"); } catch {}
}

export function clearTempPassword(userId) {
  if (!userId) return;
  try { localStorage.removeItem(FLAG_PREFIX + userId); } catch {}
}

export function hasTempPassword(userId) {
  if (!userId) return false;
  try { return localStorage.getItem(FLAG_PREFIX + userId) === "1"; } catch { return false; }
}

export async function injectTempPasswordBanner(userId) {
  if (!userId) return;
  if (!hasTempPassword(userId)) {
    // Si no hay flag, no hacemos nada
    return;
  }

  // Si ya está el banner en el DOM, no lo duplicamos
  if (document.getElementById(BANNER_ID)) return;

  // Esperar a que el DOM esté listo (por si se inyecta antes del render)
  const view = document.getElementById("view");
  if (!view) return;

  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.style.cssText = `
    background: #fef3c7;
    border: 2px solid #fcd34d;
    color: #92400e;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: .92rem;
    line-height: 1.5;
  `;

  banner.innerHTML = `
    <div style="font-size: 1.75rem; line-height: 1;">⚠️</div>
    <div style="flex: 1;">
      <div style="font-weight: 700; margin-bottom: 4px;">Tu contraseña es temporal</div>
      <div style="margin-bottom: 12px;">
        Antes de empezar, pulsa el <strong>⚙️ (arriba a la derecha)</strong> y cambia tu contraseña.
        Si no lo haces, <strong>perderás el acceso</strong> cuando cierres sesión.
      </div>
      <button id="temp-pass-change-now" style="
        background: #f97316;
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: .88rem;
        font-weight: 700;
        cursor: pointer;
        font-family: inherit;
      ">Cambiar contraseña ahora</button>
    </div>
    <button id="temp-pass-close" style="
      background: transparent;
      border: none;
      color: #92400e;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0 .25rem;
      line-height: 1;
    ">×</button>
  `;

  // Insertar al principio del view
  view.prepend(banner);

  // Botón "Cambiar contraseña ahora"
  document.getElementById("temp-pass-change-now").addEventListener("click", () => {
    // Abrir el modal de Settings
    const gear = document.getElementById("open-settings");
    if (gear) gear.click();

    // Tras abrir el modal, desplegar el bloque de cambiar contraseña y hacer scroll
    setTimeout(() => {
      const toggle = document.getElementById("toggle-change-password");
      const block = document.getElementById("change-password-block");
      if (toggle && block && block.style.display === "none") {
        toggle.click();
      }
      if (block) {
        block.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);
  });

  // Botón cerrar
  document.getElementById("temp-pass-close").addEventListener("click", () => {
    banner.remove();
  });
}
