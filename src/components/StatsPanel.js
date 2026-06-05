import { Container, Graphics, Text } from 'pixi.js'
import { COLORS } from '../config/denominations.js'

// 统计面板：把若干 {icon,label,value} 卡片排成网格。
export class StatsPanel extends Container {
  constructor(tiles, opts = {}) {
    super()
    this._tiles = tiles || []
    this._width = opts.width || 640
    this._cols = opts.cols || 2
    this._cellH = opts.cellH || 88
    this._gap = opts.gap || 14
    this._build()
  }

  _build() {
    const cellW = (this._width - this._gap * (this._cols - 1)) / this._cols
    this._tiles.forEach((tile, idx) => {
      const col = idx % this._cols
      const row = Math.floor(idx / this._cols)
      const cell = this._buildTile(tile, cellW)
      cell.x = col * (cellW + this._gap)
      cell.y = row * (this._cellH + this._gap)
      this.addChild(cell)
    })
  }

  _buildTile(tile, cellW) {
    const cell = new Container()

    const bg = new Graphics()
    bg.roundRect(0, 0, cellW, this._cellH, 16)
    bg.fill({ color: 0xFFFFFF, alpha: 0.92 })
    bg.roundRect(0, 0, cellW, this._cellH, 16)
    bg.stroke({ color: tile.color || COLORS.secondary, width: 2 })
    cell.addChild(bg)

    const icon = new Text({ text: tile.icon || '⭐', style: { fontSize: 32 } })
    icon.anchor.set(0.5)
    icon.x = 42
    icon.y = this._cellH / 2
    cell.addChild(icon)

    const value = new Text({
      text: String(tile.value),
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 30,
        fill: tile.color || COLORS.primary,
        fontWeight: 'bold',
      },
    })
    value.x = 84
    value.y = 18
    cell.addChild(value)

    const label = new Text({
      text: tile.label,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 15, fill: 0x888888 },
    })
    label.x = 84
    label.y = 56
    cell.addChild(label)

    return cell
  }

  getContentHeight() {
    const rows = Math.ceil(this._tiles.length / this._cols)
    return rows * (this._cellH + this._gap)
  }
}
