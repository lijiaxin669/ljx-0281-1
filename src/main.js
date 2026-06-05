import { Application } from 'pixi.js'
import { DESIGN_WIDTH, DESIGN_HEIGHT } from './config/denominations.js'
import { StartScene } from './scenes/StartScene.js'
import { GameScene } from './scenes/GameScene.js'
import { ResultScene } from './scenes/ResultScene.js'

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

  let currentScene = null

  function setScene(scene) {
    if (currentScene) {
      app.stage.removeChild(currentScene)
      currentScene.destroy({ children: true })
    }
    currentScene = scene
    app.stage.addChild(scene)
  }

  function showStart() {
    const start = new StartScene((mode) => showGame(mode))
    setScene(start)
  }

  function showGame(mode) {
    const game = new GameScene(mode, (runResult) => showResult(runResult))
    setScene(game)
    game.startNewGame()
  }

  function showResult(runResult) {
    const result = new ResultScene({
      ...runResult,
      onPlayAgain: () => showGame(runResult.mode),
      onHome: () => showStart(),
    })
    setScene(result)
  }

  // 单一更新循环：仅当前场景实现了 update 时才驱动
  app.ticker.add((ticker) => {
    if (currentScene && typeof currentScene.update === 'function') {
      currentScene.update(ticker.deltaTime / 60)
    }
  })

  showStart()
}

main().catch(console.error)
