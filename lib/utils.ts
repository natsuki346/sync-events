/** Deterministic gradient from event ID — stable across renders */
export function getEventGradient(id: string): string {
  const hues = [258, 210, 168, 330, 28, 192, 300, 45];
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hues[sum % hues.length];
  const hue2 = (hue + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue},65%,28%) 0%, hsl(${hue2},75%,18%) 100%)`;
}

export function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
