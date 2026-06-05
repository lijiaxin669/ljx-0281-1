export class ScoreManager {
  constructor() {
    this.score = 0
  }

  addSuccess(level) {
    const bonus = level * 10
    this.score += bonus
    return bonus
  }

  reset() {
    this.score = 0
  }

  getScore() {
    return this.score
  }
}
