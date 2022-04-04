// import { ipcRenderer } from "electron";
import React from 'react';
import { hot } from 'react-hot-loader';
import './Application.less';
import { AudioLibrary } from './audio/AudioLibrary';
import Library from './Library';
import { AudioMixer } from './audio/AudioMixer';
import { Button, createTheme, IconButton, Slider, Stack, TextField, ThemeProvider, Typography } from '@mui/material';
import { Folder } from '@mui/icons-material';
// import { electron } from 'webpack';

type Props = {
    title: string;
    version: string;
};

type State = {
    library?: AudioLibrary;
};

class Application extends React.Component<Props, State> {
    private audioMixer = new AudioMixer();

    private theme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    constructor(props: Props) {
        super(props);

        this.state = {};
    }

    componentDidMount(): void {
        const dir = this.getSavedLibraryDirectory();
        if (dir) {
            this.loadLibraryFromPath(dir);
        }
    }

    private extractVolume(v: number | number[]): number {
        if (typeof v === 'number') {
            return v;
        } else {
            return v.at(0) || 1.0;
        }
    }

    private loadLibraryFromPath(dir: string) {
        const lib = new AudioLibrary();
        try {
            lib.reload(dir);
            this.setState({ library: lib });
            console.log('Library', lib);
        } catch (error) {
            localStorage.setItem('directory', '');
            alert(`Cannot load library from ${dir}: ${error}`);
        }
    }

    private getSavedLibraryDirectory(): string | undefined {
        return localStorage.getItem('directory') || undefined;
    }

    private setSavedLibraryDirectory(dir: string) {
        localStorage.setItem('directory', dir);
    }

    private async openDirectoryDialogToLoadLibrary() {
        try {
            const dir = await window.dialog.openDirectoryDialog(this.getSavedLibraryDirectory());
            if (dir) {
                this.setSavedLibraryDirectory(dir);
                this.loadLibraryFromPath(dir);
            }
        } catch (error) {
            alert(`${error}`);
        }
    }

    private libraryLoader() {
        return (
            <div>
                <IconButton
                    onClick={ () => { this.openDirectoryDialogToLoadLibrary() } }
                >
                    <Folder />
                    <Typography>Load Library</Typography>
                </IconButton>

                <hr></hr>


<pre>
{`The library folder is expected to have the following structure:

Library Folder/
    Music/
        Mood - Creepy/
            Creepy music 1.mp3
            Creepy music 2.mp3
            Creepy music 3.mp3
        Mood - Tavern/
            Song 1.mp3
            Song 2.mp3
    Environment/
        Fireplace.mp3
        Forest Night.m4a
        Forest Day.mp3
`}
</pre>
            </div>
        );
    }

    private volumeControl() {
        return (
            <div style={{ fontSize: '0.8em' }}>
                <Stack spacing={ 0 } direction="column" alignItems="baseline">
                    <Stack spacing={2} direction="row" sx={{ width: '200px' }} alignItems="center">
                        <span>Global</span>
                        <Slider
                            aria-label="Volume"
                            size="small"
                            min={0} max={1} step={0.01}
                            defaultValue={ this.audioMixer.globalVolume }
                            onChange={ (e, v) => { this.audioMixer.globalVolume = this.extractVolume(v) } }
                        />
                    </Stack>
                    <Stack spacing={2} direction="row" sx={{ width: '200px' }} alignItems="center">
                        <span>Music</span>
                        <Slider
                            aria-label="Volume"
                            size="small"
                            min={0} max={1} step={0.01}
                            defaultValue={ this.audioMixer.musicVolume }
                            onChange={ (e, v) => { this.audioMixer.musicVolume = this.extractVolume(v) } }
                        />
                    </Stack>
                    <Stack spacing={2} direction="row" sx={{ width: '200px' }} alignItems="center">
                        <span>Environment</span>
                        <Slider
                            aria-label="Volume"
                            size="small"
                            min={0} max={1} step={0.01}
                            defaultValue={ this.audioMixer.envVolume }
                            onChange={ (e, v) => { this.audioMixer.envVolume = this.extractVolume(v) } }
                        />
                    </Stack>
                </Stack>
            </div>
        );
    }

    render() {
        if (this.state.library) {
            return (
                <ThemeProvider theme={ this.theme }>
                    { this.volumeControl() }

                    <Library
                        audioMixer={ this.audioMixer }
                        audioLibrary={ this.state.library }
                    />

                    <details>
                        <summary>Library loader</summary>
                        <div>
                            { this.libraryLoader() }
                        </div>
                    </details>
                </ThemeProvider>
            );
        } else {
            return (
                <ThemeProvider theme={ this.theme }>
                    { this.libraryLoader() }
                </ThemeProvider>
            );
        }
    }
}

export default hot(module)(Application);
