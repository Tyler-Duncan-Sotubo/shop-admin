export function hexToHslParts(hex: string): string | null {
  const clean = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;

  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const H = Math.round(h);
  const S = Math.round(s * 100);
  const L = Math.round(l * 100);

  // Shadcn expects: "H S% L%"
  return `${H} ${S}% ${L}%`;
}

export function pickForegroundForHex(hex: string): "0 0% 0%" | "0 0% 100%" {
  const clean = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return "0 0% 100%";

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  // perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140 ? "0 0% 0%" : "0 0% 100%";
}
