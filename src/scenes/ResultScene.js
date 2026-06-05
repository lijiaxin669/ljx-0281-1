import { Container, Graphics, Text } from 'pixi.js'
import { COLORS, DESIGN_WIDTH, DESIGN_HEIGHT } from '../config/denominations.js'
import { GAME_MODES, getModeInfo } from '../config/gameModes.js'
import { StorageManager } from '../managers/StorageManager.js'
import { Leaderboard } from '../components/Leaderboard.js'
import { AchievementPanel } from '../components/AchievementPanel.js'
import { StatsPanel } from '../components/StatsPanel.js'
import { NameInput } from '../components/NameInput.js'

const CONTENT_X = 34
const CONTENT_Y = 300
const CONTENT_W = 700

// 结算大厅：本局得分 + 排行榜 / 成就图鉴 / 数据统计三个标签页。
export class ResultScene extends Container {
  constructor(opts) {
    super()
    this._score = opts.score || 0
    this._level = opts.level || 1
    this._mode = opts.mode || GAME_MODES.COLLECT
    this._stats = opts.stats // StatsManager
    this._achMgr = opts.achievements // AchievementManager
    this._newAchievements = opts.newAchievements || []
    this._onPlayAgain = opts.onPlayAgain
    this._onHome = opts.onHome

    this._lbList = StorageManager.getLeaderboard()
    this._lbHighlight = -1
    this._currentTab = this._newAchievements.length > 0 ? 'ach' : 'board'
    this._tabButtons = {}

    this._build()
    this._maybePromptName()
  }

  _build() {
    const bg = new Graphics()
    bg.rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
    bg.fill({ color: COLORS.background })
    this.addChild(bg)

    const topDeco = new Graphics()
    topDeco.rect(0, 0, DESIGN_WIDTH, 8)
    topDeco.fill({ color: COLORS.primary })
    this.addChild(topDeco)

    const title = new Text({
      text: '🏁 本局结束',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 40, fill: COLORS.text, fontWeight: 'bold' },
    })
    title.anchor.set(0.5)
    title.x = DESIGN_WIDTH / 2
    title.y = 54
    this.addChild(title)

