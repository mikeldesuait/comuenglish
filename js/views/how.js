// How it works: compact horizontal pitch.
export function renderHow(view) {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  view.innerHTML = "";
  view.style.padding = "0";

  const container = document.createElement("div");
  container.style.maxWidth = "1080px";
  container.style.margin = "40px auto";
  container.style.padding = "0 24px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "40px";

  // ============================================================
  // HERO
  // ============================================================
  const hero = document.createElement("div");
  hero.style.textAlign = "center";

  const h1 = document.createElement("h1");
  h1.textContent = "How it works";
  h1.style.fontSize = "2.5rem";
  h1.style.fontWeight = "900";
  h1.style.color = "#0f172a";
  h1.style.letterSpacing = "-1.5px";
  h1.style.marginBottom = "12px";
  hero.appendChild(h1);

  const sub = document.createElement("p");
  sub.textContent = "Most apps give you exercises. That's it. ComuEnglish gives you a system.";
  sub.style.fontSize = "1.15rem";
  sub.style.color = "#64748b";
  sub.style.maxWidth = "700px";
  sub.style.margin = "0 auto";
  sub.style.lineHeight = "1.6";
  hero.appendChild(sub);

  container.appendChild(hero);

  // ============================================================
  // 3 STEPS (horizontal)
  // ============================================================
  const stepsRow = document.createElement("div");
  stepsRow.style.display = "grid";
  stepsRow.style.gridTemplateColumns = "repeat(3, 1fr)";
  stepsRow.style.gap = "20px";

  const steps = [
    {
      num: "1",
      title: "Set up your plan",
      desc: "Choose level and exam date. We calculate your daily minutes automatically."
    },
    {
      num: "2",
      title: "Study 3 times",
      desc: "All content divided into 3 passes: learn, review, consolidate."
    },
    {
      num: "3",
      title: "Get AI feedback",
      desc: "Write or speak. Our AI corrects you in seconds with CEFR rubric."
    }
  ];

  steps.forEach(step => {
    const card = document.createElement("div");
    card.style.background = "#fff";
    card.style.border = "1px solid #e2e8f0";
    card.style.borderRadius = "14px";
    card.style.padding = "24px";
    card.style.textAlign = "center";
    card.style.transition = "all .15s";

    card.addEventListener("mouseenter", () => {
      card.style.borderColor = "#f97316";
      card.style.transform = "translateY(-3px)";
      card.style.boxShadow = "0 12px 28px rgba(249,115,22,.15)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.borderColor = "#e2e8f0";
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "none";
    });

    const num = document.createElement("div");
    num.textContent = step.num;
    num.style.width = "48px";
    num.style.height = "48px";
    num.style.borderRadius = "50%";
    num.style.background = "#f97316";
    num.style.color = "#fff";
    num.style.display = "flex";
    num.style.alignItems = "center";
    num.style.justifyContent = "center";
    num.style.fontSize = "1.3rem";
    num.style.fontWeight = "900";
    num.style.margin = "0 auto 16px";
    card.appendChild(num);

    const title = document.createElement("div");
    title.textContent = step.title;
    title.style.fontSize = "1.1rem";
    title.style.fontWeight = "700";
    title.style.color = "#0f172a";
    title.style.marginBottom = "8px";
    card.appendChild(title);

    const desc = document.createElement("div");
    desc.textContent = step.desc;
    desc.style.fontSize = ".9rem";
    desc.style.color = "#64748b";
    desc.style.lineHeight = "1.6";
    card.appendChild(desc);

    stepsRow.appendChild(card);
  });

  container.appendChild(stepsRow);

  // ============================================================
  // COMPARISON
  // ============================================================
  const compTitle = document.createElement("h2");
  compTitle.textContent = "ComuEnglish vs other apps";
  compTitle.style.fontSize = "1.5rem";
  compTitle.style.fontWeight = "800";
  compTitle.style.color = "#0f172a";
  compTitle.style.textAlign = "center";
  compTitle.style.marginBottom = "4px";
  container.appendChild(compTitle);

  const compSub = document.createElement("p");
  compSub.textContent = "Why students choose us";
  compSub.style.fontSize = ".9rem";
  compSub.style.color = "#64748b";
  compSub.style.textAlign = "center";
  compSub.style.marginBottom = "20px";
  container.appendChild(compSub);

  const compGrid = document.createElement("div");
  compGrid.style.display = "grid";
  compGrid.style.gridTemplateColumns = "1fr 1fr";
  compGrid.style.gap = "16px";

  // Columna "otras apps"
  const otherCol = document.createElement("div");
  otherCol.style.background = "#f8fafc";
  otherCol.style.borderRadius = "14px";
  otherCol.style.padding = "24px";
  otherCol.style.border = "1px solid #e2e8f0";

  const otherTitle = document.createElement("div");
  otherTitle.textContent = "OTHER APPS";
  otherTitle.style.fontSize = ".75rem";
  otherTitle.style.fontWeight = "700";
  otherTitle.style.letterSpacing = "1px";
  otherTitle.style.color = "#94a3b8";
  otherTitle.style.marginBottom = "16px";
  otherCol.appendChild(otherTitle);

  const otherItems = [
    "Just exercises",
    "No personal plan",
    "No feedback",
    "You quit in 2 weeks"
  ];

  otherItems.forEach(item => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "10px";
    row.style.padding = "8px 0";
    row.style.fontSize = ".95rem";
    row.style.color = "#64748b";
    row.innerHTML = "<span style='color:#cbd5e1; font-weight:bold'>✕</span>" + item;
    otherCol.appendChild(row);
  });

  compGrid.appendChild(otherCol);

  // Columna "ComuEnglish"
  const usCol = document.createElement("div");
  usCol.style.background = "#fff7ed";
  usCol.style.borderRadius = "14px";
  usCol.style.padding = "24px";
  usCol.style.border = "2px solid #f97316";

  const usTitle = document.createElement("div");
  usTitle.textContent = "COMUENGLISH";
  usTitle.style.fontSize = ".75rem";
  usTitle.style.fontWeight = "700";
  usTitle.style.letterSpacing = "1px";
  usTitle.style.color = "#f97316";
  usTitle.style.marginBottom = "16px";
  usCol.appendChild(usTitle);

  const usItems = [
    "Complete system (grammar + skills + mocks)",
    "Personal calendar for your exam",
    "AI feedback on writing and speaking",
    "You finish the exam"
  ];

  usItems.forEach(item => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "10px";
    row.style.padding = "8px 0";
    row.style.fontSize = ".95rem";
    row.style.color = "#0f172a";
    row.style.fontWeight = "500";
    row.innerHTML = "<span style='color:#10b981; font-weight:bold'>✓</span>" + item;
    usCol.appendChild(row);
  });

  compGrid.appendChild(usCol);
  container.appendChild(compGrid);

  // ============================================================
  // CTA
  // ============================================================
  const cta = document.createElement("div");
  cta.style.background = "#0f172a";
  cta.style.color = "#fff";
  cta.style.borderRadius = "14px";
  cta.style.padding = "28px 32px";
  cta.style.display = "flex";
  cta.style.alignItems = "center";
  cta.style.justifyContent = "space-between";
  cta.style.gap = "24px";
  cta.style.flexWrap = "wrap";

  const ctaText = document.createElement("div");
  ctaText.style.flex = "1";
  ctaText.style.minWidth = "280px";

  const ctaTitle = document.createElement("div");
  ctaTitle.textContent = "Ready to start?";
  ctaTitle.style.fontSize = "1.5rem";
  ctaTitle.style.fontWeight = "900";
  ctaTitle.style.marginBottom = "4px";
  ctaTitle.style.letterSpacing = "-0.5px";
  ctaText.appendChild(ctaTitle);

  const ctaSub = document.createElement("div");
  ctaSub.textContent = "Set up your plan in 2 minutes.";
  ctaSub.style.fontSize = ".95rem";
  ctaSub.style.opacity = ".75";
  ctaText.appendChild(ctaSub);

  cta.appendChild(ctaText);

  const ctaBtn = document.createElement("button");
  ctaBtn.textContent = "Start learning free →";
  ctaBtn.style.padding = "14px 32px";
  ctaBtn.style.background = "#f97316";
  ctaBtn.style.color = "#fff";
  ctaBtn.style.border = "none";
  ctaBtn.style.borderRadius = "999px";
  ctaBtn.style.fontSize = "1rem";
  ctaBtn.style.fontWeight = "700";
  ctaBtn.style.cursor = "pointer";
  ctaBtn.style.transition = "all .15s";
  ctaBtn.style.whiteSpace = "nowrap";

  ctaBtn.addEventListener("mouseenter", () => {
    ctaBtn.style.background = "#ea580c";
    ctaBtn.style.transform = "scale(1.03)";
  });
  ctaBtn.addEventListener("mouseleave", () => {
    ctaBtn.style.background = "#f97316";
    ctaBtn.style.transform = "scale(1)";
  });
  ctaBtn.addEventListener("click", () => {
    import("../router.js").then(m => m.navigate("onboarding"));
  });
  cta.appendChild(ctaBtn);

  container.appendChild(cta);

  view.appendChild(container);
}
