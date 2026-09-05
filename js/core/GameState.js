/**
 * GameState.js - Master Game State Machine & Match Coordinator
 * Coordinates match rules (Best of 3, 60s timer, KOs), menu navigation,
 * combat collisions, round transitions, and audio sync.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  const Box = window.NeonRumble.Box;

  class GameStateManager {
    constructor() {
      this.state = 'BOOT'; // BOOT, TITLE, CHAR_SELECT, STAGE_SELECT, ROUND_INTRO, FIGHTING, ROUND_END, MATCH_VICTORY, PAUSE, SETTINGS, HOW_TO_PLAY, STATS, TRAINING
      this.previousState = 'TITLE';

      // Match Rules & Data
      this.currentRound = 1;
      this.maxRounds = 3;
      this.roundTime = 60; // 60 seconds
      this.roundTimerFrames = 0;
      this.p1RoundsWon = 0;
      this.p2RoundsWon = 0;
      this.matchWinner = null;
      this.isTrainingMode = false;
      this.isVsCpuMode = true;

      // Progressive 4-Stage Hero Campaign Ladder (Ardra as exclusive protagonist)
      this.isCampaignMode = true;
      this.campaignStage = 0; // 0 to 3
      this.campaignLadder = [
        {
          stageIndex: 1,
          stageKey: 'NeonAlley',
          stageName: 'NEON ALLEY',
          villainClass: 'Rex',
          villainName: 'REX',
          villainTitle: 'THE IRON BRAWLER',
          villainColor: '#cc2233'
        },
        {
          stageIndex: 2,
          stageKey: 'AbandonedArcade',
          stageName: 'ABANDONED ARCADE',
          villainClass: 'Volt',
          villainName: 'VOLT',
          villainTitle: 'THE CYBER SPARK',
          villainColor: '#00f0ff'
        },
        {
          stageIndex: 3,
          stageKey: 'SkylineRooftop',
          stageName: 'SKYLINE ROOFTOP',
          villainClass: 'Titan',
          villainName: 'TITAN',
          villainTitle: 'THE ARMORED JUGGERNAUT',
          villainColor: '#d49b38'
        },
        {
          stageIndex: 4,
          stageKey: 'AstralCore',
          stageName: 'ASTRAL CORE (FINAL BOSS)',
          villainClass: 'Ardra',
          villainName: 'SHADOW ARDRA',
          villainTitle: 'THE ASTRAL SHADOW',
          villainColor: '#ff0055',
          isMirror: true
        }
      ];

      // Active Fighters
      this.p1 = null;
      this.p2 = null;

      // Transition Timers
      this.transitionTimer = 0;
      this.slowMoCounter = 0;

      // Cached Singletons
      this.menus = window.NeonRumble.MenuScreens;
      this.ui = window.NeonRumble.UIManager;
      this.stageMgr = window.NeonRumble.StageManager;
      this.camera = window.NeonRumble.Camera;
      this.inputs = window.NeonRumble.InputManager;
      this.sfx = window.NeonRumble.SoundSynth;
      this.music = window.NeonRumble.MusicSynth;
      this.storage = window.NeonRumble.Storage;
      this.projectiles = window.NeonRumble.ProjectileManager;
      this.particles = window.NeonRumble.ParticleSystem;
      this.combos = window.NeonRumble.ComboManager;
      this.renderer = window.NeonRumble.FighterRenderer;
    }

    init() {
      // Start on BOOT
      this.setState('BOOT');
    }

    setState(newState) {
      if (this.state === newState) return;
      this.previousState = this.state;
      this.state = newState;
      this.transitionTimer = 0;

      // Sync Audio / Music
      if (this.music) {
        if (newState === 'BOOT' || newState === 'TITLE' || newState === 'HOW_TO_PLAY' || newState === 'STATS') {
          this.music.playTrack('MENU');
        } else if (newState === 'CHAR_SELECT' || newState === 'STAGE_SELECT') {
          this.music.playTrack('CHAR_SELECT');
        } else if (newState === 'FIGHTING' || newState === 'ROUND_INTRO' || newState === 'TRAINING') {
          const sKey = this.stageMgr.currentStageKey;
          if (sKey === 'NeonAlley') this.music.playTrack('STAGE_1');
          else if (sKey === 'AbandonedArcade') this.music.playTrack('STAGE_2');
          else this.music.playTrack('STAGE_3');
        } else if (newState === 'MATCH_VICTORY') {
          this.music.playTrack('VICTORY');
        }
      }
    }

    // =========================================================================
    // KEYBOARD NAVIGATION FOR MENUS
    // =========================================================================
    handleKeyDown(code, key) {
      // Global Audio unlock on first keypress
      if (this.sfx) this.sfx.resume();

      // 1. BOOT SCREEN
      if (this.state === 'BOOT') {
        if (this.sfx) this.sfx.playUI('select');
        this.setState('TITLE');
        return;
      }

      // 2. PAUSE TOGGLE (ESC during combat or training)
      if (code === 'Escape') {
        if (this.state === 'FIGHTING' || this.state === 'TRAINING') {
          this.setState('PAUSE');
          if (this.sfx) this.sfx.playUI('select');
          return;
        } else if (this.state === 'PAUSE') {
          this.setState(this.previousState);
          if (this.sfx) this.sfx.playUI('select');
          return;
        } else if (this.state === 'HOW_TO_PLAY' || this.state === 'SETTINGS' || this.state === 'STATS') {
          this.setState('TITLE');
          if (this.sfx) this.sfx.playUI('select');
          return;
        } else if (this.state === 'CHAR_SELECT') {
          this.setState('TITLE');
          if (this.sfx) this.sfx.playUI('select');
          return;
        } else if (this.state === 'STAGE_SELECT') {
          this.setState('CHAR_SELECT');
          if (this.sfx) this.sfx.playUI('select');
          return;
        }
      }

      // 3. TITLE MENU NAVIGATION
      if (this.state === 'TITLE') {
        if (code === 'KeyW' || code === 'ArrowUp') {
          this.menus.titleIndex = (this.menus.titleIndex - 1 + this.menus.titleOptions.length) % this.menus.titleOptions.length;
          if (this.sfx) this.sfx.playUI('move');
        } else if (code === 'KeyS' || code === 'ArrowDown') {
          this.menus.titleIndex = (this.menus.titleIndex + 1) % this.menus.titleOptions.length;
          if (this.sfx) this.sfx.playUI('move');
        } else if (code === 'KeyF' || code === 'Enter' || code === 'Space') {
          if (this.sfx) this.sfx.playUI('select');
          const choice = this.menus.titleOptions[this.menus.titleIndex];

          if (choice.includes('CAMPAIGN') || choice.includes('START FIGHT') || choice.includes('ARCADE 1P')) {
            this.isCampaignMode = true;
            this.isTrainingMode = false;
            this.isVsCpuMode = true; // Single player focus!
            this.inputs.aiMode = 'SPARRING';
            this.setState('CHAR_SELECT');
          } else if (choice.includes('TRAINING')) {
            this.isCampaignMode = false;
            this.isTrainingMode = true;
            this.isVsCpuMode = false;
            this.inputs.aiMode = 'STAND';
            this.startTraining();
          } else if (choice.includes('TUTORIAL') || choice.includes('HOW TO PLAY')) {
            this.ui.showTutorial();
          } else if (choice.includes('SETTINGS')) {
            this.setState('SETTINGS');
          } else if (choice.includes('STATS')) {
            this.setState('STATS');
          }
        }
        return;
      }

      // 4. CHARACTER SELECT (HERO DOSSIER & VILLAIN GAUNTLET)
      if (this.state === 'CHAR_SELECT') {
        if (code === 'KeyF' || code === 'Enter' || code === 'Space' || code === 'KeyJ') {
          if (this.sfx) this.sfx.playUI('ready');
          if (this.isTrainingMode) {
            this.startTraining();
          } else {
            this.startCampaign(0);
          }
        } else if (code === 'Escape' || code === 'KeyR') {
          this.setState('TITLE');
          if (this.sfx) this.sfx.playUI('select');
        }
        return;
      }

      // 5. STAGE SELECT
      if (this.state === 'STAGE_SELECT') {
        const total = this.menus.stagesList.length;
        if (code === 'KeyA' || code === 'ArrowLeft') {
          this.menus.stageIndex = (this.menus.stageIndex - 1 + total) % total;
          if (this.sfx) this.sfx.playUI('move');
        } else if (code === 'KeyD' || code === 'ArrowRight') {
          this.menus.stageIndex = (this.menus.stageIndex + 1) % total;
          if (this.sfx) this.sfx.playUI('move');
        } else if (code === 'KeyF' || code === 'Enter' || code === 'KeyJ') {
          if (this.sfx) this.sfx.playUI('select');
          const stagePick = this.menus.stagesList[this.menus.stageIndex];
          if (stagePick === 'Random') {
            this.stageMgr.setRandomStage();
          } else {
            this.stageMgr.setStage(stagePick);
          }

          // Initialize Match Fighters
          this.startNewMatch();
        }
        return;
      }

      // 6. HOW TO PLAY & STATS
      if (this.state === 'HOW_TO_PLAY' || this.state === 'STATS') {
        if (code === 'KeyF' || code === 'Enter' || code === 'Space') {
          if (this.sfx) this.sfx.playUI('select');
          this.setState('TITLE');
        }
        return;
      }

      // 7. SETTINGS MENU
      if (this.state === 'SETTINGS') {
        const total = this.menus.settingsOptions.length;
        if (code === 'KeyW' || code === 'ArrowUp') {
          this.menus.settingsIndex = (this.menus.settingsIndex - 1 + total) % total;
          if (this.sfx) this.sfx.playUI('move');
        } else if (code === 'KeyS' || code === 'ArrowDown') {
          this.menus.settingsIndex = (this.menus.settingsIndex + 1) % total;
          if (this.sfx) this.sfx.playUI('move');
        } else if (code === 'KeyA' || code === 'ArrowLeft') {
          this.adjustSetting(-1);
        } else if (code === 'KeyD' || code === 'ArrowRight' || code === 'KeyF' || code === 'Enter') {
          this.adjustSetting(1);
        }
        return;
      }

      // 8. PAUSE MENU
      if (this.state === 'PAUSE') {
        const total = this.menus.pauseOptions.length;
        if (code === 'KeyW' || code === 'ArrowUp') {
          this.menus.pauseIndex = (this.menus.pauseIndex - 1 + total) % total;
          if (this.sfx) this.sfx.playUI('move');
        } else if (code === 'KeyS' || code === 'ArrowDown') {
          this.menus.pauseIndex = (this.menus.pauseIndex + 1) % total;
          if (this.sfx) this.sfx.playUI('move');
        } else if (code === 'KeyF' || code === 'Enter') {
          if (this.sfx) this.sfx.playUI('select');
          const choice = this.menus.pauseOptions[this.menus.pauseIndex];
          if (choice === 'RESUME') {
            this.setState(this.previousState);
          } else if (choice === 'RESTART ROUND') {
            this.startRound(this.currentRound);
          } else if (choice.includes('TUTORIAL')) {
            this.ui.showTutorial();
          } else if (choice === 'QUIT TO MENU') {
            this.setState('TITLE');
          }
        }
        return;
      }

      // 9. MATCH VICTORY / DEFEAT
      if (this.state === 'MATCH_VICTORY') {
        const total = this.menus.victoryOptions.length;
        if (code === 'KeyW' || code === 'ArrowUp') {
          this.menus.victoryIndex = (this.menus.victoryIndex - 1 + total) % total;
          if (this.sfx) this.sfx.playUI('move');
        } else if (code === 'KeyS' || code === 'ArrowDown') {
          this.menus.victoryIndex = (this.menus.victoryIndex + 1) % total;
          if (this.sfx) this.sfx.playUI('move');
        } else if (code === 'KeyF' || code === 'Enter') {
          if (this.sfx) this.sfx.playUI('select');
          const choice = this.menus.victoryOptions[this.menus.victoryIndex];
          if (choice.includes('RETRY') || choice === 'REMATCH') {
            this.startCampaignStage(this.campaignStage);
          } else if (choice.includes('NEW RUN')) {
            this.startCampaign(0);
          } else if (choice === 'HERO DOSSIER' || choice === 'CHARACTER SELECT') {
            this.setState('CHAR_SELECT');
          } else if (choice === 'MAIN MENU') {
            this.setState('TITLE');
          }
        }
      }
    }

    adjustSetting(dir) {
      const opt = this.menus.settingsOptions[this.menus.settingsIndex];
      const s = this.storage.settings;

      if (opt === 'SFX VOLUME') {
        s.sfxVolume = Math.max(0, Math.min(1.0, Math.round((s.sfxVolume + dir * 0.1) * 10) / 10));
        if (this.sfx) {
          this.sfx.setVolume(s.sfxVolume);
          this.sfx.playUI('select');
        }
      } else if (opt === 'MUSIC VOLUME') {
        s.musicVolume = Math.max(0, Math.min(1.0, Math.round((s.musicVolume + dir * 0.1) * 10) / 10));
        if (this.music) this.music.setVolume(s.musicVolume);
      } else if (opt === 'SCREEN SHAKE') {
        s.screenShake = !s.screenShake;
      } else if (opt === 'CRT FILTER') {
        s.crtEnabled = !s.crtEnabled;
        const container = document.getElementById('screen-container');
        if (container) container.classList.toggle('crt-enabled', s.crtEnabled);
      } else if (opt === 'SCANLINES') {
        s.scanlines = !s.scanlines;
        const container = document.getElementById('screen-container');
        if (container) container.classList.toggle('scanlines-enabled', s.scanlines);
      } else if (opt === 'SHOW HITBOXES') {
        s.showHitboxes = !s.showHitboxes;
      } else if (opt === 'BACK') {
        this.setState('TITLE');
      }

      this.storage.saveSettings();
    }

    // =========================================================================
    // MATCH & ROUND LIFECYCLE
    // =========================================================================
    startCampaign(stageIndex = 0) {
      this.isCampaignMode = true;
      this.isVsCpuMode = true;
      this.isTrainingMode = false;
      this.inputs.aiMode = 'SPARRING';
      this.startCampaignStage(stageIndex);
    }

    startCampaignStage(stageIndex) {
      this.campaignStage = Math.max(0, Math.min(3, stageIndex));
      const step = this.campaignLadder[this.campaignStage];

      // Set arena stage
      this.stageMgr.setStage(step.stageKey);

      // Hero Ardra locked for Player 1
      this.p1 = new window.NeonRumble.Ardra(1, { groundY: 460, x: 280, facing: 1 });

      // Villain for Player 2
      if (step.isMirror) {
        this.p2 = new window.NeonRumble.Ardra(2, {
          groundY: 460,
          x: 680,
          facing: -1,
          primaryColor: '#ff0055',
          secondaryColor: '#ff3300'
        });
        this.p2.name = 'SHADOW ARDRA';
        this.p2.title = 'THE ASTRAL SHADOW';
        this.p2.superPopupText = 'DEATH TONGUE LASH!!!';
      } else {
        const vClass = window.NeonRumble[step.villainClass];
        this.p2 = new vClass(2, { groundY: 460, x: 680, facing: -1 });
      }

      this.p1RoundsWon = 0;
      this.p2RoundsWon = 0;
      this.matchWinner = null;
      this.currentRound = 1;

      this.startRound(1);
    }

    startTraining() {
      this.isCampaignMode = false;
      this.isTrainingMode = true;
      this.isVsCpuMode = false;
      this.inputs.aiMode = 'STAND';
      this.stageMgr.setStage('NeonAlley');
      this.p1 = new window.NeonRumble.Ardra(1, { groundY: 460, x: 280, facing: 1 });
      this.p2 = new window.NeonRumble.Rex(2, { groundY: 460, x: 680, facing: -1 });
      this.p1RoundsWon = 0;
      this.p2RoundsWon = 0;
      this.matchWinner = null;
      this.currentRound = 1;
      this.setState('TRAINING');
      this.p1.superMeter = 100;
      this.p2.superMeter = 100;
    }

    startNewMatch() {
      // Fallback: launches campaign stage 0
      this.startCampaign(0);
    }

    startRound(roundNumber) {
      this.currentRound = roundNumber;
      this.roundTime = 60;
      this.roundTimerFrames = 0;

      // Reset fighter positions
      this.p1.reset(280, 1);
      this.p2.reset(680, -1);

      this.projectiles.clear();
      this.particles.clear();
      this.combos.reset();

      // Check first-time combat tutorial trigger when entering combat zone!
      if (!this.storage.settings.tutorialCompleted && this.campaignStage === 0 && roundNumber === 1 && !this.isTrainingMode) {
        this.setState('ROUND_INTRO');
        this.ui.showAnnouncement('COMBAT TRAINING', 'TRAINING SYSTEMS ONLINE', 90);
        setTimeout(() => {
          this.ui.showTutorial(() => {
            this.proceedWithRoundIntro(roundNumber);
          });
        }, 350);
        return;
      }

      this.proceedWithRoundIntro(roundNumber);
    }

    proceedWithRoundIntro(roundNumber) {
      this.setState('ROUND_INTRO');

      const step = this.isCampaignMode ? this.campaignLadder[this.campaignStage] : null;
      const stageHeading = step ? `STAGE ${this.campaignStage + 1}: ${step.villainName}` : `ROUND ${roundNumber}`;
      const subtitle = (roundNumber === 1 && step) ? step.stageName : '';
      const phrase = roundNumber === 1 ? stageHeading : (roundNumber === 2 ? 'ROUND 2' : 'FINAL ROUND');

      this.ui.showAnnouncement(phrase, subtitle, 75);
      if (this.sfx) {
        this.sfx.playAnnouncer(roundNumber === 1 ? 'ROUND_1' : (roundNumber === 2 ? 'ROUND_2' : 'FINAL_ROUND'));
      }

      setTimeout(() => {
        if (this.state !== 'ROUND_INTRO') return;
        this.ui.showAnnouncement('FIGHT!', '', 55);
        if (this.sfx) {
          this.sfx.playAnnouncer('FIGHT');
          this.sfx.playRoundBell();
        }
        this.setState('FIGHTING');
      }, 1250);
    }

    // =========================================================================
    // MASTER UPDATE TICK
    // =========================================================================
    update() {
      this.menus.update();
      this.ui.update();
      this.inputs.update();
      this.particles.update();
      this.combos.update();

      if (this.state === 'FIGHTING' || this.state === 'TRAINING' || this.state === 'ROUND_END' || this.state === 'ROUND_INTRO') {
        const stage = this.stageMgr.currentStage;

        // Training mode infinite stats toggle
        if (this.state === 'TRAINING') {
          this.p1.health = 100;
          this.p2.health = 100;
          this.p1.ghostHealth = 100;
          this.p2.ghostHealth = 100;
          this.p1.superMeter = 100;
          this.p2.superMeter = 100;
        }

        // 1. Get Player Inputs
        const p1Input = (this.state === 'FIGHTING' || this.state === 'TRAINING') ? this.inputs.getP1Input() : null;
        const p2Input = (this.state === 'FIGHTING' || this.state === 'TRAINING') ? this.inputs.getP2Input(this.p2, this.p1) : null;

        // 2. Update Fighters
        this.p1.update(this.p2, p1Input, stage);
        this.p2.update(this.p1, p2Input, stage);

        // 3. Update Projectiles
        this.projectiles.update(stage);

        // 4. Update Camera
        this.camera.update(this.p1, this.p2, stage);

        // 5. Combat Collision Checks (Only in FIGHTING or TRAINING)
        if (this.state === 'FIGHTING' || this.state === 'TRAINING') {
          this.checkCombatCollisions();

          // Round Timer Countdown
          this.roundTimerFrames++;
          if (this.roundTimerFrames >= 60) {
            this.roundTimerFrames = 0;
            if (this.roundTime > 0) this.roundTime--;
          }

          // Check Round Over Conditions (KO or Time Out)
          if (this.p1.health <= 0 || this.p2.health <= 0 || this.roundTime <= 0) {
            this.handleRoundOver();
          }
        }
      }

      // Round End slow-motion wait
      if (this.state === 'ROUND_END') {
        this.transitionTimer++;
        if (this.transitionTimer >= 140) {
          if (this.p1RoundsWon >= 2 || this.p2RoundsWon >= 2) {
            // Match Won or Lost!
            this.matchWinner = this.p1RoundsWon >= 2 ? 1 : 2;
            const winnerFighter = this.matchWinner === 1 ? this.p1 : this.p2;
            winnerFighter.setState('VICTORY');
            const loserFighter = this.matchWinner === 1 ? this.p2 : this.p1;
            loserFighter.setState('DEFEAT');

            // Record in LocalStorage
            this.storage.recordMatchResult(
              this.matchWinner,
              this.p1.id,
              this.p2.id,
              Math.max(this.combos.p1Combo.maxCombo, this.combos.p2Combo.maxCombo)
            );

            if (this.matchWinner === 1 && this.isCampaignMode) {
              // Ardra defeated this stage's villain!
              if (this.campaignStage < 3) {
                const currentVillain = this.campaignLadder[this.campaignStage].villainName;
                const nextStep = this.campaignLadder[this.campaignStage + 1];
                this.ui.showAnnouncement(
                  `STAGE ${this.campaignStage + 1} CLEAR!`,
                  `${currentVillain} DEFEATED! ADVANCING TO ${nextStep.stageName}...`,
                  130
                );
                if (this.sfx) this.sfx.playUI('ready');

                setTimeout(() => {
                  this.startCampaignStage(this.campaignStage + 1);
                }, 2200);
                return;
              } else {
                // Grand Victory! Shadow Ardra in Astral Core defeated!
                this.setState('MATCH_VICTORY');
              }
            } else {
              // Defeated by villain or standard match
              this.setState('MATCH_VICTORY');
            }
          } else {
            // Next Round in current match
            this.startRound(this.currentRound + 1);
          }
        }
      }
    }

    // =========================================================================
    // COMBAT HITBOX / HURTBOX DETECTION
    // =========================================================================
    checkCombatCollisions() {
      // 1. P1 Melee Attack vs P2 Hurtbox
      const p1Hitbox = this.p1.getActiveHitbox();
      const p2Hurtbox = this.p2.getHurtbox();

      if (p1Hitbox && p2Hurtbox && Box.checkOverlap(p1Hitbox, p2Hurtbox)) {
        this.p1.hasHit = true;
        this.p2.takeHit(this.p1.currentAttack, this.p1);
      }

      // 2. P2 Melee Attack vs P1 Hurtbox
      const p2Hitbox = this.p2.getActiveHitbox();
      const p1Hurtbox = this.p1.getHurtbox();

      if (p2Hitbox && p1Hurtbox && Box.checkOverlap(p2Hitbox, p1Hurtbox)) {
        this.p2.hasHit = true;
        this.p1.takeHit(this.p2.currentAttack, this.p2);
      }

      // 3. Projectile Collisions
      this.projectiles.projectiles.forEach(proj => {
        if (!proj.active) return;
        const target = proj.owner === 1 ? this.p2 : this.p1;
        const targetHurtbox = target.getHurtbox();
        const projHitbox = proj.getHitbox();

        if (Box.checkOverlap(projHitbox, targetHurtbox)) {
          proj.active = false;
          target.takeHit({
            damage: proj.damage,
            chipDamage: proj.chipDamage,
            knockback: proj.knockback,
            hitstun: proj.hitstun,
            freezeFrames: 6,
            level: 'SPECIAL'
          }, proj.owner === 1 ? this.p1 : this.p2);
        }
      });
    }

    // =========================================================================
    // ROUND OVER & KO SEQUENCE
    // =========================================================================
    handleRoundOver() {
      this.setState('ROUND_END');

      let winner = null;
      let reason = 'KO';

      if (this.p1.health <= 0 && this.p2.health <= 0) {
        // Double KO / Draw
        reason = 'DRAW';
      } else if (this.p1.health <= 0) {
        winner = 2;
        this.p2RoundsWon++;
      } else if (this.p2.health <= 0) {
        winner = 1;
        this.p1RoundsWon++;
      } else if (this.roundTime <= 0) {
        reason = 'TIME OVER';
        if (this.p1.health > this.p2.health) {
          winner = 1;
          this.p1RoundsWon++;
        } else if (this.p2.health > this.p1.health) {
          winner = 2;
          this.p2RoundsWon++;
        } else {
          reason = 'DRAW';
        }
      }

      // Visual & Audio fanfare
      if (reason === 'DRAW') {
        this.ui.showAnnouncement('DRAW!', '', 90);
      } else if (reason === 'TIME OVER') {
        this.ui.showAnnouncement('TIME OVER!', `PLAYER ${winner} WINS ROUND`, 90);
        if (this.sfx) this.sfx.playRoundBell();
      } else {
        // Dramatic K.O.!
        this.ui.showAnnouncement('K.O.!', `PLAYER ${winner} WINS ROUND`, 90);
        if (this.sfx) {
          this.sfx.playKO();
          this.sfx.playAnnouncer('KO');
        }
        if (this.camera) this.camera.addShake(20);
      }
    }

    // =========================================================================
    // MASTER RENDER
    // =========================================================================
    draw(ctx) {
      ctx.clearRect(0, 0, 960, 540);

      if (this.state === 'BOOT') {
        this.menus.drawBoot(ctx);
        return;
      }
      if (this.state === 'TITLE') {
        this.menus.drawTitle(ctx);
        return;
      }
      if (this.state === 'CHAR_SELECT') {
        this.menus.drawCharSelect(ctx);
        return;
      }
      if (this.state === 'STAGE_SELECT') {
        this.menus.drawStageSelect(ctx);
        return;
      }
      if (this.state === 'HOW_TO_PLAY') {
        this.menus.drawHowToPlay(ctx);
        return;
      }
      if (this.state === 'SETTINGS') {
        this.menus.drawSettings(ctx);
        return;
      }
      if (this.state === 'STATS') {
        this.menus.drawStats(ctx);
        return;
      }

      // Fighting Arena Rendering with Dynamic Camera
      this.camera.applyTransform(ctx);

      // 1. Stage Background
      this.stageMgr.draw(ctx, this.camera);

      // 2. Projectiles
      this.projectiles.draw(ctx);

      // 3. Fighters
      if (this.p1 && this.p2) {
        this.renderer.drawFighter(ctx, this.p1);
        this.renderer.drawFighter(ctx, this.p2);
      }

      // 4. Particles & Sparks
      this.particles.draw(ctx);

      // 5. Debug Hitboxes Overlay
      if (this.p1 && this.p2) {
        this.ui.drawHitboxes(ctx, this.p1, this.p2);
      }

      this.camera.restoreTransform(ctx);

      // 6. Fixed Screen HUD
      if (this.p1 && this.p2) {
        this.ui.drawHUD(
          ctx,
          this.p1,
          this.p2,
          this.roundTime,
          this.currentRound,
          this.p1RoundsWon,
          this.p2RoundsWon
        );
      }

      // 7. Modals / Overlays
      if (this.state === 'PAUSE') {
        this.menus.drawPause(ctx);
      } else if (this.state === 'MATCH_VICTORY') {
        this.menus.drawVictory(ctx, this.matchWinner, this.matchWinner === 1 ? this.p1 : this.p2);
      }
    }
  }

  window.NeonRumble.GameState = new GameStateManager();
})();
