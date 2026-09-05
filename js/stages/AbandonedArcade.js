/**
 * AbandonedArcade.js - Stage 2: Abandoned Retro Arcade
 * CRT arcade cabinets, neon carpets, flickering fluorescent tubes, dust particles.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class AbandonedArcade {
    constructor() {
      this.id = 'AbandonedArcade';
      this.name = 'ABANDONED ARCADE';
      this.subtitle = 'SECTOR 7 GAMING PALACE - 1994';
      this.width = 1400;
      this.height = 540;
      this.groundY = 460;
      this.bounds = { minX: 100, maxX: 1300 };

      // Dust motes floating in air
      this.dust = [];
      for (let i = 0; i < 40; i++) {
        this.dust.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.3 - 0.1,
          alpha: Math.random() * 0.6 + 0.2
        });
      }

      this.timer = 0;
    }

    update() {
      this.timer++;

      // Update dust particles
      for (let i = 0; i < this.dust.length; i++) {
        const d = this.dust[i];
        d.x += d.vx;
        d.y += d.vy;
        if (d.y < 50) {
          d.y = this.groundY;
          d.x = Math.random() * this.width;
        }
      }
    }

    draw(ctx, camera) {
      this.update();
      ctx.save();

      // 1. Back Wall & Dim Ambient Atmosphere
      const wallGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
      wallGrad.addColorStop(0, '#100c14');
      wallGrad.addColorStop(0.6, '#181220');
      wallGrad.addColorStop(1, '#251a33');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // 2. Flickering Overhead Fluorescent Tubes
      const tubeFlicker1 = Math.sin(this.timer * 0.4) > -0.6;
      const tubeFlicker2 = Math.cos(this.timer * 0.35) > -0.7;

      ctx.fillStyle = '#222';
      ctx.fillRect(200, 30, 220, 10);
      ctx.fillRect(600, 30, 220, 10);
      ctx.fillRect(1000, 30, 220, 10);

      // Light glow cones
      if (tubeFlicker1) {
        ctx.fillStyle = 'rgba(200, 240, 255, 0.06)';
        ctx.beginPath();
        ctx.moveTo(220, 40);
        ctx.lineTo(400, 40);
        ctx.lineTo(520, this.groundY);
        ctx.lineTo(100, this.groundY);
        ctx.closePath();
        ctx.fill();
      }

      if (tubeFlicker2) {
        ctx.fillStyle = 'rgba(255, 180, 240, 0.06)';
        ctx.beginPath();
        ctx.moveTo(620, 40);
        ctx.lineTo(800, 40);
        ctx.lineTo(920, this.groundY);
        ctx.lineTo(500, this.groundY);
        ctx.closePath();
        ctx.fill();
      }

      // 3. Retro Wall Posters & Banners
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(380, 120, 90, 120);
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText('TOURNAMENT', 385, 140);
      ctx.fillText('1994', 405, 160);

      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(840, 110, 110, 130);
      ctx.fillStyle = '#000';
      ctx.fillText('INSERT COIN', 845, 135);
      ctx.fillText('HIGH SCORE', 845, 155);

      // 4. Arcade Cabinets Row (Background)
      const cabinetX = [120, 230, 520, 630, 740, 1020, 1130, 1240];
      const cabinetColors = ['#ff0055', '#00f0ff', '#ffcc00', '#00ff66', '#a820ff', '#ff5500', '#0099ff', '#ff0077'];

      cabinetX.forEach((cx, idx) => {
        const col = cabinetColors[idx % cabinetColors.length];

        // Cabinet Body
        ctx.fillStyle = '#1c1b26';
        ctx.fillRect(cx, this.groundY - 210, 85, 210);

        // Marquee
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 8;
        ctx.fillRect(cx + 6, this.groundY - 200, 73, 24);
        ctx.shadowBlur = 0;

        // Bezel & CRT Screen
        ctx.fillStyle = '#0a0a10';
        ctx.fillRect(cx + 10, this.groundY - 170, 65, 60);

        // Animated Mini Screen Content
        const screenPulse = (this.timer + idx * 10) % 60;
        ctx.fillStyle = screenPulse < 30 ? col : '#ffffff';
        ctx.fillRect(cx + 18, this.groundY - 155, 49, 32);

        // Coin Door & Joystick area
        ctx.fillStyle = '#2c2b3a';
        ctx.fillRect(cx + 10, this.groundY - 105, 65, 45);
        ctx.fillStyle = '#ff0000'; // Joystick ball
        ctx.beginPath();
        ctx.arc(cx + 30, this.groundY - 95, 5, 0, Math.PI * 2);
        ctx.fill();
        // Coin slots
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(cx + 25, this.groundY - 45, 10, 16);
        ctx.fillRect(cx + 45, this.groundY - 45, 10, 16);
      });

      // 5. Retro 90s Neon Grid Carpet Floor
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

      // Perspective Grid Lines
      ctx.strokeStyle = '#a820ff';
      ctx.lineWidth = 1.5;
      for (let x = -200; x < this.width + 400; x += 90) {
        ctx.beginPath();
        ctx.moveTo(x, this.groundY);
        ctx.lineTo(x + (x - this.width / 2) * 0.8, this.height);
        ctx.stroke();
      }

      ctx.strokeStyle = '#ff0077';
      for (let y = this.groundY; y < this.height; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }

      // 6. Atmospheric Dust Particles
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < this.dust.length; i++) {
        const d = this.dust[i];
        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      ctx.restore();
    }
  }

  window.NeonRumble.AbandonedArcade = AbandonedArcade;
})();
