// Sync app state to/from Supabase (user_progress table).
// Estrategia: "última escritura gana". Cada usuario tiene UNA fila con todo el estado.

import { supabase } from "../services/supabase.js";

let saveTimer = null;
let currentUserId = null;

// ---------- Carga: leer la fila del usuario ----------
export async function loadProgressFromCloud() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  currentUserId = user.id;

  const { data, error } = await supabase
    .from("user_progress")
    .select("data, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("[cloud] load error:", error.message);
    return null;
  }
  return data ? { data: data.data, updatedAt: data.updated_at } : null;
}

// ---------- Guardado: debounce 800ms para no saturar ----------
export function scheduleSaveToCloud(state) {
  if (!currentUserId) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    pushToCloud(state);
  }, 800);
}

// ---------- Forzar guardado inmediato ----------
export async function flushToCloud(state) {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (!currentUserId) return;
  await pushToCloud(state);
}

async function pushToCloud(state) {
  if (!currentUserId) return;
  const { error } = await supabase
    .from("user_progress")
    .upsert(
      { user_id: currentUserId, data: state },
      { onConflict: "user_id" }
    );
  if (error) {
    console.warn("[cloud] save error:", error.message);
  } else {
    console.log("[cloud] saved at", new Date().toISOString());
  }
}

// ---------- Reset ----------
export function resetCloudSession() {
  currentUserId = null;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
}

export function setCurrentUserId(id) {
  currentUserId = id;
}
