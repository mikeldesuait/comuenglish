// Onboarding: first-time setup of the study plan.
import { getState, setState, updatePlan } from "../state.js";
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

  // 3. Daily minutes
  const minLabel = document.createElement("label");
  minLabel.innerHTML = "<strong>3. How much time can you study per day?</strong>";
  minLabel.style.display = "block";
  minLabel.style.marginBottom = "8px";
  minLabel.style.marginTop = "20px";
  form.appendChild(minLabel);

  const minSelect = document.createElement("select");
  minSelect.style.padding = "8px";
  minSelect.style.borderRadius = "8px";
  minSelect.style.border = "1px solid #e2e8f0";
  minSelect.style.fontSize = ".95rem";
  minSelect.style.width = "200px";
  [[15, "15 minutes"], [30, "30 minutes"], [60, "1 hour"], [90, "1.5 hours"], [120, "2 hours"]].forEach(([val, txt]) => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = txt;
    if (val === 30) opt.selected = true;
    minSelect.appendChild(opt);
  });
  form.appendChild(minSelect);

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
    const daysUntil = Math.ceil((new Date(dateInput.value) - new Date()) / (1000 * 60 * 60 * 24));
    const level = levelSelect.value;
    const minutes = parseInt(minSelect.value);

    const contentMap = {
      a2: { items: 300, label: "A2 Key" },
      b1: { items: 200, label: "B1 Preliminary" },
      b2: { items: 200, label: "B2 First" }
    };
    const content = contentMap[level] || contentMap.a2;
    const itemsPerDay = Math.max(2, Math.floor(minutes / 10));
    const totalDays = Math.ceil(content.items / itemsPerDay);
    const feasible = totalDays <= daysUntil;

    preview.innerHTML =
      "<strong>Preview:</strong><br>" +
      "Days until exam: <strong>" + daysUntil + "</strong><br>" +
      "Items per day: <strong>" + itemsPerDay + "</strong><br>" +
      "Total study days needed: <strong>" + totalDays + "</strong><br>" +
      (feasible
        ? "✅ <span style='color:#16a34a'>Feasible! You will have enough time.</span>"
        : "⚠️ <span style='color:#dc2626'>Not enough time. Increase daily minutes.</span>");
  }

  levelSelect.addEventListener("change", updatePreview);
  dateInput.addEventListener("change", updatePreview);
  minSelect.addEventListener("change", updatePreview);
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
  startBtn.addEventListener("click", () => {
    const plan = {
      enabled: true,
      examDate: dateInput.value,
      dailyMinutes: parseInt(minSelect.value),
      daysPerWeek: parseInt(daysSelect.value),
      startDate: new Date().toISOString().slice(0, 10),
      targetLevel: levelSelect.value
    };

    setState({ level: levelSelect.value });
    updatePlan(plan);

    // Redirect to Today view
    navigate("today");
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
