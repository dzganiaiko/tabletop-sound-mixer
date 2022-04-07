import { AudioPlayable } from "./AudioPlayable";

const defaultFadeDuration = 4.0;

export class AudioPlayer {
    private audio: HTMLAudioElement;
    private activeTimer?: NodeJS.Timeout;
    private _activePlayableEntity?: AudioPlayable;
    private _volume = 1.0;

    onAudioFileCompletion?: () => void;

    constructor() {
        this.recreateAudio();
    }

    get activePlayable(): AudioPlayable | undefined { return this._activePlayableEntity; }

    private recreateAudio() {
        this.audio = new Audio();
        this.audio.loop = false;

        this.audio.addEventListener('canplay', () => {
            console.log('canplay');
        });
        this.audio.addEventListener('loadstart', () => {
            console.log('loadstart');
        });
        this.audio.addEventListener('loadeddata', () => {
            console.log('loadeddata');
        });

        this.audio.addEventListener('ended', () => {
            console.log('ended');
            this.handleAudioFileCompletion();
        });
        this.audio.addEventListener('error', (error) => {
            console.error('error', error);

            setTimeout(() => {
                this.handleAudioFileCompletion();
            }, 3000);
        });
    }

    private handleAudioFileCompletion() {
        if (this._activePlayableEntity) {
            this._activePlayableEntity.handleAudioFileCompletion();

            this.playFileFromEntity(this._activePlayableEntity);

            if (this.onAudioFileCompletion) {
                this.onAudioFileCompletion();
            }
        }
    }

    get volume(): number {
        return this._volume;
    }

    set volume(value: number) {
        // console.log('set volume', value);
        this._volume = value;

        if (!this.activeTimer) {
            this.audio.volume = this._volume;
        }
    }

    private play(entity: AudioPlayable) {
        this.cancelActiveTimer();
        this.audio.pause();

        this._activePlayableEntity = entity;
        this.playFileFromEntity(entity);
    }

    private fadeIn(duration: number = defaultFadeDuration, completion?: () => void) {
        // console.log('fadeIn', duration);
        this.fadeVolume(this._volume, duration, completion);
    }

    private fadeOut(duration: number = defaultFadeDuration, completion?: () => void) {
        // console.log('fadeOut', duration);
        this.fadeVolume(0, duration, completion);
    }

    fade(newEntity?: AudioPlayable, duration: number = defaultFadeDuration, completion?: () => void) {
        this.cancelActiveTimer();

        this._activePlayableEntity = newEntity;

        const doAfterFadeOut = () => {
            this.audio.pause();
            this.audio.volume = 0.0;

            if (!newEntity) {
                if (completion) {
                    completion();
                }
                return;
            }

            this.playFileFromEntity(newEntity);
            this.audio.volume = 0.0;

            this.fadeIn(duration / 2.0, () => {
                this.audio.volume = this._volume;

                if (completion) {
                    completion();
                }
            });
        };

        if (this.audio.paused) {
            doAfterFadeOut();
        } else {
            this.fadeOut(duration / 2.0, doAfterFadeOut);
        }
    }

    private cancelActiveTimer() {
        if (this.activeTimer) {
            clearInterval(this.activeTimer);
            this.activeTimer = undefined;
        }
    }

    private playFileFromEntity(entity: AudioPlayable) {
        const audioFile = entity.getAudioFile()
        if (audioFile) {
            console.log('Going to play', audioFile);
            this.recreateAudio();
            this.audio.src = 'myfile://' + encodeURI(audioFile.path);
            this.audio.volume = this.volume;
            this.audio.load();
            this.audio.play();
        } else {
            console.log('Nothing to play from', entity);
        }
    }

    private fadeVolume(targetVolume: number, duration: number, completion?: () => void) {
        // console.log(`fadeVolume target=${targetVolume} duration=${duration}`);

        if (duration <= 0) {
            this.audio.volume = targetVolume;
            if (completion) {
                completion();
            }
            return;
        }

        const ticksPerSecond = 30;
        const volumeDelta = targetVolume - this.audio.volume;
        const isIncreasingVolume = (volumeDelta > 0.0);
        const volumeDeltaPerSecond = volumeDelta / duration;

        const timer = setInterval(() => {
            const volumeDeltaPerTick = volumeDeltaPerSecond / ticksPerSecond;
            const newVolume = this.audio.volume + volumeDeltaPerTick;

            var isReachedTargetVolume = Math.abs(this.audio.volume - targetVolume) < 0.01;
            if (!isReachedTargetVolume) {
                if (isIncreasingVolume) {
                    isReachedTargetVolume = (newVolume >= targetVolume);
                } else {
                    isReachedTargetVolume = (newVolume <= targetVolume);
                }
            }

            // console.log(`target=${targetVolume} new=${newVolume}`);

            if (isReachedTargetVolume) {
                this.cancelActiveTimer();
                this.audio.volume = targetVolume;

                if (completion) {
                    completion();
                }
            } else {
                this.audio.volume = newVolume;
            }
        }, 1000.0 / ticksPerSecond);

        this.activeTimer = timer;
    }
}
