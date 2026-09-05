/**
 * Volt.js - Character implementation: VOLT "The Cyber Spark"
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Fighter = window.NeonRumble.Fighter;
  const AttackData = window.NeonRumble.AttackData;

  class Volt extends Fighter {
    constructor(playerNum = 1, config = {}) {
      super({
        id: 'Volt',
        name: 'VOLT',
        title: 'THE CYBER SPARK',
        playerNum: playerNum,
        speed: 4.4,
        jumpForce: -14.0,
        primaryColor: '#00f0ff',
        secondaryColor: '#ffea00',
        groundY: config.groundY || 460,
        x: config.x || (playerNum === 1 ? 260 : 700),
        facing: config.facing || (playerNum === 1 ? 1 : -1),
        superPopupText: 'OVERVOLTAGE 9000V!!!',
        attacks: {
          SPECIAL: AttackData.VOLT_SPECIAL,
          SUPER: AttackData.VOLT_SUPER
        }
      });
    }

    spawnSpecialProjectile() {
      const pm = window.NeonRumble.ProjectileManager;
      if (pm) {
        pm.spawn({
          owner: this.playerNum,
          type: 'VOLT_ORB',
          x: this.x + this.facing * 30,
          y: this.y - 45,
          vx: 5.5,
          vy: 0,
          facing: this.facing,
          damage: 15,
          chipDamage: 3,
          knockback: { x: 5.5, y: -2.0 },
          hitstun: 24,
          life: 80,
          width: 32,
          height: 32,
          color: '#00f0ff',
          secondaryColor: '#ffffff'
        });
      }
    }

    triggerSuper() {
      super.triggerSuper();
      // Lightning column falls near opponent after 15 frames
      setTimeout(() => {
        const pm = window.NeonRumble.ProjectileManager;
        if (pm) {
          pm.spawn({
            owner: this.playerNum,
            type: 'LIGHTNING_COLUMN',
            x: this.x + this.facing * 160,
            y: this.groundY,
            vx: 0,
            vy: 0,
            facing: 1,
            damage: 45,
            chipDamage: 8,
            knockback: { x: 4.0, y: -9.0 },
            hitstun: 45,
            life: 25,
            width: 70,
            height: 340,
            color: '#00f0ff'
          });
        }
      }, 250);
    }
  }

  window.NeonRumble.Volt = Volt;
})();
