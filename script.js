/**
 * 🎯 AIM MASTER — Target Shooting Challenge
 * Production-Quality Vanilla JavaScript Game Engine
 */

'use strict';

/* ==========================================================================
   1. SOUND ENGINE (Procedural Audio via Web Audio API)
   ========================================================================== */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.2, freqRamp = null) {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      if (freqRamp) {
        osc.frequency.exponentialRampToValueAtTime(freqRamp, this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio synthesis errors on old browsers
    }
  }

  playHit() {
    this.playTone(800, 'sine', 0.08, 0.25, 1400);
  }

  playSmallHit() {
    this.playTone(1100, 'triangle', 0.1, 0.3, 1800);
  }

  playBonus() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    // Arpeggio chime
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.12, 0.25);
      }, idx * 50);
    });
  }

  playBomb() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    this.playTone(150, 'sawtooth', 0.35, 0.4, 40);
  }

  playMiss() {
    this.playTone(220, 'sine', 0.08, 0.1, 150);
  }

  playCombo() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    this.playTone(880, 'sine', 0.15, 0.3, 1320);
  }

  playCountdown(isGo = false) {
    if (isGo) {
      this.playTone(880, 'triangle', 0.25, 0.35);
    } else {
      this.playTone(440, 'sine', 0.12, 0.25);
    }
  }

  playGameOver() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    const notes = [440, 392, 349, 293];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.2, 0.25);
      }, idx * 120);
    });
  }

  playHighScore() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.15, 0.3);
      }, idx * 80);
    });
  }
}

/* ==========================================================================
   2. STORAGE MANAGER (LocalStorage Handling & Leaderboards)
   ========================================================================== */
class StorageManager {
  constructor() {
    this.STORAGE_KEY_STATS = 'aim_master_stats_v1';
    this.STORAGE_KEY_LEADERBOARD = 'aim_master_leaderboard_v1';
    this.STORAGE_KEY_SETTINGS = 'aim_master_settings_v1';
  }

  getStats() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_STATS);
      return data ? JSON.parse(data) : {
        highScores: { easy: 0, medium: 0, hard: 0 },
        bestAccuracy: 0,
        totalGames: 0,
        totalHits: 0,
        bestCombo: 0
      };
    } catch (e) {
      return { highScores: { easy: 0, medium: 0, hard: 0 }, bestAccuracy: 0, totalGames: 0, totalHits: 0, bestCombo: 0 };
    }
  }

  saveStats(stats) {
    try {
      localStorage.setItem(this.STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('Unable to write stats to localStorage');
    }
  }

  getLeaderboard() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_LEADERBOARD);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  addLeaderboardEntry(entry) {
    const list = this.getLeaderboard();
    list.push(entry);
    // Sort by score descending
    list.sort((a, b) => b.score - a.score);
    // Keep top 20 entries
    const trimmed = list.slice(0, 20);
    try {
      localStorage.setItem(this.STORAGE_KEY_LEADERBOARD, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Unable to write leaderboard');
    }
    return trimmed;
  }

  getSettings() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_SETTINGS);
      return data ? JSON.parse(data) : {
        sound: true,
        difficulty: 'medium',
        targetSpeed: 'normal',
        theme: 'dark',
        playerName: 'Sharpshooter'
      };
    } catch (e) {
      return { sound: true, difficulty: 'medium', targetSpeed: 'normal', theme: 'dark', playerName: 'Sharpshooter' };
    }
  }

  saveSettings(settings) {
    try {
      localStorage.setItem(this.STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }

  resetAllData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY_STATS);
      localStorage.removeItem(this.STORAGE_KEY_LEADERBOARD);
    } catch (e) {}
  }
}

/* ==========================================================================
   3. VISUAL EFFECTS (Particles & Floating Score Texts)
   ========================================================================== */
