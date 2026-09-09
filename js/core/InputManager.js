/**
 * InputManager.js - Keyboard Input Processor & Buffer System
 * Handles P1, P2, Pause, Input Buffering, and Training Mode AI Dummies.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class InputManager {
    constructor() {
      this.keysDown = {};
      this.p1Buffer = { light: 0, heavy: 0, special: 0, super: 0 };
      this.p2Buffer = { light: 0, heavy: 0, special: 0, super: 0 };

      // Configurable Key Bindings
      this.bindings = {
        p1: {
          left: ['KeyA', 'a', 'A', 'ArrowLeft'],
          right: ['KeyD', 'd', 'D', 'ArrowRight'],
          up: ['KeyW', 'w', 'W', 'ArrowUp'],
          down: ['KeyS', 's', 'S', 'ArrowDown'],
          light: ['KeyF', 'f', 'F'],
          heavy: ['KeyG', 'g', 'G'],
          special: ['KeyH', 'h', 'H'],
          super: ['KeyT', 't', 'T'],
          block: ['KeyR', 'r', 'R']
        },
        p2: {
          left: ['ArrowLeft'],
          right: ['ArrowRight'],
          up: ['ArrowUp'],
          down: ['ArrowDown'],
          light: ['KeyJ', 'j', 'J'],
          heavy: ['KeyK', 'k', 'K'],
          special: ['KeyL', 'l', 'L'],
          super: ['KeyO', 'o', 'O'],
          block: ['Semicolon', ';']
        }
      };

      // AI Dummy configuration for training / single player
      this.aiMode = 'SPARRING'; // Default to 1-player sparring against CPU!
      this.aiTimer = 0;

      // Virtual Touch States
      this.touchState = {
        left: false, right: false, up: false, down: false,
        light: false, heavy: false, special: false, super: false, block: false
      };
      this.touchEnabledByUser = true;

      this.setupListeners();
      this.setupTouchControls();
    }

    setupListeners() {
      window.addEventListener('keydown', (e) => {
        // Prevent default scrolling for arrows and space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
          e.preventDefault();
        }

        this.keysDown[e.code] = true;
        this.keysDown[e.key] = true;
        if (typeof e.key === 'string') {
          this.keysDown[e.key.toLowerCase()] = true;
          this.keysDown[e.key.toUpperCase()] = true;
        }

        // Populate Input Buffers on press
        this.checkBufferPress(1, e.code, e.key);
        this.checkBufferPress(2, e.code, e.key);

        // Notify Game State on key down (e.g. menu navigation or pause)
        const gs = window.NeonRumble.GameState;
        if (gs && gs.handleKeyDown) {
          gs.handleKeyDown(e.code, e.key);
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keysDown[e.code] = false;
        this.keysDown[e.key] = false;
        if (typeof e.key === 'string') {
          this.keysDown[e.key.toLowerCase()] = false;
          this.keysDown[e.key.toUpperCase()] = false;
        }
      });
    }

    setupTouchControls() {
      const touchContainer = document.getElementById('touch-controls');
      if (!touchContainer) return;

      const buttons = touchContainer.querySelectorAll('[data-key]');
      const gs = window.NeonRumble.GameState;

      buttons.forEach(btn => {
        const key = btn.getAttribute('data-key');

        const handlePress = (e) => {
          if (e.cancelable) e.preventDefault();
          this.touchState[key] = true;
          btn.classList.add('touch-active');

          // Audio resume
          const sfx = window.NeonRumble.SoundSynth;
          if (sfx) sfx.resume();

          // Buffer press
          const BUFFER_WINDOW = 6;
          if (key === 'light') this.p1Buffer.light = BUFFER_WINDOW;
          if (key === 'heavy') this.p1Buffer.heavy = BUFFER_WINDOW;
          if (key === 'special') this.p1Buffer.special = BUFFER_WINDOW;
          if (key === 'super') this.p1Buffer.super = BUFFER_WINDOW;

          // Pass to GameState if in a menu
          if (gs && gs.state !== 'FIGHTING' && gs.state !== 'TRAINING') {
            if (key === 'up') gs.handleKeyDown('ArrowUp', 'ArrowUp');
            else if (key === 'down') gs.handleKeyDown('ArrowDown', 'ArrowDown');
            else if (key === 'left') gs.handleKeyDown('ArrowLeft', 'ArrowLeft');
            else if (key === 'right') gs.handleKeyDown('ArrowRight', 'ArrowRight');
            else if (key === 'light' || key === 'heavy' || key === 'special' || key === 'super') gs.handleKeyDown('Enter', 'Enter');
          }
        };

        const handleRelease = (e) => {
          if (e.cancelable) e.preventDefault();
          this.touchState[key] = false;
          btn.classList.remove('touch-active');
        };

        btn.addEventListener('touchstart', handlePress, { passive: false });
        btn.addEventListener('touchend', handleRelease, { passive: false });
        btn.addEventListener('touchcancel', handleRelease, { passive: false });
        btn.addEventListener('mousedown', handlePress);
        btn.addEventListener('mouseup', handleRelease);
        btn.addEventListener('mouseleave', handleRelease);
      });

      // Toggle touch controls visibility button in footer
      const toggleBtn = document.getElementById('btn-touch-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          this.touchEnabledByUser = !this.touchEnabledByUser;
          toggleBtn.textContent = this.touchEnabledByUser ? '📱 TOUCH: ON' : '📱 TOUCH: OFF';
          this.syncTouchVisibility();
        });
      }

      this.syncTouchVisibility();
    }

    syncTouchVisibility() {
      const touchContainer = document.getElementById('touch-controls');
      if (!touchContainer) return;

      const gs = window.NeonRumble.GameState;
      const state = gs ? gs.state : 'BOOT';
      // Touch controls only appear in the combat zone (fighting, training, free roam dojo, round intro/end)
      const inCombatZone = ['FIGHTING', 'TRAINING', 'FREE_ROAM', 'ROUND_INTRO', 'ROUND_END'].includes(state);

      if (inCombatZone && this.touchEnabledByUser) {
        touchContainer.classList.remove('touch-hidden');
      } else {
        touchContainer.classList.add('touch-hidden');
      }
    }

    checkBufferPress(playerNum, code, key) {
      const b = playerNum === 1 ? this.bindings.p1 : this.bindings.p2;
      const targetBuffer = playerNum === 1 ? this.p1Buffer : this.p2Buffer;
      const BUFFER_WINDOW = 6; // 6 frames buffer

      if (b.light.includes(code) || b.light.includes(key)) targetBuffer.light = BUFFER_WINDOW;
      if (b.heavy.includes(code) || b.heavy.includes(key)) targetBuffer.heavy = BUFFER_WINDOW;
      if (b.special.includes(code) || b.special.includes(key)) targetBuffer.special = BUFFER_WINDOW;
      if (b.super.includes(code) || b.super.includes(key)) targetBuffer.super = BUFFER_WINDOW;
    }

    isPressed(keys) {
      return keys.some(k => !!this.keysDown[k]);
    }

    update() {
      // Tick buffer countdowns
      ['light', 'heavy', 'special', 'super'].forEach(action => {
        if (this.p1Buffer[action] > 0) this.p1Buffer[action]--;
        if (this.p2Buffer[action] > 0) this.p2Buffer[action]--;
      });

      this.aiTimer++;
      this.syncTouchVisibility();
    }

    getP1Input() {
      const b = this.bindings.p1;
      const lightBuffered = this.p1Buffer.light > 0;
      const heavyBuffered = this.p1Buffer.heavy > 0;
      const specialBuffered = this.p1Buffer.special > 0;
      const superBuffered = this.p1Buffer.super > 0 || (this.isPressed(b.light) && this.isPressed(b.heavy));

      // Clear buffer on consumption
      if (lightBuffered) this.p1Buffer.light = 0;
      if (heavyBuffered) this.p1Buffer.heavy = 0;
      if (specialBuffered) this.p1Buffer.special = 0;
      if (superBuffered) this.p1Buffer.super = 0;

      return {
        left: this.touchState.left || this.isPressed(b.left),
        right: this.touchState.right || this.isPressed(b.right),
        up: this.touchState.up || this.isPressed(b.up),
        down: this.touchState.down || this.isPressed(b.down),
        light: this.touchState.light || lightBuffered || this.isPressed(b.light),
        heavy: this.touchState.heavy || heavyBuffered || this.isPressed(b.heavy),
        special: this.touchState.special || specialBuffered || this.isPressed(b.special),
        super: this.touchState.super || superBuffered || this.isPressed(b.super),
        block: this.touchState.block || this.isPressed(b.block),
        run: this.isPressed(['ShiftLeft', 'ShiftRight', 'KeyZ', 'z', 'Z'])
      };
    }

    getP2Input(fighter2, fighter1) {
      if (this.aiMode === 'MANUAL') {
        const b = this.bindings.p2;
        const lightBuffered = this.p2Buffer.light > 0;
        const heavyBuffered = this.p2Buffer.heavy > 0;
        const specialBuffered = this.p2Buffer.special > 0;
        const superBuffered = this.p2Buffer.super > 0 || (this.isPressed(b.light) && this.isPressed(b.heavy));

        if (lightBuffered) this.p2Buffer.light = 0;
        if (heavyBuffered) this.p2Buffer.heavy = 0;
        if (specialBuffered) this.p2Buffer.special = 0;
        if (superBuffered) this.p2Buffer.super = 0;

        return {
          left: this.isPressed(b.left),
          right: this.isPressed(b.right),
          up: this.isPressed(b.up),
          down: this.isPressed(b.down),
          light: lightBuffered || this.isPressed(b.light),
          heavy: heavyBuffered || this.isPressed(b.heavy),
          special: specialBuffered || this.isPressed(b.special),
          super: superBuffered || this.isPressed(b.super),
          block: this.isPressed(b.block),
          run: this.isPressed(['ShiftRight', 'Numpad0'])
        };
      }

      // AI Dummy Modes for Training & Single-Player Practice
      return this.generateDummyInput(fighter2, fighter1);
    }

    generateDummyInput(f2, f1) {
      const base = {
        left: false, right: false, up: false, down: false,
        light: false, heavy: false, special: false, super: false, block: false
      };

      if (this.aiMode === 'STAND') {
        return base;
      }
      if (this.aiMode === 'CROUCH') {
        base.down = true;
        return base;
      }
      if (this.aiMode === 'JUMP') {
        base.up = (this.aiTimer % 90 < 10);
        return base;
      }
      if (this.aiMode === 'GUARD') {
        base.block = true;
        return base;
      }

      // -----------------------------------------------------------------------
      // COMBAT ZONE BOUNDARY RETREAT: DASH TO MIDDLE IF NEAR THE END
      // -----------------------------------------------------------------------
      if (f2 && (this.aiMode === 'SPARRING' || this.aiMode === 'BOSS' || !['STAND', 'CROUCH', 'GUARD'].includes(this.aiMode))) {
        const stage = window.NeonRumble.StageManager ? window.NeonRumble.StageManager.currentStage : null;
        const stageBounds = (stage && stage.bounds) ? stage.bounds : { minX: 120, maxX: 1280 };
        const minX = stageBounds.minX !== undefined ? stageBounds.minX : 120;
        const maxX = stageBounds.maxX !== undefined ? stageBounds.maxX : 1280;
        const stageMidX = (minX + maxX) * 0.5;

        const END_THRESHOLD = 240;

        // Boundary retreat is only needed if the enemy is trapped against the extreme edge wall
        // and player is hemming them in against the wall (not during normal combat engagement)
        const distToPlayer = f1 ? Math.abs(f1.x - f2.x) : 999;
        const isCorneredLeft = (f2.x <= minX + 65) && (f1 && f1.x > f2.x);
        const isCorneredRight = (f2.x >= maxX - 65) && (f1 && f1.x < f2.x);
        const isNearEnd = (isCorneredLeft || isCorneredRight) && distToPlayer > 80;

        if (isNearEnd && !f2.dashToMiddle) {
          f2.dashToMiddle = true;
          const sfx = window.NeonRumble.SoundSynth;
          if (sfx) sfx.playDash();
          const particles = window.NeonRumble.ParticleSystem;
          if (particles) {
            particles.emitDust(f2.x, f2.y, 6);
            particles.emitAfterimage(f2);
          }
        }

        if (f2.dashToMiddle) {
          const distToMid = Math.abs(f2.x - stageMidX);
          if (distToMid > 65) {
            if (f2.x < stageMidX) {
              base.right = true;
              base.left = false;
            } else {
              base.left = true;
              base.right = false;
            }
            base.run = true;

            // If player is blocking the direct escape path, occasionally leap over
            if (f1 && Math.abs(f1.x - f2.x) < 85) {
              const f1IsBetween = (f2.x < stageMidX && f1.x > f2.x) || (f2.x > stageMidX && f1.x < f2.x);
              if (f1IsBetween && Math.random() < 0.28) {
                base.up = true;
              }
            }

            return base;
          } else {
            f2.dashToMiddle = false;
          }
        }
      }

      // -----------------------------------------------------------------------
      // REGULAR ARCADE FIGHTING AI (SPARRING & BOSS MODES)
      // Natural pacing, fair attack intervals, and decoupled movement
      // -----------------------------------------------------------------------
      if (f1 && f2 && (this.aiMode === 'SPARRING' || this.aiMode === 'BOSS')) {
        const dist = Math.abs(f1.x - f2.x);
        const toPlayerDir = f1.x > f2.x ? 1 : -1;
        const playerIsAttacking = (f1.state && f1.state.startsWith('ATTACK_'));
        const playerIsDown = (f1.state === 'KNOCKDOWN' || f1.state === 'GET_UP');
        const stageLvl = f2.stageNum || f2.aiStageLevel || 1;
        const isBoss = (this.aiMode === 'BOSS' || f2.isBoss || stageLvl >= 6);

        // Ensure timers on f2
        if (f2.aiAttackCooldown === undefined) f2.aiAttackCooldown = 0;
        if (f2.hitIntervalTimer === undefined) f2.hitIntervalTimer = 0;
        if (f2.aiDashBurstTimer === undefined) f2.aiDashBurstTimer = 0;

        if (f2.aiDashBurstTimer > 0) f2.aiDashBurstTimer--;

        // True if enemy is currently in an attack interval / recovery pause
        const inHitInterval = (f2.hitIntervalTimer > 0) || (f2.aiAttackCooldown > 0);

        // 1. Super Attack Trigger (Only when off cooldown & meter ready, works at close/medium distance)
        const superReady = (f2.superCooldownTimer <= 0) || (f2.superMeter >= 100);
        if (!inHitInterval && superReady && dist <= 220 && !playerIsDown) {
          const superChance = isBoss ? 0.25 : (0.14 + (stageLvl - 1) * 0.025);
          if (Math.random() < superChance) {
            base.super = true;
            f2.aiAttackCooldown = isBoss ? 45 : Math.max(45, 70 - (stageLvl - 1) * 4);
            if (toPlayerDir === 1) base.right = true; else base.left = true;
            return base;
          }
        }

        // 2. Defensive Guarding, Dodging & Counter-Play (Only when player is actively attacking!)
        if (playerIsAttacking && dist < 120) {
          // If enemy can dodge and rolls dodge chance, proactively dodge!
          if (f2.canDodge && f2.canDodge()) {
            const proactiveDodgeChance = (this.aiMode === 'BOSS' || isBoss) ? 0.26 : (0.16 + (stageLvl - 1) * 0.02);
            if (Math.random() < proactiveDodgeChance) {
              f2.triggerDodge(f1);
              base.left = false;
              base.right = false;
              base.run = false;
              return base;
            }
          }

          const blockChance = (this.aiMode === 'BOSS' || isBoss) ? 0.48 : (0.22 + Math.min(0.20, (stageLvl - 1) * 0.04));
          const counterChance = (!inHitInterval && isBoss) ? 0.22 : (0.09 + (stageLvl - 1) * 0.02);
          const roll = Math.random();

          if (roll < blockChance) {
            base.block = true;
            return base;
          } else if (!inHitInterval && roll < blockChance + counterChance) {
            // Timed counter-strike through the player's attack!
            if (toPlayerDir === 1) base.right = true; else base.left = true;
            if (isBoss) base.heavy = true;
            else base.light = true;
            f2.aiAttackCooldown = isBoss ? 35 : Math.max(35, 55 - (stageLvl - 1) * 3);
            return base;
          }
        }

        // If enemy is currently in DODGE evasion, preserve dodge slide
        if (f2.state === 'DODGE') {
          base.left = false;
          base.right = false;
          base.run = false;
          return base;
        }

        // If enemy is currently attacking, halt all movement inputs (only hero can move + attack)
        const enemyIsAttacking = (f2.state && f2.state.startsWith('ATTACK_'));
        if (enemyIsAttacking) {
          base.left = false;
          base.right = false;
          base.run = false;
          return base;
        }

        // 3. Distance Closing: Natural walk approach (NEVER runs along with the player!)
        // Standard fighting game pacing: walk steadily, no glued sprinting.
        if (dist > 52) {
          // Walk toward player
          if (toPlayerDir === 1) base.right = true;
          else base.left = true;

          // Rare short dash burst only from very far away (dist > 280), never matching player's run
          if (dist > 280 && f2.aiDashBurstTimer <= 0 && Math.random() < (isBoss ? 0.08 : 0.04)) {
            f2.aiDashBurstTimer = 24; // Brief approach burst
          }

          if (f2.aiDashBurstTimer > 0 && dist > 140) {
            base.run = true;
          } else {
            base.run = false; // Walking pace, no glued running alongside hero
          }

          // Rare gap-closing jump when far away
          if (dist > 180 && Math.random() < 0.03 && !inHitInterval) {
            base.up = true;
          } else if (!inHitInterval && dist <= 140 && dist > 60) {
            // Mid-range deliberate probe
            if (Math.random() < (isBoss ? 0.08 : 0.04)) {
              if (f2.superMeter >= 25 && Math.random() < 0.5) {
                base.special = true;
              } else {
                base.light = true;
              }
              base.left = false;
              base.right = false;
              base.run = false;
              f2.aiAttackCooldown = isBoss ? 35 : Math.max(35, 55 - (stageLvl - 1) * 3);
            }
          }
        }

        // 4. In Close-Quarters Melee Range (dist <= 65) with Fair Attack Intervals:
        if (dist <= 65) {
          // If in hit interval, attack cooldown, or player is down: DO NOT ATTACK!
          // Give breathing room, fair reaction time, and neutral spacing
          if (inHitInterval || playerIsDown) {
            base.light = false;
            base.heavy = false;
            base.special = false;
            base.super = false;

            // If crowded right up against the player (dist < 46), step back slightly to establish fighting distance
            if (dist < 46) {
              if (toPlayerDir === 1) base.left = true; // Step back
              else base.right = true;
            } else {
              // Hold ground in fighting stance
              base.left = false;
              base.right = false;
            }
            return base;
          }

          // Off cooldown: strike with regular fighting game arcade rhythm
          if (!f2.state.startsWith('ATTACK_')) {
            // Close-range super trigger: when player is close or point-blank, enemies can unleash their super power!
            if (superReady && Math.random() < (0.24 + (stageLvl - 1) * 0.03)) {
              base.super = true;
              base.left = false;
              base.right = false;
              base.run = false;
              f2.aiAttackCooldown = isBoss ? 40 : 60;
              return base;
            }

            const attackRoll = Math.random();
            if (f2.superMeter >= 25 && attackRoll < (isBoss ? 0.16 : 0.09)) {
              base.special = true;
            } else if (attackRoll < 0.42) {
              // Light jab / strike
              base.light = true;
            } else if (attackRoll < 0.70) {
              // Kick
              base.light = true;
            } else if (attackRoll < 0.88) {
              // Heavy blow
              base.heavy = true;
            } else {
              // Low sweep
              base.down = true;
              base.light = true;
            }

            // Enemies stand still and plant their feet to attack (no moving + attack for enemies)
            base.left = false;
            base.right = false;
            base.run = false;

            // Set generous interval before next attack decision (50-75 frames for regular, 35-50 for boss)
            const stageCdReduction = (stageLvl - 1) * 3;
            f2.aiAttackCooldown = isBoss ? (35 + Math.floor(Math.random() * 15)) : Math.max(35, (50 - stageCdReduction) + Math.floor(Math.random() * 25));
          }
        }

        return base;
      }

      return base;
    }
  }

  window.NeonRumble.InputManager = new InputManager();
})();
