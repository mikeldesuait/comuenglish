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
