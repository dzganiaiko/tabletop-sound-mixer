import { AudioFile } from "./AudioFile";

export interface AudioPlayable {
    handleAudioFileCompletion(): void
    getAudioFile(): AudioFile | undefined
}