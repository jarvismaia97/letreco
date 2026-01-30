// Simple seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getDailyWord(words: string[], mode: number): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  // hash the date string + mode
  let hash = mode * 9999;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  const rng = mulberry32(Math.abs(hash));
  const idx = Math.floor(rng() * words.length);
  return words[idx];
}

export function getDayNumber(): number {
  const start = new Date(2024, 0, 1).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.floor((now - start) / 86400000);
}
