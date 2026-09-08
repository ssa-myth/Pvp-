/**
 * StageManager.js - Stage Coordinator & Lifecycle Manager
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class StageManager {
    constructor() {
      this.stages = null;
      this.stageKeys = ['GraffitiStrip', 'CyberJunk', 'NeonDocks', 'DemonShrine', 'AstralCore', 'NeonAlley', 'AbandonedArcade', 'SkylineRooftop'];
      this.currentStageKey = 'GraffitiStrip';
      this._currentStage = null;
    }

    get currentStage() {
      this.ensureStages();
      return this._currentStage || this.stages[this.currentStageKey];
    }

    set currentStage(val) {
      this._currentStage = val;
    }

    ensureStages() {
      if (!this.stages) {
        this.stages = {
          GraffitiStrip: new window.NeonRumble.GraffitiStrip(),
          CyberJunk: new window.NeonRumble.CyberJunk(),
          NeonDocks: new window.NeonRumble.NeonDocks(),
          DemonShrine: new window.NeonRumble.DemonShrine(),
          AstralCore: new window.NeonRumble.AstralCore(),
          NeonAlley: new window.NeonRumble.NeonAlley(),
          AbandonedArcade: new window.NeonRumble.AbandonedArcade(),
          SkylineRooftop: new window.NeonRumble.SkylineRooftop()
        };
        this._currentStage = this.stages[this.currentStageKey];
      }
    }

    setStage(key) {
      this.ensureStages();
      if (this.stages[key]) {
        this.currentStageKey = key;
        this.currentStage = this.stages[key];
      }
    }

    setRandomStage() {
      const randKey = this.stageKeys[Math.floor(Math.random() * this.stageKeys.length)];
      this.setStage(randKey);
      return randKey;
    }

    getStage(key) {
      this.ensureStages();
      return this.stages[key] || this.currentStage;
    }

    draw(ctx, camera, round = 1) {
      this.ensureStages();
      if (this.currentStage) {
        this.currentStage.draw(ctx, camera, round);
      }
    }
  }

  window.NeonRumble.StageManager = new StageManager();
})();
