export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function formatYuan(value) {
  return value.toFixed(value % 1 === 0 ? 0 : 2)
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

export function hexToPixi(hex) {
  return hex
}

export function createRoundedRect(g, x, y, w, h, r, fill, stroke, strokeWidth = 2) {
  if (fill !== null) {
    g.roundRect(x, y, w, h, r)
    g.fill(fill)
  }
  if (stroke !== null) {
    g.roundRect(x, y, w, h, r)
    g.stroke({ color: stroke, width: strokeWidth })
  }
}
