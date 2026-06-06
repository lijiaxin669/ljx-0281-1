export const DENOMINATIONS = [
  { value: 1,  type: 'coin', label: '1元',  color: 0xFFD700, strokeColor: 0xDAA520, radius: 28 },
  { value: 5,  type: 'coin', label: '5元',  color: 0xC0C0C0, strokeColor: 0xA9A9A9, radius: 30 },
  { value: 10, type: 'bill', label: '10元', color: 0x4169E1, strokeColor: 0x3155B1, width: 92, height: 50 },
  { value: 20, type: 'bill', label: '20元', color: 0x8B4513, strokeColor: 0x6B3410, width: 92, height: 50 },
  { value: 50, type: 'bill', label: '50元', color: 0x7E57C2, strokeColor: 0x5E35B1, width: 92, height: 50 },
]

// 找零模式下顾客可能用来付款的面额（含 100 元大钞，仅用于展示）
export const PAYMENT_NOTES = [5, 10, 20, 50, 100]

export const LEVEL_CONFIG = [
  { level: 1, maxAmount: 10,  countdown: 30, comboToAdvance: 5, maxErrors: 3 },
  { level: 2, maxAmount: 30,  countdown: 25, comboToAdvance: 5, maxErrors: 3 },
  { level: 3, maxAmount: 50,  countdown: 20, comboToAdvance: 5, maxErrors: 3 },
  { level: 4, maxAmount: 70,  countdown: 18, comboToAdvance: 5, maxErrors: 3 },
  { level: 5, maxAmount: 99,  countdown: 15, comboToAdvance: 5, maxErrors: 3 },
  { level: 6, maxAmount: 99,  countdown: 12, comboToAdvance: 5, maxErrors: 3 },
]

export const COLORS = {
  primary: 0xFF8C42,
  secondary: 0x2EC4B6,
  background: 0xFFF8E7,
  text: 0x3D2C2E,
  woodLight: 0xDEB887,
  woodDark: 0xA0522D,
  success: 0x4CAF50,
  error: 0xF44336,
  warning: 0xFF9800,
  gold: 0xFFD700,
  trayBg: 0xFFF3E0,
  trayBorder: 0xBCAAA4,
}

export const DESIGN_WIDTH = 768
export const DESIGN_HEIGHT = 1024

export const TOLERANCE = 0.01

export const CUSTOMER_AVATARS = ['👧', '👦', '👨', '👩', '👴', '👵', '🧑', '👱']
export const ITEM_ICONS = ['🍎', '🧃', '🍞', '🥛', '🍦', '🧸', '📚', '✏️', '🎨', '🏀', '🚗', '🍭']
