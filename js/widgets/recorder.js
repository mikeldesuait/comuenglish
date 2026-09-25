// Voice recorder widget for speaking exercises.

export function renderRecorder(container, options) {
  const { prompt: promptText, seconds = 60 } = options;

  const wrapper = document.createElement("div");
  wrapper.className = "exercise";

  const prompt = document.createElement("div");
  prompt.className = "exercise__prompt";
  prompt.textContent = promptText;
  wrapper.appendChild(prompt);

  const timeInfo = document.createElement("p");
  timeInfo.textContent = "Time: " + seconds + "s";
  wrapper.appendChild(timeInfo);

  const recBtn = document.createElement("button");
  recBtn.className = "btn btn--primary";
  recBtn.textContent = "Record";
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

  const playback = document.createElement("audio");
  playback.controls = true;
  playback.style.display = "none";
  playback.style.width = "100%";
  playback.style.marginTop = "12px";
  wrapper.appendChild(playback);

  const slot = document.createElement("div");
  wrapper.appendChild(slot);

  let mediaRecorder, chunks = [], timer, countdownInterval;

  recBtn.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      chunks = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        playback.src = URL.createObjectURL(blob);
        playback.style.display = "block";
        recBtn.style.background = "";
        recBtn.textContent = "Record";
        statusMsg.textContent = "";
        clearInterval(countdownInterval);
        const fb = document.createElement("div");
        fb.className = "feedback feedback--info";
        fb.textContent = "Recording ready. Listen to it and compare.";
        slot.appendChild(fb);
      };

      mediaRecorder.start();
      recBtn.disabled = true;
      recBtn.style.background = "#dc2626";
      recBtn.style.color = "#fff";
      recBtn.textContent = "Recording...";
      stopBtn.disabled = false;

      let remaining = seconds;
      statusMsg.textContent = "0:" + String(remaining).padStart(2, "0") + " left";
      countdownInterval = setInterval(() => {
        remaining--;
        if (remaining >= 0) {
          statusMsg.textContent = "0:" + String(remaining).padStart(2, "0") + " left";
        }
      }, 1000);

      timer = setTimeout(() => stopBtn.click(), seconds * 1000);
    } catch (err) {
      const fb = document.createElement("div");
      fb.className = "feedback feedback--wrong";
      fb.textContent = "Could not access microphone: " + err.message;
      slot.appendChild(fb);
    }
  });

  stopBtn.addEventListener("click", () => {
    clearTimeout(timer);
    clearInterval(countdownInterval);
    if (mediaRecorder) mediaRecorder.stop();
    recBtn.disabled = false;
    stopBtn.disabled = true;
    statusMsg.textContent = "";
  });

  container.appendChild(wrapper);
}
