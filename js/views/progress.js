// Progress: dashboard with real metrics, high contrast.
import { getState, getPlan, getCalendar, getStreak, getProgress, getTimeTracking } from "../state.js";
import { calculateRemainingHours, calculateTotalGoalHours, formatHours, LEVEL_TOTALS, TIME_PER_ITEM } from "../core/planner.js";

const C = {
  text: "#0f172a",          // casi negro para texto principal
  textSecondary: "#334155", // gris oscuro para etiquetas
  textMuted: "#64748b",     // gris medio para detalles
  blue: "#1d4ed8",          // azul fuerte
  barBg: "#e2e8f0",         // fondo de barras
  border: "#cbd5e1",        // bordes visibles
  green: "#15803d",
  red: "#b91c1c",
  amber: "#b45309"
};

export function renderProgress(view) {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  const plan = getPlan();
  const state = getState();

  view.innerHTML = "";

  if (!plan.enabled) {
    const msg = document.createElement("div");
    msg.className = "feedback feedback--info";
    msg.textContent = "No plan yet. Create your study plan to see progress.";
    view.appendChild(msg);
    return;
  }

  const level = plan.targetLevel;
  const progress = getProgress(level);
  const streak = getStreak();
  const calendar = getCalendar();
  const timeTracking = getTimeTracking();

  // ----- DATOS -----
  const totals = LEVEL_TOTALS[level] || LEVEL_TOTALS.a2;
  let plannedMinutes = 0;
  Object.keys(totals).forEach(type => {
    plannedMinutes += totals[type] * TIME_PER_ITEM[type];
  });
  const plannedHours = plannedMinutes / 60;

  let realMinutes = 0;
  Object.values(timeTracking.dailyMinutes || {}).forEach(m => realMinutes += m);
  const realHours = realMinutes / 60;
  const pctHours = plannedHours > 0 ? Math.min(100, (realHours / plannedHours) * 100) : 0;

  const contentTypes = [
    { key: "units", label: "Units", total: totals.fundamentals },
    { key: "reading", label: "Reading", total: totals.reading },
    { key: "listening", label: "Listening", total: totals.listening },
    { key: "writing", label: "Writing", total: totals.writing },
    { key: "speaking", label: "Speaking", total: totals.speaking }
  ];

  contentTypes.forEach(c => {
    const done = progress[c.key] ? Object.values(progress[c.key]).filter(x => x && x.completed).length : 0;
    c.done = done;
  });

  const totalItems = contentTypes.reduce((s, c) => s + c.total, 0);
  const totalDone = contentTypes.reduce((s, c) => s + c.done, 0);
  const pctItems = totalItems > 0 ? (totalDone / totalItems) * 100 : 0;

  const today = new Date();
  const examDate = new Date(plan.examDate);
  const daysRemaining = Math.max(0, Math.ceil((examDate - today) / 86400000));
  const daysStudied = Object.values(calendar).filter(d => d.completed && d.completed.length > 0).length;

  // ----- HEADER -----
  const header = document.createElement("div");
  header.style.marginBottom = "24px";

  const h1 = document.createElement("h1");
  h1.style.fontSize = "1.6rem";
  h1.style.fontWeight = "800";
  h1.style.color = C.text;
  h1.style.marginBottom = "4px";
  h1.textContent = "Progress";
  header.appendChild(h1);

  const sub = document.createElement("div");
  sub.style.fontSize = ".9rem";
  sub.style.fontWeight = "500";
  sub.style.color = C.textSecondary;
  sub.textContent = level.toUpperCase() + " Elementary · Exam: " + examDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  header.appendChild(sub);

  view.appendChild(header);

  // ----- METRICAS PRINCIPALES -----
  const table = document.createElement("div");
  table.style.background = "#fff";
  table.style.border = "2px solid " + C.border;
  table.style.borderRadius = "10px";
  table.style.overflow = "hidden";
  table.style.marginBottom = "28px";

  const metrics = [
    { label: "Hours studied", value: realHours.toFixed(1) + " h", detail: "of " + plannedHours.toFixed(0) + " h planned", pct: pctHours },
    { label: "Content completed", value: totalDone + " / " + totalItems, detail: "items", pct: pctItems },
    { label: "Days studied", value: daysStudied + " / " + (daysStudied + Math.floor(daysRemaining * 0.7)), detail: "days", pct: null },
    { label: "Current streak", value: streak.current + (streak.current === 1 ? " day" : " days"), detail: "best: " + streak.best + " days", pct: null }
  ];

  metrics.forEach((m, i) => {
    const row = document.createElement("div");
    row.style.padding = "16px 20px";
    row.style.borderBottom = i < metrics.length - 1 ? "1px solid " + C.border : "none";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "16px";

    const label = document.createElement("div");
    label.style.minWidth = "180px";
    label.style.fontSize = ".9rem";
    label.style.fontWeight = "600";
    label.style.color = C.text;
    label.textContent = m.label;
    row.appendChild(label);

    const value = document.createElement("div");
    value.style.minWidth = "100px";
    value.style.fontSize = "1.05rem";
    value.style.fontWeight = "700";
    value.style.color = C.text;
    value.textContent = m.value;
    row.appendChild(value);

    const detail = document.createElement("div");
    detail.style.fontSize = ".85rem";
    detail.style.color = C.textMuted;
    detail.style.flex = "1";
    detail.textContent = m.detail;
    row.appendChild(detail);

    if (m.pct !== null) {
      const barContainer = document.createElement("div");
      barContainer.style.width = "120px";
      barContainer.style.height = "8px";
      barContainer.style.background = C.barBg;
      barContainer.style.borderRadius = "4px";
      barContainer.style.overflow = "hidden";

      const barFill = document.createElement("div");
      barFill.style.height = "100%";
      barFill.style.width = Math.max(m.pct, 2) + "%";
      barFill.style.background = C.blue;
      barContainer.appendChild(barFill);
      row.appendChild(barContainer);

      const pctText = document.createElement("div");
      pctText.style.fontSize = ".85rem";
      pctText.style.fontWeight = "700";
      pctText.style.color = C.text;
      pctText.style.minWidth = "45px";
      pctText.style.textAlign = "right";
      pctText.textContent = Math.round(m.pct) + "%";
      row.appendChild(pctText);
    }

    table.appendChild(row);
  });

  view.appendChild(table);

  // ----- CONTENIDO POR MODULO -----
  const contentTitle = document.createElement("h2");
  contentTitle.style.fontSize = "1.15rem";
  contentTitle.style.fontWeight = "800";
  contentTitle.style.color = C.text;
  contentTitle.style.marginBottom = "12px";
  contentTitle.textContent = "Content by module";
  view.appendChild(contentTitle);

  const contentTable = document.createElement("div");
  contentTable.style.background = "#fff";
  contentTable.style.border = "2px solid " + C.border;
  contentTable.style.borderRadius = "10px";
  contentTable.style.overflow = "hidden";
  contentTable.style.marginBottom = "28px";

  contentTypes.forEach((c, i) => {
    const row = document.createElement("div");
    row.style.padding = "14px 20px";
    row.style.borderBottom = i < contentTypes.length - 1 ? "1px solid " + C.border : "none";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "16px";

    const name = document.createElement("div");
    name.style.minWidth = "120px";
    name.style.fontSize = ".9rem";
    name.style.fontWeight = "600";
    name.style.color = C.text;
    name.textContent = c.label;
    row.appendChild(name);

    const count = document.createElement("div");
    count.style.minWidth = "80px";
    count.style.fontSize = ".95rem";
    count.style.fontWeight = "700";
    count.style.color = C.text;
    count.textContent = c.done + " / " + c.total;
    row.appendChild(count);

    const pct = c.total > 0 ? (c.done / c.total) * 100 : 0;

    const barContainer = document.createElement("div");
    barContainer.style.flex = "1";
    barContainer.style.height = "8px";
    barContainer.style.background = C.barBg;
    barContainer.style.borderRadius = "4px";
    barContainer.style.overflow = "hidden";

    const barFill = document.createElement("div");
    barFill.style.height = "100%";
    barFill.style.width = Math.max(pct, 1) + "%";
    barFill.style.background = C.blue;
    barContainer.appendChild(barFill);
    row.appendChild(barContainer);

    const pctText = document.createElement("div");
    pctText.style.fontSize = ".85rem";
    pctText.style.fontWeight = "700";
    pctText.style.color = C.text;
    pctText.style.minWidth = "45px";
    pctText.style.textAlign = "right";
    pctText.textContent = Math.round(pct) + "%";
    row.appendChild(pctText);

    contentTable.appendChild(row);
  });

  view.appendChild(contentTable);

  // ----- STATUS / PROYECCION -----
  const statusBox = document.createElement("div");
  statusBox.style.padding = "16px 20px";
  statusBox.style.borderRadius = "10px";
  statusBox.style.border = "2px solid " + C.border;
  statusBox.style.background = "#f8fafc";
  statusBox.style.fontSize = ".9rem";
  statusBox.style.color = C.text;
  statusBox.style.lineHeight = "1.6";
  statusBox.style.fontWeight = "500";

  if (realHours > 0 && daysStudied > 0) {
    const hoursPerDay = realHours / daysStudied;
    const hoursRemaining = Math.max(0, plannedHours - realHours);
    const daysToFinish = Math.ceil(hoursRemaining / hoursPerDay);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + daysToFinish);

    if (endDate <= examDate) {
      statusBox.innerHTML =
        "<strong style='color:" + C.green + "'>On track.</strong> " +
        "Estimated completion: <strong>" + endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + "</strong>. " +
        "You have <strong>" + Math.ceil((examDate - endDate) / 86400000) + " days</strong> of margin before your exam.";
    } else {
      statusBox.innerHTML =
        "<strong style='color:" + C.red + "'>Behind schedule.</strong> " +
        "Estimated completion: <strong>" + endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + "</strong>. " +
        "You need to study more to finish before your exam.";
    }
  } else {
    statusBox.textContent = "Not enough data yet. Complete a few more tasks to see your projection.";
  }

  view.appendChild(statusBox);

  // ----- BOTONES -----
  const actions = document.createElement("div");
  actions.style.marginTop = "24px";
  actions.style.display = "flex";
  actions.style.gap = "10px";

  const todayBtn = document.createElement("button");
  todayBtn.className = "btn btn--ghost";
  todayBtn.textContent = "Back to Today";
  todayBtn.addEventListener("click", () => {
    import("../router.js").then(m => m.navigate("today"));
  });
  actions.appendChild(todayBtn);

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn--ghost";
  editBtn.textContent = "Edit plan";
  editBtn.addEventListener("click", () => {
    import("../router.js").then(m => m.navigate("onboarding"));
  });
  actions.appendChild(editBtn);

  view.appendChild(actions);
}
