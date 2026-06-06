import { StorageManager } from '../managers/StorageManager.js'
import { GAME_MODES } from '../config/gameModes.js'

const DEFAULT_LIFETIME = {
  totalSuccess: 0,
  totalFail: 0,
  collectSuccess: 0,
  changeSuccess: 0,
  bestCombo: 0,
  maxLevel: 1,
  totalCoinsPlaced: 0,
  fastestOrderMs: 0,
  bestPerfectStreak: 0,
}

// 统一管理「终身统计」(持久化) 与「本局统计」(易失)。
// snapshot() 会把两者合并成成就系统可消费的快照。
export class StatsManager {
  constructor() {
    const stored = StorageManager.getStats() || {}
    this._lifetime = { ...DEFAULT_LIFETIME }
    Object.keys(DEFAULT_LIFETIME).forEach((key) => {
      const val = stored[key]
      if (typeof val === 'number' && !isNaN(val)) {
        this._lifetime[key] = val
      }
    })
    this._resetSession()
  }

  _resetSession() {
    this._session = {
      score: 0,
      orders: 0,
      success: 0,
      fail: 0,
      collectSuccess: 0,
      changeSuccess: 0,
      bestCombo: 0,
      maxLevel: 1,
      coinsPlaced: 0,
      perfectStreak: 0,
      bestPerfectStreak: 0,
      fastestOrderMs: 0,
      totalChangeGiven: 0,
    }
  }

  startRun() {
    this._resetSession()
  }

  // 记录单枚货币放入（含撤回后再放入都计数）
  recordCoinPlaced() {
    this._session.coinsPlaced = this._safeNum(this._session.coinsPlaced) + 1
    this._lifetime.totalCoinsPlaced = this._safeNum(this._lifetime.totalCoinsPlaced) + 1
  }

  // 成功完成一单
  recordSuccess({ mode, level, combo, orderMs, perfect, score, target }) {
    const s = this._session
    s.success = this._safeNum(s.success) + 1
    s.orders = this._safeNum(s.orders) + 1
    s.score = this._safeNum(score)
    s.bestCombo = Math.max(this._safeNum(s.bestCombo), this._safeNum(combo))
    s.maxLevel = Math.max(this._safeNum(s.maxLevel), this._safeNum(level))

    if (mode === GAME_MODES.CHANGE) {
      s.changeSuccess = this._safeNum(s.changeSuccess) + 1
      s.totalChangeGiven = this._safeNum(s.totalChangeGiven) + this._safeNum(target)
      this._lifetime.changeSuccess = this._safeNum(this._lifetime.changeSuccess) + 1
    } else {
      s.collectSuccess = this._safeNum(s.collectSuccess) + 1
      this._lifetime.collectSuccess = this._safeNum(this._lifetime.collectSuccess) + 1
    }

    if (perfect) {
      s.perfectStreak = this._safeNum(s.perfectStreak) + 1
      s.bestPerfectStreak = Math.max(this._safeNum(s.bestPerfectStreak), this._safeNum(s.perfectStreak))
    } else {
      s.perfectStreak = 0
    }

    const safeOrderMs = this._safeNum(orderMs)
    if (safeOrderMs > 0 && (this._safeNum(s.fastestOrderMs) === 0 || safeOrderMs < this._safeNum(s.fastestOrderMs))) {
      s.fastestOrderMs = safeOrderMs
    }

    this._lifetime.totalSuccess = this._safeNum(this._lifetime.totalSuccess) + 1
    this._lifetime.bestCombo = Math.max(this._safeNum(this._lifetime.bestCombo), this._safeNum(combo))
    this._lifetime.maxLevel = Math.max(this._safeNum(this._lifetime.maxLevel), this._safeNum(level))
    this._lifetime.bestPerfectStreak = Math.max(
      this._safeNum(this._lifetime.bestPerfectStreak),
      this._safeNum(s.bestPerfectStreak)
    )
    if (safeOrderMs > 0 && (this._safeNum(this._lifetime.fastestOrderMs) === 0 || safeOrderMs < this._safeNum(this._lifetime.fastestOrderMs))) {
      this._lifetime.fastestOrderMs = safeOrderMs
    }

    this._persist()
  }

  recordFail() {
    this._session.fail = this._safeNum(this._session.fail) + 1
    this._session.orders = this._safeNum(this._session.orders) + 1
    this._session.perfectStreak = 0
    this._lifetime.totalFail = this._safeNum(this._lifetime.totalFail) + 1
    this._persist()
  }

  setSessionScore(score) {
    this._session.score = score
  }

  _persist() {
    StorageManager.setStats(this._lifetime)
  }

  getSession() {
    return { ...this._session }
  }

  getLifetime() {
    return { ...this._lifetime }
  }

  _safeNum(val, fallback = 0) {
    return typeof val === 'number' && !isNaN(val) ? val : fallback
  }

  // 合并快照：把本局可能超过终身记录的字段取较大值，
  // highScore 取「历史最高分」与「本局得分」的较大者。
  snapshot() {
    const high = Math.max(this._safeNum(StorageManager.getHighScore()), this._safeNum(this._session.score))
    return {
      totalSuccess: this._safeNum(this._lifetime.totalSuccess),
      totalFail: this._safeNum(this._lifetime.totalFail),
      collectSuccess: this._safeNum(this._lifetime.collectSuccess),
      changeSuccess: this._safeNum(this._lifetime.changeSuccess),
      bestCombo: Math.max(this._safeNum(this._lifetime.bestCombo), this._safeNum(this._session.bestCombo)),
      maxLevel: Math.max(this._safeNum(this._lifetime.maxLevel), this._safeNum(this._session.maxLevel)),
      totalCoinsPlaced: this._safeNum(this._lifetime.totalCoinsPlaced),
      fastestOrderMs: this._safeNum(this._lifetime.fastestOrderMs),
      bestPerfectStreak: Math.max(this._safeNum(this._lifetime.bestPerfectStreak), this._safeNum(this._session.bestPerfectStreak)),
      highScore: high,
    }
  }
}
