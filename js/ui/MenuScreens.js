/**
 * MenuScreens.js - Arcade Presentation Screens
 * Boot, Title Menu, Character Select, Stage Select, Settings, How to Play, Pause, and Victory.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class MenuScreens {
    constructor() {
      this.timer = 0;
      this.storage = window.NeonRumble.Storage;

      // Title Menu State (Single Player Hero Campaign Focus)
      this.titleOptions = [
        'HERO CAMPAIGN (ARDRA)',
        'FREE ROAM DOJO (ARDRA)',
        'TRAINING MODE',
        'COMBAT TUTORIAL',
        'SETTINGS',
        'ARCADE STATS'
      ];
      this.titleIndex = 0;

      // Character Select State
      this.fightersList = ['Ardra', 'Rex', 'Volt', 'Titan'];
      this.fighterMeta = {
        Ardra: {
          name: 'ARDRA',
          title: 'THE ASTRAL STORMBLADE',
          power: '★★★★☆',
          speed: '★★★★★',
          range: '★★★★☆',
          desc: 'Swift astral blade dancer with whirlwind cyclones and aerial slashes.',
          color: '#a820ff'
        },
        Rex: {
          name: 'REX',
          title: 'THE IRON BRAWLER',
          power: '★★★★★',
          speed: '★★★☆☆',
          range: '★★☆☆☆',
          desc: 'Devastating street fighter wielding kinetic bionic shockwave gauntlets.',
          color: '#cc2233'
        },
        Volt: {
          name: 'VOLT',
          title: 'THE CYBER SPARK',
          power: '★★★☆☆',
          speed: '★★★★☆',
          range: '★★★★★',
          desc: 'High-voltage electric zoner who fires plasma orbs and thunderbolts.',
          color: '#00f0ff'
        },
        Titan: {
          name: 'TITAN',
          title: 'THE ARMORED JUGGERNAUT',
          power: '★★★★★',
          speed: '★★☆☆☆',
          range: '★★★☆☆',
          desc: 'Colossal armored juggernaut capable of shattering the earth beneath him.',
          color: '#d49b38'
        }
      };

      this.p1CharIndex = 0; // Starts on Ardra!
      this.p2CharIndex = 1; // Starts on Rex
      this.p1Ready = false;
      this.p2Ready = false;

      // Stage Select State
      this.stagesList = ['GraffitiStrip', 'CyberJunk', 'NeonDocks', 'DemonShrine', 'AstralCore', 'Random'];
      this.stageIndex = 0;

      // Settings State
      this.settingsOptions = ['SFX VOLUME', 'MUSIC VOLUME', 'SCREEN SHAKE', 'CRT FILTER', 'SCANLINES', 'SHOW HITBOXES', 'BACK'];
      this.settingsIndex = 0;

      // Pause Menu State
      this.pauseOptions = ['RESUME', 'RESTART ROUND', 'COMBAT TUTORIAL', 'QUIT TO MENU'];
      this.pauseIndex = 0;

      // Victory / Defeat Menu State
      this.victoryOptions = ['RETRY STAGE', 'START NEW RUN', 'MAIN MENU'];
      this.victoryIndex = 0;
    }

    update() {
      this.timer++;
    }

    // =========================================================================
    // 1. BOOT SEQUENCE SCREEN
    // =========================================================================
    drawBoot(ctx) {
      ctx.save();
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, 960, 540);

      ctx.font = 'bold 16px "Press Start 2P", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.fillText('★ PIXEL FORGE ARCADE SYSTEMS ★', 480, 160);

      ctx.font = '12px "Share Tech Mono", monospace';
      ctx.fillStyle = '#80ffaa';
      ctx.fillText('SYSTEM HARDWARE INITIALIZATION... 1998 EDITION', 480, 200);
      ctx.fillText('ROM CHECK: 64MB OK  •  SOUND SYNTH CHIP: OK  •  60 FPS MODE', 480, 225);

      ctx.font = 'bold 24px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('NEON RUMBLE: ASTRAL CLASH', 480, 310);

      // Blinking Prompt
      if (Math.floor(this.timer / 25) % 2 === 0) {
        ctx.font = 'bold 15px "Press Start 2P", monospace';
        ctx.fillStyle = '#ff0077';
        ctx.fillText('INSERT COIN / PRESS ANY KEY', 480, 420);
      }

      ctx.restore();
    }

    // =========================================================================
    // 2. TITLE SCREEN (MAIN MENU - FIGHTING EX LAYER VISUAL STYLE)
    // =========================================================================
    drawTitle(ctx) {
      ctx.save();
      const t = this.timer;

      // 1. Fiery Background (Left dark charcoal, right fiery amber/crimson)
      const bgGrad = ctx.createLinearGradient(0, 0, 960, 540);
      bgGrad.addColorStop(0, '#06050a');
      bgGrad.addColorStop(0.35, '#100a16');
      bgGrad.addColorStop(0.65, '#2c0808');
      bgGrad.addColorStop(0.85, '#6a1400');
      bgGrad.addColorStop(1, '#ff4400');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 960, 540);

      // Radial fire bloom on the right
      const fireGlow = ctx.createRadialGradient(780, 240, 20, 780, 240, 380);
      fireGlow.addColorStop(0, 'rgba(255, 120, 0, 0.45)');
      fireGlow.addColorStop(0.5, 'rgba(200, 20, 0, 0.25)');
      fireGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fireGlow;
      ctx.fillRect(400, 0, 560, 540);

      // Diagonal Chainlink Fence Grating (right side)
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      for (let x = 320; x < 1050; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x - 180, 540);
        ctx.stroke();
      }
      for (let x = 160; x < 960; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + 180, 540);
        ctx.stroke();
      }
      ctx.restore();

      // Floating fiery sparks/embers
      ctx.save();
      for (let i = 0; i < 16; i++) {
        const sx = 460 + ((i * 37 + t * 0.8) % 480);
        const sy = 520 - ((i * 41 + t * 1.5) % 500);
        const sz = 2 + (i % 4);
        ctx.fillStyle = i % 2 === 0 ? '#ffcc00' : '#ff4400';
        ctx.shadowColor = '#ff2200';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(sx, sy, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Character Art Showcase (Right Center)
      // Hero Ardra Card / Silhouette
      ctx.save();
      ctx.translate(560, 95);
      ctx.fillStyle = 'rgba(18, 12, 28, 0.85)';
      ctx.strokeStyle = 'rgba(255, 60, 0, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.fillRect(0, 0, 180, 220);
      ctx.strokeRect(0, 0, 180, 220);
      ctx.fillStyle = '#9c27b0';
      ctx.beginPath();
      ctx.arc(90, 80, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e61a38';
      ctx.fillRect(68, 80, 44, 28); // Cowl
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(78, 72, 8, 4); // Eyes
      ctx.fillRect(94, 72, 8, 4);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(40, 130); ctx.lineTo(140, 40); ctx.stroke();
      ctx.font = 'bold 12px "Rajdhani", sans-serif';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('HERO // ARDRA', 15, 185);
      ctx.font = '9px "Share Tech Mono", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('ASTRAL STORMBLADE', 15, 202);
      ctx.restore();

      // Rival Gauntlet Card
      ctx.save();
      ctx.translate(760, 120);
      ctx.fillStyle = 'rgba(24, 8, 12, 0.85)';
      ctx.strokeStyle = 'rgba(255, 40, 40, 0.35)';
      ctx.lineWidth = 1;
      ctx.fillRect(0, 0, 150, 195);
      ctx.strokeRect(0, 0, 150, 195);
      ctx.font = '38px sans-serif';
      ctx.fillText('👹', 55, 95);
      ctx.font = 'bold 11px "Rajdhani", sans-serif';
      ctx.fillStyle = '#ff5544';
      ctx.fillText('VILLAIN GAUNTLET', 15, 160);
      ctx.font = '9px "Share Tech Mono", monospace';
      ctx.fillStyle = '#8899aa';
      ctx.fillText('5 STAGE BOSSES', 15, 176);
      ctx.restore();

      // 3. Top Header: "MAIN MENU"
      ctx.save();
      ctx.textAlign = 'left';
      ctx.font = 'italic 800 48px "Rajdhani", sans-serif';
      const titleGrad = ctx.createLinearGradient(40, 30, 40, 80);
      titleGrad.addColorStop(0, '#fff990');
      titleGrad.addColorStop(0.35, '#ffc000');
      titleGrad.addColorStop(0.7, '#ff4900');
      titleGrad.addColorStop(1, '#d80000');
      ctx.fillStyle = titleGrad;
      ctx.shadowColor = 'rgba(255, 60, 0, 0.9)';
      ctx.shadowBlur = 18;
      ctx.fillText('MAIN MENU', 40, 72);
      ctx.shadowBlur = 0;

      // Top Corner Badges
      ctx.font = '10px "Share Tech Mono", monospace';
      ctx.fillStyle = '#ff9900';
      ctx.fillText('NEO-SYSTEM 1998 // VER 1.4', 680, 52);

      // Bumper Prompts [L1] [R1]
      ctx.fillStyle = '#302a3a';
      ctx.fillRect(840, 38, 48, 20);
      ctx.strokeStyle = '#788098';
      ctx.strokeRect(840, 38, 48, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Rajdhani", sans-serif';
      ctx.fillText('L1 / R1', 844, 52);
      ctx.restore();

      // 4. Left-Side Angular/Beveled Stacked Menu Buttons
      const totalOpts = this.titleOptions.length;
      const startY = 110;
      const btnH = 42;
      const btnSpacing = 52;
      const btnW = 340;

      this.titleOptions.forEach((opt, idx) => {
        const isSelected = idx === this.titleIndex;
        const bY = startY + idx * btnSpacing;
        const bX = 40 + (isSelected ? 8 : 0);

        ctx.save();
        // Angular / Beveled Trapezoid Path
        ctx.beginPath();
        ctx.moveTo(bX, bY);
        ctx.lineTo(bX + btnW - 16, bY);
        ctx.lineTo(bX + btnW, bY + btnH * 0.5);
        ctx.lineTo(bX + btnW - 16, bY + btnH);
        ctx.lineTo(bX, bY + btnH);
        ctx.closePath();

        if (isSelected) {
          // Fiery Orange-to-Yellow Gradient Fill
          const btnGrad = ctx.createLinearGradient(bX, bY, bX + btnW, bY);
          btnGrad.addColorStop(0, '#ff1a00');
          btnGrad.addColorStop(0.24, '#ff5500');
          btnGrad.addColorStop(0.68, '#ff9600');
          btnGrad.addColorStop(1, '#ffcc00');
          ctx.fillStyle = btnGrad;
          ctx.shadowColor = 'rgba(255, 80, 0, 0.9)';
          ctx.shadowBlur = 22;
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Text (Bold, Dark contrast)
          ctx.font = 'italic 800 18px "Rajdhani", sans-serif';
          ctx.fillStyle = '#120200';
          ctx.fillText(opt, bX + 18, bY + 27);

          // Sub badge
          ctx.font = 'bold 10px "Share Tech Mono", monospace';
          ctx.fillStyle = '#000000';
          ctx.fillRect(bX + btnW - 85, bY + 12, 60, 18);
          ctx.fillStyle = '#ffcc00';
          ctx.fillText('SELECT', bX + btnW - 76, bY + 25);
        } else {
          // Unselected Dark Gradient Fill with metallic border
          const btnGrad = ctx.createLinearGradient(bX, bY, bX + btnW, bY);
          btnGrad.addColorStop(0, '#1c1a24');
          btnGrad.addColorStop(0.7, '#131118');
          btnGrad.addColorStop(1, '#08080c');
          ctx.fillStyle = btnGrad;
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 60, 30, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Left red highlight line
          ctx.fillStyle = '#ff3300';
          ctx.fillRect(bX, bY, 3, btnH);

          // Text (Bold condensed italic white)
          ctx.font = 'italic 700 18px "Rajdhani", sans-serif';
          ctx.fillStyle = '#e6ebf5';
          ctx.fillText(opt, bX + 18, bY + 27);
        }
        ctx.restore();
      });

      // 5. Lower-Right Information Box
      ctx.save();
      const infoX = 490;
      const infoY = 345;
      const infoW = 430;
      const infoH = 125;

      // Information Header
      ctx.font = 'italic 800 20px "Rajdhani", sans-serif';
      const infoHGrad = ctx.createLinearGradient(infoX, infoY - 10, infoX + 200, infoY - 10);
      infoHGrad.addColorStop(0, '#fff080');
      infoHGrad.addColorStop(0.5, '#ff7700');
      infoHGrad.addColorStop(1, '#ff2200');
      ctx.fillStyle = infoHGrad;
      ctx.shadowColor = 'rgba(255, 60, 0, 0.85)';
      ctx.shadowBlur = 10;
      ctx.fillText('INFORMATION', infoX, infoY - 8);
      ctx.shadowBlur = 0;

      // Information Box container
      ctx.fillStyle = 'rgba(10, 8, 14, 0.88)';
      ctx.fillRect(infoX, infoY, infoW, infoH);
      ctx.strokeStyle = 'rgba(255, 60, 20, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(infoX, infoY, infoW, infoH);

      // Thumbnail slot
      ctx.fillStyle = '#ff3300';
      ctx.fillRect(infoX + 12, infoY + 12, 110, 85);
      ctx.strokeStyle = 'rgba(255, 120, 50, 0.7)';
      ctx.strokeRect(infoX + 12, infoY + 12, 110, 85);
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('ASTRAL', infoX + 22, infoY + 52);
      ctx.fillText('CLASH', infoX + 26, infoY + 68);

      // Text Slot
      ctx.font = 'bold 13px "Rajdhani", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('*NEON RUMBLE Service is active!', infoX + 132, infoY + 30);

      ctx.font = '10px "Share Tech Mono", monospace';
      ctx.fillStyle = '#b8c2d8';
      ctx.fillText('Hero Ardra has arrived! Master 8-way free movement', infoX + 132, infoY + 52);
      ctx.fillText('in the Dojo, or challenge the 5-Stage Villain Gauntlet.', infoX + 132, infoY + 68);

      ctx.fillStyle = '#ff9900';
      ctx.fillText('Official Portal: arcade://neon-rumble/ex-layer', infoX + 132, infoY + 90);

      // Carousel dots
      ctx.fillStyle = '#ff7700';
      ctx.fillRect(infoX + infoW / 2 - 12, infoY + infoH - 12, 16, 6);
      ctx.fillStyle = 'rgba(255, 68, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(infoX + infoW / 2 + 12, infoY + infoH - 9, 3, 0, Math.PI * 2);
      ctx.arc(infoX + infoW / 2 + 22, infoY + infoH - 9, 3, 0, Math.PI * 2);
      ctx.fill();

      // Information display prompt
      ctx.fillStyle = '#ffaa33';
      ctx.font = '10px "Share Tech Mono", monospace';
      ctx.fillText('▲ Information Display', infoX + infoW - 140, infoY + infoH - 8);
      ctx.restore();

      // 6. Bottom Bar & Controls
      ctx.save();
      ctx.fillStyle = 'rgba(10, 8, 14, 0.95)';
      ctx.fillRect(0, 495, 960, 45);
      ctx.strokeStyle = '#ff3300';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 495); ctx.lineTo(960, 495);
      ctx.stroke();

      const descriptions = [
        'Battle through the 5-stage progressive villain gauntlet with Hero Ardra.',
        'Experience fluid 8-way omnidirectional movement, inertia physics, and katana swordplay.',
        'Practice combat combos, special moves, and tongue lash supers with infinite meter.',
        'Learn the fundamentals of attacks, blocks, cancels, and special arts.',
        'Adjust audio volume, visual effects, CRT filters, and touch controls.',
        'View your battle records, max combo scores, and high score rankings.'
      ];
      const curDesc = descriptions[this.titleIndex] || '';

      ctx.fillStyle = '#ff2200';
      ctx.fillRect(20, 506, 85, 22);
      ctx.font = 'bold 11px "Rajdhani", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('MISSION INFO', 24, 521);

      ctx.font = 'italic 600 13px "Rajdhani", sans-serif';
      ctx.fillStyle = '#ffd080';
      ctx.fillText(curDesc, 115, 522);

      ctx.font = '11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#8899aa';
      ctx.fillText('[W/S] Navigate  •  [ENTER/F] Select  •  [ESC] Back', 610, 522);
      ctx.restore();

      ctx.restore();
    }

    // =========================================================================
    // 3. CHARACTER SELECT SCREEN
    // =========================================================================
    drawCharSelect(ctx) {
      ctx.save();
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, 960, 540);

      // Header
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.fillText('HERO DOSSIER & VILLAIN BOUNTIES', 480, 48);
      ctx.shadowBlur = 0;

      // =======================================================================
      // LEFT COLUMN: CHOSEN HERO (ARDRA - LOCKED)
      // =======================================================================
      const hx = 45;
      const hy = 72;
      const hw = 415;
      const hh = 410;

      ctx.fillStyle = '#101322';
      ctx.fillRect(hx, hy, hw, hh);
      ctx.strokeStyle = '#a820ff';
      ctx.lineWidth = 3;
      ctx.strokeRect(hx, hy, hw, hh);

      // Hero Tag
      ctx.fillStyle = '#a820ff';
      ctx.fillRect(hx + 4, hy + 4, hw - 8, 30);
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('★ CHOSEN HERO: ARDRA [LOCKED] ★', hx + hw / 2, hy + 24);

      // Hero Portrait
      this.drawPortraitSilhouette(ctx, 'Ardra', hx + 85, hy + 130);

      // Hero Overview (Right of portrait)
      ctx.textAlign = 'left';
      ctx.font = 'bold 15px "Press Start 2P", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('ARDRA', hx + 155, hy + 85);
      ctx.font = '12px "Share Tech Mono", monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('THE SHADOW STORMBLADE (NINJA)', hx + 155, hy + 105);
      ctx.fillStyle = '#b5c0e2';
      ctx.fillText('PWR ★★★★☆  SPD ★★★★★  RNG ★★★★☆', hx + 155, hy + 128);
      ctx.fillText('Style: Astral Katana Shinobi', hx + 155, hy + 148);

      // Abilities Divider
      ctx.strokeStyle = '#2b314d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hx + 20, hy + 175);
      ctx.lineTo(hx + hw - 20, hy + 175);
      ctx.stroke();

      // Abilities List
      ctx.font = 'bold 11px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('HERO ARSENAL:', hx + 20, hy + 196);

      // Normal Attacks
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('WEAPON [F / G / Touch]:', hx + 20, hy + 220);
      ctx.font = '12px "Rajdhani", sans-serif';
      ctx.fillStyle = '#cbd5f5';
      ctx.fillText('Astral Katana - Swift drawing Iaido slices & overhead crescent blade slashes.', hx + 20, hy + 236);

      // Special
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillStyle = '#a820ff';
      ctx.fillText('SPECIAL [H / L / Touch]:', hx + 20, hy + 260);
      ctx.font = '12px "Rajdhani", sans-serif';
      ctx.fillStyle = '#cbd5f5';
      ctx.fillText('Astral Cyclone - Spinning katana whirlwind slicing through enemy lines.', hx + 20, hy + 276);

      // Super
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillStyle = '#ff0077';
      ctx.fillText('SIGNATURE SUPER [T / O / Touch]:', hx + 20, hy + 300);
      ctx.font = 'bold 12px "Rajdhani", sans-serif';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('"Bitchy Timeee!!!" - Long Tongue Lash (8s Cooldown)', hx + 20, hy + 316);
      ctx.font = '12px "Rajdhani", sans-serif';
      ctx.fillStyle = '#cbd5f5';
      ctx.fillText('Lowers ninja mask to lash out a 225px whipping barbed tongue!', hx + 20, hy + 332);

      // Hero Ready Confirmation
      ctx.fillStyle = '#162238';
      ctx.fillRect(hx + 20, hy + 350, hw - 40, 42);
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx + 20, hy + 350, hw - 40, 42);
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = '#00ff66';
      ctx.textAlign = 'center';
      ctx.fillText('✓ HERO LOCKED & READY TO FIGHT', hx + hw / 2, hy + 376);

      // =======================================================================
      // RIGHT COLUMN: 5-STAGE VILLAIN BOUNTY LADDER (From Image 1)
      // =======================================================================
      const rx = 485;
      const ry = 72;
      const rw = 430;
      const rh = 416;

      ctx.fillStyle = '#101322';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = '#ff0077';
      ctx.lineWidth = 3;
      ctx.strokeRect(rx, ry, rw, rh);

      // Ladder Header
      ctx.fillStyle = '#ff0077';
      ctx.fillRect(rx + 4, ry + 4, rw - 8, 28);
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('VILLAIN GAUNTLET (5 STAGES) + FINAL BOSS', rx + rw / 2, ry + 22);

      const villains = [
        { num: 'STAGE 1', name: 'RED ONI', title: 'THE HORNED BRAWLER', arena: 'Graffiti Strip', color: '#e62020' },
        { num: 'STAGE 2', name: 'VOLT MUMMY', title: 'THE BATTERY PUNK', arena: 'Cyber Junkyard', color: '#ffea00' },
        { num: 'STAGE 3', name: 'NOIR DOLL', title: 'THE GOTHIC LOLITA', arena: 'Neon Docks', color: '#ffffff' },
        { num: 'STAGE 4', name: 'JESTER GHOST', title: 'THE TRICKSTER PHANTOM', arena: 'Demon Shrine', color: '#ff6600' },
        { num: 'STAGE 5', name: 'LILITH', title: 'THE DEMON QUEEN', arena: 'Blood Astral Rift', color: '#e61a38' },
        { num: 'STAGE 6', name: 'OVERLORD TITAN', title: 'FINAL BOSS: THE JUGGERNAUT', arena: 'Quantum Void', color: '#ff2200', isBoss: true }
      ];

      villains.forEach((v, idx) => {
        const vy = ry + 34 + idx * 62;
        ctx.fillStyle = v.isBoss ? '#200812' : '#16192d';
        ctx.fillRect(rx + 14, vy, rw - 28, 57);
        ctx.strokeStyle = v.color;
        ctx.lineWidth = v.isBoss ? 2.5 : 1.5;
        ctx.strokeRect(rx + 14, vy, rw - 28, 57);

        // Stage number badge
        ctx.fillStyle = v.color;
        ctx.fillRect(rx + 20, vy + 6, v.isBoss ? 84 : 75, 17);
        ctx.font = 'bold 8px "Press Start 2P", monospace';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(v.num, rx + 20 + (v.isBoss ? 42 : 37), vy + 18);

        // Name & Arena
        ctx.textAlign = 'left';
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillStyle = v.isBoss ? '#ffdd00' : '#ffffff';
        ctx.fillText(v.name, rx + (v.isBoss ? 112 : 105), vy + 19);

        ctx.font = '9px "Share Tech Mono", monospace';
        ctx.fillStyle = v.color;
        ctx.fillText(v.title, rx + 20, vy + 36);
        ctx.fillStyle = '#8e9bbb';
        ctx.fillText(`ARENA: ${v.arena}`, rx + 20, vy + 49);
      });

      // =======================================================================
      // BOTTOM LAUNCH PROMPT
      // =======================================================================
      ctx.textAlign = 'center';
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = '#00ff66';
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 10;
      ctx.fillText('PRESS [LIGHT / ENTER / TAP] TO START CAMPAIGN! ⚔️', 480, 514);
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    drawPortraitSilhouette(ctx, fId, x, y) {
      // Draw miniature stylized fighter in portrait box
      ctx.save();
      const meta = this.fighterMeta[fId];
      ctx.fillStyle = meta.color;
      ctx.beginPath();
      ctx.arc(x, y - 25, 20, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.fillRect(x - 22, y - 5, 44, 48); // Body

      if (fId === 'Ardra') {
        // =====================================================================
        // ARDRA (Image 2) - High Purple Ponytail, Red Ninja Mask, Katana
        // =====================================================================
        // Diagonal Katana Sheath strapped to back
        ctx.save();
        ctx.translate(x + 6, y - 8);
        ctx.rotate(-0.55);
        ctx.fillStyle = '#101218';
        ctx.fillRect(-6, -42, 10, 52); // Sheath
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-8, -44, 14, 5);  // Gold Tsuba
        ctx.fillStyle = '#9c27b0';
        ctx.fillRect(-5, -58, 8, 14);  // Tsuka Hilt
        ctx.fillStyle = '#c41e3a';
        ctx.beginPath(); // Red cord ribbon
        ctx.moveTo(0, -42);
        ctx.lineTo(10, -32);
        ctx.lineTo(4, -26);
        ctx.fill();
        ctx.restore();

        // High Purple Ponytail trailing upward
        ctx.fillStyle = '#9c27b0';
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 36);
        ctx.quadraticCurveTo(x - 28, y - 48, x - 32, y - 16);
        ctx.quadraticCurveTo(x - 22, y - 24, x - 12, y - 28);
        ctx.closePath();
        ctx.fill();

        // Hair tie
        ctx.fillStyle = '#c41e3a';
        ctx.fillRect(x - 10, y - 38, 8, 6);

        // Head (fair skin)
        ctx.fillStyle = '#ffe0d0';
        ctx.beginPath();
        ctx.arc(x, y - 25, 18, 0, Math.PI * 2);
        ctx.fill();

        // Purple Bangs
        ctx.fillStyle = '#9c27b0';
        ctx.beginPath();
        ctx.moveTo(x - 18, y - 32);
        ctx.lineTo(x + 16, y - 32);
        ctx.lineTo(x + 10, y - 24);
        ctx.lineTo(x - 6, y - 22);
        ctx.closePath();
        ctx.fill();

        // Cyan Glowing Ninja Eyes
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(x - 9, y - 28, 5, 3);
        ctx.fillRect(x + 4, y - 28, 5, 3);

        // Crimson Ninja Cowl / Face Mask (Image 2)
        ctx.fillStyle = '#c41e3a';
        ctx.beginPath();
        ctx.moveTo(x - 16, y - 24);
        ctx.lineTo(x + 16, y - 24);
        ctx.lineTo(x + 10, y - 10);
        ctx.lineTo(x - 10, y - 10);
        ctx.closePath();
        ctx.fill();

        // Shinobi Torso (Asymmetric White Wrap + Navy Tunic)
        ctx.fillStyle = '#141a32';
        ctx.fillRect(x - 18, y - 7, 36, 30);
        ctx.fillStyle = '#f0f3fa';
        ctx.beginPath();
        ctx.moveTo(x - 16, y - 7);
        ctx.lineTo(x + 4, y - 7);
        ctx.lineTo(x - 6, y + 16);
        ctx.lineTo(x - 16, y + 16);
        ctx.closePath();
        ctx.fill();

        // Red Braided Obi Rope + Gold Ring
        ctx.fillStyle = '#c41e3a';
        ctx.fillRect(x - 18, y + 14, 36, 8);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y + 18, 5, 0, Math.PI * 2);
        ctx.stroke();

        // Black Pleated Tactical Skirt
        ctx.fillStyle = '#0d0f18';
        ctx.beginPath();
        ctx.moveTo(x - 18, y + 22);
        ctx.lineTo(x + 18, y + 22);
        ctx.lineTo(x + 22, y + 42);
        ctx.lineTo(x - 22, y + 42);
        ctx.closePath();
        ctx.fill();

        // Katana draw grip in hand
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 4);
        ctx.lineTo(x + 28, y - 16);
        ctx.stroke();
      } else if (fId === 'Rex') {
        // Spiky hair & yellow gauntlet
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(x + 18, y + 8, 14, 16);
      } else if (fId === 'Volt') {
        // Visor
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(x - 10, y - 26, 20, 6);
      } else {
        // Titan massive shoulders
        ctx.fillStyle = '#d49b38';
        ctx.fillRect(x - 32, y - 10, 15, 18);
        ctx.fillRect(x + 17, y - 10, 15, 18);
      }

      ctx.restore();
    }

    // =========================================================================
    // 4. STAGE SELECT SCREEN
    // =========================================================================
    drawStageSelect(ctx) {
      ctx.save();
      ctx.fillStyle = '#090a12';
      ctx.fillRect(0, 0, 960, 540);

      ctx.textAlign = 'center';
      ctx.font = 'bold 26px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 15;
      ctx.fillText('SELECT BATTLE ARENA', 480, 65);
      ctx.shadowBlur = 0;

      // 6 Stage Cards
      const cardW = 136;
      const cardH = 240;
      const startX = 35;
      const cardY = 130;

      const stageNames = ['GRAFFITI', 'CYBER JUNK', 'NEON DOCKS', 'DEMON SHRINE', 'ASTRAL CORE', 'RANDOM'];
      const stageSubs = ['DISTRICT 9', 'ROBOT YARD', 'TOXIC DOCKS', 'PAGODA', 'FINAL BOSS', 'ANY ARENA'];

      this.stagesList.forEach((sKey, idx) => {
        const cx = startX + idx * (cardW + 14);
        const isSelected = idx === this.stageIndex;

        ctx.fillStyle = '#141624';
        ctx.fillRect(cx, cardY, cardW, cardH);

        if (isSelected) {
          ctx.strokeStyle = '#ffcc00';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#ffcc00';
          ctx.shadowBlur = 12;
        } else {
          ctx.strokeStyle = '#2d334e';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 0;
        }
        ctx.strokeRect(cx, cardY, cardW, cardH);
        ctx.shadowBlur = 0;

        // Card Header
        ctx.fillStyle = isSelected ? '#ffcc00' : '#333b5c';
        ctx.fillRect(cx + 4, cardY + 4, cardW - 8, 30);
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.fillStyle = isSelected ? '#000' : '#fff';
        ctx.fillText(stageNames[idx], cx + cardW / 2, cardY + 23);

        // Preview Graphics
        this.drawStageThumbnail(ctx, sKey, cx + 8, cardY + 45, cardW - 16, 135);

        // Subtitle
        ctx.font = '11px "Share Tech Mono", monospace';
        ctx.fillStyle = sKey === 'AstralCore' ? '#ff3300' : '#ffcc00';
        ctx.fillText(stageSubs[idx], cx + cardW / 2, cardY + 205);

        if (isSelected) {
          ctx.fillStyle = '#00ff66';
          ctx.font = 'bold 9px "Press Start 2P", monospace';
          ctx.fillText('PRESS [F/ENTER]', cx + cardW / 2, cardY + 228);
        }
      });

      ctx.font = '12px "Share Tech Mono", monospace';
      ctx.fillStyle = '#808cb4';
      ctx.fillText('[A / D] or [ARROWS] Choose Stage  •  [F / ENTER] Fight!  •  [ESC] Back', 480, 480);

      ctx.restore();
    }

    drawStageThumbnail(ctx, stageKey, x, y, w, h) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();

      if (stageKey === 'GraffitiStrip') {
        // Sunset Comic Graffiti Strip
        ctx.fillStyle = '#ff8833';
        ctx.fillRect(x, y, w, h);
        // Sun Mandala
        ctx.strokeStyle = '#ffe066';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 35, 22, 0, Math.PI * 2);
        ctx.stroke();
        // Silhouette buildings
        ctx.fillStyle = '#221a36';
        ctx.fillRect(x + 10, y + 45, 35, 70);
        ctx.fillRect(x + 50, y + 35, 45, 80);
        ctx.fillRect(x + 100, y + 55, 30, 60);
        // Yellow curb & asphalt
        ctx.fillStyle = '#12101a';
        ctx.fillRect(x, y + h - 25, w, 25);
        ctx.fillStyle = '#ffdd33';
        ctx.fillRect(x, y + h - 25, w, 4);
      } else if (stageKey === 'CyberJunk') {
        // Electric Violet Cyber Junkyard
        ctx.fillStyle = '#220844';
        ctx.fillRect(x, y, w, h);
        // Lightning Mandala
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 35, 24, 0, Math.PI * 2);
        ctx.stroke();
        // Scrap Robot Skull & Junk piles
        ctx.fillStyle = '#3a2060';
        ctx.fillRect(x + 35, y + 45, 60, 55);
        ctx.fillStyle = '#100a20';
        ctx.fillRect(x, y + h - 25, w, 25);
        // Hazard curb
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(x, y + h - 25, w, 4);
      } else if (stageKey === 'NeonDocks') {
        // Toxic Green Docks
        ctx.fillStyle = '#082520';
        ctx.fillRect(x, y, w, h);
        // Spiral moon
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 35, 20, 0, Math.PI * 2);
        ctx.stroke();
        // Shipping container silhouette
        ctx.fillStyle = '#0f4035';
        ctx.fillRect(x + 15, y + 55, 50, 45);
        ctx.fillRect(x + 70, y + 45, 55, 55);
        ctx.fillStyle = '#061614';
        ctx.fillRect(x, y + h - 25, w, 25);
        // Neon green curb
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(x, y + h - 25, w, 4);
      } else if (stageKey === 'DemonShrine') {
        // Crimson Dusk Demon Shrine
        ctx.fillStyle = '#3a0815';
        ctx.fillRect(x, y, w, h);
        // Demon Eye Mandala
        ctx.strokeStyle = '#ff2255';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 35, 20, 0, Math.PI * 2);
        ctx.stroke();
        // Torii Gate silhouette
        ctx.fillStyle = '#e61a38';
        ctx.fillRect(x + 35, y + 40, 60, 6);
        ctx.fillRect(x + 45, y + 46, 6, 50);
        ctx.fillRect(x + 78, y + 46, 6, 50);
        ctx.fillStyle = '#18040a';
        ctx.fillRect(x, y + h - 25, w, 25);
        // Crimson curb
        ctx.fillStyle = '#ff2255';
        ctx.fillRect(x, y + h - 25, w, 4);
      } else if (stageKey === 'AstralCore') {
        // Quantum Singularity Void / Astral Core
        ctx.fillStyle = '#12041e';
        ctx.fillRect(x, y, w, h);
        // Cosmic Singularity
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 35, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ff2200';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 35, 10, 0, Math.PI * 2);
        ctx.fill();
        // Spire pillars
        ctx.fillStyle = '#2a083a';
        ctx.fillRect(x + 10, y + 45, 22, 70);
        ctx.fillRect(x + w - 32, y + 45, 22, 70);
        ctx.fillStyle = '#080210';
        ctx.fillRect(x, y + h - 25, w, 25);
        // Molten red curb
        ctx.fillStyle = '#ff0033';
        ctx.fillRect(x, y + h - 25, w, 4);
      } else {
        // Random Stage Question mark
        ctx.fillStyle = '#1c1830';
        ctx.fillRect(x, y, w, h);
        ctx.font = 'bold 48px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.textAlign = 'center';
        ctx.fillText('?', x + w / 2, y + h / 2 + 18);
      }

      ctx.restore();
    }

    // =========================================================================
    // 5. HOW TO PLAY SCREEN
    // =========================================================================
    drawHowToPlay(ctx) {
      ctx.save();
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, 960, 540);

      ctx.textAlign = 'center';
      ctx.font = 'bold 24px "Press Start 2P", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.fillText('HOW TO PLAY & CONTROLS', 480, 50);
      ctx.shadowBlur = 0;

      // P1 Box
      ctx.fillStyle = '#121424';
      ctx.fillRect(50, 85, 410, 370);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 85, 410, 370);

      ctx.font = 'bold 15px "Press Start 2P", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('PLAYER 1 CONTROLS', 255, 118);

      ctx.font = '14px "Share Tech Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff';
      const p1Lines = [
        '[W] - Jump / Forward Jump',
        '[A / D] - Walk Left / Right',
        '[S] - Crouch',
        '[F] - Light Attack (Fast combo starter)',
        '[G] - Heavy Attack (Knockback strike)',
        '[H] - Special Move (Cost: 25% Meter)',
        '[T] or [F+G] - SUPER ATTACK (100% Meter)',
        '[R] or [Hold Back] - Guard / Block',
        '',
        'COMBOS: Light -> Light -> Heavy',
        'Jumping Light -> Crouch Heavy (Sweep)'
      ];
      p1Lines.forEach((l, i) => ctx.fillText(l, 70, 150 + i * 26));

      // P2 Box
      ctx.fillStyle = '#121424';
      ctx.fillRect(500, 85, 410, 370);
      ctx.strokeStyle = '#ff0077';
      ctx.strokeRect(500, 85, 410, 370);

      ctx.font = 'bold 15px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff0077';
      ctx.fillText('PLAYER 2 CONTROLS', 705, 118);

      ctx.font = '14px "Share Tech Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff';
      const p2Lines = [
        '[UP ARROW] - Jump / Forward Jump',
        '[LEFT / RIGHT] - Walk Left / Right',
        '[DOWN ARROW] - Crouch',
        '[J] - Light Attack (Fast combo starter)',
        '[K] - Heavy Attack (Knockback strike)',
        '[L] - Special Move (Cost: 25% Meter)',
        '[O] or [J+K] - SUPER ATTACK (100% Meter)',
        '[;] or [Hold Back] - Guard / Block',
        '',
        'BLOCKING: Reduces incoming damage & prevents',
        'knockdowns. Build meter by hitting or blocking!'
      ];
      p2Lines.forEach((l, i) => ctx.fillText(l, 520, 150 + i * 26));

      ctx.textAlign = 'center';
      ctx.font = 'bold 13px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('PRESS [F], [ENTER], OR [ESC] TO RETURN', 480, 495);

      ctx.restore();
    }

    // =========================================================================
    // 6. SETTINGS SCREEN
    // =========================================================================
    drawSettings(ctx) {
      ctx.save();
      ctx.fillStyle = '#080910';
      ctx.fillRect(0, 0, 960, 540);

      ctx.textAlign = 'center';
      ctx.font = 'bold 26px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 12;
      ctx.fillText('SYSTEM SETTINGS', 480, 60);
      ctx.shadowBlur = 0;

      const s = this.storage.settings;

      this.settingsOptions.forEach((opt, idx) => {
        const isSelected = idx === this.settingsIndex;
        const optY = 125 + idx * 48;

        let valText = '';
        if (opt === 'SFX VOLUME') valText = `${Math.round(s.sfxVolume * 100)}%`;
        else if (opt === 'MUSIC VOLUME') valText = `${Math.round(s.musicVolume * 100)}%`;
        else if (opt === 'SCREEN SHAKE') valText = s.screenShake ? '[ON]' : '[OFF]';
        else if (opt === 'CRT FILTER') valText = s.crtEnabled ? '[ON]' : '[OFF]';
        else if (opt === 'SCANLINES') valText = s.scanlines ? '[ON]' : '[OFF]';
        else if (opt === 'SHOW HITBOXES') valText = s.showHitboxes ? '[ON]' : '[OFF]';

        if (isSelected) {
          ctx.fillStyle = '#ff0077';
          ctx.fillRect(180, optY - 26, 600, 36);
          ctx.font = 'bold 15px "Press Start 2P", monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.fillText(`► ${opt}`, 210, optY);
          ctx.textAlign = 'right';
          ctx.fillText(valText, 750, optY);
        } else {
          ctx.font = 'bold 14px "Press Start 2P", monospace';
          ctx.fillStyle = '#949bb8';
          ctx.textAlign = 'left';
          ctx.fillText(opt, 210, optY);
          ctx.textAlign = 'right';
          ctx.fillText(valText, 750, optY);
        }
      });

      ctx.textAlign = 'center';
      ctx.font = '12px "Share Tech Mono", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('[W / S] Navigate  •  [A / D] Adjust Value  •  [F / ENTER] Toggle / Save', 480, 490);

      ctx.restore();
    }

    // =========================================================================
    // 7. STATS & RECORDS SCREEN
    // =========================================================================
    drawStats(ctx) {
      ctx.save();
      ctx.fillStyle = '#0b0c16';
      ctx.fillRect(0, 0, 960, 540);

      ctx.textAlign = 'center';
      ctx.font = 'bold 24px "Press Start 2P", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('ARCADE HALL OF FAME & RECORDS', 480, 60);

      const st = this.storage.stats;

      ctx.fillStyle = '#121526';
      ctx.fillRect(180, 100, 600, 340);
      ctx.strokeStyle = '#383e60';
      ctx.strokeRect(180, 100, 600, 340);

      const rows = [
        ['TOTAL MATCHES PLAYED', st.matchesPlayed],
        ['PLAYER 1 VICTORIES', st.p1Wins],
        ['PLAYER 2 VICTORIES', st.p2Wins],
        ['TOTAL K.O. FINISHES', st.totalKOs],
        ['HIGHEST COMBO RECORD', `${st.highestCombo} HITS`],
        ['FAVORITE FIGHTER', st.favoriteFighter.toUpperCase()]
      ];

      rows.forEach((r, idx) => {
        const ry = 145 + idx * 46;
        ctx.font = 'bold 13px "Press Start 2P", monospace';
        ctx.fillStyle = '#8f9bbd';
        ctx.textAlign = 'left';
        ctx.fillText(r[0], 215, ry);

        ctx.font = 'bold 15px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.textAlign = 'right';
        ctx.fillText(r[1].toString(), 745, ry);
      });

      ctx.textAlign = 'center';
      ctx.font = '13px "Press Start 2P", monospace';
      ctx.fillStyle = '#ff0077';
      ctx.fillText('PRESS [F], [ENTER], OR [ESC] TO RETURN', 480, 485);

      ctx.restore();
    }

    // =========================================================================
    // 8. PAUSE SCREEN
    // =========================================================================
    drawPause(ctx) {
      ctx.save();
      // Translucent dim
      ctx.fillStyle = 'rgba(6, 6, 12, 0.85)';
      ctx.fillRect(0, 0, 960, 540);

      ctx.textAlign = 'center';
      ctx.font = 'bold 36px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 15;
      ctx.fillText('PAUSED', 480, 150);
      ctx.shadowBlur = 0;

      this.pauseOptions.forEach((opt, idx) => {
        const isSelected = idx === this.pauseIndex;
        const oy = 230 + idx * 46;

        if (isSelected) {
          ctx.font = 'bold 16px "Press Start 2P", monospace';
          ctx.fillStyle = '#00f0ff';
          ctx.fillText(`►  ${opt}  ◄`, 480, oy);
        } else {
          ctx.font = 'bold 14px "Press Start 2P", monospace';
          ctx.fillStyle = '#7a84a6';
          ctx.fillText(opt, 480, oy);
        }
      });

      ctx.font = '12px "Share Tech Mono", monospace';
      ctx.fillStyle = '#888';
      ctx.fillText('[W / S] or [UP / DOWN] Navigate  •  [F / ENTER] Select  •  [ESC] Resume', 480, 460);

      ctx.restore();
    }

    // =========================================================================
    // 9. MATCH VICTORY SCREEN
    // =========================================================================
    drawVictory(ctx, winnerNum, winnerFighter) {
      ctx.save();
      ctx.fillStyle = 'rgba(5, 5, 12, 0.92)';
      ctx.fillRect(0, 0, 960, 540);

      const gs = window.NeonRumble.GameState;
      const isCampaign = gs && gs.isCampaignMode;
      const isCampaignWin = isCampaign && winnerNum === 1;
      const isCampaignFail = isCampaign && winnerNum === 2;

      ctx.textAlign = 'center';

      if (isCampaignWin) {
        // GRAND CHAMPION ARDRA CAMPAIGN VICTORY
        ctx.font = 'bold 34px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 25;
        ctx.fillText('CAMPAIGN COMPLETE! 🏆', 480, 110);

        ctx.font = 'bold 18px "Press Start 2P", monospace';
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillText('★ SUPREME CHAMPION ARDRA ★', 480, 155);
        ctx.shadowBlur = 0;

        ctx.font = 'italic 18px "Rajdhani", sans-serif';
        ctx.fillStyle = '#e0e6ff';
        ctx.fillText('"The cosmos is cleansed! All four villain realms have fallen before my stormblades!"', 480, 215);
      } else if (isCampaignFail) {
        // ARDRA DEFEATED BY VILLAIN
        ctx.font = 'bold 36px "Press Start 2P", monospace';
        ctx.fillStyle = '#ff1133';
        ctx.shadowColor = '#ff1133';
        ctx.shadowBlur = 20;
        const sNum = (gs ? gs.campaignStage + 1 : 1);
        ctx.fillText(`STAGE ${sNum} DEFEAT!`, 480, 110);

        ctx.font = 'bold 16px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillText(`HERO ARDRA WAS OVERCOME BY ${winnerFighter.name}`, 480, 155);
        ctx.shadowBlur = 0;

        ctx.font = 'italic 18px "Rajdhani", sans-serif';
        ctx.fillStyle = '#e0e6ff';
        ctx.fillText('"Do not give up, Ardra! Rise, unleash your long tongue lash, and conquer!"', 480, 215);
      } else {
        // STANDARD MATCH
        const col = winnerNum === 1 ? '#00f0ff' : '#ff0077';
        ctx.font = 'bold 40px "Press Start 2P", monospace';
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 20;
        ctx.fillText(`PLAYER ${winnerNum} WINS!`, 480, 120);

        ctx.font = 'bold 20px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText(winnerFighter.title, 480, 165);
        ctx.shadowBlur = 0;

        const quotes = {
          Ardra: '"The storm obeys my blade. You were not ready."',
          Rex: '"My fists speak louder than any words. Down for the count!"',
          Volt: '"Circuit overloaded! That was electrifying."',
          Titan: '"The earth stands firm. None can break this armor!"'
        };

        ctx.font = 'italic 18px "Rajdhani", sans-serif';
        ctx.fillStyle = '#e0e6ff';
        ctx.fillText(quotes[winnerFighter.id] || '"Victory is mine!"', 480, 220);
      }

      // Menu Options
      this.victoryOptions.forEach((opt, idx) => {
        const isSelected = idx === this.victoryIndex;
        const oy = 295 + idx * 46;

        if (isSelected) {
          ctx.font = 'bold 16px "Press Start 2P", monospace';
          ctx.fillStyle = '#ffcc00';
          ctx.shadowColor = '#ffcc00';
          ctx.shadowBlur = 10;
          ctx.fillText(`►  ${opt}  ◄`, 480, oy);
          ctx.shadowBlur = 0;
        } else {
          ctx.font = 'bold 14px "Press Start 2P", monospace';
          ctx.fillStyle = '#7a84a6';
          ctx.fillText(opt, 480, oy);
        }
      });

      ctx.font = '12px "Share Tech Mono", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('[W / S / Touch D-pad] Navigate  •  [F / ENTER / Tap] Select', 480, 475);

      ctx.restore();
    }
  }

  window.NeonRumble.MenuScreens = new MenuScreens();
})();
