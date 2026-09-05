/**
 * FighterRenderer.js - High-Fidelity Procedural Retro Pixel Art Fighter Renderer
 * Generates rich, expressive, animated 16-bit arcade fighters with full skeletal poses,
 * dynamic accessories (hair, scarves, weapons), squash/stretch, and effects.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class FighterRenderer {
    constructor() {}

    drawShadow(ctx, fighter) {
      ctx.save();
      const shadowWidth = Math.max(16, (fighter.width + 10) * (1 - Math.min(1, Math.abs(fighter.y - fighter.groundY) / 180)));
      const shadowHeight = 8;
      const alpha = Math.max(0.1, 0.45 * (1 - Math.min(1, Math.abs(fighter.y - fighter.groundY) / 200)));

      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(fighter.x, fighter.groundY + 2, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawFighter(ctx, fighter) {
      ctx.save();

      // Floor Shadow
      this.drawShadow(ctx, fighter);

      // Translate to fighter base position
      ctx.translate(fighter.x, fighter.y);
      ctx.scale(fighter.facing, 1);

      // Hit Flash (Pure white silhouette on hit impact)
      const isFlashing = fighter.hitFlashTimer > 0;

      // Render character based on id
      if (fighter.id === 'Ardra') {
        this.drawArdra(ctx, fighter, isFlashing);
      } else if (fighter.id === 'Rex') {
        this.drawRex(ctx, fighter, isFlashing);
      } else if (fighter.id === 'Volt') {
        this.drawVolt(ctx, fighter, isFlashing);
      } else {
        this.drawTitan(ctx, fighter, isFlashing);
      }

      ctx.restore();
    }

    // =========================================================================
    // 1. ARDRA - The Astral Stormblade
    // Sleek martial artist, dual cyan/teal astral blades, flowing violet hair, scarf
    // =========================================================================
    drawArdra(ctx, f, flash) {
      const state = f.state;
      const t = f.animTimer;
      const p = f.currentAttackProgress || 0; // 0 to 1 during attack

      // Colors
      const cArmor = flash ? '#ffffff' : '#232038';
      const cTrim = flash ? '#ffffff' : '#b280ff';
      const cSkin = flash ? '#ffffff' : '#ffd1b3';
      const cHair = flash ? '#ffffff' : '#8822ee';
      const cBlade = flash ? '#ffffff' : '#00f0ff';
      const cScarf = flash ? '#ffffff' : '#00ffcc';

      // Base bob
      let bobY = 0;
      let torsoAngle = 0;
      let legL = { x1: -8, y1: -32, x2: -14, y2: 0 };
      let legR = { x1: 8, y1: -32, x2: 12, y2: 0 };
      let armL = { x: -16, y: -48, angle: 0.2 };
      let armR = { x: 14, y: -46, angle: -0.3 };
      let hairSway = Math.sin(t * 0.15) * 4;
      let scarfSway = Math.sin(t * 0.2) * 8;

      // Poses by State
      if (state === 'IDLE') {
        bobY = Math.sin(t * 0.1) * 2.5;
        armL.angle = -0.4 + Math.sin(t * 0.1) * 0.1;
        armR.angle = 0.5 + Math.cos(t * 0.1) * 0.1;
      } else if (state === 'WALK_FWD') {
        const walkCycle = Math.sin(t * 0.25);
        bobY = Math.abs(walkCycle) * -3;
        legL = { x1: -6, y1: -32, x2: -12 + walkCycle * 14, y2: 0 };
        legR = { x1: 6, y1: -32, x2: 10 - walkCycle * 14, y2: 0 };
        torsoAngle = 0.1;
        scarfSway = -14 + Math.sin(t * 0.3) * 6;
      } else if (state === 'WALK_BACK') {
        const walkCycle = Math.sin(t * 0.2);
        legL = { x1: -6, y1: -32, x2: -10 - walkCycle * 10, y2: 0 };
        legR = { x1: 6, y1: -32, x2: 8 + walkCycle * 10, y2: 0 };
        torsoAngle = -0.08;
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
        hairSway = 12;
      } else if (state === 'ATTACK_LIGHT') {
        // Quick forward blade thrust
        torsoAngle = 0.2;
        if (p < 0.4) {
          armR.angle = -1.4; // windup
        } else {
          armR.angle = 1.3; // forward stab
          armR.x = 24;
        }
      } else if (state === 'ATTACK_HEAVY') {
        // Leaping spinning high crescent slash
        torsoAngle = 0.35;
        bobY = -4;
        armR.angle = -2.2 + p * 4.2;
        armR.x = 10 + Math.sin(p * Math.PI) * 20;
        armL.angle = -0.8;
      } else if (state === 'ATTACK_SPECIAL') {
        // Storm Gale Vortex: rapid spin
        const spin = (t * 0.8) % (Math.PI * 2);
        torsoAngle = Math.sin(spin) * 0.3;
        armR.angle = spin;
        armL.angle = spin + Math.PI;
        scarfSway = Math.cos(spin) * 20;
      } else if (state === 'ATTACK_SUPER') {
        // "Bitchy Timeee!!!" Long Tongue Lash
        torsoAngle = 0.28;
        armR.angle = -1.1;
        armL.angle = -0.9;
        scarfSway = Math.sin(t * 1.5) * 30;
        hairSway = -22;
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
      } else if (state === 'HIT_HEAVY') {
        torsoAngle = -0.55;
        bobY = 8;
        armL.angle = -1.4;
        armR.angle = -1.2;
        hairSway = -14;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
        bobY = 0;
      } else if (state === 'VICTORY') {
        armR.angle = -1.6; // Blade pointed straight up
        armL.angle = 0.6;
        torsoAngle = -0.05;
        bobY = Math.sin(t * 0.08) * 1.5;
      } else if (state === 'DEFEAT') {
        ctx.rotate(-Math.PI / 2.2);
        bobY = 10;
      }

      ctx.translate(0, bobY);

      // 1. Flowing Scarf & Cape
      ctx.fillStyle = cScarf;
      ctx.beginPath();
      ctx.moveTo(-4, -50);
      ctx.quadraticCurveTo(-16 + scarfSway, -42, -28 + scarfSway * 1.4, -30);
      ctx.lineTo(-24 + scarfSway * 1.4, -26);
      ctx.quadraticCurveTo(-12 + scarfSway, -38, 0, -48);
      ctx.fill();

      // 2. Flowing Violet Ponytail Hair (Back)
      ctx.fillStyle = cHair;
      ctx.beginPath();
      ctx.moveTo(-6, -66);
      ctx.quadraticCurveTo(-22 + hairSway, -64, -28 + hairSway * 1.2, -44);
      ctx.lineTo(-22 + hairSway * 1.2, -42);
      ctx.quadraticCurveTo(-16 + hairSway, -60, -2, -62);
      ctx.fill();

      // 3. Legs
      ctx.strokeStyle = cArmor;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      // Left leg
      ctx.beginPath();
      ctx.moveTo(legL.x1, legL.y1);
      ctx.lineTo(legL.x2, legL.y2);
      ctx.stroke();
      // Right leg
      ctx.beginPath();
      ctx.moveTo(legR.x1, legR.y1);
      ctx.lineTo(legR.x2, legR.y2);
      ctx.stroke();

      // Boots
      ctx.fillStyle = cTrim;
      ctx.fillRect(legL.x2 - 4, legL.y2 - 6, 8, 6);
      ctx.fillRect(legR.x2 - 4, legR.y2 - 6, 8, 6);

      // 4. Torso & Armor
      ctx.save();
      ctx.rotate(torsoAngle);
      ctx.fillStyle = cArmor;
      ctx.fillRect(-10, -56, 20, 26);

      // Chestplate Trim
      ctx.fillStyle = cTrim;
      ctx.fillRect(-8, -54, 16, 8);
      ctx.fillStyle = cBlade;
      ctx.fillRect(-4, -52, 8, 4);

      // Belt
      ctx.fillStyle = cTrim;
      ctx.fillRect(-11, -32, 22, 4);

      // 5. Head & Face
      ctx.fillStyle = cSkin;
      ctx.fillRect(-7, -72, 14, 14);

      // Hair Bangs
      ctx.fillStyle = cHair;
      ctx.fillRect(-8, -75, 16, 6);
      ctx.fillRect(-8, -72, 5, 8);

      // Cyan Glowing Eyes
      ctx.fillStyle = flash ? '#fff' : '#00f0ff';
      ctx.fillRect(1, -68, 4, 3);

      // Open Mouth during Super
      if (state === 'ATTACK_SUPER') {
        ctx.fillStyle = '#110011';
        ctx.fillRect(3, -66, 8, 6);
        ctx.fillStyle = '#ffffff'; // Sharp fangs
        ctx.fillRect(3, -66, 2, 2);
        ctx.fillRect(9, -66, 2, 2);
      }

      ctx.restore();

      // =========================================================================
      // ARDRA'S LONG TONGUE LASH ("Bitchy Timeee!!!")
      // =========================================================================
      if (state === 'ATTACK_SUPER') {
        ctx.save();
        const progress = p || 0.5;
        let tongueLen = 0;
        if (progress < 0.25) {
          tongueLen = (progress / 0.25) * 225; // Shoots out at extreme speed
        } else if (progress < 0.72) {
          tongueLen = 225 + Math.sin(t * 0.9) * 25; // Whipping & thrashing at full reach!
        } else {
          tongueLen = Math.max(0, 225 * (1 - (progress - 0.72) / 0.28)); // Snaps back
        }

        const wave1 = Math.sin(t * 0.65) * 18;
        const wave2 = Math.cos(t * 0.75) * 22;

        // Glowing outer aura of the tongue
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

        // Inner bright tongue muscle
        ctx.strokeStyle = '#ff3388';
        ctx.lineWidth = 7;
        ctx.stroke();

        // Highlight spine
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Tongue Tip: spade / forked barb with dripping venom/astral energy
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

        // Barbs / tentacles on the tongue
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

      // 6. Left Arm & Astral Saber
      ctx.save();
      ctx.translate(armL.x, armL.y);
      ctx.rotate(armL.angle);
      ctx.strokeStyle = cArmor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(14, 8);
      ctx.stroke();

      // Astral Blade Left
      ctx.strokeStyle = cBlade;
      ctx.lineWidth = 4;
      ctx.shadowColor = cBlade;
      ctx.shadowBlur = flash ? 0 : 12;
      ctx.beginPath();
      ctx.moveTo(14, 8);
      ctx.lineTo(36, 12);
      ctx.stroke();
      ctx.restore();

      // 7. Right Arm & Main Astral Saber
      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cArmor;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18, 6);
      ctx.stroke();

      // Astral Saber Right
      ctx.strokeStyle = cBlade;
      ctx.lineWidth = 5;
      ctx.shadowColor = cBlade;
      ctx.shadowBlur = flash ? 0 : 16;
      ctx.beginPath();
      ctx.moveTo(18, 6);
      ctx.lineTo(48, 10);
      ctx.stroke();

      // Saber hilt
      ctx.fillStyle = cTrim;
      ctx.fillRect(14, 3, 5, 8);
      ctx.restore();
    }

    // =========================================================================
    // 2. REX - The Iron Brawler
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
      } else if (state === 'CROUCH') {
        bobY = 18;
        torsoAngle = 0.3;
        legL = { x1: -14, y1: -18, x2: -24, y2: 0 };
        legR = { x1: 8, y1: -18, x2: 14, y2: 0 };
      } else if (state === 'JUMP') {
        bobY = -8;
        legL = { x1: -10, y1: -38, x2: -14, y2: -16 };
        legR = { x1: 8, y1: -38, x2: 14, y2: -12 };
      } else if (state === 'ATTACK_LIGHT') {
        // Quick bionic jab
        torsoAngle = 0.2;
        armR.angle = 1.4;
        armR.x = 22;
      } else if (state === 'ATTACK_HEAVY') {
        // Colossal Haymaker
        torsoAngle = 0.4;
        armR.angle = -1.2 + p * 3.5;
        armR.x = 10 + Math.sin(p * Math.PI) * 26;
      } else if (state === 'ATTACK_SPECIAL') {
        // Mach Shockwave: smash gauntlet down into ground
        torsoAngle = 0.6;
        bobY = 12;
        armR.angle = 1.6;
        armR.x = 24;
      } else if (state === 'ATTACK_SUPER') {
        // Meteor Buster: hyper punch forward
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
      } else if (state === 'HIT_LIGHT' || state === 'HIT_HEAVY') {
        torsoAngle = -0.45;
        bobY = 6;
        armL.angle = -1.2;
        armR.angle = -1.0;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
      } else if (state === 'VICTORY') {
        armR.angle = -2.1; // Fist held high
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
      ctx.moveTo(legL.x1, legL.y1);
      ctx.lineTo(legL.x2, legL.y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(legR.x1, legR.y1);
      ctx.lineTo(legR.x2, legR.y2);
      ctx.stroke();

      // Heavy boots
      ctx.fillStyle = '#111';
      ctx.fillRect(legL.x2 - 5, legL.y2 - 8, 10, 8);
      ctx.fillRect(legR.x2 - 5, legR.y2 - 8, 10, 8);

      // Torso & Red Brawler Vest
      ctx.save();
      ctx.rotate(torsoAngle);
      ctx.fillStyle = cSkin;
      ctx.fillRect(-12, -58, 24, 28);
      // Red vest
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
      // Spiky hair
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
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(16, 6);
      ctx.stroke();
      // Gauntlet
      ctx.fillStyle = cGauntlet;
      ctx.fillRect(10, 0, 14, 12);
      ctx.restore();

      // Right Arm & Massive Bionic Gauntlet
      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cSkin;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18, 6);
      ctx.stroke();

      // Bionic Gauntlet with glowing energy vents
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
    // 3. VOLT - The Cyber Spark
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

      let bobY = Math.sin(t * 0.15) * 2;
      let torsoAngle = 0;
      let legL = { x1: -8, y1: -32, x2: -14, y2: 0 };
      let legR = { x1: 8, y1: -32, x2: 12, y2: 0 };
      let armL = { x: -12, y: -46, angle: 0.3 };
      let armR = { x: 12, y: -46, angle: -0.2 };

      if (state === 'IDLE') {
        armL.angle = 0.2 + Math.sin(t * 0.15) * 0.2;
        armR.angle = -0.2 + Math.cos(t * 0.15) * 0.2;
      } else if (state === 'WALK_FWD') {
        const cycle = Math.sin(t * 0.3);
        legL = { x1: -6, y1: -32, x2: -12 + cycle * 14, y2: 0 };
        legR = { x1: 6, y1: -32, x2: 10 - cycle * 14, y2: 0 };
        torsoAngle = 0.15;
      } else if (state === 'CROUCH') {
        bobY = 16;
        torsoAngle = 0.25;
        legL = { x1: -12, y1: -16, x2: -20, y2: 0 };
        legR = { x1: 6, y1: -16, x2: 12, y2: 0 };
      } else if (state === 'JUMP') {
        bobY = -6;
        legL = { x1: -8, y1: -36, x2: -12, y2: -14 };
        legR = { x1: 6, y1: -36, x2: 10, y2: -10 };
      } else if (state === 'ATTACK_LIGHT') {
        // High voltage palm strike
        torsoAngle = 0.2;
        armR.angle = 1.3;
        armR.x = 22;
      } else if (state === 'ATTACK_HEAVY') {
        // Electric arc high roundhouse kick
        torsoAngle = -0.2;
        legR = { x1: 6, y1: -32, x2: 28, y2: -45 };
      } else if (state === 'ATTACK_SPECIAL') {
        // Plasma Arc launch
        torsoAngle = 0.3;
        armR.angle = 1.4;
        armR.x = 24;
      } else if (state === 'ATTACK_SUPER') {
        // Thunder Overload pose: arms raised calling lightning
        armL.angle = -1.8;
        armR.angle = -1.8;
        torsoAngle = -0.1;
      } else if (state === 'BLOCK' || state === 'BLOCK_STUN') {
        armL.angle = -0.9;
        armR.angle = -0.8;
        armL.x = 6;
        armR.x = 12;
      } else if (state === 'HIT_LIGHT' || state === 'HIT_HEAVY') {
        torsoAngle = -0.4;
        bobY = 6;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
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
      ctx.moveTo(legL.x1, legL.y1);
      ctx.lineTo(legL.x2, legL.y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(legR.x1, legR.y1);
      ctx.lineTo(legR.x2, legR.y2);
      ctx.stroke();

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
      // Glowing yellow visor band
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
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(16, 6);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cArmor;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18, 6);
      ctx.stroke();
      // Sparking Hand
      ctx.fillStyle = cElectric;
      ctx.shadowColor = cElectric;
      ctx.shadowBlur = flash ? 0 : 12;
      ctx.fillRect(16, 2, 8, 8);
      ctx.restore();
    }

    // =========================================================================
    // 4. TITAN - The Armored Juggernaut
    // Massive armored colossus, brass & obsidian plates, heavy power core
    // =========================================================================
    drawTitan(ctx, f, flash) {
      const state = f.state;
      const t = f.animTimer;
      const p = f.currentAttackProgress || 0;

      const cObsidian = flash ? '#ffffff' : '#1a1820';
      const cBrass = flash ? '#ffffff' : '#d49b38';
      const cCore = flash ? '#ffffff' : '#00ff66';

      let bobY = Math.sin(t * 0.08) * 2;
      let torsoAngle = 0;
      let legL = { x1: -14, y1: -38, x2: -20, y2: 0 };
      let legR = { x1: 14, y1: -38, x2: 20, y2: 0 };
      let armL = { x: -18, y: -54, angle: 0.4 };
      let armR = { x: 18, y: -54, angle: -0.3 };

      if (state === 'IDLE') {
        armL.angle = 0.3 + Math.sin(t * 0.08) * 0.1;
        armR.angle = -0.3 + Math.cos(t * 0.08) * 0.1;
      } else if (state === 'WALK_FWD') {
        const cycle = Math.sin(t * 0.18);
        bobY = Math.abs(cycle) * -3;
        legL = { x1: -12, y1: -38, x2: -18 + cycle * 12, y2: 0 };
        legR = { x1: 12, y1: -38, x2: 16 - cycle * 12, y2: 0 };
        torsoAngle = 0.08;
      } else if (state === 'CROUCH') {
        bobY = 16;
        torsoAngle = 0.2;
        legL = { x1: -16, y1: -22, x2: -26, y2: 0 };
        legR = { x1: 10, y1: -22, x2: 18, y2: 0 };
      } else if (state === 'JUMP') {
        bobY = -6;
        legL = { x1: -12, y1: -42, x2: -16, y2: -16 };
        legR = { x1: 12, y1: -42, x2: 16, y2: -12 };
      } else if (state === 'ATTACK_LIGHT') {
        // Heavy armored jab
        torsoAngle = 0.18;
        armR.angle = 1.2;
        armR.x = 24;
      } else if (state === 'ATTACK_HEAVY') {
        // Colossal Overhead Hammerfist
        torsoAngle = 0.3;
        armR.angle = -1.8 + p * 3.8;
        armR.x = 14 + Math.sin(p * Math.PI) * 28;
      } else if (state === 'ATTACK_SPECIAL') {
        // Seismic Slam: High leap & slam
        torsoAngle = 0.4;
        bobY = 10;
        armR.angle = 1.6;
        armL.angle = 1.6;
      } else if (state === 'ATTACK_SUPER') {
        // Tectonic Cataclysm: both arms smash ground
        torsoAngle = 0.5;
        bobY = 14;
        armR.angle = 1.8;
        armL.angle = 1.8;
      } else if (state === 'BLOCK' || state === 'BLOCK_STUN') {
        armL.angle = -0.8;
        armR.angle = -0.8;
        armL.x = 10;
        armR.x = 18;
      } else if (state === 'HIT_LIGHT' || state === 'HIT_HEAVY') {
        torsoAngle = -0.25;
        bobY = 4;
      } else if (state === 'KNOCKDOWN') {
        ctx.rotate(-Math.PI / 2);
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
      ctx.moveTo(legL.x1, legL.y1);
      ctx.lineTo(legL.x2, legL.y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(legR.x1, legR.y1);
      ctx.lineTo(legR.x2, legR.y2);
      ctx.stroke();

      // Brass Greaves
      ctx.fillStyle = cBrass;
      ctx.fillRect(legL.x2 - 7, legL.y2 - 10, 14, 10);
      ctx.fillRect(legR.x2 - 7, legR.y2 - 10, 14, 10);

      // Colossal Torso
      ctx.save();
      ctx.rotate(torsoAngle);
      ctx.fillStyle = cObsidian;
      ctx.fillRect(-16, -66, 32, 34);

      // Brass Breastplate
      ctx.fillStyle = cBrass;
      ctx.fillRect(-14, -64, 28, 18);

      // Spiked Pauldrons (Shoulder pads)
      ctx.fillStyle = cBrass;
      ctx.fillRect(-22, -68, 10, 12);
      ctx.fillRect(12, -68, 10, 12);

      // Glowing Green Power Core
      ctx.fillStyle = cCore;
      ctx.shadowColor = cCore;
      ctx.shadowBlur = flash ? 0 : 14;
      ctx.beginPath();
      ctx.arc(0, -52, 6, 0, Math.PI * 2);
      ctx.fill();

      // Armored Helm
      ctx.fillStyle = cObsidian;
      ctx.fillRect(-10, -82, 20, 18);
      // Brass Helm Horns/Crest
      ctx.fillStyle = cBrass;
      ctx.fillRect(-12, -86, 24, 6);
      // Glowing green slit eyes
      ctx.fillStyle = cCore;
      ctx.fillRect(0, -76, 7, 3);

      ctx.restore();

      // Giant Arms & Fists
      ctx.save();
      ctx.translate(armL.x, armL.y);
      ctx.rotate(armL.angle);
      ctx.strokeStyle = cObsidian;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18, 8);
      ctx.stroke();
      ctx.fillStyle = cBrass;
      ctx.fillRect(12, 2, 14, 14);
      ctx.restore();

      ctx.save();
      ctx.translate(armR.x, armR.y);
      ctx.rotate(armR.angle);
      ctx.strokeStyle = cObsidian;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(22, 8);
      ctx.stroke();
      // Giant Brass Gauntlet
      ctx.fillStyle = cBrass;
      ctx.fillRect(16, 0, 18, 18);
      ctx.restore();
    }
  }

  window.NeonRumble.FighterRenderer = new FighterRenderer();
})();
