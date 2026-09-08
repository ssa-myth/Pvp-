/**
 * NoirDoll.js - Character implementation: NOIR DOLL (The Monochrome Lolita)
 * From Image 1: Pale skin, straight white hair, black rose hairpin, black tear makeup, frilled gothic lolita dress.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Fighter = window.NeonRumble.Fighter;
  const AttackData = window.NeonRumble.AttackData;

  class NoirDoll extends Fighter {
    constructor(playerNum = 1, config = {}) {
      super({
        id: 'NoirDoll',
        name: 'NOIR DOLL',
        title: 'THE GOTHIC LOLITA',
        playerNum: playerNum,
        speed: 4.4,
        jumpForce: -13.8,
        primaryColor: '#ffffff',
        secondaryColor: '#181822',
        groundY: config.groundY || 460,
        x: config.x || (playerNum === 1 ? 260 : 700),
        facing: config.facing || (playerNum === 1 ? 1 : -1),
        superPopupText: 'BLACK ROSE SCYTHE!!!',
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
          type: 'BLACK_ROSE',
          x: this.x + this.facing * 32,
          y: this.y - 45,
          vx: 7.2,
          vy: 0,
          facing: this.facing,
          damage: 16,
          chipDamage: 3,
          knockback: { x: 5.0, y: -3.0 },
          hitstun: 25,
          life: 75,
          width: 34,
          height: 34,
          color: '#b366ff'
        });
      }
    }

    triggerSuper() {
      super.triggerSuper();
      this.vx = this.facing * 7.5;
    }
  }

  window.NeonRumble.NoirDoll = NoirDoll;
})();
