/**
 * UIManager.js - Combat HUD, Health Bars, Super Gauges, Announcer Banners, and Hitbox Debugger
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class UIManager {
    constructor() {
      this.announcement = null;
      this.announcementTimer = 0;
      this.announcementScale = 1.0;
      this.superPopup = null;
      this.superPopupTimer = 0;
      this.superPopupScale = 1.0;
      this.timer = 0;
      this.storage = window.NeonRumble.Storage;

      // Tutorial State & Steps
      this.currentTutorialStep = 0;
      this.isTutorialOpen = false;
      this.tutorialCallback = null;
      this.tutorialSteps = [
        {
          tag: '★ STEP 1 OF 4: ARENA MOVEMENT ★',
          title: 'HERO ARDRA: COMBAT MOVEMENT',
          icon: '🕹️',
          html: `
            <p>Master Ardra's lightning-fast agility to outmaneuver villains and control the combat arena!</p>
            <div class="tut-diagram-box">
              <div class="tut-diagram-icon">🕹️</div>
              <div class="tut-diagram-info">
                <strong>DESKTOP:</strong> <span class="tut-key-badge">W</span> Jump &bull; <span class="tut-key-badge">A</span> Move Left &bull; <span class="tut-key-badge">S</span> Crouch &bull; <span class="tut-key-badge">D</span> Move Right (or Arrow Keys)<br>
                <strong>MOBILE:</strong> Use the on-screen virtual <span class="tut-highlight">D-PAD</span> on the bottom left corner.
              </div>
            </div>
            <p style="margin-top:10px; font-size:14px; color:#a2b1d6;">
              💡 <em>Pro-Tip: Jump diagonally by pressing Jump + Left/Right to close the gap or escape corner traps!</em>
            </p>
          `
        },
        {
          tag: '★ STEP 2 OF 4: OFFENSE & COMBOS ★',
          title: 'NORMAL STRIKES & BLADE COMBOS',
          icon: '⚔️',
          html: `
            <p>Ardra wields dual astral stormblades to slice through enemies at rapid tempo!</p>
            <div class="tut-diagram-box">
              <div class="tut-diagram-icon">⚡</div>
              <div class="tut-diagram-info">
                <span class="tut-key-badge">LIGHT</span> [F / J / Touch]: Fast razor jab that interrupts enemy startups.<br>
                <span class="tut-key-badge">HEAVY</span> [G / K / Touch]: Fierce slash causing massive hitstun and knockback!
              </div>
            </div>
            <div class="tut-diagram-box" style="border-color:#ffcc00;">
              <div class="tut-diagram-icon">💥</div>
              <div class="tut-diagram-info">
                <strong style="color:#ffcc00;">KEY COMBO CHAIN:</strong><br>
                Hit with <span class="tut-highlight">LIGHT</span>, then immediately cancel into <span class="tut-highlight">HEAVY</span> for an unstoppable multi-hit combo!
              </div>
            </div>
          `
        },
        {
          tag: '★ STEP 3 OF 4: DEFENSIVE GUARD ★',
          title: 'GUARDING & IMPACT MITIGATION',
          icon: '🛡️',
          html: `
            <p>Villains hit hard! Defend Ardra to block incoming strikes and turn the tide of battle.</p>
            <div class="tut-diagram-box">
              <div class="tut-diagram-icon">🛡️</div>
              <div class="tut-diagram-info">
                <strong>HOLD GUARD:</strong> Press <span class="tut-key-badge">R</span> / <span class="tut-key-badge">;</span> or tap <span class="tut-key-badge">GUARD</span> on screen.<br>
                <strong>OR HOLD BACK:</strong> Hold the direction away from your opponent to auto-block!
              </div>
            </div>
            <p style="margin-top:10px; font-size:14px; color:#a2b1d6;">
              ⚠️ <em>Block incoming high and mid strikes standing. Hold Down + Back to block sneaky low sweeps!</em>
            </p>
          `
        },
        {
          tag: '★ STEP 4 OF 4: SIGNATURE SUPER POWER ★',
          title: 'SUPER: "BITCHY TIMEEE!!!" & TONGUE LASH',
          icon: '👅',
          html: `
            <p>When the battle heats up, unleash Ardra's signature unstoppable Super Power!</p>
            <div class="tut-diagram-box" style="border-color:#a820ff;">
              <div class="tut-diagram-icon">🌪️</div>
              <div class="tut-diagram-info">
                <span class="tut-key-badge">SPECIAL</span> [H / L / Touch]: <strong>Astral Cyclone</strong> - spins forward slashing everything in her path!
              </div>
            </div>
            <div class="tut-diagram-box" style="border-color:#ff0077; background: rgba(255, 0, 119, 0.12);">
              <div class="tut-diagram-icon">👅</div>
              <div class="tut-diagram-info">
                <strong style="color:#ff0077;">SUPER POWER [T / O / Touch SUPER]:</strong><br>
                Ardra shouts <span class="tut-accent">"Bitchy Timeee!!!"</span> and unleashes a massive whipping <span class="tut-highlight">Long Tongue</span> across 225+ px to whip, slam, and obliterate the villain!
              </div>
            </div>
            <p style="margin-top:8px; font-size:14px; color:#ffcc00;">
              ⏳ <em>Cooldown: 8-second timer with live countdown on HUD and on-screen button!</em>
            </p>
          `
        }
      ];

      this.initTutorialDOM();
      this.initMainMenuDOM();
    }

    initMainMenuDOM() {
      const menuOverlay = document.getElementById('main-menu-overlay');
      if (!menuOverlay) return;

      const buttons = menuOverlay.querySelectorAll('.menu-btn-item');
      buttons.forEach((btn, idx) => {
        btn.addEventListener('mouseenter', () => {
          const menus = window.NeonRumble.MenuScreens;
          if (menus && menus.titleIndex !== idx) {
            menus.titleIndex = idx;
            const sfx = window.NeonRumble.SoundSynth;
            if (sfx) sfx.playUI('move');
            this.syncMainMenuDOM();
          }
        });

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const gs = window.NeonRumble.GameState;
          const menus = window.NeonRumble.MenuScreens;
          if (menus) menus.titleIndex = idx;
          if (gs && gs.handleKeyDown) {
            gs.handleKeyDown('Enter', 'Enter');
          }
        });
      });
    }

    syncMainMenuDOM() {
      const menuOverlay = document.getElementById('main-menu-overlay');
      if (!menuOverlay) return;

      const gs = window.NeonRumble.GameState;
      const isTitle = gs && gs.state === 'TITLE';

      if (!isTitle) {
        if (!menuOverlay.classList.contains('hidden')) {
          menuOverlay.classList.add('hidden');
        }
        return;
      }

      if (menuOverlay.classList.contains('hidden')) {
        menuOverlay.classList.remove('hidden');
      }

      const menus = window.NeonRumble.MenuScreens;
      const currentIdx = menus ? menus.titleIndex : 0;
      const buttons = menuOverlay.querySelectorAll('.menu-btn-item');

      buttons.forEach((btn, idx) => {
        if (idx === currentIdx) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      });

      const tickerEl = document.getElementById('menu-description-ticker');
      if (tickerEl) {
        const descriptions = [
          'Battle through the 5-stage progressive villain gauntlet with Hero Ardra.',
          'Experience fluid 8-way omnidirectional movement, inertia physics, and katana swordplay.',
          'Practice combat combos, special moves, and tongue lash supers with infinite meter.',
          'Learn the fundamentals of attacks, blocks, cancels, and special arts.',
          'Adjust audio volume, visual effects, CRT filters, and touch controls.',
          'View your battle records, max combo scores, and high score rankings.'
        ];
        tickerEl.textContent = descriptions[currentIdx] || 'Select an arcade mode to proceed.';
      }
    }

    initTutorialDOM() {
      // DOM Elements
      const prevBtn = document.getElementById('btn-tutorial-prev');
      const nextBtn = document.getElementById('btn-tutorial-next');
      const startBtn = document.getElementById('btn-tutorial-start');
      const dots = document.querySelectorAll('.tutorial-steps-dots .dot');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          const sfx = window.NeonRumble.SoundSynth;
          if (sfx) sfx.playUI('move');
          this.setTutorialStep(this.currentTutorialStep - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const sfx = window.NeonRumble.SoundSynth;
          if (sfx) sfx.playUI('move');
          if (this.currentTutorialStep < this.tutorialSteps.length - 1) {
            this.setTutorialStep(this.currentTutorialStep + 1);
          } else {
            this.finishTutorial();
          }
        });
      }

      if (startBtn) {
        startBtn.addEventListener('click', () => {
          this.finishTutorial();
        });
      }

      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          const sfx = window.NeonRumble.SoundSynth;
          if (sfx) sfx.playUI('move');
          this.setTutorialStep(idx);
        });
      });
    }

    showTutorial(onComplete = null) {
      this.isTutorialOpen = true;
      this.tutorialCallback = onComplete;
      this.setTutorialStep(0);
      const modal = document.getElementById('tutorial-modal');
      if (modal) {
        modal.classList.remove('hidden');
      }
      const sfx = window.NeonRumble.SoundSynth;
      if (sfx) sfx.playUI('select');
    }

    setTutorialStep(stepIndex) {
      if (stepIndex < 0) stepIndex = 0;
      if (stepIndex >= this.tutorialSteps.length) stepIndex = this.tutorialSteps.length - 1;
      this.currentTutorialStep = stepIndex;

      const step = this.tutorialSteps[stepIndex];
      const titleEl = document.getElementById('tutorial-title');
      const tagEl = document.querySelector('#tutorial-modal .tutorial-tag');
      const contentEl = document.getElementById('tutorial-step-content');
      const prevBtn = document.getElementById('btn-tutorial-prev');
      const nextBtn = document.getElementById('btn-tutorial-next');
      const startBtn = document.getElementById('btn-tutorial-start');
      const dots = document.querySelectorAll('.tutorial-steps-dots .dot');

      if (tagEl) tagEl.textContent = step.tag;
      if (titleEl) titleEl.textContent = step.title;
      if (contentEl) contentEl.innerHTML = step.html;

      if (prevBtn) prevBtn.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
      if (nextBtn) {
        if (stepIndex === this.tutorialSteps.length - 1) {
          nextBtn.textContent = 'DONE ▶';
        } else {
          nextBtn.textContent = 'NEXT ▶';
        }
      }

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === stepIndex);
      });
    }

    finishTutorial() {
      this.isTutorialOpen = false;
      const modal = document.getElementById('tutorial-modal');
      if (modal) {
        modal.classList.add('hidden');
      }

      // Mark completed in storage
      if (this.storage && this.storage.settings) {
        this.storage.settings.tutorialCompleted = true;
        this.storage.saveSettings();
      }

      const sfx = window.NeonRumble.SoundSynth;
      if (sfx) {
        sfx.playUI('ready');
        sfx.playRoundBell();
      }

      if (this.tutorialCallback) {
        const cb = this.tutorialCallback;
        this.tutorialCallback = null;
        cb();
      }
    }

    showAnnouncement(text, subtitle = '', duration = 90) {
      this.announcement = { text, subtitle };
      this.announcementTimer = duration;
      this.announcementScale = 2.0; // Zoom-in slam effect
    }

    showSuperPopup(text, color = '#ff0077', fighterName = 'ARDRA') {
      this.superPopup = { text, color, fighterName };
      this.superPopupTimer = 85;
      this.superPopupScale = 2.8; // Slam zoom in
      const sfx = window.NeonRumble.SoundSynth;
      if (sfx) sfx.playSuperStartup();
    }

    update() {
      this.timer++;
      if (this.announcementTimer > 0) {
        this.announcementTimer--;
        this.announcementScale += (1.0 - this.announcementScale) * 0.2;
      } else {
        this.announcement = null;
      }

      if (this.superPopupTimer > 0) {
        this.superPopupTimer--;
        this.superPopupScale += (1.0 - this.superPopupScale) * 0.25;
      } else {
        this.superPopup = null;
      }

      this.syncMainMenuDOM();
    }

    drawPolaroidPortrait(ctx, x, y, angle, fighter, isP1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const w = 76;
      const h = 86;

      // Soft drop shadow
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      // Polaroid white card backing
      ctx.fillStyle = '#f8f7f2';
      ctx.fillRect(0, 0, w, h);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Dark vintage photo border
      ctx.strokeStyle = '#2b2927';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, w, h);

      // Inner photo area (inset: left/top/right 6px, height 56px)
      const photoX = 6;
      const photoY = 6;
      const photoW = w - 12; // 64
      const photoH = 56;

      // Photo inner backdrop
      ctx.fillStyle = isP1 ? '#180e29' : '#22111a';
      ctx.fillRect(photoX, photoY, photoW, photoH);

      // Character Portrait in Photo
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();

      // Radial background glow inside photo
      const bgGrad = ctx.createRadialGradient(photoX + photoW / 2, photoY + photoH / 2, 4, photoX + photoW / 2, photoY + photoH / 2, photoW);
      bgGrad.addColorStop(0, isP1 ? '#a820ff' : (fighter.primaryColor || '#ff0055'));
      bgGrad.addColorStop(1, '#0c0714');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(photoX, photoY, photoW, photoH);

      const cx = photoX + photoW / 2;
      const cy = photoY + photoH / 2 + 5;

      if (isP1 || fighter.id === 'Ardra' || fighter.id === 'ardra') {
        // =====================================================================
        // ARDRA (Image 2) - Purple Ponytail, Red Ninja Mask, Blue Eyes, Katana
        // =====================================================================
        // High Purple Ponytail
        ctx.fillStyle = '#9c27b0';
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 18);
        ctx.quadraticCurveTo(cx - 28, cy - 28, cx - 26, cy - 4);
        ctx.lineTo(cx - 20, cy - 2);
        ctx.quadraticCurveTo(cx - 20, cy - 20, cx - 6, cy - 14);
        ctx.closePath();
        ctx.fill();

        // Ponytail Top Arch
        ctx.beginPath();
        ctx.ellipse(cx - 6, cy - 22, 10, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Katana Hilt & Ribbon over shoulder
        ctx.save();
        ctx.translate(cx + 16, cy - 12);
        ctx.rotate(0.65);
        ctx.fillStyle = '#ffcc00'; // gold tsuba
        ctx.fillRect(-2, -6, 4, 12);
        ctx.fillStyle = '#9c27b0'; // purple hilt
        ctx.fillRect(2, -3, 16, 6);
        ctx.fillStyle = '#e61a38'; // red ribbon
        ctx.beginPath();
        ctx.moveTo(18, 0); ctx.lineTo(26, -6); ctx.lineTo(24, 6); ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Fair Skin Face
        ctx.fillStyle = '#ffe0d0';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 14, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Purple Bangs & Loose Side Lock
        ctx.fillStyle = '#9c27b0';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 14);
        ctx.quadraticCurveTo(cx - 6, cy - 2, cx, cy - 12);
        ctx.quadraticCurveTo(cx + 6, cy - 2, cx + 14, cy - 14);
        ctx.lineTo(cx + 12, cy - 22);
        ctx.lineTo(cx - 12, cy - 22);
        ctx.closePath();
        ctx.fill();
        // Stray side lock
        ctx.fillRect(cx - 14, cy - 10, 3.5, 12);

        // Sharp Cyan/Blue Eyes
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(cx - 9, cy - 6, 5, 4);
        ctx.fillRect(cx + 3, cy - 6, 5, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 8, cy - 6, 2, 2);
        ctx.fillRect(cx + 4, cy - 6, 2, 2);

        // Crimson Ninja Mask / Scarf Cowl covering nose & mouth
        ctx.fillStyle = '#e61a38';
        ctx.beginPath();
        ctx.moveTo(cx - 13, cy - 1);
        ctx.lineTo(cx + 13, cy - 1);
        ctx.lineTo(cx + 10, cy + 16);
        ctx.lineTo(cx - 10, cy + 16);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#b80c25';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy + 5); ctx.lineTo(cx + 10, cy + 5);
        ctx.stroke();

      } else if (fighter.id === 'RedOni' || fighter.id === 'Rex') {
        // =====================================================================
        // RED ONI (Image 1 Center-Right) - Red Skin, Blue Hair, Horns, Pink Shirt
        // =====================================================================
        // Blue Hair Ponytail
        ctx.fillStyle = '#00b4d8';
        ctx.beginPath();
        ctx.arc(cx + 14, cy - 18, 9, 0, Math.PI * 2);
        ctx.fill();

        // Red Muscular Face
        ctx.fillStyle = '#e62020';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 16, 17, 0, 0, Math.PI * 2);
        ctx.fill();

        // White Horns
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 16); ctx.lineTo(cx - 18, cy - 28); ctx.lineTo(cx - 6, cy - 16); ctx.closePath();
        ctx.moveTo(cx + 12, cy - 16); ctx.lineTo(cx + 18, cy - 28); ctx.lineTo(cx + 6, cy - 16); ctx.closePath();
        ctx.fill();

        // Blue Hair Fringe
        ctx.fillStyle = '#00b4d8';
        ctx.fillRect(cx - 10, cy - 20, 20, 6);

        // Scowling Eyes & Eyebrows
        ctx.fillStyle = '#111';
        ctx.fillRect(cx - 10, cy - 8, 7, 5);
        ctx.fillRect(cx + 3, cy - 8, 7, 5);
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(cx - 8, cy - 7, 3, 3);
        ctx.fillRect(cx + 5, cy - 7, 3, 3);

        // Scowling Teeth
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 6, cy + 6, 12, 3);

        // Pink Open Shirt & Gold Chain
        ctx.fillStyle = '#ff6699';
        ctx.fillRect(cx - 16, cy + 12, 8, 12);
        ctx.fillRect(cx + 8, cy + 12, 8, 12);
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy + 14, 6, 0, Math.PI); ctx.stroke();

      } else if (fighter.id === 'VoltMummy' || fighter.id === 'Volt') {
        // =====================================================================
        // VOLT MUMMY (Image 1 Center) - Bandages, Spiky Yellow Hair, Crazy Eyes
        // =====================================================================
        // Wild Spiky Yellow Hair Exploding on Top
        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy - 16);
        ctx.lineTo(cx - 24, cy - 36);
        ctx.lineTo(cx - 10, cy - 22);
        ctx.lineTo(cx, cy - 40);
        ctx.lineTo(cx + 10, cy - 24);
        ctx.lineTo(cx + 24, cy - 38);
        ctx.lineTo(cx + 16, cy - 16);
        ctx.closePath();
        ctx.fill();

        // Bandaged Head
        ctx.fillStyle = '#eee5d5';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 15, 17, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bandage Wrap Stripes
        ctx.strokeStyle = '#c4b59b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 10); ctx.lineTo(cx + 14, cy - 8);
        ctx.moveTo(cx - 14, cy + 2); ctx.lineTo(cx + 14, cy + 4);
        ctx.moveTo(cx - 12, cy + 10); ctx.lineTo(cx + 12, cy + 11);
        ctx.stroke();

        // Crazy Cartoon Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 4, 6, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy - 4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 4, 2.5, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy - 4, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Green Lightning Spark Mug in Corner
        ctx.fillStyle = '#00cc66';
        ctx.fillRect(cx - 18, cy + 4, 10, 12);
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(cx - 16, cy + 7, 6, 6);

      } else if (fighter.id === 'NoirDoll') {
        // =====================================================================
        // NOIR DOLL (Image 1 Top-Middle) - White Hair, Black Rose, Black Tear
        // =====================================================================
        // White Hair
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 16, cy - 20, 32, 38);

        // Pale Face
        ctx.fillStyle = '#fff0f5';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 13, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Straight White Bangs
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 13, cy - 18, 26, 8);

        // Large Black Rose in Hair
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(cx + 11, cy - 16, 7, 0, Math.PI * 2);
        ctx.fill();

        // Dark Anime Eyes & Black Tear
        ctx.fillStyle = '#111111';
        ctx.fillRect(cx - 8, cy - 5, 5, 4);
        ctx.fillRect(cx + 3, cy - 5, 5, 4);
        // Black teardrop makeup
        ctx.fillRect(cx - 7, cy + 2, 2.5, 5);

        // Black Gothic Collar
        ctx.fillStyle = '#161622';
        ctx.fillRect(cx - 12, cy + 11, 24, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 4, cy + 11, 8, 4);

      } else if (fighter.id === 'JesterGhost') {
        // =====================================================================
        // JESTER GHOST (Image 1 Bottom-Left) - Sheet Ghost, Polka-Dot Jester Cap
        // =====================================================================
        // White Cartoon Ghost Head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy + 2, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2b3a55';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Floppy Orange/Red Jester Cap
        ctx.fillStyle = '#ff7700';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 8);
        ctx.quadraticCurveTo(cx - 4, cy - 30, cx + 22, cy - 32);
        ctx.quadraticCurveTo(cx + 10, cy - 14, cx + 14, cy - 8);
        ctx.closePath();
        ctx.fill();

        // White Puffball
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + 22, cy - 32, 5, 0, Math.PI * 2);
        ctx.fill();

        // Big Round Cartoon Eyes & 'v' Mouth
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(cx - 6, cy, 4.5, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 1, 1.5, 0, Math.PI * 2);
        ctx.arc(cx + 7, cy - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Cute 'v' mouth
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy + 9); ctx.lineTo(cx, cy + 12); ctx.lineTo(cx + 3, cy + 9);
        ctx.stroke();

      } else if (fighter.id === 'HornedDemon') {
        // =====================================================================
        // LILITH (Image 1 Bottom-Middle) - Striped Horns, White Hair, Fangs
        // =====================================================================
        // White Hair
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 15, cy - 16, 30, 36);

        // Ash-Grey Skin Face
        ctx.fillStyle = '#9898a8';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 13, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Two Striped Demon Horns
        // Left horn
        ctx.fillStyle = '#e61a38';
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 16); ctx.quadraticCurveTo(cx - 24, cy - 34, cx - 18, cy - 44);
        ctx.quadraticCurveTo(cx - 10, cy - 30, cx - 3, cy - 16); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.fillRect(cx - 18, cy - 34, 6, 3);
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(cx - 15, cy - 28, 5, 2.5); // gold ring

        // Right horn
        ctx.fillStyle = '#e61a38';
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy - 16); ctx.quadraticCurveTo(cx + 24, cy - 34, cx + 18, cy - 44);
        ctx.quadraticCurveTo(cx + 10, cy - 30, cx + 3, cy - 16); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.fillRect(cx + 12, cy - 34, 6, 3);
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(cx + 10, cy - 28, 5, 2.5);

        // Red Demonic Eyes & Fangs
        ctx.fillStyle = '#ff0033';
        ctx.fillRect(cx - 8, cy - 5, 5, 3.5);
        ctx.fillRect(cx + 3, cy - 5, 5, 3.5);
        // Fangs
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 3, cy + 5, 2, 3);
        ctx.fillRect(cx + 1, cy + 5, 2, 3);

      } else if (fighter.id === 'OverlordTitan' || fighter.id === 'Titan' || fighter.isBoss) {
        // =====================================================================
        // OVERLORD TITAN (Colossal Final Boss)
        // =====================================================================
        // Obsidian Colossus Head & Helm
        ctx.fillStyle = fighter.isBoss ? '#120b12' : '#1a1820';
        ctx.fillRect(cx - 16, cy - 22, 32, 36);

        // Brass / Magma Horn Crest
        ctx.fillStyle = fighter.isBoss ? '#ff3700' : '#d49b38';
        ctx.fillRect(-22 + cx, cy - 26, 44, 8);
        if (fighter.isBoss) {
          ctx.fillRect(-26 + cx, cy - 34, 8, 14);
          ctx.fillRect(18 + cx, cy - 34, 8, 14);
        }

        // Visor / Slit Eyes (Incandescent Red for Boss, Green for Titan)
        ctx.fillStyle = fighter.isBoss ? '#ff0033' : '#00ff66';
        ctx.shadowColor = fighter.isBoss ? '#ff0033' : '#00ff66';
        ctx.shadowBlur = 8;
        ctx.fillRect(cx - 10, cy - 10, 20, 5);
        ctx.shadowBlur = 0;

        // Heavy Iron Jaw Guard
        ctx.fillStyle = '#08080c';
        ctx.fillRect(cx - 12, cy + 2, 24, 12);

      } else {
        // Fallback / Other
        ctx.fillStyle = fighter.primaryColor || '#ff2233';
        ctx.beginPath();
        ctx.moveTo(cx - 18, cy - 8); ctx.lineTo(cx - 10, cy - 26); ctx.lineTo(cx - 2, cy - 14);
        ctx.lineTo(cx + 6, cy - 28); ctx.lineTo(cx + 12, cy - 12); ctx.lineTo(cx + 20, cy - 22);
        ctx.lineTo(cx + 18, cy - 4); ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#f0d0b0';
        ctx.beginPath(); ctx.ellipse(cx, cy - 2, 13, 15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.fillRect(cx - 9, cy - 6, 6, 4); ctx.fillRect(cx + 3, cy - 6, 6, 4);
      }

            ctx.restore(); // end photo clip

      // Inner photo inner border
      ctx.strokeStyle = '#1b1b22';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(photoX, photoY, photoW, photoH);

      // Bottom handwritten marker name
      ctx.font = '900 13px "Impact", "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e1c22';
      const displayName = (fighter.name || 'HERO').toUpperCase();
      ctx.fillText(displayName, w / 2, h - 7);

      // Masking tape strip at top corner
      ctx.save();
      ctx.translate(isP1 ? 14 : w - 24, -4);
      ctx.rotate(isP1 ? -0.18 : 0.22);
      ctx.fillStyle = 'rgba(235, 218, 155, 0.88)';
      ctx.fillRect(-12, -4, 28, 11);
      ctx.strokeStyle = 'rgba(190, 170, 110, 0.7)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-12, -4, 28, 11);
      ctx.restore();

      ctx.restore();
    }

    drawStatusBadges(ctx, x, y, isP1) {
      ctx.save();
      // Badge 1
      const b1x = x;
      const b1y = y;
      ctx.beginPath();
      ctx.arc(b1x, b1y, 9, 0, Math.PI * 2);
      ctx.fillStyle = isP1 ? '#ff0077' : '#e62020';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      if (isP1) {
        // Crosshair reticle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b1x, b1y, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(b1x - 7, b1y); ctx.lineTo(b1x + 7, b1y);
        ctx.moveTo(b1x, b1y - 7); ctx.lineTo(b1x, b1y + 7);
        ctx.stroke();
      } else {
        // Clenched fist icon
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(b1x - 3, b1y - 3, 6, 6);
        ctx.beginPath();
        ctx.arc(b1x, b1y - 4, 3, 0, Math.PI, true);
        ctx.fill();
      }

      // Badge 2
      const b2x = x + 22;
      const b2y = y;
      ctx.beginPath();
      ctx.arc(b2x, b2y, 9, 0, Math.PI * 2);
      ctx.fillStyle = isP1 ? '#00e5ff' : '#ff0077';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      if (isP1) {
        // Cyan flame / spark
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(b2x, b2y - 6);
        ctx.lineTo(b2x + 4, b2y);
        ctx.lineTo(b2x + 1, b2y);
        ctx.lineTo(b2x + 3, b2y + 5);
        ctx.lineTo(b2x - 4, b2y - 1);
        ctx.lineTo(b2x - 1, b2y - 1);
        ctx.closePath();
        ctx.fill();
      } else {
        // Crosshair reticle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b2x, b2y, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(b2x - 7, b2y); ctx.lineTo(b2x + 7, b2y);
        ctx.moveTo(b2x, b2y - 7); ctx.lineTo(b2x, b2y + 7);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawChevronHealthBar(ctx, x, y, w, h, facing, healthPercent, ghostPercent, color, isCritical) {
      ctx.save();
      const cut = 16;

      const makeChevronPath = () => {
        ctx.beginPath();
        if (facing === 1) {
          // P1: Left is flat, right tip points outward right towards center
          ctx.moveTo(x, y);
          ctx.lineTo(x + w - cut, y);
          ctx.lineTo(x + w, y + h / 2);
          ctx.lineTo(x + w - cut, y + h);
          ctx.lineTo(x, y + h);
        } else {
          // P2: Right is flat, left tip points outward left towards center
          ctx.moveTo(x + cut, y);
          ctx.lineTo(x + w, y);
          ctx.lineTo(x + w, y + h);
          ctx.lineTo(x + cut, y + h);
          ctx.lineTo(x, y + h / 2);
        }
        ctx.closePath();
      };

      // 1. Dark Purple Outer Beveled Frame
      ctx.save();
      makeChevronPath();
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#2b0f3f'; // Dark purple bevel border
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0a0312'; // Black outer contour
      ctx.stroke();
      ctx.restore();

      // 2. Inner Bar Content (Clipped)
      ctx.save();
      makeChevronPath();
      ctx.clip();

      // Empty background
      ctx.fillStyle = '#11091e';
      ctx.fillRect(x - 10, y - 5, w + 20, h + 10);

      // Trailing Ghost Bar (Burgundy/Crimson red)
      ctx.fillStyle = '#8f1426';
      if (facing === 1) {
        ctx.fillRect(x, y, w * ghostPercent, h);
      } else {
        ctx.fillRect(x + w * (1 - ghostPercent), y, w * ghostPercent, h);
      }

      // Current Health Fill
      if (isCritical && Math.floor(this.timer / 6) % 2 === 0) {
        ctx.fillStyle = '#ff1133';
      } else {
        ctx.fillStyle = color; // Lime green for P1 (#88ff00), Golden yellow for P2 (#ffcc00)
      }

      if (facing === 1) {
        ctx.fillRect(x, y, w * healthPercent, h);
        // Highlight glossy strip on top half
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(x, y, w * healthPercent, h * 0.45);
      } else {
        ctx.fillRect(x + w * (1 - healthPercent), y, w * healthPercent, h);
        // Highlight glossy strip on top half
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(x + w * (1 - healthPercent), y, w * healthPercent, h * 0.45);
      }

      // Inner divider tick lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1.5;
      for (let k = 1; k <= 4; k++) {
        const tx = x + (w / 5) * k;
        ctx.beginPath();
        ctx.moveTo(tx, y);
        ctx.lineTo(tx, y + h);
        ctx.stroke();
      }

      ctx.restore(); // end clip

      // Clean inner border
      makeChevronPath();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }

    drawComicTimer(ctx, cx, cy, roundTime) {
      ctx.save();
      const timeStr = Math.ceil(roundTime).toString().padStart(2, '0');

      // Comic Round Badge above timer
      ctx.fillStyle = '#220a35';
      ctx.fillRect(cx - 30, cy - 36, 60, 16);
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 30, cy - 36, 60, 16);
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('TIME', cx, cy - 24);

      // Large Stylized Golden Numerals
      ctx.font = '900 46px "Impact", "Arial Black", sans-serif';
      ctx.textAlign = 'center';

      // Drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      // Heavy black stroke
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(timeStr, cx, cy + 18);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Golden gradient or Critical red
      if (roundTime <= 10 && Math.floor(this.timer / 8) % 2 === 0) {
        ctx.fillStyle = '#ff2233';
      } else {
        const goldGrad = ctx.createLinearGradient(cx, cy - 25, cx, cy + 20);
        goldGrad.addColorStop(0, '#fff9c4');
        goldGrad.addColorStop(0.3, '#ffea00');
        goldGrad.addColorStop(0.7, '#ff9100');
        goldGrad.addColorStop(1, '#e65100');
        ctx.fillStyle = goldGrad;
      }
      ctx.fillText(timeStr, cx, cy + 18);

      // Inner highlight stroke
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.strokeText(timeStr, cx, cy + 18);

      ctx.restore();
    }

    drawBottomComicMeter(ctx, x, y, w, h, fighter, isP1) {
      ctx.save();
      // Outer panel box
      ctx.fillStyle = '#160924';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#2d1345';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, w, h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Mascot Icon Box (Tile on left or right)
      const tileW = 34;
      const tileH = h - 6;
      const tileX = isP1 ? x + 3 : x + w - tileW - 3;
      const tileY = y + 3;

      ctx.fillStyle = '#26103b';
      ctx.fillRect(tileX, tileY, tileW, tileH);
      ctx.strokeStyle = isP1 ? '#00e5ff' : '#ff0077';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tileX, tileY, tileW, tileH);

      // Mascot icon inside tile
      const mcx = tileX + tileW / 2;
      const mcy = tileY + tileH / 2;
      if (isP1) {
        // Cute green alien mascot
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(mcx, mcy - 1, 9, 0, Math.PI * 2);
        ctx.fill();
        // Antenna
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mcx, mcy - 10);
        ctx.lineTo(mcx, mcy - 14);
        ctx.stroke();
        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.arc(mcx, mcy - 14, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Big black alien eyes
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(mcx - 4, mcy - 1, 2.5, 3.5, -0.2, 0, Math.PI * 2);
        ctx.ellipse(mcx + 4, mcy - 1, 2.5, 3.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Comic skull or bomb icon
        ctx.fillStyle = '#ff2a55';
        ctx.beginPath();
        ctx.arc(mcx, mcy + 2, 8, 0, Math.PI * 2);
        ctx.fill();
        // Fuse
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mcx, mcy - 6);
        ctx.quadraticCurveTo(mcx + 6, mcy - 10, mcx + 4, mcy - 13);
        ctx.stroke();
        // Spark
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mcx + 4, mcy - 13, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Energy Bar Section
      const barX = isP1 ? x + tileW + 8 : x + 6;
      const barY = y + 16;
      const barW = w - tileW - 14;
      const barH = 14;

      // Bar backdrop
      ctx.fillStyle = '#0a0314';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = '#381c52';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      const isReady = (fighter.superCooldownTimer <= 0) || (!isP1 && fighter.superMeter >= 100);
      const cooldownRatio = fighter.superCooldownMax ? Math.max(0, 1 - (fighter.superCooldownTimer / fighter.superCooldownMax)) : 1;

      // Label above bar
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      if (isP1) {
        ctx.textAlign = 'left';
        if (isReady) {
          ctx.fillStyle = Math.floor(this.timer / 4) % 2 === 0 ? '#ffea00' : '#00f0ff';
          ctx.fillText('★ BITCHY TIME READY! [T] ★', barX, barY - 4);
        } else {
          ctx.fillStyle = '#8e9bb8';
          const secLeft = Math.ceil(fighter.superCooldownTimer / 60);
          ctx.fillText(`SUPER COOLDOWN: ${secLeft}s`, barX, barY - 4);
        }
      } else {
        ctx.textAlign = 'right';
        if (isReady) {
          ctx.fillStyle = Math.floor(this.timer / 4) % 2 === 0 ? '#ff0077' : '#ffffff';
          ctx.fillText('★ SUPER READY! ★', barX + barW, barY - 4);
        } else {
          ctx.fillStyle = '#8e9bb8';
          const secLeft2 = Math.ceil(fighter.superCooldownTimer / 60);
          ctx.fillText(`SUPER COOLDOWN: ${secLeft2}s`, barX + barW, barY - 4);
        }
      }

      // Fill Bar
      if (isReady) {
        const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        if (isP1) {
          fillGrad.addColorStop(0, '#00e5ff');
          fillGrad.addColorStop(0.5, '#ffffff');
          fillGrad.addColorStop(1, '#00e5ff');
        } else {
          fillGrad.addColorStop(0, '#ff0077');
          fillGrad.addColorStop(0.5, '#ffffff');
          fillGrad.addColorStop(1, '#ff0077');
        }
        ctx.fillStyle = fillGrad;
        ctx.fillRect(barX, barY, barW, barH);
      } else {
        ctx.fillStyle = isP1 ? '#0077cc' : '#990044';
        if (isP1) {
          ctx.fillRect(barX, barY, barW * cooldownRatio, barH);
        } else {
          ctx.fillRect(barX + barW * (1 - cooldownRatio), barY, barW * cooldownRatio, barH);
        }
      }

      // Energy bar segment divider ticks
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1.5;
      for (let s = 1; s <= 5; s++) {
        const sx = barX + (barW / 6) * s;
        ctx.beginPath();
        ctx.moveTo(sx, barY);
        ctx.lineTo(sx, barY + barH);
        ctx.stroke();
      }

      ctx.restore();
    }

    drawHUD(ctx, p1, p2, roundTime, currentRound, p1RoundsWon, p2RoundsWon) {
      ctx.save();
      const vw = 960;

      // =======================================================================
      // 1. TOP COMBAT ZONE HUD (Polaroids, Badges, Pointed Health Bars)
      // =======================================================================
      const barW = 345;
      const barH = 24;
      const barY = 24;

      // Health percentages
      const p1HealthPercent = Math.max(0, p1.health / p1.maxHealth);
      const p1GhostPercent = Math.max(0, p1.ghostHealth / p1.maxHealth);
      const p1Critical = p1.health > 0 && p1HealthPercent <= 0.25;

      const p2HealthPercent = Math.max(0, p2.health / p2.maxHealth);
      const p2GhostPercent = Math.max(0, p2.ghostHealth / p2.maxHealth);
      const p2Critical = p2.health > 0 && p2HealthPercent <= 0.25;

      // Draw P1 Polaroid (Tilted -5 deg)
      this.drawPolaroidPortrait(ctx, 14, 10, -0.09, p1, true);
      // Draw P1 Circular Badges
      this.drawStatusBadges(ctx, 28, 102, true);

      // Draw P1 Pointed Health Bar (Bright Lime Green)
      this.drawChevronHealthBar(ctx, 98, barY, barW, barH, 1, p1HealthPercent, p1GhostPercent, '#88ff00', p1Critical);

      // P1 Round Win Tokens
      for (let i = 0; i < 2; i++) {
        const rx = 106 + i * 20;
        const ry = barY + barH + 10;
        ctx.fillStyle = i < p1RoundsWon ? '#ffcc00' : '#1e0c2d';
        ctx.beginPath();
        ctx.arc(rx, ry, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Center Comic Round Timer ("49" style)
      this.drawComicTimer(ctx, vw / 2, 40, roundTime);

      // Draw P2 Pointed Health Bar (Magma Crimson for Boss, Golden Yellow for regular)
      const p2BarColor = p2.isBoss ? '#ff1e38' : '#ffcc00';
      this.drawChevronHealthBar(ctx, vw - 98 - barW, barY, barW, barH, -1, p2HealthPercent, p2GhostPercent, p2BarColor, p2Critical);

      if (p2.isBoss) {
        ctx.save();
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.fillStyle = '#ff2200';
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'right';
        ctx.fillText(`⚡ BOSS HP: ${Math.max(0, Math.round(p2.health))}/${p2.maxHealth}`, vw - 98, barY + barH + 13);
        ctx.restore();
      }

      // P2 Round Win Tokens
      for (let i = 0; i < 2; i++) {
        const rx = vw - 106 - i * 20;
        const ry = barY + barH + 10;
        ctx.fillStyle = i < p2RoundsWon ? '#ffcc00' : '#1e0c2d';
        ctx.beginPath();
        ctx.arc(rx, ry, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw P2 Polaroid (Tilted +5 deg)
      this.drawPolaroidPortrait(ctx, vw - 14 - 76, 10, 0.09, p2, false);
      // Draw P2 Circular Badges
      this.drawStatusBadges(ctx, vw - 14 - 76 + 18, 102, false);

      // =======================================================================
      // 2. BOTTOM COMIC METERS & COOLDOWNS
      // =======================================================================
      const superBoxW = 290;
      const superBoxH = 42;
      const superBoxY = 488;

      // P1 Bottom Comic Meter Box
      this.drawBottomComicMeter(ctx, 20, superBoxY, superBoxW, superBoxH, p1, true);

      // P2 Bottom Comic Meter Box
      this.drawBottomComicMeter(ctx, vw - 20 - superBoxW, superBoxY, superBoxW, superBoxH, p2, false);

      // Sync DOM virtual button badge for mobile/touch users
      const superBadge = document.getElementById('touch-super-cooldown');
      const superBtn = document.querySelector('.btn-super');
      const p1IsReady = (p1.superCooldownTimer <= 0);

      if (p1IsReady) {
        if (superBadge && superBadge.textContent !== 'READY') superBadge.textContent = 'READY';
        if (superBtn && !superBtn.classList.contains('super-ready')) superBtn.classList.add('super-ready');
      } else {
        const secLeft = Math.ceil(p1.superCooldownTimer / 60);
        if (superBadge && superBadge.textContent !== `${secLeft}s`) superBadge.textContent = `${secLeft}s`;
        if (superBtn && superBtn.classList.contains('super-ready')) superBtn.classList.remove('super-ready');
      }

      // Sync DOM virtual button badge for Special Attack
      const specialBadge = document.getElementById('touch-special-cooldown');
      const specialBtn = document.getElementById('btn-touch-special') || document.querySelector('.btn-special');
      const specialProgress = specialBtn ? specialBtn.querySelector('.special-recharge-progress') : null;
      const p1SpecialReady = (p1.specialCooldownTimer <= 0);

      if (p1SpecialReady) {
        if (specialBadge && specialBadge.textContent !== 'READY') specialBadge.textContent = 'READY';
        if (specialBtn) {
          if (!specialBtn.classList.contains('special-ready')) specialBtn.classList.add('special-ready');
          if (specialBtn.classList.contains('special-colorless')) specialBtn.classList.remove('special-colorless');
          if (specialBtn.classList.contains('special-recharging')) specialBtn.classList.remove('special-recharging');
        }
        if (specialProgress && specialProgress.style.height !== '100%') specialProgress.style.height = '100%';
      } else {
        const secLeft = (p1.specialCooldownTimer / 60).toFixed(1);
        if (specialBadge && specialBadge.textContent !== `${secLeft}s`) specialBadge.textContent = `${secLeft}s`;
        if (specialBtn) {
          if (specialBtn.classList.contains('special-ready')) specialBtn.classList.remove('special-ready');
          if (!specialBtn.classList.contains('special-colorless')) specialBtn.classList.add('special-colorless');
          if (!specialBtn.classList.contains('special-recharging')) specialBtn.classList.add('special-recharging');
        }
        if (specialProgress) {
          const maxCd = p1.specialCooldownMax || 240;
          const pct = Math.max(0, Math.min(100, Math.round((1 - (p1.specialCooldownTimer / maxCd)) * 100)));
          specialProgress.style.height = `${pct}%`;
        }
      }

      // =======================================================================
      // 5. COMBO COUNTERS
      // =======================================================================
      const combo1 = window.NeonRumble.ComboManager.getCounter(1);
      if (combo1 && combo1.displayTimer > 0 && combo1.hits >= 2) {
        ctx.save();
        ctx.textAlign = 'left';
        ctx.font = 'bold 22px "Press Start 2P", monospace';
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillText(`${combo1.hits} HITS!`, 45, 140);
        ctx.font = 'bold 13px "Rajdhani", sans-serif';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText(`${combo1.totalDamage} DAMAGE - ${combo1.comboRank}`, 45, 162);
        ctx.restore();
      }

      const combo2 = window.NeonRumble.ComboManager.getCounter(2);
      if (combo2 && combo2.displayTimer > 0 && combo2.hits >= 2) {
        ctx.save();
        ctx.textAlign = 'right';
        ctx.font = 'bold 22px "Press Start 2P", monospace';
        ctx.fillStyle = '#ff0077';
        ctx.shadowColor = '#ff0077';
        ctx.shadowBlur = 12;
        ctx.fillText(`${combo2.hits} HITS!`, vw - 45, 140);
        ctx.font = 'bold 13px "Rajdhani", sans-serif';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText(`${combo2.totalDamage} DAMAGE - ${combo2.comboRank}`, vw - 45, 162);
        ctx.restore();
      }

      // =======================================================================
      // 6. ANNOUNCEMENT BANNER
      // =======================================================================
      if (this.announcement) {
        ctx.save();
        ctx.translate(vw / 2, 230);
        ctx.scale(this.announcementScale, this.announcementScale);

        // Dark banner backdrop
        ctx.fillStyle = 'rgba(10, 10, 20, 0.85)';
        ctx.fillRect(-vw / 2, -50, vw, 100);
        ctx.fillStyle = '#ff0077';
        ctx.fillRect(-vw / 2, -52, vw, 4);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(-vw / 2, 48, vw, 4);

        ctx.font = 'bold 44px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ff0077';
        ctx.shadowBlur = 20;
        ctx.fillText(this.announcement.text, 0, 12);

        if (this.announcement.subtitle) {
          ctx.font = 'bold 16px "Press Start 2P", monospace';
          ctx.fillStyle = '#ffcc00';
          ctx.shadowColor = '#ffcc00';
          ctx.shadowBlur = 10;
          ctx.fillText(this.announcement.subtitle, 0, 36);
        }
        ctx.restore();
      }

      // =======================================================================
      // 7. SUPER POWER POP-UP BANNER (e.g. "Bitchy Timeee!!!")
      // =======================================================================
      if (this.superPopup) {
        ctx.save();
        ctx.translate(vw / 2, 210);
        ctx.scale(this.superPopupScale, this.superPopupScale);

        // Angled comic background banner
        ctx.rotate(-0.035);
        ctx.fillStyle = 'rgba(8, 6, 20, 0.94)';
        ctx.fillRect(-vw / 2, -58, vw, 116);

        // Glowing double border lines
        ctx.fillStyle = this.superPopup.color;
        ctx.fillRect(-vw / 2, -62, vw, 5);
        ctx.fillRect(-vw / 2, 57, vw, 5);

        // Subtitle badge
        ctx.font = 'bold 13px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.textAlign = 'center';
        ctx.fillText(`★ ${this.superPopup.fighterName} SUPER POWER! ★`, 0, -24);

        // Giant Main Quote / Pop-up text (e.g. "Bitchy Timeee!!!")
        ctx.font = 'bold 36px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = this.superPopup.color;
        ctx.shadowBlur = 25;
        ctx.fillText(this.superPopup.text, 0, 22);

        // Neon outline
        ctx.strokeStyle = this.superPopup.color;
        ctx.lineWidth = 2.5;
        ctx.strokeText(this.superPopup.text, 0, 22);

        ctx.restore();
      }

      ctx.restore();
    }

    drawHitboxes(ctx, p1, p2) {
      const show = this.storage && this.storage.settings.showHitboxes;
      if (!show) return;

      ctx.save();

      [p1, p2].forEach(p => {
        // 1. Hurtbox (Green)
        const hurt = p.getHurtbox();
        ctx.strokeStyle = 'rgba(0, 255, 100, 0.85)';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0, 255, 100, 0.15)';
        ctx.fillRect(hurt.left, hurt.top, hurt.width, hurt.height);
        ctx.strokeRect(hurt.left, hurt.top, hurt.width, hurt.height);

        // 2. Hitbox (Red)
        const hit = p.getActiveHitbox();
        if (hit) {
          ctx.strokeStyle = 'rgba(255, 30, 60, 0.9)';
          ctx.lineWidth = 3;
          ctx.fillStyle = 'rgba(255, 30, 60, 0.3)';
          ctx.fillRect(hit.left, hit.top, hit.width, hit.height);
          ctx.strokeRect(hit.left, hit.top, hit.width, hit.height);
        }

        // 3. Pushbox (Yellow)
        const push = p.getPushbox();
        ctx.strokeStyle = 'rgba(255, 220, 0, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(push.left, push.top, push.right - push.left, push.bottom - push.top);
      });

      ctx.restore();
    }
  }

  window.NeonRumble.UIManager = new UIManager();
})();
