// Fundamentals module view. Reads units from data/{level}/units.json.
import { getState, setState, markUnit, getProgress, markCalendarTaskCompleted, logDailyTask, getCalendar } from "../state.js";
import { showTimeTrackerModal } from "../widgets/time-tracker.js";
import { renderExercise } from "../widgets/exercise.js";

let unitsCache = {};

export async function renderFundamentals(view) {
  const { level } = getState();

  view.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Module 1 - Fundamentals (" + level.toUpperCase() + ")";
  view.appendChild(h2);

  const loading = document.createElement("p");
  loading.textContent = "Loading units...";
  view.appendChild(loading);

  try {
    const res = await fetch("data/" + level + "/units.json");
    if (!res.ok) throw new Error("Could not load units.json");
    const data = await res.json();
    unitsCache[level] = data.units || [];

    view.removeChild(loading);

    const container = document.createElement("div");
    container.className = "card-grid";

    unitsCache[level].forEach(u => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.unit = u.id;

      const title = document.createElement("div");
      title.className = "card__title";
      title.textContent = u.title;
      card.appendChild(title);

      const badge = document.createElement("span");
      badge.className = "card__badge";
      badge.textContent = u.phases + " phases";
      card.appendChild(badge);

      const sub = document.createElement("small");
      sub.className = "card__subtitle";
      sub.textContent = "Grammar + Vocabulary";
      card.appendChild(sub);

      card.addEventListener("click", () => openUnit(view, u));
      container.appendChild(card);
    });

    view.appendChild(container);
  } catch (err) {
    loading.textContent = "Error loading units: " + err.message;
    loading.className = "feedback feedback--wrong";
  }
}

async function openUnit(view, unit) {
  setState({ currentUnit: unit });

  view.innerHTML = "";

  const back = document.createElement("button");
  back.className = "btn-back";
  back.textContent = "← Back to units";
  back.addEventListener("click", () => renderFundamentals(view));
  view.appendChild(back);

  const loading = document.createElement("p");
  loading.textContent = "Loading lesson...";
  view.appendChild(loading);

  try {
    const { level } = getState();
    const res = await fetch("data/" + level + "/" + unit.file);
    if (!res.ok) throw new Error("Could not load " + unit.file);
    const lesson = await res.json();

    view.removeChild(loading);

    // Unit header
    const header = document.createElement("div");
    header.className = "unit-header";

    const label = document.createElement("div");
    label.className = "unit-header__label";
    label.textContent = level.toUpperCase() + " Key - Unit " + unit.id.split("-u")[1];
    header.appendChild(label);

    const title = document.createElement("h1");
    title.className = "unit-header__title";
    title.textContent = lesson.title;
    header.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "unit-header__meta";
    meta.textContent = "📖 " + (lesson.grammar || "") + " · 📝 " + (lesson.vocabulary || "");
    header.appendChild(meta);

    view.appendChild(header);

    // Phase nav
    const nav = document.createElement("div");
    nav.className = "phase-nav";
    const content = document.createElement("div");

    lesson.phases.forEach((p, i) => {
      const btn = document.createElement("button");
      btn.textContent = (i + 1) + ". " + p.name;
      if (i === 0) btn.classList.add("is-active");
      btn.addEventListener("click", () => {
        nav.querySelectorAll("button").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        renderPhaseContent(content, p);
      });
      nav.appendChild(btn);
    });

    view.appendChild(nav);
    view.appendChild(content);

    renderPhaseContent(content, lesson.phases[0]);

    // Boton para marcar la unidad como completada
    const isCompleted = isUnitCompleted(unit.id);
    const markBtn = document.createElement("button");
    markBtn.className = isCompleted ? "btn btn--ghost" : "btn btn--primary";
    markBtn.textContent = isCompleted ? "✅ Unit completed" : "Mark unit as completed";
    markBtn.style.marginTop = "24px";
    markBtn.style.padding = "12px 24px";
    markBtn.style.fontSize = "1rem";
    markBtn.style.fontWeight = "bold";
    markBtn.disabled = isCompleted;

    if (!isCompleted) {
      markBtn.addEventListener("click", () => {
        showTimeTrackerModal({
          itemId: unit.id,
          itemType: "fundamentals",
          itemLabel: unit.title,
          onComplete: (minutes) => {
            markUnitCompleted(unit.id);
            markBtn.textContent = "✅ Unit completed (" + minutes + " min)";
            markBtn.className = "btn btn--ghost";
            markBtn.disabled = true;
          }
        });
      });
    }

    view.appendChild(markBtn);
  } catch (err) {
    loading.textContent = "Error: " + err.message;
    loading.className = "feedback feedback--wrong";
  }
}


function markUnitCompleted(unitId) {
  const { level } = getState();
  markUnit(level, unitId, { completed: true, date: Date.now() });

  // Actualizar el calendario del dia de hoy
  const today = new Date().toISOString().slice(0, 10);
  const calendar = getCalendar();
  if (calendar[today]) {
    markCalendarTaskCompleted(today, unitId);
    logDailyTask(today, unitId, true);
  }

  console.log("Unit marked as completed:", unitId);
}

function isUnitCompleted(unitId) {
  const { level } = getState();
  const progress = getProgress(level);
  return progress.units && progress.units[unitId] && progress.units[unitId].completed;
}

