/**
 * FighterRenderer.js - High-Fidelity Procedural Retro Pixel Art Fighter Renderer
 * Generates rich, expressive, animated 16-bit arcade fighters with full skeletal poses,
 * dynamic accessories (hair, scarves, weapons), squash/stretch deformation, and visual effects.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class FighterRenderer {
    constructor() {}

    drawShadow(ctx, fighter) {
      ctx.save();
      const distFromGround = Math.abs(fighter.y - fighter.groundY);
      const scaleFactor = fighter.scale || (fighter.isBoss ? 1.48 : 1.0);
      const shadowWidth = Math.max(16, (fighter.width + 12) * scaleFactor * (1 - Math.min(1, distFromGround / 190)));
      const shadowHeight = 8 * scaleFactor;
      const alpha = Math.max(0.12, 0.45 * (1 - Math.min(1, distFromGround / 210)));

      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(fighter.x, fighter.groundY + 2, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawFighter(ctx, fighter) {
      ctx.save();

      // 1. Floor Shadow
      this.drawShadow(ctx, fighter);

      // 2. Dynamic Squash & Stretch Deformation Matrix
      let sx = 1.0;
      let sy = 1.0;
      const state = fighter.state;
      const t = fighter.animTimer;
      const p = fighter.currentAttackProgress || 0;

      if (state === 'IDLE') {
        // Idle breathing: organic chest & silhouette expansion/contraction
        const breath = Math.sin(t * 0.08) * 0.035;
        sx = 1.0 - breath * 0.5;
        sy = 1.0 + breath;
      } else if (state === 'WALK_FWD' || state === 'WALK_BACK') {
        // Stride footstep rhythm bounce
        const stride = Math.sin(t * 0.25) * 0.035;
        sx = 1.0 + stride;
        sy = 1.0 - stride;
      } else if (state === 'RUN') {
        // Dynamic forward lean compression
        const runBounce = Math.sin(t * 0.35) * 0.06;
        sx = 1.08 + runBounce;
        sy = 0.94 - runBounce;
      } else if (state === 'JUMP') {
        // Airborne launch stretch
        if (fighter.vy < -3) {
          sx = 0.90; sy = 1.14; // upward stretch
        } else {
          sx = 0.95; sy = 1.06;
        }
      } else if (state === 'FALL') {
        // Downward descent stretch
        sx = 0.94; sy = 1.08;
      } else if (state === 'LAND') {
        // Impact landing squash (fading over 5 frames)
        const landFactor = Math.max(0, 1 - (fighter.stateTimer / 6));
        sx = 1.0 + 0.22 * landFactor;
        sy = 1.0 - 0.20 * landFactor;
      } else if (state === 'CROUCH') {
        sx = 1.14; sy = 0.86;
      } else if (state.startsWith('ATTACK_')) {
        // Exaggerated 3-phase arcade timing: Anticipation coil -> Strike extension -> Recovery
        if (p < 0.30) {
          // Anticipation wind-up coil (compress horizontally, pull back)
          sx = 0.91; sy = 1.05;
        } else if (p < 0.68) {
          // Explosive strike extension (stretch forward)
          sx = 1.15; sy = 0.92;
        } else {
          // Recovery follow-through settling
          sx = 0.98; sy = 1.02;
        }
      } else if (state === 'BLOCK') {
        sx = 1.04; sy = 0.96;
      } else if (state === 'BLOCK_STUN') {
        // High frequency vibration shimmy
        const vib = Math.sin(t * 1.6) * 0.07;
        sx = 1.0 + vib;
        sy = 1.0 - vib;
      } else if (state === 'DODGE') {
        // Agile evasive slip & lean deformation
        sx = 0.88; sy = 1.10;
      } else if (state === 'HIT_LIGHT') {
        sx = 0.93; sy = 1.09;
      } else if (state === 'HIT_HEAVY' || state === 'KNOCKBACK') {
        // Heavy impact compression
        sx = 1.16; sy = 0.86;
      } else if (state === 'KNOCKDOWN') {
        sx = 1.20; sy = 0.80;
      } else if (state === 'GET_UP') {
        // Rising from the floor
        const getUpP = Math.min(1, fighter.stateTimer / 18);
        sx = 1.20 - 0.20 * getUpP;
        sy = 0.80 + 0.20 * getUpP;
      } else if (state === 'VICTORY') {
        const cheer = Math.sin(t * 0.1) * 0.03;
        sx = 0.97 - cheer;
        sy = 1.03 + cheer;
      } else if (state === 'DEFEAT') {
        sx = 1.15; sy = 0.85;
      }

      // Translate to fighter base position & apply scaling
      const scaleFactor = fighter.scale || (fighter.isBoss ? 1.48 : 1.0);
      ctx.translate(fighter.x, fighter.y);
      ctx.scale(fighter.facing * sx, sy);
      if (scaleFactor !== 1.0) ctx.scale(scaleFactor, scaleFactor);

      // Hit Flash (pure white silhouette on hit impact)
      const isFlashing = fighter.hitFlashTimer > 0;

      // Render character based on id
      if (fighter.id === 'Ardra') {
        this.drawArdra(ctx, fighter, isFlashing);
      } else if (fighter.id === 'RedOni') {
        this.drawRedOni(ctx, fighter, isFlashing);
      } else if (fighter.id === 'Rex') {
        this.drawRex(ctx, fighter, isFlashing);
      } else if (fighter.id === 'VoltMummy') {
        this.drawVoltMummy(ctx, fighter, isFlashing);
      } else if (fighter.id === 'Volt') {
        this.drawVolt(ctx, fighter, isFlashing);
      } else if (fighter.id === 'NoirDoll') {
        this.drawNoirDoll(ctx, fighter, isFlashing);
      } else if (fighter.id === 'JesterGhost') {
        this.drawJesterGhost(ctx, fighter, isFlashing);
      } else if (fighter.id === 'HornedDemon') {
        this.drawHornedDemon(ctx, fighter, isFlashing);
      } else {
        this.drawTitan(ctx, fighter, isFlashing);
      }

      ctx.restore();
    }

    // =========================================================================
    // 1. ARDRA - The Astral Stormblade (Image 2 Redesign)
    // High purple ponytail, crimson ninja face cowl/mask, diagonal Katana with red ribbon,
    // asymmetrical sarashi bandage & navy shinobi tunic, braided red rope obi with gold ring,
    // black tactical pleated skirt, navy cutout thigh-highs, combat boots, long tongue lash.
    // =========================================================================
    drawArdra(ctx, f, flash) {
      const state = f.state;
      const t = f.animTimer;
      const p = f.currentAttackProgress || 0;

      // Palette from Image 2
      const cHair = flash ? '#ffffff' : '#9c27b0';
      const cMask = flash ? '#ffffff' : '#e61a38';
      const cSkin = flash ? '#ffffff' : '#ffe0d0';
      const cWhiteWrap = flash ? '#ffffff' : '#f0f0f8';
      const cNavy = flash ? '#ffffff' : '#1a2a6c';
      const cObi = flash ? '#ffffff' : '#d61a3c';
      const cGold = flash ? '#ffffff' : '#f4c430';
      const cSkirt = flash ? '#ffffff' : '#202028';
      const cBoots = flash ? '#ffffff' : '#15151c';
      const cBlade = flash ? '#ffffff' : '#00f0ff';

      let bobY = 0;
      let torsoAngle = 0;
      let legL = { x1: -7, y1: -32, x2: -12, y2: 0 };
      let legR = { x1: 7, y1: -32, x2: 12, y2: 0 };
      let armL = { x: -14, y: -48, angle: 0.3 };
      let armR = { x: 14, y: -46, angle: -0.3 };
      let hairSway = Math.sin(t * 0.15) * 5;
      let ribbonSway = Math.sin(t * 0.2) * 10;
      let isKatanaDrawn = false;
      let showKickTrail = false;

      // Complete 22 Animation State Poses
      if (state === 'IDLE') {
        bobY = Math.sin(t * 0.1) * 2.5;
        armL.angle = -0.3 + Math.sin(t * 0.1) * 0.1;
        armR.angle = 0.4 + Math.cos(t * 0.1) * 0.1;
      } else if (state === 'WALK_FWD') {
        const walkCycle = Math.sin(t * 0.25);
        bobY = Math.abs(walkCycle) * -3;
        legL = { x1: -6, y1: -32, x2: -12 + walkCycle * 14, y2: 0 };
        legR = { x1: 6, y1: -32, x2: 10 - walkCycle * 14, y2: 0 };
        torsoAngle = 0.1;
        ribbonSway = -16 + Math.sin(t * 0.3) * 8;
      } else if (state === 'WALK_BACK') {
        const walkCycle = Math.sin(t * 0.2);
        legL = { x1: -6, y1: -32, x2: -10 - walkCycle * 10, y2: 0 };
        legR = { x1: 6, y1: -32, x2: 8 + walkCycle * 10, y2: 0 };
        torsoAngle = -0.08;
      } else if (state === 'RUN') {
        const runCycle = Math.sin(t * 0.35);
        bobY = Math.abs(runCycle) * -4;
        legL = { x1: -8, y1: -32, x2: -14 + runCycle * 22, y2: 0 };
        legR = { x1: 8, y1: -32, x2: 14 - runCycle * 22, y2: 0 };
        torsoAngle = 0.38;
        hairSway = -24;
        ribbonSway = -35 + Math.sin(t * 0.4) * 10;
        armL.angle = -0.8 + runCycle * 0.8;
        armR.angle = 0.8 - runCycle * 0.8;
      } else if (state === 'CROUCH') {
        bobY = 18;
        torsoAngle = 0.25;
        legL = { x1: -12, y1: -18, x2: -20, y2: 0 };
        legR = { x1: 6, y1: -18, x2: 12, y2: 0 };
        armR.angle = -0.6;
      } else if (state === 'JUMP') {
        bobY = -6;
        legL = { x1: -8, y1: -36, x2: -12, y2: -14 };
        legR = { x1: 6, y1: -36, x2: 10, y2: -10 };
        armL.angle = -1.2;
        armR.angle = -1.0;
        hairSway = 14;
      } else if (state === 'FALL') {
        bobY = 0;
        legL = { x1: -7, y1: -34, x2: -10, y2: -4 };
        legR = { x1: 7, y1: -34, x2: 10, y2: -4 };
        armL.angle = -0.7;
        armR.angle = 0.6;
        hairSway = 18;
      } else if (state === 'LAND') {
        bobY = 16;
        torsoAngle = 0.42;
        legL = { x1: -12, y1: -18, x2: -18, y2: 0 };
        legR = { x1: 6, y1: -18, x2: 14, y2: 0 };
        armL = { x: -8, y: -24, angle: 1.1 };
        armR = { x: 12, y: -24, angle: 1.2 };
      } else if (state === 'ATTACK_LIGHT') {
        isKatanaDrawn = true;
        if (p < 0.28) {
          // Anticipation coil
          torsoAngle = -0.15;
          armR.angle = -1.8;
          armR.x = -6;
          armL.angle = -0.5;
        } else if (p <= 0.65) {
          // Lightning horizontal slash
          torsoAngle = 0.25;
          armR.angle = 1.35;
          armR.x = 26;
          armL.angle = -0.7;
        } else {
          // Sheathe recovery
          torsoAngle = 0.08;
          armR.angle = 0.8;
          armR.x = 16;
        }
      } else if (state === 'ATTACK_HEAVY') {
        isKatanaDrawn = true;
        if (p < 0.35) {
          // Overhead windup
          torsoAngle = -0.25;
          bobY = -6;
          armR.angle = -2.6;
          armL.angle = -2.4;
          armR.x = 2;
          armL.x = -6;
        } else if (p <= 0.70) {
          // Downward cleave
          torsoAngle = 0.45;
          bobY = 4;
          armR.angle = 1.6;
          armL.angle = 1.4;
          armR.x = 24;
          armL.x = 18;
        } else {
          // Heavy follow-through
          torsoAngle = 0.25;
          armR.angle = 1.1;
          armR.x = 16;
        }
      } else if (state === 'ATTACK_KICK') {
        if (p < 0.30) {
          // Pivot & chamber knee
          torsoAngle = -0.2;
          legR = { x1: 4, y1: -32, x2: 10, y2: -38 };
          legL = { x1: -6, y1: -32, x2: -10, y2: 0 };
          armL.angle = -0.9;
          armR.angle = -0.7;
        } else if (p <= 0.68) {
          // Explosive side thrust kick
          torsoAngle = -0.35;
          legR = { x1: 6, y1: -34, x2: 38, y2: -40 };
          legL = { x1: -6, y1: -32, x2: -16, y2: 0 };
          armL.angle = -1.1;
          armR.angle = -0.5;
          showKickTrail = true;
        } else {
          // Retract leg
          torsoAngle = -0.1;
          legR = { x1: 4, y1: -32, x2: 14, y2: -10 };
        }
      } else if (state === 'ATTACK_SPECIAL') {
        isKatanaDrawn = true;
        const spin = (t * 0.8) % (Math.PI * 2);
        torsoAngle = Math.sin(spin) * 0.3;
        armR.angle = spin;
        armL.angle = spin + Math.PI;
        ribbonSway = Math.cos(spin) * 22;
      } else if (state === 'ATTACK_SUPER') {
        torsoAngle = 0.28;
        armR.angle = -1.1;
        armL.angle = -0.9;
        hairSway = -24;
        ribbonSway = Math.sin(t * 1.5) * 25;
      } else if (state === 'BLOCK' || state === 'BLOCK_STUN') {
        torsoAngle = -0.15;
        armL.angle = -1.1;
        armR.angle = -0.9;
        armL.x = 8;
        armR.x = 12;
      } else if (state === 'HIT_LIGHT') {
        torsoAngle = -0.3;
        bobY = 4;
        armL.angle = -0.8;
        armR.angle = -0.4;
      } else if (state === 'HIT_HEAVY' || state === 'KNOCKBACK') {
        torsoAngle = -0.55;
        bobY = 8;
        armL.angle = -1.4;
        armR.angle = -1.2;
        hairSway = -16;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
        bobY = 0;
      } else if (state === 'GET_UP') {
        if (f.stateTimer < 9) {
          bobY = 14;
          torsoAngle = 0.45;
          legL = { x1: -12, y1: -16, x2: -18, y2: 0 };
          legR = { x1: 4, y1: -16, x2: 12, y2: 0 };
        } else {
          bobY = 6;
          torsoAngle = 0.2;
          armR.angle = -0.5;
        }
      } else if (state === 'VICTORY') {
        isKatanaDrawn = true;
        armR.angle = -1.6;
        armL.angle = 0.6;
        torsoAngle = -0.05;
        bobY = Math.sin(t * 0.08) * 1.5;
      } else if (state === 'DEFEAT') {
        ctx.rotate(-Math.PI / 2.2);
        bobY = 10;
      }

      ctx.translate(0, bobY);

      // 1. Diagonal Katana Sheathed on Back (when not drawn)
      if (!isKatanaDrawn) {
        ctx.save();
        ctx.translate(0, -48);
        ctx.rotate(-0.55);

        ctx.fillStyle = '#15151c';
        ctx.fillRect(-22, -3, 38, 6);
        ctx.strokeStyle = '#2d2d38';
        ctx.lineWidth = 1;
        ctx.strokeRect(-22, -3, 38, 6);

        ctx.fillStyle = cGold;
        ctx.fillRect(16, -6, 4, 12); // tsuba

        ctx.fillStyle = cHair;
        ctx.fillRect(20, -3, 16, 6); // hilt
        ctx.fillStyle = cGold;
        ctx.fillRect(36, -4, 3, 8); // pommel

        // Flowing crimson silk ribbon from pommel
        ctx.fillStyle = cMask;
        ctx.beginPath();
        ctx.moveTo(38, 0);
        ctx.quadraticCurveTo(48 + ribbonSway * 0.5, -12, 58 + ribbonSway, -8);
        ctx.lineTo(56 + ribbonSway, -4);
        ctx.quadraticCurveTo(46 + ribbonSway * 0.5, -8, 38, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 2. High Purple Ponytail (Back)
      ctx.fillStyle = cHair;
      ctx.beginPath();
      ctx.moveTo(-6, -70);
      ctx.quadraticCurveTo(-26 + hairSway, -74, -32 + hairSway * 1.3, -48);
      ctx.lineTo(-26 + hairSway * 1.3, -46);
      ctx.quadraticCurveTo(-20 + hairSway, -68, -2, -66);
      ctx.closePath();
      ctx.fill();

      // Stray hair lock
      ctx.strokeStyle = cHair;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-6, -68);
      ctx.quadraticCurveTo(-18 + hairSway * 0.8, -50, -16 + hairSway * 0.5, -34);
      ctx.stroke();

      // 3. Legs & Navy Cutout Thigh-High Stockings
      ctx.strokeStyle = cNavy;
      ctx.lineWidth = 7.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(legL.x1, legL.y1); ctx.lineTo(legL.x2, legL.y2); ctx.stroke();

      // Cutout slits revealing fair skin
      ctx.strokeStyle = cSkin;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const midLX = (legL.x1 + legL.x2) / 2;
      const midLY = (legL.y1 + legL.y2) / 2;
      ctx.moveTo(midLX - 3, midLY - 2); ctx.lineTo(midLX + 3, midLY - 2);
      ctx.moveTo(midLX - 3, midLY + 3); ctx.lineTo(midLX + 3, midLY + 3);
      ctx.stroke();

      // Right leg
      ctx.strokeStyle = cNavy;
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.moveTo(legR.x1, legR.y1); ctx.lineTo(legR.x2, legR.y2); ctx.stroke();

      ctx.strokeStyle = cSkin;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const midRX = (legR.x1 + legR.x2) / 2;
      const midRY = (legR.y1 + legR.y2) / 2;
      ctx.moveTo(midRX - 3, midRY - 2); ctx.lineTo(midRX + 3, midRY - 2);
      ctx.moveTo(midRX - 3, midRY + 3); ctx.lineTo(midRX + 3, midRY + 3);
      ctx.stroke();

      // Black combat boots
      ctx.fillStyle = cBoots;
      ctx.fillRect(legL.x2 - 4, legL.y2 - 6, 8, 6);
      ctx.fillRect(legR.x2 - 4, legR.y2 - 6, 8, 6);

      // Kick visual speed arc trail
      if (showKickTrail) {
        ctx.save();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(legR.x2 - 10, legR.y2, 18, -0.6, 0.6);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Torso, Asymmetrical Bodice & Pleated Skirt
      ctx.save();
      ctx.rotate(torsoAngle);

      // Bodice: White wrap right, Navy fabric left
      ctx.fillStyle = cWhiteWrap;
      ctx.fillRect(-10, -56, 10, 24);
      ctx.fillStyle = cNavy;
      ctx.fillRect(0, -56, 10, 24);

      // Black Pleated Tactical Skirt
      ctx.fillStyle = cSkirt;
      ctx.beginPath();
      ctx.moveTo(-11, -32);
      ctx.lineTo(11, -32);
      ctx.lineTo(14, -20);
      ctx.lineTo(-14, -20);
      ctx.closePath();
      ctx.fill();

      // Navy crest panel under skirt
      ctx.fillStyle = cNavy;
      ctx.fillRect(-3, -22, 6, 8);

      // Crimson Rope Obi Belt with Hanging Gold Ring
      ctx.fillStyle = cObi;
      ctx.fillRect(-12, -34, 24, 5);
      ctx.fillStyle = '#ff3355';
      ctx.fillRect(-2, -34, 4, 6);

      // Gold metal ring on hip
      ctx.strokeStyle = cGold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(8, -26, 4, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Head, Mask & Face
      ctx.fillStyle = cSkin;
      ctx.fillRect(-7, -74, 14, 15);

      // Hair Bangs
      ctx.fillStyle = cHair;
      ctx.fillRect(-8, -76, 16, 6);
      ctx.fillRect(-8, -73, 5, 8);

      // Cyan Anime Eyes
      ctx.fillStyle = flash ? '#fff' : '#00e5ff';
      ctx.fillRect(1, -70, 4, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, -70, 1.5, 1.5);

      // Crimson Ninja Face Mask / Cowl
      if (state !== 'ATTACK_SUPER') {
        ctx.fillStyle = cMask;
        ctx.beginPath();
        ctx.moveTo(-7, -66);
        ctx.lineTo(7, -66);
        ctx.lineTo(6, -56);
        ctx.lineTo(-6, -56);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#b80c25';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, -62); ctx.lineTo(6, -62);
        ctx.stroke();
      } else {
        // Mask pulled down during Super!
        ctx.fillStyle = cMask;
        ctx.fillRect(-6, -58, 12, 6);

        // Open mouth with sharp fangs
        ctx.fillStyle = '#110011';
        ctx.fillRect(3, -68, 8, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3, -68, 2, 2.5);
        ctx.fillRect(9, -68, 2, 2.5);
      }

      ctx.restore(); // end torso rotation

      // =========================================================================
      // ARDRA'S LONG TONGUE LASH ("Bitchy Timeee!!!")
      // =========================================================================
      if (state === 'ATTACK_SUPER') {
        ctx.save();
        const progress = p || 0.5;
        let tongueLen = 0;
        if (progress < 0.25) {
          tongueLen = (progress / 0.25) * 225;
        } else if (progress < 0.72) {
          tongueLen = 225 + Math.sin(t * 0.9) * 25;
        } else {
          tongueLen = Math.max(0, 225 * (1 - (progress - 0.72) / 0.28));
        }

        const wave1 = Math.sin(t * 0.65) * 18;
        const wave2 = Math.cos(t * 0.75) * 22;

        ctx.strokeStyle = '#ff0077';
        ctx.shadowColor = '#ff0077';
        ctx.shadowBlur = flash ? 0 : 20;
        ctx.lineWidth = 11;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(6, -63);
        ctx.bezierCurveTo(
          35, -63 + wave1,
          tongueLen * 0.55, -63 + wave2,
          tongueLen, -63 + wave1 * 0.5
        );
        ctx.stroke();

        ctx.strokeStyle = '#ff3388';
        ctx.lineWidth = 7;
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        const tipX = tongueLen;
        const tipY = -63 + wave1 * 0.5;

        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tipX + 3, tipY, 4, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 1; i <= 4; i++) {
          const segX = (tongueLen / 5) * i;
          const segY = -63 + Math.sin(t * 0.65 + i) * 14;
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(segX, segY - 6, 3, 0, Math.PI * 2);
          ctx.arc(segX, segY + 6, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 6. Left Arm
      ctx.save();
      ctx.translate(armL.x, armL.y);
      ctx.rotate(armL.angle);
      ctx.strokeStyle = cBoots;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(14, 8);
      ctx.stroke();
      ctx.fillStyle = cBlade;
      ctx.fillRect(8, 6, 6, 2.5);
      ctx.fillStyle = cHair;
      ctx.fillRect(12, 6, 4, 4);
      ctx.restore();

      // 7. Right Arm & Katana
      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cSkin;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(16, 4);
      ctx.stroke();

      ctx.strokeStyle = cHair;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(6, 2); ctx.lineTo(14, 4);
      ctx.stroke();

      if (isKatanaDrawn) {
        ctx.fillStyle = cGold;
        ctx.fillRect(14, 1, 5, 8);
        ctx.fillStyle = cHair;
        ctx.fillRect(10, 2, 5, 5);

        ctx.strokeStyle = cBlade;
        ctx.lineWidth = 5;
        ctx.shadowColor = cBlade;
        ctx.shadowBlur = flash ? 0 : 16;
        ctx.beginPath();
        ctx.moveTo(18, 5);
        ctx.lineTo(54, 9);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(18, 5);
        ctx.lineTo(52, 9);
        ctx.stroke();
      }
      ctx.restore();
    }

    // =========================================================================
    // 2. RED ONI - The Horned Brawler (Image 1 Center-Right)
    // Red skin, blue ponytail topknot, white forehead horns, pink open shirt,
    // gold Cuban chain, dark pants, heavy combat boots, giant stone/rock fists.
    // =========================================================================
    drawRedOni(ctx, f, flash) {
      const state = f.state;
      const t = f.animTimer;
      const p = f.currentAttackProgress || 0;

      const cSkin = flash ? '#ffffff' : '#e62020';
      const cHair = flash ? '#ffffff' : '#00b4d8';
      const cShirt = flash ? '#ffffff' : '#ff6699';
      const cGold = flash ? '#ffffff' : '#ffcc00';
      const cPants = flash ? '#ffffff' : '#1a1a24';

      let bobY = 0;
      let torsoAngle = 0;
      let legL = { x1: -10, y1: -34, x2: -16, y2: 0 };
      let legR = { x1: 10, y1: -34, x2: 16, y2: 0 };
      let armL = { x: -14, y: -48, angle: 0.6 };
      let armR = { x: 14, y: -48, angle: -0.4 };
      let showKickTrail = false;

      // Complete 22 Animation State Poses for Red Oni
      if (state === 'IDLE') {
        bobY = Math.sin(t * 0.12) * 3;
        armL.angle = 0.5 + Math.sin(t * 0.12) * 0.15;
        armR.angle = -0.4 + Math.cos(t * 0.12) * 0.15;
      } else if (state === 'WALK_FWD') {
        const cycle = Math.sin(t * 0.28);
        bobY = Math.abs(cycle) * -3;
        legL = { x1: -8, y1: -34, x2: -14 + cycle * 16, y2: 0 };
        legR = { x1: 8, y1: -34, x2: 12 - cycle * 16, y2: 0 };
        torsoAngle = 0.12;
      } else if (state === 'WALK_BACK') {
        const cycle = Math.sin(t * 0.22);
        legL = { x1: -8, y1: -34, x2: -12 - cycle * 12, y2: 0 };
        legR = { x1: 8, y1: -34, x2: 12 + cycle * 12, y2: 0 };
        torsoAngle = -0.1;
        armL.angle = -0.8;
        armR.angle = -0.6;
      } else if (state === 'RUN') {
        const runCycle = Math.sin(t * 0.35);
        bobY = Math.abs(runCycle) * -4;
        legL = { x1: -10, y1: -34, x2: -16 + runCycle * 20, y2: 0 };
        legR = { x1: 10, y1: -34, x2: 16 - runCycle * 20, y2: 0 };
        torsoAngle = 0.36;
        armL.angle = -0.9 + runCycle * 0.9;
        armR.angle = 0.9 - runCycle * 0.9;
      } else if (state === 'CROUCH') {
        bobY = 18;
        torsoAngle = 0.3;
        legL = { x1: -14, y1: -18, x2: -24, y2: 0 };
        legR = { x1: 8, y1: -18, x2: 14, y2: 0 };
      } else if (state === 'JUMP') {
        bobY = -8;
        legL = { x1: -10, y1: -38, x2: -14, y2: -16 };
        legR = { x1: 8, y1: -38, x2: 12, y2: -12 };
        armL.angle = -1.1;
        armR.angle = -0.9;
      } else if (state === 'FALL') {
        bobY = 0;
        legL = { x1: -8, y1: -34, x2: -12, y2: -4 };
        legR = { x1: 8, y1: -34, x2: 12, y2: -4 };
        armL.angle = 0.6;
        armR.angle = 0.7;
      } else if (state === 'LAND') {
        bobY = 16;
        torsoAngle = 0.35;
        legL = { x1: -14, y1: -20, x2: -24, y2: 0 };
        legR = { x1: 10, y1: -20, x2: 20, y2: 0 };
        armL.angle = 1.1;
        armR.angle = 1.1;
      } else if (state === 'ATTACK_LIGHT') {
        if (p < 0.28) {
          torsoAngle = -0.15;
          armR.angle = -1.8;
          armR.x = 4;
        } else if (p <= 0.65) {
          torsoAngle = 0.25;
          armR.angle = 1.4;
          armR.x = 28;
        } else {
          torsoAngle = 0.1;
          armR.angle = 0.8;
          armR.x = 18;
        }
      } else if (state === 'ATTACK_HEAVY') {
        if (p < 0.35) {
          torsoAngle = -0.28;
          bobY = -5;
          armR.angle = -2.4;
          armR.x = 6;
        } else if (p <= 0.70) {
          torsoAngle = 0.45;
          bobY = 4;
          armR.angle = 1.6;
          armR.x = 30;
        } else {
          torsoAngle = 0.2;
          armR.angle = 1.0;
          armR.x = 18;
        }
      } else if (state === 'ATTACK_KICK') {
        if (p < 0.30) {
          torsoAngle = -0.2;
          legR = { x1: 6, y1: -32, x2: 12, y2: -36 };
          legL = { x1: -8, y1: -34, x2: -12, y2: 0 };
        } else if (p <= 0.68) {
          torsoAngle = -0.32;
          legR = { x1: 8, y1: -34, x2: 36, y2: -36 };
          legL = { x1: -8, y1: -34, x2: -18, y2: 0 };
          showKickTrail = true;
        } else {
          torsoAngle = -0.1;
          legR = { x1: 6, y1: -32, x2: 14, y2: -8 };
        }
      } else if (state === 'ATTACK_SPECIAL') {
        torsoAngle = 0.55;
        bobY = 14;
        armR.angle = 1.7;
        armL.angle = 1.7;
        armR.x = 24;
        armL.x = 16;
      } else if (state === 'ATTACK_SUPER') {
        if (f.stateTimer < 40) {
          torsoAngle = -0.18;
          armR.angle = 1.4;
          armR.x = 26;
          armL.angle = -1.2;
          armL.x = -8;
        } else {
          torsoAngle = 0.45;
          armR.angle = 1.6;
          armR.x = 44;
          armL.angle = -0.8;
          armL.x = -14;
        }
      } else if (state === 'BLOCK' || state === 'BLOCK_STUN') {
        torsoAngle = -0.15;
        armL.angle = -1.2;
        armR.angle = -1.0;
        armL.x = 8;
        armR.x = 14;
      } else if (state === 'HIT_LIGHT') {
        torsoAngle = -0.35;
        bobY = 4;
        armL.angle = -0.7;
        armR.angle = -0.5;
      } else if (state === 'HIT_HEAVY' || state === 'KNOCKBACK') {
        torsoAngle = -0.52;
        bobY = 8;
        armL.angle = -1.3;
        armR.angle = -1.1;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
        bobY = 0;
      } else if (state === 'GET_UP') {
        if (f.stateTimer < 9) {
          bobY = 14;
          torsoAngle = 0.45;
        } else {
          bobY = 6;
          torsoAngle = 0.2;
        }
      } else if (state === 'VICTORY') {
        armR.angle = -2.1;
        armL.angle = -2.1;
        torsoAngle = -0.1;
        bobY = Math.sin(t * 0.1) * 2;
      } else if (state === 'DEFEAT') {
        ctx.rotate(-Math.PI / 2.2);
        bobY = 10;
      }

      ctx.translate(0, bobY);

      // Blue Ponytail Topknot
      ctx.fillStyle = cHair;
      ctx.beginPath();
      ctx.arc(8, -78, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(4, -86, 8, 12);

      // Pants & Legs
      ctx.strokeStyle = cPants;
      ctx.lineWidth = 11;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(legL.x1, legL.y1); ctx.lineTo(legL.x2, legL.y2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(legR.x1, legR.y1); ctx.lineTo(legR.x2, legR.y2); ctx.stroke();

      // Heavy combat boots
      ctx.fillStyle = '#111';
      ctx.fillRect(legL.x2 - 5, legL.y2 - 8, 10, 8);
      ctx.fillRect(legR.x2 - 5, legR.y2 - 8, 10, 8);

      // Kick visual shock trail
      if (showKickTrail) {
        ctx.save();
        ctx.strokeStyle = '#ff3300';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(legR.x2 - 10, legR.y2, 16, -0.6, 0.6);
        ctx.stroke();
        ctx.restore();
      }

      // Torso & Open Pink Hawaiian Shirt
      ctx.save();
      ctx.rotate(torsoAngle);
      // Red Muscular Chest
      ctx.fillStyle = cSkin;
      ctx.fillRect(-12, -58, 24, 28);
      // Pink Hawaiian Shirt
      ctx.fillStyle = cShirt;
      ctx.fillRect(-14, -58, 7, 26);
      ctx.fillRect(7, -58, 7, 26);

      // Gold Cuban Chain
      ctx.strokeStyle = cGold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -52, 7, 0, Math.PI);
      ctx.stroke();

      // Red Oni Head & White Forehead Horns
      ctx.fillStyle = cSkin;
      ctx.fillRect(-11, -74, 22, 18);
      // White Forehead Horns
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-9, -74); ctx.lineTo(-14, -86); ctx.lineTo(-5, -74); ctx.closePath();
      ctx.moveTo(9, -74); ctx.lineTo(14, -86); ctx.lineTo(5, -74); ctx.closePath();
      ctx.fill();

      // Fierce Eyes & Scowl
      ctx.fillStyle = '#111';
      ctx.fillRect(-7, -70, 5, 4);
      ctx.fillRect(2, -70, 5, 4);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(-5, -69, 2, 2);
      ctx.fillRect(4, -69, 2, 2);
      ctx.restore();

      // Left Arm & Stone Fist
      ctx.save();
      ctx.translate(armL.x, armL.y);
      ctx.rotate(armL.angle);
      ctx.strokeStyle = cSkin;
      ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18, 6); ctx.stroke();
      ctx.fillStyle = '#cc1818';
      ctx.fillRect(14, 0, 14, 14);
      ctx.restore();

      // Right Arm & Giant Stone Fist
      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cSkin;
      ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, 6); ctx.stroke();
      ctx.fillStyle = '#cc1818';
      ctx.fillRect(18, -2, 16, 16);
      ctx.restore();

      // =========================================================================
      // DEMON CHAIN BUSTER - Glowing Spiked Chain Harpoon & Flaming Stone Punch
      // =========================================================================
      if (state === 'ATTACK_SUPER') {
        ctx.save();
        const chainY = -50;
        const opponentDist = f.caughtOpponent ? (f.caughtOpponent.x - f.x) * f.facing : null;
        let chainLen = 0;
        if (opponentDist !== null) {
          chainLen = Math.max(30, opponentDist);
        } else {
          const launchP = Math.min(1.0, Math.max(0, (f.stateTimer - 8) / 16));
          if (f.stateTimer < 24) {
            chainLen = launchP * 210;
          } else if (f.stateTimer < 48) {
            chainLen = 210;
          } else {
            chainLen = Math.max(0, 210 * (1 - (f.stateTimer - 48) / 26));
          }
        }

        if (chainLen > 15) {
          // Draw heavy spiked iron/gold chain links
          const linkSpacing = 14;
          const numLinks = Math.floor(chainLen / linkSpacing);

          ctx.shadowColor = '#ffaa00';
          ctx.shadowBlur = flash ? 0 : 12;

          for (let i = 1; i <= numLinks; i++) {
            const lx = i * linkSpacing;
            const linkSag = Math.sin((i / numLinks) * Math.PI) * (f.caughtOpponent ? 4 : 8);
            const ly = chainY + linkSag;

            ctx.strokeStyle = (i % 2 === 0) ? '#ffcc00' : '#8899aa';
            ctx.lineWidth = 4;
            ctx.strokeRect(lx - 6, ly - 4, 10, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(lx - 2, ly - 2, 3, 3);
          }

          // Chain barb / harpoon hook at tip
          const tipX = chainLen;
          const tipY = chainY;
          ctx.fillStyle = '#ff3300';
          ctx.beginPath();
          ctx.moveTo(tipX + 16, tipY);
          ctx.lineTo(tipX - 4, tipY - 9);
          ctx.lineTo(tipX + 2, tipY);
          ctx.lineTo(tipX - 4, tipY + 9);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 2;
          ctx.stroke();

          // If hero is caught, draw binding chain wrapping around target
          if (f.caughtOpponent) {
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(tipX, tipY + 6, 16, 26, 0.2, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // At frame 40+ (Punch execution), draw massive flaming stone fist forward
        if (f.stateTimer >= 40) {
          const punchP = Math.min(1.0, (f.stateTimer - 40) / 10);
          const fistX = 32 + punchP * 18;
          ctx.save();
          ctx.shadowColor = '#ff2200';
          ctx.shadowBlur = 25;
          // Blazing flame aura
          ctx.fillStyle = 'rgba(255, 68, 0, 0.45)';
          ctx.beginPath();
          ctx.arc(fistX + 8, chainY, 28, 0, Math.PI * 2);
          ctx.fill();
          // Fiery burst rays
          ctx.strokeStyle = '#ffdd00';
          ctx.lineWidth = 3;
          for (let a = 0; a < 6; a++) {
            const angle = (a / 6) * Math.PI * 2 + f.animTimer * 0.2;
            ctx.beginPath();
            ctx.moveTo(fistX + 8 + Math.cos(angle) * 14, chainY + Math.sin(angle) * 14);
            ctx.lineTo(fistX + 8 + Math.cos(angle) * 32, chainY + Math.sin(angle) * 32);
            ctx.stroke();
          }
          ctx.restore();
        }

        ctx.restore();
      }
    }

    // =========================================================================
    // 3. REX - The Iron Brawler
    // Heavy street brawler, red vest, spikes, glowing bionic gauntlets
    // =========================================================================
    drawRex(ctx, f, flash) {
      const state = f.state;
      const t = f.animTimer;
      const p = f.currentAttackProgress || 0;

      const cVest = flash ? '#ffffff' : '#cc2233';
      const cPants = flash ? '#ffffff' : '#1c202a';
      const cSkin = flash ? '#ffffff' : '#f5be98';
      const cGauntlet = flash ? '#ffffff' : '#ff9900';
      const cGlow = flash ? '#ffffff' : '#ffdd00';

      let bobY = 0;
      let torsoAngle = 0;
      let legL = { x1: -10, y1: -34, x2: -16, y2: 0 };
      let legR = { x1: 10, y1: -34, x2: 16, y2: 0 };
      let armL = { x: -14, y: -48, angle: 0.6 };
      let armR = { x: 14, y: -48, angle: -0.4 };

      if (state === 'IDLE') {
        bobY = Math.sin(t * 0.12) * 3;
        armL.angle = 0.5 + Math.sin(t * 0.12) * 0.15;
        armR.angle = -0.4 + Math.cos(t * 0.12) * 0.15;
      } else if (state === 'WALK_FWD') {
        const cycle = Math.sin(t * 0.28);
        bobY = Math.abs(cycle) * -3;
        legL = { x1: -8, y1: -34, x2: -14 + cycle * 16, y2: 0 };
        legR = { x1: 8, y1: -34, x2: 12 - cycle * 16, y2: 0 };
        torsoAngle = 0.12;
      } else if (state === 'WALK_BACK') {
        const cycle = Math.sin(t * 0.22);
        legL = { x1: -8, y1: -34, x2: -12 - cycle * 12, y2: 0 };
        legR = { x1: 8, y1: -34, x2: 12 + cycle * 12, y2: 0 };
        torsoAngle = -0.1;
      } else if (state === 'RUN') {
        const runCycle = Math.sin(t * 0.35);
        bobY = Math.abs(runCycle) * -4;
        legL = { x1: -10, y1: -34, x2: -16 + runCycle * 20, y2: 0 };
        legR = { x1: 10, y1: -34, x2: 16 - runCycle * 20, y2: 0 };
        torsoAngle = 0.36;
        armL.angle = -0.9 + runCycle * 0.9;
        armR.angle = 0.9 - runCycle * 0.9;
      } else if (state === 'CROUCH') {
        bobY = 18;
        torsoAngle = 0.3;
        legL = { x1: -14, y1: -18, x2: -24, y2: 0 };
        legR = { x1: 8, y1: -18, x2: 14, y2: 0 };
      } else if (state === 'JUMP') {
        bobY = -8;
        legL = { x1: -10, y1: -38, x2: -14, y2: -16 };
        legR = { x1: 8, y1: -38, x2: 14, y2: -12 };
      } else if (state === 'FALL') {
        bobY = 0;
        legL = { x1: -8, y1: -34, x2: -12, y2: -4 };
        legR = { x1: 8, y1: -34, x2: 12, y2: -4 };
      } else if (state === 'LAND') {
        bobY = 16;
        torsoAngle = 0.35;
        legL = { x1: -14, y1: -20, x2: -24, y2: 0 };
        legR = { x1: 10, y1: -20, x2: 20, y2: 0 };
      } else if (state === 'ATTACK_LIGHT') {
        torsoAngle = 0.2;
        armR.angle = 1.4;
        armR.x = 22;
      } else if (state === 'ATTACK_HEAVY') {
        torsoAngle = 0.4;
        armR.angle = -1.2 + p * 3.5;
        armR.x = 10 + Math.sin(p * Math.PI) * 26;
      } else if (state === 'ATTACK_KICK') {
        torsoAngle = -0.3;
        legR = { x1: 8, y1: -34, x2: 34, y2: -36 };
      } else if (state === 'ATTACK_SPECIAL') {
        torsoAngle = 0.6;
        bobY = 12;
        armR.angle = 1.6;
        armR.x = 24;
      } else if (state === 'ATTACK_SUPER') {
        torsoAngle = 0.45;
        armR.angle = 1.5;
        armR.x = 32;
        armL.angle = -1.0;
      } else if (state === 'BLOCK' || state === 'BLOCK_STUN') {
        armL.angle = -0.9;
        armR.angle = -0.7;
        armL.x = 8;
        armR.x = 14;
        torsoAngle = -0.15;
      } else if (state === 'HIT_LIGHT' || state === 'HIT_HEAVY' || state === 'KNOCKBACK') {
        torsoAngle = -0.45;
        bobY = 6;
        armL.angle = -1.2;
        armR.angle = -1.0;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
      } else if (state === 'GET_UP') {
        bobY = f.stateTimer < 9 ? 14 : 6;
        torsoAngle = f.stateTimer < 9 ? 0.4 : 0.2;
      } else if (state === 'VICTORY') {
        armR.angle = -2.1;
        torsoAngle = -0.1;
      } else if (state === 'DEFEAT') {
        ctx.rotate(-Math.PI / 2.2);
        bobY = 8;
      }

      ctx.translate(0, bobY);

      // Legs
      ctx.strokeStyle = cPants;
      ctx.lineWidth = 11;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(legL.x1, legL.y1); ctx.lineTo(legL.x2, legL.y2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(legR.x1, legR.y1); ctx.lineTo(legR.x2, legR.y2); ctx.stroke();

      // Heavy boots
      ctx.fillStyle = '#111';
      ctx.fillRect(legL.x2 - 5, legL.y2 - 8, 10, 8);
      ctx.fillRect(legR.x2 - 5, legR.y2 - 8, 10, 8);

      // Torso & Red Brawler Vest
      ctx.save();
      ctx.rotate(torsoAngle);
      ctx.fillStyle = cSkin;
      ctx.fillRect(-12, -58, 24, 28);
      ctx.fillStyle = cVest;
      ctx.fillRect(-14, -58, 7, 28);
      ctx.fillRect(7, -58, 7, 28);

      // Belt
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(-13, -33, 26, 5);

      // Head & Spiky Hair
      ctx.fillStyle = cSkin;
      ctx.fillRect(-8, -74, 16, 16);
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.moveTo(-10, -74);
      ctx.lineTo(-6, -84);
      ctx.lineTo(0, -74);
      ctx.lineTo(4, -86);
      ctx.lineTo(8, -74);
      ctx.lineTo(12, -82);
      ctx.lineTo(10, -72);
      ctx.closePath();
      ctx.fill();

      // Intense eyes
      ctx.fillStyle = flash ? '#fff' : '#ff2200';
      ctx.fillRect(2, -70, 4, 3);
      ctx.restore();

      // Left Arm & Gauntlet
      ctx.save();
      ctx.translate(armL.x, armL.y);
      ctx.rotate(armL.angle);
      ctx.strokeStyle = cSkin;
      ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(16, 6); ctx.stroke();
      ctx.fillStyle = cGauntlet;
      ctx.fillRect(10, 0, 14, 12);
      ctx.restore();

      // Right Arm & Massive Bionic Gauntlet
      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cSkin;
      ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18, 6); ctx.stroke();
      ctx.fillStyle = cGauntlet;
      ctx.fillRect(12, -2, 18, 16);
      ctx.fillStyle = cGlow;
      ctx.shadowColor = cGlow;
      ctx.shadowBlur = flash ? 0 : 12;
      ctx.fillRect(16, 2, 10, 4);
      ctx.fillRect(16, 8, 10, 3);
      ctx.restore();
    }

    // =========================================================================
    // 4. VOLT MUMMY - The Battery Punk (Image 1 Center)
    // Bandage wraps, wild spiky blonde hair, yellow battery backpack with terminals,
    // cartoon crazy tracking eyes, electric spark mug, dynamic limbs and bandages.
    // =========================================================================
    drawVoltMummy(ctx, f, flash) {
      const state = f.state;
      const t = f.animTimer;
      const p = f.currentAttackProgress || 0;

      const cBandage = flash ? '#ffffff' : '#eee5d5';
      const cHair = flash ? '#ffffff' : '#ffea00';
      const cBattery = flash ? '#ffffff' : '#f5be00';
      const cSpark = flash ? '#ffffff' : '#00f0ff';

      let bobY = 0;
      let torsoAngle = 0;
      let legL = { x1: -6, y1: -30, x2: -12, y2: 0 };
      let legR = { x1: 6, y1: -30, x2: 12, y2: 0 };
      let armL = { x: -12, y: -46, angle: -0.3 };
      let armR = { x: 12, y: -46, angle: 0.3 };
      let hairOffset = Math.sin(t * 0.3) * 4;
      let showKickTrail = false;

      // Complete 22 Animation States for Volt Mummy
      if (state === 'IDLE') {
        bobY = Math.sin(t * 0.16) * 3;
        armR.angle = 0.3 + Math.sin(t * 0.2) * 0.15;
        armL.angle = -0.3 + Math.cos(t * 0.2) * 0.15;
      } else if (state === 'WALK_FWD') {
        const cycle = Math.sin(t * 0.28);
        bobY = Math.abs(cycle) * -3;
        legL = { x1: -6, y1: -30, x2: -12 + cycle * 14, y2: 0 };
        legR = { x1: 6, y1: -30, x2: 10 - cycle * 14, y2: 0 };
        torsoAngle = 0.12;
      } else if (state === 'WALK_BACK') {
        const cycle = Math.sin(t * 0.22);
        legL = { x1: -6, y1: -30, x2: -10 - cycle * 10, y2: 0 };
        legR = { x1: 6, y1: -30, x2: 8 + cycle * 10, y2: 0 };
        torsoAngle = -0.1;
      } else if (state === 'RUN') {
        const runCycle = Math.sin(t * 0.38);
        bobY = Math.abs(runCycle) * -4;
        legL = { x1: -8, y1: -30, x2: -14 + runCycle * 22, y2: 0 };
        legR = { x1: 8, y1: -30, x2: 12 - runCycle * 22, y2: 0 };
        torsoAngle = 0.40;
        hairOffset = -22;
        armR.angle = -1.1;
        armL.angle = 1.1;
      } else if (state === 'CROUCH') {
        bobY = 18;
        torsoAngle = 0.3;
        legL = { x1: -12, y1: -16, x2: -20, y2: 0 };
        legR = { x1: 6, y1: -16, x2: 12, y2: 0 };
      } else if (state === 'JUMP') {
        bobY = -7;
        legL = { x1: -6, y1: -34, x2: -12, y2: -14 };
        legR = { x1: 6, y1: -34, x2: 10, y2: -10 };
        armR.angle = -1.3;
        armL.angle = -1.2;
      } else if (state === 'FALL') {
        bobY = 0;
        legL = { x1: -6, y1: -30, x2: -10, y2: -4 };
        legR = { x1: 6, y1: -30, x2: 10, y2: -4 };
        armR.angle = 0.8;
        armL.angle = -0.8;
        hairOffset = 18;
      } else if (state === 'LAND') {
        bobY = 16;
        torsoAngle = 0.4;
        legL = { x1: -12, y1: -18, x2: -20, y2: 0 };
        legR = { x1: 8, y1: -18, x2: 14, y2: 0 };
      } else if (state === 'ATTACK_LIGHT') {
        if (p < 0.28) {
          torsoAngle = -0.15;
          armR.angle = -1.6;
          armR.x = 2;
        } else if (p <= 0.65) {
          torsoAngle = 0.22;
          armR.angle = 1.35;
          armR.x = 26;
        } else {
          torsoAngle = 0.08;
          armR.angle = 0.7;
          armR.x = 16;
        }
      } else if (state === 'ATTACK_HEAVY') {
        if (p < 0.35) {
          torsoAngle = -0.25;
          armR.angle = -2.3;
          armL.angle = -2.1;
        } else if (p <= 0.70) {
          torsoAngle = 0.45;
          armR.angle = 1.5;
          armL.angle = 1.3;
          armR.x = 28;
        } else {
          torsoAngle = 0.15;
          armR.angle = 0.9;
        }
      } else if (state === 'ATTACK_KICK') {
        if (p < 0.30) {
          torsoAngle = -0.18;
          legR = { x1: 4, y1: -28, x2: 10, y2: -34 };
        } else if (p <= 0.68) {
          torsoAngle = -0.30;
          legR = { x1: 6, y1: -30, x2: 34, y2: -36 };
          showKickTrail = true;
        } else {
          torsoAngle = -0.1;
          legR = { x1: 4, y1: -28, x2: 12, y2: -8 };
        }
      } else if (state === 'ATTACK_SPECIAL') {
        torsoAngle = 0.3;
        armR.angle = 1.4;
        armR.x = 26;
      } else if (state === 'ATTACK_SUPER') {
        torsoAngle = 0.1;
        armR.angle = -1.8;
        armL.angle = -1.8;
      } else if (state === 'BLOCK' || state === 'BLOCK_STUN') {
        torsoAngle = -0.15;
        armL.angle = -1.1;
        armR.angle = -0.9;
        armL.x = 6;
        armR.x = 12;
      } else if (state === 'HIT_LIGHT') {
        torsoAngle = -0.35;
        bobY = 4;
        armR.angle = -0.8;
      } else if (state === 'HIT_HEAVY' || state === 'KNOCKBACK') {
        torsoAngle = -0.55;
        bobY = 8;
        armR.angle = -1.4;
        armL.angle = -1.2;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
        bobY = 0;
      } else if (state === 'GET_UP') {
        bobY = f.stateTimer < 9 ? 14 : 6;
        torsoAngle = f.stateTimer < 9 ? 0.45 : 0.2;
      } else if (state === 'VICTORY') {
        armR.angle = -2.2;
        torsoAngle = -0.1;
        bobY = Math.sin(t * 0.15) * 3;
      } else if (state === 'DEFEAT') {
        ctx.rotate(-Math.PI / 2.2);
        bobY = 10;
      }

      ctx.translate(0, bobY);

      // Battery Backpack on Back
      ctx.fillStyle = cBattery;
      ctx.fillRect(-22, -62, 14, 30);
      ctx.fillStyle = '#111';
      ctx.fillRect(-18, -66, 6, 4); // terminal
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(-20, -52, 10, 12); // green volt sticker

      // Mummy Bandaged Legs
      ctx.strokeStyle = cBandage;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(legL.x1, legL.y1); ctx.lineTo(legL.x2, legL.y2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(legR.x1, legR.y1); ctx.lineTo(legR.x2, legR.y2); ctx.stroke();

      // Bandage wrappings knee detail
      ctx.fillStyle = '#d4cbb8';
      ctx.fillRect(legL.x2 - 4, legL.y2 - 6, 8, 6);
      ctx.fillRect(legR.x2 - 4, legR.y2 - 6, 8, 6);

      // Electric spark kick arc
      if (showKickTrail) {
        ctx.save();
        ctx.strokeStyle = cSpark;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = cSpark;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(legR.x2 - 8, legR.y2, 16, -0.6, 0.6);
        ctx.stroke();
        ctx.restore();
      }

      // Bandaged Torso
      ctx.save();
      ctx.rotate(torsoAngle);
      ctx.fillStyle = cBandage;
      ctx.fillRect(-10, -54, 20, 26);

      // Loose bandage fluttering off hip
      ctx.strokeStyle = cBandage;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -32);
      ctx.quadraticCurveTo(-18 + Math.sin(t * 0.3) * 6, -30, -22, -26);
      ctx.stroke();

      // Wild Spiky Blonde Hair exploding on top
      ctx.fillStyle = cHair;
      ctx.beginPath();
      ctx.moveTo(-14, -72);
      ctx.lineTo(-20 + hairOffset, -96);
      ctx.lineTo(-8, -80);
      ctx.lineTo(2 + hairOffset, -100);
      ctx.lineTo(8, -82);
      ctx.lineTo(18 + hairOffset, -94);
      ctx.lineTo(14, -72);
      ctx.closePath();
      ctx.fill();

      // Bandaged Head
      ctx.fillStyle = cBandage;
      ctx.fillRect(-9, -74, 18, 18);

      // Crazy Cartoon Eyes with tracking pupils
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -66, 5, 0, Math.PI * 2);
      ctx.arc(4, -66, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-4 + Math.sin(t * 0.2) * 1.5, -66, 2.2, 0, Math.PI * 2);
      ctx.arc(4 + Math.sin(t * 0.2) * 1.5, -66, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Left Arm
      ctx.save();
      ctx.translate(armL.x, armL.y);
      ctx.rotate(armL.angle);
      ctx.strokeStyle = cBandage;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, 6); ctx.stroke();
      ctx.restore();

      // Right Arm & Electric Spark Mug
      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cBandage;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(16, 4); ctx.stroke();
      // Green lightning spark mug
      ctx.fillStyle = '#00bb55';
      ctx.fillRect(14, -4, 12, 14);
      ctx.fillStyle = cSpark;
      ctx.shadowColor = cSpark;
      ctx.shadowBlur = flash ? 0 : 10;
      ctx.fillRect(16, 0, 8, 6);
      ctx.restore();
    }

    // =========================================================================
    // 5. VOLT - The Cyber Spark
    // Electric cyborg, sleek visor, conduit lines, electric arcing
    // =========================================================================
    drawVolt(ctx, f, flash) {
      const state = f.state;
      const t = f.animTimer;
      const p = f.currentAttackProgress || 0;

      const cSuit = flash ? '#ffffff' : '#0e1e38';
      const cArmor = flash ? '#ffffff' : '#e0eaff';
      const cElectric = flash ? '#ffffff' : '#00f0ff';
      const cVisor = flash ? '#ffffff' : '#ffea00';

      let bobY = 0;
      let torsoAngle = 0;
      let legL = { x1: -8, y1: -32, x2: -14, y2: 0 };
      let legR = { x1: 8, y1: -32, x2: 12, y2: 0 };
      let armL = { x: -12, y: -46, angle: 0.3 };
      let armR = { x: 12, y: -46, angle: -0.2 };

      if (state === 'IDLE') {
        bobY = Math.sin(t * 0.15) * 2;
        armL.angle = 0.2 + Math.sin(t * 0.15) * 0.2;
        armR.angle = -0.2 + Math.cos(t * 0.15) * 0.2;
      } else if (state === 'WALK_FWD') {
        const cycle = Math.sin(t * 0.3);
        legL = { x1: -6, y1: -32, x2: -12 + cycle * 14, y2: 0 };
        legR = { x1: 6, y1: -32, x2: 10 - cycle * 14, y2: 0 };
        torsoAngle = 0.15;
      } else if (state === 'WALK_BACK') {
        const cycle = Math.sin(t * 0.24);
        legL = { x1: -6, y1: -32, x2: -10 - cycle * 10, y2: 0 };
        legR = { x1: 6, y1: -32, x2: 8 + cycle * 10, y2: 0 };
        torsoAngle = -0.1;
      } else if (state === 'RUN') {
        const cycle = Math.sin(t * 0.4);
        bobY = Math.abs(cycle) * -4;
        legL = { x1: -8, y1: -32, x2: -14 + cycle * 20, y2: 0 };
        legR = { x1: 8, y1: -32, x2: 12 - cycle * 20, y2: 0 };
        torsoAngle = 0.36;
      } else if (state === 'CROUCH') {
        bobY = 16;
        torsoAngle = 0.25;
        legL = { x1: -12, y1: -16, x2: -20, y2: 0 };
        legR = { x1: 6, y1: -16, x2: 12, y2: 0 };
      } else if (state === 'JUMP') {
        bobY = -6;
        legL = { x1: -8, y1: -36, x2: -12, y2: -14 };
        legR = { x1: 6, y1: -36, x2: 10, y2: -10 };
      } else if (state === 'FALL') {
        bobY = 0;
        legL = { x1: -7, y1: -34, x2: -10, y2: -4 };
        legR = { x1: 7, y1: -34, x2: 10, y2: -4 };
      } else if (state === 'LAND') {
        bobY = 16;
        torsoAngle = 0.35;
        legL = { x1: -12, y1: -18, x2: -18, y2: 0 };
        legR = { x1: 6, y1: -18, x2: 14, y2: 0 };
      } else if (state === 'ATTACK_LIGHT') {
        torsoAngle = 0.2;
        armR.angle = 1.3;
        armR.x = 22;
      } else if (state === 'ATTACK_HEAVY') {
        torsoAngle = -0.2;
        legR = { x1: 6, y1: -32, x2: 28, y2: -45 };
      } else if (state === 'ATTACK_KICK') {
        torsoAngle = -0.25;
        legR = { x1: 6, y1: -32, x2: 34, y2: -38 };
      } else if (state === 'ATTACK_SPECIAL') {
        torsoAngle = 0.3;
        armR.angle = 1.4;
        armR.x = 24;
      } else if (state === 'ATTACK_SUPER') {
        armL.angle = -1.8;
        armR.angle = -1.8;
        torsoAngle = -0.1;
      } else if (state === 'BLOCK' || state === 'BLOCK_STUN') {
        armL.angle = -0.9;
        armR.angle = -0.8;
        armL.x = 6;
        armR.x = 12;
      } else if (state === 'HIT_LIGHT' || state === 'HIT_HEAVY' || state === 'KNOCKBACK') {
        torsoAngle = -0.4;
        bobY = 6;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
      } else if (state === 'GET_UP') {
        bobY = f.stateTimer < 9 ? 14 : 6;
        torsoAngle = f.stateTimer < 9 ? 0.4 : 0.2;
      } else if (state === 'VICTORY') {
        armR.angle = -1.9;
        torsoAngle = 0;
      } else if (state === 'DEFEAT') {
        ctx.rotate(-Math.PI / 2.2);
      }

      ctx.translate(0, bobY);

      // Legs
      ctx.strokeStyle = cSuit;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(legL.x1, legL.y1); ctx.lineTo(legL.x2, legL.y2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(legR.x1, legR.y1); ctx.lineTo(legR.x2, legR.y2); ctx.stroke();

      // Armor Knee & Boots
      ctx.fillStyle = cArmor;
      ctx.fillRect(legL.x2 - 4, legL.y2 - 6, 8, 6);
      ctx.fillRect(legR.x2 - 4, legR.y2 - 6, 8, 6);

      // Torso & Cyber Conduit Body
      ctx.save();
      ctx.rotate(torsoAngle);
      ctx.fillStyle = cSuit;
      ctx.fillRect(-10, -56, 20, 26);

      // Armor plating
      ctx.fillStyle = cArmor;
      ctx.fillRect(-8, -54, 16, 12);

      // Glowing Conduit Lines
      ctx.fillStyle = cElectric;
      ctx.shadowColor = cElectric;
      ctx.shadowBlur = flash ? 0 : 8;
      ctx.fillRect(-6, -50, 12, 3);
      ctx.fillRect(-4, -44, 8, 2);

      // Cyber Helmet & Visor
      ctx.fillStyle = cArmor;
      ctx.fillRect(-8, -72, 16, 16);
      ctx.fillStyle = cVisor;
      ctx.shadowColor = cVisor;
      ctx.shadowBlur = flash ? 0 : 10;
      ctx.fillRect(-1, -67, 10, 5);
      ctx.restore();

      // Arms
      ctx.save();
      ctx.translate(armL.x, armL.y);
      ctx.rotate(armL.angle);
      ctx.strokeStyle = cArmor;
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(16, 6); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cArmor;
      ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18, 6); ctx.stroke();
      // Sparking Hand
      ctx.fillStyle = cElectric;
      ctx.shadowColor = cElectric;
      ctx.shadowBlur = flash ? 0 : 12;
      ctx.fillRect(16, 2, 8, 8);
      ctx.restore();
    }

    // =========================================================================
    // 6. NOIR DOLL - The Gothic Lolita (Image 1 Top-Middle)
    // Pale skin, monochrome white hair in long twin-tails, large black rose,
    // dark eyes with black tear makeup, frilled black gothic lolita dress, lace scythe.
    // =========================================================================
    drawNoirDoll(ctx, f, flash) {
      const state = f.state;
      const t = f.animTimer;
      const p = f.currentAttackProgress || 0;

      const cHair = flash ? '#ffffff' : '#f8f8fa';
      const cDress = flash ? '#ffffff' : '#161622';
      const cSkin = flash ? '#ffffff' : '#fff0f5';
      const cAccent = flash ? '#ffffff' : '#8822bb';

      let bobY = 0;
      let torsoAngle = 0;
      let legL = { x1: -6, y1: -28, x2: -10, y2: 0 };
      let legR = { x1: 6, y1: -28, x2: 10, y2: 0 };
      let armL = { x: -10, y: -46, angle: 0.3 };
      let armR = { x: 10, y: -46, angle: -0.3 };
      let hairWave = Math.sin(t * 0.12) * 6;
      let isWeaponDrawn = false;
      let showKickTrail = false;

      // Complete 22 Animation States for Noir Doll
      if (state === 'IDLE') {
        bobY = Math.sin(t * 0.08) * 3 - 2; // subtle float
        armL.angle = 0.2 + Math.sin(t * 0.08) * 0.1;
        armR.angle = -0.2 + Math.cos(t * 0.08) * 0.1;
      } else if (state === 'WALK_FWD') {
        const cycle = Math.sin(t * 0.22);
        bobY = Math.abs(cycle) * -3;
        legL = { x1: -6, y1: -28, x2: -10 + cycle * 12, y2: 0 };
        legR = { x1: 6, y1: -28, x2: 8 - cycle * 12, y2: 0 };
        torsoAngle = 0.1;
      } else if (state === 'WALK_BACK') {
        const cycle = Math.sin(t * 0.18);
        legL = { x1: -6, y1: -28, x2: -8 - cycle * 8, y2: 0 };
        legR = { x1: 6, y1: -28, x2: 6 + cycle * 8, y2: 0 };
        torsoAngle = -0.08;
      } else if (state === 'RUN') {
        const cycle = Math.sin(t * 0.32);
        bobY = -5 + Math.abs(cycle) * -3;
        legL = { x1: -6, y1: -28, x2: -12 + cycle * 18, y2: 0 };
        legR = { x1: 6, y1: -28, x2: 10 - cycle * 18, y2: 0 };
        torsoAngle = 0.35;
        hairWave = -18;
      } else if (state === 'CROUCH') {
        bobY = 16;
        torsoAngle = 0.25;
        legL = { x1: -10, y1: -16, x2: -18, y2: 0 };
        legR = { x1: 6, y1: -16, x2: 12, y2: 0 };
      } else if (state === 'JUMP') {
        bobY = -8;
        legL = { x1: -6, y1: -32, x2: -10, y2: -12 };
        legR = { x1: 6, y1: -32, x2: 10, y2: -8 };
        hairWave = 14;
      } else if (state === 'FALL') {
        bobY = 0;
        legL = { x1: -6, y1: -28, x2: -8, y2: -4 };
        legR = { x1: 6, y1: -28, x2: 8, y2: -4 };
        hairWave = 18;
      } else if (state === 'LAND') {
        bobY = 14;
        torsoAngle = 0.35;
        legL = { x1: -10, y1: -18, x2: -16, y2: 0 };
        legR = { x1: 6, y1: -18, x2: 12, y2: 0 };
      } else if (state === 'ATTACK_LIGHT') {
        isWeaponDrawn = true;
        if (p < 0.28) {
          torsoAngle = -0.15;
          armR.angle = -1.8;
          armR.x = -4;
        } else if (p <= 0.65) {
          torsoAngle = 0.22;
          armR.angle = 1.35;
          armR.x = 24;
        } else {
          torsoAngle = 0.08;
          armR.angle = 0.7;
          armR.x = 14;
        }
      } else if (state === 'ATTACK_HEAVY') {
        isWeaponDrawn = true;
        if (p < 0.35) {
          torsoAngle = -0.25;
          armR.angle = -2.5;
          hairWave = 20;
        } else if (p <= 0.70) {
          torsoAngle = 0.45;
          armR.angle = 1.6;
          armR.x = 28;
        } else {
          torsoAngle = 0.15;
          armR.angle = 1.0;
        }
      } else if (state === 'ATTACK_KICK') {
        if (p < 0.30) {
          torsoAngle = -0.18;
          legR = { x1: 4, y1: -28, x2: 8, y2: -34 };
        } else if (p <= 0.68) {
          torsoAngle = -0.32;
          legR = { x1: 6, y1: -30, x2: 34, y2: -38 };
          showKickTrail = true;
        } else {
          torsoAngle = -0.1;
          legR = { x1: 4, y1: -28, x2: 12, y2: -8 };
        }
      } else if (state === 'ATTACK_SPECIAL') {
        isWeaponDrawn = true;
        const spin = (t * 0.7) % (Math.PI * 2);
        torsoAngle = Math.sin(spin) * 0.25;
        armR.angle = spin;
      } else if (state === 'ATTACK_SUPER') {
        bobY = -12;
        armR.angle = -1.9;
        armL.angle = -1.9;
      } else if (state === 'BLOCK' || state === 'BLOCK_STUN') {
        torsoAngle = -0.12;
        armL.angle = -1.0;
        armR.angle = -0.9;
        armR.x = 10;
      } else if (state === 'HIT_LIGHT') {
        torsoAngle = -0.3;
        bobY = 4;
      } else if (state === 'HIT_HEAVY' || state === 'KNOCKBACK') {
        torsoAngle = -0.52;
        bobY = 8;
        hairWave = -16;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
        bobY = 0;
      } else if (state === 'GET_UP') {
        bobY = f.stateTimer < 9 ? 14 : 6;
        torsoAngle = f.stateTimer < 9 ? 0.4 : 0.15;
      } else if (state === 'VICTORY') {
        armR.angle = 0.5;
        armL.angle = -0.5;
        torsoAngle = 0.05;
        bobY = Math.sin(t * 0.08) * 2;
      } else if (state === 'DEFEAT') {
        ctx.rotate(-Math.PI / 2.2);
        bobY = 10;
      }

      ctx.translate(0, bobY);

      // Long White Twin-Tails (Back)
      ctx.fillStyle = cHair;
      ctx.beginPath();
      ctx.moveTo(-12, -68);
      ctx.quadraticCurveTo(-26 + hairWave, -45, -28 + hairWave * 1.2, -15);
      ctx.lineTo(-20 + hairWave * 1.2, -15);
      ctx.quadraticCurveTo(-18 + hairWave, -45, -6, -66);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(6, -66);
      ctx.quadraticCurveTo(18 + hairWave, -45, 24 + hairWave * 1.2, -15);
      ctx.lineTo(16 + hairWave * 1.2, -15);
      ctx.quadraticCurveTo(10 + hairWave, -45, -2, -68);
      ctx.closePath();
      ctx.fill();

      // Striped Stockings & Legs
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(legL.x1, legL.y1); ctx.lineTo(legL.x2, legL.y2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(legR.x1, legR.y1); ctx.lineTo(legR.x2, legR.y2); ctx.stroke();

      // White stripe bands
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(legL.x2 - 3, legL.y2 - 12, 6, 2.5);
      ctx.fillRect(legR.x2 - 3, legR.y2 - 12, 6, 2.5);

      // Mary Jane black shoes
      ctx.fillStyle = '#08080c';
      ctx.fillRect(legL.x2 - 3.5, legL.y2 - 5, 7, 5);
      ctx.fillRect(legR.x2 - 3.5, legR.y2 - 5, 7, 5);

      // Kick visual trail
      if (showKickTrail) {
        ctx.save();
        ctx.strokeStyle = cAccent;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = cAccent;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(legR.x2 - 8, legR.y2, 16, -0.6, 0.6);
        ctx.stroke();
        ctx.restore();
      }

      // Torso & Frilled Black Gothic Lolita Dress
      ctx.save();
      ctx.rotate(torsoAngle);
      ctx.fillStyle = cDress;
      ctx.beginPath();
      ctx.moveTo(-10, -52);
      ctx.lineTo(10, -52);
      ctx.lineTo(18, -12);
      ctx.lineTo(-18, -12);
      ctx.closePath();
      ctx.fill();

      // White lace frill at hem
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-18, -12, 36, 4);

      // Purple bodice corset lacing
      ctx.fillStyle = cAccent;
      ctx.fillRect(-2, -48, 4, 16);

      // Pale Head & Face
      ctx.fillStyle = cSkin;
      ctx.fillRect(-8, -72, 16, 16);

      // White Bangs
      ctx.fillStyle = cHair;
      ctx.fillRect(-9, -74, 18, 6);

      // Large Black Rose in Hair
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(8, -74, 6, 0, Math.PI * 2);
      ctx.fill();

      // Dark Eyes & Black Tear Makeup
      ctx.fillStyle = '#111';
      ctx.fillRect(-6, -66, 4, 4);
      ctx.fillRect(2, -66, 4, 4);
      // Black tear
      ctx.fillRect(-5, -60, 2, 4);
      ctx.restore();

      // Left Arm
      ctx.save();
      ctx.translate(armL.x, armL.y);
      ctx.rotate(armL.angle);
      ctx.strokeStyle = cDress;
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12, 6); ctx.stroke();
      ctx.restore();

      // Right Arm & Gothic Scythe Weapon
      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cDress;
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, 4); ctx.stroke();

      if (isWeaponDrawn) {
        // Scythe shaft
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(10, -22); ctx.lineTo(14, 30); ctx.stroke();
        // Scythe crescent blade
        ctx.strokeStyle = cAccent;
        ctx.lineWidth = 4;
        ctx.shadowColor = cAccent;
        ctx.shadowBlur = flash ? 0 : 12;
        ctx.beginPath();
        ctx.arc(12, -22, 18, -Math.PI * 0.7, 0.2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // =========================================================================
    // 7. JESTER GHOST - The Trickster Phantom (Image 1 Bottom-Left)
    // Floating white sheet ghost, undulating hem, floppy orange/red jester cap,
    // cartoon hands, spring boxing glove, 100-ton cartoon mallet, spring kick.
    // =========================================================================
    drawJesterGhost(ctx, f, flash) {
      const state = f.state;
      const t = f.animTimer;
      const p = f.currentAttackProgress || 0;

      const cGhost = flash ? '#ffffff' : '#f0f4ff';
      const cCap = flash ? '#ffffff' : '#ff7700';

      let floatY = -12 + Math.sin(t * 0.15) * 8;
      let torsoAngle = 0;
      let armL = { x: -14, y: -42, angle: 0.3 };
      let armR = { x: 14, y: -42, angle: -0.3 };
      let propType = null; // 'boxing_glove', 'mallet', 'spring_kick'

      // Complete 22 Animation States for Jester Ghost
      if (state === 'IDLE') {
        floatY = -14 + Math.sin(t * 0.15) * 8;
      } else if (state === 'WALK_FWD') {
        floatY = -12 + Math.sin(t * 0.25) * 6;
        torsoAngle = 0.12;
      } else if (state === 'WALK_BACK') {
        floatY = -12 + Math.sin(t * 0.20) * 6;
        torsoAngle = -0.1;
      } else if (state === 'RUN') {
        floatY = -8 + Math.sin(t * 0.35) * 4;
        torsoAngle = 0.42;
      } else if (state === 'CROUCH') {
        floatY = 6;
        torsoAngle = 0.2;
      } else if (state === 'JUMP') {
        floatY = -22;
        armR.angle = -1.2;
        armL.angle = -1.2;
      } else if (state === 'FALL') {
        floatY = -4;
        armR.angle = 0.7;
        armL.angle = 0.7;
      } else if (state === 'LAND') {
        floatY = 12;
        torsoAngle = 0.3;
      } else if (state === 'ATTACK_LIGHT') {
        propType = 'boxing_glove';
        if (p < 0.28) {
          armR.angle = -1.5;
          armR.x = 2;
        } else if (p <= 0.65) {
          armR.angle = 1.3;
          armR.x = 26;
        } else {
          armR.angle = 0.6;
          armR.x = 16;
        }
      } else if (state === 'ATTACK_HEAVY') {
        propType = 'mallet';
        if (p < 0.35) {
          armR.angle = -2.4;
          torsoAngle = -0.25;
        } else if (p <= 0.70) {
          armR.angle = 1.5;
          armR.x = 26;
          torsoAngle = 0.45;
        } else {
          armR.angle = 0.8;
          torsoAngle = 0.15;
        }
      } else if (state === 'ATTACK_KICK') {
        propType = 'spring_kick';
        torsoAngle = -0.25;
      } else if (state === 'ATTACK_SPECIAL') {
        torsoAngle = 0.3;
        armR.angle = 1.4;
        armL.angle = 1.4;
      } else if (state === 'ATTACK_SUPER') {
        floatY = -20;
        armR.angle = -1.8;
        armL.angle = -1.8;
      } else if (state === 'BLOCK' || state === 'BLOCK_STUN') {
        torsoAngle = -0.15;
        armR.angle = -0.9;
        armL.angle = -1.0;
        armR.x = 8;
      } else if (state === 'HIT_LIGHT') {
        floatY += 8;
        torsoAngle = -0.3;
      } else if (state === 'HIT_HEAVY' || state === 'KNOCKBACK') {
        floatY += 12;
        torsoAngle = -0.55;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
        floatY = 0;
      } else if (state === 'GET_UP') {
        floatY = f.stateTimer < 9 ? 8 : -6;
        torsoAngle = f.stateTimer < 9 ? 0.35 : 0.1;
      } else if (state === 'VICTORY') {
        floatY = -18 + Math.sin(t * 0.2) * 6;
        armR.angle = -1.8;
        armL.angle = 1.8;
      } else if (state === 'DEFEAT') {
        ctx.rotate(-Math.PI / 2.2);
        floatY = 12;
      }

      ctx.translate(0, floatY);

      // Ghost Sheet Body with undulating wavy bottom hem
      ctx.save();
      ctx.rotate(torsoAngle);
      ctx.fillStyle = cGhost;
      ctx.beginPath();
      ctx.moveTo(-16, -60);
      ctx.quadraticCurveTo(-22, -30, -20, 0);
      // Wavy ripples at hem
      const wave = Math.sin(t * 0.25) * 4;
      ctx.lineTo(-10, wave);
      ctx.lineTo(0, -wave);
      ctx.lineTo(10, wave);
      ctx.lineTo(20, 0);
      ctx.quadraticCurveTo(22, -30, 16, -60);
      ctx.quadraticCurveTo(0, -78, -16, -60);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#2b3a55';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Floppy Orange/Red Polka-Dot Jester Cap
      ctx.fillStyle = cCap;
      ctx.beginPath();
      ctx.moveTo(-14, -64);
      ctx.quadraticCurveTo(-4, -86, 18, -94 + Math.sin(t * 0.1) * 6);
      ctx.quadraticCurveTo(8, -70, 14, -64);
      ctx.closePath();
      ctx.fill();
      // White Puffball on hat tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(18, -94 + Math.sin(t * 0.1) * 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Big Round Cartoon Eyes & Happy 'v' mouth
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-6, -48, 5, 0, Math.PI * 2);
      ctx.arc(6, -48, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-5, -49, 2, 0, Math.PI * 2);
      ctx.arc(7, -49, 2, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3, -38); ctx.lineTo(0, -34); ctx.lineTo(3, -38);
      ctx.stroke();
      ctx.restore();

      // Left Arm
      ctx.save();
      ctx.translate(armL.x, armL.y);
      ctx.rotate(armL.angle);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, 4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right Arm & Cartoon Wacky Props
      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, 4, 6, 0, Math.PI * 2);
      ctx.fill();

      if (propType === 'boxing_glove') {
        // Accordion spring & boxing glove
        ctx.strokeStyle = '#ff3300';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(10, 4);
        ctx.lineTo(16, 0); ctx.lineTo(20, 8); ctx.lineTo(24, 0); ctx.lineTo(30, 4);
        ctx.stroke();
        // Red boxing glove
        ctx.fillStyle = '#ff2200';
        ctx.beginPath();
        ctx.arc(36, 4, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (propType === 'mallet') {
        // Massive 100-ton cartoon mallet
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(10, 0, 22, 6);
        ctx.fillStyle = '#444';
        ctx.fillRect(24, -16, 18, 38);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('100T', 25, 6);
      } else if (propType === 'spring_kick') {
        // Kangaroo spring kick uncoiling
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(10, 18); ctx.lineTo(20, 8); ctx.lineTo(30, 20);
        ctx.stroke();
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(28, 14, 14, 10);
      }
      ctx.restore();
    }

    // =========================================================================
    // 8. HORNED DEMON (LILITH) - The Demon Queen (Image 1 Bottom-Middle)
    // Ash grey skin, striped horns with gold rings, fangs, red eyes, black corset,
    // articulated black bat wings that fold and spread, swishing spade tail.
    // =========================================================================
    drawHornedDemon(ctx, f, flash) {
      const state = f.state;
      const t = f.animTimer;
      const p = f.currentAttackProgress || 0;

      const cSkin = flash ? '#ffffff' : '#9999a8';
      const cHair = flash ? '#ffffff' : '#ffffff';
      const cCorset = flash ? '#ffffff' : '#14141e';
      const cRed = flash ? '#ffffff' : '#e61a38';
      const cWing = flash ? '#ffffff' : '#1a1824';

      let bobY = 0;
      let torsoAngle = 0;
      let legL = { x1: -6, y1: -30, x2: -12, y2: 0 };
      let legR = { x1: 6, y1: -30, x2: 12, y2: 0 };
      let armL = { x: -12, y: -46, angle: 0.3 };
      let armR = { x: 12, y: -46, angle: -0.3 };
      let wingSpan = 1.0;
      let tailSway = Math.sin(t * 0.15) * 12;
      let showKickTrail = false;

      // Complete 22 Animation States for Horned Demon (Lilith)
      if (state === 'IDLE') {
        bobY = Math.sin(t * 0.1) * 2.5;
        wingSpan = 0.9 + Math.sin(t * 0.1) * 0.15;
        armL.angle = 0.3 + Math.sin(t * 0.1) * 0.1;
        armR.angle = -0.3 + Math.cos(t * 0.1) * 0.1;
      } else if (state === 'WALK_FWD') {
        const cycle = Math.sin(t * 0.25);
        bobY = Math.abs(cycle) * -3;
        legL = { x1: -6, y1: -30, x2: -12 + cycle * 14, y2: 0 };
        legR = { x1: 6, y1: -30, x2: 10 - cycle * 14, y2: 0 };
        torsoAngle = 0.12;
        wingSpan = 1.1;
      } else if (state === 'WALK_BACK') {
        const cycle = Math.sin(t * 0.20);
        legL = { x1: -6, y1: -30, x2: -10 - cycle * 10, y2: 0 };
        legR = { x1: 6, y1: -30, x2: 8 + cycle * 10, y2: 0 };
        torsoAngle = -0.1;
      } else if (state === 'RUN') {
        const cycle = Math.sin(t * 0.35);
        bobY = Math.abs(cycle) * -4;
        legL = { x1: -8, y1: -30, x2: -14 + cycle * 20, y2: 0 };
        legR = { x1: 8, y1: -30, x2: 12 - cycle * 20, y2: 0 };
        torsoAngle = 0.38;
        wingSpan = 1.35;
        tailSway = -16;
      } else if (state === 'CROUCH') {
        bobY = 18;
        torsoAngle = 0.25;
        wingSpan = 0.6; // folded around body
        legL = { x1: -12, y1: -16, x2: -20, y2: 0 };
        legR = { x1: 6, y1: -16, x2: 12, y2: 0 };
      } else if (state === 'JUMP') {
        bobY = -8;
        wingSpan = 1.4;
        legL = { x1: -6, y1: -34, x2: -12, y2: -14 };
        legR = { x1: 6, y1: -34, x2: 10, y2: -10 };
      } else if (state === 'FALL') {
        bobY = 0;
        wingSpan = 1.5; // gliding descent
        legL = { x1: -6, y1: -30, x2: -10, y2: -4 };
        legR = { x1: 6, y1: -30, x2: 10, y2: -4 };
      } else if (state === 'LAND') {
        bobY = 16;
        torsoAngle = 0.4;
        wingSpan = 0.7;
        legL = { x1: -12, y1: -18, x2: -18, y2: 0 };
        legR = { x1: 6, y1: -18, x2: 14, y2: 0 };
      } else if (state === 'ATTACK_LIGHT') {
        if (p < 0.28) {
          torsoAngle = -0.15;
          armR.angle = -1.6;
          armR.x = 2;
        } else if (p <= 0.65) {
          torsoAngle = 0.25;
          armR.angle = 1.35;
          armR.x = 26;
        } else {
          torsoAngle = 0.08;
          armR.angle = 0.8;
          armR.x = 16;
        }
      } else if (state === 'ATTACK_HEAVY') {
        if (p < 0.35) {
          torsoAngle = -0.3;
          armR.angle = -2.2;
          wingSpan = 0.8;
        } else if (p <= 0.70) {
          torsoAngle = 0.48; // ram horns forward
          armR.angle = 1.4;
          armR.x = 28;
          wingSpan = 1.3;
        } else {
          torsoAngle = 0.15;
          armR.angle = 0.9;
        }
      } else if (state === 'ATTACK_KICK') {
        if (p < 0.30) {
          torsoAngle = -0.2;
          legR = { x1: 4, y1: -28, x2: 8, y2: -34 };
        } else if (p <= 0.68) {
          torsoAngle = -0.32;
          legR = { x1: 6, y1: -30, x2: 34, y2: -38 };
          showKickTrail = true;
        } else {
          torsoAngle = -0.1;
          legR = { x1: 4, y1: -28, x2: 12, y2: -8 };
        }
      } else if (state === 'ATTACK_SPECIAL') {
        torsoAngle = 0.35;
        armR.angle = 1.4;
        armR.x = 28;
        wingSpan = 1.3;
      } else if (state === 'ATTACK_SUPER') {
        bobY = -14;
        wingSpan = 1.6;
        armR.angle = -1.8;
        armL.angle = -1.8;
      } else if (state === 'BLOCK' || state === 'BLOCK_STUN') {
        torsoAngle = -0.12;
        wingSpan = 0.5; // wings form shield
        armL.angle = -1.1;
        armR.angle = -0.9;
      } else if (state === 'HIT_LIGHT') {
        torsoAngle = -0.3;
        bobY = 4;
        wingSpan = 1.2;
      } else if (state === 'HIT_HEAVY' || state === 'KNOCKBACK') {
        torsoAngle = -0.55;
        bobY = 8;
        wingSpan = 1.4;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
        bobY = 0;
      } else if (state === 'GET_UP') {
        bobY = f.stateTimer < 9 ? 14 : 6;
        torsoAngle = f.stateTimer < 9 ? 0.42 : 0.2;
        wingSpan = 1.1;
      } else if (state === 'VICTORY') {
        wingSpan = 1.4;
        armR.angle = -1.8;
        armL.angle = 0.6;
        torsoAngle = -0.05;
        bobY = Math.sin(t * 0.08) * 2;
      } else if (state === 'DEFEAT') {
        ctx.rotate(-Math.PI / 2.2);
        bobY = 10;
        wingSpan = 0.4;
      }

      ctx.translate(0, bobY);

      // Bat Wings (Back)
      ctx.save();
      ctx.fillStyle = cWing;
      // Left wing
      ctx.beginPath();
      ctx.moveTo(-6, -56);
      ctx.quadraticCurveTo(-26 * wingSpan, -86, -38 * wingSpan, -68);
      ctx.quadraticCurveTo(-28 * wingSpan, -46, -6, -48);
      ctx.closePath();
      ctx.fill();
      // Right wing
      ctx.beginPath();
      ctx.moveTo(6, -56);
      ctx.quadraticCurveTo(26 * wingSpan, -86, 38 * wingSpan, -68);
      ctx.quadraticCurveTo(28 * wingSpan, -46, 6, -48);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Spade Demonic Tail
      ctx.strokeStyle = cWing;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.quadraticCurveTo(-14 + tailSway * 0.5, -24, -20 + tailSway, -12);
      ctx.stroke();
      // Spade arrow tip
      ctx.fillStyle = cRed;
      ctx.beginPath();
      ctx.moveTo(-20 + tailSway, -12);
      ctx.lineTo(-26 + tailSway, -18);
      ctx.lineTo(-24 + tailSway, -8);
      ctx.closePath();
      ctx.fill();

      // Flowing White Hair (Back)
      ctx.fillStyle = cHair;
      ctx.fillRect(-14, -74, 28, 56);

      // Two Striped Demon Horns
      ctx.save();
      // Left horn
      ctx.fillStyle = cRed;
      ctx.beginPath();
      ctx.moveTo(-8, -72); ctx.quadraticCurveTo(-24, -95, -18, -108);
      ctx.quadraticCurveTo(-10, -90, -3, -72); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.fillRect(-18, -96, 6, 4);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(-15, -88, 6, 3); // gold ring

      // Right horn
      ctx.fillStyle = cRed;
      ctx.beginPath();
      ctx.moveTo(8, -72); ctx.quadraticCurveTo(24, -95, 18, -108);
      ctx.quadraticCurveTo(10, -90, 3, -72); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.fillRect(12, -96, 6, 4);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(9, -88, 6, 3);
      ctx.restore();

      // Legs
      ctx.strokeStyle = '#1a1a24';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(legL.x1, legL.y1); ctx.lineTo(legL.x2, legL.y2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(legR.x1, legR.y1); ctx.lineTo(legR.x2, legR.y2); ctx.stroke();

      // Stiletto boots
      ctx.fillStyle = '#0a0a10';
      ctx.fillRect(legL.x2 - 3, legL.y2 - 6, 6, 6);
      ctx.fillRect(legR.x2 - 3, legR.y2 - 6, 6, 6);

      // Kick visual flame arc
      if (showKickTrail) {
        ctx.save();
        ctx.strokeStyle = cRed;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = cRed;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(legR.x2 - 8, legR.y2, 16, -0.6, 0.6);
        ctx.stroke();
        ctx.restore();
      }

      // Torso & Black Corset Bodice
      ctx.save();
      ctx.rotate(torsoAngle);
      ctx.fillStyle = cCorset;
      ctx.fillRect(-10, -54, 20, 26);
      ctx.fillStyle = cRed;
      ctx.fillRect(-2, -54, 4, 26);

      // Ash Grey Head
      ctx.fillStyle = cSkin;
      ctx.fillRect(-8, -72, 16, 16);

      // Demon Red Eyes & Vampire Fangs
      ctx.fillStyle = '#ff0033';
      ctx.fillRect(-6, -66, 4, 3);
      ctx.fillRect(2, -66, 4, 3);
      // Fangs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -58, 2, 3);
      ctx.fillRect(1, -58, 2, 3);
      ctx.restore();

      // Left Arm
      ctx.save();
      ctx.translate(armL.x, armL.y);
      ctx.rotate(armL.angle);
      ctx.strokeStyle = cSkin;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, 6); ctx.stroke();
      ctx.restore();

      // Right Arm & Claws
      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cSkin;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(16, 4); ctx.stroke();
      // Crimson Claws
      ctx.fillStyle = cRed;
      ctx.fillRect(14, 1, 6, 5);
      ctx.restore();
    }

    // =========================================================================
    // 9. TITAN - The Armored Juggernaut
    // Massive armored colossus, brass & obsidian plates, heavy power core
    // =========================================================================
    drawTitan(ctx, f, flash) {
      const state = f.state;
      const t = f.animTimer;
      const p = f.currentAttackProgress || 0;
      const isBoss = (f.isBoss || f.id === 'OverlordTitan');

      const cObsidian = flash ? '#ffffff' : (isBoss ? '#140c10' : '#1a1820');
      const cBrass = flash ? '#ffffff' : (isBoss ? '#ff3a00' : '#d49b38');
      const cCore = flash ? '#ffffff' : (isBoss ? '#ff0033' : '#00ff66');

      let bobY = 0;
      let torsoAngle = 0;
      let legL = { x1: -14, y1: -38, x2: -20, y2: 0 };
      let legR = { x1: 14, y1: -38, x2: 20, y2: 0 };
      let armL = { x: -18, y: -54, angle: 0.4 };
      let armR = { x: 18, y: -54, angle: -0.3 };

      if (state === 'IDLE') {
        bobY = Math.sin(t * 0.08) * 2;
        armL.angle = 0.3 + Math.sin(t * 0.08) * 0.1;
        armR.angle = -0.3 + Math.cos(t * 0.08) * 0.1;
      } else if (state === 'WALK_FWD') {
        const cycle = Math.sin(t * 0.18);
        bobY = Math.abs(cycle) * -3;
        legL = { x1: -12, y1: -38, x2: -18 + cycle * 12, y2: 0 };
        legR = { x1: 12, y1: -38, x2: 16 - cycle * 12, y2: 0 };
        torsoAngle = 0.08;
      } else if (state === 'WALK_BACK') {
        const cycle = Math.sin(t * 0.15);
        legL = { x1: -12, y1: -38, x2: -16 - cycle * 10, y2: 0 };
        legR = { x1: 12, y1: -38, x2: 14 + cycle * 10, y2: 0 };
        torsoAngle = -0.06;
      } else if (state === 'RUN') {
        const cycle = Math.sin(t * 0.28);
        bobY = Math.abs(cycle) * -4;
        legL = { x1: -14, y1: -38, x2: -20 + cycle * 18, y2: 0 };
        legR = { x1: 14, y1: -38, x2: 18 - cycle * 18, y2: 0 };
        torsoAngle = 0.30;
      } else if (state === 'CROUCH') {
        bobY = 16;
        torsoAngle = 0.2;
        legL = { x1: -16, y1: -22, x2: -26, y2: 0 };
        legR = { x1: 10, y1: -22, x2: 18, y2: 0 };
      } else if (state === 'JUMP') {
        bobY = -6;
        legL = { x1: -12, y1: -42, x2: -16, y2: -16 };
        legR = { x1: 12, y1: -42, x2: 16, y2: -12 };
      } else if (state === 'FALL') {
        bobY = 0;
        legL = { x1: -12, y1: -38, x2: -16, y2: -4 };
        legR = { x1: 12, y1: -38, x2: 16, y2: -4 };
      } else if (state === 'LAND') {
        bobY = 16;
        torsoAngle = 0.35;
        legL = { x1: -18, y1: -24, x2: -28, y2: 0 };
        legR = { x1: 14, y1: -24, x2: 24, y2: 0 };
      } else if (state === 'ATTACK_LIGHT') {
        torsoAngle = 0.18;
        armR.angle = 1.2;
        armR.x = 24;
      } else if (state === 'ATTACK_HEAVY') {
        torsoAngle = 0.3;
        armR.angle = -1.8 + p * 3.8;
        armR.x = 14 + Math.sin(p * Math.PI) * 28;
      } else if (state === 'ATTACK_KICK') {
        torsoAngle = -0.25;
        legR = { x1: 12, y1: -38, x2: 36, y2: -34 };
      } else if (state === 'ATTACK_SPECIAL') {
        torsoAngle = 0.4;
        bobY = 10;
        armR.angle = 1.6;
        armL.angle = 1.6;
      } else if (state === 'ATTACK_SUPER') {
        torsoAngle = 0.5;
        bobY = 14;
        armR.angle = 1.8;
        armL.angle = 1.8;
      } else if (state === 'BLOCK' || state === 'BLOCK_STUN') {
        armL.angle = -0.8;
        armR.angle = -0.8;
        armL.x = 10;
        armR.x = 18;
      } else if (state === 'HIT_LIGHT' || state === 'HIT_HEAVY' || state === 'KNOCKBACK') {
        torsoAngle = -0.25;
        bobY = 4;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
      } else if (state === 'GET_UP') {
        bobY = f.stateTimer < 9 ? 14 : 6;
        torsoAngle = f.stateTimer < 9 ? 0.35 : 0.15;
      } else if (state === 'VICTORY') {
        armR.angle = -2.0;
        armL.angle = 0.8;
      } else if (state === 'DEFEAT') {
        ctx.rotate(-Math.PI / 2.2);
      }

      ctx.translate(0, bobY);

      // Heavy Legs
      ctx.strokeStyle = cObsidian;
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(legL.x1, legL.y1); ctx.lineTo(legL.x2, legL.y2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(legR.x1, legR.y1); ctx.lineTo(legR.x2, legR.y2); ctx.stroke();

      // Brass Greaves
      ctx.fillStyle = cBrass;
      ctx.fillRect(legL.x2 - 7, legL.y2 - 10, 14, 10);
      ctx.fillRect(legR.x2 - 7, legR.y2 - 10, 14, 10);

      // Colossal Torso
      ctx.save();
      ctx.rotate(torsoAngle);

      // Boss Magma Distortion Aura
      if (isBoss && !flash) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 34, 0, ${0.45 + Math.sin(t * 0.2) * 0.25})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff2200';
        ctx.shadowBlur = 18;
        ctx.strokeRect(-26, -92, 52, 94);
        ctx.restore();
      }

      ctx.fillStyle = cObsidian;
      ctx.fillRect(-16, -66, 32, 34);

      // Brass / Magma Breastplate
      ctx.fillStyle = cBrass;
      ctx.fillRect(-14, -64, 28, 18);

      // Spiked Pauldrons (Shoulder pads)
      ctx.fillStyle = cBrass;
      ctx.fillRect(-22, -68, 10, 12);
      ctx.fillRect(12, -68, 10, 12);

      // Glowing Power Core (Incandescent Magma for Boss)
      ctx.fillStyle = cCore;
      ctx.shadowColor = cCore;
      ctx.shadowBlur = flash ? 0 : (isBoss ? 24 : 14);
      ctx.beginPath();
      ctx.arc(0, -52, isBoss ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();

      // Armored Helm
      ctx.fillStyle = cObsidian;
      ctx.fillRect(-10, -82, 20, 18);
      // Brass Helm Horns/Crest
      ctx.fillStyle = cBrass;
      ctx.fillRect(-12, -86, 24, 6);
      if (isBoss) {
        // Colossal Boss Crest Horns
        ctx.fillRect(-16, -92, 6, 12);
        ctx.fillRect(10, -92, 6, 12);
      }
      // Glowing slit eyes
      ctx.fillStyle = cCore;
      ctx.shadowColor = cCore;
      ctx.shadowBlur = isBoss ? 8 : 0;
      ctx.fillRect(0, -76, 7, 3);
      ctx.restore();

      // Giant Arms & Fists
      ctx.save();
      ctx.translate(armL.x, armL.y);
      ctx.rotate(armL.angle);
      ctx.strokeStyle = cObsidian;
      ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18, 8); ctx.stroke();
      ctx.fillStyle = cBrass;
      ctx.fillRect(12, 2, 14, 14);
      ctx.restore();

      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cObsidian;
      ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, 8); ctx.stroke();
      ctx.fillStyle = cBrass;
      ctx.fillRect(16, 0, 18, 18);
      ctx.restore();
    }
  }

  window.NeonRumble.FighterRenderer = new FighterRenderer();
})();
