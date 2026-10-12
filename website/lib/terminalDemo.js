// Chapter start times in seconds from the 2026-10-10 edited recording.
// Update these along with the render timeline when replacing the clip.
export const terminalDemo = {
  src: '/images/terminal-demo.mp4',
  poster: '/images/terminal-demo-poster.webp',
  chapterStarts: [0, 7.3, 19.5],
};

export function terminalChapterProgress(starts, count, duration, time) {
  if (!Array.isArray(starts) || starts.length !== count || count === 0 ||
      !Number.isFinite(duration) || duration <= 0 || starts[0] !== 0 ||
      starts.some((start, index) => !Number.isFinite(start) || start < 0 ||
        start >= duration || (index > 0 && start <= starts[index - 1]))) return null;

  const current = Math.max(0, Math.min(duration, time));
  let active = count - 1;
  for (let index = 1; index < count; index++) {
    if (current < starts[index]) { active = index - 1; break; }
  }
  const end = starts[active + 1] ?? duration;
  return { active, progress: (current - starts[active]) / (end - starts[active]) };
}
