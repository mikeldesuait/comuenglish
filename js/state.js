// Estado global de la app. Persiste en localStorage.

const STORAGE_KEY = "cambridge-prep-state-v1";

const defaultState = {
  level: "a2",
  currentRoute: "home",
  currentUnit: null,
  currentPhase: 0,
  progress: {
    a2: { units: {}, score: 0 },
    b1: { units: {}, score: 0 },
    b2: { units: {}, score: 0 }
  },
  mistakes: [],
  lastVisit: null
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

export function getState() { return state; }

export function setState(patch) {
  state = { ...state, ...patch };
  persist();
  emit("state:change", state);
}

export function setLevel(level) { setState({ level }); }

export function markUnit(level, unitId, result) {
  const levelData = state.progress[level];
  levelData.units[unitId] = { ...levelData.units[unitId], ...result, lastAttempt: Date.now() };
  persist();
  emit("progress:change", state.progress);
}

export function addMistake(mistake) {
  state.mistakes.push({ ...mistake, date: Date.now(), reviews: 0 });
  persist();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const listeners = {};
export function on(event, cb) {
  (listeners[event] ||= []).push(cb);
}
export function emit(event, payload) {
  (listeners[event] || []).forEach(cb => cb(payload));
}
