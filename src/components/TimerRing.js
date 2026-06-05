import { Container, Graphics } from 'pixi.js'
import { COLORS } from '../config/denominations.js'

export class TimerRing extends Container {
  constructor() {
    super()
    this._progress = 1
    this._radius = 36
    this._lineWidth = 6
    this._build()
  }

  _build() {
    this._bgRing = new Graphics()
    this._bgRing.circle(0, 0, this._radius)
    this._bgRing.stroke({ color: 0xE0E0E0, width: this._lineWidth })
    this.addChild(this._bgRing)

    this._fgRing = new Graphics()
    this.addChild(this._fgRing)

    this.setProgress(1)
  }

  setProgress(p) {
    this._progress = Math.max(0, Math.min(1, p))
    this._fgRing.clear()

    if (this._progress <= 0) return

    const startAngle = -Math.PI / 2
    const endAngle = startAngle + this._progress * Math.PI * 2

    this._fgRing.arc(0, 0, this._radius, startAngle, endAngle, false)
    this._fgRing.stroke({
      color: this._progress > 0.3 ? COLORS.secondary : COLORS.error,
      width: this._lineWidth,
      cap: 'round',
    })
  }

  getProgress() {
    return this._progress
  }
}
