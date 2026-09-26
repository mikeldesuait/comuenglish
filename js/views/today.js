// Today: daily study plan with tasks and streak.
import { getState, getPlan, getDailyLog, getStreak, logDailyTask } from "../state.js";
import { daysBetween, todayKey } from "../core/planner.js";
import { navigate } from "../router.js";

export function renderToday(view) {
  const plan = getPlan();
  const state = getState();

  if (!plan.enabled) {
    // Not configured yet: redirect to onboarding
    view.innerHTML = "";
    const msg = document.createElement("div");
    msg.className = "feedback feedback--info";
    msg.innerHTML = "<strong>Welcome!</strong><br>You haven't created your study plan yet.";
    view.appendChild(msg);

    const btn = document.createElement("button");
    btn.className = "btn btn--primary";
    btn.textContent = "Create my plan";
    btn.style.marginTop = "16px";
    btn.style.padding = "12px 24px";
    btn.addEventListener("click", () => {
      navigate("onboarding");
    });
    view.appendChild(btn);
    return;
  }

  view.innerHTML = "";

  const today = todayKey();
  const dailyLog = getDailyLog()[today] || {};
  const streak = getStreak();

  // Header
  const header = document.createElement("div");
  header.style.background = "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
  header.style.color = "#fff";
  header.style.padding = "20px 24px";
  header.style.borderRadius = "12px";
  header.style.marginBottom = "20px";

  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long"
  });

  const h1 = document.createElement("h1");
  h1.textContent = "Today - " + dateStr;
  h1.style.fontSize = "1.3rem";
  h1.style.marginBottom = "6px";
  header.appendChild(h1);

  const daysLeft = daysBetween(new Date(), new Date(plan.examDate));
  const daysStudied = Object.keys(getDailyLog()).length;

  const info = document.createElement("div");
  info.style.display = "flex";
  info.style.gap = "16px";
  info.style.flexWrap = "wrap";
  info.style.fontSize = ".85rem";
  info.style.opacity = ".95";

  [
    "🎯 Level: " + plan.targetLevel.toUpperCase(),
    "📅 " + daysLeft + " days until exam",
    "🔥 " + streak.current + " day streak",
    "📚 Studied " + daysStudied + " days"
  ].forEach(txt => {
    const s = document.createElement("span");
    s.textContent = txt;
    info.appendChild(s);
  });
  header.appendChild(info);
  view.appendChild(header);

  // Tasks
  const tasksTitle = document.createElement("h2");
  tasksTitle.textContent = "Your plan for today";
  tasksTitle.style.fontSize = "1.1rem";
  tasksTitle.style.marginBottom = "12px";
  view.appendChild(tasksTitle);

  // Generate tasks based on plan
  const itemsPerDay = Math.max(2, Math.floor(plan.dailyMinutes / 10));
  const tasks = generateTodayTasks(state.level, itemsPerDay);

  const tasksBox = document.createElement("div");
  tasksBox.className = "card-grid";

  let completedCount = 0;

  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.cursor = "pointer";
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.gap = "12px";

    const isDone = dailyLog[task.id] || false;
    if (isDone) completedCount++;

    card.innerHTML =
      "<div style='font-size:1.8rem'>" + task.icon + "</div>" +
      "<div style='flex:1'>" +
        "<div style='font-weight:600; font-size:.9rem'>" + task.label + "</div>" +
        "<div style='font-size:.75rem; color:#64748b; margin-top:2px'>" + task.description + "</div>" +
      "</div>" +
      "<div style='font-size:1.3rem'>" + (isDone ? "✅" : "⏳") + "</div>";

    if (isDone) {
      card.style.background = "#f0fdf4";
      card.style.borderColor = "#16a34a";
    }

    card.addEventListener("click", () => {
      logDailyTask(today, task.id, !isDone);
      renderToday(view);
    });

    tasksBox.appendChild(card);
  });

  view.appendChild(tasksBox);

  // Progress of the day
  const progressBox = document.createElement("div");
  progressBox.style.marginTop = "20px";
  progressBox.style.padding = "16px";
  progressBox.style.background = "#f1f5f9";
  progressBox.style.borderRadius = "10px";

  const progressTitle = document.createElement("div");
  progressTitle.style.fontWeight = "bold";
  progressTitle.style.marginBottom = "8px";
  progressTitle.textContent = "Today: " + completedCount + "/" + tasks.length + " completed";
  progressBox.appendChild(progressTitle);

  const bar = document.createElement("div");
  bar.style.height = "10px";
  bar.style.background = "#e2e8f0";
  bar.style.borderRadius = "5px";
  bar.style.overflow = "hidden";

  const fill = document.createElement("div");
  const pct = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  fill.style.height = "100%";
  fill.style.width = pct + "%";
  fill.style.background = pct === 100 ? "#16a34a" : "linear-gradient(90deg, #2563eb, #1e40af)";
  fill.style.transition = "width .3s";
  bar.appendChild(fill);
  progressBox.appendChild(bar);

  if (pct === 100) {
    const done = document.createElement("div");
    done.style.marginTop = "12px";
    done.style.color = "#16a34a";
    done.style.fontWeight = "bold";
    done.textContent = "🎉 Well done! You finished today's plan.";
    progressBox.appendChild(done);
  }

  view.appendChild(progressBox);

  // Action buttons
  const actions = document.createElement("div");
  actions.style.marginTop = "20px";
  actions.style.display = "flex";
  actions.style.gap = "10px";
  actions.style.flexWrap = "wrap";

  const startBtn = document.createElement("button");
  startBtn.className = "btn btn--primary";
  startBtn.textContent = "Go to Fundamentals";
  startBtn.addEventListener("click", () => {
    navigate("fundamentals");
  });
  actions.appendChild(startBtn);

  const configBtn = document.createElement("button");
  configBtn.className = "btn btn--ghost";
  configBtn.textContent = "Edit my plan";
  configBtn.addEventListener("click", () => {
    navigate("onboarding");
  });
  actions.appendChild(configBtn);

  view.appendChild(actions);
}

function generateTodayTasks(level, count) {
  const pools = {
    a2: {
      grammar: [
        "Unit 1 - Introducing yourself",
        "Unit 2 - Daily routines",
        "Unit 3 - Here and now",
        "Unit 4 - Past and storytelling",
        "Unit 5 - Plans and future"
      ],
      comprehension: [
        "Reading - Public signs",
        "Reading - An email from a friend",
        "Listening - At the train station",
        "Listening - A phone call"
      ],
      production: [
        "Writing - Email to a friend",
        "Writing - A short story",
        "Speaking - Personal information",
        "Speaking - Your daily routine"
      ]
    }
  };

  const pool = pools[level] || pools.a2;
  const tasks = [];

  // 1 gramatica
  tasks.push({
    id: "grammar-1",
    icon: "📖",
    label: pool.grammar[0],
    description: "Complete the full unit with exercises"
  });

  // 1 comprehension
  if (count >= 2) {
    tasks.push({
      id: "comprehension-1",
      icon: "📚",
      label: pool.comprehension[0],
      description: "Read or listen and answer the questions"
    });
  }

  // 1 production
  if (count >= 3) {
    tasks.push({
      id: "production-1",
      icon: "✍️",
      label: pool.production[0],
      description: "Write or record your answer"
    });
  }

  // Extra task if more time
  if (count >= 4) {
    tasks.push({
      id: "comprehension-2",
      icon: "🎧",
      label: pool.comprehension[2],
      description: "Extra listening practice"
    });
  }

  return tasks;
}
