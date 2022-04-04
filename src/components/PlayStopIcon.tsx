import { PlayArrow, Stop } from '@mui/icons-material';
import React from 'react';
import { hot } from 'react-hot-loader';
import { AudioMixer } from './audio/AudioMixer';
import { AudioPlayable } from './audio/AudioPlayable';

type Props = {
    audioPlayable: AudioPlayable;
    audioMixer: AudioMixer;
};

type State = {
    isPlaying: boolean;
};

export class PlayStopIcon extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isPlaying: this.props.audioMixer.isAudioBeingPlayed(this.props.audioPlayable)
        };
    }

    componentDidMount() {
        this.props.audioMixer.subscribeForChanges(() => {
            this.setState({
                isPlaying: this.props.audioMixer.isAudioBeingPlayed(this.props.audioPlayable)
            });
        });
    }

    render() {
        if (this.props.audioMixer.isAudioBeingPlayed(this.props.audioPlayable)) {
            return <Stop className='stopIcon' />;
        } else {
            return <PlayArrow />;
        }
    }
}

export default hot(module)(PlayStopIcon);
