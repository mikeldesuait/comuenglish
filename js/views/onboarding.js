// Onboarding: compact horizontal layout.
import { getState, setState, updatePlan, setCalendar } from "../state.js";
import { generateCalendar, calculateTotalGoalHours, getStudyDaysBetween } from "../core/planner.js";
import { navigate } from "../router.js";

export function renderOnboarding(view) {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  view.innerHTML = "";
  view.style.padding = "0";

  const form = {
    level: getState().level || "a2",
    examDate: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      return d.toISOString().slice(0, 10);
    })(),
    daysPerWeek: 5
  };

  const container = document.createElement("div");
  container.style.maxWidth = "1000px";
  container.style.margin = "32px auto";
  container.style.padding = "0 20px";

  // Header
  const h1 = document.createElement("h1");
  h1.textContent = "Create your study plan";
  h1.style.fontSize = "1.7rem";
  h1.style.fontWeight = "800";
  h1.style.color = "#0f172a";
  h1.style.marginBottom = "6px";
  h1.style.letterSpacing = "-0.5px";
  container.appendChild(h1);

  const sub = document.createElement("p");
  sub.textContent = "We'll build a personalised calendar based on your availability.";
  sub.style.fontSize = ".95rem";
  sub.style.color = "#64748b";
  sub.style.marginBottom = "28px";
  container.appendChild(sub);

  // ============================================================
  // FORM: 3 COLUMNAS
  // ============================================================
  // ============================================================
  // GRID UNIFICADO: 3 columnas x 2 filas
  // Fila 1: selectores (LEVEL, EXAM DATE, DAYS PER WEEK)
  // Fila 2: preview (STUDY DAYS, DAILY TIME, CONTENT)
  // ============================================================
  const formGrid = document.createElement("div");
  formGrid.style.display = "grid";
  formGrid.style.gridTemplateColumns = "1fr 1fr 1fr";
  formGrid.style.gap = "20px";
  formGrid.style.marginBottom = "20px";

  // ---- Fila 1: LEVEL (horizontal) ----
  const col1 = createColumn("LEVEL");
  const levelRow = document.createElement("div");
  levelRow.style.display = "flex";
  levelRow.style.gap = "6px";

  const levelOptions = [
    { value: "a2", label: "A2" },
    { value: "b1", label: "B1" },
    { value: "b2", label: "B2" }
  ];

  levelOptions.forEach(opt => {
    const btn = document.createElement("label");
    btn.style.padding = "12px 22px";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "6px";
    btn.style.border = opt.value === form.level ? "2px solid #f97316" : "1px solid #cbd5e1";
    btn.style.background = opt.value === form.level ? "#fff7ed" : "#fff";
    btn.style.fontWeight = "700";
    btn.style.fontSize = "1rem";
    btn.style.color = opt.value === form.level ? "#c2410c" : "#0f172a";
    btn.style.transition = "all .15s";
    btn.textContent = opt.label;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      form.level = opt.value;
      levelRow.querySelectorAll("label").forEach(l => {
        l.style.border = "1px solid #cbd5e1";
        l.style.background = "#fff";
        l.style.color = "#0f172a";
      });
      btn.style.border = "2px solid #f97316";
      btn.style.background = "#fff7ed";
      btn.style.color = "#c2410c";
      updateAll();
    });

    levelRow.appendChild(btn);
  });
  col1.body.appendChild(levelRow);
  formGrid.appendChild(col1.container);

  // ---- Fila 1: EXAM DATE ----
  const col2 = createColumn("EXAM DATE");
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = form.examDate;
  dateInput.style.padding = "12px 14px";
  dateInput.style.borderRadius = "6px";
  dateInput.style.border = "1px solid #cbd5e1";
  dateInput.style.fontSize = "1rem";
  dateInput.style.width = "100%";
  dateInput.style.fontFamily = "inherit";
  dateInput.style.color = "#0f172a";
  dateInput.style.background = "#fff";
  dateInput.addEventListener("change", () => {
    form.examDate = dateInput.value;
    updateAll();
  });
  col2.body.appendChild(dateInput);
  formGrid.appendChild(col2.container);

  // ---- Fila 1: DAYS PER WEEK ----
  const col3 = createColumn("DAYS PER WEEK");
  const daysRow = document.createElement("div");
  daysRow.style.display = "flex";
  daysRow.style.gap = "4px";
  daysRow.style.flexWrap = "wrap";

  [3, 4, 5, 6, 7].forEach(n => {
    const btn = document.createElement("label");
    btn.style.width = "48px";
    btn.style.height = "48px";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "6px";
    btn.style.border = n === form.daysPerWeek ? "2px solid #f97316" : "1px solid #cbd5e1";
    btn.style.background = n === form.daysPerWeek ? "#fff7ed" : "#fff";
    btn.style.fontWeight = "700";
    btn.style.fontSize = "1rem";
    btn.style.color = n === form.daysPerWeek ? "#c2410c" : "#0f172a";
    btn.style.transition = "all .15s";
    btn.appendChild(document.createTextNode(n));

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      form.daysPerWeek = n;
      daysRow.querySelectorAll("label").forEach(l => {
        l.style.border = "1px solid #cbd5e1";
        l.style.background = "#fff";
        l.style.color = "#0f172a";
      });
      btn.style.border = "2px solid #f97316";
      btn.style.background = "#fff7ed";
      btn.style.color = "#c2410c";
      updateAll();
    });

    daysRow.appendChild(btn);
  });
  col3.body.appendChild(daysRow);
  formGrid.appendChild(col3.container);

  // ---- Fila 2: STUDY DAYS (preview columna 1) ----
  const prev1 = createPreviewColumn("STUDY DAYS", "---");
  formGrid.appendChild(prev1.container);

  // ---- Fila 2: DAILY TIME (preview columna 2) ----
  const prev2 = createPreviewColumn("DAILY TIME", "---", "#c2410c");
  formGrid.appendChild(prev2.container);

  // ---- Fila 2: CONTENT (preview columna 3) ----
  const prev3 = createPreviewColumn("CONTENT", "---");
  formGrid.appendChild(prev3.container);

  container.appendChild(formGrid);

  function updatePreview() {
    const days = getStudyDaysBetween(new Date(), new Date(form.examDate), form.daysPerWeek);
    const totalDays = days.length;
    const totalHours = calculateTotalGoalHours(form.level);
    const minutesPerDay = Math.max(15, Math.ceil((totalHours * 60) / Math.max(totalDays, 1)));

    function fmt(m) {
      if (m < 60) return m + " min";
      const h = Math.floor(m / 60);
      const mm = m % 60;
      return h + "h" + (mm > 0 ? " " + mm + "m" : "");
    }

    prev1.setValue(String(totalDays));
    prev2.setValue(fmt(minutesPerDay));
    prev3.setValue(totalHours + "h");
  }

  // ============================================================
  // STATUS (mismo bloque que preview, debajo)
  // ============================================================
  const status = document.createElement("div");
  status.style.fontSize = ".95rem";
  status.style.padding = "12px 16px";
  status.style.borderRadius = "8px";
  status.style.marginBottom = "20px";
  status.style.textAlign = "center";
  container.appendChild(status);

  function updateStatus() {
    const days = getStudyDaysBetween(new Date(), new Date(form.examDate), form.daysPerWeek);
    const totalHours = calculateTotalGoalHours(form.level);
    const minutesPerDay = Math.max(15, Math.ceil((totalHours * 60) / Math.max(days.length, 1)));
    const feasible = minutesPerDay <= 120;

    if (feasible) {
      status.style.background = "#f0fdf4";
      status.style.color = "#15803d";
      status.style.border = "1px solid #bbf7d0";
      status.textContent = "✓ This pace is realistic. You'll have margin before your exam.";
    } else {
      status.style.background = "#fef2f2";
      status.style.color = "#b91c1c";
      status.style.border = "1px solid #fecaca";
      status.textContent = "⚠ This pace is demanding. Consider more days or a later date.";
    }
  }

  function updateAll() {
    updatePreview();
    updateStatus();
  }

  updateAll();

  // ============================================================
  // BOTON
  // ============================================================
  const startBtn = document.createElement("button");
  startBtn.textContent = "Create my plan →";
  startBtn.style.width = "100%";
  startBtn.style.padding = "16px";
  startBtn.style.background = "#c2410c";
  startBtn.style.color = "#fff";
  startBtn.style.border = "none";
  startBtn.style.borderRadius = "10px";
  startBtn.style.fontSize = "1.05rem";
  startBtn.style.fontWeight = "700";
  startBtn.style.cursor = "pointer";
  startBtn.style.transition = "background .15s";
  startBtn.style.maxWidth = "400px";
  startBtn.style.margin = "0 auto";
  startBtn.style.display = "block";

  startBtn.addEventListener("mouseenter", () => startBtn.style.background = "#1d4ed8");
  startBtn.addEventListener("mouseleave", () => startBtn.style.background = "#c2410c");

  startBtn.addEventListener("click", async () => {
    const days = getStudyDaysBetween(new Date(), new Date(form.examDate), form.daysPerWeek);
    const totalHours = calculateTotalGoalHours(form.level);
    const minutesPerDay = Math.max(15, Math.ceil((totalHours * 60) / days.length));

    const plan = {
      enabled: true,
      examDate: form.examDate,
      dailyMinutes: minutesPerDay,
      daysPerWeek: form.daysPerWeek,
      startDate: new Date().toISOString().slice(0, 10),
      targetLevel: form.level
    };

    setState({ level: form.level });
    updatePlan(plan);

    startBtn.disabled = true;
    startBtn.textContent = "Generating...";

    try {
      const calendar = await generateCalendar(form.level, form.examDate, minutesPerDay, form.daysPerWeek);
      setCalendar(calendar);
      navigate("today");
    } catch (err) {
      console.error("Error:", err);
      alert("Error: " + err.message);
      startBtn.disabled = false;
      startBtn.textContent = "Create my plan →";
    }
  });

  container.appendChild(startBtn);

  view.appendChild(container);
}

