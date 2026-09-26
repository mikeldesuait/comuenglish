// Conversion de porcentaje de aciertos a CEFR English Scale.

const SCALE = {
  a2: { min: 100, pass: 120, max: 139 },
  b1: { min: 120, pass: 140, max: 159 },
  b2: { min: 140, pass: 160, max: 179 }
};

export function toCefrScale(level, percent) {
  const { min, max } = SCALE[level] || SCALE.a2;
  return Math.round(min + (max - min) * percent);
}

export function isPass(level, score) {
  return score >= (SCALE[level] || SCALE.a2).pass;
}

export function levelFromScore(score) {
  if (score >= 160) return "b2";
  if (score >= 140) return "b1";
  if (score >= 120) return "a2";
  return "below";
}
