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

const API_KEY_STORAGE = "cambridge-prep-deepseek-key";

export function saveApiKey(key) { localStorage.setItem(API_KEY_STORAGE, key); }
export function loadApiKey() { return localStorage.getItem(API_KEY_STORAGE); }
export function clearApiKey() { localStorage.removeItem(API_KEY_STORAGE); }
