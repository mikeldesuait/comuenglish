// Speech analyzer widget: records voice, transcribes with Web Speech API, sends to DeepSeek.
import { callDeepSeek } from "../services/deepseek.js";
import { getState } from "../state.js";

export function renderSpeechAnalyzer(container, options) {
  const { prompt: promptText, seconds = 60, level = "b1" } = options;

  const wrapper = document.createElement("div");
  wrapper.className = "exercise";

  const promptEl = document.createElement("div");
  promptEl.className = "exercise__prompt";
  promptEl.textContent = promptText;
  wrapper.appendChild(promptEl);

  const timeInfo = document.createElement("p");
  timeInfo.textContent = "Time: " + seconds + "s";
  wrapper.appendChild(timeInfo);

  const recBtn = document.createElement("button");
  recBtn.className = "btn btn--primary";
  recBtn.textContent = "Start recording";
  wrapper.appendChild(recBtn);

  const stopBtn = document.createElement("button");
  stopBtn.className = "btn btn--ghost";
  stopBtn.textContent = "Stop";
  stopBtn.disabled = true;
  stopBtn.style.marginLeft = "8px";
  wrapper.appendChild(stopBtn);

  const statusMsg = document.createElement("span");
  statusMsg.style.marginLeft = "12px";
  statusMsg.style.fontWeight = "bold";
  statusMsg.style.color = "#dc2626";
  wrapper.appendChild(statusMsg);

  const transcriptLabel = document.createElement("p");
  transcriptLabel.style.marginTop = "16px";
  transcriptLabel.style.fontWeight = "bold";
  transcriptLabel.style.display = "none";
  transcriptLabel.textContent = "Your speech (transcribed):";
  wrapper.appendChild(transcriptLabel);

  const transcriptBox = document.createElement("div");
  transcriptBox.style.padding = "12px";
  transcriptBox.style.background = "#f8fafc";
  transcriptBox.style.borderRadius = "8px";
  transcriptBox.style.marginTop = "8px";
  transcriptBox.style.minHeight = "40px";
  transcriptBox.style.display = "none";
  transcriptBox.style.fontStyle = "italic";
  transcriptBox.style.color = "#475569";
  wrapper.appendChild(transcriptBox);

  const analyzeBtn = document.createElement("button");
  analyzeBtn.className = "btn btn--primary";
  analyzeBtn.textContent = "Analyze with DeepSeek";
  analyzeBtn.style.marginTop = "16px";
  analyzeBtn.style.display = "none";
  wrapper.appendChild(analyzeBtn);

  const feedbackBox = document.createElement("div");
  wrapper.appendChild(feedbackBox);

  let recognition = null;
  let finalTranscript = "";
  let timer = null;
  let countdownInterval = null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    const err = document.createElement("div");
    err.className = "feedback feedback--wrong";
    err.textContent = "Your browser does not support speech recognition. Use Chrome or Edge.";
    wrapper.appendChild(err);
    recBtn.disabled = true;
  }

  recBtn.addEventListener("click", () => {
    if (!SpeechRecognition) return;

    finalTranscript = "";
    transcriptBox.textContent = "";
    feedbackBox.innerHTML = "";
    recognizeStart();
  });

  function recognizeStart() {
    recognition = new SpeechRecognition();
    recognition.lang = "en-GB";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      transcriptBox.textContent = finalTranscript + interim;
    };

    recognition.onerror = (event) => {
      const fb = document.createElement("div");
      fb.className = "feedback feedback--wrong";
      fb.textContent = "Recognition error: " + event.error;
      feedbackBox.appendChild(fb);
    };

    recognition.onend = () => {
      recBtn.disabled = false;
      recBtn.textContent = "Start recording";
      recBtn.style.background = "";
      stopBtn.disabled = true;
      statusMsg.textContent = "";
      clearInterval(countdownInterval);

      if (finalTranscript.trim().length > 0) {
        transcriptLabel.style.display = "block";
        transcriptBox.style.display = "block";
        analyzeBtn.style.display = "inline-flex";
      }
    };

    recognition.start();

    recBtn.disabled = true;
    recBtn.style.background = "#dc2626";
    recBtn.style.color = "#fff";
    recBtn.textContent = "Recording...";
    stopBtn.disabled = false;
    transcriptLabel.style.display = "block";
    transcriptBox.style.display = "block";

    let remaining = seconds;
    statusMsg.textContent = "0:" + String(remaining).padStart(2, "0") + " left";
    countdownInterval = setInterval(() => {
      remaining--;
      if (remaining >= 0) {
        statusMsg.textContent = "0:" + String(remaining).padStart(2, "0") + " left";
      }
    }, 1000);

    timer = setTimeout(() => recognizeStop(), seconds * 1000);
  }

  function recognizeStop() {
    clearTimeout(timer);
    clearInterval(countdownInterval);
    if (recognition) recognition.stop();
  }

  stopBtn.addEventListener("click", recognizeStop);

  analyzeBtn.addEventListener("click", async () => {
    const text = finalTranscript.trim();
    if (text.length < 10) {
      alert("Not enough speech detected.");
      return;
    }

    feedbackBox.innerHTML = "";
    const loading = document.createElement("div");
    loading.className = "feedback feedback--info";
    loading.textContent = "Analyzing with DeepSeek...";
    feedbackBox.appendChild(loading);

    try {
      const { level } = getState();
      const wordCount = text.split(/\\s+/).filter(w => w.length > 0).length;
      const wpm = Math.round((wordCount / seconds) * 60);

      const sysPrompt = "You are a Cambridge English speaking examiner. Analyze the student spoken response (transcribed). Reply ONLY with valid JSON: { overall: number, fluency: number, vocabulary: number, grammar: number, coherence: number, strengths: [string], improvements: [string], feedback_es: string, better_version: string }. All numbers are 0-5. Overall is 0-20. better_version is a corrected and improved version of what the student said.";

      const userPrompt = "Level: " + level.toUpperCase() + "\\nPrompt: " + promptText + "\\nDuration: " + seconds + "s\\nWords spoken: " + wordCount + "\\nWords per minute: " + wpm + "\\nTranscript: " + text;

      const raw = await callDeepSeek([
        { role: "system", content: sysPrompt },
        { role: "user", content: userPrompt }
      ], { jsonMode: true, maxTokens: 1500, temperature: 0.3 });

      const parsed = JSON.parse(raw);
      feedbackBox.innerHTML = "";

      const fb = document.createElement("div");
      fb.className = "feedback feedback--info";
      fb.innerHTML = "<h4>Score: " + parsed.overall + "/20 (WPM: " + wpm + ")</h4>" +
        "<p><strong>Fluency:</strong> " + (parsed.fluency || 0) + "/5</p>" +
        "<p><strong>Vocabulary:</strong> " + (parsed.vocabulary || 0) + "/5</p>" +
        "<p><strong>Grammar:</strong> " + (parsed.grammar || 0) + "/5</p>" +
        "<p><strong>Coherence:</strong> " + (parsed.coherence || 0) + "/5</p>" +
        "<p><strong>Strengths:</strong> " + (parsed.strengths || []).join(", ") + "</p>" +
        "<p><strong>Improvements:</strong> " + (parsed.improvements || []).join(", ") + "</p>" +
        "<p><em>" + (parsed.feedback_es || "") + "</em></p>" +
        "<p><strong>Better version:</strong><br><em>" + (parsed.better_version || "") + "</em></p>";
      feedbackBox.appendChild(fb);
    } catch (err) {
      feedbackBox.innerHTML = "";
      const fb = document.createElement("div");
      fb.className = "feedback feedback--wrong";
      fb.textContent = "Error: " + err.message;
      feedbackBox.appendChild(fb);
    }
  });

  container.appendChild(wrapper);
}
