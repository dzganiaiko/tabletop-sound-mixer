import { AudioFile } from "./AudioFile";
import { AudioPlaylist } from "./AudioPlaylist";

export class AudioLibrary {
    private _musicPlaylists: AudioPlaylist[];
    get musicPlaylists() { return this._musicPlaylists; }

    private _environmentFiles: AudioFile[];
    get environmentFiles() { return this._environmentFiles; }

    reload(directory: string) {
        this._musicPlaylists = [];

        const musicDir = window.path.join(directory, 'Music');
        const playlistsDirNames = window.fs.readdirSync(musicDir);
        playlistsDirNames.forEach(playlistDirName => {
            if (playlistDirName.startsWith('.') || playlistDirName.startsWith('_')) {
                return;
            }

            const playlistDir = window.path.join(musicDir, playlistDirName);
            const audioFiles = this.loadAudioFilesFromDirectory(playlistDir);
            const playlist = new AudioPlaylist(playlistDirName, audioFiles);
            this._musicPlaylists.push(playlist);
        });

        const envDir = window.path.join(directory, 'Environment');
        this._environmentFiles = this.loadAudioFilesFromDirectory(envDir);
    }

    private loadAudioFilesFromDirectory(dir: string): AudioFile[] {
        const audioFileNames = window.fs.readdirSync(dir)
        const audioFiles: AudioFile[] = [];
        audioFileNames.forEach(audioFileName => {
            if (audioFileName.startsWith('.') || audioFileName.startsWith('_')) {
                return;
            }

            const audioFilePath = window.path.join(dir, audioFileName);
            const audioFile = new AudioFile(audioFilePath);
            audioFiles.push(audioFile);
        });

        return audioFiles;
    }
}