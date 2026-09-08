/**
 * DemonShrine.js - Comic Stage: Blood Pagoda / Demon Shrine
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class DemonShrine {
    constructor() {
      this.id = 'DemonShrine';
      this.name = 'DEMON SHRINE';
      this.subtitle = 'SECTOR 66 - CRIMSON SANCTUARY';
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
        skyGrad.addColorStop(0, '#590a1c');
        skyGrad.addColorStop(0.55, '#87122a');
        skyGrad.addColorStop(1, '#ba1c38');
      } else if (round === 2) {
        skyGrad.addColorStop(0, '#360514');
        skyGrad.addColorStop(0.55, '#5c0b20');
        skyGrad.addColorStop(1, '#8c1432');
      } else {
        skyGrad.addColorStop(0, '#21000b');
        skyGrad.addColorStop(0.55, '#470216');
        skyGrad.addColorStop(1, '#850024');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // 2. Demon Eye Mandala
      ctx.save();
      const mx = 390, my = 155, mr = 82;
      ctx.fillStyle = round === 3 ? 'rgba(255, 0, 80, 0.45)' : 'rgba(255, 60, 40, 0.4)';
      ctx.strokeStyle = '#ff1133';
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI / 6) + (Math.sin(t * 0.02) * 0.05);
        const rOut = mr + 42 + (i % 2 === 0 ? 18 : 0);
        ctx.beginPath();
        ctx.moveTo(mx + Math.cos(ang - 0.14) * (mr + 8), my + Math.sin(ang - 0.14) * (mr + 8));
        ctx.lineTo(mx + Math.cos(ang) * rOut, my + Math.sin(ang) * rOut);
        ctx.lineTo(mx + Math.cos(ang + 0.14) * (mr + 8), my + Math.sin(ang + 0.14) * (mr + 8));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.strokeStyle = '#ff2244';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.stroke();

      // Slit Eye Pupil
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.ellipse(mx, my, 38, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(mx, my, 8, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Poles & Wires
      ctx.save();
      ctx.fillStyle = '#3d0a14';
      ctx.fillRect(80, 60, 16, this.groundY - 60);
      ctx.fillRect(50, 100, 75, 9);
      ctx.fillRect(1260, 50, 16, this.groundY - 50);
      ctx.fillRect(1230, 90, 75, 9);
      ctx.strokeStyle = '#26040b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(50, 100); ctx.bezierCurveTo(450, 210, 880, 215, 1230, 90);
      ctx.stroke();
      ctx.restore();

      // 4. Pagoda Buildings
      ctx.save();
      const buildings = [
        { x: -30, w: 190, h: 320, lean: -0.04, color: '#3b0d18' },
        { x: 190, w: 180, h: 290, lean: 0.03, color: '#4d1220' },
        { x: 410, w: 220, h: 340, lean: -0.02, color: '#330a14' },
        { x: 880, w: 190, h: 310, lean: -0.04, color: '#4a111f' },
        { x: 1100, w: 200, h: 330, lean: 0.03, color: '#3b0d18' }
      ];
      buildings.forEach(b => {
        ctx.save();
        ctx.translate(b.x + b.w / 2, this.groundY);
        ctx.rotate(b.lean);
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.w / 2, -b.h, b.w, b.h);
        ctx.strokeStyle = '#1a0309';
        ctx.lineWidth = 3;
        ctx.strokeRect(-b.w / 2, -b.h, b.w, b.h);
        ctx.fillStyle = '#ff1133';
        ctx.fillRect(-b.w / 2 - 12, -b.h, b.w + 24, 10);
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 3; col++) {
            ctx.fillStyle = (col + row) % 2 === 0 ? '#ffaa00' : '#140207';
            ctx.fillRect(-b.w / 2 + 18 + col * 48, -b.h + 28 + row * 48, 20, 16);
          }
        }
        ctx.restore();
      });
      ctx.restore();

      // 5. Red Torii Gate Landmark
      ctx.save();
      const tx = 540, ty = this.groundY - 185;
      ctx.translate(tx, ty);
      ctx.rotate(0.04);
      ctx.fillStyle = '#cc1835';
      ctx.fillRect(20, 20, 22, 165);
      ctx.fillRect(170, 20, 22, 165);
      ctx.beginPath();
      ctx.moveTo(-15, 20); ctx.quadraticCurveTo(105, 5, 225, 20);
      ctx.lineTo(225, 34); ctx.quadraticCurveTo(105, 20, -15, 34);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#47040f';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Demon Lantern in center
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.arc(106, 95, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cc1835';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // 6. Bat-Punk Spectator
      const bx = 810, by = this.groundY - 75;
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(bx, by, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff1133';
      ctx.fillRect(bx - 6, by - 12, 3, 3);
      ctx.fillRect(bx + 3, by - 12, 3, 3);
      const wingFlap = Math.sin(t * 0.15) * 8;
      ctx.fillStyle = '#22050e';
      ctx.beginPath();
      ctx.moveTo(bx - 12, by - 4); ctx.quadraticCurveTo(bx - 36 + wingFlap, by - 26, bx - 38, by + 12);
      ctx.lineTo(bx - 12, by + 8); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bx + 12, by - 4); ctx.quadraticCurveTo(bx + 36 - wingFlap, by - 26, bx + 38, by + 12);
      ctx.lineTo(bx + 12, by + 8); ctx.closePath(); ctx.fill();

      // 7. Ground & Crimson Curb
      ctx.save();
      ctx.fillStyle = '#24060e';
      ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

      const curbColor = round === 3 ? '#ff0033' : '#e60026';
      ctx.fillStyle = curbColor;
      ctx.shadowColor = curbColor;
      ctx.shadowBlur = 16;
      ctx.fillRect(0, this.groundY - 3, this.width, 6);
      ctx.shadowBlur = 0;

      // Manhole
      const dx = 1040, dy = this.groundY + 38;
      ctx.fillStyle = '#3d0a17';
      ctx.beginPath();
      ctx.ellipse(dx, dy, 44, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff1133';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }
  }

  window.NeonRumble.DemonShrine = DemonShrine;
})();
