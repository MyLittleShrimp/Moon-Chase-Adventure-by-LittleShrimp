export const MUSIC = ['main-theme', 'soundtrack-1', 'soundtrack-2', 'soundtrack-3', 'soundtrack-4'];
export const SOUND_NAMES = ['box_on_target','box_push','chest_open','collision_warning','core_powerup','drone_hit','drone_hover_loop','drone_land','drone_takeoff','gift_unlock','item_gain','mechanism_click','moon_return','painting_reveal','projector_on','puzzle_success','quiz_correct','quiz_wrong','snake_beacon','soft_failure','task_start','ui_back','ui_confirm','vehicle_slide','water_drain'];

// Main theme opens each play session; subsequent rounds contain every other track once.
export class MusicQueue {
  constructor(random = Math.random) { this.random = random; this.reset(); }
  reset() { this.first = true; this.bag = []; this.last = null; }
  next() {
    if (this.first) { this.first = false; return this.last = MUSIC[0]; }
    if (!this.bag.length) {
      this.bag = MUSIC.slice(1);
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
      if (this.bag[0] === this.last) [this.bag[0], this.bag[1]] = [this.bag[1], this.bag[0]];
    }
    return this.last = this.bag.shift();
  }
}

export class GameAudio {
  constructor({music, onChange = () => {}, storage = globalThis.localStorage, contextFactory = () => new (window.AudioContext || window.webkitAudioContext)()} = {}) {
    this.music = music;
    this.storage = storage;
    this.contextFactory = contextFactory;
    this.onChange = onChange;
    this.queue = new MusicQueue();
    this.buffers = new Map();
    this.sources = new Set();
    this.lastSound = new Map();
    this.blocks = new Set(['title']);
    this.epoch = 0;
    this.failures = 0;
    this.enabled = true;
    try { this.enabled = storage.getItem('moon-chase-sound') !== 'off'; } catch {}
    music.volume = .32;
    music.addEventListener('ended', () => this.nextTrack());
    music.addEventListener('error', () => {
      // Never get stuck on a missing track or enter an infinite retry loop.
      if (++this.failures < MUSIC.length) this.nextTrack();
      else this.onChange(this.enabled, '音乐暂时无法载入，可继续游玩。');
    });
    music.addEventListener('playing', () => { this.failures = 0; });
  }
  get audible() { return this.enabled && this.blocks.size === 0; }
  unlock() {
    if (!this.enabled) return;
    try {
      this.context ??= this.contextFactory();
      this.context.resume()?.catch(() => {});
      // SFX are small; decode on demand and warm common actions after the gesture.
      for (const name of ['ui_confirm','task_start','chest_open']) this.buffer(name).catch(() => {});
    } catch { /* Browsers without Web Audio still get music and silent gameplay. */ }
  }
  start() {
    this.blocks.delete('title');
    this.blocks.delete('pause');
    this.queue.reset();
    this.failures = 0;
    this.unlock();
    this.nextTrack();
  }
  nextTrack() {
    this.music.src = `assets/audio/bgm/${this.queue.next()}.mp3`;
    this.music.load();
    this.sync();
  }
  block(reason, blocked) {
    if (this.blocks.has(reason) === blocked) return;
    if (blocked) this.blocks.add(reason); else this.blocks.delete(reason);
    this.sync();
  }
  toggle() {
    this.enabled = !this.enabled;
    try { this.storage.setItem('moon-chase-sound', this.enabled ? 'on' : 'off'); } catch {}
    if (this.enabled) this.unlock();
    this.sync();
    this.onChange(this.enabled);
  }
  sync() {
    if (!this.audible) {
      this.music.pause();
      this.stopEffects();
      return;
    }
    if (this.music.src && this.music.paused) {
      this.music.play()?.catch(error => {
        if (error.name === 'NotAllowedError') this.onChange(this.enabled, '点击声音按钮即可开启音乐。');
      });
    }
    this.ensureLoop();
  }
  async buffer(name) {
    if (!this.context || !SOUND_NAMES.includes(name)) return null;
    if (!this.buffers.has(name)) {
      const p = fetch(`assets/audio/sfx/sfx_${name}.wav`)
        .then(r => { if (!r.ok) throw new Error('Sound unavailable'); return r.arrayBuffer(); })
        .then(b => this.context.decodeAudioData(b));
      this.buffers.set(name, p);
      p.catch(() => this.buffers.delete(name));
    }
    return this.buffers.get(name);
  }
  async effect(name, volume = .64) {
    if (!this.audible || !this.context) return;
    const now = performance.now();
    if (now - (this.lastSound.get(name) ?? -Infinity) < 85) return;
    this.lastSound.set(name, now);
    const epoch = this.epoch;
    try {
      const buffer = await this.buffer(name);
      if (!buffer || !this.audible || epoch !== this.epoch) return;
      this.playBuffer(buffer, volume);
    } catch { /* A missing optional sound must never block the game. */ }
  }
  playBuffer(buffer, volume, loop = false) {
    const source = this.context.createBufferSource(), gain = this.context.createGain();
    source.buffer = buffer;
    source.loop = loop;
    gain.gain.value = volume;
    source.connect(gain); gain.connect(this.context.destination);
    this.sources.add(source);
    source.onended = () => { this.sources.delete(source); source.disconnect(); gain.disconnect(); };
    source.start();
    return source;
  }
  setLoop(name = null) {
    if (name === this.loopName) return;
    this.loopName = name;
    this.loopGeneration = (this.loopGeneration || 0) + 1;
    if (this.loopSource) { this.loopSource.stop(); this.loopSource = null; }
    this.ensureLoop();
  }
  async ensureLoop() {
    const name = this.loopName, generation = this.loopGeneration, epoch = this.epoch;
    if (!name || !this.audible || !this.context || this.loopSource) return;
    try {
      const buffer = await this.buffer(name);
      if (buffer && this.audible && name === this.loopName && generation === this.loopGeneration && epoch === this.epoch && !this.loopSource) this.loopSource = this.playBuffer(buffer, .14, true);
    } catch {}
  }
  stopEffects() {
    this.epoch++;
    for (const source of this.sources) { try { source.stop(); } catch {} }
    this.sources.clear();
    this.loopSource = null;
  }
}
