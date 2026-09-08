/**
 * CyberJunk.js - Comic Stage: The Cyber Wasteland Junkyard
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class CyberJunk {
    constructor() {
      this.id = 'CyberJunk';
      this.name = 'CYBER JUNKYARD';
      this.subtitle = 'SECTOR 0 - SCRAP HEAP';
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
        skyGrad.addColorStop(0, '#360c54');
        skyGrad.addColorStop(0.55, '#5c1787');
        skyGrad.addColorStop(1, '#8124b8');
      } else if (round === 2) {
        skyGrad.addColorStop(0, '#1c0533');
        skyGrad.addColorStop(0.55, '#3b0b61');
        skyGrad.addColorStop(1, '#5e1791');
      } else {
        skyGrad.addColorStop(0, '#4a0832');
        skyGrad.addColorStop(0.55, '#781248');
        skyGrad.addColorStop(1, '#b01e5c');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // 2. Lightning Vortex Mandala
      ctx.save();
      const vx = 400, vy = 155, vr = 84;
      ctx.fillStyle = round === 3 ? 'rgba(255, 60, 100, 0.45)' : 'rgba(255, 230, 0, 0.4)';
      ctx.strokeStyle = round === 3 ? '#ff0055' : '#ffea00';
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI / 6) + (Math.sin(t * 0.03) * 0.06);
        const rOut = vr + 40 + (i % 2 === 0 ? 20 : 0);
        ctx.beginPath();
        ctx.moveTo(vx + Math.cos(ang - 0.15) * (vr + 6), vy + Math.sin(ang - 0.15) * (vr + 6));
        ctx.lineTo(vx + Math.cos(ang) * rOut, vy + Math.sin(ang) * rOut);
        ctx.lineTo(vx + Math.cos(ang + 0.15) * (vr + 6), vy + Math.sin(ang + 0.15) * (vr + 6));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.strokeStyle = '#ffea00';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(vx, vy, vr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Poles & Sag Wires
      ctx.save();
      ctx.fillStyle = '#261233';
      ctx.fillRect(90, 70, 16, this.groundY - 70);
      ctx.fillRect(60, 110, 75, 8);
      ctx.fillRect(1250, 65, 16, this.groundY - 65);
      ctx.fillRect(1220, 105, 75, 8);
      ctx.strokeStyle = '#180824';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(60, 110); ctx.bezierCurveTo(450, 220, 870, 225, 1220, 105);
      ctx.stroke();
      ctx.restore();

      // 4. Scrap Buildings
      ctx.save();
      const buildings = [
        { x: -30, w: 180, h: 310, lean: -0.04, color: '#301347' },
        { x: 190, w: 180, h: 280, lean: 0.03, color: '#3d1859' },
        { x: 400, w: 220, h: 340, lean: -0.02, color: '#2b1040' },
        { x: 880, w: 180, h: 300, lean: -0.05, color: '#3d1859' },
        { x: 1100, w: 200, h: 330, lean: 0.04, color: '#32144a' }
      ];
      buildings.forEach(b => {
        ctx.save();
        ctx.translate(b.x + b.w / 2, this.groundY);
        ctx.rotate(b.lean);
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.w / 2, -b.h, b.w, b.h);
        ctx.strokeStyle = '#140521';
        ctx.lineWidth = 3;
        ctx.strokeRect(-b.w / 2, -b.h, b.w, b.h);
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 3; col++) {
            ctx.fillStyle = (col + row) % 2 === 0 ? '#ffee44' : '#140722';
            ctx.fillRect(-b.w / 2 + 18 + col * 48, -b.h + 30 + row * 50, 20, 16);
          }
        }
        ctx.restore();
      });
      ctx.restore();

      // 5. Giant Robot Skull Landmark
      ctx.save();
      const rbx = 560, rby = this.groundY - 180;
      ctx.translate(rbx, rby);
      ctx.rotate(-0.06);
      ctx.fillStyle = '#523a63';
      ctx.beginPath();
      ctx.arc(80, 70, 75, Math.PI, 0);
      ctx.lineTo(155, 140); ctx.lineTo(5, 140);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1f1329';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Optic Eye
      ctx.fillStyle = Math.floor(t / 12) % 2 === 0 ? '#ff0077' : '#ffea00';
      ctx.beginPath();
      ctx.arc(45, 80, 20, 0, Math.PI * 2);
      ctx.fill();

      // TV Monitor
      ctx.fillStyle = '#111';
      ctx.fillRect(85, 62, 50, 40);
      ctx.fillStyle = Math.random() > 0.5 ? '#00f0ff' : '#ffffff';
      for (let sl = 64; sl < 100; sl += 4) {
        if (Math.random() > 0.3) ctx.fillRect(87, sl, 46, 2);
      }
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.strokeRect(85, 62, 50, 40);
      ctx.restore();

      // 6. Scrap Mechanic Spectator
      const mx = 810, my = this.groundY - 70;
      ctx.fillStyle = '#7a6344';
      ctx.fillRect(mx - 14, my + 15, 28, 55);
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(mx - 16, my - 15, 32, 30);
      ctx.fillStyle = '#e8cbb0';
      ctx.beginPath();
      ctx.arc(mx, my - 24, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(mx - 10, my - 28, 9, 6);
      ctx.fillRect(mx + 1, my - 28, 9, 6);

      // 7. Ground & Hazard Curb
      ctx.save();
      ctx.fillStyle = '#22112e';
      ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

      const curbY = this.groundY - 4, curbH = 7;
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(0, curbY, this.width, curbH);
      ctx.fillStyle = '#000000';
      for (let hx = 0; hx < this.width; hx += 24) {
        ctx.beginPath();
        ctx.moveTo(hx, curbY);
        ctx.lineTo(hx + 12, curbY);
        ctx.lineTo(hx + 6, curbY + curbH);
        ctx.lineTo(hx - 6, curbY + curbH);
        ctx.closePath();
        ctx.fill();
      }

      // Gear Manhole
      const gx = 1040, gy = this.groundY + 38;
      ctx.fillStyle = '#38204a';
      ctx.beginPath();
      ctx.ellipse(gx, gy, 44, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffea00';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }
  }

  window.NeonRumble.CyberJunk = CyberJunk;
})();
