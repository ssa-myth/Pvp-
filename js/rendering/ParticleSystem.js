/**
 * ParticleSystem.js - High-Performance Arcade Visual FX Engine
 * Spawns and animates hit sparks, dust, shockwaves, afterimages, and floating text.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class Particle {
    constructor() {
      this.active = false;
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.gravity = 0;
      this.size = 2;
      this.color = '#fff';
      this.life = 0;
      this.maxLife = 20;
      this.type = 'spark'; // 'spark', 'dust', 'shockwave', 'slash', 'text', 'line'
      this.text = '';
      this.radius = 0;
      this.alpha = 1.0;
    }

    reset() {
      this.active = false;
    }
  }

  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.maxParticles = 300;
      for (let i = 0; i < this.maxParticles; i++) {
        this.particles.push(new Particle());
      }
      this.afterimages = [];
      this.maxAfterimages = 20;
    }

    getParticle() {
      for (let i = 0; i < this.maxParticles; i++) {
        if (!this.particles[i].active) return this.particles[i];
      }
      return this.particles[0]; // Recycle oldest if full
    }

    emitHitSparks(x, y, count = 12, color = '#ffdd44', spread = 5) {
      for (let i = 0; i < count; i++) {
        const p = this.getParticle();
        p.active = true;
        p.type = 'spark';
        p.x = x + (Math.random() - 0.5) * 10;
        p.y = y + (Math.random() - 0.5) * 10;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * spread + 2;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.gravity = 0.2;
        p.size = Math.random() * 3 + 2;
        p.color = color;
        p.maxLife = Math.floor(Math.random() * 12 + 10);
        p.life = p.maxLife;
      }
    }

    emitBlockSparks(x, y) {
      // Metallic blue & white sparks + shield ring
      for (let i = 0; i < 10; i++) {
        const p = this.getParticle();
        p.active = true;
        p.type = 'spark';
        p.x = x;
        p.y = y;
        const angle = (Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 0.8;
        const speed = Math.random() * 4 + 2;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.gravity = 0.15;
        p.size = Math.random() * 2.5 + 2;
        p.color = Math.random() > 0.5 ? '#00f0ff' : '#ffffff';
        p.maxLife = 14;
        p.life = p.maxLife;
      }

      // Shield ring
      const ring = this.getParticle();
      ring.active = true;
      ring.type = 'shockwave';
      ring.x = x;
      ring.y = y;
      ring.vx = 0;
      ring.vy = 0;
      ring.gravity = 0;
      ring.radius = 8;
      ring.color = '#00f0ff';
      ring.maxLife = 12;
      ring.life = ring.maxLife;
    }

    emitDust(x, y, count = 5, dir = 0) {
      for (let i = 0; i < count; i++) {
        const p = this.getParticle();
        p.active = true;
        p.type = 'dust';
        p.x = x + (Math.random() - 0.5) * 12;
        p.y = y - Math.random() * 4;
        p.vx = dir * (Math.random() * 1.5 + 0.5) + (Math.random() - 0.5);
        p.vy = -(Math.random() * 1.2 + 0.3);
        p.gravity = -0.02; // soft rise
        p.size = Math.random() * 4 + 3;
        p.color = '#cfc6be';
        p.maxLife = Math.floor(Math.random() * 12 + 10);
        p.life = p.maxLife;
      }
    }

    emitShockwave(x, y, maxRadius = 40, color = '#ff0077') {
      const p = this.getParticle();
      p.active = true;
      p.type = 'shockwave';
      p.x = x;
      p.y = y;
      p.vx = 0;
      p.vy = 0;
      p.gravity = 0;
      p.radius = 6;
      p.targetRadius = maxRadius;
      p.color = color;
      p.maxLife = 16;
      p.life = p.maxLife;
    }

    emitFloatingText(x, y, text, color = '#ffcc00') {
      const p = this.getParticle();
      p.active = true;
      p.type = 'text';
      p.x = x;
      p.y = y;
      p.vx = 0;
      p.vy = -1.2;
      p.gravity = 0.02;
      p.text = text;
      p.color = color;
      p.maxLife = 35;
      p.life = p.maxLife;
    }

    emitAfterimage(fighter) {
      this.afterimages.push({
        x: fighter.x,
        y: fighter.y,
        facing: fighter.facing,
        fighter: fighter,
        color: fighter.primaryColor || '#00f0ff',
        alpha: 0.6,
        life: 14,
        maxLife: 14
      });
      if (this.afterimages.length > this.maxAfterimages) {
        this.afterimages.shift();
      }
    }

    update() {
      // Update particles
      for (let i = 0; i < this.maxParticles; i++) {
        const p = this.particles[i];
        if (!p.active) continue;

        p.life--;
        if (p.life <= 0) {
          p.active = false;
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;

        if (p.type === 'shockwave') {
          p.radius += (p.targetRadius - p.radius) * 0.25;
        }
      }

      // Update afterimages
      for (let i = this.afterimages.length - 1; i >= 0; i--) {
        const a = this.afterimages[i];
        a.life--;
        a.alpha = (a.life / a.maxLife) * 0.5;
        if (a.life <= 0) {
          this.afterimages.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      ctx.save();

      // 1. Draw Afterimages
      for (let i = 0; i < this.afterimages.length; i++) {
        const a = this.afterimages[i];
        ctx.save();
        ctx.globalAlpha = a.alpha;
        ctx.fillStyle = a.color;
        // Simple silhouetted body block for afterimage
        const w = 40;
        const h = 75;
        const px = a.facing === 1 ? a.x - 20 : a.x - 20;
        ctx.fillRect(px, a.y - h, w, h);
        ctx.restore();
      }

      // 2. Draw Particles
      for (let i = 0; i < this.maxParticles; i++) {
        const p = this.particles[i];
        if (!p.active) continue;

        const progress = p.life / p.maxLife;
        ctx.globalAlpha = Math.max(0, Math.min(1, progress));

        if (p.type === 'spark') {
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        } else if (p.type === 'dust') {
          ctx.fillStyle = p.color;
          const currentSize = p.size * (1.5 - progress * 0.5);
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'shockwave') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, progress * 3.5);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === 'text') {
          ctx.font = 'bold 12px "Press Start 2P", sans-serif';
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#000';
          ctx.shadowBlur = 4;
          ctx.textAlign = 'center';
          ctx.fillText(p.text, Math.floor(p.x), Math.floor(p.y));
          ctx.shadowBlur = 0;
        }
      }

      ctx.restore();
    }

    clear() {
      for (let i = 0; i < this.maxParticles; i++) {
        this.particles[i].active = false;
      }
      this.afterimages = [];
    }
  }

  window.NeonRumble.ParticleSystem = new ParticleSystem();
})();
