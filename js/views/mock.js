// Mock Exam view. Sectioned exam that simulates Cambridge papers.
import { getState } from "../state.js";
import { renderTimerWidget } from "../widgets/timer.js";
import { toCambridgeScale, isPass } from "../core/scoring.js";

const SECTION_WEIGHTS = {
  a2: { reading: 0.5, listening: 0.25, grammar: 0.25 },
  b1: { reading: 0.4, listening: 0.3, grammar: 0.3 },
      b2: { reading: 0.5, listening: 0.25, grammar: 0.25 }
};

const SECTION_TIMES = {
  a2: { reading: 30 * 60, listening: 20 * 60, grammar: 15 * 60 },
  b1: { reading: 25 * 60, listening: 20 * 60, grammar: 15 * 60 },
  b2: { reading: 40 * 60, listening: 25 * 60, grammar: 20 * 60 }
};

const QUESTIONS_PER_SECTION = 10;

export function renderMock(view) {
  const { level } = getState();
  view.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Mock Exam - " + level.toUpperCase();
  view.appendChild(h2);

  const info = document.createElement("div");
  info.className = "feedback feedback--info";
  info.innerHTML = "<p>This mock exam has 3 sections. Each section has " + QUESTIONS_PER_SECTION + " questions.</p>" +
    "<p><strong>Reading</strong> - Read the text and answer the questions.</p>" +
    "<p><strong>Listening</strong> - Listen to the audio and answer the questions.</p>" +
    "<p><strong>Grammar</strong> - Answer grammar questions.</p>" +
    "<p>You cannot go back to a previous section. The timer keeps running.</p>";
  view.appendChild(info);

  const startBtn = document.createElement("button");
  startBtn.className = "btn btn--primary";
  startBtn.textContent = "Start Mock Exam";
  startBtn.style.marginTop = "24px";
  startBtn.style.fontSize = "1.1rem";
  startBtn.style.padding = "12px 32px";
  startBtn.addEventListener("click", () => loadAndStart(view));
  view.appendChild(startBtn);
}

async function loadAndStart(view) {
  const { level } = getState();

  if (!confirm("Are you ready? The timer will start and you cannot pause.")) return;

  view.innerHTML = "";
  const loading = document.createElement("p");
  loading.textContent = "Loading exam content...";
  view.appendChild(loading);

  try {
    const [readingData, listeningData, fundamentalsData] = await Promise.all([
      fetch("data/" + level + "/reading.json").then(r => r.json()),
      fetch("data/" + level + "/listening.json").then(r => r.json()),
      fetch("data/" + level + "/units.json").then(r => r.json())
    ]);

    const readingQuestions = [];
    (readingData.texts || []).forEach(text => {
      (text.questions || []).forEach(q => {
        readingQuestions.push({ question: q, context: text.text || null, sign: q.sign || null });
      });
    });

    const listeningQuestions = [];
    (listeningData.audios || []).forEach(audio => {
      (audio.questions || []).forEach(q => {
        listeningQuestions.push({ question: q, transcript: audio.transcript, voice: audio.voice || "en-GB" });
      });
    });

    const grammarQuestions = [];
    const units = fundamentalsData.units || [];
    const unitPromises = units.slice(0, 5).map(u =>
      fetch("data/" + level + "/" + u.file).then(r => r.json()).catch(() => null)
    );
    const unitData = await Promise.all(unitPromises);
    unitData.forEach(unit => {
      if (!unit || !unit.phases) return;
      unit.phases.forEach(phase => {
        if (phase.type === "exercise" && Array.isArray(phase.questions)) {
          phase.questions.forEach(q => {
            if (q.prompt && Array.isArray(q.options)) {
              grammarQuestions.push({
                prompt: q.prompt,
                options: q.options,
                correct: q.correct,
                explanation: q.explanation
              });
            }
          });
        }
      });
    });

    if (readingQuestions.length === 0 && listeningQuestions.length === 0 && grammarQuestions.length === 0) {
      loading.textContent = "No exam content available. Add JSON data first.";
      loading.className = "feedback feedback--wrong";
      return;
    }

    const sections = [
      { id: "reading", name: "Reading", questions: readingQuestions, time: SECTION_TIMES[level].reading },
      { id: "listening", name: "Listening", questions: listeningQuestions, time: SECTION_TIMES[level].listening },
      { id: "grammar", name: "Grammar", questions: grammarQuestions, time: SECTION_TIMES[level].grammar }
    ];

    const examState = { sections, currentSection: 0, results: {} };
    startSection(view, examState);

  } catch (err) {
    loading.textContent = "Error loading exam: " + err.message;
    loading.className = "feedback feedback--wrong";
  }
}

