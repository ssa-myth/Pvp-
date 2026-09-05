/**
 * ComboManager.js - Combo Tracking & Damage Scaling System
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class ComboCounter {
    constructor(playerNum) {
      this.playerNum = playerNum;
      this.hits = 0;
      this.totalDamage = 0;
      this.timer = 0; // In frames
      this.maxCombo = 0;
      this.active = false;
      this.displayTimer = 0;
      this.comboRank = '';
      this.storage = window.NeonRumble.Storage;
    }

    addHit(rawDamage) {
      this.hits++;
      this.timer = 45; // 45 frames (0.75s) reset window
      this.active = true;
      this.displayTimer = 60; // Keep showing banner for 1s after combo ends

      // Damage scaling
      let scale = 1.0;
      if (this.hits === 2) scale = 0.85;
      else if (this.hits === 3) scale = 0.72;
      else if (this.hits === 4) scale = 0.60;
      else if (this.hits >= 5) scale = 0.50;

      const scaledDamage = Math.max(1, Math.round(rawDamage * scale));
      this.totalDamage += scaledDamage;

      if (this.hits > this.maxCombo) {
        this.maxCombo = this.hits;
      }

      if (this.hits >= 10) this.comboRank = 'GODLIKE!';
      else if (this.hits >= 7) this.comboRank = 'FANTASTIC!';
      else if (this.hits >= 5) this.comboRank = 'GREAT!';
      else if (this.hits >= 3) this.comboRank = 'COMBO!';
      else this.comboRank = '';

      return scaledDamage;
    }

    update() {
      if (this.active) {
        this.timer--;
        if (this.timer <= 0) {
          this.endCombo();
        }
      }
      if (this.displayTimer > 0) {
        this.displayTimer--;
      }
    }

    endCombo() {
      if (this.hits >= 2 && this.storage) {
        if (this.hits > this.storage.stats.highestCombo) {
          this.storage.stats.highestCombo = this.hits;
          this.storage.saveStats();
        }
      }
      this.active = false;
      this.hits = 0;
      this.totalDamage = 0;
      this.timer = 0;
    }

    reset() {
      this.endCombo();
      this.displayTimer = 0;
      this.maxCombo = 0;
      this.comboRank = '';
    }
  }

  class ComboManager {
    constructor() {
      this.p1Combo = new ComboCounter(1);
      this.p2Combo = new ComboCounter(2);
    }

    update() {
      this.p1Combo.update();
      this.p2Combo.update();
    }

    reset() {
      this.p1Combo.reset();
      this.p2Combo.reset();
    }

    getCounter(playerNum) {
      return playerNum === 1 ? this.p1Combo : this.p2Combo;
    }
  }

  window.NeonRumble.ComboManager = new ComboManager();
})();
