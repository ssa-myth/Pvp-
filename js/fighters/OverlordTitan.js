/**
 * OverlordTitan.js - Character implementation: OVERLORD TITAN (Colossal Final Boss)
 * The Armored Dreadnought: 1.48x scale, 250 HP, Hyper Armor, Damage Reduction, Quake Slams.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Titan = window.NeonRumble.Titan;
  if (Titan) {
    class OverlordTitan extends Titan {
      constructor(playerNum = 2, config = {}) {
        super(playerNum, Object.assign({
          id: 'OverlordTitan',
          name: 'OVERLORD TITAN',
          title: 'FINAL BOSS: THE COLOSSAL JUGGERNAUT',
          speed: 3.6,
          jumpForce: -13.5,
          primaryColor: '#ff2200',
          secondaryColor: '#ffcc00',
          groundY: config.groundY || 460,
          x: config.x || 680,
          facing: config.facing || -1,
          width: 72,
          height: 126,
          superPopupText: 'TECTONIC EXTINCTION!!!'
        }, config));

        this.isBoss = true;
        this.scale = 1.48;
        this.maxHealth = 250;
        this.health = 250;
        this.ghostHealth = 250;
      }

      getHurtbox() {
        const Box = window.NeonRumble.Box;
        if (this.state === 'KNOCKDOWN') {
          return new Box(-42, -26, 84, 26, 'hurt').getWorldBounds(this.x, this.y, this.facing);
        } else if (this.state === 'CROUCH' || this.state === 'LAND') {
          return new Box(-30, -78, 60, 78, 'hurt').getWorldBounds(this.x, this.y, this.facing);
        } else if (!this.isGrounded) {
          return new Box(-28, -112, 56, 98, 'hurt').getWorldBounds(this.x, this.y, this.facing);
        } else {
          return new Box(-30, -124, 60, 124, 'hurt').getWorldBounds(this.x, this.y, this.facing);
        }
      }

      takeHit(attack, attacker) {
        if (this.invulnerableTimer > 0) return;

        // Boss Hyper Armor: Cannot be flinched during active startup of Heavy/Special attacks
        if (this.state === 'ATTACK_HEAVY' || this.state === 'ATTACK_SPECIAL' || this.state === 'ATTACK_SUPER') {
          if (attack.level !== 'SUPER') {
            const scaledDamage = Math.round(attack.damage * 0.72);
            this.health = Math.max(0, this.health - scaledDamage);
            this.ghostHealth = Math.max(this.health, this.ghostHealth);
            this.hitFlashTimer = 4;
            const sfx = window.NeonRumble.SoundSynth;
            if (sfx) sfx.playBlock();
            const particles = window.NeonRumble.ParticleSystem;
            if (particles) particles.emitBlockSparks(this.x + this.facing * 16, this.y - 60);
            return;
          }
        }

        // Boss Damage Reduction: Takes 25% reduced damage from all player hits
        const bossAttack = Object.assign({}, attack, {
          damage: Math.round(attack.damage * 0.75),
          knockback: { x: attack.knockback.x * 0.65, y: attack.knockback.y * 0.7 }
        });

        super.takeHit(bossAttack, attacker);
      }

      triggerSuper() {
        super.triggerSuper();
        const camera = window.NeonRumble.Camera;
        if (camera) camera.addShake(25);

        setTimeout(() => {
          const pm = window.NeonRumble.ProjectileManager;
          if (pm) {
            // 4 massive erupting earth spikes across the arena
            [-120, -40, 60, 160].forEach((offset, idx) => {
              setTimeout(() => {
                pm.spawn({
                  owner: this.playerNum,
                  type: 'EARTH_SPIKE',
                  x: this.x + this.facing * offset,
                  y: this.groundY,
                  vx: 0,
                  vy: 0,
                  facing: this.facing,
                  damage: 28,
                  chipDamage: 7,
                  knockback: { x: 6.0, y: -9.0 },
                  hitstun: 45,
                  life: 25,
                  width: 60,
                  height: 140,
                  color: '#ff3300'
                });
              }, idx * 80);
            });
          }
        }, 250);
      }
    }
    window.NeonRumble.OverlordTitan = OverlordTitan;
  }
})();
