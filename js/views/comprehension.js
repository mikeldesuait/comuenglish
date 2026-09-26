// Comprehension module view. Reading + Listening.
import { getState } from "../state.js";
import { renderExercise } from "../widgets/exercise.js";

// Shuffle array in place
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function renderComprehension(view) {
  const { level } = getState();

  view.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Module 2 - Comprehension (" + level.toUpperCase() + ")";
  view.appendChild(h2);

  const tabs = document.createElement("div");
  tabs.className = "phase-nav";

  const readingBtn = document.createElement("button");
  readingBtn.textContent = "Reading";
  readingBtn.classList.add("is-active");

  const listeningBtn = document.createElement("button");
  listeningBtn.textContent = "Listening";

  tabs.appendChild(readingBtn);
  tabs.appendChild(listeningBtn);
  view.appendChild(tabs);

  const content = document.createElement("div");
  view.appendChild(content);

  readingBtn.addEventListener("click", () => {
    readingBtn.classList.add("is-active");
    listeningBtn.classList.remove("is-active");
    renderReadingList(content);
  });

  listeningBtn.addEventListener("click", () => {
    listeningBtn.classList.add("is-active");
    readingBtn.classList.remove("is-active");
    renderListeningList(content);
  });

  renderReadingList(content);
}

async function renderReadingList(container) {
  const { level } = getState();
  container.innerHTML = "";

  const loading = document.createElement("p");
  loading.textContent = "Loading texts...";
  container.appendChild(loading);

  try {
    const res = await fetch("data/" + level + "/reading.json");
    if (!res.ok) throw new Error("Could not load reading.json");
    const data = await res.json();
    const texts = data.texts || [];

    container.removeChild(loading);

    const list = document.createElement("div");
    list.className = "unit-list";

    texts.forEach(t => {
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
      badge.textContent = t.questions.length + " questions";
      header.appendChild(badge);

      card.appendChild(header);

      const sub = document.createElement("small");
      sub.textContent = t.type;
      card.appendChild(sub);

      card.addEventListener("click", () => openText(container, t));
      list.appendChild(card);
    });

    container.appendChild(list);
  } catch (err) {
    loading.textContent = "Error loading reading: " + err.message;
    loading.className = "feedback feedback--wrong";
  }
}

async function renderListeningList(container) {
  const { level } = getState();
  container.innerHTML = "";

  const loading = document.createElement("p");
  loading.textContent = "Loading audios...";
  container.appendChild(loading);

  try {
    const res = await fetch("data/" + level + "/listening.json");
    if (!res.ok) throw new Error("Could not load listening.json");
    const data = await res.json();
    const audios = data.audios || [];

    container.removeChild(loading);

    const list = document.createElement("div");
    list.className = "unit-list";

    audios.forEach(a => {
      const card = document.createElement("div");
      card.className = "unit-card";

      const header = document.createElement("div");
      header.className = "unit-card__header";

      const title = document.createElement("span");
      title.className = "unit-card__title";
      title.textContent = a.title;
      header.appendChild(title);

      const badge = document.createElement("span");
      badge.className = "unit-card__badge";
      badge.textContent = a.questions.length + " questions";
      header.appendChild(badge);

      card.appendChild(header);

      const sub = document.createElement("small");
      sub.textContent = "Audio exercise";
      card.appendChild(sub);

      card.addEventListener("click", () => openAudio(container, a));
      list.appendChild(card);
    });

    container.appendChild(list);
  } catch (err) {
    loading.textContent = "Error loading listening: " + err.message;
    loading.className = "feedback feedback--wrong";
  }
}

