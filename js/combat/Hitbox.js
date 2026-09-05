/**
 * Hitbox.js - Discrete Hitbox, Hurtbox, and Pushbox collision logic
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class Box {
    constructor(offsetX, offsetY, width, height, type = 'hurt') {
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      this.width = width;
      this.height = height;
      this.type = type; // 'hurt', 'hit', 'block', 'push'
    }

    /**
     * Get absolute world coordinates considering fighter position and facing direction.
     * When facing right (1): box extends from (x + offsetX) to (x + offsetX + width).
     * When facing left (-1): box extends from (x - offsetX - width) to (x - offsetX).
     */
    getWorldBounds(fighterX, fighterY, facing = 1) {
      const left = facing === 1 
        ? fighterX + this.offsetX 
        : fighterX - this.offsetX - this.width;
      const top = fighterY + this.offsetY;
      return {
        left: left,
        right: left + this.width,
        top: top,
        bottom: top + this.height,
        width: this.width,
        height: this.height
      };
    }

    static checkOverlap(b1, b2) {
      return (
        b1.left < b2.right &&
        b1.right > b2.left &&
        b1.top < b2.bottom &&
        b1.bottom > b2.top
      );
    }
  }

  window.NeonRumble.Box = Box;
})();