class Particle {
  constructor(x, y, color, isBomb = false) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = isBomb ? Math.random() * 8 + 3 : Math.random() * 5 + 1.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = Math.random() * (isBomb ? 6 : 4) + 2;
    this.alpha = 1;
    this.decay = Math.random() * 0.03 + 0.015;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class FloatingText {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.alpha = 1;
    this.vy = -1.5;
    this.scale = 1.3;
    this.decay = 0.025;
  }

  update() {
    this.y += this.vy;
    this.scale = Math.max(1, this.scale - 0.015);
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.font = `900 ${Math.round(20 * this.scale)}px "Orbitron", sans-serif`;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class ClickRipple {
  constructor(x, y, color = 'rgba(255, 255, 255, 0.4)') {
    this.x = x;
    this.y = y;
    this.radius = 4;
    this.maxRadius = 24;
    this.color = color;
    this.alpha = 1;
  }

  update() {
    this.radius += 1.5;
    this.alpha = 1 - (this.radius / this.maxRadius);
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/* ==========================================================================
   4. TARGET OBJECT (Rendered & Animated Target Entities)
   ========================================================================== */
class Target {
  constructor(canvasWidth, canvasHeight, baseRadius, type = 'normal', speedMultiplier = 1) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.type = type;

    // Config based on type
    switch (type) {
      case 'small':
        this.baseRadius = baseRadius * 0.65;
        this.points = 20;
        this.colorMain = '#b55fe6'; // Purple
        this.colorAccent = '#ffffff';
        this.speedScale = 1.4 * speedMultiplier;
        this.lifetime = null;
        break;
      case 'bonus':
        this.baseRadius = baseRadius * 0.85;
        this.points = 50;
        this.colorMain = '#ffb700'; // Gold
        this.colorAccent = '#ffffff';
        this.speedScale = 1.6 * speedMultiplier;
        this.lifetime = 2.5; // 2.5 seconds lifetime
        break;
      case 'bomb':
        this.baseRadius = baseRadius * 0.9;
        this.points = -10;
        this.colorMain = '#ff3366'; // Crimson Red
        this.colorAccent = '#111111';
        this.speedScale = 1.1 * speedMultiplier;
        this.lifetime = null;
        break;
      case 'normal':
      default:
        this.baseRadius = baseRadius;
        this.points = 10;
        this.colorMain = '#00f3ff'; // Cyan
        this.colorAccent = '#ffffff';
        this.speedScale = 1.0 * speedMultiplier;
        this.lifetime = null;
        break;
    }

    this.radius = this.baseRadius;
    this.hitRadius = this.radius * 1.15; // Generous hit area for high precision touch

    // Random Position ensuring full containment inside margins
    const margin = this.baseRadius * 2 + 10;
    this.x = margin + Math.random() * Math.max(10, canvasWidth - margin * 2);
    this.y = margin + Math.random() * Math.max(10, canvasHeight - margin * 2);

    // Velocity Vector
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 1.5 + 1.2) * this.speedScale;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Animations & Timers
    this.scale = 0; // Spawn scale-up animation
    this.spawnTime = performance.now();
    this.age = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.rotation = 0;
  }

  update(deltaTime) {
    this.age += deltaTime;

    // Spawn Animation (0 to 1 scale)
    if (this.scale < 1) {
      this.scale = Math.min(1, this.scale + deltaTime * 5);
    }

    // Move Target
    this.x += this.vx;
    this.y += this.vy;

    // Wall Bouncing Physics
    const margin = this.baseRadius * this.scale;
    if (this.x - margin <= 10) {
      this.x = 10 + margin;
      this.vx *= -1;
    } else if (this.x + margin >= this.canvasWidth - 10) {
      this.x = this.canvasWidth - 10 - margin;
      this.vx *= -1;
    }

    if (this.y - margin <= 10) {
      this.y = 10 + margin;
      this.vy *= -1;
    } else if (this.y + margin >= this.canvasHeight - 10) {
      this.y = this.canvasHeight - 10 - margin;
      this.vy *= -1;
    }

    // Pulse & Rotation updates
    this.pulsePhase += deltaTime * 4;
    this.rotation += deltaTime * 2;
  }

  isExpired() {
    if (this.lifetime !== null) {
      return this.age >= this.lifetime;
    }
    return false;
  }

  draw(ctx) {
    if (this.scale <= 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    const pulse = Math.sin(this.pulsePhase) * 0.08 + 1;
    const currentRadius = this.baseRadius * pulse;

    if (this.type === 'bomb') {
      this.drawBomb(ctx, currentRadius);
    } else if (this.type === 'bonus') {
      this.drawBonusTarget(ctx, currentRadius);
    } else {
      this.drawStandardTarget(ctx, currentRadius);
    }

    ctx.restore();
  }

  drawStandardTarget(ctx, r) {
    // Subtle outer glow
    ctx.shadowColor = this.colorMain;
    ctx.shadowBlur = 15;

    // Outer Ring
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 13, 20, 0.6)';
    ctx.fill();
    ctx.lineWidth = Math.max(2, r * 0.15);
    ctx.strokeStyle = this.colorMain;
    ctx.stroke();

    // Middle Ring
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
    ctx.strokeStyle = this.colorAccent;
    ctx.lineWidth = Math.max(1.5, r * 0.1);
    ctx.stroke();

    // Inner Bullseye Center
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = this.colorMain;
    ctx.fill();

    // Center Pinpoint Dot
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(2, r * 0.08), 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Crosshair Lines
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 1.15, 0); ctx.lineTo(-r * 0.7, 0);
    ctx.moveTo(r * 0.7, 0);   ctx.lineTo(r * 1.15, 0);
    ctx.moveTo(0, -r * 1.15); ctx.lineTo(0, -r * 0.7);
    ctx.moveTo(0, r * 0.7);   ctx.lineTo(0, r * 1.15);
    ctx.stroke();
  }

  drawBonusTarget(ctx, r) {
    ctx.shadowColor = '#ffb700';
    ctx.shadowBlur = 20;

    // Lifetime Countdown Ring
    if (this.lifetime) {
      const remainingRatio = Math.max(0, 1 - (this.age / this.lifetime));
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.25, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * remainingRatio));
      ctx.strokeStyle = '#ffb700';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Rotating Outer Star / Diamond Ring
    ctx.save();
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 183, 0, 0.25)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffb700';
    ctx.stroke();
    ctx.restore();

