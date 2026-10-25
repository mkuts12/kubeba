import type { Feel } from './music';

/** Map an evenly notated beat to a simple 2:1 swing feel. */
export function performedBeat(beat: number, feel: Feel = 'straight'): number {
  if (feel === 'straight') return beat;
  const whole = Math.floor(beat);
  const fraction = beat - whole;
  return whole + (fraction <= 0.5 ? (fraction * 4) / 3 : 2 / 3 + ((fraction - 0.5) * 2) / 3);
}
