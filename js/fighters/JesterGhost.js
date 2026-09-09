/**
 * JesterGhost.js - Character implementation: JESTER GHOST (The Trickster Phantom)
 * From Image 1: White cartoon sheet phantom with wide eyes, cute 'v' mouth, orange polka-dot floppy jester cap.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Fighter = window.NeonRumble.Fighter;
  const AttackData = window.NeonRumble.AttackData;

  class JesterGhost extends Fighter {
    constructor(playerNum = 1, config = {}) {
      super({
        id: 'JesterGhost',
        name: 'JESTER GHOST',
        title: 'THE TRICKSTER PHANTOM',
        playerNum: playerNum,
        speed: 2.8,
        jumpForce: -15.0,
        primaryColor: '#ffffff',
        secondaryColor: '#ff6600',
        groundY: config.groundY || 460,
        x: config.x || (playerNum === 1 ? 260 : 700),
        facing: config.facing || (playerNum === 1 ? 1 : -1),
        superPopupText: 'BOO-HA-HA SURPRISE!!!',
        attacks: {
          SPECIAL: AttackData.VOLT_SPECIAL,
          SUPER: AttackData.REX_SUPER
        }
      });
    }

    spawnSpecialProjectile() {
      const pm = window.NeonRumble.ProjectileManager;
      if (pm) {
        pm.spawn({
          owner: this.playerNum,
          type: 'PARTY_POPPER',
          x: this.x + this.facing * 30,
          y: this.y - 40,
          vx: 7.0,
          vy: -1.5,
          facing: this.facing,
          damage: 15,
          chipDamage: 3,
          knockback: { x: 6.0, y: -3.5 },
          hitstun: 24,
          life: 70,
          width: 32,
          height: 32,
          color: '#ff9900'
        });
      }
    }

    triggerSuper() {
      super.triggerSuper();
      this.vx = this.facing * 9.0;
    }
  }

  window.NeonRumble.JesterGhost = JesterGhost;
})();
