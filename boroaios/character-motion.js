// GPU-friendly 2.5D puppet: deform the original textured mesh, never replace its artwork.
// Coordinates are normalized from the top-left of the supplied constructor render.
export const BUILD_SECONDS = 8;
const clamp = x => Math.max(0, Math.min(1, x));
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const ramp = (x, a, b) => smooth((x - a) / (b - a));
function rotate(p, x, y, angle, weight) {
  const a = angle * weight, c = Math.cos(a), s = Math.sin(a);
  const dx = p.x - x, dy = p.y - y;
  p.x = x + dx * c - dy * s; p.y = y + dx * s + dy * c;
}
export function poseAt(time, elapsed) {
  const cycle = ((elapsed % BUILD_SECONDS) + BUILD_SECONDS) % BUILD_SECONDS;
  const reach = ramp(cycle, .5, 1.8) * (1 - ramp(cycle, 4.4, 6.5));
  const place = ramp(cycle, 1.8, 2.7) * (1 - ramp(cycle, 3.2, 4.5));
  return {
    arm: .07 - reach * .42 + Math.sin(time * 1.7) * .025,
    forearm: -.04 - place * .23,
    head: Math.sin(time * .95) * .035 + reach * .035,
    tail: Math.sin(time * 1.2) * .13,
    leftArm: Math.sin(time * 1.4 + .6) * .035,
    breath: Math.sin(time * 1.9) * .004,
    reach, place, cycle,
    action: cycle < 1 ? 'Observa las piezas' : cycle < 2.7 ? 'Acerca una idea' : cycle < 5.5 ? 'Construye conexiones' : 'Revisa lo construido',
    progress: ramp(cycle, 2, 5.4)
  };
}
export function deformPoint(x, y, pose, out = {}) {
  out.x = x; out.y = y;
  // Soft weights keep shoulders and neck attached, while boots remain grounded.
  const right = ramp(x, .545, .625) * (1 - ramp(x, .82, .91)) * ramp(y, .18, .27) * (1 - ramp(y, .47, .56));
  const forearm = ramp(x, .60, .72) * right;
  rotate(out, .62, .405, pose.forearm, forearm);
  rotate(out, .558, .315, pose.arm, right);
  const head = (1 - ramp(y, .21, .285)) * ramp(x, .30, .38) * (1 - ramp(x, .57, .64));
  rotate(out, .455, .255, pose.head, head);
  const tail = (1 - ramp(x, .29, .36)) * ramp(y, .53, .62) * (1 - ramp(y, .82, .86));
  rotate(out, .35, .68, pose.tail, tail);
  const left = ramp(x, .22, .26) * (1 - ramp(x, .31, .36)) * ramp(y, .30, .38) * (1 - ramp(y, .67, .73));
  rotate(out, .31, .36, pose.leftArm, left);
  out.y -= pose.breath * (1 - ramp(y, .67, .86));
  return out;
}
