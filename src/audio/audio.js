import menuMusicUrl from '../assets/audio/menu_music.ogg';
import battleMusicUrl from '../assets/audio/battle_music.ogg';
import fireSoundUrl from '../assets/audio/fire.ogg';
import hitSoundUrl from '../assets/audio/hit.ogg';
import missSoundUrl from '../assets/audio/miss.ogg';

const MUSIC_VOLUME = 0.35;
const SFX_VOLUME = 0.9;

class AudioManager {
  constructor() {
    this.music = null;
    this.currentTrack = null;
    this.sfx = {};
    this.enabled = true;
    this._unlock();
  }

  _unlock() {
    const resume = () => {
      if (this.music && this.music.paused && this.enabled) {
        this.music.play().catch(() => {});
      }
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
  }

  _getMusic() {
    if (!this.music) {
      this.music = new Audio();
      this.music.loop = true;
      this.music.volume = MUSIC_VOLUME;
    }
    return this.music;
  }

  playMusic(track) {
    if (this.currentTrack === track) return;
    const music = this._getMusic();
    music.src = track === 'battle' ? battleMusicUrl : menuMusicUrl;
    this.currentTrack = track;
    if (this.enabled) music.play().catch(() => {});
  }

  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
      this.currentTrack = null;
    }
  }

  playSfx(name) {
    if (!this.enabled) return;
    const src = { fire: fireSoundUrl, hit: hitSoundUrl, miss: missSoundUrl }[name];
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = SFX_VOLUME;
    audio.play().catch(() => {});
  }
}

export const audio = new AudioManager();
