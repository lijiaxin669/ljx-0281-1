import { Container, Graphics, Text } from 'pixi.js'
import { COLORS, DESIGN_WIDTH, DESIGN_HEIGHT } from '../config/denominations.js'

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
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 48,
        fill: COLORS.text,
        fontWeight: 'bold',
        align: 'center',
      },
    })
    title.anchor.set(0.5)
    title.x = DESIGN_WIDTH / 2
    title.y = 220
    this.addChild(title)

    const subtitle = new Text({
      text: '拖动硬币和纸币，凑出应付金额！',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 24,
        fill: COLORS.secondary,
      },
    })
    subtitle.anchor.set(0.5)
    subtitle.x = DESIGN_WIDTH / 2
    subtitle.y = 310
    this.addChild(subtitle)

    const rules = new Text({
      text: '🎮 游戏规则\n\n✅ 拖拽硬币/纸币到收银盘\n✅ 凑出和订单一样的金额\n✅ 连续5次成功可以升级\n✅ 错误3次会提示正确答案\n✅ 注意倒计时哦！',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 20,
        fill: COLORS.text,
        lineHeight: 34,
        align: 'left',
      },
    })
    rules.anchor.set(0.5, 0)
    rules.x = DESIGN_WIDTH / 2
    rules.y = 380
    this.addChild(rules)

    const btnBg = new Graphics()
    btnBg.roundRect(-140, -35, 280, 70, 35)
    btnBg.fill({ color: COLORS.primary })
    btnBg.roundRect(-140, -35, 280, 70, 35)
    btnBg.stroke({ color: 0xE67A35, width: 3 })

    const btnContainer = new Container()
    btnContainer.x = DESIGN_WIDTH / 2
    btnContainer.y = 750
    btnContainer.eventMode = 'static'
    btnContainer.cursor = 'pointer'
    btnContainer.addChild(btnBg)

    const btnText = new Text({
      text: '🎮 开始游戏',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 30,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
      },
    })
    btnText.anchor.set(0.5)
    btnContainer.addChild(btnText)

    btnContainer.on('pointerdown', () => {
      if (this._onStart) this._onStart()
    })

    this.addChild(btnContainer)

    const footer = new Text({
      text: '🏪 门店等候区互动游戏',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fill: 0xAAAAAA,
      },
    })
    footer.anchor.set(0.5)
    footer.x = DESIGN_WIDTH / 2
    footer.y = DESIGN_HEIGHT - 40
    this.addChild(footer)
  }
}
