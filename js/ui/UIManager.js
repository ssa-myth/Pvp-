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
    }

    drawHUD(ctx, p1, p2, roundTime, currentRound, p1RoundsWon, p2RoundsWon) {
      ctx.save();
      const vw = 960;

      // =======================================================================
      // 1. HEALTH BARS & NAMES
      // =======================================================================
      const barW = 340;
      const barH = 22;
      const barY = 32;

      // P1 Health Bar (Top Left)
      const p1HealthPercent = Math.max(0, p1.health / p1.maxHealth);
      const p1GhostPercent = Math.max(0, p1.ghostHealth / p1.maxHealth);
      const p1Critical = p1.health > 0 && p1HealthPercent <= 0.25;

      // Background plate
      ctx.fillStyle = '#10121a';
      ctx.fillRect(40, barY, barW, barH);
      ctx.strokeStyle = '#3a3f58';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, barY, barW, barH);

      // Trailing Ghost Bar (Red)
      ctx.fillStyle = '#ff3344';
      ctx.fillRect(40 + barW * (1 - p1GhostPercent), barY, barW * p1GhostPercent, barH);

      // Main Health Bar (Yellow-Green, or flashing red when critical)
      if (p1Critical && Math.floor(this.timer / 6) % 2 === 0) {
        ctx.fillStyle = '#ff1133';
      } else {
        const p1Grad = ctx.createLinearGradient(40, 0, 40 + barW, 0);
        p1Grad.addColorStop(0, '#ffcc00');
        p1Grad.addColorStop(0.5, '#00ff66');
        p1Grad.addColorStop(1, '#00f0ff');
        ctx.fillStyle = p1Grad;
      }
      ctx.fillRect(40 + barW * (1 - p1HealthPercent), barY, barW * p1HealthPercent, barH);

      // P1 Name & Title
      ctx.font = 'bold 16px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'left';
      ctx.fillText(p1.name, 40, barY - 10);
      ctx.shadowBlur = 0;

      // P2 Health Bar (Top Right)
      const p2HealthPercent = Math.max(0, p2.health / p2.maxHealth);
      const p2GhostPercent = Math.max(0, p2.ghostHealth / p2.maxHealth);
      const p2Critical = p2.health > 0 && p2HealthPercent <= 0.25;

      ctx.fillStyle = '#10121a';
      ctx.fillRect(vw - 40 - barW, barY, barW, barH);
      ctx.strokeStyle = '#3a3f58';
      ctx.lineWidth = 2;
      ctx.strokeRect(vw - 40 - barW, barY, barW, barH);

      // Trailing Ghost Bar (Red)
      ctx.fillStyle = '#ff3344';
      ctx.fillRect(vw - 40 - barW, barY, barW * p2GhostPercent, barH);

      // Main Health Bar (P2)
      if (p2Critical && Math.floor(this.timer / 6) % 2 === 0) {
        ctx.fillStyle = '#ff1133';
      } else {
        const p2Grad = ctx.createLinearGradient(vw - 40 - barW, 0, vw - 40, 0);
        p2Grad.addColorStop(0, '#00f0ff');
        p2Grad.addColorStop(0.5, '#00ff66');
        p2Grad.addColorStop(1, '#ffcc00');
        ctx.fillStyle = p2Grad;
      }
      ctx.fillRect(vw - 40 - barW, barY, barW * p2HealthPercent, barH);

      // P2 Name & Title
      ctx.font = 'bold 16px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ff0077';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'right';
      ctx.fillText(p2.name, vw - 40, barY - 10);
      ctx.shadowBlur = 0;

      // =======================================================================
      // 2. ROUND TIMER (Top Center)
      // =======================================================================
      ctx.fillStyle = '#121422';
      ctx.fillRect(vw / 2 - 38, 16, 76, 52);
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 3;
      ctx.strokeRect(vw / 2 - 38, 16, 76, 52);

      ctx.font = 'bold 28px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = roundTime <= 10 ? (Math.floor(this.timer / 10) % 2 === 0 ? '#ff2233' : '#ffffff') : '#ffcc00';
      ctx.fillText(Math.ceil(roundTime).toString().padStart(2, '0'), vw / 2, 53);

      // =======================================================================
      // 3. ROUND WIN TOKENS
      // =======================================================================
      // P1 Rounds
      for (let i = 0; i < 2; i++) {
        const rx = 40 + i * 22;
        const ry = barY + barH + 12;
        ctx.fillStyle = i < p1RoundsWon ? '#ffcc00' : '#222536';
        ctx.beginPath();
        ctx.arc(rx, ry, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // P2 Rounds
      for (let i = 0; i < 2; i++) {
        const rx = vw - 40 - i * 22;
        const ry = barY + barH + 12;
        ctx.fillStyle = i < p2RoundsWon ? '#ffcc00' : '#222536';
        ctx.beginPath();
        ctx.arc(rx, ry, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // =======================================================================
      // 4. SUPER GAUGES WITH COOLDOWN (Bottom Left & Bottom Right)
      // =======================================================================
      const superW = 260;
      const superH = 14;
      const superY = 505;

      // P1 Super & Cooldown
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(40, superY, superW, superH);
      ctx.strokeStyle = '#3d4460';
      ctx.strokeRect(40, superY, superW, superH);

      const p1CooldownRatio = p1.superCooldownMax ? Math.max(0, 1 - (p1.superCooldownTimer / p1.superCooldownMax)) : 1;
      const p1IsReady = (p1.superCooldownTimer <= 0);

      // Sync DOM virtual button badge for mobile/touch users
      const superBadge = document.getElementById('touch-super-cooldown');
      const superBtn = document.querySelector('.btn-super');

      if (p1IsReady) {
        ctx.fillStyle = Math.floor(this.timer / 4) % 2 === 0 ? '#ffcc00' : '#ffffff';
        ctx.fillRect(40, superY, superW, superH);
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('★ SUPER POWER READY! [T] ★', 40, superY - 6);

        if (superBadge && superBadge.textContent !== 'READY') superBadge.textContent = 'READY';
        if (superBtn && !superBtn.classList.contains('super-ready')) superBtn.classList.add('super-ready');
      } else {
        ctx.fillStyle = '#0099ff';
        ctx.fillRect(40, superY, superW * p1CooldownRatio, superH);
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.fillStyle = '#8e9bb8';
        const secLeft = Math.ceil(p1.superCooldownTimer / 60);
        ctx.fillText(`SUPER COOLDOWN: ${secLeft}s`, 40, superY - 6);

        if (superBadge && superBadge.textContent !== `${secLeft}s`) superBadge.textContent = `${secLeft}s`;
        if (superBtn && superBtn.classList.contains('super-ready')) superBtn.classList.remove('super-ready');
      }

      // P2 Super & Cooldown
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(vw - 40 - superW, superY, superW, superH);
      ctx.strokeStyle = '#3d4460';
      ctx.strokeRect(vw - 40 - superW, superY, superW, superH);

      const p2CooldownRatio = p2.superCooldownMax ? Math.max(0, 1 - (p2.superCooldownTimer / p2.superCooldownMax)) : 1;
      const p2IsReady = (p2.superCooldownTimer <= 0) || (p2.superMeter >= 100);

      if (p2IsReady) {
        ctx.fillStyle = Math.floor(this.timer / 4) % 2 === 0 ? '#ff0077' : '#ffffff';
        ctx.fillRect(vw - 40 - superW, superY, superW, superH);
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillStyle = '#ff0077';
        ctx.textAlign = 'right';
        ctx.fillText('★ SUPER READY! ★', vw - 40, superY - 6);
      } else {
        ctx.fillStyle = '#cc0055';
        ctx.fillRect(vw - 40 - superW, superY, superW * p2CooldownRatio, superH);
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.fillStyle = '#8e9bb8';
        ctx.textAlign = 'right';
        const secLeft2 = Math.ceil(p2.superCooldownTimer / 60);
        ctx.fillText(`SUPER COOLDOWN: ${secLeft2}s`, vw - 40, superY - 6);
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
