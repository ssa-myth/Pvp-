/**
 * Titan.js - Character implementation: TITAN "The Armored Juggernaut"
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Fighter = window.NeonRumble.Fighter;
  const AttackData = window.NeonRumble.AttackData;

  class Titan extends Fighter {
    constructor(playerNum = 1, config = {}) {
      super({
        id: 'Titan',
        name: 'TITAN',
        title: 'THE ARMORED JUGGERNAUT',
        playerNum: playerNum,
        speed: 3.2,
        jumpForce: -12.4,
        primaryColor: '#d49b38',
        secondaryColor: '#00ff66',
        groundY: config.groundY || 460,
        x: config.x || (playerNum === 1 ? 260 : 700),
        facing: config.facing || (playerNum === 1 ? 1 : -1),
        width: 52,
        height: 88,
        superPopupText: 'EXTINCTION EVENT!!!',
        attacks: {
          SPECIAL: AttackData.TITAN_SPECIAL,
          SUPER: AttackData.TITAN_SUPER
        }
      });
    }

    triggerSpecial() {
      super.triggerSpecial();
      // Forward leap smash
      this.isGrounded = false;
      this.vy = -7.5;
      this.vx = this.facing * 5.0;
    }

    triggerSuper() {
      super.triggerSuper();
      // Heavy ground earthquake
      const camera = window.NeonRumble.Camera;
      if (camera) camera.addShake(18);

      setTimeout(() => {
        const pm = window.NeonRumble.ProjectileManager;
        if (pm) {
          // 2 erupting spikes
          [-60, 60, 140].forEach((offset, idx) => {
            setTimeout(() => {
              pm.spawn({
                owner: this.playerNum,
                type: 'EARTH_SPIKE',
                x: this.x + this.facing * offset,
                y: this.groundY,
                vx: 0,
                vy: 0,
                facing: this.facing,
                damage: 25,
                chipDamage: 5,
                knockback: { x: 5.0, y: -8.0 },
                hitstun: 40,
                life: 20,
                width: 50,
                height: 120,
                color: '#d49b38'
              });
            }, idx * 100);
          });
        }
      }, 300);
    }
  }

  window.NeonRumble.Titan = Titan;
})();
