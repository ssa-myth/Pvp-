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
          left: ['KeyA', 'a', 'A'],
          right: ['KeyD', 'd', 'D'],
          up: ['KeyW', 'w', 'W'],
          down: ['KeyS', 's', 'S'],
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
          const isHidden = touchContainer.classList.toggle('touch-hidden');
          toggleBtn.textContent = isHidden ? '📱 TOUCH: OFF' : '📱 TOUCH: ON';
        });
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
        block: this.touchState.block || this.isPressed(b.block)
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
          block: this.isPressed(b.block)
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
      if (this.aiMode === 'SPARRING' && f1 && f2) {
        // Smart arcade sparring AI
        const dist = Math.abs(f1.x - f2.x);

        if (dist > 160) {
          // Approach
          if (f1.x > f2.x) base.right = true;
          else base.left = true;
        } else if (dist < 70) {
          // Close combat
          if (f2.superMeter >= 100 && Math.random() < 0.1) {
            base.super = true;
          } else if (f2.superMeter >= 25 && Math.random() < 0.08) {
            base.special = true;
          } else if (Math.random() < 0.15) {
            base.heavy = true;
          } else if (Math.random() < 0.25) {
            base.light = true;
          } else if (Math.random() < 0.3) {
            base.block = true;
          }
        } else {
          // Mid-range
          if (Math.random() < 0.05) base.up = true;
          if (Math.random() < 0.08) base.special = true;
          if (Math.random() < 0.12) base.heavy = true;
        }
      }

      return base;
    }
  }

  window.NeonRumble.InputManager = new InputManager();
})();
