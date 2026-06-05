import { Container, Graphics, Text } from 'pixi.js'
import { COLORS, DESIGN_WIDTH, DESIGN_HEIGHT } from '../config/denominations.js'
import { MODE_INFO } from '../config/gameModes.js'
import { AchievementManager } from '../core/AchievementManager.js'
import { AchievementPanel } from '../components/AchievementPanel.js'

export class StartScene extends Container {
  constructor(onStart) {
    super()
    this._onStart = onStart
    this._build()
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
      text: '🧒 我是小小收银员 💰',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 44, fill: COLORS.text, fontWeight: 'bold', align: 'center' },
    })
    title.anchor.set(0.5)
    title.x = DESIGN_WIDTH / 2
    title.y = 130
    this.addChild(title)

    const subtitle = new Text({
      text: '拖动硬币和纸币，凑出金额、学会找零！',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 22, fill: COLORS.secondary },
    })
    subtitle.anchor.set(0.5)
    subtitle.x = DESIGN_WIDTH / 2
    subtitle.y = 188
    this.addChild(subtitle)

    const pick = new Text({
      text: '👇 选择玩法',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 24, fill: COLORS.text, fontWeight: 'bold' },
    })
    pick.anchor.set(0.5)
    pick.x = DESIGN_WIDTH / 2
    pick.y = 252
    this.addChild(pick)

    MODE_INFO.forEach((info, i) => {
      const card = this._makeModeCard(info)
      card.x = 34
      card.y = 296 + i * 158
      this.addChild(card)
    })

    const achBtn = this._makeSmallButton('🏆 我的成就', COLORS.gold)
    achBtn.x = DESIGN_WIDTH / 2
    achBtn.y = 838
    achBtn.on('pointerdown', () => this._openAchievements())
    this.addChild(achBtn)

    const footer = new Text({
      text: '🏪 门店等候区互动游戏',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 16, fill: 0xAAAAAA },
    })
    footer.anchor.set(0.5)
    footer.x = DESIGN_WIDTH / 2
    footer.y = DESIGN_HEIGHT - 36
    this.addChild(footer)

    this._buildAchievementOverlay()
  }

  _makeModeCard(info) {
    const card = new Container()
    card.eventMode = 'static'
    card.cursor = 'pointer'

    const w = 700
    const h = 138
    const bg = new Graphics()
    bg.roundRect(0, 0, w, h, 22)
    bg.fill({ color: 0xFFFFFF })
    bg.roundRect(0, 0, w, h, 22)
    bg.stroke({ color: info.color, width: 4 })
    card.addChild(bg)

    const iconBg = new Graphics()
    iconBg.roundRect(20, 22, 94, 94, 20)
    iconBg.fill({ color: info.color, alpha: 0.15 })
    card.addChild(iconBg)

    const icon = new Text({ text: info.icon, style: { fontSize: 60 } })
    icon.anchor.set(0.5)
    icon.x = 67
    icon.y = 69
    card.addChild(icon)

    const title = new Text({
      text: info.title,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 30, fill: info.color, fontWeight: 'bold' },
    })
    title.x = 140
    title.y = 30
    card.addChild(title)

    const desc = new Text({
      text: info.desc,
      style: { fontFamily: 'Arial, sans-serif', fontSize: 19, fill: 0x777777, lineHeight: 26 },
    })
    desc.x = 140
    desc.y = 72
    card.addChild(desc)

    const arrow = new Text({
      text: '▶',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 30, fill: info.color, fontWeight: 'bold' },
    })
    arrow.anchor.set(0.5)
    arrow.x = w - 44
    arrow.y = h / 2
    card.addChild(arrow)

    card.on('pointerdown', () => {
      if (this._onStart) this._onStart(info.key)
    })
    return card
  }

  _makeSmallButton(label, color) {
    const btn = new Container()
    btn.eventMode = 'static'
    btn.cursor = 'pointer'

    const bg = new Graphics()
    bg.roundRect(-130, -28, 260, 56, 28)
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

  _buildAchievementOverlay() {
    this._achOverlay = new Container()
    this._achOverlay.visible = false
    this.addChild(this._achOverlay)

    const dim = new Graphics()
    dim.rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
    dim.fill({ color: 0x000000, alpha: 0.5 })
    dim.eventMode = 'static'
    this._achOverlay.addChild(dim)

    const panelBg = new Graphics()
    panelBg.roundRect(34, 150, 700, 720, 28)
    panelBg.fill({ color: COLORS.background })
    panelBg.roundRect(34, 150, 700, 720, 28)
    panelBg.stroke({ color: COLORS.gold, width: 4 })
    this._achOverlay.addChild(panelBg)

    const title = new Text({
      text: '🏆 成就图鉴',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 34, fill: COLORS.text, fontWeight: 'bold' },
    })
    title.anchor.set(0.5)
    title.x = DESIGN_WIDTH / 2
    title.y = 198
    this._achOverlay.addChild(title)

    this._achPanelHolder = new Container()
    this._achPanelHolder.x = 64
    this._achPanelHolder.y = 244
    this._achOverlay.addChild(this._achPanelHolder)

    const closeBtn = this._makeSmallButton('关闭', COLORS.primary)
    closeBtn.x = DESIGN_WIDTH / 2
    closeBtn.y = 824
    closeBtn.on('pointerdown', () => { this._achOverlay.visible = false })
    this._achOverlay.addChild(closeBtn)
  }

  _openAchievements() {
    this._achPanelHolder.removeChildren()
    const mgr = new AchievementManager()
    const panel = new AchievementPanel(mgr.listWithStatus(), { width: 640, cellH: 70, gap: 10 })
    this._achPanelHolder.addChild(panel)
    this._achOverlay.visible = true
  }
}
