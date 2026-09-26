// Home: minimal modern landing.
import { getState } from "../state.js";

export function renderHome(view) {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.display = "none";
  const shell = document.querySelector(".app-shell");
  if (shell) shell.style.gridTemplateColumns = "1fr";

  view.innerHTML = "";
  view.style.padding = "0";

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "center";
  container.style.minHeight = "calc(100vh - 140px)";
  container.style.padding = "40px 20px";
  container.style.maxWidth = "1100px";
  container.style.margin = "0 auto";
  container.style.gap = "40px";

  // ============================================================
  // HERO (blanco, tipografia gigante)
  // ============================================================
  const hero = document.createElement("div");
  hero.style.textAlign = "center";

  const h1 = document.createElement("h1");
  h1.innerHTML = "Learn English.<br>Pass your exam.";
  h1.style.fontSize = "3.5rem";
  h1.style.fontWeight = "900";
  h1.style.color = "#0f172a";
  h1.style.letterSpacing = "-2px";
  h1.style.lineHeight = "1.05";
  h1.style.marginBottom = "20px";
  hero.appendChild(h1);

  const sub = document.createElement("p");
  sub.textContent = "1,009 exercises. One plan. Zero excuses.";
  sub.style.fontSize = "1.25rem";
  sub.style.color = "#475569";
  sub.style.marginBottom = "32px";
  sub.style.fontWeight = "400";
  hero.appendChild(sub);

  const ctaBtn = document.createElement("button");
  ctaBtn.textContent = "Start free →";
  ctaBtn.style.padding = "16px 40px";
  ctaBtn.style.background = "#f97316";
  ctaBtn.style.color = "#fff";
  ctaBtn.style.border = "none";
  ctaBtn.style.borderRadius = "999px";
  ctaBtn.style.fontSize = "1.05rem";
  ctaBtn.style.fontWeight = "700";
  ctaBtn.style.cursor = "pointer";
  ctaBtn.style.transition = "all .15s";
  ctaBtn.style.letterSpacing = "-0.3px";

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
  hero.appendChild(ctaBtn);

  container.appendChild(hero);

  // ============================================================
  // 4 STATS (numeros gigantes)
  // ============================================================
  const stats = document.createElement("div");
  stats.style.display = "grid";
  stats.style.gridTemplateColumns = "repeat(4, 1fr)";
  stats.style.gap = "16px";

  const items = [
    { value: "1,009", label: "exercises" },
    { value: "130", label: "days of plan" },
    { value: "AI", label: "instant feedback" },
    { value: "6", label: "mock exams" }
  ];

  items.forEach(it => {
    const card = document.createElement("div");
    card.style.background = "#f8fafc";
    card.style.padding = "28px 16px";
    card.style.borderRadius = "16px";
    card.style.textAlign = "center";
    card.style.transition = "all .15s";
    card.style.border = "1px solid transparent";

    card.addEventListener("mouseenter", () => {
      card.style.background = "#fff";
      card.style.borderColor = "#e2e8f0";
      card.style.transform = "translateY(-4px)";
      card.style.boxShadow = "0 12px 28px rgba(15,23,42,.08)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.background = "#f8fafc";
      card.style.borderColor = "transparent";
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "none";
    });

    const val = document.createElement("div");
    val.textContent = it.value;
    val.style.fontSize = "3rem";
    val.style.fontWeight = "900";
    val.style.color = "#0f172a";
    val.style.letterSpacing = "-2px";
    val.style.lineHeight = "1";
    val.style.marginBottom = "8px";
    card.appendChild(val);

    const lab = document.createElement("div");
    lab.textContent = it.label;
    lab.style.fontSize = ".85rem";
    lab.style.color = "#64748b";
    lab.style.fontWeight = "500";
    card.appendChild(lab);

    stats.appendChild(card);
  });

  container.appendChild(stats);

  view.appendChild(container);
}
