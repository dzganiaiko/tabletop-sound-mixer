import React from 'react';
import { hot } from 'react-hot-loader';

type Props = {
    onChange: (volume: number) => void;
};

class Volume extends React.Component<Props> {
    private inputRef = React.createRef<HTMLInputElement>();
    private valueTextRef = React.createRef<HTMLDivElement>();

    render() {
        return (
            <div className='volumeEditorContainer'>
                <input
                    ref={ this.inputRef }
                    className='volumeEditorRange'
                    type='range' min={ 0 } max={ 1 } step={ 0.01 }
                    onChange={ () => { this.onChange() } }
                ></input>
                <div ref={ this.valueTextRef } className='volumeEditorValue'>100%</div>
            </div>
        );
    }

    private onChange() {
        this.updateValueText();
        this.props.onChange(this.inputRef.current.valueAsNumber);
    }

    private updateValueText() {
        const volume = this.inputRef.current.valueAsNumber;
        this.valueTextRef.current.innerHTML = `${Math.round(volume * 100)}%`;
    }
}

export default hot(module)(Volume);
