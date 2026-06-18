import { assetUrl } from '../assetUrl';

type TrackId = 'menu' | 'combat' | 'boss';
type SfxId = 'ui_click' | 'hit' | 'vent' | 'level_up' | 'death' | 'meld' | 'relief' | 'heartbeat' | 'sink';

const TRACK_FILES: Record<TrackId, string> = {
  menu: assetUrl('assets/music/menu.ogg'),
  combat: assetUrl('assets/music/combat.ogg'),
  boss: assetUrl('assets/music/boss.ogg'),
};

const A4 = 440;

function midiToHz(midi: number): number {
  return A4 * Math.pow(2, (midi - 69) / 12);
}

class MusicEngineImpl {
  private tracks: Partial<Record<TrackId, HTMLAudioElement>> = {};
  private currentTrack: TrackId | null = null;
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicVolume = 0.38;
  private muted = false;
  private initialized = false;
  private heartbeatCd = 0;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new AudioContext();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.ctx.destination);
      this.applyVolumes();
      for (const [id, src] of Object.entries(TRACK_FILES) as [TrackId, string][]) {
        const audio = new Audio(src);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0;
        this.tracks[id] = audio;
      }
      this.initialized = true;
    } catch {
      /* audio unavailable */
    }
  }

  resume() {
    this.init();
    void this.ctx?.resume();
    for (const audio of Object.values(this.tracks)) {
      void audio?.play().catch(() => {});
    }
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
    const m = this.muted ? 0 : this.musicVolume;
    for (const audio of Object.values(this.tracks)) {
      if (!audio) continue;
      if (audio === this.tracks[this.currentTrack ?? 'menu']) {
        audio.volume = m;
      }
    }
    if (this.sfxGain) this.sfxGain.gain.value = this.muted ? 0 : 0.45;
  }

  crossfadeTo(track: TrackId | string, duration = 1.2) {
    if (typeof track === 'string' && !(track in TRACK_FILES)) {
      this.crossfadeToLegacy(track, duration);
      return;
    }
    this.init();
    if (this.currentTrack === track) return;
    const trackId = track as TrackId;
    const from = this.currentTrack ? this.tracks[this.currentTrack] : null;
    const to = this.tracks[trackId];
    if (!to) return;

    if (this.fadeTimer) clearInterval(this.fadeTimer);
    this.currentTrack = trackId;
    void to.play().catch(() => {});

    const steps = 24;
    const stepMs = (duration * 1000) / steps;
    const target = this.muted ? 0 : this.musicVolume;
    let step = 0;
    const fromStart = from?.volume ?? 0;

    this.fadeTimer = setInterval(() => {
      step += 1;
      const t = step / steps;
      if (from) from.volume = fromStart * (1 - t);
      to.volume = target * t;
      if (step >= steps) {
        if (from && from !== to) {
          from.pause();
          from.currentTime = 0;
        }
        if (this.fadeTimer) clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      }
    }, stepMs);
  }

  /** Legacy alias */
  crossfadeToLegacy(track: string, duration = 1.0) {
    if (track === 'title_theme' || track === 'zone_streets') this.crossfadeTo('menu', duration);
    else if (track === 'crisis_theme') this.crossfadeTo('boss', duration);
    else this.crossfadeTo('combat', duration);
  }

  playZoneMusic(_zoneId: string, crisis = false) {
    this.crossfadeTo(crisis ? 'boss' : 'combat');
  }

  playSting(type: 'death_sting' | 'success_sting') {
    this.playSfx(type === 'death_sting' ? 'death' : 'level_up');
  }

  updateHeartbeat(burdenRatio: number, dt: number) {
    if (burdenRatio < 0.7) return;
    this.heartbeatCd -= dt;
    if (this.heartbeatCd <= 0) {
      this.playSfx('heartbeat');
      this.heartbeatCd = burdenRatio > 0.9 ? 0.45 : 0.7;
    }
  }

  private playNote(midi: number, type: OscillatorType, start: number, dur: number, gainVal: number) {
    if (!this.ctx || !this.sfxGain || midi < 0) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = midiToHz(midi);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(gainVal, 0.0001), start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  playSfx(type: SfxId | string) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const t = this.ctx.currentTime;
    if (type === 'ui_click') this.playNote(78, 'square', t, 0.05, 0.05);
    else if (type === 'hit') {
      this.playNote(82, 'square', t, 0.04, 0.07);
      this.playNote(76, 'triangle', t + 0.03, 0.06, 0.05);
    } else if (type === 'vent') {
      this.playNote(48, 'sawtooth', t, 0.12, 0.08);
      this.playNote(36, 'sawtooth', t + 0.08, 0.2, 0.06);
    } else if (type === 'sink') {
      this.playNote(64, 'triangle', t, 0.1, 0.06);
      this.playNote(67, 'triangle', t + 0.08, 0.12, 0.05);
    } else if (type === 'heartbeat') {
      this.playNote(40, 'sine', t, 0.08, 0.12);
      this.playNote(36, 'sine', t + 0.12, 0.1, 0.08);
    } else if (type === 'meld') {
      [60, 64, 67, 72, 76].forEach((n, i) => this.playNote(n, 'triangle', t + i * 0.08, 0.2, 0.06 - i * 0.008));
    } else if (type === 'relief') {
      this.playNote(67, 'triangle', t, 0.12, 0.06);
      this.playNote(72, 'triangle', t + 0.1, 0.16, 0.05);
    } else if (type === 'level_up') {
      [60, 64, 67, 72, 76].forEach((n, i) => this.playNote(n, 'square', t + i * 0.1, 0.18, 0.07 - i * 0.01));
    } else if (type === 'death') {
      this.playNote(62, 'sawtooth', t, 0.35, 0.1);
      this.playNote(54, 'square', t + 0.25, 0.5, 0.07);
    }
  }

  destroy() {
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    for (const audio of Object.values(this.tracks)) {
      audio?.pause();
    }
    void this.ctx?.close();
    this.ctx = null;
    this.initialized = false;
  }
}

export const musicEngine = new MusicEngineImpl();

// Legacy track names used by store
export type ZoneTrackId = 'zone_home' | 'zone_streets' | 'zone_ward';
export function zoneToTrack(_zoneId: string): ZoneTrackId {
  return 'zone_home';
}
