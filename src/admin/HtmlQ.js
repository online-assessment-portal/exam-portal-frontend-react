import React, { PureComponent } from "react";

class HtmlQ extends PureComponent {
	constructor() {
		super();
		this.jsType = React.createRef();
		this.eType1 = React.createRef();
		this.eType2 = React.createRef();
		this.url = React.createRef();
		this.score = React.createRef();
	}
	prepareHtmlQ = (event) => {
		event.preventDefault();
		const entryS = new FormData(event.target).entries();
		const ques = ["H"],
			add = [];
		for (const iterator of entryS) {
			const key = iterator[0];
			if (key.indexOf("add") === 0) add.push(parseInt(key.charAt(3)));
			else if (key.indexOf("qText") === 0) ques.push(iterator[1]);
			else if (key.indexOf("expl") === 0) ques.push(iterator[1]);
		}
		ques.push(add);
		if (this.eType1.current.checked === true) ques.push("I");
		else if (this.eType2.current.checked === true) ques.push("F");
		else ques.push("");
		//
		ques.push(this.url.current.value);
		ques.push(parseInt(this.score.current.value));
		this.props.insert(this.props.qNo, ques);
	};
	markType = () => {
		const { qNo, ques } = this.props;
		if (ques !== undefined && ques.eType === "F") {
			const checkEle = document.querySelector(
				`input[type="radio"][id="frame${qNo}"]`
			);
			checkEle.checked = true;
		}
	};
	componentDidUpdate() {
		this.markType();
	}
	componentDidMount() {
		this.markType();
	}
	render() {
		const { qNo, ques, deleteQ } = this.props;
		return (
			<form onSubmit={this.prepareHtmlQ}>
				<fieldset>
					<legend>
						Question No.{qNo}-HTML -
						<i
							className="fa fa-trash-o"
							aria-hidden="true"
							onClick={() => {
								deleteQ(qNo - 1);
							}}
						></i>
					</legend>
					<div>
						<div>
							<label>Main Text</label>
							<textarea
								name="qText"
								cols="50"
								rows="6"
								defaultValue={ques[1]}
							></textarea>
							<label>Explanation Text</label>
							<textarea
								name="expl"
								cols="50"
								rows="10"
								defaultValue={ques[2]}
							></textarea>
						</div>
						<div id="htmlQOpt">
							<h4 style={{ textDecoration: "underline gray" }}>
								Select Additionals
							</h4>
							<div>
								<input
									type="checkbox"
									name="add0"
									id={"a0" + qNo}
									defaultChecked={ques[3].indexOf(0) !== -1 ? true : false}
								></input>
								<label htmlFor={"a0" + qNo}> Bootstrap</label>
							</div>
							<div>
								<input
									type="checkbox"
									name="add1"
									id={"a1" + qNo}
									defaultChecked={ques[3].indexOf(1) !== -1 ? true : false}
								></input>
								<label htmlFor={"a1" + qNo}> ReactJS</label>
							</div>
							<div>
								<input
									type="checkbox"
									name="add2"
									id={"a2" + qNo}
									defaultChecked={ques[3].indexOf(2) !== -1 ? true : false}
								></input>
								<label htmlFor={"a2" + qNo}> VueJS</label>
							</div>
							<div>
								<input
									type="checkbox"
									name="add3"
									id={"a3" + qNo}
									defaultChecked={ques[3].indexOf(3) !== -1 ? true : false}
								></input>
								<label htmlFor={"a3" + qNo}> jQuery</label>
							</div>
							<div>
								<input
									type="checkbox"
									name="add4"
									id={"a4" + qNo}
									defaultChecked={ques[3].indexOf(4) !== -1 ? true : false}
								></input>
								<label htmlFor={"a4" + qNo}> AngularJS</label>
							</div>
							{/* <select id={"js" + qNo} ref={this.jsType} defaultValue={ques[3]}>
							<option value="0">Pure JavaScript</option>
							<option value="1"></option>
							<option value="2"></option>
							<option value="3"></option>
							<option value="4"></option>
						</select> */}
							<div>
								<h4 style={{ textDecoration: "underline gray" }}>
									Configure Expected Output
								</h4>
								<input
									ref={this.eType1}
									type="radio"
									name={"type" + qNo}
									id={"img" + qNo}
									required
									defaultChecked={ques[4] === "I" ? true : false}
								></input>
								<label htmlFor={"img" + qNo}> Image</label>
								<br></br>
								<input
									ref={this.eType2}
									type="radio"
									name={"type" + qNo}
									id={"frame" + qNo}
									required
									defaultChecked={ques[4] === "F" ? true : false}
								></input>
								<label htmlFor={"frame" + qNo}> Web-Page</label>
								<br></br>
								<input
									type="radio"
									name={"type" + qNo}
									id={"none" + qNo}
									required
									defaultChecked={ques[4] === "" ? true : false}
								></input>
								<label htmlFor={"none" + qNo}> None</label>
							</div>
							<label htmlFor={"url" + qNo}>URL-:</label>
							<input
								ref={this.url}
								type="url"
								id={"url" + qNo}
								defaultValue={ques[5]}
							></input>
							<label htmlFor={"score" + qNo}>Score</label>
							<input
								ref={this.score}
								id={"score" + qNo}
								type="number"
								defaultValue={ques[6]}
							/>
							<button
								className="btnSecondary"
								type="submit"
								// onClick={this.insert}
							>
								Insert Q
							</button>
						</div>
					</div>
				</fieldset>
			</form>
		);
	}
}
export default HtmlQ;
