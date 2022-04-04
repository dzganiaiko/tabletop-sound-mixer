import { Slider, Stack } from '@mui/material';
import React from 'react';
import { hot } from 'react-hot-loader';
import { AudioFile } from './audio/AudioFile';
import { AudioMixer } from './audio/AudioMixer';
import PlayStopIcon from './PlayStopIcon';

type Props = {
    audioFile: AudioFile;
    withVolume: boolean;
    audioMixer: AudioMixer;
    isEnvironment: boolean;
};

type State = {
    isPlaying: boolean;
    volume: number;
};

class File extends React.Component<Props, State> {
    private subscriptionId = 0;

    constructor(props: Props) {
        super(props);

        this.state = {
            isPlaying: this.props.audioMixer.isAudioBeingPlayed(this.props.audioFile),
            volume: this.props.audioMixer.getEnvFileVolume(this.props.audioFile)
        };
    }

    componentDidMount() {
        this.subscriptionId = this.props.audioMixer.subscribeForChanges(() => {
            this.setState({
                isPlaying: this.props.audioMixer.isAudioBeingPlayed(this.props.audioFile)
            });
        });
    }

    componentWillUnmount() {
        this.props.audioMixer.unsubscribeFromChanges(this.subscriptionId);
    }

    render() {
        return (
            <div className={ `file ${this.state.isPlaying ? 'filePlaying' : 'fileStopped' }` }>
                <Stack spacing={1} direction="row" alignItems="stretch">
                    <span
                        className='fileName'
                        onClick={ () => { this.onClick() } }
                    >
                        <Stack spacing={0} direction="row" alignItems="center">
                            <PlayStopIcon
                                audioPlayable={ this.props.audioFile }
                                audioMixer={ this.props.audioMixer }
                            ></PlayStopIcon>
                            { this.props.audioFile.name }
                        </Stack>
                    </span>

                    <span className='volumeSlider'>
                    {
                        this.props.withVolume
                        ? (
                        <Slider
                            aria-label="Volume"
                            size="small"
                            min={0} max={1} step={0.01}
                            value={ this.state.volume }
                            onChange={ (e, v) => { this.onVolumeChange(e, v) } }
                        />
                        ) : null
                    }
                    </span>
                </Stack>
            </div>
        );
    }

    private onClick() {
        if (this.props.audioMixer.isAudioBeingPlayed(this.props.audioFile)) {
            if (this.props.isEnvironment) {
                this.props.audioMixer.stopEnvironment(this.props.audioFile);
            } else {
                this.props.audioMixer.stopMusic();
            }
        } else {
            if (this.props.isEnvironment) {
                this.props.audioMixer.playEnvironment(this.props.audioFile);
            } else {
                this.props.audioMixer.playMusic(this.props.audioFile);
            }
        }
    }

    private onVolumeChange(event: Event, value: number | number[]) {
        var volume: number;
        if (typeof value === 'number') {
            volume = value;
        } else {
            volume = value[0];
        }
        this.setState({
            isPlaying: this.state.isPlaying,
            volume: volume
        });

        // console.log('onVolumeChange', volume);
        this.props.audioMixer.setEnvFileVolume(this.props.audioFile, volume);
    }
}

export default hot(module)(File);
