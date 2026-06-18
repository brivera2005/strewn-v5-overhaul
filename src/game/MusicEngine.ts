type TrackId =
  | 'title_theme'
  | 'zone_home'
  | 'zone_streets'
  | 'zone_ward'
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

export type ZoneTrackId = 'zone_home' | 'zone_streets' | 'zone_ward';

const A4 = 440;

function midiToHz(midi: number): number {
  return A4 * Math.pow(2, (midi - 69) / 12);
}

/** -1 = rest */
type Step = number;

interface SongDef {
  bpm: number;
  stepsPerBar: number;
  melody: Step[];
  bass: Step[];
  harmony: Step[];
  kick: boolean[];
  hihat: boolean[];
  melodyWave: OscillatorType;
  bassWave: OscillatorType;
  harmonyWave: OscillatorType;
  melodyGain: number;
  bassGain: number;
  harmonyGain: number;
}

const SONGS: Record<Exclude<TrackId, 'death_sting' | 'success_sting' | 'ui_click' | 'assign' | 'tick' | 'level_up' | 'research_unlock' | 'relief'>, SongDef> = {
  title_theme: {
    bpm: 108,
    stepsPerBar: 16,
    melody: [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 81, 79, 76, 74],
    bass: [48, -1, 48, -1, 45, -1, 45, -1, 43, -1, 43, -1, 48, -1, 45, -1],
    harmony: [60, -1, 64, -1, 60, -1, 67, -1, 55, -1, 59, -1, 55, -1, 62, -1],
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0].map(Boolean),
    hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0].map(Boolean),
    melodyWave: 'square',
    bassWave: 'triangle',
    harmonyWave: 'triangle',
    melodyGain: 0.055,
    bassGain: 0.09,
    harmonyGain: 0.035,
  },
  zone_home: {
    bpm: 120,
    stepsPerBar: 16,
    melody: [72, -1, 74, 76, -1, 79, 76, -1, 74, 72, -1, 76, 79, 81, 79, 76],
    bass: [48, -1, -1, 48, 43, -1, -1, 43, 45, -1, -1, 45, 48, -1, 45, 43],
    harmony: [60, -1, 64, 67, 60, -1, 64, 67, 57, -1, 60, 64, 57, -1, 60, 64],
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0].map(Boolean),
    hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0].map(Boolean),
    melodyWave: 'square',
    bassWave: 'triangle',
    harmonyWave: 'triangle',
    melodyGain: 0.05,
    bassGain: 0.085,
    harmonyGain: 0.03,
  },
  zone_streets: {
    bpm: 132,
    stepsPerBar: 16,
    melody: [70, 73, 75, 73, 70, -1, 68, 70, 73, 75, 78, 75, 73, 70, 68, 66],
    bass: [46, -1, 46, 49, 44, -1, 44, 46, 42, -1, 42, 44, 46, -1, 44, 42],
    harmony: [58, -1, 61, 63, 56, -1, 58, 61, 54, -1, 56, 58, 61, -1, 58, 56],
    kick: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0].map(Boolean),
    hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(Boolean),
    melodyWave: 'square',
    bassWave: 'square',
    harmonyWave: 'sawtooth',
    melodyGain: 0.048,
    bassGain: 0.07,
    harmonyGain: 0.025,
  },
  zone_ward: {
    bpm: 96,
    stepsPerBar: 16,
    melody: [68, -1, 71, -1, 73, 71, 68, -1, 66, -1, 68, 71, 73, 75, 73, 71],
    bass: [44, -1, -1, 44, 42, -1, -1, 42, 40, -1, -1, 40, 44, -1, 42, 40],
    harmony: [56, -1, 59, -1, 61, 59, 56, -1, 54, -1, 56, 59, 61, 64, 61, 59],
    kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0].map(Boolean),
    hihat: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1].map(Boolean),
    melodyWave: 'triangle',
    bassWave: 'sine',
    harmonyWave: 'triangle',
    melodyGain: 0.042,
    bassGain: 0.08,
    harmonyGain: 0.038,
  },
  gameplay_ambient: {
    bpm: 112,
    stepsPerBar: 16,
    melody: [67, -1, 71, 74, -1, 71, 67, -1, 65, -1, 67, 71, 74, 76, 74, 71],
    bass: [43, -1, -1, 43, 41, -1, -1, 41, 40, -1, -1, 40, 43, -1, 41, 40],
    harmony: [55, -1, 59, 62, -1, 59, 55, -1, 53, -1, 55, 59, 62, 64, 62, 59],
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0].map(Boolean),
    hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0].map(Boolean),
    melodyWave: 'square',
    bassWave: 'triangle',
    harmonyWave: 'triangle',
    melodyGain: 0.045,
    bassGain: 0.075,
    harmonyGain: 0.028,
  },
  crisis_theme: {
    bpm: 148,
    stepsPerBar: 16,
    melody: [63, 66, 68, 70, 68, 66, 63, -1, 61, 63, 66, 68, 66, 63, 61, 58],
    bass: [39, 39, 41, 41, 42, 42, 44, 44, 39, 39, 41, 41, 42, 42, 39, 39],
    harmony: [51, -1, 54, -1, 56, -1, 58, -1, 49, -1, 51, -1, 54, -1, 56, -1],
    kick: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1].map(Boolean),
    hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(Boolean),
    melodyWave: 'sawtooth',
    bassWave: 'square',
    harmonyWave: 'square',
    melodyGain: 0.05,
    bassGain: 0.085,
    harmonyGain: 0.03,
  },
};

