// Home: attractive presentation of the current level.
import { getState } from "../state.js";
import { toCambridgeScale } from "../core/scoring.js";

const LEVEL_INFO = {
  a2: {
    name: "A2 Key",
    tagline: "Your first step to English fluency",
    description: "The A2 Key (also called KET) is the basic level Cambridge English exam. It shows that you can use English to communicate in simple everyday situations.",
    structure: [
      ["Reading & Writing", "50%", "1 hour"],
      ["Listening", "25%", "30 minutes"],
      ["Speaking", "25%", "8-10 minutes"]
    ],
    grammarCount: 15,
    vocabularyCount: 11,
    skills: {
      reading: { count: 15, desc: "Signs, emails, notices, letters and articles" },
      listening: { count: 10, desc: "Conversations, phone calls, announcements" },
      writing: { count: 8, desc: "Emails, notes and short stories" },
      speaking: { count: 10, desc: "Interview, picture description, discussion" }
    },
    goals: [
      "Communicate in simple everyday situations",
      "Describe people, places and experiences",
      "Talk about your daily life and past events",
      "Understand simple texts and conversations"
    ]
  },
  b1: {
    name: "B1 Preliminary",
    tagline: "Speak with confidence in everyday situations",
    description: "The B1 Preliminary (also called PET) shows that you can use English to deal with everyday situations and express opinions on familiar topics.",
    structure: [
      ["Reading", "25%", "45 minutes"],
      ["Writing", "25%", "45 minutes"],
      ["Listening", "25%", "30 minutes"],
      ["Speaking", "25%", "10-12 minutes"]
    ],
    grammarCount: 10,
    vocabularyCount: 10,
    skills: {
      reading: { count: 12, desc: "Articles, emails and notices" },
      listening: { count: 10, desc: "Interviews, conversations and monologues" },
      writing: { count: 10, desc: "Emails with notes, articles and stories" },
      speaking: { count: 12, desc: "Interview, picture description, discussion, negotiation" }
    },
    goals: [
      "Deal with everyday situations",
      "Express opinions on familiar topics",
      "Tell stories with detail",
      "Understand the main points of clear texts"
    ]
  },
  b2: {
    name: "B2 First",
    tagline: "Use English confidently in complex situations",
    description: "The B2 First (also called FCE) shows that you can use English confidently in complex situations, both personal and professional.",
    structure: [
      ["Reading & Use of English", "40%", "1h 15min"],
      ["Writing", "20%", "1h 20min"],
      ["Listening", "20%", "40 minutes"],
      ["Speaking", "20%", "14 minutes"]
    ],
    grammarCount: 10,
    vocabularyCount: 10,
    skills: {
      reading: { count: 10, desc: "Articles on current affairs" },
      listening: { count: 8, desc: "Lectures, interviews and radio programmes" },
      writing: { count: 10, desc: "Essays, reviews, reports, articles, formal emails" },
      speaking: { count: 12, desc: "Interview, photo comparison, discussion, negotiation" }
    },
    goals: [
      "Express yourself fluently and spontaneously",
      "Produce clear and detailed texts",
      "Understand complex written and spoken English",
      "Argue and defend your point of view"
    ]
  }
};

