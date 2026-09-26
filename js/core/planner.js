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

// ============================================================
// Generacion del calendario completo
// ============================================================

export async function generateCalendar(level, examDate, dailyMinutes, daysPerWeek) {
  // 1. Cargar todo el contenido
  const [unitsData, readingData, listeningData, writingData, speakingData] = await Promise.all([
    fetch("data/" + level + "/units.json").then(r => r.json()),
    fetch("data/" + level + "/reading.json").then(r => r.json()),
    fetch("data/" + level + "/listening.json").then(r => r.json()),
    fetch("data/" + level + "/writing.json").then(r => r.json()),
    fetch("data/" + level + "/speaking.json").then(r => r.json())
  ]);

  const units = unitsData.units || [];
  const readings = readingData.texts || [];
  const listenings = listeningData.audios || [];
  const writings = writingData.tasks || [];
  const speakings = speakingData.prompts || [];

  const queue = [];
  const maxLen = Math.max(units.length, readings.length, listenings.length, writings.length, speakings.length);
  for (let i = 0; i < maxLen; i++) {
    if (units[i]) queue.push({ id: units[i].id, type: "fundamentals", label: units[i].title });
    if (readings[i]) queue.push({ id: readings[i].id, type: "reading", label: "Reading - " + readings[i].title });
    if (listenings[i]) queue.push({ id: listenings[i].id, type: "listening", label: "Listening - " + listenings[i].title });
    if (writings[i]) queue.push({ id: writings[i].id, type: "writing", label: "Writing - " + writings[i].title });
    if (speakings[i]) queue.push({ id: speakings[i].id, type: "speaking", label: "Speaking - " + speakings[i].title });
  }

  // 2. Mock exams
  const mockExams = [];
  for (let i = 1; i <= 6; i++) {
    mockExams.push({
      id: "mock-" + i,
      type: "mock",
      label: "Mock Exam #" + i + " (full test)"
    });
  }

  // 3. Dias de estudio hasta el examen (empezando HOY)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(examDate);
  endDate.setHours(0, 0, 0, 0);

  const allowedDays = {
    7: [0, 1, 2, 3, 4, 5, 6],
    6: [1, 2, 3, 4, 5, 6],
    5: [1, 2, 3, 4, 5],
    4: [1, 2, 3, 4],
    3: [1, 2, 3],
    2: [2, 4],
    1: [3]
  };
  const allowed = allowedDays[daysPerWeek] || allowedDays[5];

  const allDays = [];
  const cursor = new Date(today);
  let isFirstDay = true;
  while (cursor <= endDate) {
    const dayOfWeek = cursor.getDay();
    let includeDay = allowed.includes(dayOfWeek);

    // Siempre incluir el primer dia (hoy), aunque no este en allowedDays
    if (isFirstDay) includeDay = true;

    if (includeDay) {
      const yyyy = cursor.getFullYear();
      const mm = String(cursor.getMonth() + 1).padStart(2, "0");
      const dd = String(cursor.getDate()).padStart(2, "0");
      allDays.push(yyyy + "-" + mm + "-" + dd);
      isFirstDay = false;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  if (allDays.length === 0) return {};

  // 4. Repartir en 3 vueltas proporcionalmente
  const totalDays = allDays.length;
  const daysPerPass = Math.floor(totalDays / 3);

  // 5. Generar cada vuelta con reparto proporcional de items
  const calendar = {};

  // VUELTA 1: aprendizaje
  const pass1Days = allDays.slice(0, daysPerPass);
  distributeItemsOverDays(calendar, queue, pass1Days, "learn", dailyMinutes);

  // VUELTA 2: refuerzo
  const pass2Days = allDays.slice(daysPerPass, daysPerPass * 2);
  distributeItemsOverDays(calendar, queue, pass2Days, "review", dailyMinutes);

  // VUELTA 3: consolidacion (mitad del contenido + mocks)
  const pass3Days = allDays.slice(daysPerPass * 2);
  const halfQueue = queue.filter((_, i) => i % 2 === 0);
  const queue3 = [...halfQueue, ...mockExams];
  distributeItemsOverDays(calendar, queue3, pass3Days, "consolidate", dailyMinutes);

  return calendar;
}

function distributeItemsOverDays(calendar, queue, days, passName, dailyMinutes) {
  if (days.length === 0 || queue.length === 0) return;

  const usableMinutes = Math.floor(dailyMinutes * 0.8);

  // Repartir items proporcionalmente: cuantos items por dia
  const itemsPerDay = Math.max(1, Math.ceil(queue.length / days.length));

  let queueIndex = 0;

  for (let d = 0; d < days.length; d++) {
    const dayKey = days[d];
    const tasks = [];
    let minutesUsed = 0;

    // Coger items hasta llenar el dia (o hasta itemsPerDay)
    while (queueIndex < queue.length && tasks.length < itemsPerDay * 2) {
      const item = queue[queueIndex];
      const itemMinutes = TIME_PER_ITEM[item.type] || (item.type === "mock" ? 120 : 20);
      if (minutesUsed + itemMinutes > usableMinutes && tasks.length > 0) break;
      tasks.push(item);
      minutesUsed += itemMinutes;
      queueIndex++;
    }

    calendar[dayKey] = {
      dayIndex: d + 1,
      pass: passName,
      tasks: tasks,
      completed: [],
      pending: tasks.map(t => t.id)
    };
  }
}

export function getStudyDaysBetween(startDate, endDate, daysPerWeek) {
  const allDays = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // Dias preferidos segun daysPerWeek (prioridad: lunes-viernes, luego sabado, luego domingo)
  // 7 -> [0,1,2,3,4,5,6]
  // 6 -> [1,2,3,4,5,6]   (quita domingo)
  // 5 -> [1,2,3,4,5]     (quita fin de semana)
  // 4 -> [1,2,3,4]       (quita fin de semana + viernes)
  // 3 -> [1,2,3]         (quita fin de semana + jueves y viernes)
  const allowedDays = {
    7: [0, 1, 2, 3, 4, 5, 6],
    6: [1, 2, 3, 4, 5, 6],
    5: [1, 2, 3, 4, 5],
    4: [1, 2, 3, 4],
    3: [1, 2, 3],
    2: [2, 4],
    1: [3]
  };

  const allowed = allowedDays[daysPerWeek] || allowedDays[5];

  while (cursor <= end) {
    const dayOfWeek = cursor.getDay();
    if (allowed.includes(dayOfWeek)) {
      const yyyy = cursor.getFullYear();
      const mm = String(cursor.getMonth() + 1).padStart(2, "0");
      const dd = String(cursor.getDate()).padStart(2, "0");
      allDays.push(yyyy + "-" + mm + "-" + dd);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return allDays;
}

export function estimateCalendarSummary(calendar) {
  const dates = Object.keys(calendar).sort();
  if (dates.length === 0) return null;

  let totalTasks = 0;
  let totalMinutes = 0;
  dates.forEach(d => {
    const day = calendar[d];
    totalTasks += day.tasks.length;
    day.tasks.forEach(t => {
      totalMinutes += TIME_PER_ITEM[t.type] || 20;
    });
  });

  return {
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    totalDays: dates.length,
    totalTasks: totalTasks,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10
  };
}
