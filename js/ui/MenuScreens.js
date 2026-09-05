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
      this.titleOptions = ['HERO CAMPAIGN (ARDRA)', 'TRAINING MODE', 'COMBAT TUTORIAL', 'SETTINGS', 'ARCADE STATS'];
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
      this.stagesList = ['NeonAlley', 'AbandonedArcade', 'SkylineRooftop', 'Random'];
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
    // 2. TITLE SCREEN (MAIN MENU)
    // =========================================================================
    drawTitle(ctx) {
      ctx.save();
      // Background gradient with grid
      const grad = ctx.createLinearGradient(0, 0, 0, 540);
      grad.addColorStop(0, '#0a0815');
      grad.addColorStop(0.5, '#1b0d2a');
      grad.addColorStop(1, '#0e0b1c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 960, 540);

      // Perspective retro neon grid lines
      ctx.strokeStyle = 'rgba(168, 32, 255, 0.25)';
      ctx.lineWidth = 1;
      for (let x = -200; x < 1200; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 340);
        ctx.lineTo(x + (x - 480) * 1.5, 540);
        ctx.stroke();
      }
      for (let y = 340; y < 540; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(960, y);
        ctx.stroke();
      }

      // Title Logo
      ctx.textAlign = 'center';
      const pulse = Math.sin(this.timer * 0.08) * 3;

      ctx.font = 'bold 50px "Press Start 2P", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 25;
      ctx.fillText('NEON RUMBLE', 480, 110 + pulse);

      ctx.font = 'bold 22px "Press Start 2P", monospace';
      ctx.fillStyle = '#ff0077';
      ctx.shadowColor = '#ff0077';
      ctx.shadowBlur = 18;
      ctx.fillText('★ ASTRAL CLASH ★', 480, 150 + pulse);
      ctx.shadowBlur = 0;

      // Menu Options
      ctx.font = 'bold 15px "Press Start 2P", monospace';
      this.titleOptions.forEach((opt, idx) => {
        const isSelected = idx === this.titleIndex;
        const optY = 220 + idx * 42;

        if (isSelected) {
          ctx.fillStyle = '#ffcc00';
          ctx.shadowColor = '#ffcc00';
          ctx.shadowBlur = 12;
          ctx.fillText(`►  ${opt}  ◄`, 480, optY);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#8e96b8';
          ctx.fillText(opt, 480, optY);
        }
      });

      // Quick Help Bottom
      ctx.font = '11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('[W / S] or [UP / DOWN] Navigate  •  [F] or [ENTER] Select', 480, 505);

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
      ctx.fillText('THE ASTRAL STORMBLADE', hx + 155, hy + 105);
      ctx.fillStyle = '#b5c0e2';
      ctx.fillText('PWR ★★★★☆  SPD ★★★★★  RNG ★★★★☆', hx + 155, hy + 128);
      ctx.fillText('Style: Stormblade Acrobat', hx + 155, hy + 148);

      // Abilities Divider
      ctx.strokeStyle = '#2b314d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hx + 20, hy + 180);
      ctx.lineTo(hx + hw - 20, hy + 180);
      ctx.stroke();

      // Abilities List
      ctx.font = 'bold 11px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('HERO ARSENAL:', hx + 20, hy + 202);

      // Special
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('SPECIAL [H / L / Touch]:', hx + 20, hy + 228);
      ctx.font = '12px "Rajdhani", sans-serif';
      ctx.fillStyle = '#cbd5f5';
      ctx.fillText('Astral Cyclone - spins forward rushing into a whirlwind blade flurry.', hx + 20, hy + 244);

      // Super
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillStyle = '#ff0077';
      ctx.fillText('SUPER POWER [T / O / Touch SUPER]:', hx + 20, hy + 276);
      ctx.font = 'bold 13px "Rajdhani", sans-serif';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('"Bitchy Timeee!!!" - Long Tongue Lash', hx + 20, hy + 294);
      ctx.font = '12px "Rajdhani", sans-serif';
      ctx.fillStyle = '#cbd5f5';
      ctx.fillText('Whips out a massive 225px barbed tongue across the arena! (8s Cooldown)', hx + 20, hy + 312);

      // Hero Ready Confirmation
      ctx.fillStyle = '#162238';
      ctx.fillRect(hx + 20, hy + 345, hw - 40, 42);
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx + 20, hy + 345, hw - 40, 42);
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = '#00ff66';
      ctx.textAlign = 'center';
      ctx.fillText('✓ HERO LOCKED & READY TO FIGHT', hx + hw / 2, hy + 372);

      // =======================================================================
      // RIGHT COLUMN: 4-STAGE VILLAIN BOUNTY LADDER
      // =======================================================================
      const rx = 485;
      const ry = 72;
      const rw = 430;
      const rh = 410;

      ctx.fillStyle = '#101322';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = '#ff0077';
      ctx.lineWidth = 3;
      ctx.strokeRect(rx, ry, rw, rh);

      // Ladder Header
      ctx.fillStyle = '#ff0077';
      ctx.fillRect(rx + 4, ry + 4, rw - 8, 30);
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('VILLAIN GAUNTLET (4 STAGES)', rx + rw / 2, ry + 24);

      const villains = [
        { num: 'STAGE 1', name: 'REX', title: 'THE IRON BRAWLER', arena: 'Neon Alley', color: '#cc2233' },
        { num: 'STAGE 2', name: 'VOLT', title: 'THE CYBER SPARK', arena: 'Abandoned Arcade', color: '#00f0ff' },
        { num: 'STAGE 3', name: 'TITAN', title: 'THE ARMORED JUGGERNAUT', arena: 'Skyline Rooftop', color: '#d49b38' },
        { num: 'STAGE 4', name: 'SHADOW ARDRA', title: 'FINAL BOSS: ASTRAL SHADOW', arena: 'Astral Core', color: '#ff0055' }
      ];

      villains.forEach((v, idx) => {
        const vy = ry + 44 + idx * 88;
        ctx.fillStyle = '#16192d';
        ctx.fillRect(rx + 16, vy, rw - 32, 76);
        ctx.strokeStyle = v.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rx + 16, vy, rw - 32, 76);

        // Stage number badge
        ctx.fillStyle = v.color;
        ctx.fillRect(rx + 24, vy + 12, 85, 20);
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(v.num, rx + 24 + 42, vy + 26);

        // Name & Arena
        ctx.textAlign = 'left';
        ctx.font = 'bold 13px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(v.name, rx + 120, vy + 27);

        ctx.font = '11px "Share Tech Mono", monospace';
        ctx.fillStyle = v.color;
        ctx.fillText(v.title, rx + 24, vy + 48);
        ctx.fillStyle = '#8e9bbb';
        ctx.fillText(`ARENA: ${v.arena}`, rx + 24, vy + 64);
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
        // Ponytail & astral sabers
        ctx.fillStyle = '#8822ee';
        ctx.fillRect(x - 30, y - 35, 12, 28);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 10);
        ctx.lineTo(x + 36, y - 15);
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

      // 4 Stage Cards
      const cardW = 185;
      const cardH = 240;
      const startX = 75;
      const cardY = 130;

      const stageNames = ['NEON ALLEY', 'ABANDONED ARCADE', 'SKYLINE ROOFTOP', 'RANDOM STAGE'];
      const stageSubs = ['DISTRICT 9', 'SECTOR 7 1994', 'APEX TOWER', 'ANY LOCATION'];

      this.stagesList.forEach((sKey, idx) => {
        const cx = startX + idx * (cardW + 28);
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
        ctx.font = 'bold 11px "Press Start 2P", monospace';
        ctx.fillStyle = isSelected ? '#000' : '#fff';
        ctx.fillText(stageNames[idx], cx + cardW / 2, cardY + 24);

        // Preview Graphics
        this.drawStageThumbnail(ctx, sKey, cx + 10, cardY + 45, cardW - 20, 135);

        // Subtitle
        ctx.font = '12px "Share Tech Mono", monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText(stageSubs[idx], cx + cardW / 2, cardY + 205);

        if (isSelected) {
          ctx.fillStyle = '#00ff66';
          ctx.font = 'bold 11px "Press Start 2P", monospace';
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

      if (stageKey === 'NeonAlley') {
        ctx.fillStyle = '#1b0e2b';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#ff0077';
        ctx.fillRect(x + 20, y + 20, 40, 60);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(x + 70, y + 10, 50, 70);
        ctx.fillStyle = '#111';
        ctx.fillRect(x, y + h - 30, w, 30);
      } else if (stageKey === 'AbandonedArcade') {
        ctx.fillStyle = '#181220';
        ctx.fillRect(x, y, w, h);
        // Cabinets
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(x + 20, y + 30, 25, 75);
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(x + 55, y + 30, 25, 75);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(x + 90, y + 30, 25, 75);
      } else if (stageKey === 'SkylineRooftop') {
        ctx.fillStyle = '#0f122c';
        ctx.fillRect(x, y, w, h);
        // Moon
        ctx.fillStyle = '#fff4df';
        ctx.beginPath();
        ctx.arc(x + w - 35, y + 35, 20, 0, Math.PI * 2);
        ctx.fill();
        // Towers
        ctx.fillStyle = '#1b2038';
        ctx.fillRect(x + 15, y + 40, 30, 80);
        ctx.fillRect(x + 55, y + 30, 35, 90);
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
