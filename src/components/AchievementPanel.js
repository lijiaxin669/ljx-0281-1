import { Container, Graphics, Text } from 'pixi.js'
import { COLORS } from '../config/denominations.js'

// 成就图鉴：网格展示全部成就，已解锁高亮、未解锁灰显。
export class AchievementPanel extends Container {
  constructor(items, opts = {}) {
    super()
    this._items = items || []
    this._width = opts.width || 640
    this._cols = opts.cols || 2
    this._cellH = opts.cellH || 76
    this._gap = opts.gap || 12
    this._build()
  }

  _build() {
    const unlocked = this._items.filter((i) => i.unlocked).length
    const total = this._items.length

    this._header = new Text({
      text: `已解锁 ${unlocked} / ${total}`,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 20, fill: COLORS.text, fontWeight: 'bold' },
    })
    this._header.anchor.set(0.5, 0)
    this._header.x = this._width / 2
    this._header.y = 0
    this.addChild(this._header)

    const gridY = 36
    const cellW = (this._width - this._gap * (this._cols - 1)) / this._cols

    this._items.forEach((item, idx) => {
      const col = idx % this._cols
      const row = Math.floor(idx / this._cols)
      const cell = this._buildCell(item, cellW)
      cell.x = col * (cellW + this._gap)
      cell.y = gridY + row * (this._cellH + this._gap)
      this.addChild(cell)
    })
  }

  _buildCell(item, cellW) {
    const cell = new Container()
    const on = item.unlocked

    const bg = new Graphics()
    bg.roundRect(0, 0, cellW, this._cellH, 14)
    bg.fill({ color: on ? 0xFFF3E0 : 0xEDEDED })
    bg.roundRect(0, 0, cellW, this._cellH, 14)
    bg.stroke({ color: on ? COLORS.gold : 0xCCCCCC, width: on ? 3 : 2 })
    cell.addChild(bg)

    const iconBg = new Graphics()
    iconBg.circle(40, this._cellH / 2, 26)
    iconBg.fill({ color: on ? COLORS.gold : 0xBDBDBD })
    cell.addChild(iconBg)

    const icon = new Text({
      text: on ? item.icon : '🔒',
      style: { fontSize: 30 },
    })
    icon.anchor.set(0.5)
    icon.x = 40
    icon.y = this._cellH / 2
    if (!on) icon.alpha = 0.9
    cell.addChild(icon)

    const name = new Text({
      text: item.name,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fill: on ? COLORS.text : 0x999999,
        fontWeight: 'bold',
      },
    })
    name.x = 78
    name.y = 14
    cell.addChild(name)

    const desc = new Text({
      text: on ? item.desc : '???',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fill: on ? 0x777777 : 0xAAAAAA,
        wordWrap: true,
        wordWrapWidth: cellW - 90,
      },
    })
    desc.x = 78
    desc.y = 40
    cell.addChild(desc)

    return cell
  }

  getContentHeight() {
    const rows = Math.ceil(this._items.length / this._cols)
    return 36 + rows * (this._cellH + this._gap)
  }
}
