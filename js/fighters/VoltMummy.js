/**
 * VoltMummy.js - Character implementation: VOLT MUMMY (The Battery Punk)
 * From Image 1: Bandage wrapped punk, wild spiky blonde hair, crazy eyes, yellow battery backpack.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Fighter = window.NeonRumble.Fighter;
  const AttackData = window.NeonRumble.AttackData;

  class VoltMummy extends Fighter {
    constructor(playerNum = 1, config = {}) {
      super({
        id: 'VoltMummy',
        name: 'VOLT MUMMY',
        title: 'THE BATTERY PUNK',
        playerNum: playerNum,
        speed: 4.6,
        jumpForce: -14.4,
        primaryColor: '#ffea00',
        secondaryColor: '#e6dfcc',
        groundY: config.groundY || 460,
        x: config.x || (playerNum === 1 ? 260 : 700),
        facing: config.facing || (playerNum === 1 ? 1 : -1),
        superPopupText: 'OVERVOLT DISCHARGE!!!',
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
          type: 'BATTERY_SPARK',
          x: this.x + this.facing * 30,
          y: this.y - 48,
          vx: 8.5,
          vy: 0,
          facing: this.facing,
          damage: 14,
          chipDamage: 3,
          knockback: { x: 5.5, y: -2.0 },
          hitstun: 22,
          life: 65,
          width: 32,
          height: 32,
          color: '#ffee00'
        });
      }
    }

    triggerSuper() {
      super.triggerSuper();
      this.vx = this.facing * 8.5;
    }
  }

  window.NeonRumble.VoltMummy = VoltMummy;
})();