function renderPhaseContent(container, phase) {
  container.innerHTML = "";

  if (phase.type === "exercise") {
    const questions = phase.questions || (phase.prompt ? [phase] : []);
    questions.forEach(q => {
      renderExercise(container, {
        prompt: q.prompt,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation
      });
    });
  } else if (phase.type === "theory" || phase.type === "vocab" || phase.type === "text") {
    if (phase.sections && Array.isArray(phase.sections)) {
      phase.sections.forEach(section => {
        renderSection(container, section);
      });
    } else {
      const fb = document.createElement("div");
      fb.className = "feedback feedback--info";
      fb.style.whiteSpace = "pre-wrap";
      fb.style.lineHeight = "1.7";
      fb.textContent = phase.content || "";
      container.appendChild(fb);
    }
  } else if (phase.type === "discovery") {
    if (phase.intro) {
      const p = document.createElement("p");
      p.style.lineHeight = "1.7";
      p.style.marginBottom = "16px";
      p.textContent = phase.intro;
      container.appendChild(p);
    }
    if (phase.sentences && Array.isArray(phase.sentences)) {
      const h = document.createElement("h3");
      h.textContent = "Look at these sentences";
      h.style.marginTop = "12px";
      h.style.marginBottom = "8px";
      container.appendChild(h);

      const ol = document.createElement("ol");
      ol.style.marginLeft = "20px";
      ol.style.marginBottom = "20px";
      ol.style.lineHeight = "1.7";
      phase.sentences.forEach(s => {
        const li = document.createElement("li");
        li.style.marginBottom = "4px";
        li.textContent = s;
        ol.appendChild(li);
      });
      container.appendChild(ol);
    }
    if (phase.questions && Array.isArray(phase.questions)) {
      const h = document.createElement("h3");
      h.textContent = "Guiding questions";
      h.style.marginTop = "12px";
      h.style.marginBottom = "8px";
      container.appendChild(h);

      phase.questions.forEach(q => {
        const fb = document.createElement("div");
        fb.className = "feedback feedback--info";
        fb.style.marginBottom = "8px";
        fb.textContent = q;
        container.appendChild(fb);
      });
    }
    if (phase.content) {
      const fb = document.createElement("div");
      fb.className = "feedback feedback--info";
      fb.style.whiteSpace = "pre-wrap";
      fb.style.lineHeight = "1.7";
      fb.textContent = phase.content;
      container.appendChild(fb);
    }
  } else if (phase.type === "task") {
    const prompts = phase.prompts || (phase.prompt ? [phase.prompt] : []);
    prompts.forEach((p, i) => {
      const fb = document.createElement("div");
      fb.className = "feedback feedback--info";
      fb.style.marginBottom = "12px";
      fb.innerHTML = "<strong>Task " + (i + 1) + ":</strong> " + p;
      container.appendChild(fb);

      const ta = document.createElement("textarea");
      ta.rows = 4;
      ta.style.width = "100%";
      ta.style.marginTop = "8px";
      ta.style.marginBottom = "20px";
      ta.style.padding = "12px";
      ta.style.border = "1px solid var(--border)";
      ta.style.borderRadius = "10px";
      ta.style.font = "inherit";
      ta.placeholder = "Write your answer here...";
      container.appendChild(ta);
    });
  }
}


function renderSection(container, section) {
  if (section.heading) {
    const h = document.createElement("h3");
    h.textContent = section.heading;
    h.style.marginTop = "20px";
    h.style.marginBottom = "8px";
    h.style.color = "#1e293b";
    container.appendChild(h);
  }

  if (section.body) {
    const p = document.createElement("p");
    p.style.lineHeight = "1.7";
    p.style.marginBottom = "12px";
    p.style.whiteSpace = "pre-wrap";
    p.textContent = section.body;
    container.appendChild(p);
  }

  if (section.list && Array.isArray(section.list)) {
    const ul = document.createElement("ul");
    ul.style.marginLeft = "20px";
    ul.style.marginBottom = "12px";
    ul.style.lineHeight = "1.7";
    section.list.forEach(item => {
      const li = document.createElement("li");
      li.style.marginBottom = "4px";
      if (typeof item === "string") {
        li.textContent = item;
      } else if (item.term && item.definition) {
        li.innerHTML = "<strong>" + item.term + "</strong> - " + item.definition;
      } else {
        li.textContent = JSON.stringify(item);
      }
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  if (section.table && Array.isArray(section.table)) {
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "16px";
    table.style.width = "100%";
    table.style.maxWidth = "500px";
    section.table.forEach((row, rowIdx) => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement(rowIdx === 0 && section.tableHeader ? "th" : "td");
        td.textContent = cell;
        td.style.border = "1px solid #cbd5e1";
        td.style.padding = "8px 12px";
        td.style.textAlign = "left";
        if (rowIdx === 0 && section.tableHeader) {
          td.style.background = "#f1f5f9";
          td.style.fontWeight = "bold";
        }
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    container.appendChild(table);
  }

  if (section.note) {
    const note = document.createElement("div");
    note.className = "feedback feedback--info";
    note.style.marginTop = "12px";
    note.style.marginBottom = "12px";
    note.textContent = section.note;
    container.appendChild(note);
  }
}
