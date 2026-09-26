// Production module view. Writing + Speaking.
import { getState } from "../state.js";
import { renderRecorder } from "../widgets/recorder.js";
import { renderSpeechAnalyzer } from "../widgets/speech-analyzer.js";
import { callDeepSeek } from "../services/deepseek.js";

export async function renderProduction(view) {
  const { level } = getState();
  view.innerHTML = "";
  const h2 = document.createElement("h2");
  h2.textContent = "Module 3 - Production (" + level.toUpperCase() + ")";
  view.appendChild(h2);

  const tabs = document.createElement("div");
  tabs.className = "phase-nav";

  const writingBtn = document.createElement("button");
  writingBtn.textContent = "Writing";
  writingBtn.classList.add("is-active");

  const speakingBtn = document.createElement("button");
  speakingBtn.textContent = "Speaking";

  tabs.appendChild(writingBtn);
  tabs.appendChild(speakingBtn);
  view.appendChild(tabs);

  const content = document.createElement("div");
  view.appendChild(content);

  writingBtn.addEventListener("click", () => {
    writingBtn.classList.add("is-active");
    speakingBtn.classList.remove("is-active");
    renderWritingList(content);
  });

  speakingBtn.addEventListener("click", () => {
    speakingBtn.classList.add("is-active");
    writingBtn.classList.remove("is-active");
    renderSpeakingList(content);
  });

  renderWritingList(content);
}

async function renderWritingList(container) {
  const { level } = getState();
  container.innerHTML = "";
  const loading = document.createElement("p");
  loading.textContent = "Loading tasks...";
  container.appendChild(loading);

  try {
    const res = await fetch("data/" + level + "/writing.json");
    if (!res.ok) throw new Error("Could not load writing.json");
    const data = await res.json();
    const tasks = data.tasks || [];
    container.removeChild(loading);

    const list = document.createElement("div");
    list.className = "unit-list";

    tasks.forEach(t => {
      const card = document.createElement("div");
      card.className = "unit-card";
      const header = document.createElement("div");
      header.className = "unit-card__header";
      const title = document.createElement("span");
      title.className = "unit-card__title";
      title.textContent = t.title;
      header.appendChild(title);
      const badge = document.createElement("span");
      badge.className = "unit-card__badge";
      badge.textContent = t.minWords + "+ words";
      header.appendChild(badge);
      card.appendChild(header);
      const sub = document.createElement("small");
      sub.textContent = t.type;
      card.appendChild(sub);
      card.addEventListener("click", () => openWritingTask(container, t));
      list.appendChild(card);
    });
    container.appendChild(list);
  } catch (err) {
    loading.textContent = "Error loading tasks: " + err.message;
    loading.className = "feedback feedback--wrong";
  }
}

async function renderSpeakingList(container) {
  const { level } = getState();
  container.innerHTML = "";
  const loading = document.createElement("p");
  loading.textContent = "Loading prompts...";
  container.appendChild(loading);

  try {
    const res = await fetch("data/" + level + "/speaking.json");
    if (!res.ok) throw new Error("Could not load speaking.json");
    const data = await res.json();
    const prompts = data.prompts || [];
    container.removeChild(loading);

    const list = document.createElement("div");
    list.className = "unit-list";

    prompts.forEach(p => {
      const card = document.createElement("div");
      card.className = "unit-card";
      const header = document.createElement("div");
      header.className = "unit-card__header";
      const title = document.createElement("span");
      title.className = "unit-card__title";
      title.textContent = p.title;
      header.appendChild(title);
      const badge = document.createElement("span");
      badge.className = "unit-card__badge";
      badge.textContent = p.seconds + "s";
      header.appendChild(badge);
      card.appendChild(header);
      const sub = document.createElement("small");
      sub.textContent = p.part;
      card.appendChild(sub);
      card.addEventListener("click", () => openSpeakingPrompt(container, p));
      list.appendChild(card);
    });
    container.appendChild(list);
  } catch (err) {
    loading.textContent = "Error loading prompts: " + err.message;
    loading.className = "feedback feedback--wrong";
  }
}

