import React, { Component } from "react";
import spinner from "./../spinner.svg";
import { notify } from "./../common.js";
class AdminModal extends Component {
	constructor(props) {
		super();
		this.state = {
			constrFor: 1,
			constr: props.constr
		};
		this.from = React.createRef();
		this.to = React.createRef();
		//
		this.broadcastMsg = React.createRef();
	}
	addToListHandler = (event) => {
		event.preventDefault();
		const { addToMyList, otherCand, msgHolder } = this.props;
		if (otherCand.length === 0) {
			notify(
				msgHolder,
				"e",
				"No more Candidates outside your proctoring List to Add"
			);
			return false;
		}
		const from = parseInt(this.from.current.value);
		const to = parseInt(this.to.current.value);
		if (isNaN(from) && isNaN(to)) {
			addToMyList(0, otherCand.length);
		} else if (
			isNaN(from) ||
			isNaN(to) ||
			!(from > 0 && to > 0) ||
			from > to ||
			to > otherCand.length
		) {
			notify(msgHolder, "e", "Invalid Inputs", 10000);
			return false;
		} else {
			addToMyList(from - 1, to);
		}
	};
	closeModal = () => {
		const { stream, setMainCompState } = this.props;
		if (stream) setMainCompState({ show: 0 });
		else setMainCompState({ show: 0, vidIndex: -1, streamIndex: -1 });
	};
	broadcastHandler = (event) => {
		event.preventDefault();
		const { socket, passcode, msgHolder } = this.props;
		const data = { passcode: passcode, msg: this.broadcastMsg.current.value };
		socket.emit("broadcastTest", data);
		event.target.reset();
		notify(msgHolder, "s", "Message sent to All Candidates.", 10000);
	};
	setVidConst = (event) => {
		event.preventDefault();
		const { constrFor, constr } = this.state;
		const w = constr[constrFor].width;
		const h = constr[constrFor].height;
		const aspRatio = (w / h).toFixed(3);
		const { msgHolder } = this.props;
		if (aspRatio > 2 || aspRatio < 1) {
			notify(msgHolder, "e", "Invalid Aspect Ratio<br>Refer below Guidelines");
			return false;
		} else notify(msgHolder, "s", "Stream Altered...Success");
		const sendData = {
			type: "chngConstr",
			setFor: constrFor,
			...constr[constrFor],
		};
		this.props.dataConn.forEach((each) => {
			each.send(sendData);
		});
	};
	constrChgHandler = (chngFor, event) => {
		let value = parseInt(event.target.value);
		if (!value) value = "";
		this.setState((prevState) => {
			prevState.constr[prevState.constrFor][chngFor] = value;
			return prevState;
		});
	};
	render() {
		const { show } = this.props;
		if (show === -1)
			return (
				<div id="responseWin">
					<div id="responseDiv">
						<h1>Please Wait</h1>
						<h3>till we gather all the Required Information.</h3>
						<br></br>
						<img
							style={{ maxHeight: "5vw", maxWidth: "5vw" }}
							src={spinner}
							alt="Wait Wait Wait"
						></img>
					</div>
				</div>
			);
		else if (show === 1) {
			const {
				testInfo,
				myList,
				otherCand,
				addOneToMyList,
				rmvOneFrmMyList,
				msgHolder,
				fetchStream,
				endTest,
				setMainCompState,
			} = this.props;
			const isVideo = testInfo.cam || testInfo.mic || testInfo.win;
			return (
				<div id="responseWin">
					<i
						className="fa fa-times"
						aria-hidden="true"
						onClick={this.closeModal}
					></i>
					<div className="adminView" id="responseDiv">
						<div>
							<form method="post" onSubmit={this.addToListHandler}>
								<p>Add to my Proctoring List</p>
								<div>
									<label htmlFor="frm">From SlNo.</label>
									<input type="number" ref={this.from}></input>
								</div>
								<div>
									<label htmlFor="to">To SlNo.</label>
									<input type="number" ref={this.to}></input>
								</div>
								<pre>Leave blank to add All</pre>
								<button className="btnPrimary" type="submit">
									Req Server
								</button>
							</form>
							<pre>
								<p>FSV : Full-Screen Violation</p>
								<p>WV : Window Violation</p>
								<p>RSZv : Resize Violation</p>
								<p>rmv : remove cand. from your List</p>
								<p>tT : Test Tampering</p>
							</pre>
						</div>
						<h3>Me Proctoring</h3>
						<pre>- Pure Live Stats</pre>
						{myList.length ? (
							<table>
								<thead>
									<tr>
										<th>SlNo</th>
										<th>Name</th>
										<th>Email</th>
										<th>Entry</th>
										{testInfo.reqFScr ? <th>FSV</th> : null}
										<th>WV</th>
										<th>RSZv</th>
										{testInfo.cam ? <th>cam</th> : null}
										{testInfo.mic ? <th>mic</th> : null}
										{testInfo.win ? <th>scrn</th> : null}
										<th>tT</th>
										<th>Chat</th>
										<th>End-Test</th>
										<th>Status</th>
										{isVideo ? <th>refresh</th> : null}
										<th>rmv</th>
									</tr>
								</thead>
								<tbody>
									{myList.map((each, index) => {
										return (
											<tr key={index}>
												<td>{index + 1}.</td>
												<td>{each.name}</td>
												<td>{each.email}</td>
												<td>{each.entryCtr}</td>
												{testInfo.reqFScr ? <td>{each.vData.fsv}</td> : null}
												<td>{each.vData.wfo}</td>
												<td>{each.vData.rsz}</td>
												{testInfo.cam ? (
													<td>
														<span
															className={each.cam ? "showGreen" : "showRed"}
														>
															&#9679;
														</span>
													</td>
												) : null}
												{testInfo.mic ? (
													<td>
														<span
															className={each.mic ? "showGreen" : "showRed"}
														>
															&#9679;
														</span>
													</td>
												) : null}
												{testInfo.win ? (
													<td>
														<span
															className={each.scrn ? "showGreen" : "showRed"}
														>
															&#9679;
														</span>
													</td>
												) : null}
												<td>{each.vData.devT}</td>
												<td>
													<i
														className="fa fa-comments-o"
														aria-hidden="true"
														onClick={() => {
															setMainCompState({
																show: 2,
																chatWith: each.email,
															});
														}}
													></i>
												</td>
												<td>
													{each.socketId ? (
														each.socketId === "ae" ? (
															"you Ended"
														) : (
															<i
																className="fa fa-ban"
																aria-hidden="true"
																onClick={() => endTest(index)}
															></i>
														)
													) : (
														"-"
													)}
												</td>
												<td>
													<span className="showGreen">&#9679;</span>
												</td>
												{isVideo ? (
													<td>
														<i
															className="fa fa-refresh"
															aria-hidden="true"
															onClick={() => {
																notify(msgHolder, "s", "Initiated");
																fetchStream(index, true);
															}}
														></i>
													</td>
												) : null}
												<td>
													<i
														className="fa fa-trash"
														aria-hidden="true"
														onClick={() => rmvOneFrmMyList(index)}
													></i>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						) : (
							<p>No Candidates are added in your Proctoring List</p>
						)}
						<h3>Other Candidates</h3>
						<pre>- not Pure Live Stats</pre>
						{otherCand.length ? (
							<table>
								<thead>
									<tr>
										<th>SlNo</th>
										<th>Email</th>
										<th>Entry</th>
										{testInfo.cam ? <th>cam</th> : null}
										{testInfo.mic ? <th>mic</th> : null}
										{testInfo.win ? <th>scrn</th> : null}
										<th>Status</th>
										<th>Add</th>
									</tr>
								</thead>
								<tbody>
									{otherCand.map((each, index) => {
										return (
											<tr key={index}>
												<td>{index + 1}.</td>
												<td>{each.email}</td>
												<td>{each.entryCtr}</td>
												{testInfo.cam ? (
													<td>
														<span
															className={each.cam ? "showGreen" : "showRed"}
														>
															&#9679;
														</span>
													</td>
												) : null}
												{testInfo.mic ? (
													<td>
														<span
															className={each.mic ? "showGreen" : "showRed"}
														>
															&#9679;
														</span>
													</td>
												) : null}
												{testInfo.win ? (
													<td>
														<span
															className={each.scrn ? "showGreen" : "showRed"}
														>
															&#9679;
														</span>
													</td>
												) : null}
												<td>
													<span
														className={each.socketId ? "showGreen" : "showRed"}
													>
														&#9679;
													</span>
												</td>
												<td>
													{each.socketId ? (
														<i
															className="showGreen fa fa-arrow-up"
															aria-hidden="true"
															onClick={() => {
																notify(msgHolder, "s", "Initiated");
																addOneToMyList(index);
															}}
														></i>
													) : (
														"-"
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						) : (
							<p>No more Candidates outside your proctoring List</p>
						)}
					</div>
				</div>
			);
		} else if (show === 3)
			return (
				<div id="responseWin">
					<i
						className="fa fa-times"
						aria-hidden="true"
						onClick={this.closeModal}
					></i>
					{/*  */}
					<div className="adminView" id="responseDiv">
						<form onSubmit={this.broadcastHandler}>
							<h3 style={{ margin: 0 }}>Broadcast to All Candidates</h3>
							<pre style={{ textAlign: "left" }}>
								Sent to all Candidates attempting this Test.
							</pre>
							<textarea
								ref={this.broadcastMsg}
								id="broadcastText"
								cols="50"
								rows="5"
							></textarea>
							<button className="btnPrimary">Send</button>
						</form>
					</div>
				</div>
			);
		else if (show === 4)
			return (
				<div className="singleView" id="responseWin">
					<video
						ref={(element) => {
							if (element) element.srcObject = this.props.stream;
						}}
						autoPlay
					></video>
					<i
						className="fa fa-times"
						aria-hidden="true"
						onClick={this.closeModal}
					></i>
				</div>
			);
		else if (show === 5) {
			const { constrFor, constr } = this.state;
			const w = constr[constrFor].width;
			const h = constr[constrFor].height;
			const aspR = (w / h).toFixed(3);
			return (
				<div id="responseWin">
					<i
						className="fa fa-times"
						aria-hidden="true"
						onClick={this.closeModal}
					></i>
					<div className="adminView" id="responseDiv">
						<form onSubmit={this.setVidConst}>
							<h3 style={{ margin: 0 }}>Set for All Candidates</h3>
							<br></br>
							<div>
								<label htmlFor="setFor">Set For &nbsp;</label>
								<select
									ref={this.setFor}
									id="setFor"
									onChange={(event) => {
										this.setState({ constrFor: parseInt(event.target.value) });
									}}
									defaultValue={constrFor}
									required
								>
									<option value="1">web-cam</option>
									<option value="2">screen</option>
								</select>
							</div>
							<div>
								<p>
									<b>
										<u>Resolution</u>
									</b>
								</p>
								<label htmlFor="width">Width</label>
								<input
									id="width"
									type="number"
									value={w}
									min="160"
									max="1920"
									onChange={(event) => {
										this.constrChgHandler("width", event);
									}}
									required
								></input>
								<label htmlFor="height">Height</label>
								<input
									id="height"
									type="number"
									min="120"
									max="1080"
									value={h}
									onChange={(event) => {
										this.constrChgHandler("height", event);
									}}
									required
								></input>
								<br></br>
								<pre style={aspR > 2 || aspR < 1 ? { color: "red" } : {}}>
									Aspect Ratio: {aspR}
								</pre>
							</div>
							<br></br>
							<div>
								<label htmlFor="frame">
									<b>
										<u>FrameRate</u>
									</b>
								</label>
								<input
									id="frame"
									type="number"
									min="1"
									max="75"
									value={constr[constrFor].frameRate}
									onChange={(event) => {
										this.constrChgHandler("frameRate", event);
									}}
									required
								></input>
							</div>
							<button className="btnPrimary" type="submut">
								Apply
							</button>
						</form>
						<br></br>
						<hr></hr>
						<br></br>
						<pre>
							Resolution and Frame Rate is directly proportional to
							<br></br>data consumption both Proctor_Side and Candidate_Side.
							<br></br>
							<br></br>
							Resolution:<br></br>Width-: Min 160 Max 1920<br></br>Height -: Min
							120 Max 1080<br></br>Aspect Ratio Range 1 ~ 2<br></br>
							<br></br>FrameRate : Min 1 Max 75
						</pre>
						<br></br>
						<hr></hr>
						<pre>
							For maximum area and better viewing experience use Aspect_Ratio
							around 1.77<br></br>Frame_Rate refers to number of times a video
							refreshes itself in one second.
							<br></br>Higher Frame Rates provide better viewing experience but
							consumes more bandwith
						</pre>
						<hr></hr>
						<br></br>
						<h3>Resolution Chart</h3>
						<pre>Prefered Resolutions</pre>
						<br></br>
						<table>
							<thead>
								<tr>
									<th></th>
									<th>Width x Height</th>
									<th>Aspect Ratio</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>1080p:</td>
									<td>1920 x 1080</td>
									<td>1.778</td>
								</tr>
								<tr>
									<td></td>
									<td>1360 x 768</td>
									<td>1.771</td>
								</tr>
								<tr>
									<td></td>
									<td>1280 x 1000</td>
									<td>1.280</td>
								</tr>
								<tr>
									<td></td>
									<td>1280 x 800</td>
									<td>1.600</td>
								</tr>
								<tr>
									<td></td>
									<td>1280 x 768</td>
									<td>1.667</td>
								</tr>
								<tr>
									<td>720p:</td>
									<td>1280 x 720</td>
									<td>1.778</td>
								</tr>
								<tr>
									<td></td>
									<td>1280 x 900</td>
									<td>1.422</td>
								</tr>
								<tr>
									<td></td>
									<td>1024 x 768</td>
									<td>1.333</td>
								</tr>
								<tr>
									<td></td>
									<td>1024 x 576</td>
									<td>1.778</td>
								</tr>
								<tr>
									<td></td>
									<td>800 x 600</td>
									<td>1.333</td>
								</tr>
								<tr>
									<td>480p:</td>
									<td>854 x 480</td>
									<td>1.779</td>
								</tr>
								<tr>
									<td></td>
									<td>768 x 576</td>
									<td>1.333</td>
								</tr>
								<tr>
									<td></td>
									<td>640 x 480</td>
									<td>1.333</td>
								</tr>
								<tr>
									<td>360p:</td>
									<td>640 x 360</td>
									<td>1.778</td>
								</tr>
								<tr>
									<td>240p:</td>
									<td>426 x 240</td>
									<td>1.775</td>
								</tr>
								<tr>
									<td></td>
									<td>320 x 240</td>
									<td>1.333</td>
								</tr>
								<tr>
									<td></td>
									<td>320 x 180</td>
									<td>1.778</td>
								</tr>
								<tr>
									<td></td>
									<td>160 x 120</td>
									<td>1.333</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			);
		}
	}
}
export default AdminModal;
