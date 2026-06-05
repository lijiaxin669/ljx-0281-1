import { COLORS } from './denominations.js'

// 三种玩法模式
export const GAME_MODES = {
  COLLECT: 'collect', // 收款模式：凑出商品应付金额
  CHANGE: 'change',   // 找零模式：顾客付大钞，凑出应找零金额
  MIXED: 'mixed',     // 混合闯关：每单随机收款 / 找零
}

// 模式展示信息（用于开始页的模式选择卡片）
export const MODE_INFO = [
  {
    key: GAME_MODES.COLLECT,
    icon: '🪙',
    title: '收款模式',
    desc: '拖出硬币纸币\n凑出商品应付金额',
    color: COLORS.secondary,
  },
  {
    key: GAME_MODES.CHANGE,
    icon: '💸',
    title: '找零模式',
    desc: '顾客付了大钞\n算出该找回多少钱',
    color: COLORS.primary,
  },
  {
    key: GAME_MODES.MIXED,
    icon: '🎲',
    title: '混合闯关',
    desc: '收款 / 找零随机出现\n挑战真实收银台',
    color: 0x7E57C2,
  },
]

export function getModeInfo(key) {
  return MODE_INFO.find((m) => m.key === key) || MODE_INFO[0]
}

// 把一个原始模式（可能是 MIXED）解析为本单实际使用的模式
export function resolveOrderMode(mode) {
  if (mode === GAME_MODES.MIXED) {
    return Math.random() < 0.5 ? GAME_MODES.COLLECT : GAME_MODES.CHANGE
  }
  return mode
}
