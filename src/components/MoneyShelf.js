import { Container, Graphics, Text } from 'pixi.js'
import { DENOMINATIONS, COLORS } from '../config/denominations.js'
import { MoneyItem } from './MoneyItem.js'

export class MoneyShelf extends Container {
  constructor(onDragStart) {
    super()
    this.onDragStart = onDragStart
    this.items = []
    this._build()
  }

  _build() {
    const bg = new Graphics()
    bg.roundRect(0, 0, 700, 200, 20)
    bg.fill({ color: 0xE8DDD0 })
    bg.roundRect(0, 0, 700, 200, 20)
    bg.stroke({ color: COLORS.trayBorder, width: 3 })
    this.addChild(bg)
    this._bg = bg

    const title = new Text({
      text: '💰 货币架',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fill: COLORS.text,
        fontWeight: 'bold',
      },
    })
    title.anchor.set(0.5, 0)
    title.x = 350
    title.y = 8
    this.addChild(title)

    const spacing = 170
    const startX = 70
    const coinY = 110

    DENOMINATIONS.forEach((denom, i) => {
      const item = new MoneyItem(denom)
      item.x = startX + i * spacing
      item.y = coinY
      item.eventMode = 'static'
      item.cursor = 'grab'
      item._shelfX = item.x
      item._shelfY = item.y

      item.on('pointerdown', (e) => {
        this.onDragStart(denom, e)
      })

      this.addChild(item)
      this.items.push(item)
    })
  }
}
