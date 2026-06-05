import { Container, Graphics, Text } from 'pixi.js'
import { COLORS, CUSTOMER_AVATARS, ITEM_ICONS } from '../config/denominations.js'
import { formatYuan, randomPick } from '../utils/helpers.js'

export class OrderArea extends Container {
  constructor() {
    super()
    this._avatar = null
    this._itemIcon = null
    this._amountText = null
    this._diffText = null
    this._targetAmount = 0
    this._build()
  }

  _build() {
    const bg = new Graphics()
    bg.roundRect(0, 0, 700, 200, 20)
    bg.fill({ color: 0xFFFFFF })
    bg.roundRect(0, 0, 700, 200, 20)
    bg.stroke({ color: COLORS.primary, width: 4 })
    this.addChild(bg)
    this._bg = bg

    this._avatar = new Text({
      text: '👧',
      style: { fontSize: 64 },
    })
    this._avatar.anchor.set(0.5)
    this._avatar.x = 70
    this._avatar.y = 80
    this.addChild(this._avatar)

    this._itemIcon = new Text({
      text: '🍎',
      style: { fontSize: 40 },
    })
    this._itemIcon.anchor.set(0.5)
    this._itemIcon.x = 70
    this._itemIcon.y = 155
    this.addChild(this._itemIcon)

    const label = new Text({
      text: '应付金额',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fill: 0x888888,
      },
    })
    label.anchor.set(0.5, 0)
    label.x = 420
    label.y = 20
    this.addChild(label)

    this._amountText = new Text({
      text: '¥0',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 64,
        fill: COLORS.primary,
        fontWeight: 'bold',
      },
    })
    this._amountText.anchor.set(0.5)
    this._amountText.x = 420
    this._amountText.y = 100
    this.addChild(this._amountText)

    this._diffText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 20,
        fill: COLORS.secondary,
        fontWeight: 'bold',
      },
    })
    this._diffText.anchor.set(0.5)
    this._diffText.x = 420
    this._diffText.y = 168
    this.addChild(this._diffText)
  }

  setOrder(targetAmount) {
    this._targetAmount = targetAmount
    this._avatar.text = randomPick(CUSTOMER_AVATARS)
    this._itemIcon.text = randomPick(ITEM_ICONS)
    this._amountText.text = `¥${formatYuan(targetAmount)}`
    this._diffText.text = ''
    this._animateOrder()
  }

  _animateOrder() {
    this._amountText.scale.set(1.3)
    let frame = 0
    const total = 12
    const tick = () => {
      frame++
      const t = frame / total
      const s = 1.3 - 0.3 * t
      this._amountText.scale.set(s)
      if (frame < total) requestAnimationFrame(tick)
    }
    tick()
  }

  updateDiff(currentAmount) {
    const diff = this._targetAmount - currentAmount
    if (Math.abs(diff) < 0.01) {
      this._diffText.text = '✅ 刚好！'
      this._diffText.style.fill = COLORS.success
    } else if (diff > 0) {
      this._diffText.text = `还差 ¥${formatYuan(diff)}`
      this._diffText.style.fill = COLORS.secondary
    } else {
      this._diffText.text = `多了 ¥${formatYuan(Math.abs(diff))}`
      this._diffText.style.fill = COLORS.error
    }
  }

  getTargetAmount() {
    return this._targetAmount
  }

  hideDiff() {
    this._diffText.text = ''
  }
}
