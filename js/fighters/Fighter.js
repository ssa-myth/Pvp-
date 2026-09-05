/**
 * Fighter.js - Base Fighter Class
 * Handles movement physics, state machine, hurtbox generation, attack execution,
 * hitstun, blocking, meter management, and auto-facing.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Box = window.NeonRumble.Box;
  const AttackData = window.NeonRumble.AttackData;

  class Fighter {
    constructor(config) {
      this.id = config.id || 'Ardra';
      this.name = config.name || 'ARDRA';
      this.title = config.title || 'THE ASTRAL STORMBLADE';
      this.playerNum = config.playerNum || 1;

      // Stats
      this.maxHealth = 100;
      this.health = 100;
      this.ghostHealth = 100; // For trailing red health bar
      this.superMeter = 0; // 0 to 100
      this.superCooldownMax = 480; // 8 seconds cooldown for fast-paced action!
      this.superCooldownTimer = 0; // Starts ready!
      this.superPopupText = config.superPopupText || 'SUPER POWER ACTIVATED!';
      this.speed = config.speed || 4.2;
      this.jumpForce = config.jumpForce || -13.5;
      this.gravity = 0.65;
      this.primaryColor = config.primaryColor || '#a820ff';
      this.secondaryColor = config.secondaryColor || '#00f0ff';

      // Transform & Physics
      this.x = config.x || 300;
      this.y = config.groundY || 460;
      this.groundY = config.groundY || 460;
      this.vx = 0;
      this.vy = 0;
      this.facing = config.facing || 1; // 1 = Right, -1 = Left
      this.width = config.width || 44;
      this.height = config.height || 82;

      // State Machine
      this.state = 'IDLE';
      this.animTimer = 0;
      this.stateTimer = 0;
      this.currentAttack = null;
      this.currentAttackProgress = 0;
      this.hasHit = false;

      // Stun & Effects
      this.hitstopTimer = 0;
      this.hitFlashTimer = 0;
      this.invulnerableTimer = 0;
      this.isGrounded = true;

      // Round wins
      this.roundsWon = 0;

      // Dynamic attack lookup table (can be overridden by subclasses)
      this.attacks = config.attacks || {};
    }

    reset(startX, facing) {
      this.x = startX;
      this.y = this.groundY;
      this.vx = 0;
      this.vy = 0;
      this.facing = facing;
      this.health = this.maxHealth;
      this.ghostHealth = this.maxHealth;
      this.state = 'IDLE';
      this.animTimer = 0;
      this.stateTimer = 0;
      this.currentAttack = null;
      this.hasHit = false;
      this.hitstopTimer = 0;
      this.hitFlashTimer = 0;
      this.invulnerableTimer = 0;
      this.isGrounded = true;
    }

    getHurtbox() {
      if (this.state === 'CROUCH' || this.state === 'ATTACK_CROUCH_LIGHT' || this.state === 'ATTACK_CROUCH_HEAVY') {
        return new Box(-20, -52, 40, 52, 'hurt').getWorldBounds(this.x, this.y, this.facing);
      } else if (!this.isGrounded) {
        return new Box(-18, -75, 36, 65, 'hurt').getWorldBounds(this.x, this.y, this.facing);
      } else {
        return new Box(-20, -82, 40, 82, 'hurt').getWorldBounds(this.x, this.y, this.facing);
      }
    }

    getPushbox() {
      return {
        left: this.x - 18,
        right: this.x + 18,
        top: this.y - 75,
        bottom: this.y
      };
    }

    getActiveHitbox() {
      if (!this.currentAttack) return null;
      const totalStartup = this.currentAttack.startup;
      const totalActive = this.currentAttack.active;

      // Hitbox is active only during active frames and if not already hit
      if (this.stateTimer >= totalStartup && this.stateTimer < totalStartup + totalActive && !this.hasHit) {
        return this.currentAttack.hitbox.getWorldBounds(this.x, this.y, this.facing);
      }
      return null;
    }

    update(opponent, input, stageBounds) {
      this.animTimer++;

      // Cooldown timer decrement
      if (this.superCooldownTimer > 0) {
        this.superCooldownTimer--;
      }

      // Update on-screen mobile Super button status for Player 1
      if (this.playerNum === 1) {
        const superBtn = document.getElementById('btn-touch-super');
        const cdText = document.getElementById('touch-super-cooldown');
        if (superBtn && cdText) {
          if (this.superCooldownTimer <= 0 || this.superMeter >= 100) {
            superBtn.classList.add('super-ready');
            cdText.textContent = 'READY';
          } else {
            superBtn.classList.remove('super-ready');
            const sec = Math.ceil(this.superCooldownTimer / 60);
            cdText.textContent = `${sec}s`;
          }
        }
      }

      // Trailing ghost health bar drain
      if (this.ghostHealth > this.health) {
        this.ghostHealth -= 0.45;
        if (this.ghostHealth < this.health) this.ghostHealth = this.health;
      }

      // Hitstop / Freeze frame on impact
      if (this.hitstopTimer > 0) {
        this.hitstopTimer--;
        return;
      }

      if (this.hitFlashTimer > 0) this.hitFlashTimer--;
      if (this.invulnerableTimer > 0) this.invulnerableTimer--;

      // State timer tick
      this.stateTimer++;

      // Check Ground State
      this.applyPhysics(stageBounds);

      // State Transitions
      if (this.isStunnedOrLocked()) {
        this.handleLockedStates();
      } else {
        this.handleCombatAndMovement(input, opponent);
      }

      // Pushbox collision with opponent
      this.resolvePushbox(opponent);

      // Clamp within stage bounds
      if (stageBounds) {
        if (this.x < stageBounds.minX + 25) this.x = stageBounds.minX + 25;
        if (this.x > stageBounds.maxX - 25) this.x = stageBounds.maxX - 25;
      }
    }

    applyPhysics(stageBounds) {
      // Gravity
      if (!this.isGrounded) {
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;

        if (this.y >= this.groundY) {
          this.y = this.groundY;
          this.vy = 0;
          this.vx = 0;
          this.isGrounded = true;

          // Landing dust & sound
          const particles = window.NeonRumble.ParticleSystem;
          if (particles) particles.emitDust(this.x, this.y, 6);
          const sfx = window.NeonRumble.SoundSynth;
          if (sfx) sfx.playLand();

          if (this.state === 'JUMP') {
            this.setState('IDLE');
          }
        }
      } else {
        this.x += this.vx;
        this.vx *= 0.82; // Ground friction
      }
    }

    isStunnedOrLocked() {
      return (
        this.state.startsWith('ATTACK_') ||
        this.state === 'BLOCK_STUN' ||
        this.state === 'HIT_LIGHT' ||
        this.state === 'HIT_HEAVY' ||
        this.state === 'KNOCKDOWN' ||
        this.state === 'GET_UP' ||
        this.state === 'VICTORY' ||
        this.state === 'DEFEAT'
      );
    }

    handleLockedStates() {
      // 1. Attack Execution
      if (this.state.startsWith('ATTACK_')) {
        if (this.currentAttack) {
          const totalFrames = this.currentAttack.startup + this.currentAttack.active + this.currentAttack.recovery;
          this.currentAttackProgress = Math.min(1.0, this.stateTimer / totalFrames);

          // Projectile spawn check
          if (this.currentAttack.spawnsProjectile && this.stateTimer === this.currentAttack.startup && !this.hasSpawnedProj) {
            this.hasSpawnedProj = true;
            this.spawnSpecialProjectile();
          }

          if (this.stateTimer >= totalFrames) {
            this.currentAttack = null;
            this.setState(this.isGrounded ? 'IDLE' : 'JUMP');
          }
        } else {
          this.setState('IDLE');
        }
      }

      // 2. Hitstun & Blockstun
      else if (this.state === 'HIT_LIGHT' && this.stateTimer >= 14) {
        this.setState('IDLE');
      } else if (this.state === 'HIT_HEAVY' && this.stateTimer >= 24) {
        this.setState('IDLE');
      } else if (this.state === 'BLOCK_STUN' && this.stateTimer >= 12) {
        this.setState('IDLE');
      }

      // 3. Knockdown & Recovery
      else if (this.state === 'KNOCKDOWN') {
        if (this.stateTimer >= 35) {
          this.setState('GET_UP');
        }
      } else if (this.state === 'GET_UP') {
        if (this.stateTimer >= 18) {
          this.invulnerableTimer = 15; // Wakeup invulnerability
          this.setState('IDLE');
        }
      }
    }

    handleCombatAndMovement(input, opponent) {
      // Auto-face opponent when on ground and neutral
      if (this.isGrounded && opponent) {
        if (opponent.x > this.x + 8) this.facing = 1;
        else if (opponent.x < this.x - 8) this.facing = -1;
      }

      if (!input) return;

      // 1. Super Attack (Requires Cooldown Ready)
      if (input.super && this.superCooldownTimer <= 0) {
        this.triggerSuper();
        return;
      }

      // 2. Special Attack (Requires 25% meter)
      if (input.special && this.superMeter >= 25) {
        this.triggerSpecial();
        return;
      }

      // 3. Heavy Attack
      if (input.heavy) {
        if (!this.isGrounded) {
          this.startAttack('JUMP_HEAVY', AttackData.JUMP_HEAVY);
        } else if (input.down) {
          this.startAttack('ATTACK_CROUCH_HEAVY', AttackData.CROUCH_HEAVY);
        } else {
          this.startAttack('ATTACK_HEAVY', AttackData.HEAVY);
        }
        return;
      }

      // 4. Light Attack
      if (input.light) {
        if (!this.isGrounded) {
          this.startAttack('JUMP_LIGHT', AttackData.JUMP_LIGHT);
        } else if (input.down) {
          this.startAttack('ATTACK_CROUCH_LIGHT', AttackData.CROUCH_LIGHT);
        } else {
          this.startAttack('ATTACK_LIGHT', AttackData.LIGHT);
        }
        return;
      }

      // 5. Blocking (Holding Block Key or Holding Back)
      const holdingBack = (this.facing === 1 && input.left) || (this.facing === -1 && input.right);
      if ((input.block || holdingBack) && this.isGrounded) {
        this.setState('BLOCK');
        return;
      }

      // 6. Jump
      if (input.up && this.isGrounded) {
        this.isGrounded = false;
        this.vy = this.jumpForce;
        if (input.right) this.vx = this.speed * 0.9;
        else if (input.left) this.vx = -this.speed * 0.9;
        else this.vx = 0;

        const sfx = window.NeonRumble.SoundSynth;
        if (sfx) sfx.playJump();
        const particles = window.NeonRumble.ParticleSystem;
        if (particles) particles.emitDust(this.x, this.y, 5);

        this.setState('JUMP');
        return;
      }

      // 7. Crouch
      if (input.down && this.isGrounded) {
        this.setState('CROUCH');
        return;
      }

      // 8. Ground Movement (Forward / Backward)
      if (this.isGrounded) {
        if (input.right) {
          this.vx = this.speed;
          this.setState(this.facing === 1 ? 'WALK_FWD' : 'WALK_BACK');
        } else if (input.left) {
          this.vx = -this.speed;
          this.setState(this.facing === -1 ? 'WALK_FWD' : 'WALK_BACK');
        } else {
          this.setState('IDLE');
        }
      }
    }

    startAttack(stateName, attackData) {
      this.setState(stateName);
      this.currentAttack = attackData;
      this.currentAttackProgress = 0;
      this.hasHit = false;
      this.hasSpawnedProj = false;

      // Play whoosh sound
      const sfx = window.NeonRumble.SoundSynth;
      if (sfx) {
        sfx.playWhoosh(attackData.level === 'HEAVY' || attackData.level === 'SPECIAL');
      }
    }

    triggerSpecial() {
      const specialData = this.attacks.SPECIAL || AttackData.ARDRA_SPECIAL;
      this.superMeter = Math.max(0, this.superMeter - (specialData.meterCost || 25));
      this.startAttack('ATTACK_SPECIAL', specialData);

      const sfx = window.NeonRumble.SoundSynth;
      if (sfx) sfx.playSpecial(this.id);
      const particles = window.NeonRumble.ParticleSystem;
      if (particles) particles.emitShockwave(this.x, this.y - 45, 45, this.secondaryColor);
    }

    triggerSuper() {
      const superData = this.attacks.SUPER || AttackData.ARDRA_SUPER;
      this.superCooldownTimer = this.superCooldownMax;
      this.superMeter = 0;
      this.startAttack('ATTACK_SUPER', superData);

      // Trigger dramatic full-screen comic banner (e.g. "Bitchy Timeee!!!")
      const ui = window.NeonRumble.UIManager;
      if (ui) {
        ui.showSuperPopup(this.superPopupText, this.primaryColor, this.name);
      }

      // Super freeze & effects
      this.hitstopTimer = 22;
      const sfx = window.NeonRumble.SoundSynth;
      if (sfx) sfx.playSuperStartup();

      const particles = window.NeonRumble.ParticleSystem;
      if (particles) {
        particles.emitShockwave(this.x, this.y - 50, 80, '#ffffff');
        particles.emitAfterimage(this);
      }
    }

    spawnSpecialProjectile() {
      // Overridden by characters that shoot projectiles (Rex, Volt)
    }

    takeHit(attack, attacker) {
      if (this.invulnerableTimer > 0) return;

      const isBlocking = (this.state === 'BLOCK' || this.state === 'BLOCK_STUN');
      const sfx = window.NeonRumble.SoundSynth;
      const particles = window.NeonRumble.ParticleSystem;
      const combo = window.NeonRumble.ComboManager.getCounter(attacker.playerNum);

      if (isBlocking) {
        // Blocked Hit
        const chip = attack.chipDamage || 2;
        this.health = Math.max(0, this.health - chip);
        this.superMeter = Math.min(100, this.superMeter + 4);
        attacker.superMeter = Math.min(100, attacker.superMeter + 3);

        this.setState('BLOCK_STUN');
        this.vx = -this.facing * (attack.knockback.x * 0.45);
        this.hitstopTimer = 4;

        if (sfx) sfx.playBlock();
        if (particles) particles.emitBlockSparks(this.x + this.facing * 12, this.y - 45);
        return;
      }

      // Clean Hit
      const scaledDamage = combo.addHit(attack.damage);
      this.health = Math.max(0, this.health - scaledDamage);
      this.ghostHealth = Math.max(this.health, this.ghostHealth);

      // Meter gain
      this.superMeter = Math.min(100, this.superMeter + (attack.meterGainDefender || 4));
      attacker.superMeter = Math.min(100, attacker.superMeter + (attack.meterGainAttacker || 8));

      // Hit feedback
      this.hitFlashTimer = 6;
      this.hitstopTimer = attack.freezeFrames || 6;
      attacker.hitstopTimer = attack.freezeFrames || 6;

      // Knockback
      const kx = attack.knockback.x;
      const ky = attack.knockback.y;
      this.vx = -this.facing * kx;

      if (attack.causesKnockdown || this.health <= 0) {
        this.vy = ky || -5;
        this.isGrounded = false;
        this.setState('KNOCKDOWN');
      } else if (attack.level === 'HEAVY' || attack.level === 'SPECIAL') {
        this.setState('HIT_HEAVY');
        if (ky < 0) {
          this.vy = ky;
          this.isGrounded = false;
        }
      } else {
        this.setState('HIT_LIGHT');
      }

      // Audio & Particle FX
      if (sfx) {
        if (attack.level === 'HEAVY' || attack.level === 'SPECIAL' || attack.level === 'SUPER') {
          sfx.playHeavyHit();
        } else {
          sfx.playLightHit();
        }
      }

      if (particles) {
        const sparkColor = attack.level === 'SUPER' ? '#ff0055' : (attack.level === 'HEAVY' ? '#ffbb00' : '#ffffaa');
        particles.emitHitSparks(this.x, this.y - 48, attack.level === 'HEAVY' ? 16 : 8, sparkColor);
        if (attack.level === 'HEAVY' || attack.level === 'SPECIAL') {
          particles.emitShockwave(this.x, this.y - 48, 38, sparkColor);
        }
      }

      // Screen Shake Trigger
      const camera = window.NeonRumble.Camera;
      if (camera) {
        const intensity = attack.level === 'SUPER' ? 14 : (attack.level === 'HEAVY' ? 8 : 4);
        camera.addShake(intensity);
      }
    }

    resolvePushbox(opponent) {
      if (!opponent) return;
      const pb1 = this.getPushbox();
      const pb2 = opponent.getPushbox();

      if (Box.checkOverlap(pb1, pb2)) {
        const overlap = (pb1.right - pb2.left < pb2.right - pb1.left)
          ? pb1.right - pb2.left
          : -(pb2.right - pb1.left);

        const pushDist = overlap * 0.5;
        this.x -= pushDist;
        opponent.x += pushDist;
      }
    }

    setState(newState) {
      if (this.state === newState) return;
      this.state = newState;
      this.stateTimer = 0;
    }
  }

  window.NeonRumble.Fighter = Fighter;
})();
