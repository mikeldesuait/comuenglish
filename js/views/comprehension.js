// Comprehension module view.
import { getState } from "../state.js";
import { renderAudioPlayer } from "../widgets/audio-player.js";
import { renderExercise } from "../widgets/exercise.js";

export function renderComprehension(view) {
  const { level } = getState();

  view.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Module 2 - Comprehension (" + level.toUpperCase() + ")";
  view.appendChild(h2);

  const p = document.createElement("p");
  p.textContent = "Reading and Listening exercises.";
  view.appendChild(p);

  const h3a = document.createElement("h3");
  h3a.textContent = "Listening sample";
  view.appendChild(h3a);

  const listeningBox = document.createElement("div");
  view.appendChild(listeningBox);
  renderAudioPlayer(listeningBox, {
    src: "audio/a2/sample.mp3",
    maxPlays: 2,
    transcript: "Sample transcript for the audio."
  });

  const h3b = document.createElement("h3");
  h3b.textContent = "Reading sample";
  view.appendChild(h3b);

  const readingBox = document.createElement("div");
  view.appendChild(readingBox);
  renderExercise(readingBox, {
    prompt: "What does the sign mean? NO PARKING",
    options: ["You can park here", "You cannot park here", "Free parking", "Customers only"],
    correct: 1,
    explanation: "No parking means it is forbidden to park."
  });
}
