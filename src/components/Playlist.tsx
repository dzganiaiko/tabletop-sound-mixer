import React from 'react';
import { hot } from 'react-hot-loader';
import { AudioPlaylist } from './audio/AudioPlaylist';
import { AudioPlayable } from './audio/AudioPlayable';
import File from './File';
import { AudioMixer } from './audio/AudioMixer';
import { Loop, PlayArrow, Stop } from '@mui/icons-material';
import { PlayStopIcon } from './PlayStopIcon';
import { Stack } from '@mui/material';

type Props = {
    audioPlaylist: AudioPlaylist;
    audioMixer: AudioMixer;
};

type State = {
    showFiles: boolean;
    isPlaying: boolean;
};

class Playlist extends React.Component<Props, State> {
    private subscriptionId = 0;

    constructor(props: Props) {
        super(props);

        this.state = {
            showFiles: false,
            isPlaying: this.props.audioMixer.isAudioBeingPlayed(this.props.audioPlaylist)
        };
    }

    componentDidMount() {
        this.subscriptionId = this.props.audioMixer.subscribeForChanges(() => {
            this.setState({
                isPlaying: this.props.audioMixer.isAudioBeingPlayed(this.props.audioPlaylist)
            });
        });
    }

    componentWillUnmount() {
        this.props.audioMixer.unsubscribeFromChanges(this.subscriptionId);
    }

    render() {
        return (
            <div className='playlist' >
                <div>
                    <Stack spacing={1} direction="row" alignItems="stretch">
                        <span
                            className={ `playlistName ${this.state.isPlaying ? 'playlistPlaying' : 'playlistStopped'}` }
                            onClick={ () => { this.onClick() } }
                        >
                            <Stack spacing={0} direction="row" alignItems="center">
                            <PlayStopIcon
                                audioPlayable={ this.props.audioPlaylist }
                                audioMixer={ this.props.audioMixer }
                            />
                            { this.props.audioPlaylist.name }
                            </Stack>
                        </span>
                        &nbsp;
                        <span
                            className='playlistFilesToggle'
                            onClick={ (e) => { this.togglePlaylistFiles(e) } }
                        >
                            ...
                        </span>
                    </Stack>
                </div>

                { this.playlistFiles() }
            </div>
        );
    }

    private playlistFiles() {
        if (!this.state.showFiles) {
            return undefined;
        }

        return (
            <div className='playlistFiles' style={ { display: 'block' } }>
                { this.props.audioPlaylist.files.map((f, i) =>
                    <File
                        key={ i }
                        withVolume={ false }
                        audioFile={ f }
                        audioMixer={ this.props.audioMixer }
                        isEnvironment={ false }
                    >

                    </File>
                ) }
            </div>
        );
    }

    private onClick() {
        if (this.props.audioMixer.isAudioBeingPlayed(this.props.audioPlaylist)) {
            this.props.audioMixer.stopMusic();
        } else {
            this.props.audioPlaylist.shuffle();
            this.props.audioMixer.playMusic(this.props.audioPlaylist);
        }
    }

    private togglePlaylistFiles(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
        e.stopPropagation();

        this.setState({
            showFiles: !this.state.showFiles
        });
    }
}

export default hot(module)(Playlist);
