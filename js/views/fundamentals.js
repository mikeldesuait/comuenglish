// Fundamentals module view. Reads units from data/{level}/units.json.
import { getState, setState } from "../state.js";
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
    container.className = "unit-list";

    unitsCache[level].forEach(u => {
      const card = document.createElement("div");
      card.className = "unit-card";
      card.dataset.unit = u.id;

      const header = document.createElement("div");
      header.className = "unit-card__header";

      const title = document.createElement("span");
      title.className = "unit-card__title";
      title.textContent = u.title;
      header.appendChild(title);

      const badge = document.createElement("span");
      badge.className = "unit-card__badge";
      badge.textContent = u.phases + " phases";
      header.appendChild(badge);

      card.appendChild(header);

      const sub = document.createElement("small");
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
  back.className = "btn btn--ghost";
  back.textContent = "Back";
  back.addEventListener("click", () => renderFundamentals(view));
  view.appendChild(back);

  const h2 = document.createElement("h2");
  h2.textContent = unit.title;
  view.appendChild(h2);

  const loading = document.createElement("p");
  loading.textContent = "Loading lesson...";
  view.appendChild(loading);

  try {
    const { level } = getState();
    const res = await fetch("data/" + level + "/" + unit.file);
    if (!res.ok) throw new Error("Could not load " + unit.file);
    const lesson = await res.json();

    view.removeChild(loading);

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
  } catch (err) {
    loading.textContent = "Error: " + err.message;
    loading.className = "feedback feedback--wrong";
  }
}

function renderPhaseContent(container, phase) {
  container.innerHTML = "";

  if (phase.type === "exercise") {
    renderExercise(container, {
      prompt: phase.prompt,
      options: phase.options,
      correct: phase.correct,
      explanation: phase.explanation
    });
  } else if (phase.type === "text") {
    const fb = document.createElement("div");
    fb.className = "feedback feedback--info";
    fb.textContent = phase.content;
    container.appendChild(fb);
  } else if (phase.type === "task") {
    const fb = document.createElement("div");
    fb.className = "feedback feedback--info";
    fb.textContent = phase.prompt;
    container.appendChild(fb);

    const ta = document.createElement("textarea");
    ta.rows = 5;
    ta.style.width = "100%";
    ta.style.marginTop = "12px";
    ta.style.padding = "12px";
    ta.style.border = "1px solid var(--border)";
    ta.style.borderRadius = "10px";
    ta.style.font = "inherit";
    ta.placeholder = "Write your answer here...";
    container.appendChild(ta);
  }
}
