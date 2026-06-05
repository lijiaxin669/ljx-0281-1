import { Container, Graphics, Text } from 'pixi.js'
import { COLORS } from '../config/denominations.js'
import { GAME_MODES } from '../config/gameModes.js'

const MODE_LABEL = {
  [GAME_MODES.COLLECT]: '收款',
  [GAME_MODES.CHANGE]: '找零',
  [GAME_MODES.MIXED]: '混合',
}

const MEDALS = ['🥇', '🥈', '🥉']

// 排行榜：展示 top-N 记录，可高亮本局刚插入的名次。
export class Leaderboard extends Container {
  constructor(list, opts = {}) {
    super()
    this._list = list || []
    this._width = opts.width || 640
    this._highlight = opts.highlightRank ?? -1
    this._rowH = opts.rowH || 46
    this._build()
  }

  _build() {
    if (this._list.length === 0) {
      const empty = new Text({
        text: '还没有记录哦～\n快来成为第一名！',
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 22,
          fill: 0x999999,
          align: 'center',
          lineHeight: 34,
        },
      })
      empty.anchor.set(0.5, 0)
      empty.x = this._width / 2
      empty.y = 60
      this.addChild(empty)
      return
    }

    this._list.forEach((entry, idx) => {
      const row = this._buildRow(entry, idx)
      row.y = idx * (this._rowH + 6)
      this.addChild(row)
    })
  }

  _buildRow(entry, idx) {
    const row = new Container()
    const isMe = idx === this._highlight

    const bg = new Graphics()
    bg.roundRect(0, 0, this._width, this._rowH, 12)
    bg.fill({ color: isMe ? 0xFFE3C2 : 0xFFFFFF, alpha: isMe ? 1 : 0.85 })
    if (isMe) {
      bg.roundRect(0, 0, this._width, this._rowH, 12)
      bg.stroke({ color: COLORS.primary, width: 3 })
    }
    row.addChild(bg)

    const rankText = new Text({
      text: idx < 3 ? MEDALS[idx] : `${idx + 1}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: idx < 3 ? 26 : 20,
        fill: COLORS.text,
        fontWeight: 'bold',
      },
    })
    rankText.anchor.set(0.5)
    rankText.x = 34
    rankText.y = this._rowH / 2
    row.addChild(rankText)

    const name = new Text({
      text: entry.name || '玩家',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 20, fill: COLORS.text, fontWeight: 'bold' },
    })
    name.anchor.set(0, 0.5)
    name.x = 70
    name.y = this._rowH / 2
    row.addChild(name)

    const meta = new Text({
      text: `Lv.${entry.level} · ${MODE_LABEL[entry.mode] || '收款'}`,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 14, fill: 0x999999 },
    })
    meta.anchor.set(0, 0.5)
    meta.x = 240
    meta.y = this._rowH / 2
    row.addChild(meta)

    const score = new Text({
      text: `${entry.score}`,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 24, fill: COLORS.gold, fontWeight: 'bold' },
    })
    score.anchor.set(1, 0.5)
    score.x = this._width - 18
    score.y = this._rowH / 2
    row.addChild(score)

    return row
  }
}
