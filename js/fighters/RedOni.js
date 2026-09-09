/**
 * RedOni.js - Character implementation: RED ONI (The Horned Brawler)
 * From Image 1: Red skin, blue ponytail, white forehead horns, pink open shirt, gold chain.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Fighter = window.NeonRumble.Fighter;
  const AttackData = window.NeonRumble.AttackData;

  class RedOni extends Fighter {
    constructor(playerNum = 1, config = {}) {
      super({
        id: 'RedOni',
        name: 'RED ONI',
        title: 'THE HORNED BRAWLER',
        playerNum: playerNum,
        speed: 2.6,
        jumpForce: -13.0,
        primaryColor: '#e62020',
        secondaryColor: '#ff6699',
        groundY: config.groundY || 460,
        x: config.x || (playerNum === 1 ? 260 : 700),
        facing: config.facing || (playerNum === 1 ? 1 : -1),
        superPopupText: 'DEMON CHAIN BUSTER!!!',
        attacks: {
          SPECIAL: AttackData.REX_SPECIAL,
          SUPER: AttackData.RED_ONI_SUPER || AttackData.REX_SUPER
        }
      });
    }

    spawnSpecialProjectile() {
      const pm = window.NeonRumble.ProjectileManager;
      if (pm) {
        pm.spawn({
          owner: this.playerNum,
          type: 'ONI_QUAKE',
          x: this.x + this.facing * 35,
          y: this.groundY,
          vx: 6.8,
          vy: 0,
          facing: this.facing,
          damage: 18,
          chipDamage: 4,
          knockback: { x: 7.0, y: -3.5 },
          hitstun: 26,
          life: 70,
          width: 38,
          height: 42,
          color: '#ff3300'
        });
      }
    }

    triggerSuper() {
      super.triggerSuper();
      this.vx = 0;
    }
  }

  window.NeonRumble.RedOni = RedOni;
})();
