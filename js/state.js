// Estado global de la app. Persiste en localStorage.

const STORAGE_KEY = "cambridge-prep-state-v1";

const defaultState = {
  level: "a2",
  currentRoute: "today",
  currentUnit: null,
  currentPhase: 0,
  progress: {
    a2: { units: {}, score: 0 },
    b1: { units: {}, score: 0 },
    b2: { units: {}, score: 0 }
  },
  mistakes: [],
  lastVisit: null,
  plan: {
    enabled: false,
    examDate: null,
    dailyMinutes: 30,
    daysPerWeek: 5,
    startDate: null,
    targetLevel: "a2"
  },
  dailyLog: {},
  streak: {
    current: 0,
    best: 0,
    lastStudyDate: null
  }
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

export function updatePlan(patch) {
  state.plan = { ...state.plan, ...patch };
  persist();
  emit("plan:change", state.plan);
}

export function getPlan() {
  return state.plan;
}

export function logDailyTask(dateKey, taskId, completed) {
  if (!state.dailyLog[dateKey]) {
    state.dailyLog[dateKey] = {};
  }
  state.dailyLog[dateKey][taskId] = completed;

  const today = dateKey;
  if (state.streak.lastStudyDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (state.streak.lastStudyDate === yesterday) {
      state.streak.current++;
    } else {
      state.streak.current = 1;
    }
    if (state.streak.current > state.streak.best) {
      state.streak.best = state.streak.current;
    }
    state.streak.lastStudyDate = today;
  }

  persist();
  emit("dailyLog:change", state.dailyLog);
}

export function getDailyLog() {
  return state.dailyLog;
}

export function getStreak() {
  return state.streak;
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
