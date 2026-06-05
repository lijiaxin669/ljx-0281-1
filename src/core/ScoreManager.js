export class ScoreManager {
  constructor() {
    this.score = 0
    this.lastBonus = 0
  }

  // 计分：基础(关卡×10) + 连击奖励 + 速度奖励 + 全对奖励
  addSuccess(level, combo, orderMs, perfect) {
    let bonus = level * 10
    bonus += Math.min(combo, 10) * 2
    if (orderMs > 0 && orderMs <= 5000) bonus += 10
    if (perfect) bonus += 5
    this.score += bonus
    this.lastBonus = bonus
    return bonus
  }

  reset() {
    this.score = 0
    this.lastBonus = 0
  }

  getScore() {
    return this.score
  }
}