function startSection(view, examState) {
  view.innerHTML = "";
  const section = examState.sections[examState.currentSection];

  if (!section || section.questions.length === 0) {
    examState.results[section.id] = { correct: 0, total: 0 };
    examState.currentSection++;
    if (examState.currentSection >= examState.sections.length) {
      showFinalResults(view, examState);
    } else {
      startSection(view, examState);
    }
    return;
  }

  const header = document.createElement("h2");
  header.textContent = "Section " + (examState.currentSection + 1) + ": " + section.name;
  view.appendChild(header);

  const info = document.createElement("p");
  info.textContent = section.questions.length + " questions - " + Math.round(section.time / 60) + " minutes";
  view.appendChild(info);

  const startBtn = document.createElement("button");
  startBtn.className = "btn btn--primary";
  startBtn.textContent = "Start " + section.name;
  startBtn.style.marginTop = "16px";
  startBtn.addEventListener("click", () => runSection(view, examState, section));
  view.appendChild(startBtn);
}

function runSection(view, examState, section) {
  view.innerHTML = "";

  const topBar = document.createElement("div");
  topBar.style.display = "flex";
  topBar.style.gap = "16px";
  topBar.style.alignItems = "center";
  topBar.style.marginBottom = "20px";
  view.appendChild(topBar);

  const timerBox = document.createElement("div");
  topBar.appendChild(timerBox);
  const { timer } = renderTimerWidget(timerBox, section.time);

  const progress = document.createElement("div");
  progress.style.fontWeight = "bold";
  progress.textContent = section.name + " - Score: 0 / 0";
  topBar.appendChild(progress);

  const content = document.createElement("div");
  view.appendChild(content);

  const results = { correct: 0, total: 0 };
  const questions = shuffle(section.questions);
  let current = 0;

  function renderQuestion() {
    content.innerHTML = "";

    if (current >= questions.length) {
      timer.stop();
      examState.results[section.id] = results;
      finishSection(view, examState, section, results);
      return;
    }

    const q = questions[current];

    const qInfo = document.createElement("p");
    qInfo.style.fontSize = ".85rem";
    qInfo.style.color = "#64748b";
    qInfo.textContent = "Question " + (current + 1) + " of " + questions.length;
    content.appendChild(qInfo);

    if (section.id === "reading" && q.context) {
      const ctx = document.createElement("div");
      ctx.style.padding = "16px";
      ctx.style.margin = "12px 0";
      ctx.style.background = "#f8fafc";
      ctx.style.borderRadius = "10px";
      ctx.style.lineHeight = "1.6";
      ctx.style.fontStyle = "italic";
      ctx.textContent = q.context;
      content.appendChild(ctx);
    }

    if (q.sign) {
      const sign = document.createElement("div");
      sign.style.padding = "12px";
      sign.style.background = "#1e293b";
      sign.style.color = "#fff";
      sign.style.borderRadius = "8px";
      sign.style.fontWeight = "bold";
      sign.style.textAlign = "center";
      sign.style.margin = "12px 0";
      sign.textContent = q.sign;
      content.appendChild(sign);
    }

    if (section.id === "listening" && q.transcript) {
      let plays = 0;
      const maxPlays = 2;
      const btnRow = document.createElement("div");
      btnRow.style.display = "flex";
      btnRow.style.gap = "8px";
      btnRow.style.marginBottom = "12px";

      const playBtn = document.createElement("button");
      playBtn.className = "btn btn--primary";
      playBtn.textContent = "Play audio (0/" + maxPlays + ")";
      btnRow.appendChild(playBtn);

      const stopBtn = document.createElement("button");
      stopBtn.className = "btn btn--ghost";
      stopBtn.textContent = "Stop";
      stopBtn.disabled = true;
      btnRow.appendChild(stopBtn);

      playBtn.addEventListener("click", () => {
        if (plays >= maxPlays) return;
        plays++;
        playBtn.textContent = "Play audio (" + plays + "/" + maxPlays + ")";
        if (plays >= maxPlays) playBtn.disabled = true;

        stopBtn.disabled = false;

        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(q.transcript);
        utter.lang = q.voice;
        utter.rate = 0.9;
        utter.onend = () => { stopBtn.disabled = true; };
        window.speechSynthesis.speak(utter);
      });

      stopBtn.addEventListener("click", () => {
        window.speechSynthesis.cancel();
        stopBtn.disabled = true;
      });

      content.appendChild(btnRow);
    }

    const qText = document.createElement("div");
    qText.style.fontWeight = "500";
    qText.style.marginBottom = "12px";
    const qTextValue = (q.question && q.question.question) ? q.question.question : (q.prompt || q.text || "Choose the correct answer:");
    qText.textContent = qTextValue;
    content.appendChild(qText);

    const optionsBox = document.createElement("div");
    optionsBox.className = "exercise__options";

    const rawOpts = (q.question && q.question.options) ? q.question.options : (q.options || []);
    const rawCorrect = (q.question && typeof q.question.correct === 'number') ? q.question.correct : (typeof q.correct === 'number' ? q.correct : 0);

    // Shuffle options in real time
    const correctValue = rawOpts[rawCorrect];
    const opts = rawOpts.slice();
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    const correctIdx = opts.indexOf(correctValue);

    opts.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.textContent = String.fromCharCode(65 + i) + ". " + opt;
      btn.addEventListener("click", () => {
        optionsBox.querySelectorAll(".option").forEach(o => o.disabled = true);
        const isCorrect = i === correctIdx;
        btn.classList.add(isCorrect ? "is-correct" : "is-wrong");
        if (!isCorrect) optionsBox.children[correctIdx].classList.add("is-correct");
        results.total++;
        if (isCorrect) results.correct++;
        progress.textContent = section.name + " - Score: " + results.correct + " / " + results.total;

        setTimeout(() => {
          current++;
          renderQuestion();
        }, 900);
      });
      optionsBox.appendChild(btn);
    });

    content.appendChild(optionsBox);
  }

  renderQuestion();
  timer.start();
}

