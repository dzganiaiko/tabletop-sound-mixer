import { AudioFile } from './AudioFile';
import { AudioPlayer } from './AudioPlayer';
import { AudioPlayable } from './AudioPlayable';
import { AudioPlaylist } from './AudioPlaylist';

type EnvFileVolumePerFileName = {
    [key: string]: number;
  };

interface VolumeConfiguration {
    globalVolume: number;
    musicVolume: number;
    envVolume: number;
    playbackRate: number;
    envFileVolumes: EnvFileVolumePerFileName;
}

export class AudioMixer {
    private musicAudioPlayer = new AudioPlayer();
    private envAudioPlayers: AudioPlayer[] = [];

    private nextCallbackId = 1;
    private callbacks = new Map<number, () => void>();

    private volumeCfg: VolumeConfiguration = {
        globalVolume: 1.0,
        musicVolume: 1.0,
        envVolume: 1.0,
        playbackRate: 1.0,
        envFileVolumes: {}
    };

    constructor() {
        this.subscribeForAudioPlayerChanges(this.musicAudioPlayer);
        this.loadVolumeConfiguration();
    }

    get globalVolume() { return this.volumeCfg.globalVolume; }
    get musicVolume() { return this.volumeCfg.musicVolume; }
    get envVolume() { return this.volumeCfg.envVolume; }
    get playbackRate() { return this.volumeCfg.playbackRate; }

    set globalVolume(value: number) {
        this.volumeCfg.globalVolume = value;
        this.saveVolumeConfiguration();
        this.applyVolume();
    }

    set musicVolume(value: number) {
        this.volumeCfg.musicVolume = value;
        this.saveVolumeConfiguration();
        this.applyVolume();
    }

    set envVolume(value: number) {
        this.volumeCfg.envVolume = value;
        this.saveVolumeConfiguration();
        this.applyVolume();
    }

    set playbackRate(value: number) {
        this.volumeCfg.playbackRate = value;
        this.saveVolumeConfiguration();
        this.applyVolume();
    }

    getEnvFileVolume(file: AudioFile): number {
        const v = this.volumeCfg.envFileVolumes[file.name];
        if (typeof v === 'number') {
            return v;
        } else {
            return 1.0;
        }
    }

    setEnvFileVolume(file: AudioFile, volume: number) {
        this.volumeCfg.envFileVolumes[file.name] = volume;
        this.saveVolumeConfiguration();
        this.applyVolume();
    }

    private applyVolume() {
        this.musicAudioPlayer.volume = this.volumeCfg.globalVolume * this.volumeCfg.musicVolume;
        this.musicAudioPlayer.playbackRate = this.volumeCfg.playbackRate;

        for (const player of this.envAudioPlayers) {
            const file = player.activePlayable?.getAudioFile();
            if (!file) {
                continue;
            }
            player.volume = this.volumeCfg.globalVolume * this.volumeCfg.envVolume * this.getEnvFileVolume(file);
            player.playbackRate = this.volumeCfg.playbackRate;
        }
    }

    private loadVolumeConfiguration() {
        const volumeCfgStr = localStorage.getItem('volumeCfgStr');
        if (!volumeCfgStr) {
            return;
        }

        this.volumeCfg = JSON.parse(volumeCfgStr);
    }

    private saveVolumeConfiguration() {
        const volumeCfgStr = JSON.stringify(this.volumeCfg);
        localStorage.setItem('volumeCfgStr', volumeCfgStr);
        // console.log(this.volumeCfg);
    }

    isAudioBeingPlayed(playable: AudioPlayable): boolean {
        const file = playable.getAudioFile();
        if (!file) {
            return;
        }

        const playlist = (playable as unknown as AudioPlaylist);
        if (typeof playlist.files !== 'undefined') {
            const activeMusic = this.musicAudioPlayer.activePlayable;
            if (!activeMusic) {
                return false;
            }
            const activeMusicFile = activeMusic.getAudioFile();
            if (!activeMusicFile) {
                return false;
            }
            const fileFromPlaylist = playlist.files.find(f => f.path === activeMusicFile.path);
            return typeof fileFromPlaylist !== 'undefined';
        } else {
            if (this.isAudioPlayerPlayingThisFile(this.musicAudioPlayer, file)) {
                return true;
            }

            for (const player of this.envAudioPlayers) {
                if (this.isAudioPlayerPlayingThisFile(player, file)) {
                    return true;
                }
            }
        }

        return false;
    }

    playMusic(playable: AudioPlayable) {
        this.musicAudioPlayer.volume = this.volumeCfg.globalVolume * this.volumeCfg.musicVolume;
        this.musicAudioPlayer.playbackRate = this.volumeCfg.playbackRate;
        this.musicAudioPlayer.fade(playable);

        this.callCallbacks();
    }

    stopMusic() {
        this.musicAudioPlayer.fade();

        this.callCallbacks();
    }

    playEnvironment(file: AudioFile) {
        if (this.isAudioBeingPlayed(file)) {
            // Already being played, do nothing.
            return;
        }

        const newPlayer = new AudioPlayer();
        newPlayer.volume = this.volumeCfg.globalVolume * this.volumeCfg.envVolume * this.getEnvFileVolume(file);
        newPlayer.playbackRate = this.volumeCfg.playbackRate;
        this.subscribeForAudioPlayerChanges(newPlayer);
        this.envAudioPlayers.push(newPlayer);
        newPlayer.fade(file);

        this.callCallbacks();
    }

    stopEnvironment(file: AudioFile) {
        const index = this.envAudioPlayers.findIndex(player => {
            if (this.isAudioPlayerPlayingThisFile(player, file)) {
                return true;
            }
        });

        if (index == -1) {
            // Already stopped.
            return;
        }

        const player = this.envAudioPlayers[index];
        this.envAudioPlayers.splice(index, 1);
        player.fade();

        this.callCallbacks();
    }

    subscribeForChanges(callback: () => void): number {
        const id = this.nextCallbackId;
        this.nextCallbackId += 1;
        this.callbacks.set(id, callback);
        return id;
    }

    unsubscribeFromChanges(id: number) {
        this.callbacks.delete(id);
    }

    private subscribeForAudioPlayerChanges(player: AudioPlayer) {
        player.onAudioFileCompletion = () => {
            this.callCallbacks();
        };
    }

    private callCallbacks() {
        // console.log('callCallbacks');
        this.callbacks.forEach(c => c());
    }

    private isAudioPlayerPlayingThisFile(audioPlayer: AudioPlayer, file: AudioFile) {
        const music = audioPlayer.activePlayable;
        if (music) {
            const musicFile = music.getAudioFile();
            if (musicFile && musicFile.path === file.path) {
                return true;
            }
        }

        return false;
    }
}