// Shared render-loop data: scroll never causes a React render per frame.
export const cinematic = {
  ready: false,
  active: false,
  progress: 0,
  launchEnd: 1000,
  scroll: 0,
  sectionShift: 0,
  targetTop: 0,
  targetHeight: 600,
  source: { x: 1.75, y: 0, rx: 0.1, ry: -0.35, rz: -0.25, scale: 1.45 },
  destination: { rx: .12, ry: -.35, rz: -.15, opened: true, resetKey: 0 },
  from: { x: 0, y: 0, scale: 1 },
  to: { x: 0, y: 0, scale: 1 },
};
