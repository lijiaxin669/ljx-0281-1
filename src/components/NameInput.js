import { Container, Graphics, Text } from 'pixi.js'
import { COLORS, DESIGN_WIDTH, DESIGN_HEIGHT } from '../config/denominations.js'
import { StorageManager } from '../managers/StorageManager.js'
import { AudioManager } from '../managers/AudioManager.js'

const KEY_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
  ['U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3'],
  ['4', '5', '6', '7', '8', '9'],
]

const PRESETS = ['小富翁', '收银侠', '算账王', '金币君']
const MAX_LEN = 6

// 新纪录昵称录入：屏幕键盘 + 预设昵称，确认后回调 name。
export class NameInput extends Container {
  constructor(onConfirm) {
    super()
    this._onConfirm = onConfirm
    this._value = ''
    this.visible = false
    this._build()
  }

  _build() {
    this._overlay = new Graphics()
    this._overlay.rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
    this._overlay.fill({ color: 0x000000, alpha: 0.55 })
    this._overlay.eventMode = 'static'
    this.addChild(this._overlay)

    const panel = new Container()
    panel.x = 34
    panel.y = 150
    this.addChild(panel)
    this._panel = panel

    const bg = new Graphics()
    bg.roundRect(0, 0, 700, 720, 28)
    bg.fill({ color: 0xFFFFFF })
    bg.roundRect(0, 0, 700, 720, 28)
    bg.stroke({ color: COLORS.gold, width: 4 })
    panel.addChild(bg)

    const title = new Text({
      text: '🏆 新纪录！',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 38, fill: COLORS.primary, fontWeight: 'bold' },
    })
    title.anchor.set(0.5)
    title.x = 350
    title.y = 50
    panel.addChild(title)

    const sub = new Text({
      text: '留下你的名字，登上排行榜！',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 20, fill: COLORS.text },
    })
    sub.anchor.set(0.5)
    sub.x = 350
    sub.y = 96
    panel.addChild(sub)

    // 输入显示框
    const inputBg = new Graphics()
    inputBg.roundRect(150, 124, 400, 64, 16)
    inputBg.fill({ color: 0xFFF8E7 })
    inputBg.roundRect(150, 124, 400, 64, 16)
    inputBg.stroke({ color: COLORS.secondary, width: 3 })
    panel.addChild(inputBg)

    this._valueText = new Text({
      text: '',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 32, fill: COLORS.text, fontWeight: 'bold' },
    })
    this._valueText.anchor.set(0.5)
    this._valueText.x = 350
    this._valueText.y = 156
    panel.addChild(this._valueText)

    // 预设昵称
    const presetLabel = new Text({
      text: '快捷昵称：',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 16, fill: 0x888888 },
    })
    presetLabel.x = 40
    presetLabel.y = 214
    panel.addChild(presetLabel)

    PRESETS.forEach((name, i) => {
      const btn = this._makePreset(name)
      btn.x = 150 + i * 100
      btn.y = 208
      panel.addChild(btn)
    })

    // 键盘
    this._buildKeyboard(panel, 250)

    // 底部按钮
    const delBtn = this._makeActionKey('⌫ 删除', 0xBDBDBD, 200, 64)
    delBtn.x = 40
    delBtn.y = 626
    delBtn.on('pointerdown', () => this._delete())
    panel.addChild(delBtn)

    const okBtn = this._makeActionKey('✅ 确定', COLORS.success, 380, 64)
    okBtn.x = 280
    okBtn.y = 626
    okBtn.on('pointerdown', () => this._confirm())
    panel.addChild(okBtn)
  }

  _buildKeyboard(panel, startY) {
    const keyW = 60
    const keyH = 56
    const gapX = 8
    const gapY = 10
    KEY_ROWS.forEach((row, r) => {
      const rowWidth = row.length * keyW + (row.length - 1) * gapX
      const startX = (700 - rowWidth) / 2
      row.forEach((ch, c) => {
        const key = this._makeKey(ch, keyW, keyH)
        key.x = startX + c * (keyW + gapX)
        key.y = startY + r * (keyH + gapY)
        panel.addChild(key)
      })
    })
  }

  _makeKey(ch, w, h) {
    const key = new Container()
    key.eventMode = 'static'
    key.cursor = 'pointer'

    const bg = new Graphics()
    bg.roundRect(0, 0, w, h, 10)
    bg.fill({ color: 0xF0E6D6 })
    bg.roundRect(0, 0, w, h, 10)
    bg.stroke({ color: 0xD7C4A8, width: 2 })
    key.addChild(bg)

    const label = new Text({
      text: ch,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 24, fill: COLORS.text, fontWeight: 'bold' },
    })
    label.anchor.set(0.5)
    label.x = w / 2
    label.y = h / 2
    key.addChild(label)

    key.on('pointerdown', () => {
      bg.tint = 0xCCCCCC
      this._append(ch)
      setTimeout(() => { bg.tint = 0xFFFFFF }, 90)
    })
    return key
  }

  _makeActionKey(text, color, w, h) {
    const key = new Container()
    key.eventMode = 'static'
    key.cursor = 'pointer'

    const bg = new Graphics()
    bg.roundRect(0, 0, w, h, 14)
    bg.fill({ color })
    key.addChild(bg)

    const label = new Text({
      text,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 24, fill: 0xFFFFFF, fontWeight: 'bold' },
    })
    label.anchor.set(0.5)
    label.x = w / 2
    label.y = h / 2
    key.addChild(label)
    return key
  }

  _makePreset(name) {
    const btn = new Container()
    btn.eventMode = 'static'
    btn.cursor = 'pointer'

    const bg = new Graphics()
    bg.roundRect(0, 0, 90, 40, 12)
    bg.fill({ color: 0xE0F2F1 })
    bg.roundRect(0, 0, 90, 40, 12)
    bg.stroke({ color: COLORS.secondary, width: 2 })
    btn.addChild(bg)

    const label = new Text({
      text: name,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 16, fill: COLORS.secondary, fontWeight: 'bold' },
    })
    label.anchor.set(0.5)
    label.x = 45
    label.y = 20
    btn.addChild(label)

    btn.on('pointerdown', () => {
      this._value = name.slice(0, MAX_LEN)
      this._refresh()
      AudioManager.playTick()
    })
    return btn
  }

  _append(ch) {
    if (this._value.length >= MAX_LEN) return
    this._value += ch
    this._refresh()
    AudioManager.playTick()
  }

  _delete() {
    this._value = this._value.slice(0, -1)
    this._refresh()
    AudioManager.playTick()
  }

  _confirm() {
    const name = this._value.trim() || StorageManager.getLastName() || '玩家'
    StorageManager.setLastName(name)
    AudioManager.playSuccess()
    if (this._onConfirm) this._onConfirm(name)
  }

  _refresh() {
    this._valueText.text = this._value || '请输入昵称'
    this._valueText.style.fill = this._value ? COLORS.text : 0xBBBBBB
  }

  show() {
    this._value = StorageManager.getLastName() || ''
    this._refresh()
    this.visible = true
  }

  hide() {
    this.visible = false
  }
}
