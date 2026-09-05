/**
 * Storage.js - Persistent LocalStorage Manager for Settings & Stats
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const SETTINGS_KEY = 'neon_rumble_settings_v1';
  const STATS_KEY = 'neon_rumble_stats_v1';

  const defaultSettings = {
    sfxVolume: 0.8,
    musicVolume: 0.65,
    screenShake: true,
    crtEnabled: true,
    scanlines: true,
    showHitboxes: false,
    tutorialCompleted: false
  };

  const defaultStats = {
    matchesPlayed: 0,
    p1Wins: 0,
    p2Wins: 0,
    totalKOs: 0,
    highestCombo: 0,
    favoriteFighter: 'Ardra',
    fighterPicks: {
      Ardra: 0,
      Rex: 0,
      Volt: 0,
      Titan: 0
    }
  };

  class StorageManager {
    constructor() {
      this.settings = this.loadSettings();
      this.stats = this.loadStats();
    }

    loadSettings() {
      try {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? Object.assign({}, defaultSettings, JSON.parse(data)) : Object.assign({}, defaultSettings);
      } catch (e) {
        console.warn('LocalStorage unavailable for settings', e);
        return Object.assign({}, defaultSettings);
      }
    }

    saveSettings() {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      } catch (e) {
        console.warn('LocalStorage save failed', e);
      }
    }

    loadStats() {
      try {
        const data = localStorage.getItem(STATS_KEY);
        return data ? Object.assign({}, defaultStats, JSON.parse(data)) : Object.assign({}, defaultStats);
      } catch (e) {
        console.warn('LocalStorage unavailable for stats', e);
        return Object.assign({}, defaultStats);
      }
    }

    saveStats() {
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
      } catch (e) {
        console.warn('LocalStorage save failed', e);
      }
    }

    recordMatchResult(winnerPlayerNum, fighter1Name, fighter2Name, maxCombo) {
      this.stats.matchesPlayed++;
      if (winnerPlayerNum === 1) this.stats.p1Wins++;
      if (winnerPlayerNum === 2) this.stats.p2Wins++;
      this.stats.totalKOs++;

      if (maxCombo > this.stats.highestCombo) {
        this.stats.highestCombo = maxCombo;
      }

      this.stats.fighterPicks[fighter1Name] = (this.stats.fighterPicks[fighter1Name] || 0) + 1;
      this.stats.fighterPicks[fighter2Name] = (this.stats.fighterPicks[fighter2Name] || 0) + 1;

      // Determine favorite fighter
      let maxPicks = -1;
      let topFighter = 'Ardra';
      for (const [fName, count] of Object.entries(this.stats.fighterPicks)) {
        if (count > maxPicks) {
          maxPicks = count;
          topFighter = fName;
        }
      }
      this.stats.favoriteFighter = topFighter;

      this.saveStats();
    }
  }

  window.NeonRumble.Storage = new StorageManager();
})();
