/**
 * Ardra.js - Character implementation: ARDRA "The Astral Stormblade"
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Fighter = window.NeonRumble.Fighter;
  const AttackData = window.NeonRumble.AttackData;

  class Ardra extends Fighter {
    constructor(playerNum = 1, config = {}) {
      super({
        id: 'Ardra',
        name: 'ARDRA',
        title: 'THE ASTRAL STORMBLADE',
        playerNum: playerNum,
        speed: 4.8,
        jumpForce: -14.2,
        primaryColor: '#8822ee',
        secondaryColor: '#00f0ff',
        groundY: config.groundY || 460,
        x: config.x || (playerNum === 1 ? 260 : 700),
        facing: config.facing || (playerNum === 1 ? 1 : -1),
        superPopupText: 'Bitchy Timeee!!!',
        attacks: {
          SPECIAL: AttackData.ARDRA_SPECIAL,
          SUPER: AttackData.ARDRA_SUPER
        }
      });
    }

    triggerSpecial() {
      super.triggerSpecial();
      // Ardra rushes forward during vortex
      this.vx = this.facing * 7.5;
    }

    triggerSuper() {
      super.triggerSuper();
      // Slight forward lunge while tongue lashes out
      this.vx = this.facing * 3.5;
    }
  }

  window.NeonRumble.Ardra = Ardra;
})();
