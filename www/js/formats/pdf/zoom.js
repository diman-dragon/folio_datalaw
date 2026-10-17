// Zoom math (pure): limits, discrete steps and fit-to-width.
export const MIN = 0.25;
export const MAX = 5;
export const STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
export const clamp = (z) => Math.min(MAX, Math.max(MIN, z));
export const stepUp = (z) => STEPS.find((s) => s > z + 1e-6) ?? MAX;
export const stepDown = (z) => [...STEPS].reverse().find((s) => s < z - 1e-6) ?? MIN;
export const fitWidth = (avail, pageWidth) => clamp(avail / pageWidth);
