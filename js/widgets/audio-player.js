// Audio player widget for listening exercises.

export function renderAudioPlayer(container, options) {
  const { src, maxPlays = 2, transcript } = options;
  let plays = 0;

  const wrapper = document.createElement("div");
  wrapper.className = "exercise";

  const prompt = document.createElement("div");
  prompt.className = "exercise__prompt";
  prompt.textContent = "Listen to the audio (max " + maxPlays + " plays).";
  wrapper.appendChild(prompt);

  const playBtn = document.createElement("button");
  playBtn.className = "btn btn--primary";
  playBtn.textContent = "Play (0/" + maxPlays + ")";
  wrapper.appendChild(playBtn);

  const transBtn = document.createElement("button");
  transBtn.className = "btn btn--ghost";
  transBtn.textContent = "Show transcript";
  transBtn.disabled = true;
  transBtn.style.marginLeft = "8px";
  wrapper.appendChild(transBtn);

  const slot = document.createElement("div");
  wrapper.appendChild(slot);

  const audio = new Audio(src);

  playBtn.addEventListener("click", () => {
    if (plays >= maxPlays) return;
    plays++;
    playBtn.textContent = "Play (" + plays + "/" + maxPlays + ")";
    playBtn.disabled = plays >= maxPlays;
    audio.play();
    if (plays === maxPlays) transBtn.disabled = false;
  });

  transBtn.addEventListener("click", () => {
    const fb = document.createElement("div");
    fb.className = "feedback feedback--info";
    fb.textContent = transcript || "No transcript available.";
    slot.appendChild(fb);
  });

  container.appendChild(wrapper);
}
