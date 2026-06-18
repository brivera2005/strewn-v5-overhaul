type TrackId =
  | 'title_theme'
  | 'gameplay_ambient'
  | 'crisis_theme'
  | 'death_sting'
  | 'success_sting'
  | 'ui_click'
  | 'assign'
  | 'tick'
  | 'level_up'
  | 'research_unlock'
  | 'relief';

class MusicEngineImpl {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentTrack: TrackId | null = null;
  private trackNodes: OscillatorNode[] = [];
  private trackIntervals: ReturnType<typeof setInterval>[] = [];
  private musicVolume = 0.35;
  private muted = false;
  private initialized = false;

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.applyVolumes();
      this.initialized = true;
    } catch {
      /* audio unavailable */
    }
  }

  resume() {
    this.init();
    void this.ctx?.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyVolumes();
  }

  setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    this.applyVolumes();
  }

  private applyVolumes() {
    if (!this.musicGain || !this.sfxGain) return;
    const m = this.muted ? 0 : this.musicVolume;
    this.musicGain.gain.value = m;
    this.sfxGain.gain.value = this.muted ? 0 : 0.5;
  }

  private stopTrackNodes() {
    for (const node of this.trackNodes) {
      try {
        node.stop();
        node.disconnect();
      } catch {
        /* already stopped */
      }
    }
    this.trackNodes = [];
    for (const id of this.trackIntervals) clearInterval(id);
    this.trackIntervals = [];
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    start: number,
    dur: number,
    gainVal: number,
    dest: GainNode,
  ) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gainVal, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.05);
    this.trackNodes.push(osc);
  }

  crossfadeTo(track: TrackId, duration = 1.2) {
    this.init();
    if (!this.ctx || !this.musicGain) return;
    if (this.currentTrack === track) return;

    const prevGain = this.musicGain.gain.value;
    this.stopTrackNodes();
    this.currentTrack = track;

    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0, now);
    this.musicGain.gain.linearRampToValueAtTime(this.muted ? 0 : this.musicVolume, now + duration);

    if (track === 'title_theme') this.startTitleTheme();
    else if (track === 'gameplay_ambient') this.startGameplayAmbient();
    else if (track === 'crisis_theme') this.startCrisisTheme();

    void prevGain;
  }

  private startTitleTheme() {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const dest = this.musicGain;
    const bassNotes = [65.41, 73.42, 82.41, 87.31];
    const arpNotes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63];
    let step = 0;

    const bass = ctx.createOscillator();
    const bassG = ctx.createGain();
    bass.type = 'square';
    bass.frequency.value = bassNotes[0];
    bassG.gain.value = 0.08;
    bass.connect(bassG);
    bassG.connect(dest);
    bass.start();
    this.trackNodes.push(bass);

    const interval = setInterval(() => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      bass.frequency.setValueAtTime(bassNotes[Math.floor(step / 8) % bassNotes.length], t);
      this.playTone(arpNotes[step % arpNotes.length], 'triangle', t, 0.15, 0.06, dest);
      if (step % 4 === 0) {
        this.playTone(100, 'square', t, 0.05, 0.04, dest);
        this.playTone(200, 'square', t + 0.1, 0.05, 0.03, dest);
      }
      step += 1;
    }, 180);
    this.trackIntervals.push(interval);
  }

  private startGameplayAmbient() {
    if (!this.ctx || !this.musicGain) return;
    const dest = this.musicGain;
    const padFreqs = [110, 164.81, 220];
    for (const f of padFreqs) {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.value = 0.04;
      osc.connect(g);
      g.connect(dest);
      osc.start();
      this.trackNodes.push(osc);
    }
    let step = 0;
    const interval = setInterval(() => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      if (step % 8 === 0) {
        this.playTone(55 + Math.random() * 20, 'sine', t, 2, 0.03, dest);
      }
      step += 1;
    }, 600);
    this.trackIntervals.push(interval);
  }

  private startCrisisTheme() {
    if (!this.ctx || !this.musicGain) return;
    const dest = this.musicGain;
    let step = 0;
    const interval = setInterval(() => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.playTone(130 + (step % 3) * 10, 'sawtooth', t, 0.3, 0.05, dest);
      if (step % 2 === 0) this.playTone(80, 'square', t, 0.1, 0.04, dest);
      step += 1;
    }, 250);
    this.trackIntervals.push(interval);
  }

  playSting(type: 'death_sting' | 'success_sting') {
    this.init();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const t = this.ctx.currentTime;
    const dest = this.sfxGain;
    if (type === 'death_sting') {
      this.playTone(220, 'sawtooth', t, 0.4, 0.12, dest);
      this.playTone(185, 'sawtooth', t + 0.15, 0.5, 0.1, dest);
      this.playTone(147, 'sawtooth', t + 0.35, 0.6, 0.08, dest);
    } else {
      this.playTone(392, 'triangle', t, 0.2, 0.1, dest);
      this.playTone(523.25, 'triangle', t + 0.15, 0.3, 0.08, dest);
      this.playTone(659.25, 'triangle', t + 0.3, 0.4, 0.06, dest);
    }
  }

  playSfx(type: 'ui_click' | 'assign' | 'tick' | 'level_up' | 'research_unlock' | 'relief') {
    this.init();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const t = this.ctx.currentTime;
    const dest = this.sfxGain;
    if (type === 'ui_click') this.playTone(880, 'square', t, 0.06, 0.04, dest);
    else if (type === 'assign') {
      this.playTone(660, 'triangle', t, 0.08, 0.06, dest);
      this.playTone(880, 'triangle', t + 0.05, 0.1, 0.05, dest);
      this.playTone(1108, 'triangle', t + 0.1, 0.12, 0.04, dest);
    } else if (type === 'relief') {
      this.playTone(523.25, 'sine', t, 0.15, 0.06, dest);
      this.playTone(659.25, 'sine', t + 0.08, 0.2, 0.05, dest);
      this.playTone(783.99, 'sine', t + 0.16, 0.25, 0.04, dest);
    } else if (type === 'level_up') {
      this.playTone(392, 'triangle', t, 0.15, 0.08, dest);
      this.playTone(523.25, 'triangle', t + 0.12, 0.2, 0.07, dest);
      this.playTone(659.25, 'triangle', t + 0.24, 0.25, 0.06, dest);
      this.playTone(783.99, 'triangle', t + 0.36, 0.35, 0.05, dest);
      this.playTone(1046.5, 'triangle', t + 0.5, 0.4, 0.04, dest);
    } else if (type === 'research_unlock') {
      this.playTone(440, 'sine', t, 0.2, 0.05, dest);
      this.playTone(554.37, 'sine', t + 0.1, 0.25, 0.05, dest);
      this.playTone(659.25, 'sine', t + 0.2, 0.3, 0.04, dest);
    } else this.playTone(440, 'sine', t, 0.04, 0.02, dest);
  }

  destroy() {
    this.stopTrackNodes();
    void this.ctx?.close();
    this.ctx = null;
    this.initialized = false;
    this.currentTrack = null;
  }
}

export const musicEngine = new MusicEngineImpl();