export function zoneToTrack(zoneId: string): ZoneTrackId {
  if (zoneId === 'streets') return 'zone_streets';
  if (zoneId === 'ward') return 'zone_ward';
  return 'zone_home';
}

class MusicEngineImpl {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentTrack: TrackId | null = null;
  private trackNodes: AudioNode[] = [];
  private trackInterval: ReturnType<typeof setInterval> | null = null;
  private musicVolume = 0.38;
  private muted = false;
  private initialized = false;
  private stepIndex = 0;

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
        if (node instanceof OscillatorNode) node.stop();
        node.disconnect();
      } catch {
        /* already stopped */
      }
    }
    this.trackNodes = [];
    if (this.trackInterval) {
      clearInterval(this.trackInterval);
      this.trackInterval = null;
    }
    this.stepIndex = 0;
  }

  private playNote(
    midi: number,
    type: OscillatorType,
    start: number,
    dur: number,
    gainVal: number,
    dest: GainNode,
  ) {
    if (!this.ctx || midi < 0) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = midiToHz(midi);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(gainVal, 0.0001), start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.02);
    this.trackNodes.push(osc, g);
  }

  private playKick(start: number, dest: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, start);
    osc.frequency.exponentialRampToValueAtTime(40, start + 0.08);
    g.gain.setValueAtTime(0.12, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
    osc.connect(g);
    g.connect(dest);
    osc.start(start);
    osc.stop(start + 0.14);
    this.trackNodes.push(osc, g);
  }

  private playHihat(start: number, dest: GainNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    g.gain.setValueAtTime(0.04, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.04);
    src.connect(filter);
    filter.connect(g);
    g.connect(dest);
    src.start(start);
    src.stop(start + 0.05);
    this.trackNodes.push(src, filter, g);
  }

  crossfadeTo(track: TrackId, duration = 1.0) {
    this.init();
    if (!this.ctx || !this.musicGain) return;
    if (this.currentTrack === track) return;

    this.stopTrackNodes();
    this.currentTrack = track;

    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0, now);
    this.musicGain.gain.linearRampToValueAtTime(this.muted ? 0 : this.musicVolume, now + duration);

    if (track in SONGS) {
      this.startSequencer(track as keyof typeof SONGS);
    }
  }

  playZoneMusic(zoneId: string, crisis = false) {
    if (crisis) {
      this.crossfadeTo('crisis_theme');
      return;
    }
    this.crossfadeTo(zoneToTrack(zoneId));
  }

  private startSequencer(track: keyof typeof SONGS) {
    if (!this.ctx || !this.musicGain) return;
    const song = SONGS[track];
    const dest = this.musicGain;
    const stepMs = (60_000 / song.bpm) / 4;

    const tick = () => {
      if (!this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime + 0.02;
      const i = this.stepIndex % song.stepsPerBar;
      const stepDur = stepMs / 1000 * 0.85;

      const mel = song.melody[i];
      if (mel >= 0) this.playNote(mel, song.melodyWave, t, stepDur, song.melodyGain, dest);

      const bass = song.bass[i];
      if (bass >= 0) this.playNote(bass, song.bassWave, t, stepDur * 1.4, song.bassGain, dest);

      const harm = song.harmony[i];
      if (harm >= 0) this.playNote(harm, song.harmonyWave, t, stepDur * 1.6, song.harmonyGain, dest);

      if (song.kick[i]) this.playKick(t, dest);
      if (song.hihat[i]) this.playHihat(t, dest);

      this.stepIndex += 1;
    };

    tick();
    this.trackInterval = setInterval(tick, stepMs);
  }

  playSting(type: 'death_sting' | 'success_sting') {
    this.init();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const t = this.ctx.currentTime;
    const dest = this.sfxGain;
    if (type === 'death_sting') {
      this.playNote(62, 'sawtooth', t, 0.35, 0.1, dest);
      this.playNote(58, 'sawtooth', t + 0.18, 0.45, 0.08, dest);
      this.playNote(54, 'square', t + 0.4, 0.55, 0.07, dest);
    } else {
      this.playNote(72, 'square', t, 0.12, 0.08, dest);
      this.playNote(76, 'square', t + 0.1, 0.14, 0.07, dest);
      this.playNote(79, 'square', t + 0.2, 0.18, 0.06, dest);
      this.playNote(84, 'square', t + 0.32, 0.25, 0.05, dest);
    }
  }

  playSfx(type: 'ui_click' | 'assign' | 'tick' | 'level_up' | 'research_unlock' | 'relief' | 'hit' | 'overflow' | 'meld') {
    this.init();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const t = this.ctx.currentTime;
    const dest = this.sfxGain;
    if (type === 'ui_click') this.playNote(78, 'square', t, 0.05, 0.05, dest);
    else if (type === 'hit') {
      this.playNote(82, 'square', t, 0.04, 0.06, dest);
      this.playNote(76, 'triangle', t + 0.03, 0.06, 0.04, dest);
    } else if (type === 'overflow') {
      this.playNote(48, 'sawtooth', t, 0.15, 0.07, dest);
      this.playNote(44, 'sawtooth', t + 0.08, 0.2, 0.06, dest);
    } else if (type === 'meld') {
      [60, 64, 67, 72, 76, 79].forEach((n, i) => this.playNote(n, 'triangle', t + i * 0.08, 0.2, 0.06 - i * 0.008, dest));
    } else if (type === 'assign') {
      this.playNote(72, 'square', t, 0.07, 0.06, dest);
      this.playNote(76, 'square', t + 0.06, 0.09, 0.05, dest);
      this.playNote(79, 'square', t + 0.12, 0.11, 0.04, dest);
    } else if (type === 'relief') {
      this.playNote(67, 'triangle', t, 0.12, 0.06, dest);
      this.playNote(72, 'triangle', t + 0.1, 0.16, 0.05, dest);
      this.playNote(76, 'triangle', t + 0.2, 0.2, 0.04, dest);
    } else if (type === 'level_up') {
      [60, 64, 67, 72, 76].forEach((n, i) => this.playNote(n, 'square', t + i * 0.1, 0.18, 0.07 - i * 0.01, dest));
    } else if (type === 'research_unlock') {
      this.playNote(64, 'triangle', t, 0.18, 0.05, dest);
      this.playNote(67, 'triangle', t + 0.12, 0.22, 0.05, dest);
      this.playNote(72, 'triangle', t + 0.24, 0.28, 0.04, dest);
    } else this.playNote(69, 'square', t, 0.04, 0.025, dest);
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
