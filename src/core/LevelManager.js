import { LEVEL_CONFIG, PAYMENT_NOTES } from '../config/denominations.js'
import { GAME_MODES, resolveOrderMode } from '../config/gameModes.js'
import { randomInt } from '../utils/helpers.js'

export class LevelManager {
  constructor(mode = GAME_MODES.COLLECT) {
    this.mode = mode
    this.currentLevel = 1
    this.combo = 0
    this.errors = 0
    this.totalOrders = 0
    this.currentOrder = null
  }

  setMode(mode) {
    this.mode = mode
  }

  getConfig() {
    const idx = Math.min(this.currentLevel - 1, LEVEL_CONFIG.length - 1)
    return { ...LEVEL_CONFIG[idx], level: this.currentLevel }
  }

  // 生成一张订单。返回结构：
  //   收款单 { mode:'collect', price, paid:price, target:price }
  //   找零单 { mode:'change',  price, paid,       target:paid-price }
  // target 始终是「玩家需要在收银盘里凑出的金额」。
  generateOrder() {
    const config = this.getConfig()
    const max = config.maxAmount
    const orderMode = resolveOrderMode(this.mode)

    if (orderMode === GAME_MODES.CHANGE) {
      this.currentOrder = this._makeChangeOrder(max)
    } else {
      const price = randomInt(1, max)
      this.currentOrder = { mode: GAME_MODES.COLLECT, price, paid: price, target: price }
    }
    return this.currentOrder
  }

  _makeChangeOrder(max) {
    // 价格上限略收紧，保证应找零不会过大、可用现有面额凑出
    const price = randomInt(1, Math.max(1, Math.min(max, 95)))
    const paid = this._pickPaymentNote(price)
    return {
      mode: GAME_MODES.CHANGE,
      price,
      paid,
      target: paid - price,
    }
  }

  // 顾客付款：在 >= 价格的标准面额里挑一个，偏向「刚好够付的下一档」，
  // 偶尔故意多付一档，制造更大的找零金额。
  _pickPaymentNote(price) {
    const candidates = PAYMENT_NOTES.filter((n) => n >= price)
    if (candidates.length === 0) return price
    let idx = 0
    // 30% 概率多付一档，让找零更有挑战
    if (candidates.length > 1 && Math.random() < 0.3) idx = 1
    let paid = candidates[idx]
    if (paid === price) {
      // 刚好整钞，相当于无需找零 → 强制再往上一档
      const next = candidates.find((n) => n > price)
      paid = next || price
    }
    return paid
  }

  onSuccess() {
    this.combo++
    this.totalOrders++
    this.errors = 0
    if (this.combo >= this.getConfig().comboToAdvance) {
      this.currentLevel++
      this.combo = 0
      return { levelUp: true, newLevel: this.currentLevel }
    }
    return { levelUp: false }
  }

  onError() {
    this.errors++
    this.totalOrders++
    this.combo = 0
    if (this.errors >= this.getConfig().maxErrors) {
      this.errors = 0
      this.combo = 0
      return { showAnswer: true, resetCombo: true, gameOver: true }
    }
    return { showAnswer: false, gameOver: false }
  }

  onTimeout() {
    return this.onError()
  }

  reset() {
    this.currentLevel = 1
    this.combo = 0
    this.errors = 0
    this.totalOrders = 0
    this.currentOrder = null
  }
}
