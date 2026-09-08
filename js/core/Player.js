/**
 * Player.js - Fluid 8-Way Omnidirectional Player Controller
 * Implements Hero Ardra (Female Assassin with purple hair, red mask, katana, and navy/white tunic).
 * Features:
 * - Smooth 8-way movement controlled by WASD and Arrow keys
 * - Physics model with acceleration, maxSpeed, and friction (damping)
 * - Horizontal flipping based on movement direction
 * - Seamless Idle <-> Run animation state machine
 * - Viewport boundary collision detection
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class Player {
    constructor(startX = 480, startY = 270, config = {}) {
      // Identity
      this.id = 'Ardra';
      this.name = 'ARDRA';
      this.title = 'THE SHADOW STORMBLADE';

      // Position & Physics
      this.x = startX;
      this.y = startY;
      this.vx = 0;
      this.vy = 0;
      this.acceleration = config.acceleration || 0.82;
      this.maxSpeed = config.maxSpeed || 5.8;
      this.friction = config.friction || 0.86; // Damping for smooth slide-to-stop
      this.facing = 1; // 1 = Right, -1 = Left

      // Hitbox / Dimensions (matching reference proportions)
      this.width = 44;
      this.height = 88;

      // Animation State Machine
      this.state = 'IDLE'; // 'IDLE' or 'RUN'
      this.animTimer = 0;

      // Viewport Boundaries (Canvas is 960 x 540)
      this.viewport = {
        minX: config.minX || 30,
        maxX: config.maxX || 930,
        minY: config.minY || 95,
        maxY: config.maxY || 515
      };

      // Dust particles for running
      this.footsteps = [];

      // Color Palette extracted directly from Image:
      this.colors = {
        hair: '#9c27b0',        // Vibrant purple ponytail & fringe
        hairShade: '#7b1fa2',   // Deep purple shadow
        mask: '#e61a38',        // Crimson ninja cowl / face scarf
        maskShadow: '#b7152d',  // Shaded cowl fold
        skin: '#ffe0d0',        // Fair skin
        whiteWrap: '#ffffff',   // Right chest sarashi bandage
        navyTunic: '#141a32',   // Navy blue shinobi fabric
        navyTrim: '#1e294b',    // Navy highlight
        obi: '#c41e3a',         // Thick braided red rope obi
        gold: '#ffd700',        // Obi buckle ring & Katana tsuba
        skirt: '#101018',       // Tactical black pleated skirt
        stocking: '#1a2a6c',    // Navy thigh-high cutouts
        boots: '#101016',       // Black ninja combat boots
        bladeGlow: '#00f0ff',   // Cyan blade edge glow
        katanaHilt: '#9c27b0',  // Purple hilt cord wrap
        ribbon: '#e61a38'       // Trailing crimson scarf / sageo ribbon
      };
    }

    /**
     * Update physics, 8-way movement, animation state, and boundary clamping
     */
    update(keys = {}) {
      this.animTimer++;

      // 1. Read 8-Way Omnidirectional Inputs (WASD & Arrow Keys)
      let inputX = 0;
      let inputY = 0;

      if (keys['KeyA'] || keys['ArrowLeft'] || keys['a'] || keys['A'] || keys.left) inputX -= 1;
      if (keys['KeyD'] || keys['ArrowRight'] || keys['d'] || keys['D'] || keys.right) inputX += 1;
      if (keys['KeyW'] || keys['ArrowUp'] || keys['w'] || keys['W'] || keys.up) inputY -= 1;
      if (keys['KeyS'] || keys['ArrowDown'] || keys['s'] || keys['S'] || keys.down) inputY += 1;

      // 2. Normalize diagonal input vector so diagonal movement doesn't exceed maxSpeed
      if (inputX !== 0 && inputY !== 0) {
        const invLen = 1 / Math.SQRT2;
        inputX *= invLen;
        inputY *= invLen;
      }

      // 3. Apply Acceleration
      if (inputX !== 0) {
        this.vx += inputX * this.acceleration;
      }
      if (inputY !== 0) {
        this.vy += inputY * this.acceleration;
      }

      // 4. Clamp to Maximum Speed
      const currentSpeed = Math.hypot(this.vx, this.vy);
      if (currentSpeed > this.maxSpeed) {
        const ratio = this.maxSpeed / currentSpeed;
        this.vx *= ratio;
        this.vy *= ratio;
      }

      // 5. Apply Friction (Damping) for smooth slide-to-stop
      this.vx *= this.friction;
      this.vy *= this.friction;

      // Stop microscopic drift
      if (Math.abs(this.vx) < 0.05) this.vx = 0;
      if (Math.abs(this.vy) < 0.05) this.vy = 0;

      // 6. Update Position
      this.x += this.vx;
      this.y += this.vy;

      // 7. Horizontal Flipping (Face direction of movement)
      if (this.vx > 0.15) {
        this.facing = 1;
      } else if (this.vx < -0.15) {
        this.facing = -1;
      }

      // 8. Animation State Transition (Seamless Idle <-> Run)
      const movingSpeed = Math.hypot(this.vx, this.vy);
      if (movingSpeed > 0.35) {
        this.state = 'RUN';
        // Spawn footstep running dust
        if (this.animTimer % 7 === 0) {
          this.footsteps.push({
            x: this.x - this.facing * 12,
            y: this.y - 2,
            size: Math.random() * 3 + 2,
            alpha: 0.6
          });
        }
      } else {
        this.state = 'IDLE';
      }

      // Update footstep dust
      for (let i = this.footsteps.length - 1; i >= 0; i--) {
        const d = this.footsteps[i];
        d.size += 0.3;
        d.alpha -= 0.05;
        if (d.alpha <= 0) {
          this.footsteps.splice(i, 1);
        }
      }

      // 9. Viewport Boundary Collision Detection
      const halfW = this.width / 2;
      if (this.x - halfW < this.viewport.minX) {
        this.x = this.viewport.minX + halfW;
        this.vx = 0;
      }
      if (this.x + halfW > this.viewport.maxX) {
        this.x = this.viewport.maxX - halfW;
        this.vx = 0;
      }
      if (this.y < this.viewport.minY) {
        this.y = this.viewport.minY;
        this.vy = 0;
      }
      if (this.y > this.viewport.maxY) {
        this.y = this.viewport.maxY;
        this.vy = 0;
      }
    }

    /**
     * Render the character at 60 FPS matching the exact reference image
     */
    draw(ctx) {
      ctx.save();

      const t = this.animTimer;
      const isRunning = this.state === 'RUN';
      const c = this.colors;

      // -----------------------------------------------------------------------
      // 1. Draw Running Footstep Dust
      // -----------------------------------------------------------------------
      for (const d of this.footsteps) {
        ctx.fillStyle = `rgba(180, 160, 210, ${d.alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // -----------------------------------------------------------------------
      // 2. Soft Dynamic Drop Shadow on Ground
      // -----------------------------------------------------------------------
      ctx.fillStyle = 'rgba(10, 8, 20, 0.45)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // -----------------------------------------------------------------------
      // 3. Character Root Transform & Horizontal Flip
      // -----------------------------------------------------------------------
      ctx.translate(this.x, this.y);
      ctx.scale(this.facing, 1);

      // Animation parameters
      let bobY = 0;
      let torsoLean = 0;
      let legL = { x1: -6, y1: -30, x2: -10, y2: 0 };
      let legR = { x1: 6, y1: -30, x2: 10, y2: 0 };
      let armL = { x: -12, y: -48, angle: 0.2 };
      let armR = { x: 12, y: -46, angle: -0.2 };
      let ponytailSway = 0;
      let ribbonSway = 0;

      if (isRunning) {
        // High-velocity Running Stride Cycle
        const runCycle = t * 0.32;
        bobY = Math.abs(Math.sin(runCycle)) * -5;
        torsoLean = 0.18; // Forward aggressive assassin run lean

        // Alternating scissor leg strides
        const strideL = Math.sin(runCycle) * 22;
        const strideR = Math.sin(runCycle + Math.PI) * 22;
        legL = { x1: -6, y1: -30, x2: -6 + strideL, y2: (strideL > 0 ? -6 : 0) };
        legR = { x1: 6, y1: -30, x2: 6 + strideR, y2: (strideR > 0 ? -6 : 0) };

        // Running arm pumps
        armL.angle = -0.6 + Math.sin(runCycle) * 0.7;
        armR.angle = 0.4 + Math.sin(runCycle + Math.PI) * 0.7;

        // Dynamic hair & ribbon wind flutter
        ponytailSway = -14 + Math.sin(t * 0.4) * 6;
        ribbonSway = -24 + Math.sin(t * 0.35) * 10;
      } else {
        // Idle Breathing & Stance Sway
        bobY = Math.sin(t * 0.09) * 2.2;
        torsoLean = 0.03;
        armL.angle = -0.25 + Math.sin(t * 0.08) * 0.08;
        armR.angle = 0.35 + Math.cos(t * 0.08) * 0.08;
        ponytailSway = Math.sin(t * 0.12) * 4;
        ribbonSway = Math.sin(t * 0.15) * 6;
      }

      ctx.translate(0, bobY);

      // =======================================================================
      // A. KATANA ON BACK (Diagonal across torso with gold tsuba & red ribbon)
      // =======================================================================
      ctx.save();
      ctx.translate(-4, -50);
      ctx.rotate(-0.52 + torsoLean);

      // Black lacquered Saya (Sheath)
      ctx.fillStyle = '#101218';
      ctx.fillRect(-4, -14, 8, 64);
      ctx.strokeStyle = '#2b3042';
      ctx.lineWidth = 1;
      ctx.strokeRect(-4, -14, 8, 64);

      // Polished Golden Tsuba (Guard)
      ctx.fillStyle = c.gold;
      ctx.fillRect(-7, -18, 14, 5);

      // Purple wrapped Tsuka (Hilt)
      ctx.fillStyle = c.katanaHilt;
      ctx.fillRect(-3, -34, 6, 16);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Diamond cord wrap marks
      ctx.moveTo(-3, -28); ctx.lineTo(3, -24);
      ctx.moveTo(-3, -22); ctx.lineTo(3, -18);
      ctx.stroke();

      // Golden Ring Pommel (Kashira)
      ctx.fillStyle = c.gold;
      ctx.fillRect(-5, -37, 10, 4);

      // Crimson Sageo Ribbon fluttering from the hilt
      ctx.fillStyle = c.ribbon;
      ctx.beginPath();
      ctx.moveTo(-2, -34);
      ctx.quadraticCurveTo(-14 + ribbonSway * 0.4, -40, -18 + ribbonSway, -25);
      ctx.lineTo(-14 + ribbonSway, -22);
      ctx.quadraticCurveTo(-10 + ribbonSway * 0.3, -34, 2, -34);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // =======================================================================
      // B. LEGS, NAVY CUTOUT THIGH-HIGHS & COMBAT BOOTS
      // =======================================================================
      // Left Leg (Back)
      this.drawLeg(ctx, legL, c);
      // Right Leg (Front)
      this.drawLeg(ctx, legR, c);

      // =======================================================================
      // C. TACTICAL BLACK PLEATED SKIRT
      // =======================================================================
      ctx.save();
      ctx.translate(0, -32);
      ctx.rotate(torsoLean * 0.5);

      // Navy under-layer / crest panel
      ctx.fillStyle = c.stocking;
      ctx.beginPath();
      ctx.moveTo(-4, 0); ctx.lineTo(10, 0); ctx.lineTo(12, 14); ctx.lineTo(-2, 14);
      ctx.closePath(); ctx.fill();

      // Black Pleated Skirt
      ctx.fillStyle = c.skirt;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(16, 0);
      ctx.lineTo(20, 16);
      ctx.lineTo(-20, 16);
      ctx.closePath();
      ctx.fill();

      // Pleat creases
      ctx.strokeStyle = '#222536';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-8, 0); ctx.lineTo(-10, 16);
      ctx.moveTo(0, 0); ctx.lineTo(0, 16);
      ctx.moveTo(8, 0); ctx.lineTo(10, 16);
      ctx.stroke();
      ctx.restore();

      // =======================================================================
      // D. TORSO (Asymmetric White Sarashi Wrap & Navy Shinobi Tunic)
      // =======================================================================
      ctx.save();
      ctx.translate(0, -34);
      ctx.rotate(torsoLean);

      // Navy Tunic Base (Left side & back)
      ctx.fillStyle = c.navyTunic;
      ctx.fillRect(-13, -24, 26, 26);

      // Asymmetrical White Sarashi Wrap (Right breast / shoulder)
      ctx.fillStyle = c.whiteWrap;
      ctx.beginPath();
      ctx.moveTo(-13, -24);
      ctx.lineTo(3, -24);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-13, 0);
      ctx.closePath();
      ctx.fill();

      // Sarashi bandage wraps lines
      ctx.strokeStyle = '#d5d9ec';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-13, -18); ctx.lineTo(1, -18);
      ctx.moveTo(-13, -12); ctx.lineTo(-1, -12);
      ctx.moveTo(-13, -6); ctx.lineTo(-3, -6);
      ctx.stroke();

      // Navy Trim on left lapel
      ctx.fillStyle = c.navyTrim;
      ctx.beginPath();
      ctx.moveTo(3, -24); ctx.lineTo(13, -24); ctx.lineTo(13, 0); ctx.lineTo(-3, 0);
      ctx.closePath(); ctx.fill();

      // Braided Crimson Rope Obi Belt
      ctx.fillStyle = c.obi;
      ctx.fillRect(-14, -6, 28, 9);
      ctx.strokeStyle = '#991128';
      ctx.lineWidth = 1.5;
      for (let ox = -12; ox < 12; ox += 6) {
        ctx.beginPath();
        ctx.moveTo(ox, -6); ctx.lineTo(ox + 4, 3);
        ctx.stroke();
      }

      // Golden Circular Buckle Ring on Left Hip
      ctx.strokeStyle = c.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(6, -1, 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore(); // end torso

      // =======================================================================
      // E. HEAD, HIGH PURPLE PONYTAIL & CRIMSON NINJA COWL
      // =======================================================================
      ctx.save();
      ctx.translate(0, -60);
      ctx.rotate(torsoLean * 0.4);

      // Fair Skin Neck & Face
      ctx.fillStyle = c.skin;
      ctx.beginPath();
      ctx.arc(0, -9, 14, 0, Math.PI * 2);
      ctx.fill();

      // High Purple Ponytail (Trailing Up & Back)
      ctx.fillStyle = c.hair;
      ctx.beginPath();
      ctx.moveTo(-3, -20);
      ctx.quadraticCurveTo(-22 + ponytailSway * 0.7, -34, -28 + ponytailSway, -12);
      ctx.quadraticCurveTo(-18 + ponytailSway * 0.5, -18, -8, -14);
      ctx.closePath();
      ctx.fill();

      // Ponytail highlight
      ctx.fillStyle = '#ba68c8';
      ctx.beginPath();
      ctx.ellipse(-14 + ponytailSway * 0.5, -20, 6, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Red Hair Ribbon / Tie
      ctx.fillStyle = c.ribbon;
      ctx.fillRect(-7, -22, 7, 5);

      // Purple Front Bangs & Loose Side Framing Locks
      ctx.fillStyle = c.hair;
      ctx.beginPath();
      ctx.moveTo(-12, -18);
      ctx.lineTo(12, -18);
      ctx.lineTo(8, -10);
      ctx.lineTo(0, -8);
      ctx.lineTo(-8, -12);
      ctx.closePath();
      ctx.fill();
      // Long side strand framing cheek
      ctx.fillRect(-12, -12, 3.5, 12);

      // Sharp Cyan Ninja Eyes
      ctx.fillStyle = c.bladeGlow;
      ctx.fillRect(-6, -9, 4, 3);
      ctx.fillRect(3, -9, 4, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5, -9, 1.5, 1.5);
      ctx.fillRect(4, -9, 1.5, 1.5);

      // Crimson Ninja Cowl / Face Mask (covers mouth & nose)
      ctx.fillStyle = c.mask;
      ctx.beginPath();
      ctx.moveTo(-11, -5);
      ctx.lineTo(11, -5);
      ctx.lineTo(8, 8);
      ctx.lineTo(-8, 8);
      ctx.closePath();
      ctx.fill();

      // Cowl fold line
      ctx.strokeStyle = c.maskShadow;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-9, 1); ctx.lineTo(9, 1);
      ctx.stroke();

      ctx.restore(); // end head

      // =======================================================================
      // F. ARMS & GAUNTLETS
      // =======================================================================
      // Left Arm (Back Arm)
      this.drawArm(ctx, armL, c, false);
      // Right Arm (Front Arm pointing/holding)
      this.drawArm(ctx, armR, c, true);

      ctx.restore(); // end root transform
    }

    drawLeg(ctx, leg, c) {
      ctx.save();
      // Thigh (Bare skin & Navy Cutout)
      ctx.strokeStyle = c.skin;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(leg.x1, leg.y1);
      ctx.lineTo(leg.x1 + (leg.x2 - leg.x1) * 0.45, leg.y1 + 14);
      ctx.stroke();

      // Navy Cutout Stocking with slit straps
      ctx.strokeStyle = c.stocking;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(leg.x1 + (leg.x2 - leg.x1) * 0.4, leg.y1 + 12);
      ctx.lineTo(leg.x2, leg.y2 - 10);
      ctx.stroke();

      // Combat Boot
      ctx.strokeStyle = c.boots;
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.moveTo(leg.x2, leg.y2 - 12);
      ctx.lineTo(leg.x2 + 2, leg.y2);
      ctx.lineTo(leg.x2 + 6, leg.y2); // boot toe
      ctx.stroke();

      ctx.restore();
    }

    drawArm(ctx, arm, c, isFront) {
      ctx.save();
      ctx.translate(arm.x, arm.y);
      ctx.rotate(arm.angle);

      // Shoulder & Upper Arm (Bare skin & purple arm band)
      ctx.strokeStyle = c.skin;
      ctx.lineWidth = 5.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(7, 8);
      ctx.stroke();

      // Purple Arm Stripe Band
      ctx.strokeStyle = c.hair;
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(2, 2); ctx.lineTo(5, 5);
      ctx.stroke();

      // Forearm Shinobi Gauntlet / Bracer
      ctx.strokeStyle = c.navyTunic;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(7, 8); ctx.lineTo(15, 14);
      ctx.stroke();

      // Cyan Tech Accent on Bracer
      ctx.fillStyle = c.bladeGlow;
      ctx.fillRect(9, 9, 3, 2);

      // Purple Fingerless Glove
      ctx.fillStyle = c.hair;
      ctx.fillRect(14, 13, 5, 4);

      ctx.restore();
    }
  }

  window.NeonRumble.Player = Player;
})();
