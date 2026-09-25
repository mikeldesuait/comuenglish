// Production module view.
import { getState } from "../state.js";
import { renderRecorder } from "../widgets/recorder.js";
import { callDeepSeek } from "../services/deepseek.js";

export function renderProduction(view) {
  const { level } = getState();

  view.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Module 3 - Production (" + level.toUpperCase() + ")";
  view.appendChild(h2);

  const h3a = document.createElement("h3");
  h3a.textContent = "Writing - Essay";
  view.appendChild(h3a);

  const ta = document.createElement("textarea");
  ta.id = "essay";
  ta.rows = 8;
  ta.placeholder = "Write your essay here (140-190 words)...";
  ta.style.width = "100%";
  ta.style.padding = "12px";
  ta.style.border = "1px solid var(--border)";
  ta.style.borderRadius = "10px";
  ta.style.font = "inherit";
  view.appendChild(ta);

  const btnBox = document.createElement("div");
  btnBox.style.marginTop = "8px";
  const evalBtn = document.createElement("button");
  evalBtn.className = "btn btn--primary";
  evalBtn.textContent = "Evaluate with DeepSeek";
  btnBox.appendChild(evalBtn);
  view.appendChild(btnBox);

  const feedbackBox = document.createElement("div");
  view.appendChild(feedbackBox);

  evalBtn.addEventListener("click", async () => {
    const text = ta.value.trim();
    if (text.length < 50) {
      alert("Write at least 50 characters.");
      return;
    }

    feedbackBox.innerHTML = "";
    const loading = document.createElement("div");
    loading.className = "feedback feedback--info";
    loading.textContent = "Evaluating...";
    feedbackBox.appendChild(loading);

    try {
      const prompt = "You are a Cambridge examiner. Evaluate this essay at level " + level.toUpperCase() + ". Reply ONLY with valid JSON: { scores: { content: 0, communicative_achievement: 0, organisation: 0, language: 0 }, overall: 0, strengths: [], improvements: [], feedback_es: string }. Text: " + text;

      const raw = await callDeepSeek([
        { role: "user", content: prompt }
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

  const h3b = document.createElement("h3");
  h3b.textContent = "Speaking - Picture description";
  h3b.style.marginTop = "24px";
  view.appendChild(h3b);

  const speakingBox = document.createElement("div");
  view.appendChild(speakingBox);
  renderRecorder(speakingBox, {
    prompt: "Describe the picture for 1 minute.",
    seconds: 60
  });
}
