/**
 * NeonDocks.js - Comic Stage: Toxic Waterfront & Cargo Docks
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class NeonDocks {
    constructor() {
      this.id = 'NeonDocks';
      this.name = 'NEON DOCKS';
      this.subtitle = 'SECTOR 7 - TOXIC HARBOR';
      this.width = 1400;
      this.height = 540;
      this.groundY = 445;
      this.bounds = { minX: 120, maxX: 1280 };
      this.timer = 0;
    }

    update() {
      this.timer++;
    }

    draw(ctx, camera, round = 1) {
      this.update();
      ctx.save();
      const t = this.timer;

      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
      if (round === 1) {
        skyGrad.addColorStop(0, '#0a3832');
        skyGrad.addColorStop(0.55, '#12544a');
        skyGrad.addColorStop(1, '#0e7058');
      } else if (round === 2) {
        skyGrad.addColorStop(0, '#041d24');
        skyGrad.addColorStop(0.55, '#0b3d42');
        skyGrad.addColorStop(1, '#065c56');
      } else {
        skyGrad.addColorStop(0, '#1c3618');
        skyGrad.addColorStop(0.55, '#306322');
        skyGrad.addColorStop(1, '#4c8a2b');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // 2. Spiral Moon Mandala
      ctx.save();
      const moonX = 380, moonY = 150, moonR = 80;
      ctx.fillStyle = round === 3 ? 'rgba(80, 255, 100, 0.4)' : 'rgba(0, 240, 180, 0.35)';
      ctx.strokeStyle = round === 3 ? '#2edb48' : '#00bfa5';
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI / 6) + (Math.sin(t * 0.02) * 0.04);
        const rOut = moonR + 38 + (i % 2 === 0 ? 16 : 0);
        ctx.beginPath();
        ctx.moveTo(moonX + Math.cos(ang - 0.14) * (moonR + 6), moonY + Math.sin(ang - 0.14) * (moonR + 6));
        ctx.lineTo(moonX + Math.cos(ang) * rOut, moonY + Math.sin(ang) * rOut);
        ctx.lineTo(moonX + Math.cos(ang + 0.14) * (moonR + 6), moonY + Math.sin(ang + 0.14) * (moonR + 6));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.strokeStyle = '#00f0b5';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Poles & Wires
      ctx.save();
      ctx.fillStyle = '#102224';
      ctx.fillRect(80, 60, 16, this.groundY - 60);
      ctx.fillRect(50, 95, 75, 9);
      ctx.fillRect(1260, 50, 16, this.groundY - 50);
      ctx.fillRect(1230, 90, 75, 9);
      ctx.strokeStyle = '#0b1d1f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(50, 95); ctx.bezierCurveTo(460, 200, 880, 205, 1230, 90);
      ctx.stroke();
      ctx.restore();

      // 4. Buildings
      ctx.save();
      const buildings = [
        { x: -30, w: 190, h: 300, lean: -0.03, color: '#16383b' },
        { x: 200, w: 180, h: 280, lean: 0.04, color: '#1c494c' },
        { x: 420, w: 220, h: 330, lean: -0.02, color: '#143135' },
        { x: 880, w: 190, h: 300, lean: -0.04, color: '#1b4549' },
        { x: 1100, w: 200, h: 320, lean: 0.03, color: '#183c40' }
      ];
      buildings.forEach(b => {
        ctx.save();
        ctx.translate(b.x + b.w / 2, this.groundY);
        ctx.rotate(b.lean);
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.w / 2, -b.h, b.w, b.h);
        ctx.strokeStyle = '#0a1a1c';
        ctx.lineWidth = 3;
        ctx.strokeRect(-b.w / 2, -b.h, b.w, b.h);
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 3; col++) {
            ctx.fillStyle = (col + row) % 2 === 0 ? '#40ffd8' : '#081618';
            ctx.fillRect(-b.w / 2 + 18 + col * 48, -b.h + 25 + row * 44, 22, 18);
          }
        }
        ctx.restore();
      });
      ctx.restore();

      // 5. Containers
      ctx.save();
      const c1x = 520, c1y = this.groundY - 140, c1w = 230, c1h = 135;
      ctx.fillStyle = '#0f6e63';
      ctx.fillRect(c1x, c1y, c1w, c1h);
      ctx.strokeStyle = '#052b27';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(c1x, c1y, c1w, c1h);
      ctx.font = '900 24px Impact, sans-serif';
      ctx.fillStyle = '#00ffcc';
      ctx.fillText('NEON TOXIC', c1x + 24, c1y + 75);

      // 6. Dock Cat Spectator
      const catX = 810, catY = this.groundY - 60;
      ctx.fillStyle = '#4a2f18';
      ctx.fillRect(catX - 25, catY, 50, 60);
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(catX, catY - 14, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(catX - 10, catY - 24, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(catX - 15, catY - 25, 4, 3);
      ctx.fillRect(catX - 7, catY - 25, 4, 3);
      ctx.restore();

      // 7. Ground & Curb
      ctx.save();
      ctx.fillStyle = '#173033';
      ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
      const curbColor = round === 3 ? '#aaff00' : '#00ff88';
      ctx.fillStyle = curbColor;
      ctx.shadowColor = curbColor;
      ctx.shadowBlur = 14;
      ctx.fillRect(0, this.groundY - 3, this.width, 6);
      ctx.shadowBlur = 0;

      // Manhole
      const mhX = 1040, mhY = this.groundY + 38;
      ctx.fillStyle = '#1f423d';
      ctx.beginPath();
      ctx.ellipse(mhX, mhY, 44, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#09ffb0';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }
  }

  window.NeonRumble.NeonDocks = NeonDocks;
})();
