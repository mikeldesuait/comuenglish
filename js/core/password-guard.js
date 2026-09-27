// Password guard: marca a un usuario que debe cambiar contraseña antes de usar la app.
// La bandera vive en localStorage y sobrevive a recargas y cierres de pestaña.

const PREFIX = "comuenglish_pending_password_change_";

export function markPending(userId) {
  if (!userId) return;
  try {
    localStorage.setItem(PREFIX + userId, "1");
  } catch (e) {
    console.warn("[guard] no se pudo marcar:", e);
  }
}

export function clearPending(userId) {
  if (!userId) return;
  try {
    localStorage.removeItem(PREFIX + userId);
  } catch (e) {
    console.warn("[guard] no se pudo limpiar:", e);
  }
}

export function isPending(userId) {
  if (!userId) return false;
  try {
    return localStorage.getItem(PREFIX + userId) === "1";
  } catch {
    return false;
  }
}