export function renderHome(view) {
  const { level } = getState();
  const info = LEVEL_INFO[level] || LEVEL_INFO.a2;

  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  view.innerHTML = "";

  // Hero
  const hero = document.createElement("div");
  hero.style.background = "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
  hero.style.color = "#fff";
  hero.style.padding = "14px 20px";
  hero.style.borderRadius = "12px";
  hero.style.marginBottom = "16px";
  hero.style.display = "flex";
  hero.style.justifyContent = "space-between";
  hero.style.alignItems = "center";
  hero.style.flexWrap = "wrap";
  hero.style.gap = "16px";

  const heroLeft = document.createElement("div");
  const h1 = document.createElement("h1");
  h1.textContent = info.name;
  h1.style.fontSize = "1.4rem";
  h1.style.marginBottom = "4px";
  heroLeft.appendChild(h1);

  const tagline = document.createElement("p");
  tagline.textContent = info.tagline;
  tagline.style.fontSize = ".9rem";
  tagline.style.opacity = ".95";
  heroLeft.appendChild(tagline);
  hero.appendChild(heroLeft);

  const score = toCambridgeScale(level, 0);
  const stats = document.createElement("div");
  stats.style.display = "flex";
  stats.style.gap = "10px";

  [
    ["Progress", "0%"],
    ["Scale", String(score)],
    ["Pass", level === "a2" ? "120" : (level === "b1" ? "140" : "160")]
  ].forEach(([label, value]) => {
    const box = document.createElement("div");
    box.style.background = "rgba(255,255,255,0.18)";
    box.style.padding = "6px 12px";
    box.style.borderRadius = "8px";
    box.style.textAlign = "center";
    box.innerHTML = "<div style='font-size:.65rem; opacity:.85'>" + label + "</div><div style='font-size:1rem; font-weight:bold'>" + value + "</div>";
    stats.appendChild(box);
  });
  const heroRight = document.createElement("div");
  heroRight.style.display = "flex";
  heroRight.style.alignItems = "center";
  heroRight.style.gap = "16px";
  heroRight.appendChild(stats);

  const heroStartBtn = document.createElement("button");
  heroStartBtn.textContent = "Start learning →";
  heroStartBtn.style.padding = "10px 18px";
  heroStartBtn.style.fontSize = ".9rem";
  heroStartBtn.style.fontWeight = "bold";
  heroStartBtn.style.background = "#fff";
  heroStartBtn.style.color = "#2563eb";
  heroStartBtn.style.border = "2px solid #fff";
  heroStartBtn.style.borderRadius = "8px";
  heroStartBtn.style.whiteSpace = "nowrap";
  heroStartBtn.style.cursor = "pointer";
  heroStartBtn.style.boxShadow = "0 4px 12px rgba(0,0,0,.15)";
  heroStartBtn.addEventListener("click", () => {
    const navBtn = document.querySelector('[data-route="fundamentals"]');
    if (navBtn) navBtn.click();
  });
  heroRight.appendChild(heroStartBtn);

  hero.appendChild(heroRight);
  view.appendChild(hero);

  // Descripcion
  const desc = document.createElement("p");
  desc.style.lineHeight = "1.6";
  desc.style.marginBottom = "16px";
  desc.style.fontSize = ".9rem";
  desc.style.color = "#475569";
  desc.textContent = info.description;
  view.appendChild(desc);

  // Titulo
  const learnTitle = document.createElement("h2");
  learnTitle.textContent = "What you will learn";
  learnTitle.style.marginTop = "0";
  learnTitle.style.marginBottom = "12px";
  learnTitle.style.fontSize = "1.1rem";
  view.appendChild(learnTitle);

  // Grid responsive: 2 columns on tablet, more on desktop
  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))";
  grid.style.gap = "12px";

  const cards = [
    { icon: "📖", title: "Grammar", count: info.grammarCount + " units", desc: "Step-by-step grammar with tables and examples" },
    { icon: "📝", title: "Vocabulary", count: info.vocabularyCount + " topics", desc: "Word lists with examples and translations" },
    { icon: "📚", title: "Reading", count: info.skills.reading.count + " texts", desc: info.skills.reading.desc },
    { icon: "🎧", title: "Listening", count: info.skills.listening.count + " audios", desc: info.skills.listening.desc },
    { icon: "✍️", title: "Writing", count: info.skills.writing.count + " tasks", desc: info.skills.writing.desc },
    { icon: "🗣️", title: "Speaking", count: info.skills.speaking.count + " prompts", desc: info.skills.speaking.desc }
  ];

  cards.forEach(c => {
    const card = document.createElement("div");
    card.style.padding = "14px";
    card.style.border = "1px solid #e2e8f0";
    card.style.borderRadius = "10px";
    card.style.background = "#fff";
    card.style.transition = "transform .15s, border-color .15s, box-shadow .15s";
    card.style.cursor = "default";

    card.addEventListener("mouseenter", () => {
      card.style.borderColor = "#2563eb";
      card.style.transform = "translateY(-2px)";
      card.style.boxShadow = "0 6px 16px rgba(37,99,235,.15)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.borderColor = "#e2e8f0";
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "none";
    });

    card.innerHTML = "<div style='font-size:1.5rem'>" + c.icon + "</div>" +
      "<h3 style='margin: 6px 0 2px 0; font-size:.95rem'>" + c.title + "</h3>" +
      "<div style='color:#2563eb; font-weight:bold; font-size:.8rem'>" + c.count + "</div>" +
      "<p style='color:#64748b; font-size:.75rem; margin-top:6px; line-height:1.4'>" + c.desc + "</p>";

    grid.appendChild(card);
  });

  view.appendChild(grid);

  // Fila inferior responsive: 2 columnas en desktop, 1 en tablet
  const bottomRow = document.createElement("div");
  bottomRow.style.display = "grid";
  bottomRow.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
  bottomRow.style.gap = "20px";
  bottomRow.style.marginTop = "20px";
  bottomRow.style.alignItems = "start";

  // Exam structure
  const structCol = document.createElement("div");
  const structTitle = document.createElement("h2");
  structTitle.textContent = "Exam structure";
  structTitle.style.fontSize = "1rem";
  structTitle.style.marginBottom = "10px";
  structCol.appendChild(structTitle);

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.fontSize = ".8rem";

  info.structure.forEach(row => {
    const tr = document.createElement("tr");
    [row[0], row[1], row[2]].forEach((cell, idx) => {
      const td = document.createElement("td");
      td.textContent = cell;
      td.style.padding = "6px 8px";
      td.style.borderBottom = "1px solid #e2e8f0";
      if (idx === 1) {
        td.style.textAlign = "right";
        td.style.fontWeight = "bold";
        td.style.color = "#2563eb";
      } else if (idx === 2) {
        td.style.textAlign = "right";
        td.style.color = "#64748b";
      }
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  structCol.appendChild(table);
  bottomRow.appendChild(structCol);

  // Goals + Start button on the right
  const goalCol = document.createElement("div");
  const goalTitle = document.createElement("h2");
  goalTitle.textContent = "By the end you will...";
  goalTitle.style.fontSize = "1rem";
  goalTitle.style.marginBottom = "10px";
  goalCol.appendChild(goalTitle);

  const goalsRow = document.createElement("div");
  goalsRow.style.display = "flex";
  goalsRow.style.gap = "16px";
  goalsRow.style.alignItems = "center";
  goalsRow.style.flexWrap = "wrap";

  const goalBox = document.createElement("div");
  goalBox.style.background = "#f0fdf4";
  goalBox.style.borderLeft = "3px solid #16a34a";
  goalBox.style.padding = "12px 14px";
  goalBox.style.borderRadius = "8px";
  goalBox.style.lineHeight = "1.5";
  goalBox.style.flex = "1";
  goalBox.style.minWidth = "200px";

  info.goals.forEach(g => {
    const p = document.createElement("p");
    p.textContent = "✓ " + g;
    p.style.color = "#166534";
    p.style.fontSize = ".8rem";
    p.style.marginBottom = "5px";
    goalBox.appendChild(p);
  });
  goalsRow.appendChild(goalBox);


  goalCol.appendChild(goalsRow);
  bottomRow.appendChild(goalCol);

  view.appendChild(bottomRow);

  // Boton Start inferior alineado a la derecha
  const bottomBar = document.createElement("div");
  bottomBar.style.display = "flex";
  bottomBar.style.justifyContent = "flex-end";
  bottomBar.style.marginTop = "24px";

  const startBtnBottom = document.createElement("button");
  startBtnBottom.className = "btn btn--primary";
  startBtnBottom.textContent = "Start learning →";
  startBtnBottom.style.padding = "12px 28px";
  startBtnBottom.style.fontSize = "1rem";
  startBtnBottom.style.fontWeight = "bold";
  startBtnBottom.addEventListener("click", () => {
    const navBtn = document.querySelector('[data-route="fundamentals"]');
    if (navBtn) navBtn.click();
  });
  bottomBar.appendChild(startBtnBottom);
  view.appendChild(bottomBar);
}
