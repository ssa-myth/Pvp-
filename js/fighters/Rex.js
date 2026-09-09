/**
 * Rex.js - Character implementation: REX "The Iron Brawler"
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Fighter = window.NeonRumble.Fighter;
  const AttackData = window.NeonRumble.AttackData;

  class Rex extends Fighter {
    constructor(playerNum = 1, config = {}) {
      super({
        id: 'Rex',
        name: 'REX',
        title: 'THE IRON BRAWLER',
        playerNum: playerNum,
        speed: 2.6,
        jumpForce: -13.2,
        primaryColor: '#cc2233',
        secondaryColor: '#ffaa00',
        groundY: config.groundY || 460,
        x: config.x || (playerNum === 1 ? 260 : 700),
        facing: config.facing || (playerNum === 1 ? 1 : -1),
        superPopupText: 'METEOR CRUSH!!!',
        attacks: {
          SPECIAL: AttackData.REX_SPECIAL,
          SUPER: AttackData.REX_SUPER
        }
      });
    }

    spawnSpecialProjectile() {
      const pm = window.NeonRumble.ProjectileManager;
      if (pm) {
        pm.spawn({
          owner: this.playerNum,
          type: 'REX_WAVE',
          x: this.x + this.facing * 35,
          y: this.groundY,
          vx: 6.5,
          vy: 0,
          facing: this.facing,
          damage: 16,
          chipDamage: 3,
          knockback: { x: 6.5, y: -3.0 },
          hitstun: 24,
          life: 70,
          width: 36,
          height: 38,
          color: '#ff5500'
        });
      }
    }

    triggerSuper() {
      super.triggerSuper();
      // Rocket punch dash
      this.vx = this.facing * 10.0;
    }
  }

  window.NeonRumble.Rex = Rex;
})();
