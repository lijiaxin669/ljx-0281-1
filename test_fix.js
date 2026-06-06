// 测试修复的验证脚本

// 模拟 localStorage
class MockStorage {
  constructor() {
    this.data = {}
  }
  getItem(key) {
    return this.data[key] || null
  }
  setItem(key, value) {
    this.data[key] = value
  }
  removeItem(key) {
    delete this.data[key]
  }
  clear() {
    this.data = {}
  }
}

const mockStorage = new MockStorage()

// 模拟 StorageManager
const KEYS = {
  stats: 'cashier_stats',
  highScore: 'cashier_high_score',
  achievements: 'cashier_achievements',
}

function writeJSON(key, value) {
  try {
    mockStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('writeJSON error:', e)
  }
}

function readJSON(key, fallback = null) {
  try {
    const raw = mockStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    return fallback
  }
}

const StorageManager = {
  getStats: () => readJSON(KEYS.stats),
  setStats: (stats) => writeJSON(KEYS.stats, stats),
  getHighScore: () => readJSON(KEYS.highScore, 0),
  setHighScore: (score) => writeJSON(KEYS.highScore, score),
  getAchievements: () => readJSON(KEYS.achievements, {}),
  setAchievements: (ach) => writeJSON(KEYS.achievements, ach),
}

// 游戏模式
const GAME_MODES = {
  COLLECT: 'collect',
  CHANGE: 'change',
  MIXED: 'mixed',
}

// 默认统计
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

// StatsManager 实现（使用修复后的代码）
class StatsManager {
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
      success: 0,
      fail: 0,
      orders: 0,
      coinsPlaced: 0,
      changeSuccess: 0,
      collectSuccess: 0,
      totalChangeGiven: 0,
      bestCombo: 0,
      maxLevel: 1,
      perfectStreak: 0,
      bestPerfectStreak: 0,
      fastestOrderMs: 0,
    }
  }

  startRun() {
    this._resetSession()
  }

  _safeNum(val, fallback = 0) {
    return typeof val === 'number' && !isNaN(val) ? val : fallback
  }

  recordCoinPlaced() {
    this._session.coinsPlaced = this._safeNum(this._session.coinsPlaced) + 1
    this._lifetime.totalCoinsPlaced = this._safeNum(this._lifetime.totalCoinsPlaced) + 1
  }

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

// 成就定义
const ACHIEVEMENTS = [
  {
    id: 'change_master',
    name: '找零达人',
    description: '累计完成 10 笔找零单',
    condition: (s) => s.changeSuccess >= 10,
  },
]

// AchievementManager 实现
class AchievementManager {
  constructor() {
    this._unlocked = StorageManager.getAchievements()
  }

  evaluate(snapshot) {
    const newly = []
    ACHIEVEMENTS.forEach((a) => {
      if (!this._unlocked[a.id] && a.condition(snapshot)) {
        this._unlocked[a.id] = true
        newly.push(a)
      }
    })
    if (newly.length > 0) {
      StorageManager.setAchievements(this._unlocked)
    }
    return newly
  }

  isUnlocked(id) {
    return !!this._unlocked[id]
  }

  getAll() {
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: !!this._unlocked[a.id],
    }))
  }
}

// LevelManager 相关测试
const PAYMENT_NOTES = [5, 10, 20, 50, 100]

function _pickPaymentNote(price) {
  const candidates = PAYMENT_NOTES.filter((n) => n >= price)
  if (candidates.length === 0) {
    return Math.max(...PAYMENT_NOTES) > price ? Math.max(...PAYMENT_NOTES) : price + 1
  }
  let idx = 0
  if (candidates.length > 1 && Math.random() < 0.3) idx = 1
  let paid = candidates[idx]
  if (paid === price) {
    const next = candidates.find((n) => n > price)
    paid = next || (candidates[candidates.length - 1] > price ? candidates[candidates.length - 1] : price + 1)
  }
  return paid
}

// ========== 测试开始 ==========
console.log('========== 开始测试修复 ==========\n')

// 测试 1: StatsManager 构造函数处理无效数据
console.log('测试 1: StatsManager 构造函数处理无效数据')
mockStorage.clear()
// 存储无效数据
writeJSON(KEYS.stats, {
  changeSuccess: NaN,
  totalSuccess: 'not a number',
  collectSuccess: null,
  bestCombo: undefined,
  validField: 5,
})
const stats1 = new StatsManager()
console.log('  存储的无效数据:', JSON.stringify(readJSON(KEYS.stats)))
console.log('  加载后的 lifetime:', JSON.stringify(stats1.getLifetime()))
const valid = Object.values(stats1.getLifetime()).every(v => typeof v === 'number' && !isNaN(v))
console.log('  所有字段都是有效数字:', valid ? '✅ 通过' : '❌ 失败')
console.log()

// 测试 2: 记录找零单并验证统计
console.log('测试 2: 记录找零单并验证统计')
mockStorage.clear()
const stats2 = new StatsManager()
const achMgr2 = new AchievementManager()

// 完成 15 笔找零单
for (let i = 0; i < 15; i++) {
  stats2.recordSuccess({
    mode: GAME_MODES.CHANGE,
    level: 1,
    combo: i + 1,
    orderMs: 5000,
    perfect: true,
    score: (i + 1) * 100,
    target: 5,
  })
  const snapshot = stats2.snapshot()
  achMgr2.evaluate(snapshot)
}

