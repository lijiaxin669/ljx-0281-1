// 成就定义。每个成就的 condition 接收一份合并后的统计快照(StatsManager.snapshot())，
// 返回 true 表示已达成。成就一旦解锁会持久化，不会因后续数据回落而丢失。
export const ACHIEVEMENTS = [
  {
    id: 'first_order',
    icon: '🎯',
    name: '初出茅庐',
    desc: '完成第 1 笔订单',
    condition: (s) => s.totalSuccess >= 1,
  },
  {
    id: 'apprentice',
    icon: '🧾',
    name: '收银学徒',
    desc: '累计完成 10 笔订单',
    condition: (s) => s.totalSuccess >= 10,
  },
  {
    id: 'master',
    icon: '👑',
    name: '收银大师',
    desc: '累计完成 50 笔订单',
    condition: (s) => s.totalSuccess >= 50,
  },
  {
    id: 'combo5',
    icon: '🔥',
    name: '连击新星',
    desc: '单局达成 5 连击',
    condition: (s) => s.bestCombo >= 5,
  },
  {
    id: 'combo10',
    icon: '⚡',
    name: '连击狂人',
    desc: '单局达成 10 连击',
    condition: (s) => s.bestCombo >= 10,
  },
  {
    id: 'speed',
    icon: '🚀',
    name: '神速收银',
    desc: '3 秒内完成一笔订单',
    condition: (s) => s.fastestOrderMs > 0 && s.fastestOrderMs <= 3000,
  },
  {
    id: 'change_fan',
    icon: '💸',
    name: '找零达人',
    desc: '累计完成 10 笔找零订单',
    condition: (s) => s.changeSuccess >= 10,
  },
  {
    id: 'level5',
    icon: '🏅',
    name: '升级达人',
    desc: '闯到第 5 关',
    condition: (s) => s.maxLevel >= 5,
  },
  {
    id: 'level6',
    icon: '🌟',
    name: '闯关王者',
    desc: '闯到第 6 关',
    condition: (s) => s.maxLevel >= 6,
  },
  {
    id: 'score500',
    icon: '🏆',
    name: '高分玩家',
    desc: '单局得分达到 500',
    condition: (s) => s.highScore >= 500,
  },
  {
    id: 'collector',
    icon: '🪙',
    name: '钞票收藏家',
    desc: '累计放入 100 枚硬币/纸币',
    condition: (s) => s.totalCoinsPlaced >= 100,
  },
  {
    id: 'perfect',
    icon: '✨',
    name: '分文不差',
    desc: '连续 5 单一次性凑齐',
    condition: (s) => s.bestPerfectStreak >= 5,
  },
]

export function getAchievement(id) {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
