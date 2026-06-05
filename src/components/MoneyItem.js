import { Container, Graphics, Text } from 'pixi.js'
import { DENOMINATIONS, COLORS } from '../config/denominations.js'
import { formatYuan, createRoundedRect } from '../utils/helpers.js'

export class MoneyItem extends Container {
  constructor(denom) {
    super()
    this.denom = denom
    this.value = denom.value
    this._buildGraphics()
  }

  _buildGraphics() {
    const d = this.denom

    if (d.type === 'coin') {
      this._drawCoin(d)
    } else {
      this._drawBill(d)
    }

    const labelText = new Text({
      text: d.label,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: d.type === 'coin' ? 16 : 18,
        fill: d.type === 'coin' ? 0x5D4E37 : 0xFFFFFF,
        fontWeight: 'bold',
      },
    })
    labelText.anchor.set(0.5)
    this.addChild(labelText)
  }

  _drawCoin(d) {
    const g = this.addChild(new Graphics())
    g.circle(0, 0, d.radius)
    g.fill({ color: d.color })
    g.circle(0, 0, d.radius)
    g.stroke({ color: d.strokeColor, width: 3 })
    g.circle(0, 0, d.radius - 6)
    g.stroke({ color: d.strokeColor, width: 1, alpha: 0.4 })
    this._graphic = g
    this._type = 'coin'
    this._radius = d.radius
  }

  _drawBill(d) {
    const g = this.addChild(new Graphics())
    const hw = d.width / 2
    const hh = d.height / 2
    g.roundRect(-hw, -hh, d.width, d.height, 6)
    g.fill({ color: d.color })
    g.roundRect(-hw, -hh, d.width, d.height, 6)
    g.stroke({ color: d.strokeColor, width: 2 })
    g.roundRect(-hw + 6, -hh + 6, d.width - 12, d.height - 12, 3)
    g.stroke({ color: 0xFFFFFF, width: 1, alpha: 0.3 })
    this._graphic = g
    this._type = 'bill'
    this._hw = hw
    this._hh = hh
  }

  createDragClone() {
    const clone = new MoneyItem(this.denom)
    clone.alpha = 0.85
    clone.scale.set(1.1)
    clone.eventMode = 'none'
    return clone
  }

  containsPoint(point) {
    if (this._type === 'coin') {
      const dx = point.x
      const dy = point.y
      return dx * dx + dy * dy <= this._radius * this._radius
    }
    return (
      point.x >= -this._hw && point.x <= this._hw &&
      point.y >= -this._hh && point.y <= this._hh
    )
  }
}
