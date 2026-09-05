/**
 * Projectile.js - Ranged Combat & Area Energy Hazard Logic
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Box = window.NeonRumble.Box;

  class Projectile {
    constructor(config) {
      this.owner = config.owner; // 1 or 2
      this.type = config.type; // 'REX_WAVE', 'VOLT_ORB', 'LIGHTNING_COLUMN', 'ASTRAL_WAVE', 'EARTH_SPIKE'
      this.x = config.x;
      this.y = config.y;
      this.vx = config.vx || 0;
      this.vy = config.vy || 0;
      this.facing = config.facing || 1;
      this.damage = config.damage || 15;
      this.chipDamage = config.chipDamage || 3;
      this.knockback = config.knockback || { x: 5, y: -2 };
      this.hitstun = config.hitstun || 24;
      this.blockstun = config.blockstun || 12;
      this.life = config.life || 60;
      this.active = true;
      this.hasHit = false;
      this.piercing = config.piercing || false;
      this.width = config.width || 36;
      this.height = config.height || 36;
      this.color = config.color || '#00f0ff';
      this.secondaryColor = config.secondaryColor || '#ffffff';
      this.animTimer = 0;
    }

    getHitbox() {
      return {
        left: this.x - this.width / 2,
        right: this.x + this.width / 2,
        top: this.y - this.height,
        bottom: this.y,
        width: this.width,
        height: this.height
      };
    }

    update(stageBounds) {
      if (!this.active) return;
      this.animTimer++;
      this.life--;

      if (this.life <= 0) {
        this.active = false;
        return;
      }

      this.x += this.vx * this.facing;
      this.y += this.vy;

      // Stage bounds check
      if (stageBounds) {
        if (this.x < stageBounds.minX - 50 || this.x > stageBounds.maxX + 50) {
          this.active = false;
        }
      }

      // Spawn trail particles
      const particles = window.NeonRumble.ParticleSystem;
      if (particles && Math.random() > 0.4) {
        particles.emitHitSparks(this.x, this.y - this.height / 2, 2, this.color, 2);
      }
    }

    draw(ctx) {
      if (!this.active) return;
      ctx.save();

      const pulse = Math.sin(this.animTimer * 0.3) * 3;

      if (this.type === 'VOLT_ORB') {
        // Electric energy orb with crackling tendrils
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;

        // Core
        ctx.fillStyle = this.secondaryColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.height / 2, 12 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.height / 2, 18 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Arcs
        for (let i = 0; i < 4; i++) {
          const angle = (this.animTimer * 0.2) + (i * Math.PI / 2);
          const r = 24;
          const ax = this.x + Math.cos(angle) * r;
          const ay = (this.y - this.height / 2) + Math.sin(angle) * r;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y - this.height / 2);
          ctx.lineTo(ax, ay);
          ctx.stroke();
        }
      } else if (this.type === 'REX_WAVE') {
        // Rolling ground shockwave
        ctx.shadowColor = '#ff5500';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff3300';
        
        ctx.beginPath();
        ctx.moveTo(this.x - 15 * this.facing, this.y);
        ctx.lineTo(this.x + 25 * this.facing, this.y);
        ctx.lineTo(this.x + 10 * this.facing, this.y - this.height - pulse);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(this.x - 5 * this.facing, this.y);
        ctx.lineTo(this.x + 15 * this.facing, this.y);
        ctx.lineTo(this.x + 5 * this.facing, this.y - this.height * 0.6);
        ctx.closePath();
        ctx.fill();
      } else if (this.type === 'LIGHTNING_COLUMN') {
        // Giant vertical lightning column
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 25;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height, this.width, this.height);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 6;
        ctx.strokeRect(this.x - this.width / 2, this.y - this.height, this.width, this.height);
      } else {
        // Generic energy projectile
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height, this.width, this.height);
      }

      ctx.restore();
    }
  }

  class ProjectileManager {
    constructor() {
      this.projectiles = [];
    }

    spawn(config) {
      const p = new Projectile(config);
      this.projectiles.push(p);
      return p;
    }

    update(stageBounds) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.update(stageBounds);
        if (!p.active) {
          this.projectiles.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      for (let i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i].draw(ctx);
      }
    }

    clear() {
      this.projectiles = [];
    }
  }

  window.NeonRumble.ProjectileManager = new ProjectileManager();
})();
