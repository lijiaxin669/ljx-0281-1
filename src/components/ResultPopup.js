import { Container, Graphics, Text } from 'pixi.js'
import { COLORS } from '../config/denominations.js'
import { formatYuan } from '../utils/helpers.js'

export class ResultPopup extends Container {
  constructor() {
    super()
    this._onNext = null
    this._onRestart = null
    this.visible = false
    this._build()
  }

  _build() {
    this._overlay = new Graphics()
    this._overlay.rect(0, 0, 768, 1024)
    this._overlay.fill({ color: 0x000000, alpha: 0.45 })
    this.addChild(this._overlay)

    this._panel = new Container()
    this._panel.x = 84
    this._panel.y = 280
    this.addChild(this._panel)

    this._panelBg = new Graphics()
    this._panelBg.roundRect(0, 0, 600, 420, 28)
    this._panelBg.fill({ color: 0xFFFFFF })
    this._panelBg.roundRect(0, 0, 600, 420, 28)
    this._panelBg.stroke({ color: COLORS.primary, width: 4 })
    this._panel.addChild(this._panelBg)

    this._titleText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 42,
        fill: COLORS.success,
        fontWeight: 'bold',
      },
    })
    this._titleText.anchor.set(0.5)
    this._titleText.x = 300
    this._titleText.y = 60
    this._panel.addChild(this._titleText)

    this._subtitleText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 22,
        fill: COLORS.text,
      },
    })
    this._subtitleText.anchor.set(0.5)
    this._subtitleText.x = 300
    this._subtitleText.y = 130
    this._panel.addChild(this._subtitleText)

    this._detailText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 20,
        fill: 0x666666,
        wordWrap: true,
        wordWrapWidth: 500,
        align: 'center',
      },
    })
    this._detailText.anchor.set(0.5, 0)
    this._detailText.x = 300
    this._detailText.y = 180
    this._panel.addChild(this._detailText)

    this._nextBtn = this._createButton('下一单 →', COLORS.secondary, 300, 310)
    this._nextBtn.on('pointerdown', () => {
      if (this._onNext) this._onNext()
    })

    this._restartBtn = this._createButton('重新开始', COLORS.primary, 300, 370)
    this._restartBtn.on('pointerdown', () => {
      if (this._onRestart) this._onRestart()
    })
  }

  _createButton(label, color, x, y) {
    const btn = new Container()
    btn.x = x
    btn.y = y
    btn.eventMode = 'static'
    btn.cursor = 'pointer'

    const bg = new Graphics()
    bg.roundRect(-120, -24, 240, 48, 24)
    bg.fill({ color })
    btn.addChild(bg)

    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 22,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
      },
    })
    text.anchor.set(0.5)
    btn.addChild(text)

    this._panel.addChild(btn)
    return btn
  }

  showSuccess(combo, level, score, levelUp) {
    this.visible = true
    this._titleText.text = levelUp ? '🎉 升级啦！' : '✅ 太棒了！'
    this._titleText.style.fill = COLORS.success
    this._subtitleText.text = `连击 ${combo} | 关卡 Lv.${level} | 得分 ${score}`
    this._detailText.text = levelUp ? '难度提升，订单金额更大，时间更短！' : '继续加油，保持连击！'
  }

  showFail(targetAmount, currentAmount, errors) {
    this.visible = true
    this._titleText.text = '😅 再来一次'
    this._titleText.style.fill = COLORS.error
    this._subtitleText.text = `正确答案: ¥${formatYuan(targetAmount)}`
    if (currentAmount > targetAmount + 0.01) {
      this._detailText.text = `你付了 ¥${formatYuan(currentAmount)}，多付了 ¥${formatYuan(currentAmount - targetAmount)}`
    } else if (currentAmount > 0.01) {
      this._detailText.text = `你付了 ¥${formatYuan(currentAmount)}，还差 ¥${formatYuan(targetAmount - currentAmount)}`
    } else {
      this._detailText.text = '时间到啦，下次加油！'
    }
  }

  hide() {
    this.visible = false
  }

  setCallbacks(onNext, onRestart) {
    this._onNext = onNext
    this._onRestart = onRestart
  }
}
