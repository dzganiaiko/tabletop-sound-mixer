import { AudioFile } from "./AudioFile";
import { AudioPlayable } from "./AudioPlayable";

export class AudioPlaylist implements AudioPlayable {
    private _files: AudioFile[]
    get files() { return this._files; }

    private shuffledFiles: AudioFile[]
    private currentShuffedFileIndex: number

    private _name: string;
    get name() { return this._name; }

    constructor(name: string, files: AudioFile[]) {
        this._name = name;
        this._files = files;

        this.shuffledFiles = [];
        this.currentShuffedFileIndex = 0;

        this.shuffle();
    }

    setFiles(newFiles: AudioFile[]) {
        this._files = newFiles;
        this.shuffle();
    }

    handleAudioFileCompletion() {
        if (this.shuffledFiles.length == 0) {
            return;
        }

        this.currentShuffedFileIndex++;
        console.log(this, `currentShuffedFileIndex=${this.currentShuffedFileIndex}`);

        if (this.currentShuffedFileIndex >= this.shuffledFiles.length) {
            this.shuffle();
        }
    }

    getAudioFile(): AudioFile | undefined {
        if (this.currentShuffedFileIndex < this.shuffledFiles.length) {
            return this.shuffledFiles[this.currentShuffedFileIndex];
        } else {
            return undefined;
        }
    }

    shuffle() {
        var newShuffled: AudioFile[] = []

        var readyToAdd: AudioFile[] = []
        this._files.forEach(f => readyToAdd.push(f));

        while (readyToAdd.length > 0) {
            const randomOffset = this.randomNumber(0, this._files.length);
            const index = (this.randomNumber(0, readyToAdd.length - 1) + randomOffset) % readyToAdd.length;

            const file = readyToAdd[index];
            newShuffled.push(file!);
            readyToAdd.splice(index, 1);
        }

        this.shuffledFiles = newShuffled;
        this.currentShuffedFileIndex = 0;

        console.log('It got shuffled', this, this.shuffledFiles);
    }

    private randomNumber(from: number, to: number): number {
        return from + Math.round(Math.random() * to);
    }
}