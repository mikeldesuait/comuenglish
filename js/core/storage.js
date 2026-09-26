// Wrapper de localStorage con manejo de errores.

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function remove(key) {
  localStorage.removeItem(key);
}

export function clear() {
  localStorage.clear();
}

// (Las funciones saveApiKey/loadApiKey/clearApiKey se han eliminado.
// La API key de DeepSeek ahora vive como secret en Supabase
// y se usa a través de la Edge Function deepseek-proxy.)