function openWritingTask(container, task) {
  const { level } = getState();
  container.innerHTML = "";
  const back = document.createElement("button");
  back.className = "btn btn--ghost";
  back.textContent = "Back";
  back.addEventListener("click", () => renderWritingList(container));
  container.appendChild(back);

  const h2 = document.createElement("h2");
  h2.textContent = task.title;
  container.appendChild(h2);

  const instr = document.createElement("div");
  instr.className = "feedback feedback--info";
  instr.textContent = task.prompt;
  container.appendChild(instr);

  if (task.notes) {
    const notesBox = document.createElement("div");
    notesBox.style.marginTop = "12px";
    notesBox.style.padding = "12px";
    notesBox.style.background = "#f8fafc";
    notesBox.style.borderRadius = "8px";
    notesBox.innerHTML = "<strong>You must include:</strong><ul>" + task.notes.map(n => "<li>" + n + "</li>").join("") + "</ul>";
    container.appendChild(notesBox);
  }

  const ta = document.createElement("textarea");
  ta.rows = 10;
  ta.placeholder = "Write your answer here (minimum " + task.minWords + " words)...";
  ta.style.width = "100%";
  ta.style.marginTop = "16px";
  ta.style.padding = "12px";
  ta.style.border = "1px solid var(--border)";
  ta.style.borderRadius = "10px";
  ta.style.font = "inherit";
  container.appendChild(ta);

  const wordCount = document.createElement("p");
  wordCount.style.fontSize = ".9rem";
  wordCount.style.color = "#64748b";
  wordCount.textContent = "0 words";
  container.appendChild(wordCount);

  ta.addEventListener("input", () => {
    const words = ta.value.trim().split(/\\s+/).filter(w => w.length > 0).length;
    wordCount.textContent = words + " words";
    wordCount.style.color = words >= task.minWords ? "#16a34a" : "#64748b";
  });

  const btnRow = document.createElement("div");
  btnRow.style.marginTop = "12px";
  btnRow.style.display = "flex";
  btnRow.style.gap = "8px";

  const evalBtn = document.createElement("button");
  evalBtn.className = "btn btn--primary";
  evalBtn.textContent = "Evaluate with DeepSeek";
  btnRow.appendChild(evalBtn);

  const sampleBtn = document.createElement("button");
  sampleBtn.className = "btn btn--ghost";
  sampleBtn.textContent = "Show sample answer";
  btnRow.appendChild(sampleBtn);
  container.appendChild(btnRow);

  const feedbackBox = document.createElement("div");
  container.appendChild(feedbackBox);

  sampleBtn.addEventListener("click", () => {
    if (feedbackBox.querySelector(".sample-shown")) return;
    const fb = document.createElement("div");
    fb.className = "feedback feedback--info sample-shown";
    fb.style.marginTop = "12px";
    fb.innerHTML = "<strong>Sample answer:</strong><br>" + task.sample;
    feedbackBox.appendChild(fb);
  });

  evalBtn.addEventListener("click", async () => {
    const text = ta.value.trim();
    if (text.length < 20) {
      alert("Write at least 20 characters before evaluating.");
      return;
    }
    feedbackBox.innerHTML = "";
    const loading = document.createElement("div");
    loading.className = "feedback feedback--info";
    loading.textContent = "Evaluating...";
    feedbackBox.appendChild(loading);

    try {
      const sysPrompt = "You are a Cambridge English examiner. Evaluate the essay according to the official Cambridge rubric. Reply ONLY with valid JSON: { scores: { content: number, communicative_achievement: number, organisation: number, language: number }, overall: number, strengths: [string], improvements: [string], feedback_es: string }. Scores 0-5 each. Overall 0-20.";
      const userPrompt = "Level: " + level.toUpperCase() + "\\nTask: " + task.prompt + "\\nStudent answer: " + text;
      const raw = await callDeepSeek([
        { role: "system", content: sysPrompt },
        { role: "user", content: userPrompt }
      ], { jsonMode: true, maxTokens: 1500, temperature: 0.3 });

      const parsed = JSON.parse(raw);
      feedbackBox.innerHTML = "";
      const fb = document.createElement("div");
      fb.className = "feedback feedback--info";
      fb.innerHTML = "<h4>Score: " + parsed.overall + "/20</h4>" +
        "<p><strong>Content:</strong> " + (parsed.scores.content || 0) + "/5</p>" +
        "<p><strong>Communicative Achievement:</strong> " + (parsed.scores.communicative_achievement || 0) + "/5</p>" +
        "<p><strong>Organisation:</strong> " + (parsed.scores.organisation || 0) + "/5</p>" +
        "<p><strong>Language:</strong> " + (parsed.scores.language || 0) + "/5</p>" +
        "<p><strong>Strengths:</strong> " + (parsed.strengths || []).join(", ") + "</p>" +
        "<p><strong>Improvements:</strong> " + (parsed.improvements || []).join(", ") + "</p>" +
        "<p><em>" + (parsed.feedback_es || "") + "</em></p>";
      feedbackBox.appendChild(fb);
    } catch (err) {
      feedbackBox.innerHTML = "";
      const fb = document.createElement("div");
      fb.className = "feedback feedback--wrong";
      fb.textContent = "Error: " + err.message;
      feedbackBox.appendChild(fb);
    }
  });
}

