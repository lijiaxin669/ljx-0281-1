# 我是小小收银员 🧒💰

门店等候区平板互动游戏，让孩子拖动硬币与纸币组合凑出应付金额，锻炼数学心算能力。

## 快速开始

```bash
npm install
npm run dev
```

浏览器访问 `http://localhost:3000`

## Docker 部署

```bash
docker-compose up -d
```

访问 `http://localhost:8080`

## 游戏规则

1. 顾客随机出示 1–99 元订单
2. 从下方托盘拖拽硬币/纸币到收银盘
3. 凑出与应付金额相同的数额（误差 ±0.01 内判定成功）
4. 连续 5 次成功 → 提升关卡（订单上限↑，倒计时↓）
5. 错误 3 次 → 显示正确答案，进入下一单

## 关卡参数表

| 关卡 | 订单金额范围 | 倒计时（秒） | 连击提升 | 错误上限 |
|------|-------------|-------------|---------|---------|
| 1 | 1–10 元 | 30 | 5 连击 | 3 |
| 2 | 1–30 元 | 25 | 5 连击 | 3 |
| 3 | 1–50 元 | 20 | 5 连击 | 3 |
| 4 | 1–70 元 | 18 | 5 连击 | 3 |
| 5 | 1–99 元 | 15 | 5 连击 | 3 |
| 6+ | 1–99 元 | 12 | 5 连击 | 3 |

## 对象层级图

```
App 根容器
├── StartScene 开始画面
├── GameScene 游戏场景
│   ├── StatusBar 状态栏
│   │   ├── LevelBadge 关卡徽章
│   │   ├── ComboCounter 连击计数
│   │   ├── TimerRing 倒计时环
│   │   ├── ScoreText 得分
│   │   └── SoundToggle 音效开关
│   ├── OrderArea 顾客订单区
│   │   ├── CustomerAvatar 顾客头像
│   │   ├── ItemIcon 商品图标
│   │   ├── OrderAmount 订单金额
│   │   └── DiffText 差额提示
│   ├── CashTray 收银盘
│   │   ├── PlacedCoins 已放入货币
│   │   └── AmountDisplay 金额显示
│   ├── MoneyShelf 货币托盘
│   │   ├── Coin ¥1 硬币
│   │   ├── Coin ¥5 硬币
│   │   ├── Bill ¥10 纸币
│   │   └── Bill ¥20 纸币
│   ├── DragLayer 拖拽浮动层
│   └── ResultPopup 结算弹窗
└── ResultPopup 结算弹窗（复用）
```

## 如何新增面额类型

面额配置位于 `src/config/denominations.js`，只需在 `DENOMINATIONS` 数组中添加一项即可：

### 添加硬币示例（如 50 元硬币）

```js
export const DENOMINATIONS = [
  { value: 1,  type: 'coin', label: '1元',  color: 0xFFD700, strokeColor: 0xDAA520, radius: 30 },
  { value: 5,  type: 'coin', label: '5元',  color: 0xC0C0C0, strokeColor: 0xA9A9A9, radius: 32 },
  { value: 10, type: 'bill', label: '10元', color: 0x4169E1, strokeColor: 0x3155B1, width: 100, height: 52 },
  { value: 20, type: 'bill', label: '20元', color: 0x8B4513, strokeColor: 0x6B3410, width: 100, height: 52 },
  // 👇 新增 50 元纸币
  { value: 50, type: 'bill', label: '50元', color: 0x228B22, strokeColor: 0x1A6B1A, width: 110, height: 56 },
]
```

### 面额配置字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `value` | number | 面额数值（元） |
| `type` | `'coin'` 或 `'bill'` | 硬币或纸币，决定绘制方式 |
| `label` | string | 显示文字 |
| `color` | number (0xRRGGBB) | 主色 |
| `strokeColor` | number (0xRRGGBB) | 边框色 |
| `radius` | number | 硬币半径（type='coin' 时必填） |
| `width` / `height` | number | 纸币宽高（type='bill' 时必填） |

### 修改关卡参数

同样在 `src/config/denominations.js` 中的 `LEVEL_CONFIG` 数组，添加或修改关卡配置：

```js
export const LEVEL_CONFIG = [
  { level: 1, maxAmount: 10,  countdown: 30, comboToAdvance: 5, maxErrors: 3 },
  // 添加更多关卡...
]
```

## 音效开关

音效开关状态保存在浏览器 `localStorage`，键名 `cashier_game_sound_enabled`，无需额外配置。

## 技术栈

- PixiJS v8 — 2D WebGL 渲染引擎
- Vite — 构建工具
- Web Audio API — 程序化音效生成
- Docker + Nginx — 静态托管部署
