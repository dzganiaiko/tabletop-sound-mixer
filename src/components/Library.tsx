import React from 'react';
import { hot } from 'react-hot-loader';
import { AudioLibrary } from './audio/AudioLibrary';
import { AudioMixer } from './audio/AudioMixer';
import { AudioPlayable } from './audio/AudioPlayable';
import File from './File';
import Playlist from './Playlist';

type Props = {
    audioLibrary: AudioLibrary;
    audioMixer: AudioMixer;
};

class Library extends React.Component<Props> {
    render() {
        return (
            <div className='library'>
                <table className='libraryTable'>
                    <tbody>
                        <tr>
                            <td>
                                { this.props.audioLibrary.musicPlaylists.map((p, i) =>
                                    <Playlist
                                        key={ i }
                                        audioPlaylist={ p }
                                        audioMixer={ this.props.audioMixer }
                                    >
                                    </Playlist>
                                ) }
                            </td>
                            <td>
                                <div className='envHeader'>Environment</div>
                                {
                                    this.props.audioLibrary.environmentFiles.map((f, i) =>
                                    <File
                                        key={ i }
                                        withVolume={ true }
                                        audioFile={ f }
                                        audioMixer={ this.props.audioMixer }
                                        isEnvironment={ true }
                                    />
                                    )
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }


}

export default hot(module)(Library);
