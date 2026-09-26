// Estado global de la app. Persiste en localStorage.

const STORAGE_KEY = "cambridge-prep-state-v1";

const defaultState = {
  level: "a2",
  currentRoute: "today",
  currentUnit: null,
  currentPhase: 0,
  progress: {
    a2: { units: {}, reading: {}, listening: {}, writing: {}, speaking: {}, score: 0 },
    b1: { units: {}, reading: {}, listening: {}, writing: {}, speaking: {}, score: 0 },
    b2: { units: {}, reading: {}, listening: {}, writing: {}, speaking: {}, score: 0 }
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
  },
  timeTracking: {
    goalHours: { a2: 75, b1: 125, b2: 175 },
    dailyMinutes: {},
    sessions: []
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


export function markReading(level, textId) {
  if (!state.progress[level].reading) state.progress[level].reading = {};
  state.progress[level].reading[textId] = { completed: true, date: Date.now() };
  markTodayCompleted("reading-" + textId);
  persist();
  emit("progress:change", state.progress);
}

export function markListening(level, audioId) {
  if (!state.progress[level].listening) state.progress[level].listening = {};
  state.progress[level].listening[audioId] = { completed: true, date: Date.now() };
  markTodayCompleted("listening-" + audioId);
  persist();
  emit("progress:change", state.progress);
}

export function markWriting(level, taskId) {
  if (!state.progress[level].writing) state.progress[level].writing = {};
  state.progress[level].writing[taskId] = { completed: true, date: Date.now() };
  markTodayCompleted("writing-" + taskId);
  persist();
  emit("progress:change", state.progress);
}

export function markSpeaking(level, promptId) {
  if (!state.progress[level].speaking) state.progress[level].speaking = {};
  state.progress[level].speaking[promptId] = { completed: true, date: Date.now() };
  markTodayCompleted("speaking-" + promptId);
  persist();
  emit("progress:change", state.progress);
}

function markTodayCompleted(taskId) {
  const today = new Date().toISOString().slice(0, 10);
  if (!state.dailyLog[today]) state.dailyLog[today] = {};
  state.dailyLog[today][taskId] = true;

  // Actualizar racha
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
}

export function getProgress(level) {
  return state.progress[level] || { units: {}, reading: {}, listening: {}, writing: {}, speaking: {} };
}


export function logSession(itemId, itemType, minutes) {
  const today = new Date().toISOString().slice(0, 10);
  if (!state.timeTracking.dailyMinutes[today]) {
    state.timeTracking.dailyMinutes[today] = 0;
  }
  state.timeTracking.dailyMinutes[today] += minutes;
  state.timeTracking.sessions.push({
    date: today,
    item: itemId,
    type: itemType,
    minutes: minutes
  });
  persist();
  emit("timeTracking:change", state.timeTracking);
}

export function getTimeTracking() {
  return state.timeTracking;
}

export function getTotalMinutes() {
  return state.timeTracking.sessions.reduce((sum, s) => sum + s.minutes, 0);
}

export function getMinutesForLastDays(days) {
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({
      date: key,
      minutes: state.timeTracking.dailyMinutes[key] || 0
    });
  }
  return result;
}

export function setGoalHours(level, hours) {
  state.timeTracking.goalHours[level] = hours;
  persist();
  emit("timeTracking:change", state.timeTracking);
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
