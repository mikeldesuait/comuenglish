// Today: daily study plan with tasks and streak.
import { getState, getPlan, getDailyLog, getStreak, logDailyTask, getProgress, getCalendar, markCalendarTaskCompleted, getBehindDays } from "../state.js";
import { daysBetween, todayKey, nextUncompletedUnit, nextUncompletedReading, nextUncompletedListening, nextUncompletedWriting, nextUncompletedSpeaking } from "../core/planner.js";
import { navigate } from "../router.js";

export async function renderToday(view) {
  // Ocultar sidebar
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  const plan = getPlan();
  const state = getState();

  if (!plan.enabled) {
    navigate("onboarding");
    return;
  }

  view.innerHTML = "";

  const today = todayKey();
  const calendar = getCalendar();
  const streak = getStreak();

  // Header
  const header = document.createElement("div");
  header.style.background = "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
  header.style.color = "#fff";
  header.style.padding = "20px 24px";
  header.style.borderRadius = "12px";
  header.style.marginBottom = "20px";

  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long"
  });

  const h1 = document.createElement("h1");
  h1.textContent = "Today - " + dateStr;
  h1.style.fontSize = "1.3rem";
  h1.style.marginBottom = "6px";
  header.appendChild(h1);

  const daysLeft = daysBetween(new Date(), new Date(plan.examDate));
  const behindDays = getBehindDays();

  const info = document.createElement("div");
  info.style.display = "flex";
  info.style.gap = "16px";
  info.style.flexWrap = "wrap";
  info.style.fontSize = ".85rem";
  info.style.opacity = ".95";

  const infoTexts = [
    "🎯 Level: " + plan.targetLevel.toUpperCase(),
    "📅 " + daysLeft + " days until exam",
    "🔥 " + streak.current + " day streak"
  ];

  if (behindDays > 0) {
    infoTexts.push("⚠️ " + behindDays + " days behind");
  }

  infoTexts.forEach(txt => {
    const s = document.createElement("span");
    s.textContent = txt;
    info.appendChild(s);
  });
  header.appendChild(info);
  view.appendChild(header);

  // Verificar si hoy esta en el calendario
  const dayData = calendar[today];

  if (!dayData) {
    // No hay tareas para hoy
    const restDay = document.createElement("div");
    restDay.className = "feedback feedback--info";
    restDay.style.marginTop = "16px";
    restDay.style.padding = "24px";
    restDay.style.textAlign = "center";
    restDay.innerHTML = "<h3 style='margin-bottom:8px'>🎉 Rest day!</h3><p>No tasks scheduled for today. Enjoy your break.</p>";
    view.appendChild(restDay);
    return;
  }

  // Etiqueta de vuelta
  const passLabels = {
    "learn": { icon: "📖", label: "PASS 1 - Learning", color: "#2563eb" },
    "review": { icon: "🔁", label: "PASS 2 - Review", color: "#7c3aed" },
    "consolidate": { icon: "🎯", label: "PASS 3 - Consolidation", color: "#16a34a" }
  };
  const passInfo = passLabels[dayData.pass] || { icon: "📅", label: "Day", color: "#64748b" };

  const passBadge = document.createElement("div");
  passBadge.style.background = passInfo.color;
  passBadge.style.color = "#fff";
  passBadge.style.padding = "6px 14px";
  passBadge.style.borderRadius = "8px";
  passBadge.style.display = "inline-block";
  passBadge.style.fontSize = ".75rem";
  passBadge.style.fontWeight = "bold";
  passBadge.style.marginBottom = "12px";
  passBadge.textContent = passInfo.icon + " " + passInfo.label + " - Day " + dayData.dayIndex;
  view.appendChild(passBadge);

  // Titulo de tareas
  const tasksTitle = document.createElement("h2");
  tasksTitle.textContent = "Your tasks for today";
  tasksTitle.style.fontSize = "1.1rem";
  tasksTitle.style.marginBottom = "12px";
  view.appendChild(tasksTitle);

  // Tareas
  const tasksGrid = document.createElement("div");
  tasksGrid.style.display = "grid";
  tasksGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(320px, 1fr))";
  tasksGrid.style.gap = "12px";

  const moduleMap = {
    "fundamentals": { icon: "📖", name: "Fundamentals", color: "#2563eb" },
    "reading": { icon: "📚", name: "Reading", color: "#7c3aed" },
    "listening": { icon: "🎧", name: "Listening", color: "#0891b2" },
    "writing": { icon: "✍️", name: "Writing", color: "#ea580c" },
    "speaking": { icon: "🗣️", name: "Speaking", color: "#16a34a" },
    "mock": { icon: "🎓", name: "Mock Exam", color: "#dc2626" }
  };

  let completedCount = 0;

  dayData.tasks.forEach(task => {
    const taskType = task.id.split("-")[0] === "mock" ? "mock" : (task.type || "reading");
    const mod = moduleMap[taskType] || { icon: "📌", name: taskType, color: "#64748b" };
    const isDone = dayData.completed && dayData.completed.includes(task.id);
    if (isDone) completedCount++;

    const card = document.createElement("div");
    card.style.border = "1px solid #e2e8f0";
    card.style.borderRadius = "10px";
    card.style.background = isDone ? "#f0fdf4" : "#fff";
    card.style.overflow = "hidden";
    card.style.transition = "all .15s";

    if (isDone) card.style.borderColor = "#16a34a";

    const cardHeader = document.createElement("div");
    cardHeader.style.background = mod.color;
    cardHeader.style.color = "#fff";
    cardHeader.style.padding = "6px 12px";
    cardHeader.style.fontSize = ".7rem";
    cardHeader.style.fontWeight = "bold";
    cardHeader.style.display = "flex";
    cardHeader.style.alignItems = "center";
    cardHeader.style.gap = "6px";
    cardHeader.innerHTML = "<span>" + mod.icon + "</span><span>" + mod.name.toUpperCase() + "</span>";
    card.appendChild(cardHeader);

    const cardBody = document.createElement("div");
    cardBody.style.padding = "14px 16px";
    cardBody.style.display = "flex";
    cardBody.style.flexDirection = "column";
    cardBody.style.gap = "12px";

    // Titulo + estado
    const cardTop = document.createElement("div");
    cardTop.style.display = "flex";
    cardTop.style.alignItems = "flex-start";
    cardTop.style.gap = "10px";

    const titleBlock = document.createElement("div");
    titleBlock.style.flex = "1";
    titleBlock.style.minWidth = "0";
    titleBlock.innerHTML =
      "<div style='font-weight:600; font-size:.9rem; margin-bottom:4px'>" + task.label + "</div>" +
      "<div style='font-size:.75rem; color:#64748b'>" + (isDone ? "Completed" : "Not yet done") + "</div>";
    cardTop.appendChild(titleBlock);

    const statusIcon = document.createElement("div");
    statusIcon.textContent = isDone ? "✅" : "⏳";
    statusIcon.style.fontSize = "1.4rem";
    cardTop.appendChild(statusIcon);

    cardBody.appendChild(cardTop);

    // Boton para abrir la tarea en su modulo
    if (!isDone) {
      const openBtn = document.createElement("button");
      openBtn.textContent = "Open in " + mod.name + " →";
      openBtn.style.padding = "10px 16px";
      openBtn.style.background = mod.color;
      openBtn.style.color = "#fff";
      openBtn.style.border = "none";
      openBtn.style.borderRadius = "8px";
      openBtn.style.fontSize = ".85rem";
      openBtn.style.fontWeight = "bold";
      openBtn.style.cursor = "pointer";
      openBtn.style.alignSelf = "flex-start";
      openBtn.style.transition = "opacity .15s";
      openBtn.addEventListener("mouseenter", () => openBtn.style.opacity = ".85");
      openBtn.addEventListener("mouseleave", () => openBtn.style.opacity = "1");
      openBtn.addEventListener("click", () => {
        navigate(taskType === "fundamentals" ? "fundamentals" : (taskType === "reading" || taskType === "listening" ? "comprehension" : "production"));
      });
      cardBody.appendChild(openBtn);
    }

    card.appendChild(cardBody);
    tasksGrid.appendChild(card);
  });

  view.appendChild(tasksGrid);

  // Barra de progreso del dia
  const progressBox = document.createElement("div");
  progressBox.style.marginTop = "20px";
  progressBox.style.padding = "16px";
  progressBox.style.background = "#f1f5f9";
  progressBox.style.borderRadius = "10px";

  const progressTitle = document.createElement("div");
  progressTitle.style.fontWeight = "bold";
  progressTitle.style.marginBottom = "8px";
  progressTitle.textContent = "Today: " + completedCount + "/" + dayData.tasks.length + " completed";
  progressBox.appendChild(progressTitle);

  const bar = document.createElement("div");
  bar.style.height = "10px";
  bar.style.background = "#e2e8f0";
  bar.style.borderRadius = "5px";
  bar.style.overflow = "hidden";

  const fill = document.createElement("div");
  const pct = dayData.tasks.length > 0 ? (completedCount / dayData.tasks.length) * 100 : 0;
  fill.style.height = "100%";
  fill.style.width = pct + "%";
  fill.style.background = pct === 100 ? "#16a34a" : "linear-gradient(90deg, #2563eb, #1e40af)";
  fill.style.transition = "width .3s";
  bar.appendChild(fill);
  progressBox.appendChild(bar);

  if (pct === 100 && dayData.tasks.length > 0) {
    const done = document.createElement("div");
    done.style.marginTop = "12px";
    done.style.color = "#16a34a";
    done.style.fontWeight = "bold";
    done.textContent = "🎉 Well done! You finished today's plan.";
    progressBox.appendChild(done);
  }

  view.appendChild(progressBox);

  // Boton unico al final (discreto)
  const actions = document.createElement("div");
  actions.style.marginTop = "24px";
  actions.style.display = "flex";
  actions.style.gap = "10px";
  actions.style.flexWrap = "wrap";
  actions.style.justifyContent = "flex-end";

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn--ghost";
  editBtn.textContent = "Edit my plan";
  editBtn.style.fontSize = ".85rem";
  editBtn.style.padding = "8px 16px";
  editBtn.addEventListener("click", () => navigate("onboarding"));
  actions.appendChild(editBtn);

  view.appendChild(actions);
}


