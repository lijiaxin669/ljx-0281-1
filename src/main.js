import { Application } from 'pixi.js'
import { DESIGN_WIDTH, DESIGN_HEIGHT } from './config/denominations.js'
import { StartScene } from './scenes/StartScene.js'
import { GameScene } from './scenes/GameScene.js'

async function main() {
  const app = new Application()
  await app.init({
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    background: '#FFF8E7',
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true,
    resizeTo: document.getElementById('game-container'),
  })

  document.getElementById('game-container').appendChild(app.canvas)

  app.stage.scale.set(
    app.screen.width / DESIGN_WIDTH,
    app.screen.height / DESIGN_HEIGHT
  )

  const startScene = new StartScene(() => {
    app.stage.removeChild(startScene)
    startScene.destroy()
    const gameScene = new GameScene(() => {
      app.stage.removeChild(gameScene)
      gameScene.destroy()
      const newStart = new StartScene(() => {
        app.stage.removeChild(newStart)
        newStart.destroy()
        main()
      })
      app.stage.addChild(newStart)
    })
    app.stage.addChild(gameScene)
    gameScene.startNewGame()

    app.ticker.add((ticker) => {
      gameScene.update(ticker.deltaTime / 60)
    })
  })

  app.stage.addChild(startScene)
}

main().catch(console.error)
