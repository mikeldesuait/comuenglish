// Today: daily study plan with tasks and streak.
import { getState, getPlan, getDailyLog, getStreak, logDailyTask, getProgress } from "../state.js";
import { daysBetween, todayKey, nextUncompletedUnit, nextUncompletedReading, nextUncompletedListening, nextUncompletedWriting, nextUncompletedSpeaking } from "../core/planner.js";
import { navigate } from "../router.js";

export async function renderToday(view) {
  // Hide sidebar
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  const plan = getPlan();
  const state = getState();

  if (!plan.enabled) {
    // Not configured yet: redirect to onboarding
    view.innerHTML = "";
    const msg = document.createElement("div");
    msg.className = "feedback feedback--info";
    msg.innerHTML = "<strong>Welcome!</strong><br>You haven't created your study plan yet.";
    view.appendChild(msg);

    const btn = document.createElement("button");
    btn.className = "btn btn--primary";
    btn.textContent = "Create my plan";
    btn.style.marginTop = "16px";
    btn.style.padding = "12px 24px";
    btn.addEventListener("click", () => {
      navigate("onboarding");
    });
    view.appendChild(btn);
    return;
  }

  view.innerHTML = "";

  const today = todayKey();
  const dailyLog = getDailyLog()[today] || {};
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
  const daysStudied = Object.keys(getDailyLog()).length;

  const info = document.createElement("div");
  info.style.display = "flex";
  info.style.gap = "16px";
  info.style.flexWrap = "wrap";
  info.style.fontSize = ".85rem";
  info.style.opacity = ".95";

  [
    "🎯 Level: " + plan.targetLevel.toUpperCase(),
    "📅 " + daysLeft + " days until exam",
    "🔥 " + streak.current + " day streak",
    "📚 Studied " + daysStudied + " days"
  ].forEach(txt => {
    const s = document.createElement("span");
    s.textContent = txt;
    info.appendChild(s);
  });
  header.appendChild(info);
  view.appendChild(header);

  // Tasks
  const tasksTitle = document.createElement("h2");
  tasksTitle.textContent = "Your plan for today";
  tasksTitle.style.fontSize = "1.1rem";
  tasksTitle.style.marginBottom = "12px";
  view.appendChild(tasksTitle);

  // Generate tasks based on plan
  const itemsPerDay = Math.max(2, Math.floor(plan.dailyMinutes / 10));
  const tasks = await generateTodayTasksFromProgress(state.level, itemsPerDay);

  let completedCount = 0;

  // Group tasks by module
  const moduleMap = {
    "grammar": { name: "Fundamentals", icon: "📖", color: "#2563eb" },
    "reading": { name: "Reading", icon: "📚", color: "#7c3aed" },
    "listening": { name: "Listening", icon: "🎧", color: "#0891b2" },
    "writing": { name: "Writing", icon: "✍️", color: "#ea580c" },
    "speaking": { name: "Speaking", icon: "🗣️", color: "#16a34a" }
  };

  const grouped = {};
  tasks.forEach(task => {
    const moduleKey = task.id.split("-")[0];
    if (!grouped[moduleKey]) grouped[moduleKey] = [];
    grouped[moduleKey].push(task);
  });

  // Grid de tarjetas (una por modulo)
  const modulesGrid = document.createElement("div");
  modulesGrid.style.display = "grid";
  modulesGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(280px, 1fr))";
  modulesGrid.style.gap = "14px";
  modulesGrid.style.marginTop = "12px";

  Object.keys(grouped).forEach(moduleKey => {
    const mod = moduleMap[moduleKey] || { name: moduleKey, icon: "📌", color: "#64748b" };

    // Tarjeta del modulo
    const moduleCard = document.createElement("div");
    moduleCard.style.border = "1px solid #e2e8f0";
    moduleCard.style.borderRadius = "12px";
    moduleCard.style.background = "#fff";
    moduleCard.style.overflow = "hidden";
    moduleCard.style.transition = "box-shadow .15s, transform .15s";

    moduleCard.addEventListener("mouseenter", () => {
      moduleCard.style.boxShadow = "0 8px 20px rgba(0,0,0,.08)";
      moduleCard.style.transform = "translateY(-2px)";
    });
    moduleCard.addEventListener("mouseleave", () => {
      moduleCard.style.boxShadow = "none";
      moduleCard.style.transform = "translateY(0)";
    });

    // Cabecera de la tarjeta (color del modulo)
    const header = document.createElement("div");
    header.style.background = mod.color;
    header.style.color = "#fff";
    header.style.padding = "10px 14px";
    header.style.fontWeight = "bold";
    header.style.fontSize = ".85rem";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "8px";
    header.innerHTML = "<span style='font-size:1.1rem'>" + mod.icon + "</span><span>" + mod.name.toUpperCase() + "</span>";
    moduleCard.appendChild(header);

    // Tareas dentro de la tarjeta
    const tasksContainer = document.createElement("div");
    tasksContainer.style.padding = "12px";
    tasksContainer.style.display = "flex";
    tasksContainer.style.flexDirection = "column";
    tasksContainer.style.gap = "8px";

    grouped[moduleKey].forEach(task => {
      const taskRow = document.createElement("div");
      taskRow.style.display = "flex";
      taskRow.style.alignItems = "center";
      taskRow.style.gap = "10px";
      taskRow.style.padding = "10px 12px";
      taskRow.style.border = "1px solid #e2e8f0";
      taskRow.style.borderRadius = "8px";
      taskRow.style.background = "#f8fafc";

      const isDone = dailyLog[task.id] || false;
      if (isDone) completedCount++;

      taskRow.innerHTML =
        "<div style='font-size:1.3rem'>" + task.icon + "</div>" +
        "<div style='flex:1; min-width:0'>" +
          "<div style='font-weight:600; font-size:.82rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis'>" + task.label + "</div>" +
          "<div style='font-size:.7rem; color:#64748b; margin-top:2px'>" + task.description + "</div>" +
        "</div>" +
        "<div style='font-size:1.1rem'>" + (isDone ? "✅" : "⏳") + "</div>";

      if (isDone) {
        taskRow.style.background = "#f0fdf4";
        taskRow.style.borderColor = "#16a34a";
      }

      tasksContainer.appendChild(taskRow);
    });

    moduleCard.appendChild(tasksContainer);
    modulesGrid.appendChild(moduleCard);
  });

  view.appendChild(modulesGrid);

  // Progress of the day
  const progressBox = document.createElement("div");
  progressBox.style.marginTop = "20px";
  progressBox.style.padding = "16px";
  progressBox.style.background = "#f1f5f9";
  progressBox.style.borderRadius = "10px";

  const progressTitle = document.createElement("div");
  progressTitle.style.fontWeight = "bold";
  progressTitle.style.marginBottom = "8px";
  progressTitle.textContent = "Today: " + completedCount + "/" + tasks.length + " completed";
  progressBox.appendChild(progressTitle);

  const bar = document.createElement("div");
  bar.style.height = "10px";
  bar.style.background = "#e2e8f0";
  bar.style.borderRadius = "5px";
  bar.style.overflow = "hidden";

  const fill = document.createElement("div");
  const pct = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  fill.style.height = "100%";
  fill.style.width = pct + "%";
  fill.style.background = pct === 100 ? "#16a34a" : "linear-gradient(90deg, #2563eb, #1e40af)";
  fill.style.transition = "width .3s";
  bar.appendChild(fill);
  progressBox.appendChild(bar);

  if (pct === 100) {
    const done = document.createElement("div");
    done.style.marginTop = "12px";
    done.style.color = "#16a34a";
    done.style.fontWeight = "bold";
    done.textContent = "🎉 Well done! You finished today's plan.";
    progressBox.appendChild(done);
  }

  view.appendChild(progressBox);

  // Action buttons
  const actions = document.createElement("div");
  actions.style.marginTop = "20px";
  actions.style.display = "flex";
  actions.style.gap = "10px";
  actions.style.flexWrap = "wrap";

  const startBtn = document.createElement("button");
  startBtn.className = "btn btn--primary";
  startBtn.textContent = "Go to Fundamentals";
  startBtn.addEventListener("click", () => {
    navigate("fundamentals");
  });
  actions.appendChild(startBtn);

  const configBtn = document.createElement("button");
  configBtn.className = "btn btn--ghost";
  configBtn.textContent = "Edit my plan";
  configBtn.addEventListener("click", () => {
    navigate("onboarding");
  });
  actions.appendChild(configBtn);

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
