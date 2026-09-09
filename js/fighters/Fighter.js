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
      this.specialCooldownMax = config.specialCooldownMax || 240; // 4 seconds cooldown
      this.specialCooldownTimer = 0; // Starts ready and glowing!
      this.prevSpecialReady = true;
      this.hitIntervalTimer = 0; // Minimum interval between hits landed
      this.aiAttackCooldown = 0; // Interval cooldown between AI attack decisions
      this.dodgeCooldown = 0; // Cooldown between evasive dodges (prevents chain-dodging)
      this.superPopupText = config.superPopupText || 'SUPER POWER ACTIVATED!';
      // Movement speed (Enemies move at reduced speed so player has agile mobility advantage)
      const defaultSpeed = (this.playerNum === 2 ? 2.7 : 4.2);
      this.speed = config.speed !== undefined ? config.speed : defaultSpeed;
      if (this.playerNum === 2 && this.speed > 3.0) {
        this.speed = 2.9;
      }
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
      this.caughtOpponent = null;
      this.isBeingPulled = false;
      this.pullAttacker = null;

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
      this.superCooldownTimer = 0;
      this.specialCooldownTimer = 0;
      this.prevSpecialReady = true;
      this.hitIntervalTimer = 0;
      this.aiAttackCooldown = 0;
      this.dodgeCooldown = 0;
      this.isGrounded = true;
      this.caughtOpponent = null;
      this.isBeingPulled = false;
      this.pullAttacker = null;
    }

    getHurtbox() {
      if (this.state === 'KNOCKDOWN') {
        return new Box(-28, -18, 56, 18, 'hurt').getWorldBounds(this.x, this.y, this.facing);
      } else if (this.state === 'CROUCH' || this.state === 'LAND' || this.state === 'ATTACK_CROUCH_LIGHT' || this.state === 'ATTACK_CROUCH_HEAVY') {
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
        // SUPER ATTACK CONTACT-ONLY DETECTION:
        // For Ardra's Long Tongue Lash ("Bitchy Timeee!!!"), health is ONLY affected if the physical tongue
        // actually makes contact with the opponent. The hitbox dynamically scales and matches the real-time
        // extension, whip wave, and retraction of the animated tongue!
        if (this.state === 'ATTACK_SUPER' && this.currentAttack.name && this.currentAttack.name.includes('Tongue')) {
          const totalFrames = totalStartup + totalActive + (this.currentAttack.recovery || 20);
          const p = Math.min(1.0, this.stateTimer / totalFrames);
          let currentTongueLen = 0;
          if (p < 0.25) {
            // Rapid tongue launch forward
            currentTongueLen = (p / 0.25) * 225;
          } else if (p < 0.72) {
            // Full extension with sinusoidal wave lash
            currentTongueLen = 225 + Math.sin(this.animTimer * 0.9) * 25;
          } else {
            // Retracting rapidly back to mouth
            currentTongueLen = Math.max(0, 225 * (1 - (p - 0.72) / 0.28));
          }

          // If the tongue has barely left the mouth or is fully retracted, no contact can occur
          if (currentTongueLen < 28) return null;

          const wave1 = Math.sin(this.animTimer * 0.65) * 18;
          const tongueY = -63 + wave1 * 0.5;
          const boxH = 32; // Contact thickness of the whipping tongue

          // Dynamic hitbox matching exact current extension and vertical wave of the tongue
          return new Box(6, tongueY - boxH / 2, currentTongueLen, boxH, 'hit').getWorldBounds(this.x, this.y, this.facing);
        }

        // DEMON CHAIN BUSTER CONTACT-ONLY DETECTION:
        // Spiked chain shoots out up to 210px reach. Hitbox matches dynamic chain extension.
        if (this.state === 'ATTACK_SUPER' && this.currentAttack.isChainAttack) {
          const launchFrames = 16;
          const launchP = Math.min(1.0, Math.max(0, (this.stateTimer - totalStartup) / launchFrames));
          const chainReach = Math.max(25, launchP * 210);
          return new Box(15, -60, chainReach, 44, 'hit').getWorldBounds(this.x, this.y, this.facing);
        }

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
      if (this.specialCooldownTimer > 0) {
        this.specialCooldownTimer--;
      }
      if (this.hitIntervalTimer > 0) {
        this.hitIntervalTimer--;
      }
      if (this.aiAttackCooldown > 0) {
        this.aiAttackCooldown--;
      }
      if (this.dodgeCooldown > 0) {
        this.dodgeCooldown--;
      }

      // Update on-screen mobile button statuses for Player 1
      if (this.playerNum === 1) {
        // Super button status
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

        // Special button status (colorless & recharging animation, glowing when powered up)
        const specialBtn = document.getElementById('btn-touch-special');
        const specialCdText = document.getElementById('touch-special-cooldown');
        const specialProgress = specialBtn ? specialBtn.querySelector('.special-recharge-progress') : null;
        if (specialBtn) {
          const isSpecialReady = (this.specialCooldownTimer <= 0);
          if (isSpecialReady) {
            if (!this.prevSpecialReady) {
              // Just finished recharging! Trigger power-up glow and sound
              const sfx = window.NeonRumble && window.NeonRumble.SoundSynth;
              if (sfx && typeof sfx.playUI === 'function') {
                sfx.playUI('special_ready');
              }
              specialBtn.classList.remove('special-colorless', 'special-recharging');
              specialBtn.classList.add('special-ready', 'special-powerup-flash');
              setTimeout(() => {
                specialBtn.classList.remove('special-powerup-flash');
              }, 350);
              this.prevSpecialReady = true;
            } else {
              specialBtn.classList.remove('special-colorless', 'special-recharging');
              specialBtn.classList.add('special-ready');
            }
            if (specialCdText) specialCdText.textContent = 'READY';
            if (specialProgress) specialProgress.style.height = '100%';
          } else {
            // Still recharging: colorless with animated sweep and fill progress
            this.prevSpecialReady = false;
            specialBtn.classList.remove('special-ready', 'special-powerup-flash');
            specialBtn.classList.add('special-colorless', 'special-recharging');
            const sec = (this.specialCooldownTimer / 60).toFixed(1);
            if (specialCdText) specialCdText.textContent = `${sec}s`;
            if (specialProgress) {
              const maxCd = this.specialCooldownMax || 240;
              const pct = Math.max(0, Math.min(100, Math.round((1 - (this.specialCooldownTimer / maxCd)) * 100)));
              specialProgress.style.height = `${pct}%`;
            }
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

      // Check Ground State & Air Movement
      this.applyPhysics(stageBounds, input);

      // State Transitions
      if (this.isStunnedOrLocked()) {
        this.handleLockedStates(input, opponent);
      } else {
        this.handleCombatAndMovement(input, opponent);
      }

      // Pushbox collision with opponent
      this.resolvePushbox(opponent);

      // Strict Combat Zone Boundary Clamping
      const bounds = (stageBounds && stageBounds.bounds) ? stageBounds.bounds : (stageBounds || {});
      const minX = bounds.minX !== undefined ? bounds.minX : 120;
      const maxX = bounds.maxX !== undefined ? bounds.maxX : 1280;
      const margin = Math.max(30, (this.width || 44) * 0.5 + 6);

      const combatMinX = minX + margin;
      const combatMaxX = maxX - margin;

      if (this.x < combatMinX) {
        this.x = combatMinX;
        if (this.vx < 0) this.vx = 0;
      } else if (this.x > combatMaxX) {
        this.x = combatMaxX;
        if (this.vx > 0) this.vx = 0;
      }
    }

    applyPhysics(stageBounds, input) {
      // Gravity & Vertical Physics
      if (!this.isGrounded) {
        this.vy += this.gravity;
        this.y += this.vy;

        // Airborne air-steering via A/D inputs in any airborne situation
        if (input && (input.left || input.right)) {
          const airDir = input.right ? 1 : -1;
          this.vx += airDir * 0.55;
          const maxAirVx = this.speed * 1.15;
          this.vx = Math.max(-maxAirVx, Math.min(maxAirVx, this.vx));
        }

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

          // Smooth transition to LAND squash unless attacking/knocked down
          if (!this.state.startsWith('ATTACK_') && !this.state.startsWith('JUMP_') && this.state !== 'KNOCKDOWN') {
            // Immediate cancel if moving input is pressed upon landing
            if (input && (input.left || input.right)) {
              this.setState('IDLE');
            } else {
              this.setState('LAND');
            }
          }
        } else if (this.vy > 1.2 && (this.state === 'JUMP' || this.state === 'IDLE')) {
          // Downward descent airborne state
          this.setState('FALL');
        }
      } else {
        this.x += this.vx;
        this.vx *= 0.82; // Ground friction
      }

      // Keep strictly within combat zone during physics
      if (stageBounds) {
        const bounds = (stageBounds && stageBounds.bounds) ? stageBounds.bounds : (stageBounds || {});
        const minX = bounds.minX !== undefined ? bounds.minX : 120;
        const maxX = bounds.maxX !== undefined ? bounds.maxX : 1280;
        const margin = Math.max(30, (this.width || 44) * 0.5 + 6);

        if (this.x < minX + margin) {
          this.x = minX + margin;
          if (this.vx < 0) this.vx = 0;
        } else if (this.x > maxX - margin) {
          this.x = maxX - margin;
          if (this.vx > 0) this.vx = 0;
        }
      }
    }

    isStunnedOrLocked() {
      return (
        this.state.startsWith('ATTACK_') ||
        this.state.startsWith('JUMP_') ||
        this.state === 'BLOCK_STUN' ||
        this.state === 'HIT_LIGHT' ||
        this.state === 'HIT_HEAVY' ||
        this.state === 'KNOCKDOWN' ||
        this.state === 'GET_UP' ||
        this.state === 'LAND' ||
        this.state === 'DODGE' ||
        this.state === 'VICTORY' ||
        this.state === 'DEFEAT'
      );
    }

    handleLockedStates(input, opponent) {
      const isAttacking = this.state.startsWith('ATTACK_') || this.state.startsWith('JUMP_');

      // 1. Attack Execution & Continuous Movement
      if (isAttacking) {
        if (this.currentAttack) {
          const totalFrames = this.currentAttack.startup + this.currentAttack.active + this.currentAttack.recovery;
          this.currentAttackProgress = Math.min(1.0, this.stateTimer / totalFrames);

          // Real-time movement while fighting! Only the hero (Player 1) can move + attack at the same time.
          // Enemies cannot move while attacking; their feet stay planted.
          if (input && (input.left || input.right)) {
            if (this.playerNum === 1) {
              const moveDir = input.right ? 1 : -1;
              const isRun = input.run || this.isDashing;
              const attackSpeed = isRun ? this.speed * 1.35 : this.speed * 0.95;
              this.vx = moveDir * attackSpeed;
              this.x += this.vx;

              if (this.animTimer % 4 === 0) {
                const particles = window.NeonRumble.ParticleSystem;
                if (particles) {
                  particles.emitDust(this.x - moveDir * 10, this.y, 2, -moveDir);
                  if (isRun) particles.emitAfterimage(this);
                }
              }
            } else if (this.isGrounded) {
              // All enemies stand firmly planted and cannot move while attacking
              this.vx = 0;
            }
          } else if (this.playerNum !== 1 && this.isGrounded) {
            this.vx = 0;
          }

          // Projectile spawn check
          if (this.currentAttack.spawnsProjectile && this.stateTimer === this.currentAttack.startup && !this.hasSpawnedProj) {
            this.hasSpawnedProj = true;
            this.spawnSpecialProjectile();
          }

          // Demon Chain Buster: Drag caught opponent in and punch!
          if (this.state === 'ATTACK_SUPER' && this.currentAttack.isChainAttack && this.caughtOpponent) {
            const opp = this.caughtOpponent;
            const targetX = this.x + this.facing * 44;
            if (this.stateTimer < 42) {
              opp.x += (targetX - opp.x) * 0.28;
              opp.setState('HIT_LIGHT');
              opp.invulnerableTimer = 0;
              if (this.stateTimer % 4 === 0) {
                const particles = window.NeonRumble.ParticleSystem;
                if (particles && typeof particles.emitDust === 'function') {
                  particles.emitDust(opp.x, opp.y, 2, -this.facing);
                }
              }
            } else if (this.stateTimer === 42) {
              opp.isBeingPulled = false;
              opp.pullAttacker = null;
              this.caughtOpponent = null;

              const punchAttack = {
                ...this.currentAttack,
                name: 'Demon Chain Buster Punch',
                isChainAttack: false
              };
              opp.takeHit(punchAttack, this);
            }
          }

          // Move + Fight Combo-Canceling during attack recovery frames
          const inRecovery = this.stateTimer >= (this.currentAttack.startup + this.currentAttack.active);
          if (inRecovery && input) {
            // Allow chaining into next attack or instant ground movement
            if (input.light || input.heavy || input.special || input.super) {
              if (this.caughtOpponent) {
                this.caughtOpponent.isBeingPulled = false;
                this.caughtOpponent.pullAttacker = null;
                this.caughtOpponent = null;
              }
              this.currentAttack = null;
              this.handleCombatAndMovement(input, opponent);
              return;
            }
          }

          if (this.stateTimer >= totalFrames) {
            if (this.caughtOpponent) {
              this.caughtOpponent.isBeingPulled = false;
              this.caughtOpponent.pullAttacker = null;
              this.caughtOpponent = null;
            }
            this.currentAttack = null;
            this.setState(this.isGrounded ? 'IDLE' : 'FALL');
          }
        } else {
          if (this.caughtOpponent) {
            this.caughtOpponent.isBeingPulled = false;
            this.caughtOpponent.pullAttacker = null;
            this.caughtOpponent = null;
          }
          this.setState(this.isGrounded ? 'IDLE' : 'FALL');
        }
      }

      // 2. Landing Squash Recovery (Can be immediately cancelled by A/D movement or attacks!)
      else if (this.state === 'LAND') {
        if (input && (input.left || input.right || input.light || input.heavy || input.special || input.super || input.up || input.down)) {
          this.setState('IDLE');
          this.handleCombatAndMovement(input, opponent);
          return;
        }
        if (this.stateTimer >= 5) {
          this.setState('IDLE');
        }
      }

      // 3. Hitstun & Blockstun
      else if (this.state === 'HIT_LIGHT' && this.stateTimer >= 14) {
        this.setState('IDLE');
      } else if (this.state === 'HIT_HEAVY' && this.stateTimer >= 24) {
        this.setState('IDLE');
      } else if (this.state === 'BLOCK_STUN') {
        if (input && (input.left || input.right) && this.stateTimer >= 6) {
          const moveDir = input.right ? 1 : -1;
          this.vx += moveDir * 0.4;
        }
        if (this.stateTimer >= 12) {
          this.setState('IDLE');
        }
      }

      // 4. Knockdown & Recovery
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

      // 5. Dodge State (Snappy evasive slip with afterimages and smooth deceleration)
      else if (this.state === 'DODGE') {
        if (this.animTimer % 3 === 0) {
          const particles = window.NeonRumble.ParticleSystem;
          if (particles && typeof particles.emitAfterimage === 'function') {
            particles.emitAfterimage(this);
          }
        }
        this.vx *= 0.88;
        if (this.stateTimer >= 16) {
          this.setState('IDLE');
        }
      }
    }

    handleCombatAndMovement(input, opponent) {
      // Auto-face opponent when on ground and neutral, but do not override during retreat dash
      if (this.isGrounded && opponent && !this.dashToMiddle) {
        if (opponent.x > this.x + 8) this.facing = 1;
        else if (opponent.x < this.x - 8) this.facing = -1;
      }

      if (!input) return;

      // 1. Super Attack (Requires Cooldown Ready)
      if (input.super && this.superCooldownTimer <= 0) {
        this.triggerSuper();
        return;
      }

      // 2. Special Attack (Requires Cooldown Ready or 25% meter)
      if (input.special && (this.specialCooldownTimer <= 0 || this.superMeter >= 25)) {
        this.triggerSpecial();
        return;
      }

      // 3. Heavy Attack (Move + Attack supported: keeps momentum)
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

      // 4. Light Attack & Kick (Move + Attack supported)
      if (input.light) {
        if (!this.isGrounded) {
          this.startAttack('JUMP_LIGHT', AttackData.JUMP_LIGHT);
        } else if (input.down) {
          this.startAttack('ATTACK_CROUCH_LIGHT', AttackData.CROUCH_LIGHT);
        } else if ((this.facing === 1 && input.right) || (this.facing === -1 && input.left)) {
          // Forward + Light = Thrust Kick
          this.startAttack('ATTACK_KICK', AttackData.KICK);
        } else {
          // Neutral Light = Light Punch / Slash
          this.startAttack('ATTACK_LIGHT', AttackData.LIGHT);
        }
        return;
      }

      // 5. Jump with fluid air momentum
      if (input.up && this.isGrounded) {
        this.isGrounded = false;
        this.vy = this.jumpForce;
        if (input.right) this.vx = this.speed * 0.95;
        else if (input.left) this.vx = -this.speed * 0.95;
        else this.vx = 0;

        const sfx = window.NeonRumble.SoundSynth;
        if (sfx) sfx.playJump();
        const particles = window.NeonRumble.ParticleSystem;
        if (particles) particles.emitDust(this.x, this.y, 5);

        this.setState('JUMP');
        return;
      }

      // 6. Crouch & Crouch-Walk (Low-stalk movement with A/D)
      if (input.down && this.isGrounded) {
        if (input.left || input.right) {
          const moveDir = input.right ? 1 : -1;
          this.vx = moveDir * this.speed * 0.65;
          if (this.animTimer % 6 === 0) {
            const particles = window.NeonRumble.ParticleSystem;
            if (particles) particles.emitDust(this.x - moveDir * 8, this.y, 1, -moveDir);
          }
        } else {
          this.vx = 0;
        }
        this.setState('CROUCH');
        return;
      }

      // 7. Blocking (Only when holding explicit block key and not attempting to move)
      if (input.block && this.isGrounded) {
        if (input.left || input.right) {
          // Defensive Guard-Walk
          const moveDir = input.right ? 1 : -1;
          this.vx = moveDir * this.speed * 0.55;
          this.setState('BLOCK');
          return;
        } else {
          this.vx = 0;
          this.setState('BLOCK');
          return;
        }
      }

      // 8. Ground Movement (Forward Walk / Forward Run / Backward Walk / Backward Run)
      // Directly enables moving backward with A/D without being hijacked into BLOCK
      if (this.isGrounded) {
        if (input.run || this.isDashing || this.dashToMiddle) {
          if (input.right && !input.left) this.facing = 1;
          else if (input.left && !input.right) this.facing = -1;
        }

        const isFwdRight = (this.facing === 1 && input.right);
        const isFwdLeft = (this.facing === -1 && input.left);
        const isMovingFwd = isFwdRight || isFwdLeft;
        const isMovingBack = (this.facing === 1 && input.left) || (this.facing === -1 && input.right);

        // Double-tap forward detection & run input
        if (this.dashTapTimer > 0) this.dashTapTimer--;
        const isFwdTap = isMovingFwd && !this.prevMovingFwd;
        if (isFwdTap) {
          if (this.dashTapTimer > 0) {
            this.isDashing = true;
          } else {
            this.dashTapTimer = 16;
          }
        }
        this.prevMovingFwd = isMovingFwd;
        if (input.run || this.dashToMiddle) this.isDashing = true;

        if (isMovingFwd) {
          if (this.isDashing) {
            this.vx = this.facing * this.speed * 1.65;
            this.setState('RUN');
            if (this.animTimer % 4 === 0) {
              const particles = window.NeonRumble.ParticleSystem;
              if (particles) {
                particles.emitDust(this.x - this.facing * 12, this.y, 3, -this.facing);
                particles.emitAfterimage(this);
              }
            }
          } else {
            this.vx = this.facing * this.speed;
            this.setState('WALK_FWD');
          }
        } else if (isMovingBack) {
          // Hero moves backward!
          const moveDir = this.facing === 1 ? -1 : 1;
          if (this.isDashing || input.run) {
            // Agile retreat sprint/dash
            this.vx = moveDir * this.speed * 1.45;
            this.setState('RUN');
            if (this.animTimer % 4 === 0) {
              const particles = window.NeonRumble.ParticleSystem;
              if (particles) {
                particles.emitDust(this.x - moveDir * 10, this.y, 2, -moveDir);
                particles.emitAfterimage(this);
              }
            }
          } else {
            // Smooth backward walk
            this.vx = moveDir * this.speed * 0.95;
            this.setState('WALK_BACK');
          }
        } else {
          this.isDashing = false;
          this.setState('IDLE');
        }
      }
    }

    startAttack(stateName, attackData, initialVx = null) {
      this.setState(stateName);
      this.currentAttack = attackData;
      this.currentAttackProgress = 0;
      this.hasHit = false;
      this.hasSpawnedProj = false;

      // Preserve or set momentum for hero (Player 1). All enemies must stand still to attack.
      if (this.playerNum === 1) {
        if (initialVx !== null) {
          this.vx = initialVx;
        } else if (Math.abs(this.vx) > 0.5) {
          this.vx = this.vx * 0.95;
        }
      } else {
        // Enemies cannot slide or move when starting an attack
        if (this.isGrounded) {
          this.vx = 0;
        }
      }

      // Play whoosh sound
      const sfx = window.NeonRumble.SoundSynth;
      if (sfx) {
        sfx.playWhoosh(attackData.level === 'HEAVY' || attackData.level === 'SPECIAL');
      }
    }

    triggerSpecial() {
      const specialData = this.attacks.SPECIAL || AttackData.ARDRA_SPECIAL;
      this.superMeter = Math.max(0, this.superMeter - (specialData.meterCost || 25));
      this.specialCooldownTimer = this.specialCooldownMax;
      this.prevSpecialReady = false;
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

    canDodge() {
      // Must be grounded to dodge
      if (!this.isGrounded) return false;
      // Must not be currently on dodge cooldown
      if (this.dodgeCooldown > 0) return false;
      // Cannot dodge during hitstun, blockstun, knockdown, getting up, or already dodging
      if (this.state === 'HIT_LIGHT' || this.state === 'HIT_HEAVY' ||
          this.state === 'BLOCK_STUN' || this.state === 'KNOCKDOWN' ||
          this.state === 'GET_UP' || this.state === 'DODGE') {
        return false;
      }
      // Cannot dodge during active attack execution (whiff punishes work!)
      if (this.state.startsWith('ATTACK_') || this.state.startsWith('JUMP_')) {
        return false;
      }
      return true;
    }

    triggerDodge(attacker) {
      this.setState('DODGE');
      this.stateTimer = 0;
      this.invulnerableTimer = 16; // 16 frames of invulnerability during dodge
      const isBoss = (this.isBoss || this.name === 'OVERLORD TITAN');
      // Set dodge cooldown (140-170 frames for regular enemies, 100-120 for boss)
      this.dodgeCooldown = isBoss ? (100 + Math.floor(Math.random() * 20)) : (140 + Math.floor(Math.random() * 30));

      // Evade backward away from attacker
      const attackerX = attacker ? attacker.x : (this.x + this.facing * 50);
      const evadeDir = this.x < attackerX ? -1 : 1;
      this.vx = evadeDir * Math.max(4.2, this.speed * 1.85);

      const sfx = window.NeonRumble.SoundSynth;
      if (sfx && typeof sfx.playDash === 'function') sfx.playDash();

      const particles = window.NeonRumble.ParticleSystem;
      if (particles) {
        if (typeof particles.emitDust === 'function') particles.emitDust(this.x, this.y, 6, evadeDir);
        if (typeof particles.emitAfterimage === 'function') particles.emitAfterimage(this);
        if (typeof particles.emitFloatingText === 'function') {
          particles.emitFloatingText(this.x, this.y - 48, 'DODGE!', '#00f0ff');
        }
      }
    }

    takeHit(attack, attacker) {
      if (this.invulnerableTimer > 0) return;

      // Release any caught/pull state on hit
      if (this.caughtOpponent) {
        this.caughtOpponent.isBeingPulled = false;
        this.caughtOpponent.pullAttacker = null;
        this.caughtOpponent = null;
      }
      if (this.isBeingPulled) {
        this.isBeingPulled = false;
        this.pullAttacker = null;
      }

      const isBlocking = (this.state === 'BLOCK' || this.state === 'BLOCK_STUN');
      const sfx = window.NeonRumble.SoundSynth;
      const particles = window.NeonRumble.ParticleSystem;
      const combo = window.NeonRumble.ComboManager.getCounter(attacker ? attacker.playerNum : 1);

      if (isBlocking) {
        // Blocked Hit
        const chip = attack.chipDamage || 2;
        this.health = Math.max(0, this.health - chip);
        this.superMeter = Math.min(100, this.superMeter + 4);
        if (attacker) attacker.superMeter = Math.min(100, attacker.superMeter + 3);

        this.setState('BLOCK_STUN');
        this.vx = -this.facing * (attack.knockback.x * 0.45);
        this.hitstopTimer = 4;

        if (sfx) sfx.playBlock();
        if (particles) particles.emitBlockSparks(this.x + this.facing * 12, this.y - 45);
        return;
      }

      // Clean Hit with stage-based enemy damage scaling
      const stageLvl = (attacker && (attacker.stageNum || attacker.aiStageLevel)) ? (attacker.stageNum || attacker.aiStageLevel) : 1;
      const stageDamageMultiplier = (attacker && attacker.playerNum !== 1) ? (1.0 + (stageLvl - 1) * 0.06) : 1.0;
      const baseDmg = Math.round(attack.damage * stageDamageMultiplier);
      const scaledDamage = combo.addHit(baseDmg);
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
        if (particles.emitComicStarburst) {
          particles.emitComicStarburst(this.x, this.y - 48, (attack.level === 'HEAVY' || attack.level === 'SUPER') ? 44 : 26);
        }
        if (attack.level === 'HEAVY' || attack.level === 'SPECIAL' || attack.level === 'SUPER') {
          particles.emitShockwave(this.x, this.y - 48, 38, sparkColor);
          if (particles.emitDiagonalSlashBeam) {
            const angle = (Math.random() > 0.5 ? -1 : 1) * (0.55 + Math.random() * 0.3);
            particles.emitDiagonalSlashBeam(this.x, this.y - 48, angle);
          }
        }
      }

      // Screen Shake Trigger
      const camera = window.NeonRumble.Camera;
      if (camera) {
        const intensity = attack.level === 'SUPER' ? 14 : (attack.level === 'HEAVY' ? 8 : 4);
        camera.addShake(intensity);
      }
    }

    checkHitAgainst(opponent) {
      if (!opponent) return false;
      if (this.hitIntervalTimer > 0) return false;

      // Only the hero can hit while moving (moving + attack).
      // Enemies cannot hit if they are moving while performing an attack.
      if (this.playerNum !== 1 && this.isGrounded && Math.abs(this.vx) > 0.3) {
        return false;
      }

      // If opponent is currently invulnerable or in DODGE evasion, cannot hit
      if (opponent.invulnerableTimer > 0 || opponent.state === 'DODGE') {
        return false;
      }

      const hitbox = this.getActiveHitbox();
      if (!hitbox) return false;

      const hurtbox = opponent.getHurtbox();
      if (hurtbox && Box.checkOverlap(hitbox, hurtbox)) {
        // ENEMY DODGE MECHANIC:
        // When hero (Player 1) attacks an enemy, the enemy can dodge the incoming hit.
        // But NOT every time: only if canDodge() is true (off cooldown, not in hitstun/attacking/knockdown),
        // and with a controlled chance scaled by stage difficulty (~20% Stage 1 up to ~32% Boss).
        if (this.playerNum === 1 && opponent.playerNum !== 1) {
          if (opponent.canDodge && opponent.canDodge()) {
            const oppStageLvl = opponent.stageNum || opponent.aiStageLevel || 1;
            const isBoss = (opponent.isBoss || opponent.name === 'OVERLORD TITAN' || oppStageLvl >= 6);
            const dodgeChance = isBoss ? 0.32 : Math.min(0.30, 0.20 + (oppStageLvl - 1) * 0.025);
            if (Math.random() < dodgeChance) {
              opponent.triggerDodge(this);
              return false; // Dodged! Strike cleanly misses.
            }
          }
        }

        this.hasHit = true;
        const stageLvl = this.stageNum || this.aiStageLevel || 1;
        const isBoss = (this.isBoss || this.name === 'OVERLORD TITAN' || stageLvl >= 6);
        const interval = isBoss ? 38 : Math.max(38, 55 - (stageLvl - 1) * 3);
        this.hitIntervalTimer = interval;
        this.aiAttackCooldown = Math.max(this.aiAttackCooldown || 0, interval);

        // DEMON CHAIN BUSTER SPECIAL MECHANIC:
        // Snare opponent and pull them across the floor to point-blank range!
        // Devastating punch follows at point-blank range on frame 42.
        if (this.currentAttack.isChainAttack) {
          this.caughtOpponent = opponent;
          opponent.isBeingPulled = true;
          opponent.pullAttacker = this;
          opponent.setState('HIT_LIGHT');
          opponent.invulnerableTimer = 0;
          const sfx = window.NeonRumble.SoundSynth;
          if (sfx && typeof sfx.playBlock === 'function') sfx.playBlock();
          const particles = window.NeonRumble.ParticleSystem;
          if (particles && typeof particles.emitHitSparks === 'function') {
            particles.emitHitSparks(opponent.x, opponent.y - 45, 14, '#ffd700');
          }
          return true;
        }

        opponent.takeHit(this.currentAttack, this);
        return true;
      }
      return false;
    }

    resolvePushbox(opponent) {
      if (!opponent) return;
      const pb1 = this.getPushbox();
      const pb2 = opponent.getPushbox();

      if (Box.checkOverlap(pb1, pb2)) {
        // If this fighter is actively dashing to the middle, slip smoothly past opponent
        if (this.dashToMiddle) {
          const passDir = this.facing;
          this.x += passDir * (this.speed * 1.15);
          const particles = window.NeonRumble.ParticleSystem;
          if (particles && this.animTimer % 4 === 0) particles.emitAfterimage(this);
          return;
        }

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
