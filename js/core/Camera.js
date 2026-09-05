/**
 * Camera.js - Dynamic 2D Fighting Game Camera
 * Smooth dual-player tracking, distance-based adaptive zooming, screen shake trauma,
 * and stage boundary clamping.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class Camera {
    constructor(viewportWidth = 960, viewportHeight = 540) {
      this.vw = viewportWidth;
      this.vh = viewportHeight;

      this.x = 480;
      this.y = 270;
      this.targetX = 480;
      this.targetY = 270;

      this.zoom = 1.0;
      this.targetZoom = 1.0;
      this.minZoom = 0.82;
      this.maxZoom = 1.15;

      // Screen Shake Trauma System
      this.trauma = 0; // 0 to 1
      this.maxShakeX = 18;
      this.maxShakeY = 14;
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;

      this.storage = window.NeonRumble.Storage;
    }

    addShake(intensity = 6) {
      const shakeEnabled = !this.storage || this.storage.settings.screenShake;
      if (!shakeEnabled) return;

      // Normalize trauma (0 to 1)
      this.trauma = Math.min(1.0, this.trauma + (intensity / 15));
    }

    update(p1, p2, stage) {
      if (!p1 || !p2 || !stage) return;

      // 1. Calculate midpoint between fighters
      const midX = (p1.x + p2.x) * 0.5;
      const midY = (p1.y + p2.y) * 0.5 - 50;

      // 2. Calculate distance between fighters to determine target zoom
      const distX = Math.abs(p1.x - p2.x);
      const distY = Math.abs(p1.y - p2.y);

      // Desired zoom scales down as players move apart
      const factorX = (this.vw * 0.65) / Math.max(300, distX);
      const factorY = (this.vh * 0.65) / Math.max(200, distY);
      const desiredZoom = Math.min(factorX, factorY);
      this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, desiredZoom));

      // Smooth zoom lerp
      this.zoom += (this.targetZoom - this.zoom) * 0.08;

      // Target position
      this.targetX = midX;
      this.targetY = midY;

      // Smooth position lerp
      this.x += (this.targetX - this.x) * 0.1;
      this.y += (this.targetY - this.y) * 0.1;

      // Stage boundary clamp (accounting for zoom)
      const halfVisibleW = (this.vw * 0.5) / this.zoom;
      const halfVisibleH = (this.vh * 0.5) / this.zoom;

      if (this.x - halfVisibleW < stage.bounds.minX) {
        this.x = stage.bounds.minX + halfVisibleW;
      }
      if (this.x + halfVisibleW > stage.bounds.maxX) {
        this.x = stage.bounds.maxX - halfVisibleW;
      }

      // Vertical clamp
      if (this.y + halfVisibleH > stage.groundY + 80) {
        this.y = (stage.groundY + 80) - halfVisibleH;
      }

      // 3. Shake Calculation (Non-linear trauma decay)
      if (this.trauma > 0) {
        const shakePower = this.trauma * this.trauma; // quadratic
        this.shakeOffsetX = (Math.random() * 2 - 1) * this.maxShakeX * shakePower;
        this.shakeOffsetY = (Math.random() * 2 - 1) * this.maxShakeY * shakePower;
        this.trauma = Math.max(0, this.trauma - 0.065);
      } else {
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
      }
    }

    applyTransform(ctx) {
      ctx.save();
      // Translate to screen center
      ctx.translate(this.vw * 0.5 + this.shakeOffsetX, this.vh * 0.5 + this.shakeOffsetY);
      ctx.scale(this.zoom, this.zoom);
      // Translate back by camera target
      ctx.translate(-this.x, -this.y);
    }

    restoreTransform(ctx) {
      ctx.restore();
    }
  }

  window.NeonRumble.Camera = new Camera();
})();
