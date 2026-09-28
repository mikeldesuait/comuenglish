// Home: vibrant landing with hidden visual elements.
import { getState } from "../state.js";

export function renderHome(view) {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  view.innerHTML = "";
  view.style.padding = "0";

  document.body.style.background = "#fffbf5";

  // ============================================================
  // BLOBS DE COLOR
  // ============================================================
  const blobs = [
    { w: "500px", h: "500px", bg: "#fed7aa", top: "-200px", left: "-150px", delay: "0s" },
    { w: "400px", h: "400px", bg: "#fecaca", top: "50%", right: "-200px", delay: "0s" },
    { w: "350px", h: "350px", bg: "#fef3c7", bottom: "-150px", left: "40%", delay: "0s" }
  ];

  blobs.forEach(b => {
    const blob = document.createElement("div");
    blob.style.position = "fixed";
    blob.style.borderRadius = "50%";
    blob.style.filter = "blur(80px)";
    blob.style.opacity = "0.55";
    blob.style.pointerEvents = "none";
    blob.style.zIndex = "0";
    blob.style.width = b.w;
    blob.style.height = b.h;
    blob.style.background = b.bg;
    if (b.top) blob.style.top = b.top;
    if (b.bottom) blob.style.bottom = b.bottom;
    if (b.left) blob.style.left = b.left;
    if (b.right) blob.style.right = b.right;
    blob.style.animation = "blobMove 25s ease-in-out infinite";
    view.appendChild(blob);
  });

  // ============================================================
  // ICONOS OCULTOS
  // ============================================================
  const ghosts = [
    { emoji: "📚", top: "12%", left: "8%", size: "5rem", opacity: "0.07" },
    { emoji: "🎓", top: "22%", right: "10%", size: "4rem", opacity: "0.07" },
    { emoji: "✏️", top: "45%", left: "5%", size: "4.5rem", opacity: "0.07" },
    { emoji: "☕", top: "55%", right: "6%", size: "5.5rem", opacity: "0.07" },
    { emoji: "🏆", bottom: "18%", left: "12%", size: "4rem", opacity: "0.07" },
    { emoji: "🚀", bottom: "12%", right: "12%", size: "4.5rem", opacity: "0.07" },
    { emoji: "🌍", top: "35%", left: "48%", size: "6rem", opacity: "0.04" },
    { emoji: "⭐", bottom: "30%", right: "35%", size: "3.5rem", opacity: "0.07" }
  ];

  ghosts.forEach(g => {
    const ghost = document.createElement("div");
    ghost.textContent = g.emoji;
    ghost.style.position = "fixed";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "0";
    ghost.style.opacity = g.opacity;
    ghost.style.fontSize = g.size;
    ghost.style.filter = "saturate(0.5)";
    ghost.style.animation = "ghostFloat 10s ease-in-out infinite";
    if (g.top) ghost.style.top = g.top;
    if (g.bottom) ghost.style.bottom = g.bottom;
    if (g.left) ghost.style.left = g.left;
    if (g.right) ghost.style.right = g.right;
    view.appendChild(ghost);
  });

  // ============================================================
  // BANDERAS UK SUTILES
  // ============================================================
  const flags = [
    { top: "8%", right: "30%", size: "3rem", opacity: "0.05" },
    { top: "40%", left: "25%", size: "2.5rem", opacity: "0.05" },
    { bottom: "8%", left: "30%", size: "3.5rem", opacity: "0.05" },
    { top: "65%", right: "25%", size: "2.8rem", opacity: "0.05" },
    { top: "75%", left: "45%", size: "2.2rem", opacity: "0.03" },
    { top: "5%", left: "35%", size: "2.6rem", opacity: "0.04" }
  ];

  flags.forEach(f => {
    const flag = document.createElement("div");
    flag.textContent = "🇬🇧";
    flag.style.position = "fixed";
    flag.style.pointerEvents = "none";
    flag.style.zIndex = "0";
    flag.style.opacity = f.opacity;
    flag.style.fontSize = f.size;
    flag.style.filter = "saturate(0.3)";
    flag.style.animation = "flagFloat 12s ease-in-out infinite";
    if (f.top) flag.style.top = f.top;
    if (f.bottom) flag.style.bottom = f.bottom;
    if (f.left) flag.style.left = f.left;
    if (f.right) flag.style.right = f.right;
    view.appendChild(flag);
  });

  // ============================================================
  // CONTAINER
  // ============================================================
  const container = document.createElement("div");
  container.style.height = "calc(100vh - 100px)";
  container.style.maxWidth = "1200px";
  container.style.margin = "0 auto";
  container.style.padding = "40px 32px";
  container.style.position = "relative";
  container.style.zIndex = "2";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "center";
  container.style.gap = "36px";

  // ============================================================
  // HERO
  // ============================================================
  const hero = document.createElement("div");
  hero.style.textAlign = "center";

  const badge = document.createElement("div");
  badge.style.display = "inline-flex";
  badge.style.alignItems = "center";
  badge.style.gap = "6px";
  badge.style.padding = "6px 14px";
  badge.style.background = "#fff";
  badge.style.border = "1px solid #fed7aa";
  badge.style.borderRadius = "999px";
  badge.style.fontSize = ".78rem";
  badge.style.fontWeight = "600";
  badge.style.color = "#c2410c";
  badge.style.marginBottom = "20px";
  badge.style.boxShadow = "0 2px 8px rgba(249,115,22,.08)";
  badge.textContent = "🇬🇧 Made for English learners";
  hero.appendChild(badge);

  const h1 = document.createElement("h1");
  h1.style.fontSize = "4.5rem";
  h1.style.fontWeight = "900";
  h1.style.letterSpacing = "-3px";
  h1.style.lineHeight = "1";
  h1.style.marginBottom = "24px";
  h1.style.color = "#0f172a";
  h1.innerHTML = "Learn English.<br><span style='background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: inline-block;'>Pass your exam.</span>";
  hero.appendChild(h1);

  // Badges de niveles: A2 · B1 · B2
  const levelsRow = document.createElement("div");
  levelsRow.style.display = "flex";
  levelsRow.style.alignItems = "center";
  levelsRow.style.justifyContent = "center";
  levelsRow.style.gap = "10px";
  levelsRow.style.flexWrap = "wrap";
  levelsRow.style.marginBottom = "20px";

  const levels = [
    { code: "A2", name: "Elementary", color: "#16a34a" },
    { code: "B1", name: "Intermediate", color: "#2563eb" },
    { code: "B2", name: "Upper Intermediate", color: "#7c3aed" }
  ];

  levels.forEach(lvl => {
    const pill = document.createElement("div");
    pill.style.display = "inline-flex";
    pill.style.alignItems = "center";
    pill.style.gap = "8px";
    pill.style.padding = "8px 16px";
    pill.style.background = "#fff";
    pill.style.border = "2px solid " + lvl.color;
    pill.style.borderRadius = "999px";
    pill.style.fontSize = ".85rem";
    pill.style.fontWeight = "700";
    pill.style.color = "#0f172a";
    pill.style.boxShadow = "0 3px 10px rgba(15,23,42,.06)";
    pill.innerHTML =
      "<span style='background: " + lvl.color + "; color: #fff; padding: 3px 10px; border-radius: 999px; font-size: .78rem; font-weight: 800;'>" + lvl.code + "</span>" +
      "<span style='font-size: .82rem; color: #475569; font-weight: 600;'>" + lvl.name + "</span>";
    levelsRow.appendChild(pill);
  });

  hero.appendChild(levelsRow);

  const sub = document.createElement("p");
  sub.textContent = "1,009 exercises. One plan. Zero excuses.";
  sub.style.fontSize = "1.15rem";
  sub.style.color = "#475569";
  sub.style.marginBottom = "32px";
  sub.style.maxWidth = "600px";
  sub.style.marginLeft = "auto";
  sub.style.marginRight = "auto";
  hero.appendChild(sub);

  // CTA row
  const ctaRow = document.createElement("div");
  ctaRow.style.display = "flex";
  ctaRow.style.alignItems = "center";
  ctaRow.style.justifyContent = "center";
  ctaRow.style.gap = "16px";
  ctaRow.style.flexWrap = "wrap";
  ctaRow.style.marginBottom = "18px";

  const cta = document.createElement("button");
  cta.innerHTML = "Start free <span style='display:inline-block; transition: transform .2s;'>→</span>";
  cta.style.display = "inline-flex";
  cta.style.alignItems = "center";
  cta.style.gap = "10px";
  cta.style.padding = "16px 40px";
  cta.style.background = "#f97316";
  cta.style.color = "#fff";
  cta.style.border = "none";
  cta.style.borderRadius = "999px";
  cta.style.fontSize = "1.05rem";
  cta.style.fontWeight = "800";
  cta.style.cursor = "pointer";
  cta.style.transition = "all .2s";
  cta.style.boxShadow = "0 14px 34px rgba(249,115,22,.35)";

  cta.addEventListener("mouseenter", () => {
    cta.style.background = "#ea580c";
    cta.style.transform = "translateY(-3px) scale(1.03)";
    cta.style.boxShadow = "0 20px 44px rgba(249,115,22,.45)";
  });
  cta.addEventListener("mouseleave", () => {
    cta.style.background = "#f97316";
    cta.style.transform = "translateY(0) scale(1)";
    cta.style.boxShadow = "0 14px 34px rgba(249,115,22,.35)";
  });
  cta.addEventListener("click", () => {
    import("../router.js").then(m => m.navigate("onboarding"));
  });
  ctaRow.appendChild(cta);

  const ctaGhost = document.createElement("button");
  ctaGhost.textContent = "See how it works";
  ctaGhost.style.padding = "16px 28px";
  ctaGhost.style.background = "transparent";
  ctaGhost.style.color = "#0f172a";
  ctaGhost.style.border = "1.5px solid #cbd5e1";
  ctaGhost.style.borderRadius = "999px";
  ctaGhost.style.fontSize = "1rem";
  ctaGhost.style.fontWeight = "600";
  ctaGhost.style.cursor = "pointer";
  ctaGhost.style.transition = "all .2s";

  ctaGhost.addEventListener("mouseenter", () => {
    ctaGhost.style.borderColor = "#f97316";
    ctaGhost.style.color = "#c2410c";
    ctaGhost.style.background = "#fff";
  });
  ctaGhost.addEventListener("mouseleave", () => {
    ctaGhost.style.borderColor = "#cbd5e1";
    ctaGhost.style.color = "#0f172a";
    ctaGhost.style.background = "transparent";
  });
  ctaGhost.addEventListener("click", () => {
    import("../router.js").then(m => m.navigate("how"));
  });
  ctaRow.appendChild(ctaGhost);

  hero.appendChild(ctaRow);

  const meta = document.createElement("div");
  meta.textContent = "No credit card · No ads · Just results";
  meta.style.fontSize = ".82rem";
  meta.style.color = "#94a3b8";
  meta.style.fontWeight = "500";
  hero.appendChild(meta);

  const trust = document.createElement("div");
  trust.style.display = "flex";
  trust.style.alignItems = "center";
  trust.style.justifyContent = "center";
  trust.style.gap = "12px";
  trust.style.fontSize = ".9rem";
  trust.style.color = "#64748b";
  trust.style.marginTop = "8px";
  trust.innerHTML = "<span style='color:#f59e0b; font-size:1rem; letter-spacing:2px'>★★★★★</span><span>Trusted by <strong style='color:#0f172a'>1,000+</strong> English learners</span>";
  hero.appendChild(trust);

  container.appendChild(hero);

  // ============================================================
  // STATS
  // ============================================================
  const stats = document.createElement("div");
  stats.style.display = "grid";
  stats.style.gridTemplateColumns = "repeat(4, 1fr)";
  stats.style.gap = "16px";
  stats.style.maxWidth = "900px";
  stats.style.margin = "0 auto";
  stats.style.width = "100%";

  const items = [
    { value: "1,009", label: "exercises" },
    { value: "130", label: "days of plan" },
    { value: "AI", label: "instant feedback" },
    { value: "6", label: "mock exams" }
  ];

  items.forEach((it, idx) => {
    const card = document.createElement("div");
    card.style.background = "#fff";
    card.style.padding = "22px 16px";
    card.style.borderRadius = "16px";
    card.style.textAlign = "center";
    card.style.transition = "all .25s";
    card.style.border = "2px solid #fff";
    card.style.boxShadow = "0 6px 20px rgba(15,23,42,.05)";
    card.style.position = "relative";
    card.style.overflow = "hidden";

    const bar = document.createElement("div");
    bar.style.position = "absolute";
    bar.style.top = "0";
    bar.style.left = "0";
    bar.style.right = "0";
    bar.style.height = "3px";
    bar.style.background = "linear-gradient(90deg, #f97316, #fbbf24)";
    bar.style.transform = "scaleX(0)";
    bar.style.transformOrigin = "left";
    bar.style.transition = "transform .3s";
    card.appendChild(bar);

    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-6px)";
      card.style.borderColor = "#fed7aa";
      card.style.boxShadow = "0 20px 40px rgba(249,115,22,.15)";
      bar.style.transform = "scaleX(1)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
      card.style.borderColor = "#fff";
      card.style.boxShadow = "0 6px 20px rgba(15,23,42,.05)";
      bar.style.transform = "scaleX(0)";
    });

    const val = document.createElement("div");
    val.textContent = it.value;
    val.style.fontSize = "2.6rem";
    val.style.fontWeight = "900";
    val.style.color = "#0f172a";
    val.style.letterSpacing = "-1.5px";
    val.style.lineHeight = "1";
    val.style.marginBottom = "6px";
    card.appendChild(val);

    const lab = document.createElement("div");
    lab.textContent = it.label;
    lab.style.fontSize = ".78rem";
    lab.style.color = "#64748b";
    lab.style.fontWeight = "600";
    lab.style.textTransform = "uppercase";
    lab.style.letterSpacing = "0.8px";
    card.appendChild(lab);

    stats.appendChild(card);
  });

  container.appendChild(stats);

  view.appendChild(container);
}

// Inyectar animaciones CSS globales (solo una vez)
if (!document.getElementById("comu-home-animations")) {
  const style = document.createElement("style");
  style.id = "comu-home-animations";
  style.textContent = `
    @keyframes blobMove {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -20px) scale(1.05); }
      66% { transform: translate(-20px, 30px) scale(0.95); }
    }
    @keyframes ghostFloat {
      0%, 100% { transform: translateY(0) rotate(-4deg); }
      50% { transform: translateY(-15px) rotate(4deg); }
    }
    @keyframes flagFloat {
      0%, 100% { transform: translateY(0) rotate(-3deg); }
      50% { transform: translateY(-12px) rotate(3deg); }
    }
  `;
  document.head.appendChild(style);
}
