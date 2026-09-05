/**
 * SkylineRooftop.js - Stage 3: Skyline Rooftop Climax
 * Giant moon, drifting clouds, neon mega-city skyline, wind breeze.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class SkylineRooftop {
    constructor() {
      this.id = 'SkylineRooftop';
      this.name = 'SKYLINE ROOFTOP';
      this.subtitle = 'APEX TOWER - LEVEL 104';
      this.width = 1400;
      this.height = 540;
      this.groundY = 460;
      this.bounds = { minX: 100, maxX: 1300 };

      // Wind petals / embers
      this.petals = [];
      for (let i = 0; i < 45; i++) {
        this.petals.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: Math.random() * 3.5 + 2.5,
          vy: Math.random() * 1.5 + 0.5,
          size: Math.random() * 3.5 + 2.5,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1
        });
      }

      this.timer = 0;
    }

    update() {
      this.timer++;

      // Update wind petals
      for (let i = 0; i < this.petals.length; i++) {
        const p = this.petals[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        if (p.x > this.width + 20) {
          p.x = -20;
          p.y = Math.random() * (this.groundY - 100);
        }
        if (p.y > this.groundY) {
          p.y = -20;
        }
      }
    }

    draw(ctx, camera) {
      this.update();
      ctx.save();

      // 1. Midnight Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
      skyGrad.addColorStop(0, '#060614');
      skyGrad.addColorStop(0.5, '#121232');
      skyGrad.addColorStop(1, '#241b45');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // 2. Colossal Moon
      const moonX = 1050;
      const moonY = 160;
      const moonR = 100;

      // Moon glow
      const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.6, moonX, moonY, moonR * 2.2);
      moonGlow.addColorStop(0, 'rgba(255, 240, 210, 0.4)');
      moonGlow.addColorStop(0.5, 'rgba(180, 200, 255, 0.15)');
      moonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Moon body
      ctx.fillStyle = '#fff4df';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      // Moon craters
      ctx.fillStyle = 'rgba(215, 200, 180, 0.35)';
      ctx.beginPath();
      ctx.arc(moonX - 25, moonY - 20, 24, 0, Math.PI * 2);
      ctx.arc(moonX + 35, moonY + 25, 32, 0, Math.PI * 2);
      ctx.arc(moonX - 10, moonY + 45, 18, 0, Math.PI * 2);
      ctx.fill();

      // 3. Drifting Translucent Clouds
      const cloudOffset = (this.timer * 0.3) % this.width;
      ctx.fillStyle = 'rgba(14, 16, 42, 0.55)';
      for (let c = -200; c < this.width + 400; c += 380) {
        const cx = c + cloudOffset;
        ctx.beginPath();
        ctx.ellipse(cx, 180, 140, 35, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 80, 165, 120, 45, 0, 0, Math.PI * 2);
        ctx.ellipse(cx - 70, 190, 100, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Distant Cyber Skyline Towers (Parallax)
      const towers = [
        { x: 30, w: 110, h: 360, spire: true },
        { x: 160, w: 140, h: 290, spire: false },
        { x: 320, w: 100, h: 410, spire: true },
        { x: 440, w: 160, h: 310, spire: false },
        { x: 620, w: 130, h: 430, spire: true },
        { x: 770, w: 150, h: 340, spire: false },
        { x: 940, w: 120, h: 390, spire: true },
        { x: 1080, w: 170, h: 330, spire: false },
        { x: 1270, w: 120, h: 380, spire: true }
      ];

      const beaconBlink = Math.sin(this.timer * 0.1) > 0;

      towers.forEach(t => {
        // Tower silhouette
        ctx.fillStyle = '#141225';
        ctx.fillRect(t.x, this.groundY - t.h, t.w, t.h);

        // Windows
        ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
        for (let r = 20; r < t.h - 40; r += 26) {
          for (let c = 15; c < t.w - 15; c += 22) {
            ctx.fillRect(t.x + c, (this.groundY - t.h) + r, 8, 12);
          }
        }

        // Antenna Spire with blinking red warning beacon
        if (t.spire) {
          ctx.strokeStyle = '#222';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(t.x + t.w / 2, this.groundY - t.h);
          ctx.lineTo(t.x + t.w / 2, this.groundY - t.h - 45);
          ctx.stroke();

          if (beaconBlink) {
            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(t.x + t.w / 2, this.groundY - t.h - 45, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // 5. Rooftop Platform & Helipad
      ctx.fillStyle = '#1e2230';
      ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

      // Helipad Circle & "H" Marking
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(this.width / 2, this.groundY + 36, 160, 32, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 36px "Rajdhani", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('H', this.width / 2, this.groundY + 45);

      // Rooftop Perimeter Railing
      ctx.strokeStyle = '#414860';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, this.groundY - 24);
      ctx.lineTo(this.width, this.groundY - 24);
      ctx.moveTo(0, this.groundY - 12);
      ctx.lineTo(this.width, this.groundY - 12);
      // Railing posts
      for (let x = 0; x < this.width; x += 45) {
        ctx.moveTo(x, this.groundY);
        ctx.lineTo(x, this.groundY - 24);
      }
      ctx.stroke();

      // 6. Wind Petals / Glowing Embers
      ctx.fillStyle = '#ff88aa';
      for (let i = 0; i < this.petals.length; i++) {
        const p = this.petals[i];
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  window.NeonRumble.SkylineRooftop = SkylineRooftop;
})();
