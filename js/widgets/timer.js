// Countdown timer widget for mock exams.

export function createTimer(options) {
  const { seconds, onTick, onEnd } = options;
  let remaining = seconds;
  let intervalId = null;

  function format(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }

  function start() {
    if (intervalId) return;
    intervalId = setInterval(() => {
      remaining--;
      if (onTick) onTick(remaining, format(remaining));
      if (remaining <= 0) {
        stop();
        if (onEnd) onEnd();
      }
    }, 1000);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function reset(newSeconds) {
    stop();
    remaining = newSeconds || seconds;
    if (onTick) onTick(remaining, format(remaining));
  }

  function getRemaining() { return remaining; }
  function getFormatted() { return format(remaining); }

  return { start, stop, reset, getRemaining, getFormatted };
}

export function renderTimerWidget(container, initialSeconds) {
  const box = document.createElement("div");
  box.style.padding = "12px 20px";
  box.style.background = "#1e293b";
  box.style.color = "#fff";
  box.style.borderRadius = "10px";
  box.style.fontWeight = "bold";
  box.style.fontSize = "1.4rem";
  box.style.fontFamily = "monospace";
  box.style.textAlign = "center";
  box.textContent = "00:00";
  container.appendChild(box);

  const timer = createTimer({
    seconds: initialSeconds,
    onTick: (remaining, formatted) => {
      box.textContent = formatted;
      if (remaining <= 60) {
        box.style.background = "#dc2626";
      } else if (remaining <= 300) {
        box.style.background = "#f59e0b";
      } else {
        box.style.background = "#1e293b";
      }
    }
  });

  timer.reset(initialSeconds);

  return { timer, box };
}
