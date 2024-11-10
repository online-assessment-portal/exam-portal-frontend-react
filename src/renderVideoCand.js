import React, { PureComponent } from "react";
class RenderVid extends PureComponent {
	render() {
		const { stream } = this.props;
		return (
			<video
				ref={(element) => {
					if (element) element.srcObject = stream;
				}}
				autoPlay
				muted
			></video>
		);
	}
}
export default RenderVid;