const session2 = stats2.getSession()
const lifetime2 = stats2.getLifetime()
console.log('  本局找零完成数:', session2.changeSuccess)
console.log('  终身找零完成数:', lifetime2.changeSuccess)
console.log('  快照 changeSuccess:', stats2.snapshot().changeSuccess)
console.log('  找零达人成就解锁:', achMgr2.isUnlocked('change_master') ? '✅ 通过' : '❌ 失败')
console.log()

// 测试 3: 混合模式下交替记录收款和找零
console.log('测试 3: 混合模式下交替记录收款和找零')
mockStorage.clear()
const stats3 = new StatsManager()
const achMgr3 = new AchievementManager()

// 完成 8 笔找零单和 7 笔收款单
for (let i = 0; i < 15; i++) {
  const isChange = i % 2 === 0
  stats3.recordSuccess({
    mode: isChange ? GAME_MODES.CHANGE : GAME_MODES.COLLECT,
    level: 1,
    combo: i + 1,
    orderMs: 5000,
    perfect: true,
    score: (i + 1) * 100,
    target: isChange ? 5 : 10,
  })
}

const session3 = stats3.getSession()
const lifetime3 = stats3.getLifetime()
console.log('  本局找零完成数:', session3.changeSuccess)
console.log('  本局收款完成数:', session3.collectSuccess)
console.log('  终身找零完成数:', lifetime3.changeSuccess)
console.log('  终身收款完成数:', lifetime3.collectSuccess)
console.log('  快照 changeSuccess:', stats3.snapshot().changeSuccess)
console.log('  找零达人成就解锁 (需要 10 笔，实际 8 笔):', !achMgr3.evaluate(stats3.snapshot()).length ? '✅ 通过 (未解锁)' : '❌ 失败')

// 再完成 3 笔找零单
for (let i = 0; i < 3; i++) {
  stats3.recordSuccess({
    mode: GAME_MODES.CHANGE,
    level: 1,
    combo: 1,
    orderMs: 5000,
    perfect: true,
    score: 100,
    target: 5,
  })
}
const newAch = achMgr3.evaluate(stats3.snapshot())
console.log('  再完成 3 笔找零单后，终身找零完成数:', stats3.getLifetime().changeSuccess)
console.log('  找零达人成就解锁:', newAch.length > 0 && newAch[0].id === 'change_master' ? '✅ 通过' : '❌ 失败')
console.log()

// 测试 4: 确保 snapshot 不会返回 NaN
console.log('测试 4: 确保 snapshot 不会返回 NaN')
mockStorage.clear()
// 故意存储一些无效值
writeJSON(KEYS.stats, {
  changeSuccess: NaN,
  totalSuccess: NaN,
  bestCombo: NaN,
})
const stats4 = new StatsManager()
// 记录一些数据
for (let i = 0; i < 5; i++) {
  stats4.recordSuccess({
    mode: GAME_MODES.CHANGE,
    level: 1,
    combo: i + 1,
    orderMs: NaN, // 故意传入 NaN
    perfect: true,
    score: NaN, // 故意传入 NaN
    target: NaN, // 故意传入 NaN
  })
}
const snapshot4 = stats4.snapshot()
console.log('  快照数据:', JSON.stringify(snapshot4))
const noNaN = Object.values(snapshot4).every(v => typeof v === 'number' && !isNaN(v))
console.log('  快照中没有 NaN:', noNaN ? '✅ 通过' : '❌ 失败')
console.log()

// 测试 5: _pickPaymentNote 确保 target > 0
console.log('测试 5: _pickPaymentNote 确保 target > 0')
let allTargetsPositive = true
for (let price = 1; price <= 100; price++) {
  const paid = _pickPaymentNote(price)
  const target = paid - price
  if (target <= 0) {
    console.log(`  ❌ 失败: price=${price}, paid=${paid}, target=${target}`)
    allTargetsPositive = false
  }
}
if (allTargetsPositive) {
  console.log('  所有价格 (1-100) 的 target 都 > 0: ✅ 通过')
}
console.log()

// 测试 6: 多轮游戏后数据持久化
console.log('测试 6: 多轮游戏后数据持久化')
mockStorage.clear()

// 第一轮游戏：完成 5 笔找零单
let stats6 = new StatsManager()
for (let i = 0; i < 5; i++) {
  stats6.recordSuccess({
    mode: GAME_MODES.CHANGE,
    level: 1,
    combo: i + 1,
    orderMs: 5000,
    perfect: true,
    score: (i + 1) * 100,
    target: 5,
  })
}
console.log('  第一轮结束后，终身找零完成数:', stats6.getLifetime().changeSuccess)
console.log('  存储的数据:', JSON.stringify(readJSON(KEYS.stats)))

// 模拟新游戏：创建新的 StatsManager 实例
stats6 = new StatsManager()
console.log('  新游戏加载后，终身找零完成数:', stats6.getLifetime().changeSuccess)

// 第二轮游戏：再完成 6 笔找零单
for (let i = 0; i < 6; i++) {
  stats6.recordSuccess({
    mode: GAME_MODES.CHANGE,
    level: 1,
    combo: i + 1,
    orderMs: 5000,
    perfect: true,
    score: (i + 1) * 100,
    target: 5,
  })
}
const achMgr6 = new AchievementManager()
const snapshot6 = stats6.snapshot()
const newAch6 = achMgr6.evaluate(snapshot6)
console.log('  第二轮结束后，终身找零完成数:', stats6.getLifetime().changeSuccess)
console.log('  找零达人成就解锁:', newAch6.length > 0 && newAch6[0].id === 'change_master' ? '✅ 通过' : '❌ 失败')
console.log()

console.log('========== 所有测试完成 ==========')
