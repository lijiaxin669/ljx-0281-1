import { Container, Graphics, Text } from 'pixi.js'
import { COLORS, DENOMINATIONS } from '../config/denominations.js'
import { MoneyItem } from './MoneyItem.js'
import { formatYuan } from '../utils/helpers.js'

export class CashTray extends Container {
  constructor(onRemoveMoney) {
    super()
    this.onRemoveMoney = onRemoveMoney
    this.placedItems = []
    this.currentAmount = 0
    this._build()
  }

  _build() {
    const bg = new Graphics()
    bg.roundRect(0, 0, 700, 180, 20)
    bg.fill({ color: 0xFFF3E0 })
    bg.roundRect(0, 0, 700, 180, 20)
    bg.stroke({ color: COLORS.woodDark, width: 4 })
    this.addChild(bg)
    this._bg = bg

    const title = new Text({
      text: '🧾 收银盘',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fill: COLORS.text,
        fontWeight: 'bold',
      },
    })
    title.anchor.set(0.5, 0)
    title.x = 350
    title.y = 6
    this.addChild(title)

    this._amountText = new Text({
      text: '已收: ¥0',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 26,
        fill: COLORS.secondary,
        fontWeight: 'bold',
      },
    })
    this._amountText.anchor.set(0.5, 0)
    this._amountText.x = 350
    this._amountText.y = 140
    this.addChild(this._amountText)

    this._hintText = new Text({
      text: '把硬币和纸币拖到这里，点击可撤回～',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fill: 0x9E9E9E,
      },
    })
    this._hintText.anchor.set(0.5, 0.5)
    this._hintText.x = 350
    this._hintText.y = 80
    this.addChild(this._hintText)
  }

  addMoney(denom) {
    const item = new MoneyItem(denom)
    item.scale.set(0.55)
    item.eventMode = 'static'
    item.cursor = 'pointer'

    const idx = this.placedItems.length
    const cols = 8
    const col = idx % cols
    const row = Math.floor(idx / cols)
    item.x = 60 + col * 78
    item.y = 55 + row * 42
    item.alpha = 0

    item.on('pointerdown', () => {
      this.removeMoney(item)
    })

    this.addChild(item)
    this.placedItems.push(item)
    this.currentAmount += denom.value

    this._amountText.text = `已收: ¥${formatYuan(this.currentAmount)}`
    this._hintText.visible = false

    item.alpha = 0
    this._animateIn(item)

    return this.currentAmount
  }

  removeMoney(item) {
    const idx = this.placedItems.indexOf(item)
    if (idx === -1) return

    this.placedItems.splice(idx, 1)
    this.currentAmount -= item.value

    this.removeChild(item)
    item.destroy()

    this._amountText.text = `已收: ¥${formatYuan(this.currentAmount)}`

    if (this.placedItems.length === 0) {
      this._hintText.visible = true
    }

    this._repositionItems()

    if (this.onRemoveMoney) {
      this.onRemoveMoney(this.currentAmount)
    }

    return this.currentAmount
  }

  _repositionItems() {
    const cols = 8
    this.placedItems.forEach((item, idx) => {
      const col = idx % cols
      const row = Math.floor(idx / cols)
      item.x = 60 + col * 78
      item.y = 55 + row * 42
    })
  }

  _animateIn(item) {
    let frame = 0
    const total = 8
    const tick = () => {
      if (item.destroyed) return
      frame++
      item.alpha = frame / total
      item.scale.set(0.55 * (0.8 + 0.2 * (frame / total)))
      if (frame < total) requestAnimationFrame(tick)
    }
    tick()
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: 700,
      height: 180,
    }
  }

  containsPoint(globalPoint) {
    const b = this.getBounds()
    return (
      globalPoint.x >= b.x && globalPoint.x <= b.x + b.width &&
      globalPoint.y >= b.y && globalPoint.y <= b.y + b.height
    )
  }

  reset() {
    this.placedItems.forEach((item) => {
      this.removeChild(item)
      item.destroy()
    })
    this.placedItems = []
    this.currentAmount = 0
    this._amountText.text = '已收: ¥0'
    this._hintText.visible = true
  }
}
