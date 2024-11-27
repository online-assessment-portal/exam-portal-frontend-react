import React, { PureComponent } from 'react';
class RenderVid extends PureComponent {
  render() {
    const { stream, strmColI, strmI, setMainCompState, isDup } = this.props;
    return (
      <video
        className={stream.req}
        ref={(element) => {
          if (element) element.srcObject = stream.stream;
        }}
        autoPlay
        muted
        onClick={
          isDup
            ? null
            : () =>
                setMainCompState({
                  show: 4,
                  vidIndex: strmColI,
                  streamIndex: strmI,
                })
        }
      ></video>
    );
  }
}
export default RenderVid;
