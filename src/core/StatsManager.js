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
    this._lifetime = { ...DEFAULT_LIFETIME, ...(StorageManager.getStats() || {}) }
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
    this._session.coinsPlaced += 1
    this._lifetime.totalCoinsPlaced += 1
  }

  // 成功完成一单
  recordSuccess({ mode, level, combo, orderMs, perfect, score, target }) {
    const s = this._session
    s.success += 1
    s.orders += 1
    s.score = score
    s.bestCombo = Math.max(s.bestCombo, combo)
    s.maxLevel = Math.max(s.maxLevel, level)

    if (mode === GAME_MODES.CHANGE) {
      s.changeSuccess += 1
      s.totalChangeGiven += target || 0
      this._lifetime.changeSuccess += 1
    } else {
      s.collectSuccess += 1
      this._lifetime.collectSuccess += 1
    }

    if (perfect) {
      s.perfectStreak += 1
      s.bestPerfectStreak = Math.max(s.bestPerfectStreak, s.perfectStreak)
    } else {
      s.perfectStreak = 0
    }

    if (orderMs > 0 && (s.fastestOrderMs === 0 || orderMs < s.fastestOrderMs)) {
      s.fastestOrderMs = orderMs
    }

    this._lifetime.totalSuccess += 1
    this._lifetime.bestCombo = Math.max(this._lifetime.bestCombo, combo)
    this._lifetime.maxLevel = Math.max(this._lifetime.maxLevel, level)
    this._lifetime.bestPerfectStreak = Math.max(
      this._lifetime.bestPerfectStreak,
      s.bestPerfectStreak
    )
    if (orderMs > 0 && (this._lifetime.fastestOrderMs === 0 || orderMs < this._lifetime.fastestOrderMs)) {
      this._lifetime.fastestOrderMs = orderMs
    }

    this._persist()
  }

  recordFail() {
    this._session.fail += 1
    this._session.orders += 1
    this._session.perfectStreak = 0
    this._lifetime.totalFail += 1
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

  // 合并快照：把本局可能超过终身记录的字段取较大值，
  // highScore 取「历史最高分」与「本局得分」的较大者。
  snapshot() {
    const high = Math.max(StorageManager.getHighScore(), this._session.score)
    return {
      totalSuccess: this._lifetime.totalSuccess,
      totalFail: this._lifetime.totalFail,
      collectSuccess: this._lifetime.collectSuccess,
      changeSuccess: this._session.collectSuccess,
      bestCombo: Math.max(this._lifetime.bestCombo, this._session.bestCombo),
      maxLevel: Math.max(this._lifetime.maxLevel, this._session.maxLevel),
      totalCoinsPlaced: this._lifetime.totalCoinsPlaced,
      fastestOrderMs: this._lifetime.fastestOrderMs,
      bestPerfectStreak: Math.max(this._lifetime.bestPerfectStreak, this._session.bestPerfectStreak),
      highScore: high,
    }
  }
}
