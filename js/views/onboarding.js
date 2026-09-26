// Onboarding: first-time setup of the study plan.
import { getState, setState, updatePlan, setCalendar } from "../state.js";
import { generateCalendar, estimateCalendarSummary, calculateTotalGoalHours, getStudyDaysBetween } from "../core/planner.js";
import { navigate } from "../router.js";

export function renderOnboarding(view) {
  // Hide sidebar
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  view.innerHTML = "";

  const hero = document.createElement("div");
  hero.style.background = "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
  hero.style.color = "#fff";
  hero.style.padding = "24px";
  hero.style.borderRadius = "12px";
  hero.style.marginBottom = "24px";

  const h1 = document.createElement("h1");
  h1.textContent = "Welcome to ComuEnglish";
  h1.style.fontSize = "1.5rem";
  h1.style.marginBottom = "6px";
  hero.appendChild(h1);

  const p = document.createElement("p");
  p.textContent = "Let us create your personal study plan.";
  p.style.opacity = ".95";
  hero.appendChild(p);

  view.appendChild(hero);

  // Form container
  const form = document.createElement("div");
  form.style.maxWidth = "600px";

  // 1. Level
  const levelLabel = document.createElement("label");
  levelLabel.innerHTML = "<strong>1. Which level are you preparing?</strong>";
  levelLabel.style.display = "block";
  levelLabel.style.marginBottom = "8px";
  levelLabel.style.marginTop = "20px";
  form.appendChild(levelLabel);

  const levelSelect = document.createElement("select");
  levelSelect.style.padding = "8px";
  levelSelect.style.borderRadius = "8px";
  levelSelect.style.border = "1px solid #e2e8f0";
  levelSelect.style.fontSize = ".95rem";
  levelSelect.style.width = "200px";
  [["a2", "A2 Key"], ["b1", "B1 Preliminary"], ["b2", "B2 First"]].forEach(([val, txt]) => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = txt;
    if (val === getState().level) opt.selected = true;
    levelSelect.appendChild(opt);
  });
  form.appendChild(levelSelect);

  // 2. Exam date
  const dateLabel = document.createElement("label");
  dateLabel.innerHTML = "<strong>2. When is your exam?</strong>";
  dateLabel.style.display = "block";
  dateLabel.style.marginBottom = "8px";
  dateLabel.style.marginTop = "20px";
  form.appendChild(dateLabel);

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.style.padding = "8px";
  dateInput.style.borderRadius = "8px";
  dateInput.style.border = "1px solid #e2e8f0";
  dateInput.style.fontSize = ".95rem";
  // Default: 6 months from now
  const sixMonths = new Date();
  sixMonths.setMonth(sixMonths.getMonth() + 6);
  dateInput.value = sixMonths.toISOString().slice(0, 10);
  form.appendChild(dateInput);

  // 3. Mensaje informativo (la app calcula los minutos)
  const minLabel = document.createElement("label");
  minLabel.innerHTML = "<strong>3. Daily time</strong>";
  minLabel.style.display = "block";
  minLabel.style.marginBottom = "8px";
  minLabel.style.marginTop = "20px";
  form.appendChild(minLabel);

  const minInfo = document.createElement("div");
  minInfo.style.padding = "12px";
  minInfo.style.background = "#eff6ff";
  minInfo.style.borderRadius = "8px";
  minInfo.style.fontSize = ".9rem";
  minInfo.style.lineHeight = "1.5";
  minInfo.textContent = "The app will calculate how many minutes per day you need, based on the content and your available days.";
  form.appendChild(minInfo);

  // 4. Days per week
  const daysLabel = document.createElement("label");
  daysLabel.innerHTML = "<strong>4. How many days per week?</strong>";
  daysLabel.style.display = "block";
  daysLabel.style.marginBottom = "8px";
  daysLabel.style.marginTop = "20px";
  form.appendChild(daysLabel);

  const daysSelect = document.createElement("select");
  daysSelect.style.padding = "8px";
  daysSelect.style.borderRadius = "8px";
  daysSelect.style.border = "1px solid #e2e8f0";
  daysSelect.style.fontSize = ".95rem";
  daysSelect.style.width = "200px";
  [3, 4, 5, 6, 7].forEach(val => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val + " days";
    if (val === 5) opt.selected = true;
    daysSelect.appendChild(opt);
  });
  form.appendChild(daysSelect);

  // Preview of plan (calculated live)
  const preview = document.createElement("div");
  preview.className = "feedback feedback--info";
  preview.style.marginTop = "24px";
  preview.style.lineHeight = "1.7";
  form.appendChild(preview);

  function updatePreview() {
    const level = levelSelect.value;
    const daysPerWeek = parseInt(daysSelect.value);
    const examDate = dateInput.value;

    if (!examDate) {
      preview.innerHTML = "Select an exam date to see your plan.";
      return;
    }

    // Calcular dias de estudio disponibles
    const days = getStudyDaysBetween(new Date(), new Date(examDate), daysPerWeek);
    const totalDays = days.length;

    if (totalDays === 0) {
      preview.innerHTML = "⚠️ <span style='color:#dc2626'>Invalid exam date. Choose a future date.</span>";
      return;
    }

    // Calcular horas necesarias (3 vueltas)
    const baseHours = calculateTotalGoalHours(level); // ya incluye multiplicador x3
    const totalHours = baseHours;
    const totalMinutes = totalHours * 60;
    const minutesPerDay = Math.ceil(totalMinutes / totalDays);

    // Formatear tiempo
    function formatMin(m) {
      if (m < 60) return m + " min";
      const h = Math.floor(m / 60);
      const mm = m % 60;
      return h + "h" + (mm > 0 ? " " + mm + "min" : "");
    }

    const feasible = minutesPerDay <= 120;

    preview.innerHTML =
      "<strong>📊 YOUR PLAN</strong><br>" +
      "Level: <strong>" + level.toUpperCase() + "</strong><br>" +
      "Study days available: <strong>" + totalDays + "</strong> (until exam)<br>" +
      "Total content: <strong>" + totalHours + " hours</strong> (3 passes)<br><br>" +
      "🎯 <strong>You need to study " + formatMin(minutesPerDay) + " per day</strong><br><br>" +
      (feasible
        ? "✅ <span style='color:#16a34a'>This pace is realistic.</span>"
        : "⚠️ <span style='color:#dc2626'>This pace is too demanding. Consider reducing days/week or extending exam date.</span>");
  }

  levelSelect.addEventListener("change", updatePreview);
  dateInput.addEventListener("change", updatePreview);
  daysSelect.addEventListener("change", updatePreview);
  updatePreview();

  // Buttons
  const btnRow = document.createElement("div");
  btnRow.style.marginTop = "24px";
  btnRow.style.display = "flex";
  btnRow.style.gap = "12px";

  const startBtn = document.createElement("button");
  startBtn.className = "btn btn--primary";
  startBtn.textContent = "Create my plan";
  startBtn.style.padding = "12px 28px";
  startBtn.style.fontSize = "1rem";
  startBtn.style.fontWeight = "bold";
  startBtn.addEventListener("click", async () => {
    // Calcular minutos diarios automaticamente
    const daysPerWeek = parseInt(daysSelect.value);
    const examDate = dateInput.value;
    const days = getStudyDaysBetween(new Date(), new Date(examDate), daysPerWeek);
    const baseHours = calculateTotalGoalHours(levelSelect.value);
    const minutesPerDay = Math.max(15, Math.ceil((baseHours * 60) / days.length));

    const plan = {
      enabled: true,
      examDate: examDate,
      dailyMinutes: minutesPerDay,
      daysPerWeek: daysPerWeek,
      startDate: new Date().toISOString().slice(0, 10),
      targetLevel: levelSelect.value
    };

    setState({ level: levelSelect.value });
    updatePlan(plan);

    // Mostrar mensaje de carga
    startBtn.disabled = true;
    startBtn.textContent = "Generating your calendar...";

    try {
      // Generar el calendario completo
      const calendar = await generateCalendar(
        levelSelect.value,
        dateInput.value,
        minutesPerDay,
        parseInt(daysSelect.value)
      );

      setCalendar(calendar);

      const summary = estimateCalendarSummary(calendar);
      console.log("Calendar generated:", summary);

      // Redirect to Today view
      navigate("today");
    } catch (err) {
      console.error("Error generating calendar:", err);
      alert("Error generating calendar: " + err.message);
      startBtn.disabled = false;
      startBtn.textContent = "Create my plan";
    }
  });
  btnRow.appendChild(startBtn);

  const skipBtn = document.createElement("button");
  skipBtn.className = "btn btn--ghost";
  skipBtn.textContent = "Skip for now";
  skipBtn.style.padding = "12px 24px";
  skipBtn.addEventListener("click", () => {
    navigate("home");
  });
  btnRow.appendChild(skipBtn);

  form.appendChild(btnRow);
  view.appendChild(form);
}
