import { Container, Graphics } from 'pixi.js'
import { COLORS, DESIGN_WIDTH, DESIGN_HEIGHT, TOLERANCE } from '../config/denominations.js'
import { GAME_MODES } from '../config/gameModes.js'
import { OrderArea } from '../components/OrderArea.js'
import { CashTray } from '../components/CashTray.js'
import { MoneyShelf } from '../components/MoneyShelf.js'
import { StatusBar } from '../components/StatusBar.js'
import { ResultPopup } from '../components/ResultPopup.js'
import { MoneyItem } from '../components/MoneyItem.js'
import { AchievementToast } from '../components/AchievementToast.js'
import { LevelManager } from '../core/LevelManager.js'
import { ScoreManager } from '../core/ScoreManager.js'
import { StatsManager } from '../core/StatsManager.js'
import { AchievementManager } from '../core/AchievementManager.js'
import { AudioManager } from '../managers/AudioManager.js'

export class GameScene extends Container {
  constructor(mode, onGameOver) {
    super()
    this._mode = mode || GAME_MODES.COLLECT
    this._onGameOver = onGameOver
    this._levelMgr = new LevelManager(this._mode)
    this._scoreMgr = new ScoreManager()
    this._statsMgr = new StatsManager()
    this._achMgr = new AchievementManager()
    this._runNewAchievements = []
    this._achMgr.setOnUnlock((ach) => {
      this._runNewAchievements.push(ach)
      if (this._toast) this._toast.enqueue(ach)
    })

    this._order = null
    this._targetAmount = 0
    this._currentAmount = 0
    this._streak = 0
    this._countdown = 0
    this._totalTime = 0
    this._timerAccum = 0
    this._isActive = false
    this._dragClone = null
    this._dragDenom = null

    // 单笔订单的过程指标（用于计分 / 成就）
    this._orderStartTime = 0
    this._coinsThisOrder = 0
    this._overshotThisOrder = false
    this._removedThisOrder = false

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
      () => this._restartRun()
    )
    this.addChild(this._resultPopup)

    this._toast = new AchievementToast()
    this.addChild(this._toast)

    this.eventMode = 'static'
    this.on('pointermove', (e) => this._onDragMove(e))
    this.on('pointerup', () => this._onDragEnd())
    this.on('pointerupoutside', () => this._onDragEnd())
  }

  startNewGame() {
    this._levelMgr.reset()
    this._scoreMgr.reset()
    this._statsMgr.startRun()
    this._streak = 0
    this._runNewAchievements = []
    this._resultPopup.hide()
    this._newOrder()
  }

  _restartRun() {
    this.startNewGame()
  }

  _newOrder() {
    this._order = this._levelMgr.generateOrder()
    this._targetAmount = this._order.target
    this._currentAmount = 0
    this._cashTray.reset()
    this._orderArea.setOrder(this._order)
    this._orderArea.hideDiff()

    const config = this._levelMgr.getConfig()
    this._countdown = config.countdown
    this._totalTime = config.countdown
    this._timerAccum = 0

    this._orderStartTime = performance.now()
    this._coinsThisOrder = 0
    this._overshotThisOrder = false
    this._removedThisOrder = false

    this._statusBar.setLevel(this._levelMgr.currentLevel)
    this._statusBar.setCombo(this._streak)
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
    this._coinsThisOrder++
    this._statsMgr.recordCoinPlaced()
    AudioManager.playCoinPlace()
    this._orderArea.updateDiff(this._currentAmount)

    const diff = this._currentAmount - this._targetAmount
    if (diff > TOLERANCE) {
      this._overshotThisOrder = true
    }
    if (Math.abs(diff) <= TOLERANCE) {
      this._onSuccess()
    }
  }

  _onRemoveMoney() {
    this._removedThisOrder = true
    this._currentAmount = this._cashTray.currentAmount
    this._orderArea.updateDiff(this._currentAmount)

    const diff = Math.abs(this._currentAmount - this._targetAmount)
    if (diff <= TOLERANCE && this._currentAmount > 0) {
      this._onSuccess()
    }
  }

  _onSuccess() {
    this._isActive = false
    AudioManager.playSuccess()

    const orderMs = performance.now() - this._orderStartTime
    const perfect = !this._overshotThisOrder && !this._removedThisOrder && this._coinsThisOrder > 0

    this._streak++
    const result = this._levelMgr.onSuccess()
    const bonus = this._scoreMgr.addSuccess(
      this._levelMgr.currentLevel,
      this._streak,
      orderMs,
      perfect
    )

    this._statsMgr.recordSuccess({
      mode: this._order.mode,
      level: this._levelMgr.currentLevel,
      combo: this._streak,
      orderMs,
      perfect,
      score: this._scoreMgr.getScore(),
      target: this._order.target,
    })

    this._statsMgr.setSessionScore(this._scoreMgr.getScore())
    this._achMgr.evaluate(this._statsMgr.snapshot())

    this._statusBar.setCombo(this._streak)
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
        result.levelUp,
        this._order.mode,
        bonus
      )
    }, 400)
  }

  _onTimeout() {
    this._isActive = false
    AudioManager.playFail()

    this._statsMgr.recordFail()
    const result = this._levelMgr.onTimeout()
    this._statusBar.setCombo(this._streak)

    if (result.gameOver) {
      setTimeout(() => this._endRun(), 300)
      return
    }

    setTimeout(() => {
      this._resultPopup.showFail(this._order, this._currentAmount)
    }, 200)
  }

  _endRun() {
    this._statsMgr.setSessionScore(this._scoreMgr.getScore())
    if (this._onGameOver) {
      this._onGameOver({
        score: this._scoreMgr.getScore(),
        level: this._levelMgr.currentLevel,
        mode: this._mode,
        stats: this._statsMgr,
        achievements: this._achMgr,
        newAchievements: this._runNewAchievements,
      })
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
