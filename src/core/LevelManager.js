import { LEVEL_CONFIG } from '../config/denominations.js'

export class LevelManager {
  constructor() {
    this.currentLevel = 1
    this.combo = 0
    this.errors = 0
    this.totalOrders = 0
  }

  getConfig() {
    const idx = Math.min(this.currentLevel - 1, LEVEL_CONFIG.length - 1)
    return { ...LEVEL_CONFIG[idx], level: this.currentLevel }
  }

  generateOrder() {
    const config = this.getConfig()
    const min = 1
    const max = config.maxAmount
    return Math.floor(Math.random() * (max - min + 1)) + min
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
    if (this.errors >= this.getConfig().maxErrors) {
      const showAnswer = true
      this.errors = 0
      this.combo = 0
      return { showAnswer, resetCombo: true }
    }
    return { showAnswer: false }
  }

  onTimeout() {
    return this.onError()
  }

  reset() {
    this.currentLevel = 1
    this.combo = 0
    this.errors = 0
    this.totalOrders = 0
  }
}