async function generateTodayTasksFromProgress(level, count) {
  const progress = getProgress(level);
  const tasks = [];

  try {
    const unitsRes = await fetch("data/" + level + "/units.json");
    const unitsData = await unitsRes.json();
    const nextUnit = nextUncompletedUnit(unitsData.units, progress);
    if (nextUnit && count >= 1) {
      tasks.push({
        id: "grammar-" + nextUnit.id,
        icon: "📖",
        label: nextUnit.title,
        description: "Complete the full unit with exercises",
        route: "fundamentals"
      });
    }

    const readRes = await fetch("data/" + level + "/reading.json");
    const readData = await readRes.json();
    const nextReading = nextUncompletedReading(readData.texts, progress);
    if (nextReading && count >= 2) {
      tasks.push({
        id: "reading-" + nextReading.id,
        icon: "📚",
        label: "Reading " + (readData.texts.indexOf(nextReading) + 1) + " - " + nextReading.title,
        description: "Read and answer the questions",
        route: "comprehension"
      });
    }

    const listenRes = await fetch("data/" + level + "/listening.json");
    const listenData = await listenRes.json();
    const nextListening = nextUncompletedListening(listenData.audios, progress);
    if (nextListening && count >= 3) {
      tasks.push({
        id: "listening-" + nextListening.id,
        icon: "🎧",
        label: "Listening " + (listenData.audios.indexOf(nextListening) + 1) + " - " + nextListening.title,
        description: "Listen and answer the questions",
        route: "comprehension"
      });
    }

    const writeRes = await fetch("data/" + level + "/writing.json");
    const writeData = await writeRes.json();
    const nextWriting = nextUncompletedWriting(writeData.tasks, progress);
    if (nextWriting && count >= 4) {
      tasks.push({
        id: "writing-" + nextWriting.id,
        icon: "✍️",
        label: "Writing " + (writeData.tasks.indexOf(nextWriting) + 1) + " - " + nextWriting.title,
        description: "Write your answer",
        route: "production"
      });
    }

    const speakRes = await fetch("data/" + level + "/speaking.json");
    const speakData = await speakRes.json();
    const nextSpeaking = nextUncompletedSpeaking(speakData.prompts, progress);
    if (nextSpeaking && count >= 5) {
      tasks.push({
        id: "speaking-" + nextSpeaking.id,
        icon: "🗣️",
        label: "Speaking " + (speakData.prompts.indexOf(nextSpeaking) + 1) + " - " + nextSpeaking.title,
        description: "Record your answer",
        route: "production"
      });
    }
  } catch (err) {
    console.error("Error loading tasks:", err);
  }

  return tasks;
}
