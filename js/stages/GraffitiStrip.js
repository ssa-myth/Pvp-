/**
 * GraffitiStrip.js - Combat Zone: Sunset Graffiti Arcade Alley
 * Faithfully recreating the vibrant 2D cartoon/comic arcade fighting aesthetic:
 * - Amber sunset sky with occult pentagram sunburst mandala
 * - Crooked purple cartoon skyline & crisscrossing telephone wires
 * - Giant tilted graffiti arcade cabinet with spinning cooling fan
 * - Animated mosquito-punk spectator & mysterious occult merchant tent
 * - Striped construction barrier & bent pink chainlink fence with flyers
 * - Purple ornamental walkway with neon orange curb and occult manhole
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class GraffitiStrip {
    constructor() {
      this.id = 'GraffitiStrip';
      this.name = 'GRAFFITI STRIP';
      this.subtitle = 'SECTOR 4 - SUNSET WASTELAND';
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

      // =======================================================================
      // 1. DYNAMIC SKY (Round-Sensitive: Sunset -> Twilight/Neon -> Blood Storm)
      // =======================================================================
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
      if (round === 1) {
        skyGrad.addColorStop(0, '#ffc63b');
        skyGrad.addColorStop(0.55, '#ffa224');
        skyGrad.addColorStop(1, '#f88414');
      } else if (round === 2) {
        skyGrad.addColorStop(0, '#1a0d2e');
        skyGrad.addColorStop(0.55, '#3c185e');
        skyGrad.addColorStop(1, '#662282');
      } else {
        skyGrad.addColorStop(0, '#4a081a');
        skyGrad.addColorStop(0.55, '#82132e');
        skyGrad.addColorStop(1, '#b51d40');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // =======================================================================
      // 2. OCCULT SUNBURST MANDALA (Background Celestial Emblem)
      // =======================================================================
      ctx.save();
      const sunX = 390;
      const sunY = 160;
      const sunRadius = 82;

      // Radiating triangular rays (12 rays)
      ctx.fillStyle = 'rgba(235, 105, 15, 0.45)';
      ctx.strokeStyle = '#df5e08';
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI / 6) + (Math.sin(t * 0.02) * 0.04);
        const rOuter = sunRadius + 42 + (i % 2 === 0 ? 16 : 0);
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(angle - 0.14) * (sunRadius + 8), sunY + Math.sin(angle - 0.14) * (sunRadius + 8));
        ctx.lineTo(sunX + Math.cos(angle) * rOuter, sunY + Math.sin(angle) * rOuter);
        ctx.lineTo(sunX + Math.cos(angle + 0.14) * (sunRadius + 8), sunY + Math.sin(angle + 0.14) * (sunRadius + 8));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Concentric circles
      ctx.strokeStyle = '#d65405';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius + 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#e2620c';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius - 10, 0, Math.PI * 2);
      ctx.stroke();

      // Pentagram in the center
      ctx.strokeStyle = '#d85807';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let p = 0; p < 5; p++) {
        const starAngle = -Math.PI / 2 + p * (Math.PI * 4 / 5);
        const sx = sunX + Math.cos(starAngle) * (sunRadius - 20);
        const sy = sunY + Math.sin(starAngle) * (sunRadius - 20);
        if (p === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // =======================================================================
      // 3. TELEPHONE POLES & SAGGING POWER LINES
      // =======================================================================
      ctx.save();
      ctx.strokeStyle = '#4a2612';
      ctx.lineWidth = 2.5;

      // Left utility pole (x = 100)
      ctx.fillStyle = '#3c1d0e';
      ctx.fillRect(94, 70, 14, this.groundY - 70);
      ctx.fillRect(72, 110, 58, 8); // Crossbar 1
      ctx.fillRect(80, 150, 42, 7); // Crossbar 2

      // Right utility pole (x = 1270)
      ctx.fillRect(1264, 60, 14, this.groundY - 60);
      ctx.fillRect(1240, 105, 60, 8);
      ctx.fillRect(1248, 145, 46, 7);

      // Multiple drooping power line wires
      ctx.beginPath();
      ctx.moveTo(72, 110);
      ctx.bezierCurveTo(450, 210, 850, 220, 1240, 105);
      ctx.moveTo(72, 114);
      ctx.bezierCurveTo(460, 240, 890, 245, 1240, 109);
      ctx.moveTo(125, 150);
      ctx.bezierCurveTo(490, 260, 820, 265, 1264, 145);
      ctx.stroke();
      ctx.restore();

      // =======================================================================
      // 4. ANGULAR CARTOON CITYSCAPE (Purple Monoliths)
      // =======================================================================
      ctx.save();
      // Mid-distance crooked buildings
      const buildings = [
        { x: -40, w: 180, h: 320, lean: -0.04, color: '#563878' },
        { x: 190, w: 170, h: 290, lean: 0.03, color: '#684592' },
        { x: 380, w: 210, h: 340, lean: -0.02, color: '#4f3070' },
        { x: 860, w: 180, h: 310, lean: -0.05, color: '#633f8d' },
        { x: 1060, w: 190, h: 330, lean: 0.04, color: '#523375' },
        { x: 1260, w: 180, h: 290, lean: -0.03, color: '#684592' }
      ];

      buildings.forEach((b, idx) => {
        ctx.save();
        ctx.translate(b.x + b.w / 2, this.groundY);
        ctx.rotate(b.lean);

        // Building body with bold comic outline
        ctx.fillStyle = b.color;
        ctx.strokeStyle = '#1e0e33';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(-b.w / 2, -b.h, b.w, b.h);
        ctx.fill();
        ctx.stroke();

        // Jagged comic roof decorations / antennae
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(-b.w / 2 + 15, -b.h - 18, 12, 18);
        ctx.strokeStyle = '#1e0e33';
        ctx.lineWidth = 3;
        ctx.strokeRect(-b.w / 2 + 15, -b.h - 18, 12, 18);

        // Bright yellow cartoon window cutouts
        ctx.fillStyle = '#ffe633';
        for (let row = 0; row < b.h - 50; row += 40) {
          for (let col = 18; col < b.w - 20; col += 36) {
            if ((idx * 3 + row + col) % 7 !== 0) {
              const winX = -b.w / 2 + col;
              const winY = -b.h + 30 + row;
              ctx.fillRect(winX, winY, 20, 22);
              ctx.strokeRect(winX, winY, 20, 22);
            }
          }
        }
        ctx.restore();
      });
      ctx.restore();

      // =======================================================================
      // 5. OCCULT TENT BOOTH & SHOPKEEPER (Left Side, x: 20 to 190)
      // =======================================================================
      ctx.save();
      const boothX = 110;
      const boothY = this.groundY;

      // Tent canopy
      ctx.fillStyle = '#4c296d';
      ctx.strokeStyle = '#1a082c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(boothX - 85, boothY);
      ctx.lineTo(boothX - 60, boothY - 260);
      ctx.lineTo(boothX + 70, boothY - 260);
      ctx.lineTo(boothX + 90, boothY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tent peak spire
      ctx.fillStyle = '#ff0077';
      ctx.beginPath();
      ctx.moveTo(boothX + 5, boothY - 260);
      ctx.lineTo(boothX - 15, boothY - 300);
      ctx.lineTo(boothX + 25, boothY - 300);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing cat face / jack-o-lantern on tent curtain
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(boothX - 25, boothY - 140);
      ctx.lineTo(boothX - 10, boothY - 120);
      ctx.lineTo(boothX - 18, boothY - 140);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(boothX + 25, boothY - 140);
      ctx.lineTo(boothX + 10, boothY - 120);
      ctx.lineTo(boothX + 18, boothY - 140);
      ctx.closePath();
      ctx.fill();
      // Grinning mouth
      ctx.beginPath();
      ctx.arc(boothX, boothY - 110, 20, 0.2, Math.PI - 0.2);
      ctx.lineTo(boothX, boothY - 105);
      ctx.closePath();
      ctx.fill();

      // Shrouded purple occult merchant watching from tent slit
      ctx.fillStyle = '#1c0a2e';
      ctx.fillRect(boothX - 40, boothY - 210, 50, 75);
      // Fishnet glasses / yellow eyes
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(boothX - 24, boothY - 180, 8, 0, Math.PI * 2);
      ctx.arc(boothX - 6, boothY - 180, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Skull & bat bunting flags strung along tent edge
      const buntingColors = ['#ffcc00', '#ff0077', '#00f0ff', '#ffffff'];
      for (let f = 0; f < 4; f++) {
        ctx.fillStyle = buntingColors[f];
        ctx.beginPath();
        const fx = boothX - 60 + f * 38;
        ctx.moveTo(fx, boothY - 255);
        ctx.lineTo(fx + 24, boothY - 255);
        ctx.lineTo(fx + 12, boothY - 225);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // =======================================================================
      // 6. STRIPED SAWHORSE CONSTRUCTION BARRIER (x: 250)
      // =======================================================================
      ctx.save();
      const barX = 250;
      const barY = this.groundY - 10;

      // Barrier Legs
      ctx.strokeStyle = '#181026';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(barX - 45, barY + 10);
      ctx.lineTo(barX - 35, barY - 65);
      ctx.lineTo(barX - 25, barY + 10);
      ctx.moveTo(barX + 45, barY + 10);
      ctx.lineTo(barX + 55, barY - 65);
      ctx.lineTo(barX + 65, barY + 10);
      ctx.stroke();

      // Striped Board
      ctx.fillStyle = '#ff2b75';
      ctx.fillRect(barX - 55, barY - 65, 130, 42);
      ctx.strokeStyle = '#181026';
      ctx.lineWidth = 4;
      ctx.strokeRect(barX - 55, barY - 65, 130, 42);

      // Alternating deep purple stripes
      ctx.fillStyle = '#2d1145';
      for (let s = 0; s < 4; s++) {
        ctx.fillRect(barX - 45 + s * 30, barY - 65, 14, 42);
      }
      ctx.restore();

      // =======================================================================
      // 7. GIANT TILTED GRAFFITI ARCADE CABINET (Center Landmark, x: 670)
      // =======================================================================
      ctx.save();
      const cabX = 660;
      const cabY = this.groundY - 12;

      ctx.translate(cabX, cabY);
      ctx.rotate(-0.31); // ~18 degree tilt matching reference!

      // Main Cabinet Shell
      ctx.fillStyle = '#4c3070';
      ctx.fillRect(-105, -360, 210, 360);
      ctx.strokeStyle = '#12081f';
      ctx.lineWidth = 6;
      ctx.strokeRect(-105, -360, 210, 360);

      // Top Marquee with colorful cartoon graffiti & decals
      ctx.fillStyle = '#ffeaeb';
      ctx.fillRect(-92, -345, 184, 150);
      ctx.strokeStyle = '#12081f';
      ctx.lineWidth = 4;
      ctx.strokeRect(-92, -345, 184, 150);

      // Graffiti artwork on marquee
      // Skull with cap
      ctx.fillStyle = '#100a1c';
      ctx.beginPath();
      ctx.arc(-40, -290, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-46, -294, 6, 0, Math.PI * 2);
      ctx.arc(-34, -294, 6, 0, Math.PI * 2);
      ctx.fill();
      // Cap visor
      ctx.fillStyle = '#ff0077';
      ctx.fillRect(-62, -315, 45, 10);

      // Pink butterfly / heart tag
      ctx.fillStyle = '#ff2b88';
      ctx.beginPath();
      ctx.arc(35, -295, 18, 0, Math.PI * 2);
      ctx.arc(55, -295, 18, 0, Math.PI * 2);
      ctx.fill();

      // Alien / slime green decal
      ctx.fillStyle = '#00ff66';
      ctx.beginPath();
      ctx.arc(5, -240, 16, 0, Math.PI * 2);
      ctx.fill();

      // Lower Door (Hot Pink with Yellow Trim)
      ctx.fillStyle = '#ff0077';
      ctx.fillRect(-88, -170, 176, 155);
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 6;
      ctx.strokeRect(-88, -170, 176, 155);

      // Coin insert slots
      ctx.fillStyle = '#220818';
      ctx.fillRect(-50, -110, 18, 30);
      ctx.fillRect(32, -110, 18, 30);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(-45, -100, 8, 12);
      ctx.fillRect(37, -100, 8, 12);

      // Side-Mounted Air Conditioning Unit with Spinning Fan
      ctx.fillStyle = '#7a8198';
      ctx.fillRect(105, -260, 65, 75);
      ctx.strokeStyle = '#12081f';
      ctx.lineWidth = 4;
      ctx.strokeRect(105, -260, 65, 75);

      // Circular fan vent
      ctx.fillStyle = '#222838';
      ctx.beginPath();
      ctx.arc(137, -222, 26, 0, Math.PI * 2);
      ctx.fill();

      // Spinning yellow fan blades
      ctx.save();
      ctx.translate(137, -222);
      ctx.rotate(t * 0.18);
      ctx.fillStyle = '#ffcc00';
      for (let b = 0; b < 4; b++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(-4, -22, 8, 22);
      }
      ctx.restore();

      ctx.restore(); // End cabinet transform

      // =======================================================================
      // 8. SPECTATOR: MOSQUITO-PUNK (Leaning against the cabinet)
      // =======================================================================
      ctx.save();
      const mosqX = 770;
      const mosqY = this.groundY;

      // Fluttering cartoon wings
      const wingFlutter = Math.sin(t * 0.35) * 8;
      ctx.fillStyle = 'rgba(210, 240, 255, 0.75)';
      ctx.strokeStyle = '#1a2233';
      ctx.lineWidth = 2.5;
      // Wing Left
      ctx.beginPath();
      ctx.ellipse(mosqX - 18, mosqY - 145 + wingFlutter, 28, 14, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Wing Right
      ctx.beginPath();
      ctx.ellipse(mosqX + 24, mosqY - 145 - wingFlutter, 28, 14, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Slender green bug body
      ctx.fillStyle = '#44b83d';
      ctx.strokeStyle = '#12240f';
      ctx.lineWidth = 3.5;
      ctx.fillRect(mosqX - 8, mosqY - 130, 18, 55); // Torso
      ctx.strokeRect(mosqX - 8, mosqY - 130, 18, 55);

      // Denim shorts & legs
      ctx.fillStyle = '#22385c';
      ctx.fillRect(mosqX - 10, mosqY - 75, 22, 22);
      // Skinny legs
      ctx.fillStyle = '#44b83d';
      ctx.fillRect(mosqX - 8, mosqY - 53, 6, 32);
      ctx.fillRect(mosqX + 4, mosqY - 53, 6, 32);

      // Pink sneakers
      ctx.fillStyle = '#ff2b75';
      ctx.fillRect(mosqX - 14, mosqY - 21, 16, 18);
      ctx.fillRect(mosqX + 2, mosqY - 21, 16, 18);
      ctx.strokeRect(mosqX - 14, mosqY - 21, 16, 18);
      ctx.strokeRect(mosqX + 2, mosqY - 21, 16, 18);

      // Head
      ctx.fillStyle = '#44b83d';
      ctx.beginPath();
      ctx.arc(mosqX + 1, mosqY - 150, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Long proboscis / mosquito snout
      ctx.strokeStyle = '#44b83d';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(mosqX - 6, mosqY - 146);
      ctx.lineTo(mosqX - 28, mosqY - 130);
      ctx.stroke();
      ctx.strokeStyle = '#12240f';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Big black cartoon bug eyes
      ctx.fillStyle = '#111812';
      ctx.beginPath();
      ctx.arc(mosqX - 6, mosqY - 152, 5, 0, Math.PI * 2);
      ctx.arc(mosqX + 6, mosqY - 152, 5, 0, Math.PI * 2);
      ctx.fill();

      // Bright Pink Punk Spiky Hair
      ctx.fillStyle = '#ff0077';
      ctx.strokeStyle = '#12081f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(mosqX - 18, mosqY - 162);
      ctx.lineTo(mosqX - 10, mosqY - 182);
      ctx.lineTo(mosqX - 2, mosqY - 168);
      ctx.lineTo(mosqX + 8, mosqY - 186);
      ctx.lineTo(mosqX + 16, mosqY - 168);
      ctx.lineTo(mosqX + 22, mosqY - 178);
      ctx.lineTo(mosqX + 20, mosqY - 155);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // =======================================================================
      // 9. BENT PINK CHAINLINK FENCE WITH FLYERS (Right Side, x: 920 to 1100)
      // =======================================================================
      ctx.save();
      const fenceX = 1000;
      const fenceY = this.groundY;

      ctx.translate(fenceX, fenceY);
      ctx.rotate(0.12); // Tilted bent fence matching reference!

      // Pink steel pipe frame
      ctx.strokeStyle = '#ff1a6c';
      ctx.lineWidth = 6;
      ctx.strokeRect(-95, -170, 190, 160);

      // Inner wire diamond grid
      ctx.strokeStyle = '#a63364';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = -85; x < 95; x += 22) {
        ctx.moveTo(x, -170);
        ctx.lineTo(x + 40, -10);
        ctx.moveTo(x + 40, -170);
        ctx.lineTo(x, -10);
      }
      ctx.stroke();

      // White paper flyers & posters taped on
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1a1020';
      ctx.lineWidth = 2;
      // Flyer 1
      ctx.fillRect(-70, -140, 32, 42);
      ctx.strokeRect(-70, -140, 32, 42);
      // Flyer 2
      ctx.fillRect(15, -110, 36, 48);
      ctx.strokeRect(15, -110, 36, 48);
      // Yellow tape strip on flyer
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(24, -115, 18, 7);

      ctx.restore();

      // =======================================================================
      // 10. OCCULT METAL MANHOLE COVER (Right Foreground Floor)
      // =======================================================================
      ctx.save();
      const mhX = 1090;
      const mhY = this.groundY + 45;

      // Elliptical perspective
      ctx.fillStyle = '#3a1a54';
      ctx.strokeStyle = '#180a26';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(mhX, mhY, 78, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner circle
      ctx.strokeStyle = '#5c2d82';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(mhX, mhY, 56, 19, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Eye rune in center
      ctx.strokeStyle = '#a820ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(mhX, mhY, 26, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(mhX, mhY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // =======================================================================
      // 11. COMBAT WALKWAY FLOOR & VIBRANT NEON ORANGE CURB STRIPE
      // =======================================================================
      // Purple Combat Floor
      const floorGrad = ctx.createLinearGradient(0, this.groundY, 0, this.height);
      floorGrad.addColorStop(0, '#5f2f8a');
      floorGrad.addColorStop(0.35, '#52247a');
      floorGrad.addColorStop(1, '#3b1559');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

      // Subtle gothic crest ornaments on floor
      ctx.strokeStyle = 'rgba(38, 12, 60, 0.45)';
      ctx.lineWidth = 3.5;
      for (let cx = 160; cx < this.width; cx += 280) {
        ctx.beginPath();
        ctx.arc(cx, this.groundY + 42, 38, Math.PI, 0);
        ctx.moveTo(cx - 38, this.groundY + 42);
        ctx.bezierCurveTo(cx - 15, this.groundY + 75, cx + 15, this.groundY + 75, cx + 38, this.groundY + 42);
        ctx.stroke();
      }

      // Neon Orange Stage Curb Stripe (Key visual dividing line from reference)
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(0, this.groundY - 5, this.width, 10);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, this.groundY - 5);
      ctx.lineTo(this.width, this.groundY - 5);
      ctx.moveTo(0, this.groundY + 5);
      ctx.lineTo(this.width, this.groundY + 5);
      ctx.stroke();

      ctx.restore();
    }
  }

  window.NeonRumble.GraffitiStrip = GraffitiStrip;
})();