function openSpeakingPrompt(container, prompt) {
  container.innerHTML = "";
  const back = document.createElement("button");
  back.className = "btn btn--ghost";
  back.textContent = "Back";
  back.addEventListener("click", () => renderSpeakingList(container));
  container.appendChild(back);

  const h2 = document.createElement("h2");
  h2.textContent = prompt.title;
  container.appendChild(h2);

  const partInfo = document.createElement("p");
  partInfo.style.fontSize = ".9rem";
  partInfo.style.color = "#64748b";
  partInfo.textContent = "Part: " + prompt.part + " - " + prompt.seconds + " seconds";
  container.appendChild(partInfo);

  const instr = document.createElement("div");
  instr.className = "feedback feedback--info";
  instr.textContent = prompt.prompt;
  container.appendChild(instr);

  if (prompt.tips && prompt.tips.length > 0) {
    const tipsBox = document.createElement("div");
    tipsBox.style.marginTop = "12px";
    tipsBox.style.padding = "12px";
    tipsBox.style.background = "#f8fafc";
    tipsBox.style.borderRadius = "8px";
    tipsBox.innerHTML = "<strong>Tips:</strong><ul>" + prompt.tips.map(t => "<li>" + t + "</li>").join("") + "</ul>";
    container.appendChild(tipsBox);
  }

  const recorderBox = document.createElement("div");
  recorderBox.style.marginTop = "20px";
  container.appendChild(recorderBox);

  renderSpeechAnalyzer(recorderBox, {
    prompt: prompt.prompt,
    seconds: prompt.seconds,
    level: getState().level
  });

  const sampleBtn = document.createElement("button");
  sampleBtn.className = "btn btn--ghost";
  sampleBtn.textContent = "Show sample answer";
  sampleBtn.style.marginTop = "16px";
  container.appendChild(sampleBtn);

  const sampleBox = document.createElement("div");
  container.appendChild(sampleBox);

  sampleBtn.addEventListener("click", () => {
    if (sampleBox.querySelector(".sample-shown")) return;
    const fb = document.createElement("div");
    fb.className = "feedback feedback--info sample-shown";
    fb.style.marginTop = "12px";
    fb.innerHTML = "<strong>Sample answer:</strong><br>" + prompt.sample;
    sampleBox.appendChild(fb);
  });
}