function finishSection(view, examState, section, results) {
  view.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = section.name + " completed";
  view.appendChild(h2);

  const percent = results.total > 0 ? results.correct / results.total : 0;
  const box = document.createElement("div");
  box.className = "feedback " + (percent >= 0.6 ? "feedback--correct" : "feedback--wrong");
  box.style.padding = "20px";
  box.style.textAlign = "center";
  box.innerHTML = "<p><strong>" + results.correct + " / " + results.total + "</strong> correct</p>" +
    "<p>" + Math.round(percent * 100) + "%</p>";
  view.appendChild(box);

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn btn--primary";
  nextBtn.textContent = "Next Section";
  nextBtn.style.marginTop = "24px";
  nextBtn.style.fontSize = "1.1rem";
  nextBtn.style.padding = "12px 32px";
  nextBtn.addEventListener("click", () => {
    examState.currentSection++;
    if (examState.currentSection >= examState.sections.length) {
      showFinalResults(view, examState);
    } else {
      startSection(view, examState);
    }
  });
  view.appendChild(nextBtn);
}

function showFinalResults(view, examState) {
  const { level } = getState();
  let totalCorrect = 0;
  let totalQuestions = 0;

  examState.sections.forEach(s => {
    const r = examState.results[s.id] || { correct: 0, total: 0 };
    totalCorrect += r.correct;
    totalQuestions += r.total;
  });

  const percent = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
  const scale = toCambridgeScale(level, percent);
  const passed = isPass(level, scale);

  const thresholds = {
    a2: { pass: 120, label: "A2 Key" },
    b1: { pass: 140, label: "B1 Preliminary" },
    b2: { pass: 160, label: "B2 First" }
  };
  const t = thresholds[level];

  view.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Mock Exam Results";
  view.appendChild(h2);

  const scoreBox = document.createElement("div");
  scoreBox.className = "feedback " + (passed ? "feedback--correct" : "feedback--wrong");
  scoreBox.style.padding = "24px";
  scoreBox.style.textAlign = "center";
  scoreBox.style.fontSize = "1.2rem";
  scoreBox.innerHTML = "<h3>" + (passed ? "PASS" : "NOT YET") + "</h3>" +
    "<p>" + totalCorrect + " / " + totalQuestions + " (" + Math.round(percent * 100) + "%)</p>" +
    "<p style=\"font-size: 1.5rem; font-weight: bold;\">Cambridge Scale: " + scale + "</p>";
  view.appendChild(scoreBox);

  const breakdown = document.createElement("div");
  breakdown.style.marginTop = "20px";
  breakdown.innerHTML = "<h4>Section breakdown</h4>";
  examState.sections.forEach(s => {
    const r = examState.results[s.id] || { correct: 0, total: 0 };
    const p = document.createElement("p");
    p.textContent = s.name + ": " + r.correct + " / " + r.total;
    breakdown.appendChild(p);
  });
  view.appendChild(breakdown);

  const info = document.createElement("div");
  info.className = "feedback feedback--info";
  info.style.marginTop = "16px";
  info.innerHTML = "<p>Passing threshold for " + t.label + ": <strong>" + t.pass + "</strong></p>" +
    (passed ? "<p>You are above the threshold. Keep practising.</p>" : "<p>You need " + (t.pass - scale) + " more points.</p>");
  view.appendChild(info);

  const retryBtn = document.createElement("button");
  retryBtn.className = "btn btn--primary";
  retryBtn.textContent = "Retake Mock Exam";
  retryBtn.style.marginTop = "24px";
  retryBtn.addEventListener("click", () => renderMock(view));
  view.appendChild(retryBtn);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
