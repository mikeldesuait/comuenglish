// How it works: compact with embedded slideshow.
export function renderHow(view) {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  view.innerHTML = "";
  view.style.padding = "0";
  document.body.style.background = "#fffbf5";

  const container = document.createElement("div");
  container.style.maxWidth = "1080px";
  container.style.margin = "20px auto";
  container.style.padding = "0 20px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "24px";

  // ============================================================
  // HEADER
  // ============================================================
  const header = document.createElement("div");
  header.style.textAlign = "center";

  const h1 = document.createElement("h1");
  h1.textContent = "How it works";
  h1.style.fontSize = "3rem";
  h1.style.fontWeight = "900";
  h1.style.color = "#0f172a";
  h1.style.letterSpacing = "-2px";
  h1.style.marginBottom = "8px";
  header.appendChild(h1);

  const sub = document.createElement("p");
  sub.textContent = "Most apps give you exercises. ComuEnglish gives you a system.";
  sub.style.fontSize = "1rem";
  sub.style.color = "#64748b";
  sub.style.maxWidth = "700px";
  sub.style.margin = "0 auto";
  header.appendChild(sub);

  container.appendChild(header);

  // ============================================================
  // SLIDESHOW (compacto)
  // ============================================================
  const slideshowWrapper = document.createElement("div");
  slideshowWrapper.style.width = "100%";
  slideshowWrapper.style.maxWidth = "440px";
  slideshowWrapper.style.aspectRatio = "16 / 9";
  slideshowWrapper.style.margin = "0 auto";
  slideshowWrapper.style.background = "#fff";
  slideshowWrapper.style.borderRadius = "14px";
  slideshowWrapper.style.position = "relative";
  slideshowWrapper.style.overflow = "hidden";
  slideshowWrapper.style.border = "1px solid #f1f5f9";
  slideshowWrapper.style.boxShadow = "0 12px 32px rgba(15,23,42,.08)";

  // Definir slides
  const slidesData = [
    {
      icon: "👋",
      title: "Welcome to ComuEnglish",
      desc: "Your personal English coach",
      bg: "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)"
    },
    {
      icon: "🎯",
      title: "Set up your plan",
      desc: "Choose level, exam date and days per week",
      bg: "linear-gradient(180deg, #fef3c7 0%, #ffffff 100%)"
    },
    {
      icon: "📅",
      title: "Personal calendar",
      desc: "3 passes until your exam date",
      bg: "linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)"
    },
    {
      icon: "📚",
      title: "Study every skill",
      desc: "Grammar, reading, listening, writing, speaking",
      bg: "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)"
    },
    {
      icon: "🤖",
      title: "Get AI feedback",
      desc: "We correct your writing and speaking in seconds",
      bg: "linear-gradient(180deg, #fce7f3 0%, #ffffff 100%)"
    },
    {
      icon: "📊",
      title: "Track your progress",
      desc: "Real metrics. Know exactly where you stand.",
      bg: "linear-gradient(180deg, #ede9fe 0%, #ffffff 100%)"
    },
    {
      icon: "🏆",
      title: "Pass the exam",
      desc: "With margin. Because you prepared properly.",
      bg: "linear-gradient(180deg, #fff7ed 0%, #fef3c7 100%)"
    }
  ];

  slidesData.forEach((slide, i) => {
    const el = document.createElement("div");
    el.className = "how-slide" + (i === 0 ? " is-active" : "");
    el.dataset.index = i;
    el.style.position = "absolute";
    el.style.inset = "0";
    el.style.display = "flex";
    el.style.flexDirection = "column";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.padding = "20px";
    el.style.textAlign = "center";
    el.style.opacity = i === 0 ? "1" : "0";
    el.style.transform = i === 0 ? "translateY(0)" : "translateY(15px)";
    el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    el.style.pointerEvents = i === 0 ? "auto" : "none";
    el.style.background = slide.bg;

    const icon = document.createElement("div");
    icon.textContent = slide.icon;
    icon.style.fontSize = "3.5rem";
    icon.style.marginBottom = "8px";
    icon.style.animation = "howIconFloat 3s ease-in-out infinite";
    el.appendChild(icon);

    const title = document.createElement("div");
    title.textContent = slide.title;
    title.style.fontSize = "1.4rem";
    title.style.fontWeight = "800";
    title.style.color = "#0f172a";
    title.style.marginBottom = "4px";
    el.appendChild(title);

    const desc = document.createElement("div");
    desc.textContent = slide.desc;
    desc.style.fontSize = "1rem";
    desc.style.color = "#64748b";
    desc.style.maxWidth = "460px";
    desc.style.lineHeight = "1.4";
    el.appendChild(desc);

    slideshowWrapper.appendChild(el);
  });

  // Indicadores (puntos)
  const indicators = document.createElement("div");
  indicators.style.position = "absolute";
  indicators.style.bottom = "12px";
  indicators.style.left = "0";
  indicators.style.right = "0";
  indicators.style.display = "flex";
  indicators.style.justifyContent = "center";
  indicators.style.gap = "6px";
  indicators.style.zIndex = "10";

  slidesData.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "how-dot" + (i === 0 ? " is-active" : "");
    dot.dataset.index = i;
    dot.style.width = "6px";
    dot.style.height = "6px";
    dot.style.borderRadius = "50%";
    dot.style.background = i === 0 ? "#f97316" : "#cbd5e1";
    dot.style.border = "none";
    dot.style.padding = "0";
    dot.style.cursor = "pointer";
    dot.style.transition = "all .3s";
    indicators.appendChild(dot);
  });

  slideshowWrapper.appendChild(indicators);

  container.appendChild(slideshowWrapper);

  // Iniciar el slideshow
  startSlideshow(slideshowWrapper, slidesData.length);

  // ============================================================
  // 3 STEPS (compactos)
  // ============================================================
  const stepsRow = document.createElement("div");
  stepsRow.style.display = "grid";
  stepsRow.style.gridTemplateColumns = "repeat(3, 1fr)";
  stepsRow.style.gap = "12px";

  const steps = [
    { num: "1", title: "Set up plan", desc: "Choose level and exam date. We calculate daily minutes." },
    { num: "2", title: "Study 3 times", desc: "Content divided into learn, review, consolidate." },
    { num: "3", title: "Get feedback", desc: "AI corrects you with CEFR rubric." }
  ];

  steps.forEach(step => {
    const card = document.createElement("div");
    card.style.background = "#fff";
    card.style.border = "1px solid #e2e8f0";
    card.style.borderRadius = "10px";
    card.style.padding = "14px 16px";
    card.style.textAlign = "center";
    card.style.transition = "all .15s";

    card.addEventListener("mouseenter", () => {
      card.style.borderColor = "#f97316";
      card.style.transform = "translateY(-2px)";
      card.style.boxShadow = "0 8px 20px rgba(249,115,22,.12)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.borderColor = "#e2e8f0";
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "none";
    });

    const num = document.createElement("div");
    num.textContent = step.num;
    num.style.width = "28px";
    num.style.height = "28px";
    num.style.borderRadius = "50%";
    num.style.background = "#f97316";
    num.style.color = "#fff";
    num.style.display = "flex";
    num.style.alignItems = "center";
    num.style.justifyContent = "center";
    num.style.fontSize = ".85rem";
    num.style.fontWeight = "900";
    num.style.margin = "0 auto 8px";
    card.appendChild(num);

    const title = document.createElement("div");
    title.textContent = step.title;
    title.style.fontSize = ".9rem";
    title.style.fontWeight = "700";
    title.style.color = "#0f172a";
    title.style.marginBottom = "2px";
    card.appendChild(title);

    const desc = document.createElement("div");
    desc.textContent = step.desc;
    desc.style.fontSize = ".75rem";
    desc.style.color = "#64748b";
    desc.style.lineHeight = "1.4";
    card.appendChild(desc);

    stepsRow.appendChild(card);
  });

  container.appendChild(stepsRow);

  // ============================================================
  // CTA
  // ============================================================
  const cta = document.createElement("div");
  cta.style.background = "linear-gradient(135deg, #f97316 0%, #ea580c 100%)";
  cta.style.color = "#fff";
  cta.style.borderRadius = "12px";
  cta.style.padding = "18px 24px";
  cta.style.display = "flex";
  cta.style.alignItems = "center";
  cta.style.justifyContent = "space-between";
  cta.style.gap = "16px";
  cta.style.flexWrap = "wrap";
  cta.style.boxShadow = "0 10px 24px rgba(249,115,22,.2)";

  const ctaText = document.createElement("div");
  ctaText.style.flex = "1";
  ctaText.style.minWidth = "200px";

  const ctaTitle = document.createElement("div");
  ctaTitle.textContent = "Ready to start?";
  ctaTitle.style.fontSize = "1.1rem";
  ctaTitle.style.fontWeight = "900";
  ctaTitle.style.marginBottom = "2px";
  ctaText.appendChild(ctaTitle);

  const ctaSub = document.createElement("div");
  ctaSub.textContent = "Set up your plan in 2 minutes.";
  ctaSub.style.fontSize = ".85rem";
  ctaSub.style.opacity = ".85";
  ctaText.appendChild(ctaSub);

  cta.appendChild(ctaText);

  const ctaBtn = document.createElement("button");
  ctaBtn.textContent = "Start free →";
  ctaBtn.style.padding = "10px 22px";
  ctaBtn.style.background = "#fff";
  ctaBtn.style.color = "#ea580c";
  ctaBtn.style.border = "none";
  ctaBtn.style.borderRadius = "999px";
  ctaBtn.style.fontSize = ".9rem";
  ctaBtn.style.fontWeight = "700";
  ctaBtn.style.cursor = "pointer";
  ctaBtn.style.transition = "all .15s";
  ctaBtn.style.whiteSpace = "nowrap";

  ctaBtn.addEventListener("mouseenter", () => {
    ctaBtn.style.transform = "scale(1.05)";
  });
  ctaBtn.addEventListener("mouseleave", () => {
    ctaBtn.style.transform = "scale(1)";
  });
  ctaBtn.addEventListener("click", () => {
    import("../router.js").then(m => m.navigate("onboarding"));
  });
  cta.appendChild(ctaBtn);

  container.appendChild(cta);

  view.appendChild(container);
}