    // Inner Gold Disc
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb700';
    ctx.fill();

    // Core Star Icon Symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.round(r * 0.6)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', 0, 0);
  }

  drawBomb(ctx, r) {
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 20;

    // Outer Dark Red Pulsing Sphere
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1a050a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff3366';
    ctx.stroke();

    // Inner Warning Cross
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, -r * 0.45); ctx.lineTo(r * 0.45, r * 0.45);
    ctx.moveTo(r * 0.45, -r * 0.45);  ctx.lineTo(-r * 0.45, r * 0.45);
    ctx.stroke();

    // Bomb Icon
    ctx.font = `900 ${Math.round(r * 0.7)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💣', 0, 0);
  }
}

/* ==========================================================================
   5. GAME ENGINE & MAIN LOOP
   ========================================================================== */
class GameEngine {
  constructor(sound, storage, ui) {
    this.sound = sound;
    this.storage = storage;
    this.ui = ui;

    // DOM Elements
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.wrapper = document.getElementById('canvas-wrapper');

    // Game Configs by Difficulty
    this.diffConfigs = {
      easy: { duration: 60, baseRadius: 38, speedMultiplier: 1.0, maxTargets: 2, name: 'EASY' },
      medium: { duration: 45, baseRadius: 28, speedMultiplier: 1.4, maxTargets: 3, name: 'MEDIUM' },
      hard: { duration: 30, baseRadius: 20, speedMultiplier: 1.9, maxTargets: 4, name: 'HARD' }
    };

    // State Variables
    this.state = 'MENU'; // MENU, COUNTDOWN, PLAYING, PAUSED, GAME_OVER
    this.difficulty = 'medium';
    this.score = 0;
    this.highScore = 0;
    this.timeRemaining = 0;
    this.hits = 0;
    this.misses = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.reactionTimes = [];
    this.playerName = 'Sharpshooter';
    this.extraSpeedMultiplier = 1.0;

    // Game Objects
    this.targets = [];
    this.particles = [];
    this.floatingTexts = [];
    this.ripples = [];

    // Loop & Timing
    this.lastTime = 0;
    this.animationFrameId = null;
    this.countdownTimerId = null;

    this.initCanvasSize();
    this.setupEventListeners();
  }

  initCanvasSize() {
    const rect = this.wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.scale(dpr, dpr);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
    });

    // Pointer event for unified Touch & Mouse input
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.state !== 'PLAYING') return;
      e.preventDefault();

      const rect = this.canvas.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      this.handlePointerClick(pointerX, pointerY);
    });

    // Auto-Pause when user switches browser tab
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'PLAYING') {
        this.pauseGame();
      }
    });

    // Keyboard Shortcuts (P or ESC to pause)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (this.state === 'PLAYING') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
      }
    });
  }

  setDifficulty(diffKey) {
    if (this.diffConfigs[diffKey]) {
      this.difficulty = diffKey;
    }
  }

  setPlayerName(name) {
    if (name && name.trim().length > 0) {
      this.playerName = name.trim();
    }
  }

  setTargetSpeedMode(speedMode) {
    this.extraSpeedMultiplier = speedMode === 'fast' ? 1.4 : 1.0;
  }

  startNewGame() {
    const config = this.diffConfigs[this.difficulty];
    const stats = this.storage.getStats();

    this.score = 0;
    this.highScore = stats.highScores[this.difficulty] || 0;
    this.timeRemaining = config.duration;
    this.hits = 0;
    this.misses = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.reactionTimes = [];

    this.targets = [];
    this.particles = [];
    this.floatingTexts = [];
    this.ripples = [];

    this.ui.updateHUD({
      score: this.score,
      highScore: this.highScore,
      time: this.timeRemaining,
      hits: this.hits,
      misses: this.misses,
      accuracy: 100,
      combo: this.combo
    });

    this.state = 'COUNTDOWN';
    this.ui.showCountdown(3, () => {
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      this.maintainTargets();
      this.gameLoop(this.lastTime);
    });
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.ui.showPauseOverlay(true);
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.ui.showPauseOverlay(false);
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  maintainTargets() {
    const config = this.diffConfigs[this.difficulty];
    const maxTargets = config.maxTargets;

    while (this.targets.length < maxTargets) {
      this.spawnRandomTarget();
    }
  }

  spawnRandomTarget() {
    const config = this.diffConfigs[this.difficulty];
    const speedMult = config.speedMultiplier * this.extraSpeedMultiplier;

    // Random Weighted Selection
    // Normal: 65%, Small: 20%, Bonus: 10%, Bomb: 15%
    const rand = Math.random();
    let type = 'normal';

    if (rand < 0.12) {
      type = 'bomb';
    } else if (rand < 0.22) {
      type = 'bonus';
    } else if (rand < 0.42) {
      type = 'small';
    } else {
      type = 'normal';
    }

    const target = new Target(this.width, this.height, config.baseRadius, type, speedMult);
    this.targets.push(target);
  }

  handlePointerClick(x, y) {
    let hitIndex = -1;

    // Check hit in reverse order (topmost target clicked first)
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      const dist = Math.hypot(x - t.x, y - t.y);

      if (dist <= t.hitRadius) {
        hitIndex = i;
        break;
      }
    }

    if (hitIndex !== -1) {
      // SUCCESSFUL HIT
      const target = this.targets[hitIndex];
      const hitTime = performance.now();
      const reactionTime = hitTime - target.spawnTime;
      this.reactionTimes.push(reactionTime);

      if (target.type === 'bomb') {
        // Bomb Hit Penalty
        this.score = Math.max(0, this.score - 10);
        this.combo = 0;
        this.sound.playBomb();
        this.spawnExplosion(target.x, target.y, '#ff3366', true);
        this.floatingTexts.push(new FloatingText(target.x, target.y, '-10 BOMB!', '#ff3366'));
        this.ui.triggerScreenShake();
      } else {
        // Target Hit Success
        this.hits++;
        this.combo++;
        if (this.combo > this.bestCombo) this.bestCombo = this.combo;

        // Combo Multiplier calculation
        let multiplier = 1.0;
        if (this.combo >= 10) multiplier = 2.0;
        else if (this.combo >= 5) multiplier = 1.5;
        else if (this.combo >= 3) multiplier = 1.2;

        const earnedPoints = Math.round(target.points * multiplier);
        this.score += earnedPoints;

        // Sound & FX
        if (target.type === 'bonus') {
          this.sound.playBonus();
          this.floatingTexts.push(new FloatingText(target.x, target.y, `+${earnedPoints} BONUS!`, '#ffb700'));
        } else if (target.type === 'small') {
          this.sound.playSmallHit();
          this.floatingTexts.push(new FloatingText(target.x, target.y, `+${earnedPoints}`, '#b55fe6'));
        } else {
          this.sound.playHit();
          this.floatingTexts.push(new FloatingText(target.x, target.y, `+${earnedPoints}`, '#00f3ff'));
        }

        if (this.combo === 3 || this.combo === 5 || this.combo === 10) {
          this.sound.playCombo();
        }

        this.spawnExplosion(target.x, target.y, target.colorMain, false);
      }

      // Remove target and spawn replacement
      this.targets.splice(hitIndex, 1);
      this.maintainTargets();

    } else {
      // MISSED CLICK
      this.misses++;
      this.combo = 0; // Miss resets combo
      this.sound.playMiss();
      this.ripples.push(new ClickRipple(x, y));
    }

    // Real-Time HUD Refresh
    const totalClicks = this.hits + this.misses;
    const accuracy = totalClicks > 0 ? Math.round((this.hits / totalClicks) * 100) : 100;

    this.ui.updateHUD({
      score: this.score,
      highScore: Math.max(this.score, this.highScore),
      time: this.timeRemaining,
      hits: this.hits,
      misses: this.misses,
      accuracy: accuracy,
      combo: this.combo
    });
  }

  spawnExplosion(x, y, color, isBomb = false) {
    const count = isBomb ? 25 : 14;
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color, isBomb));
    }
  }

  gameLoop(currentTime) {
    if (this.state !== 'PLAYING') return;

    const deltaTime = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // Update Timer
    this.timeRemaining -= deltaTime;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.endGame();
      return;
    }

    // Update Targets & Remove Expired Bonus Targets
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      t.update(deltaTime);

      if (t.isExpired()) {
        this.targets.splice(i, 1);
        this.maintainTargets();
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    // Update Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.update();
      if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
    }

    // Update Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.update();
      if (rip.alpha <= 0) this.ripples.splice(i, 1);
    }

    // Render Everything
    this.render();

    // Update Timer HUD Display
    this.ui.updateTimerDisplay(this.timeRemaining);

    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Subtle Grid Pattern Background
    this.drawGrid();

    // Draw Target Entities
    this.targets.forEach(t => t.draw(this.ctx));

    // Draw Particles
    this.particles.forEach(p => p.draw(this.ctx));

    // Draw Ripples
    this.ripples.forEach(rip => rip.draw(this.ctx));

    // Draw Floating Text
    this.floatingTexts.forEach(ft => ft.draw(this.ctx));
  }

  drawGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;

    const gridSize = 40;
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  endGame() {
    this.state = 'GAME_OVER';
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const totalClicks = this.hits + this.misses;
    const accuracy = totalClicks > 0 ? Math.round((this.hits / totalClicks) * 100) : 0;
    const avgReaction = this.reactionTimes.length > 0
      ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
      : 0;

    // Check & Save High Score
    const stats = this.storage.getStats();
    let isNewHighScore = false;

    if (this.score > (stats.highScores[this.difficulty] || 0)) {
      stats.highScores[this.difficulty] = this.score;
      isNewHighScore = true;
    }

    if (accuracy > stats.bestAccuracy) stats.bestAccuracy = accuracy;
    if (this.bestCombo > stats.bestCombo) stats.bestCombo = this.bestCombo;
    stats.totalGames += 1;
    stats.totalHits += this.hits;

    this.storage.saveStats(stats);

    // Save Leaderboard Entry
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.storage.addLeaderboardEntry({
      rank: 0,
      name: this.playerName,
      score: this.score,
      difficulty: this.difficulty.toUpperCase(),
      accuracy: `${accuracy}%`,
      date: dateStr
    });

    if (isNewHighScore) {
      this.sound.playHighScore();
    } else {
      this.sound.playGameOver();
    }

    // Trigger Game Over Modal
    this.ui.showGameOverModal({
      score: this.score,
      highScore: stats.highScores[this.difficulty],
      accuracy: accuracy,
      hits: this.hits,
      misses: this.misses,
      bestCombo: this.bestCombo,
      avgReaction: avgReaction,
      isNewHighScore: isNewHighScore,
      playerName: this.playerName
    });
  }
}

/* ==========================================================================
   6. UI CONTROLLER (Screen Management & User Interactions)
   ========================================================================== */
class UIController {
  constructor() {
    this.sound = new SoundEngine();
    this.storage = new StorageManager();
    this.game = new GameEngine(this.sound, this.storage, this);

    this.initUI();
  }

  initUI() {
    this.loadSettingsToUI();
    this.setupButtonListeners();
    this.renderLeaderboardTable('all');
  }

  loadSettingsToUI() {
    const settings = this.storage.getSettings();
    this.sound.enabled = settings.sound;

    const soundBtn = document.getElementById('setting-sound-btn');
    if (soundBtn) {
      soundBtn.classList.toggle('active', settings.sound);
      soundBtn.setAttribute('aria-pressed', settings.sound);
      soundBtn.querySelector('.toggle-text').textContent = settings.sound ? 'ON' : 'OFF';
    }

    const soundHeaderBtn = document.getElementById('btn-sound-toggle');
    if (soundHeaderBtn) {
      soundHeaderBtn.querySelector('.sound-icon').textContent = settings.sound ? '🔊' : '🔇';
    }

    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) {
      themeSelect.value = settings.theme || 'dark';
      document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
    }

    const speedSelect = document.getElementById('setting-speed-select');
    if (speedSelect) {
      speedSelect.value = settings.targetSpeed || 'normal';
      this.game.setTargetSpeedMode(settings.targetSpeed || 'normal');
    }

    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
      nameInput.value = settings.playerName || 'Sharpshooter';
      this.game.setPlayerName(settings.playerName || 'Sharpshooter');
    }

    this.game.setDifficulty(settings.difficulty || 'medium');
    this.updateDifficultyButtons(settings.difficulty || 'medium');
  }

  setupButtonListeners() {
    // Difficulty Radio Buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.getAttribute('data-diff');
        this.updateDifficultyButtons(diff);
        this.game.setDifficulty(diff);

        const settings = this.storage.getSettings();
        settings.difficulty = diff;
        this.storage.saveSettings(settings);
      });
    });

    // Player Name Input
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim() || 'Sharpshooter';
        this.game.setPlayerName(val);
        const settings = this.storage.getSettings();
        settings.playerName = val;
        this.storage.saveSettings(settings);
      });
    }

    // Play Now Button
    document.getElementById('btn-start').addEventListener('click', () => {
      this.switchScreen('screen-game');
      this.game.startNewGame();
    });

    // Header Sound Toggle
    document.getElementById('btn-sound-toggle').addEventListener('click', () => {
      this.toggleSound();
    });

    // Header Theme Toggle
    document.getElementById('btn-theme-toggle').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);

      const settings = this.storage.getSettings();
      settings.theme = next;
      this.storage.saveSettings(settings);
    });

    // Menu Navigation Modals
    document.getElementById('btn-how-to-play').addEventListener('click', () => {
      this.openModal('modal-how-to-play');
    });

    document.getElementById('btn-leaderboard').addEventListener('click', () => {
      this.renderLeaderboardTable('all');
      this.openModal('modal-leaderboard');
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
      this.openModal('modal-settings');
    });

    // Pause Controls
    document.getElementById('btn-pause').addEventListener('click', () => {
      this.game.pauseGame();
    });

    document.getElementById('btn-resume').addEventListener('click', () => {
      this.game.resumeGame();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      this.showPauseOverlay(false);
      this.game.startNewGame();
    });

    document.getElementById('btn-pause-main-menu').addEventListener('click', () => {
      this.showPauseOverlay(false);
      this.switchScreen('screen-menu');
    });

    // Game Over Buttons
    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.closeModal('modal-gameover');
      this.game.startNewGame();
    });

    document.getElementById('btn-go-main-menu').addEventListener('click', () => {
      this.closeModal('modal-gameover');
      this.switchScreen('screen-menu');
    });

    // Modal Close Buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        this.closeModal(modalId);
      });
    });

    // Settings Controls
    document.getElementById('setting-sound-btn').addEventListener('click', () => {
      this.toggleSound();
    });

    document.getElementById('setting-speed-select').addEventListener('change', (e) => {
      const speed = e.target.value;
      this.game.setTargetSpeedMode(speed);

      const settings = this.storage.getSettings();
      settings.targetSpeed = speed;
      this.storage.saveSettings(settings);
    });

    document.getElementById('setting-theme-select').addEventListener('change', (e) => {
      const theme = e.target.value;
      document.documentElement.setAttribute('data-theme', theme);

      const settings = this.storage.getSettings();
      settings.theme = theme;
      this.storage.saveSettings(settings);
    });

    document.getElementById('btn-reset-data').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all high scores, stats, and leaderboards?')) {
        this.storage.resetAllData();
        this.renderLeaderboardTable('all');
        alert('All statistics have been reset.');
      }
    });

    // Leaderboard Tabs
    document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        this.renderLeaderboardTable(tab);
      });
    });
  }

  toggleSound() {
    this.sound.enabled = !this.sound.enabled;
    const soundBtn = document.getElementById('setting-sound-btn');
    if (soundBtn) {
      soundBtn.classList.toggle('active', this.sound.enabled);
      soundBtn.setAttribute('aria-pressed', this.sound.enabled);
      soundBtn.querySelector('.toggle-text').textContent = this.sound.enabled ? 'ON' : 'OFF';
    }

    const soundHeaderBtn = document.getElementById('btn-sound-toggle');
    if (soundHeaderBtn) {
      soundHeaderBtn.querySelector('.sound-icon').textContent = this.sound.enabled ? '🔊' : '🔇';
    }

    const settings = this.storage.getSettings();
    settings.sound = this.sound.enabled;
    this.storage.saveSettings(settings);
  }

  updateDifficultyButtons(activeDiff) {
    document.querySelectorAll('.diff-btn').forEach(btn => {
      const diff = btn.getAttribute('data-diff');
      const isActive = diff === activeDiff;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive);
    });
  }

  switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add('active');
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  showCountdown(count, onComplete) {
    const overlay = document.getElementById('countdown-overlay');
    const numDisplay = document.getElementById('countdown-number');
    overlay.classList.remove('hidden');

    let current = count;
    numDisplay.textContent = current;
    this.sound.playCountdown(false);

    const interval = setInterval(() => {
      current--;
      if (current > 0) {
        numDisplay.textContent = current;
        this.sound.playCountdown(false);
      } else if (current === 0) {
        numDisplay.textContent = 'GO!';
        this.sound.playCountdown(true);
      } else {
        clearInterval(interval);
        overlay.classList.add('hidden');
        if (onComplete) onComplete();
      }
    }, 900);
  }

  showPauseOverlay(show) {
    const overlay = document.getElementById('pause-overlay');
    if (show) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }

  updateHUD(data) {
    document.getElementById('hud-score').textContent = data.score;
    document.getElementById('hud-highscore').textContent = data.highScore;
    document.getElementById('hud-hits').textContent = data.hits;
    document.getElementById('hud-misses').textContent = data.misses;
    document.getElementById('hud-accuracy').textContent = `${data.accuracy}%`;
    document.getElementById('hud-combo').textContent = `${data.combo}x`;

    const banner = document.getElementById('combo-banner');
    const bannerText = document.getElementById('combo-text');

    if (data.combo >= 3) {
      banner.classList.remove('hidden');
      let mult = '1.2x';
      if (data.combo >= 10) mult = '2.0x';
      else if (data.combo >= 5) mult = '1.5x';

      bannerText.textContent = `COMBO ${data.combo}x! (${mult} Multiplier)`;
    } else {
      banner.classList.add('hidden');
    }
  }

  updateTimerDisplay(seconds) {
    document.getElementById('hud-timer').textContent = `${seconds.toFixed(1)}s`;
  }

  triggerScreenShake() {
    const wrapper = document.getElementById('canvas-wrapper');
    wrapper.style.transform = 'translate(6px, -6px)';
    setTimeout(() => wrapper.style.transform = 'translate(-6px, 6px)', 50);
    setTimeout(() => wrapper.style.transform = 'translate(4px, 4px)', 100);
    setTimeout(() => wrapper.style.transform = 'translate(0, 0)', 150);
  }

  showGameOverModal(data) {
    document.getElementById('go-score').textContent = data.score;
    document.getElementById('go-highscore').textContent = data.highScore;
    document.getElementById('go-accuracy').textContent = `${data.accuracy}%`;
    document.getElementById('go-hits').textContent = data.hits;
    document.getElementById('go-misses').textContent = data.misses;
    document.getElementById('go-combo').textContent = `${data.bestCombo}x`;
    document.getElementById('go-reaction').textContent = `${data.avgReaction} ms`;

    document.getElementById('gameover-player-greeting').textContent = `Great round, ${data.playerName}!`;

    const badge = document.getElementById('highscore-badge');
    if (data.isNewHighScore) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }

    this.openModal('modal-gameover');
  }

  renderLeaderboardTable(filterTab = 'all') {
    const tbody = document.getElementById('leaderboard-tbody');
    tbody.innerHTML = '';

    const list = this.storage.getLeaderboard();
    const filtered = filterTab === 'all'
      ? list
      : list.filter(item => item.difficulty.toLowerCase() === filterTab);

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">No records found yet for this category.</td></tr>`;
      return;
    }

    filtered.forEach((item, index) => {
      const rank = index + 1;
      let rankClass = '';
      if (rank === 1) rankClass = 'rank-1';
      else if (rank === 2) rankClass = 'rank-2';
      else if (rank === 3) rankClass = 'rank-3';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="rank-badge ${rankClass}">${rank}</span></td>
        <td>${this.escapeHTML(item.name)}</td>
        <td class="neon-cyan" style="font-family: var(--font-heading); font-weight:800;">${item.score}</td>
        <td><span style="font-size:0.8rem; font-weight:700;">${item.difficulty}</span></td>
        <td>${item.accuracy}</td>
        <td style="font-size:0.8rem; color:var(--text-muted);">${item.date}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

// Instantiate Game on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  window.aimMasterApp = new UIController();
});
