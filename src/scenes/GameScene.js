import { Container, Graphics } from 'pixi.js'
import { COLORS, DESIGN_WIDTH, DESIGN_HEIGHT, TOLERANCE } from '../config/denominations.js'
import { OrderArea } from '../components/OrderArea.js'
import { CashTray } from '../components/CashTray.js'
import { MoneyShelf } from '../components/MoneyShelf.js'
import { StatusBar } from '../components/StatusBar.js'
import { ResultPopup } from '../components/ResultPopup.js'
import { MoneyItem } from '../components/MoneyItem.js'
import { LevelManager } from '../core/LevelManager.js'
import { ScoreManager } from '../core/ScoreManager.js'
import { AudioManager } from '../managers/AudioManager.js'

export class GameScene extends Container {
  constructor(onRestart) {
    super()
    this._onRestart = onRestart
    this._levelMgr = new LevelManager()
    this._scoreMgr = new ScoreManager()
    this._targetAmount = 0
    this._currentAmount = 0
    this._countdown = 0
    this._totalTime = 0
    this._timerAccum = 0
    this._isActive = false
    this._dragClone = null
    this._dragDenom = null
    this._build()
  }

  _build() {
    const bg = new Graphics()
    bg.rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
    bg.fill({ color: COLORS.background })
    this.addChild(bg)

    this._statusBar = new StatusBar()
    this._statusBar.x = 34
    this._statusBar.y = 10
    this.addChild(this._statusBar)

    this._orderArea = new OrderArea()
    this._orderArea.x = 34
    this._orderArea.y = 80
    this.addChild(this._orderArea)

    this._cashTray = new CashTray((newAmount) => {
      this._onRemoveMoney()
    })
    this._cashTray.x = 34
    this._cashTray.y = 290
    this.addChild(this._cashTray)

    this._moneyShelf = new MoneyShelf((denom, event) => {
      this._startDrag(denom, event)
    })
    this._moneyShelf.x = 34
    this._moneyShelf.y = 490
    this.addChild(this._moneyShelf)

    this._dragLayer = new Container()
    this.addChild(this._dragLayer)

    this._resultPopup = new ResultPopup()
    this._resultPopup.setCallbacks(
      () => this._nextOrder(),
      () => { this._levelMgr.reset(); this._scoreMgr.reset(); if (this._onRestart) this._onRestart(); }
    )
    this.addChild(this._resultPopup)

    this.eventMode = 'static'
    this.on('pointermove', (e) => this._onDragMove(e))
    this.on('pointerup', () => this._onDragEnd())
    this.on('pointerupoutside', () => this._onDragEnd())
  }

  startNewGame() {
    this._levelMgr.reset()
    this._scoreMgr.reset()
    this._resultPopup.hide()
    this._newOrder()
  }

  _newOrder() {
    this._targetAmount = this._levelMgr.generateOrder()
    this._currentAmount = 0
    this._cashTray.reset()
    this._orderArea.setOrder(this._targetAmount)
    this._orderArea.hideDiff()

    const config = this._levelMgr.getConfig()
    this._countdown = config.countdown
    this._totalTime = config.countdown
    this._timerAccum = 0

    this._statusBar.setLevel(this._levelMgr.currentLevel)
    this._statusBar.setCombo(this._levelMgr.combo)
    this._statusBar.setScore(this._scoreMgr.getScore())
    this._statusBar.setTimer(this._countdown, this._totalTime)

    this._resultPopup.hide()
    this._isActive = true
  }

  _nextOrder() {
    this._newOrder()
  }

  _startDrag(denom, event) {
    if (!this._isActive) return
    if (this._dragClone) return

    this._dragDenom = denom
    this._dragClone = new MoneyItem(denom)
    this._dragClone.alpha = 0.85
    this._dragClone.scale.set(1.05)
    this._dragClone.eventMode = 'none'

    const pos = event.data.global
    this._dragClone.x = pos.x
    this._dragClone.y = pos.y
    this._dragLayer.addChild(this._dragClone)
  }

  _onDragMove(event) {
    if (!this._dragClone) return
    const pos = event.data.global
    this._dragClone.x = pos.x
    this._dragClone.y = pos.y
  }

  _onDragEnd() {
    if (!this._dragClone) return

    const pos = { x: this._dragClone.x, y: this._dragClone.y }
    const denom = this._dragDenom

    this._dragLayer.removeChild(this._dragClone)
    this._dragClone.destroy()
    this._dragClone = null
    this._dragDenom = null

    if (this._cashTray.containsPoint(pos)) {
      this._placeMoney(denom)
    }
  }

  _placeMoney(denom) {
    this._currentAmount = this._cashTray.addMoney(denom)
    AudioManager.playCoinPlace()
    this._orderArea.updateDiff(this._currentAmount)

    const diff = this._currentAmount - this._targetAmount

    if (Math.abs(diff) <= TOLERANCE) {
      this._onSuccess()
    }
  }

  _onSuccess() {
    this._isActive = false
    AudioManager.playSuccess()

    const result = this._levelMgr.onSuccess()
    const bonus = this._scoreMgr.addSuccess(this._levelMgr.currentLevel)

    this._statusBar.setCombo(this._levelMgr.combo)
    this._statusBar.setScore(this._scoreMgr.getScore())

    if (result.levelUp) {
      AudioManager.playLevelUp()
      this._statusBar.setLevel(this._levelMgr.currentLevel)
    }

    setTimeout(() => {
      this._resultPopup.showSuccess(
        this._levelMgr.combo,
        this._levelMgr.currentLevel,
        this._scoreMgr.getScore(),
        result.levelUp
      )
    }, 400)
  }

  _onOverpay() {
    AudioManager.playFail()
    const result = this._levelMgr.onError()
    this._statusBar.setCombo(this._levelMgr.combo)

    if (result.showAnswer) {
      this._isActive = false
      setTimeout(() => {
        this._resultPopup.showFail(
          this._targetAmount,
          this._currentAmount,
          this._levelMgr.errors
        )
      }, 400)
    }
  }

  _onTimeout() {
    this._isActive = false
    AudioManager.playFail()
    const result = this._levelMgr.onTimeout()
    this._statusBar.setCombo(this._levelMgr.combo)

    setTimeout(() => {
      this._resultPopup.showFail(
        this._targetAmount,
        this._currentAmount,
        this._levelMgr.errors
      )
    }, 200)
  }

  _onRemoveMoney() {
    this._currentAmount = this._cashTray.currentAmount
    this._orderArea.updateDiff(this._currentAmount)

    const diff = Math.abs(this._currentAmount - this._targetAmount)
    if (diff <= TOLERANCE && this._currentAmount > 0) {
      this._onSuccess()
    }
  }

  update(deltaTime) {
    if (!this._isActive) return

    this._timerAccum += deltaTime
    if (this._timerAccum >= 1) {
      this._timerAccum -= 1
      this._countdown = Math.max(0, this._countdown - 1)
      this._statusBar.setTimer(this._countdown, this._totalTime)

      if (this._countdown <= 5 && this._countdown > 0) {
        AudioManager.playTick()
      }

      if (this._countdown <= 0) {
        this._onTimeout()
      }
    }
  }
}
