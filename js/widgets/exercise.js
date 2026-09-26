// Shuffle array in place (Fisher-Yates)
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Multiple choice exercise widget.
import { addMistake } from "../state.js";

export function renderExercise(container, data) {
  const wrapper = document.createElement("div");
  wrapper.className = "exercise";

  const prompt = document.createElement("div");
  prompt.className = "exercise__prompt";
  prompt.textContent = data.prompt;
  wrapper.appendChild(prompt);

  const optionsBox = document.createElement("div");
  optionsBox.className = "exercise__options";
  wrapper.appendChild(optionsBox);

  const feedbackSlot = document.createElement("div");
  wrapper.appendChild(feedbackSlot);

  // Shuffle options at render time so the order changes every time
  const correctValue = data.options[data.correct];
  const shuffled = shuffleArray(data.options);
  const newCorrectIdx = shuffled.indexOf(correctValue);
  const localData = { ...data, options: shuffled, correct: newCorrectIdx };

  shuffled.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = String.fromCharCode(65 + i) + ". " + opt;
    btn.addEventListener("click", () => checkAnswer(i, btn, optionsBox, feedbackSlot, localData));
    optionsBox.appendChild(btn);
  });

  container.appendChild(wrapper);
}

function checkAnswer(chosen, btn, optionsBox, feedbackSlot, data) {
  optionsBox.querySelectorAll(".option").forEach(o => o.disabled = true);
  const isCorrect = chosen === data.correct;
  btn.classList.add(isCorrect ? "is-correct" : "is-wrong");

  if (!isCorrect) {
    optionsBox.children[data.correct].classList.add("is-correct");
    addMistake({ type: "multiple-choice", prompt: data.prompt, chosen, correct: data.correct });
  }

  const fb = document.createElement("div");
  fb.className = "feedback " + (isCorrect ? "feedback--correct" : "feedback--wrong");
  fb.textContent = (isCorrect ? "Correct. " : "Incorrect. ") + (data.explanation || "");
  feedbackSlot.appendChild(fb);
}
