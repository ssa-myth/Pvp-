/**
 * NeonAlley.js - Stage 1: Cyberpunk Midnight Alley
 * Rain, glowing neon signs, wet street reflections, cyber traffic.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class NeonAlley {
    constructor() {
      this.id = 'NeonAlley';
      this.name = 'NEON ALLEY';
      this.subtitle = 'DISTRICT 9 - 02:40 AM';
      this.width = 1400;
      this.height = 540;
      this.groundY = 460;
      this.bounds = { minX: 100, maxX: 1300 };

      // Rain particles
      this.rainDrops = [];
      for (let i = 0; i < 90; i++) {
        this.rainDrops.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          length: Math.random() * 14 + 10,
          speed: Math.random() * 8 + 14
        });
      }

      // Distant cyber vehicles
      this.vehicles = [
        { x: -100, y: 180, speed: 3.5, color: '#00f0ff' },
        { x: 800, y: 220, speed: -2.8, color: '#ff0055' }
      ];

      this.timer = 0;
    }

    update() {
      this.timer++;

      // Update rain
      for (let i = 0; i < this.rainDrops.length; i++) {
        const drop = this.rainDrops[i];
        drop.y += drop.speed;
        drop.x -= 2.0; // Angled wind
        if (drop.y > this.groundY) {
          drop.y = -10;
          drop.x = Math.random() * this.width;
        }
      }

      // Update flying cars
      for (let i = 0; i < this.vehicles.length; i++) {
        const v = this.vehicles[i];
        v.x += v.speed;
        if (v.speed > 0 && v.x > this.width + 100) v.x = -150;
        if (v.speed < 0 && v.x < -150) v.x = this.width + 100;
      }
    }

    draw(ctx, camera) {
      this.update();
      ctx.save();

      // 1. Far Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
      skyGrad.addColorStop(0, '#0a0818');
      skyGrad.addColorStop(0.7, '#1b0e2b');
      skyGrad.addColorStop(1, '#2c1236');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // 2. Far Skyline Silhouettes (Parallax 0.2x)
      ctx.fillStyle = '#100b1a';
      const bldgs = [
        { x: 40, w: 120, h: 280 },
        { x: 180, w: 90, h: 340 },
        { x: 300, w: 160, h: 240 },
        { x: 490, w: 110, h: 320 },
        { x: 630, w: 140, h: 290 },
        { x: 800, w: 100, h: 360 },
        { x: 930, w: 150, h: 270 },
        { x: 1110, w: 130, h: 330 },
        { x: 1260, w: 110, h: 260 }
      ];
      bldgs.forEach(b => {
        ctx.fillRect(b.x, this.groundY - b.h, b.w, b.h);
        // Distant window lights
        ctx.fillStyle = 'rgba(255, 230, 150, 0.25)';
        for (let r = 0; r < b.h - 40; r += 24) {
          for (let c = 12; c < b.w - 12; c += 18) {
            if ((r * 7 + c * 3) % 5 > 1) {
              ctx.fillRect(b.x + c, (this.groundY - b.h) + r + 20, 6, 10);
            }
          }
        }
        ctx.fillStyle = '#100b1a';
      });

      // Distant flying cyber vehicles
      this.vehicles.forEach(v => {
        ctx.fillStyle = v.color;
        ctx.shadowColor = v.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(v.x, v.y, 24, 6);
        ctx.shadowBlur = 0;
      });

      // 3. Midground Cyber Alley Buildings & Pipes (Parallax 0.5x)
      ctx.fillStyle = '#1c1628';
      ctx.fillRect(120, this.groundY - 260, 240, 260);
      ctx.fillRect(480, this.groundY - 290, 220, 290);
      ctx.fillRect(820, this.groundY - 270, 260, 270);
      ctx.fillRect(1160, this.groundY - 300, 200, 300);

      // 4. Animated Neon Signs
      const flicker1 = Math.sin(this.timer * 0.15) > -0.8;
      const flicker2 = Math.cos(this.timer * 0.2) > -0.7;

      // Neon Sign 1: RAMEN & NOODLES
      ctx.fillStyle = flicker1 ? '#ff0077' : '#550022';
      ctx.shadowColor = '#ff0077';
      ctx.shadowBlur = flicker1 ? 16 : 0;
      ctx.font = 'bold 20px "Press Start 2P", monospace';
      ctx.fillText('RAMEN ラーメン', 160, this.groundY - 210);

      // Neon Sign 2: NEO ARCADE
      ctx.fillStyle = flicker2 ? '#00f0ff' : '#004455';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = flicker2 ? 18 : 0;
      ctx.font = 'bold 22px "Press Start 2P", monospace';
      ctx.fillText('NEO ARCADE', 520, this.groundY - 230);

      // Neon Sign 3: BAR CYBER
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 12;
      ctx.font = 'bold 16px "Press Start 2P", monospace';
      ctx.fillText('BAR 2099', 880, this.groundY - 200);
      ctx.shadowBlur = 0;

      // 5. Wet Street Asphalt & Puddle Reflections
      ctx.fillStyle = '#12121c';
      ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

      // Neon Reflections in water puddles
      const puddleGrad = ctx.createLinearGradient(0, this.groundY, 0, this.height);
      puddleGrad.addColorStop(0, 'rgba(255, 0, 119, 0.25)');
      puddleGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0.2)');
      puddleGrad.addColorStop(1, 'rgba(10, 10, 20, 0.9)');
      ctx.fillStyle = puddleGrad;
      ctx.fillRect(140, this.groundY, 320, 40);
      ctx.fillRect(500, this.groundY, 300, 45);
      ctx.fillRect(860, this.groundY, 280, 40);

      // Ground Kerb / Sidewalk line
      ctx.strokeStyle = '#2d2d42';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, this.groundY);
      ctx.lineTo(this.width, this.groundY);
      ctx.stroke();

      // 6. Atmospheric Rain Streaks
      ctx.strokeStyle = 'rgba(180, 220, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < this.rainDrops.length; i++) {
        const d = this.rainDrops[i];
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.length);
      }
      ctx.stroke();

      ctx.restore();
    }
  }

  window.NeonRumble.NeonAlley = NeonAlley;
})();
