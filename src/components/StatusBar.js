import { Container, Graphics, Text } from 'pixi.js'
import { COLORS } from '../config/denominations.js'
import { AudioManager } from '../managers/AudioManager.js'
import { TimerRing } from './TimerRing.js'

export class StatusBar extends Container {
  constructor() {
    super()
    this._level = 1
    this._combo = 0
    this._soundOn = true
    this._onSoundToggle = null
    this._build()
  }

  _build() {
    const bg = new Graphics()
    bg.roundRect(0, 0, 700, 60, 16)
    bg.fill({ color: 0xFFFFFF, alpha: 0.9 })
    bg.roundRect(0, 0, 700, 60, 16)
    bg.stroke({ color: COLORS.trayBorder, width: 2 })
    this.addChild(bg)

    this._levelBadge = new Text({
      text: '⭐ Lv.1',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 22,
        fill: COLORS.text,
        fontWeight: 'bold',
      },
    })
    this._levelBadge.anchor.set(0, 0.5)
    this._levelBadge.x = 20
    this._levelBadge.y = 30
    this.addChild(this._levelBadge)

    this._comboText = new Text({
      text: '🔥 0',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 22,
        fill: COLORS.primary,
        fontWeight: 'bold',
      },
    })
    this._comboText.anchor.set(0, 0.5)
    this._comboText.x = 160
    this._comboText.y = 30
    this.addChild(this._comboText)

    this._timerRing = new TimerRing()
    this._timerRing.x = 400
    this._timerRing.y = 30
    this.addChild(this._timerRing)

    this._timerText = new Text({
      text: '30',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 20,
        fill: COLORS.text,
        fontWeight: 'bold',
      },
    })
    this._timerText.anchor.set(0.5)
    this._timerText.x = 400
    this._timerText.y = 30
    this.addChild(this._timerText)

    this._scoreText = new Text({
      text: '🏆 0',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 20,
        fill: COLORS.gold,
        fontWeight: 'bold',
      },
    })
    this._scoreText.anchor.set(0, 0.5)
    this._scoreText.x = 470
    this._scoreText.y = 30
    this.addChild(this._scoreText)

    this._soundBtn = new Graphics()
    this._drawSoundBtn(true)
    this._soundBtn.x = 640
    this._soundBtn.y = 14
    this._soundBtn.eventMode = 'static'
    this._soundBtn.cursor = 'pointer'
    this._soundBtn.on('pointerdown', () => {
      const enabled = AudioManager.toggle()
      this._soundOn = enabled
      this._drawSoundBtn(enabled)
    })
    this.addChild(this._soundBtn)
  }

  _drawSoundBtn(on) {
    this._soundBtn.clear()
    this._soundBtn.roundRect(0, 0, 50, 32, 8)
    this._soundBtn.fill({ color: on ? COLORS.secondary : 0xBDBDBD })
    const icon = on ? '🔊' : '🔇'
    this._soundBtnLabel = this._soundBtnLabel || new Text({
      text: '',
      style: { fontSize: 18 },
    })
    this._soundBtnLabel.text = icon
    this._soundBtnLabel.anchor.set(0.5)
    this._soundBtnLabel.x = 25
    this._soundBtnLabel.y = 16
    if (!this._soundBtnLabel.parent) {
      this._soundBtn.addChild(this._soundBtnLabel)
    }
  }

  setLevel(level) {
    this._level = level
    this._levelBadge.text = `⭐ Lv.${level}`
  }

  setCombo(combo) {
    this._combo = combo
    this._comboText.text = `🔥 ${combo}`
  }

  setScore(score) {
    this._scoreText.text = `🏆 ${score}`
  }

  setTimer(seconds, total) {
    const progress = seconds / total
    this._timerRing.setProgress(progress)
    this._timerText.text = `${Math.ceil(seconds)}`
    this._timerText.style.fill = progress > 0.3 ? COLORS.text : COLORS.error
  }
}
