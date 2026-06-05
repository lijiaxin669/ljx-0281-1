const STORAGE_PREFIX = 'cashier_game_'
const KEYS = {
  sound: STORAGE_PREFIX + 'sound_enabled',
  highScore: STORAGE_PREFIX + 'high_score',
  leaderboard: STORAGE_PREFIX + 'leaderboard',
  stats: STORAGE_PREFIX + 'stats',
  achievements: STORAGE_PREFIX + 'achievements',
  lastName: STORAGE_PREFIX + 'last_name',
}

const LEADERBOARD_SIZE = 10

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    /* localStorage 不可用时静默降级 */
  }
}

export const StorageManager = {
  // ---- 音效开关 ----
  getSoundEnabled() {
    const val = localStorage.getItem(KEYS.sound)
    return val === null ? true : val === 'true'
  },

  setSoundEnabled(enabled) {
    try {
      localStorage.setItem(KEYS.sound, String(enabled))
    } catch (e) { /* ignore */ }
  },

  // ---- 最高分 ----
  getHighScore() {
    return parseInt(localStorage.getItem(KEYS.highScore) || '0', 10)
  },

  setHighScore(score) {
    try {
      localStorage.setItem(KEYS.highScore, String(score))
    } catch (e) { /* ignore */ }
  },

  // ---- 排行榜 ----
  getLeaderboard() {
    const list = readJSON(KEYS.leaderboard, [])
    return Array.isArray(list) ? list : []
  },

  // 返回新榜单（已排序、截断），并标记新条目的下标，便于高亮
  addScore(entry) {
    const list = this.getLeaderboard()
    const record = {
      name: (entry.name || '玩家').slice(0, 6),
      score: entry.score || 0,
      level: entry.level || 1,
      mode: entry.mode || 'collect',
      date: entry.date || Date.now(),
    }
    list.push(record)
    list.sort((a, b) => b.score - a.score)
    const trimmed = list.slice(0, LEADERBOARD_SIZE)
    const rank = trimmed.indexOf(record)
    writeJSON(KEYS.leaderboard, trimmed)
    if (record.score > this.getHighScore()) this.setHighScore(record.score)
    return { list: trimmed, rank }
  },

  // 判断某分数能否进入榜单（用于决定是否弹出昵称录入）
  qualifiesForLeaderboard(score) {
    if (score <= 0) return false
    const list = this.getLeaderboard()
    if (list.length < LEADERBOARD_SIZE) return true
    return score > list[list.length - 1].score
  },

  clearLeaderboard() {
    writeJSON(KEYS.leaderboard, [])
  },

  // ---- 昵称记忆 ----
  getLastName() {
    return localStorage.getItem(KEYS.lastName) || ''
  },

  setLastName(name) {
    try {
      localStorage.setItem(KEYS.lastName, name)
    } catch (e) { /* ignore */ }
  },

  // ---- 终身统计 ----
  getStats() {
    return readJSON(KEYS.stats, null)
  },

  setStats(stats) {
    writeJSON(KEYS.stats, stats)
  },

  // ---- 成就 ----
  getUnlockedAchievements() {
    const list = readJSON(KEYS.achievements, [])
    return Array.isArray(list) ? list : []
  },

  setUnlockedAchievements(ids) {
    writeJSON(KEYS.achievements, ids)
  },
}
