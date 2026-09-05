/**
 * main.js - Application Entry Point & Game Loop
 * Virtual 960x540 canvas scaling, fixed timestep / 60 FPS loop, and bezel controls.
 */
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Game canvas element not found!');
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: false });
  // Disable image smoothing for razor-sharp retro pixel aesthetics
  ctx.imageSmoothingEnabled = false;

  const gameState = window.NeonRumble.GameState;
  const soundSynth = window.NeonRumble.SoundSynth;
  const storage = window.NeonRumble.Storage;

  // Apply stored CRT & scanline settings
  const screenContainer = document.getElementById('screen-container');
  if (screenContainer && storage) {
    screenContainer.classList.toggle('crt-enabled', storage.settings.crtEnabled);
    screenContainer.classList.toggle('scanlines-enabled', storage.settings.scanlines);
  }

  // Bezel Buttons
  const btnCrt = document.getElementById('btn-crt-toggle');
  if (btnCrt && storage) {
    btnCrt.textContent = storage.settings.crtEnabled ? '📺 CRT: ON' : '📺 CRT: OFF';
    btnCrt.addEventListener('click', () => {
      storage.settings.crtEnabled = !storage.settings.crtEnabled;
      storage.settings.scanlines = storage.settings.crtEnabled;
      screenContainer.classList.toggle('crt-enabled', storage.settings.crtEnabled);
      screenContainer.classList.toggle('scanlines-enabled', storage.settings.scanlines);
      btnCrt.textContent = storage.settings.crtEnabled ? '📺 CRT: ON' : '📺 CRT: OFF';
      storage.saveSettings();
    });
  }

  const btnFullscreen = document.getElementById('btn-fullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      const cabinet = document.getElementById('arcade-cabinet');
      if (!document.fullscreenElement) {
        if (cabinet.requestFullscreen) cabinet.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  const btnPause = document.getElementById('btn-pause-toggle');
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      if (gameState.state === 'FIGHTING' || gameState.state === 'TRAINING') {
        gameState.setState('PAUSE');
      } else if (gameState.state === 'PAUSE') {
        gameState.setState(gameState.previousState);
      }
    });
  }

  // Audio prompt unlock
  const audioPrompt = document.getElementById('audio-prompt');
  const audioStartBtn = document.getElementById('audio-start-btn');
  const unlockAudio = () => {
    if (soundSynth) soundSynth.resume();
    if (audioPrompt) audioPrompt.classList.add('hidden');
  };

  if (audioStartBtn) audioStartBtn.addEventListener('click', unlockAudio);
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  // Direct canvas tap/click to confirm or navigate in menus
  canvas.addEventListener('click', () => {
    unlockAudio();
    if (gameState.state !== 'FIGHTING' && gameState.state !== 'TRAINING' && gameState.state !== 'ROUND_INTRO') {
      gameState.handleKeyDown('Enter', 'Enter');
    }
  });

  // FPS Counter
  const fpsDisplay = document.getElementById('fps-counter');
  let frameCount = 0;
  let lastFpsTime = performance.now();

  // Master Game Loop
  let lastTime = performance.now();
  const targetFps = 60;
  const frameDuration = 1000 / targetFps;
  let accumulator = 0;

  function gameLoop(currentTime) {
    const delta = currentTime - lastTime;
    lastTime = currentTime;
    accumulator += delta;

    // Prevent spiral of death on long tab pause
    if (accumulator > 250) accumulator = 250;

    while (accumulator >= frameDuration) {
      gameState.update();
      accumulator -= frameDuration;
    }

    gameState.draw(ctx);

    // FPS Meter update
    frameCount++;
    if (currentTime - lastFpsTime >= 1000) {
      if (fpsDisplay) {
        fpsDisplay.textContent = `${frameCount} FPS`;
      }
      frameCount = 0;
      lastFpsTime = currentTime;
    }

    requestAnimationFrame(gameLoop);
  }

  // Initialize Game State and start loop
  gameState.init();
  requestAnimationFrame(gameLoop);
});