function createColumn(label) {
  const container = document.createElement("div");

  const labelEl = document.createElement("div");
  labelEl.textContent = label;
  labelEl.style.fontSize = ".75rem";
  labelEl.style.fontWeight = "700";
  labelEl.style.letterSpacing = "1px";
  labelEl.style.color = "#64748b";
  labelEl.style.marginBottom = "10px";
  container.appendChild(labelEl);

  const body = document.createElement("div");
  container.appendChild(body);

  return { container, body };
}


function createPreviewColumn(label, initialValue, color) {
  const container = document.createElement("div");
  container.style.background = "#f8fafc";
  container.style.padding = "14px 16px";
  container.style.borderRadius = "8px";
  container.style.textAlign = "center";

  const labelEl = document.createElement("div");
  labelEl.textContent = label;
  labelEl.style.fontSize = ".7rem";
  labelEl.style.fontWeight = "700";
  labelEl.style.letterSpacing = "1px";
  labelEl.style.color = "#64748b";
  labelEl.style.marginBottom = "4px";
  container.appendChild(labelEl);

  const valueEl = document.createElement("div");
  valueEl.textContent = initialValue;
  valueEl.style.fontSize = "1.15rem";
  valueEl.style.fontWeight = "700";
  valueEl.style.color = color || "#0f172a";
  container.appendChild(valueEl);

  return {
    container,
    setValue: (v) => { valueEl.textContent = v; }
  };
}
