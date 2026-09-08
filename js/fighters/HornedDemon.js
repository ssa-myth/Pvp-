/**
 * HornedDemon.js - Character implementation: LILITH (The Demon Queen)
 * From Image 1: Ash-grey demon girl, long white hair, red-and-black striped horns with gold rings, fangs, black corset.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Fighter = window.NeonRumble.Fighter;
  const AttackData = window.NeonRumble.AttackData;

  class HornedDemon extends Fighter {
    constructor(playerNum = 1, config = {}) {
      super({
        id: 'HornedDemon',
        name: 'LILITH',
        title: 'THE DEMON QUEEN',
        playerNum: playerNum,
        speed: 4.7,
        jumpForce: -14.6,
        primaryColor: '#9696a6',
        secondaryColor: '#e61a38',
        groundY: config.groundY || 460,
        x: config.x || (playerNum === 1 ? 260 : 700),
        facing: config.facing || (playerNum === 1 ? 1 : -1),
        superPopupText: 'HELLFIRE CARNIVAL!!!',
        attacks: {
          SPECIAL: AttackData.ARDRA_SPECIAL,
          SUPER: AttackData.ARDRA_SUPER
        }
      });
    }

    spawnSpecialProjectile() {
      const pm = window.NeonRumble.ProjectileManager;
      if (pm) {
        pm.spawn({
          owner: this.playerNum,
          type: 'HELLFIRE_WAVE',
          x: this.x + this.facing * 34,
          y: this.groundY,
          vx: 8.0,
          vy: 0,
          facing: this.facing,
          damage: 20,
          chipDamage: 5,
          knockback: { x: 7.5, y: -4.0 },
          hitstun: 28,
          life: 75,
          width: 40,
          height: 48,
          color: '#ff0055'
        });
      }
    }

    triggerSuper() {
      super.triggerSuper();
      this.vx = this.facing * 9.5;
    }
  }

  window.NeonRumble.HornedDemon = HornedDemon;
})();