function openText(container, text) {
  container.innerHTML = "";

  const back = document.createElement("button");
  back.className = "btn btn--ghost";
  back.textContent = "Back";
  back.addEventListener("click", () => renderReadingList(container));
  container.appendChild(back);

  const h2 = document.createElement("h2");
  h2.textContent = text.title;
  container.appendChild(h2);

  const instr = document.createElement("div");
  instr.className = "feedback feedback--info";
  instr.textContent = text.instructions;
  container.appendChild(instr);

  if (text.text) {
    const body = document.createElement("div");
    body.style.padding = "16px";
    body.style.margin = "16px 0";
    body.style.background = "#f8fafc";
    body.style.borderRadius = "10px";
    body.style.lineHeight = "1.6";
    body.textContent = text.text;
    container.appendChild(body);
  }

  const questionsBox = document.createElement("div");
  questionsBox.style.marginTop = "24px";
  container.appendChild(questionsBox);

  text.questions.forEach((q, i) => {
    const qBox = document.createElement("div");
    qBox.style.marginBottom = "24px";

    if (q.sign) {
      const sign = document.createElement("div");
      sign.style.padding = "12px";
      sign.style.background = "#1e293b";
      sign.style.color = "#fff";
      sign.style.borderRadius = "8px";
      sign.style.fontWeight = "bold";
      sign.style.textAlign = "center";
      sign.style.marginBottom = "12px";
      sign.textContent = q.sign;
      qBox.appendChild(sign);
    }

    if (q.question) {
      const qText = document.createElement("div");
      qText.style.fontWeight = "500";
      qText.style.marginBottom = "8px";
      qText.textContent = (i + 1) + ". " + q.question;
      qBox.appendChild(qText);
    }

    const correctValue = q.options[q.correct];
    const shuffledOpts = shuffleArray(q.options);
    const newCorrect = shuffledOpts.indexOf(correctValue);
    renderExercise(qBox, {
      prompt: q.sign ? "What does this sign mean?" : "Choose the correct answer:",
      options: shuffledOpts,
      correct: newCorrect,
      explanation: q.explanation
    });

    questionsBox.appendChild(qBox);
  });
}

function openAudio(container, audio) {
  container.innerHTML = "";

  const back = document.createElement("button");
  back.className = "btn btn--ghost";
  back.textContent = "Back";
  back.addEventListener("click", () => renderListeningList(container));
  container.appendChild(back);

  const h2 = document.createElement("h2");
  h2.textContent = audio.title;
  container.appendChild(h2);

  const instr = document.createElement("div");
  instr.className = "feedback feedback--info";
  instr.textContent = audio.instructions;
  container.appendChild(instr);

  let plays = 0;
  const maxPlays = 2;

  const btnRow = document.createElement("div");
  btnRow.style.marginTop = "16px";
  btnRow.style.display = "flex";
  btnRow.style.gap = "8px";
  container.appendChild(btnRow);

  const playBtn = document.createElement("button");
  playBtn.className = "btn btn--primary";
  playBtn.textContent = "Play audio (0/" + maxPlays + ")";
  btnRow.appendChild(playBtn);

  const stopBtn = document.createElement("button");
  stopBtn.className = "btn btn--ghost";
  stopBtn.textContent = "Stop";
  stopBtn.disabled = true;
  btnRow.appendChild(stopBtn);

  const transBtn = document.createElement("button");
  transBtn.className = "btn btn--ghost";
  transBtn.textContent = "Show transcript";
  transBtn.disabled = true;
  btnRow.appendChild(transBtn);

  const transSlot = document.createElement("div");
  container.appendChild(transSlot);

  playBtn.addEventListener("click", () => {
    if (plays >= maxPlays) return;

    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support speech synthesis.");
      return;
    }

    plays++;
    playBtn.textContent = "Play audio (" + plays + "/" + maxPlays + ")";
    if (plays >= maxPlays) playBtn.disabled = true;
    if (plays >= maxPlays) transBtn.disabled = false;

    stopBtn.disabled = false;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(audio.transcript);
    utter.lang = audio.voice || "en-GB";
    utter.rate = 0.9;
    utter.pitch = 1.0;
    utter.onend = () => { stopBtn.disabled = true; };
    window.speechSynthesis.speak(utter);
  });

  stopBtn.addEventListener("click", () => {
    window.speechSynthesis.cancel();
    stopBtn.disabled = true;
  });

  transBtn.addEventListener("click", () => {
    const fb = document.createElement("div");
    fb.className = "feedback feedback--info";
    fb.style.marginTop = "12px";
    fb.textContent = audio.transcript;
    transSlot.appendChild(fb);
  });

  const questionsBox = document.createElement("div");
  questionsBox.style.marginTop = "24px";
  container.appendChild(questionsBox);

  audio.questions.forEach((q, i) => {
    const qBox = document.createElement("div");
    qBox.style.marginBottom = "24px";

    const qText = document.createElement("div");
    qText.style.fontWeight = "500";
    qText.style.marginBottom = "8px";
    qText.textContent = (i + 1) + ". " + q.question;
    qBox.appendChild(qText);

    const correctValue = q.options[q.correct];
    const shuffledOpts = shuffleArray(q.options);
    const newCorrect = shuffledOpts.indexOf(correctValue);
    renderExercise(qBox, {
      prompt: "Choose the correct answer:",
      options: shuffledOpts,
      correct: newCorrect,
      explanation: q.explanation
    });

    questionsBox.appendChild(qBox);
  });
}
