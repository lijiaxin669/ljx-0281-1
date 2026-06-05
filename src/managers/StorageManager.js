const STORAGE_PREFIX = 'cashier_game_'

export const StorageManager = {
  getSoundEnabled() {
    const val = localStorage.getItem(STORAGE_PREFIX + 'sound_enabled')
    return val === null ? true : val === 'true'
  },

  setSoundEnabled(enabled) {
    localStorage.setItem(STORAGE_PREFIX + 'sound_enabled', String(enabled))
  },

  getHighScore() {
    return parseInt(localStorage.getItem(STORAGE_PREFIX + 'high_score') || '0', 10)
  },

  setHighScore(score) {
    localStorage.setItem(STORAGE_PREFIX + 'high_score', String(score))
  },
}
