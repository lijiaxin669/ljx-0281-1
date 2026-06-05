import { StorageManager } from './StorageManager.js'

class AudioManagerClass {
  constructor() {
    this.enabled = StorageManager.getSoundEnabled()
    this.sounds = {}
    this.ctx = null
  }

  _ensureCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
    return this.ctx
  }

  _playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled) return
    try {
      const ctx = this._ensureCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(frequency, ctx.currentTime)
      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch (e) { /* ignore audio errors */ }
  }

  playCoinPlace() {
    this._playTone(880, 0.12, 'sine', 0.25)
    setTimeout(() => this._playTone(1320, 0.1, 'sine', 0.2), 60)
  }

  playSuccess() {
    this._playTone(523, 0.15, 'sine', 0.3)
    setTimeout(() => this._playTone(659, 0.15, 'sine', 0.3), 120)
    setTimeout(() => this._playTone(784, 0.15, 'sine', 0.3), 240)
    setTimeout(() => this._playTone(1047, 0.3, 'sine', 0.35), 360)
  }

  playFail() {
    this._playTone(330, 0.2, 'square', 0.2)
    setTimeout(() => this._playTone(262, 0.3, 'square', 0.2), 200)
  }

  playTick() {
    this._playTone(1000, 0.05, 'sine', 0.1)
  }

  playLevelUp() {
    this._playTone(523, 0.1, 'sine', 0.3)
    setTimeout(() => this._playTone(659, 0.1, 'sine', 0.3), 80)
    setTimeout(() => this._playTone(784, 0.1, 'sine', 0.3), 160)
    setTimeout(() => this._playTone(1047, 0.1, 'sine', 0.3), 240)
    setTimeout(() => this._playTone(1319, 0.4, 'sine', 0.35), 320)
  }

  playCombo() {
    this._playTone(784, 0.1, 'sine', 0.25)
    setTimeout(() => this._playTone(988, 0.15, 'sine', 0.3), 80)
  }

  toggle() {
    this.enabled = !this.enabled
    StorageManager.setSoundEnabled(this.enabled)
    return this.enabled
  }
}

export const AudioManager = new AudioManagerClass()