    const scoreText = new Text({
      text: `🏆 ${this._score}`,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 72, fill: COLORS.gold, fontWeight: 'bold' },
    })
    scoreText.anchor.set(0.5)
    scoreText.x = DESIGN_WIDTH / 2
    scoreText.y = 130
    this.addChild(scoreText)

    const modeInfo = getModeInfo(this._mode)
    const sub = new Text({
      text: `关卡 Lv.${this._level} · ${modeInfo.icon} ${modeInfo.title} · 历史最高 ${StorageManager.getHighScore()}`,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 18, fill: COLORS.text },
    })
    sub.anchor.set(0.5)
    sub.x = DESIGN_WIDTH / 2
    sub.y = 184
    this.addChild(sub)

    if (this._newAchievements.length > 0) {
      const banner = new Text({
        text: `🎉 本局解锁 ${this._newAchievements.length} 个新成就！`,
        style: { fontFamily: 'Arial, sans-serif', fontSize: 20, fill: COLORS.success, fontWeight: 'bold' },
      })
      banner.anchor.set(0.5)
      banner.x = DESIGN_WIDTH / 2
      banner.y = 216
      this.addChild(banner)
    }

    this._buildTabs()

    this._content = new Container()
    this._content.x = CONTENT_X
    this._content.y = CONTENT_Y
    this.addChild(this._content)

    this._buildButtons()

    this._nameInput = new NameInput((name) => this._onNameConfirm(name))
    this.addChild(this._nameInput)

    this._renderTab()
  }

  _buildTabs() {
    const tabs = [
      { key: 'board', label: '🏆 排行榜' },
      { key: 'ach', label: '⭐ 成就' },
      { key: 'stats', label: '📊 统计' },
    ]
    const tabW = 220
    const gap = 12
    const totalW = tabs.length * tabW + (tabs.length - 1) * gap
    const startX = (DESIGN_WIDTH - totalW) / 2
    const y = 248

    tabs.forEach((tab, i) => {
      const btn = new Container()
      btn.x = startX + i * (tabW + gap)
      btn.y = y
      btn.eventMode = 'static'
      btn.cursor = 'pointer'

      const bg = new Graphics()
      btn.addChild(bg)
      btn._bg = bg

      const label = new Text({
        text: tab.label,
        style: { fontFamily: 'Arial, sans-serif', fontSize: 20, fontWeight: 'bold', fill: COLORS.text },
      })
      label.anchor.set(0.5)
      label.x = tabW / 2
      label.y = 22
      btn.addChild(label)
      btn._label = label
      btn._w = tabW

      btn.on('pointerdown', () => {
        this._currentTab = tab.key
        this._renderTab()
      })

      this.addChild(btn)
      this._tabButtons[tab.key] = btn
    })
    this._refreshTabStyles()
  }

  _refreshTabStyles() {
    Object.entries(this._tabButtons).forEach(([key, btn]) => {
      const active = key === this._currentTab
      btn._bg.clear()
      btn._bg.roundRect(0, 0, btn._w, 44, 14)
      btn._bg.fill({ color: active ? COLORS.primary : 0xFFFFFF })
      btn._bg.roundRect(0, 0, btn._w, 44, 14)
      btn._bg.stroke({ color: active ? COLORS.primary : 0xDDDDDD, width: 2 })
      btn._label.style.fill = active ? 0xFFFFFF : COLORS.text
    })
  }

  _renderTab() {
    this._refreshTabStyles()
    this._content.removeChildren()

    let panel
    if (this._currentTab === 'board') {
      panel = new Leaderboard(this._lbList, { width: CONTENT_W, highlightRank: this._lbHighlight })
    } else if (this._currentTab === 'ach') {
      panel = new AchievementPanel(this._achMgr.listWithStatus(), { width: CONTENT_W })
    } else {
      panel = new StatsPanel(this._buildStatTiles(), { width: CONTENT_W })
    }
    this._content.addChild(panel)
  }

  _buildStatTiles() {
    const s = this._stats.getSession()
    const life = this._stats.getLifetime()
    const fastest = s.fastestOrderMs > 0 ? `${(s.fastestOrderMs / 1000).toFixed(1)}s` : '—'
    return [
      { icon: '🏆', value: this._score, label: '本局得分', color: COLORS.gold },
      { icon: '🧾', value: s.success, label: '完成订单', color: COLORS.secondary },
      { icon: '🔥', value: s.bestCombo, label: '最高连击', color: COLORS.primary },
      { icon: '⭐', value: `Lv.${s.maxLevel}`, label: '最高关卡', color: COLORS.text },
      { icon: '💸', value: s.changeSuccess, label: '找零完成', color: COLORS.primary },
      { icon: '🚀', value: fastest, label: '最快一单', color: COLORS.secondary },
      { icon: '✨', value: s.bestPerfectStreak, label: '全对连击', color: COLORS.success },
      { icon: '📚', value: life.totalSuccess, label: '累计订单', color: COLORS.text },
    ]
  }

  _buildButtons() {
    const again = this._makeButton('🔁 再玩一次', COLORS.secondary)
    again.x = DESIGN_WIDTH / 2 - 170
    again.y = 944
    again.on('pointerdown', () => { if (this._onPlayAgain) this._onPlayAgain() })
    this.addChild(again)

    const home = this._makeButton('🏠 返回首页', COLORS.primary)
    home.x = DESIGN_WIDTH / 2 + 170
    home.y = 944
    home.on('pointerdown', () => { if (this._onHome) this._onHome() })
    this.addChild(home)
  }

  _makeButton(label, color) {
    const btn = new Container()
    btn.eventMode = 'static'
    btn.cursor = 'pointer'

    const bg = new Graphics()
    bg.roundRect(-150, -32, 300, 64, 32)
    bg.fill({ color })
    btn.addChild(bg)

    const text = new Text({
      text: label,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 24, fill: 0xFFFFFF, fontWeight: 'bold' },
    })
    text.anchor.set(0.5)
    btn.addChild(text)
    return btn
  }

  _maybePromptName() {
    if (StorageManager.qualifiesForLeaderboard(this._score)) {
      this._nameInput.show()
    }
  }

  _onNameConfirm(name) {
    const res = StorageManager.addScore({
      name,
      score: this._score,
      level: this._level,
      mode: this._mode,
    })
    this._lbList = res.list
    this._lbHighlight = res.rank
    this._nameInput.hide()
    this._currentTab = 'board'
    this._renderTab()
  }
}
