import { ACHIEVEMENTS, getAchievement } from '../config/achievements.js'
import { StorageManager } from '../managers/StorageManager.js'

// 负责评估成就解锁状态。解锁后立刻持久化，并把「本次新解锁」的成就
// 通过回调抛给上层（用于弹出 Toast / 在结算页展示）。
export class AchievementManager {
  constructor() {
    this._unlocked = new Set(StorageManager.getUnlockedAchievements())
    this._onUnlock = null
  }

  setOnUnlock(cb) {
    this._onUnlock = cb
  }

  isUnlocked(id) {
    return this._unlocked.has(id)
  }

  getUnlockedIds() {
    return [...this._unlocked]
  }

  getProgress() {
    return { unlocked: this._unlocked.size, total: ACHIEVEMENTS.length }
  }

  // 根据统计快照评估所有成就，返回本次新解锁的成就数组
  evaluate(snapshot) {
    const newly = []
    for (const ach of ACHIEVEMENTS) {
      if (this._unlocked.has(ach.id)) continue
      let ok = false
      try {
        ok = !!ach.condition(snapshot)
      } catch (e) {
        ok = false
      }
      if (ok) {
        this._unlocked.add(ach.id)
        newly.push(ach)
      }
    }
    if (newly.length > 0) {
      StorageManager.setUnlockedAchievements([...this._unlocked])
      if (this._onUnlock) {
        for (const ach of newly) this._onUnlock(ach)
      }
    }
    return newly
  }

  // 返回所有成就 + 是否解锁，用于图鉴展示
  listWithStatus() {
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: this._unlocked.has(a.id) }))
  }

  static byId(id) {
    return getAchievement(id)
  }
}
