import { AudioPlayable } from "./AudioPlayable";

export class AudioFile implements AudioPlayable {
    private _path: string;
    get path() { return this._path; }

    private _name: string;
    get name() { return this._name; }

    constructor(path: string) {
        this._path = path;
        this._name = window.path.basename(path);

        const dot = this._name.lastIndexOf('.')
        if (dot) {
            this._name = this._name.substring(0, dot);
        }
    }

    handleAudioFileCompletion() {
        // Do nothing.
    }

    getAudioFile(): AudioFile {
        return this;
    }
}