// ============================================================
// SLIDESHOW LOGIC
// ============================================================
function startSlideshow(wrapper, totalSlides) {
  const SLIDE_DURATION = 3000;
  let currentSlide = 0;

  const slides = wrapper.querySelectorAll(".how-slide");
  const dots = wrapper.querySelectorAll(".how-dot");

  function goToSlide(index) {
    slides[currentSlide].style.opacity = "0";
    slides[currentSlide].style.transform = "translateY(15px)";
    slides[currentSlide].style.pointerEvents = "none";
    dots[currentSlide].style.background = "#cbd5e1";
    dots[currentSlide].style.width = "6px";
    dots[currentSlide].style.borderRadius = "50%";

    currentSlide = index;

    slides[currentSlide].style.opacity = "1";
    slides[currentSlide].style.transform = "translateY(0)";
    slides[currentSlide].style.pointerEvents = "auto";
    dots[currentSlide].style.background = "#f97316";
    dots[currentSlide].style.width = "18px";
    dots[currentSlide].style.borderRadius = "3px";
  }

  dots[0].style.width = "18px";
  dots[0].style.borderRadius = "3px";

  setInterval(() => {
    goToSlide((currentSlide + 1) % totalSlides);
  }, SLIDE_DURATION);
}

// Inyectar animacion global para el icono
if (!document.getElementById("how-animations")) {
  const style = document.createElement("style");
  style.id = "how-animations";
  style.textContent = `
    @keyframes howIconFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
  `;
  document.head.appendChild(style);
}
