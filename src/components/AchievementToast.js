import { Container, Graphics, Text } from 'pixi.js'
import { COLORS, DESIGN_WIDTH } from '../config/denominations.js'

// 游戏内成就解锁提示。支持排队逐条展示：从顶部滑入、停留、滑出。
export class AchievementToast extends Container {
  constructor() {
    super()
    this._queue = []
    this._showing = false
    this._raf = null
    this.visible = false
    this._build()
  }

  _build() {
    this._card = new Container()
    this._card.x = DESIGN_WIDTH / 2
    this.addChild(this._card)

    const w = 460
    const h = 84
    this._w = w
    this._h = h

    this._bg = new Graphics()
    this._bg.roundRect(-w / 2, 0, w, h, 18)
    this._bg.fill({ color: 0x3D2C2E, alpha: 0.95 })
    this._bg.roundRect(-w / 2, 0, w, h, 18)
    this._bg.stroke({ color: COLORS.gold, width: 3 })
    this._card.addChild(this._bg)

    this._iconBg = new Graphics()
    this._iconBg.circle(-w / 2 + 50, h / 2, 28)
    this._iconBg.fill({ color: COLORS.gold })
    this._card.addChild(this._iconBg)

    this._icon = new Text({ text: '🏆', style: { fontSize: 34 } })
    this._icon.anchor.set(0.5)
    this._icon.x = -w / 2 + 50
    this._icon.y = h / 2
    this._card.addChild(this._icon)

    this._label = new Text({
      text: '成就解锁',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 15, fill: COLORS.gold, fontWeight: 'bold' },
    })
    this._label.x = -w / 2 + 92
    this._label.y = 16
    this._card.addChild(this._label)

    this._name = new Text({
      text: '',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 24, fill: 0xFFFFFF, fontWeight: 'bold' },
    })
    this._name.x = -w / 2 + 92
    this._name.y = 38
    this._card.addChild(this._name)
  }

  enqueue(achievement) {
    this._queue.push(achievement)
    if (!this._showing) this._next()
  }

  _next() {
    if (this._queue.length === 0) {
      this._showing = false
      this.visible = false
      return
    }
    this._showing = true
    this.visible = true
    const ach = this._queue.shift()
    this._icon.text = ach.icon || '🏆'
    this._name.text = ach.name || ''
    this._animate()
  }

  _animate() {
    if (this._raf) cancelAnimationFrame(this._raf)
    const startY = -this._h - 10
    const targetY = 16
    const inFrames = 18
    const holdFrames = 90
    const outFrames = 16
    let frame = 0
    const total = inFrames + holdFrames + outFrames

    const ease = (t) => 1 - Math.pow(1 - t, 3)

    const tick = () => {
      frame++
      if (frame <= inFrames) {
        const t = ease(frame / inFrames)
        this._card.y = startY + (targetY - startY) * t
        this._card.alpha = t
      } else if (frame <= inFrames + holdFrames) {
        this._card.y = targetY
        this._card.alpha = 1
      } else {
        const t = (frame - inFrames - holdFrames) / outFrames
        this._card.y = targetY + (startY - targetY) * t * 0.6
        this._card.alpha = 1 - t
      }
      if (frame < total) {
        this._raf = requestAnimationFrame(tick)
      } else {
        this._raf = null
        this._next()
      }
    }
    tick()
  }

  destroy(options) {
    if (this._raf) cancelAnimationFrame(this._raf)
    super.destroy(options)
  }
}
