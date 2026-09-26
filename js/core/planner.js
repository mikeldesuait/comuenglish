// Study plan calculator: distributes content across days until exam.

export function calculatePlan(level, daysUntilExam, dailyMinutes) {
  // Estimate items per level
  const contentByLevel = {
    a2: { units: 15, reading: 15, listening: 10, writing: 8, speaking: 10 },
    b1: { units: 10, reading: 12, listening: 10, writing: 10, speaking: 12 },
    b2: { units: 10, reading: 10, listening: 8, writing: 10, speaking: 12 }
  };

  const content = contentByLevel[level] || contentByLevel.a2;

  // Estimate total items to cover
  const totalItems =
    content.units * 3 +     // cada unidad vale por 3 tareas
    content.reading +       // cada texto vale por 1
    content.listening +     // cada audio vale por 1
    content.writing +       // cada tarea vale por 1
    content.speaking;       // cada prompt vale por 1

  // Estimar items por dia segun tiempo
  // Asumimos: 30 min = 3 items, 15 min = 2 items, 60 min = 5 items
  const itemsPerDay = Math.max(2, Math.floor(dailyMinutes / 10));
  const totalStudyDays = Math.ceil(totalItems / itemsPerDay);

  return {
    level,
    daysUntilExam,
    dailyMinutes,
    itemsPerDay,
    totalItems,
    totalStudyDays,
    feasible: totalStudyDays <= daysUntilExam
  };
}

export function generateTodayTasks(level, itemsPerDay, completedToday) {
  // Estructura base del dia: 1 gramatica + 1 lectura/escucha + 1 escritura/habla
  const templates = [
    { type: "fundamentals", weight: 2, icon: "📖", label: "Grammar" },
    { type: "comprehension", weight: 1, icon: "📚", label: "Reading or Listening" },
    { type: "production", weight: 1, icon: "✍️", label: "Writing or Speaking" }
  ];

  const tasks = [];
  let taskId = 0;

  // Distribuir items segun peso
  templates.forEach(t => {
    const count = Math.max(1, Math.floor(itemsPerDay * (t.weight / 4)));
    for (let i = 0; i < count; i++) {
      tasks.push({
        id: "task-" + (taskId++),
        type: t.type,
        icon: t.icon,
        label: t.label,
        completed: completedToday && completedToday["task-" + taskId]
      });
    }
  });

  return tasks.slice(0, itemsPerDay);
}

export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================
// Detectar siguiente item no completado por modulo
// ============================================================

export function nextUncompletedUnit(units, progress) {
  for (const u of units) {
    if (!progress.units || !progress.units[u.id] || !progress.units[u.id].completed) {
      return u;
    }
  }
  return null;
}

export function nextUncompletedReading(texts, progress) {
  for (const t of texts) {
    if (!progress.reading || !progress.reading[t.id] || !progress.reading[t.id].completed) {
      return t;
    }
  }
  return null;
}

export function nextUncompletedListening(audios, progress) {
  for (const a of audios) {
    if (!progress.listening || !progress.listening[a.id] || !progress.listening[a.id].completed) {
      return a;
    }
  }
  return null;
}

export function nextUncompletedWriting(tasks, progress) {
  for (const t of tasks) {
    if (!progress.writing || !progress.writing[t.id] || !progress.writing[t.id].completed) {
      return t;
    }
  }
  return null;
}

export function nextUncompletedSpeaking(prompts, progress) {
  for (const p of prompts) {
    if (!progress.speaking || !progress.speaking[p.id] || !progress.speaking[p.id].completed) {
      return p;
    }
  }
  return null;
}

export function countCompleted(progress) {
  const count = { units: 0, reading: 0, listening: 0, writing: 0, speaking: 0 };
  ["units", "reading", "listening", "writing", "speaking"].forEach(k => {
    if (progress[k]) {
      count[k] = Object.values(progress[k]).filter(x => x && x.completed).length;
    }
  });
  return count;
}

// ============================================================
// Sistema de horas: calculos de ritmo y proyeccion
// ============================================================

export const TIME_PER_ITEM = {
  fundamentals: 45,
  reading: 20,
  listening: 15,
  writing: 30,
  speaking: 10
};

export const LEVEL_MULTIPLIER = {
  a2: 3.0,
  b1: 3.5,
  b2: 4.0
};

export const LEVEL_TOTALS = {
  a2: { fundamentals: 15, reading: 15, listening: 10, writing: 8, speaking: 10 },
  b1: { fundamentals: 10, reading: 12, listening: 10, writing: 10, speaking: 12 },
  b2: { fundamentals: 10, reading: 10, listening: 8, writing: 10, speaking: 12 }
};

export function calculateRemainingHours(level, progress) {
  const totals = LEVEL_TOTALS[level] || LEVEL_TOTALS.a2;
  const multiplier = LEVEL_MULTIPLIER[level] || 3.0;

  const remaining = {};
  let baseMinutes = 0;

  Object.keys(totals).forEach(type => {
    const total = totals[type];
    const done = progress[type] ? Object.values(progress[type]).filter(x => x && x.completed).length : 0;
    const left = Math.max(0, total - done);
    remaining[type] = left;
    baseMinutes += left * TIME_PER_ITEM[type];
  });

  const baseHours = baseMinutes / 60;
  const realisticHours = baseHours * multiplier;

  return {
    remaining,
    baseHours: Math.round(baseHours * 10) / 10,
    realisticHours: Math.round(realisticHours * 10) / 10
  };
}

export function calculateTotalGoalHours(level) {
  const totals = LEVEL_TOTALS[level] || LEVEL_TOTALS.a2;
  const multiplier = LEVEL_MULTIPLIER[level] || 3.0;
  let baseMinutes = 0;
  Object.keys(totals).forEach(type => {
    baseMinutes += totals[type] * TIME_PER_ITEM[type];
  });
  return Math.round((baseMinutes / 60) * multiplier);
}

export function calculatePace(goalHours, doneHours, daysLeft) {
  const remaining = Math.max(0, goalHours - doneHours);
  if (daysLeft <= 0) return 0;
  return remaining / daysLeft; // horas/dia
}

export function calculateRealPace(dailyMinutes, days = 7) {
  const today = new Date();
  let totalMinutes = 0;
  let daysCounted = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dailyMinutes[key] !== undefined) {
      totalMinutes += dailyMinutes[key];
      daysCounted++;
    }
  }
  if (daysCounted === 0) return 0;
  return (totalMinutes / daysCounted) / 60; // horas/dia
}

export function calculateDeviation(realPace, idealPace, daysStudied) {
  return (realPace - idealPace) * daysStudied;
}

export function projectCompletion(realPace, remainingHours) {
  if (realPace <= 0) return null;
  const daysToFinish = Math.ceil(remainingHours / realPace);
  return daysToFinish;
}

export function getStatus(deviationHours) {
  if (deviationHours > 10) return { level: "ahead", icon: "🔥", color: "#16a34a", label: "Ahead" };
  if (deviationHours > 0) return { level: "on-track", icon: "✅", color: "#16a34a", label: "On track" };
  if (deviationHours > -10) return { level: "slightly-behind", icon: "⚠️", color: "#f59e0b", label: "Slightly behind" };
  if (deviationHours > -30) return { level: "behind", icon: "🔴", color: "#dc2626", label: "Behind" };
  return { level: "way-behind", icon: "🚨", color: "#dc2626", label: "Way behind" };
}

export function formatHours(hours) {
  if (hours < 1) return Math.round(hours * 60) + " min";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return h + "h";
  return h + "h " + m + "m";
}
