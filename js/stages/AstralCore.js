/**
 * AstralCore.js - Stage 4: The Astral Core / Cyber Void (Final Climax Arena)
 * Pulsing cosmic singularity, floating geometric monoliths, vortex energy particles.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class AstralCore {
    constructor() {
      this.id = 'AstralCore';
      this.name = 'ASTRAL CORE';
      this.subtitle = 'QUANTUM SINGULARITY - FINAL ARENA';
      this.width = 1400;
      this.height = 540;
      this.groundY = 460;
      this.bounds = { minX: 100, maxX: 1300 };

      // Vortex energy motes
      this.motes = [];
      for (let i = 0; i < 60; i++) {
        this.motes.push({
          angle: Math.random() * Math.PI * 2,
          distance: Math.random() * 320 + 40,
          speed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
          size: Math.random() * 3 + 2,
          color: Math.random() > 0.5 ? '#00f0ff' : '#ff0077'
        });
      }

      this.timer = 0;
    }

    update() {
      this.timer++;
      for (let i = 0; i < this.motes.length; i++) {
        const m = this.motes[i];
        m.angle += m.speed;
        m.distance -= 0.35;
        if (m.distance < 30) {
          m.distance = 340;
        }
      }
    }

    draw(ctx, camera) {
      this.update();
      ctx.save();

      // 1. Cosmic Void Background
      const bgGrad = ctx.createRadialGradient(
        this.width / 2, 200, 40,
        this.width / 2, 200, 600
      );
      bgGrad.addColorStop(0, '#2d083b');
      bgGrad.addColorStop(0.4, '#120722');
      bgGrad.addColorStop(1, '#05030a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // 2. Pulsing Quantum Singularity / Black Hole Core
      const coreX = this.width / 2;
      const coreY = 190;
      const pulse = Math.sin(this.timer * 0.06) * 12;

      // Outer accretion disc
      const discGrad = ctx.createRadialGradient(coreX, coreY, 60, coreX, coreY, 220 + pulse);
      discGrad.addColorStop(0, 'rgba(255, 0, 119, 0.6)');
      discGrad.addColorStop(0.4, 'rgba(0, 240, 255, 0.35)');
      discGrad.addColorStop(0.8, 'rgba(168, 32, 255, 0.15)');
      discGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = discGrad;
      ctx.beginPath();
      ctx.ellipse(coreX, coreY, 260 + pulse, 90 + pulse * 0.35, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Black Hole Event Horizon
      ctx.fillStyle = '#030206';
      ctx.beginPath();
      ctx.arc(coreX, coreY, 52, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(coreX, coreY, 53, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Swirling Vortex Energy Motes
      for (let i = 0; i < this.motes.length; i++) {
        const m = this.motes[i];
        const mx = coreX + Math.cos(m.angle) * m.distance;
        const my = coreY + Math.sin(m.angle) * (m.distance * 0.45);
        ctx.fillStyle = m.color;
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(mx - m.size / 2, my - m.size / 2, m.size, m.size);
      }
      ctx.shadowBlur = 0;

      // 4. Floating Geometric Monoliths (Background Pillars)
      const monoliths = [
        { x: 140, y: 150, w: 50, h: 220, rot: 0.08, col: '#a820ff' },
        { x: 320, y: 110, w: 40, h: 260, rot: -0.05, col: '#00f0ff' },
        { x: 1040, y: 120, w: 45, h: 250, rot: 0.06, col: '#ff0077' },
        { x: 1220, y: 160, w: 55, h: 200, rot: -0.09, col: '#a820ff' }
      ];

      monoliths.forEach((mono, idx) => {
        const floatY = Math.sin(this.timer * 0.04 + idx) * 8;
        ctx.save();
        ctx.translate(mono.x, mono.y + floatY);
        ctx.rotate(mono.rot);
        ctx.fillStyle = '#0e0a18';
        ctx.fillRect(-mono.w / 2, 0, mono.w, mono.h);

        ctx.strokeStyle = mono.col;
        ctx.lineWidth = 2;
        ctx.strokeRect(-mono.w / 2, 0, mono.w, mono.h);

        // Core line
        ctx.fillStyle = mono.col;
        ctx.fillRect(-2, 15, 4, mono.h - 30);
        ctx.restore();
      });

      // 5. Crystalline Energy Platform (Arena Floor)
      ctx.fillStyle = '#090812';
      ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

      // Glowing hex grid floor
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.5;
      for (let x = -100; x < this.width + 200; x += 70) {
        ctx.beginPath();
        ctx.moveTo(x, this.groundY);
        ctx.lineTo(x + (x - this.width / 2) * 0.9, this.height);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255, 0, 119, 0.45)';
      for (let y = this.groundY; y < this.height; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }

      // Glowing platform edge
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, this.groundY);
      ctx.lineTo(this.width, this.groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();
    }
  }

  window.NeonRumble.AstralCore = AstralCore;
})();
