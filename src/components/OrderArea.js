import { Container, Graphics, Text } from 'pixi.js'
import { COLORS, CUSTOMER_AVATARS, ITEM_ICONS } from '../config/denominations.js'
import { GAME_MODES } from '../config/gameModes.js'
import { formatYuan, randomPick } from '../utils/helpers.js'

export class OrderArea extends Container {
  constructor() {
    super()
    this._order = null
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

    // 模式角标（找零 / 收款）
    this._modeTag = new Container()
    this._modeTag.x = 16
    this._modeTag.y = 16
    this._modeTagBg = new Graphics()
    this._modeTag.addChild(this._modeTagBg)
    this._modeTagText = new Text({
      text: '',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 15, fill: 0xFFFFFF, fontWeight: 'bold' },
    })
    this._modeTagText.x = 10
    this._modeTagText.y = 4
    this._modeTag.addChild(this._modeTagText)
    this.addChild(this._modeTag)

    this._avatar = new Text({ text: '👧', style: { fontSize: 60 } })
    this._avatar.anchor.set(0.5)
    this._avatar.x = 80
    this._avatar.y = 92
    this.addChild(this._avatar)

    this._itemIcon = new Text({ text: '🍎', style: { fontSize: 36 } })
    this._itemIcon.anchor.set(0.5)
    this._itemIcon.x = 80
    this._itemIcon.y = 158
    this.addChild(this._itemIcon)

    // 找零模式顶部信息行：商品价 + 顾客付款
    this._changeInfo = new Text({
      text: '',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 22, fill: COLORS.text, fontWeight: 'bold' },
    })
    this._changeInfo.anchor.set(0.5, 0)
    this._changeInfo.x = 430
    this._changeInfo.y = 26
    this._changeInfo.visible = false
    this.addChild(this._changeInfo)

    this._label = new Text({
      text: '应付金额',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 18, fill: 0x888888 },
    })
    this._label.anchor.set(0.5, 0)
    this._label.x = 430
    this._label.y = 20
    this.addChild(this._label)

    this._amountText = new Text({
      text: '¥0',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 64, fill: COLORS.primary, fontWeight: 'bold' },
    })
    this._amountText.anchor.set(0.5)
    this._amountText.x = 430
    this._amountText.y = 100
    this.addChild(this._amountText)

    this._diffText = new Text({
      text: '',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 20, fill: COLORS.secondary, fontWeight: 'bold' },
    })
    this._diffText.anchor.set(0.5)
    this._diffText.x = 430
    this._diffText.y = 168
    this.addChild(this._diffText)
  }

  _drawModeTag(isChange) {
    const color = isChange ? COLORS.primary : COLORS.secondary
    const label = isChange ? '💸 找零' : '🪙 收款'
    this._modeTagText.text = label
    const w = this._modeTagText.width + 20
    this._modeTagBg.clear()
    this._modeTagBg.roundRect(0, 0, w, 26, 13)
    this._modeTagBg.fill({ color })
  }

  setOrder(order) {
    this._order = order
    this._targetAmount = order.target
    this._avatar.text = randomPick(CUSTOMER_AVATARS)
    this._itemIcon.text = randomPick(ITEM_ICONS)
    this._diffText.text = ''

    const isChange = order.mode === GAME_MODES.CHANGE
    this._drawModeTag(isChange)

    if (isChange) {
      this._changeInfo.visible = true
      this._changeInfo.text = `🛒 ¥${formatYuan(order.price)}   💵 收 ¥${formatYuan(order.paid)}`
      this._label.text = '应找零'
      this._label.y = 64
      this._amountText.y = 120
      this._amountText.style.fill = COLORS.primary
    } else {
      this._changeInfo.visible = false
      this._label.text = '应付金额'
      this._label.y = 20
      this._amountText.y = 100
      this._amountText.style.fill = COLORS.primary
    }

    this._amountText.text = `¥${formatYuan(order.target)}`
    this._animateAmount()
  }

  _animateAmount() {
    this._amountText.scale.set(1.3)
    let frame = 0
    const total = 12
    const tick = () => {
      if (this._amountText.destroyed) return
      frame++
      const t = frame / total
      this._amountText.scale.set(1.3 - 0.3 * t)
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

  getOrder() {
    return this._order
  }

  hideDiff() {
    this._diffText.text = ''
  }
}
