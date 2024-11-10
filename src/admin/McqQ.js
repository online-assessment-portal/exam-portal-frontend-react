import React, { Component } from "react";
class McqQ extends Component {
	constructor() {
		super();
		this.state = {
			optArr: ["", "", "", ""],
		};
		this.qText = React.createRef();
		this.expl = React.createRef();
		this.optionDiv = React.createRef();
		this.score = React.createRef();
		this.crctOpt = React.createRef();
	}
	static getDerivedStateFromProps(props) {
		if (props.ques && props.ques[3] && props.ques.length)
			return { optArr: props.ques[3] };
		else return {};
	}
	insert = () => {
		let arr = [];
		arr.push("M");
		arr.push(this.qText.current.value);
		arr.push(this.expl.current.value);
		let options = [];
		const allOpt = this.optionDiv.current.querySelectorAll("input");
		allOpt.forEach((each) => {
			const val = each.value;
			if (val === "") return;
			options.push(val);
		});
		arr.push(options);
		arr.push(parseInt(this.score.current.value));
		const { qNo, insert, insertCorrect } = this.props;
		insert(qNo, arr);
		insertCorrect(qNo, parseInt(this.crctOpt.current.value));
	};
	increaseOption = () => {
		this.setState((prevState) => {
			prevState.optArr.push("");
			return prevState;
		});
	};
	render() {
		const optArr = this.state.optArr;
		const { qNo, ques, crctOpt, deleteQ } = this.props;
		return (
			<fieldset>
				<legend>
					Question No.{qNo}-MCQ -
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
						<label htmlFor={"qText" + qNo}>Main Text</label>
						<textarea
							ref={this.qText}
							id={"qText" + qNo}
							cols="50"
							rows="6"
							defaultValue={ques[1] ? ques[1] : null}
						></textarea>
						<label htmlFor={"expl" + qNo}>Explanation Text</label>
						<textarea
							ref={this.expl}
							id={"expl" + qNo}
							cols="50"
							rows="10"
							defaultValue={ques[2] ? ques[2] : null}
						></textarea>
					</div>
					<div>
						<div id="optionDiv" ref={this.optionDiv}>
							{optArr.map((each, index) => {
								return (
									<div key={index}>
										<label htmlFor={"opt" + index + qNo}>
											Option {index + 1}
										</label>
										<input
											type="text"
											id={"opt" + index + qNo}
											defaultValue={each}
										/>
									</div>
								);
							})}
						</div>
						<button
							className="btnSecondary"
							type="button"
							onClick={this.increaseOption}
						>
							Add Option
						</button>
						<label htmlFor={"score" + qNo}>Score</label>
						<input
							ref={this.score}
							id={"score" + qNo}
							type="number"
							defaultValue={ques[4] ? ques[4] : null}
						/>
						<label htmlFor={"crct" + qNo}>Correct Option</label>
						<input
							ref={this.crctOpt}
							id={"crct" + qNo}
							type="number"
							placeholder="1/2/3/4"
							defaultValue={crctOpt}
						/>
						<button
							className="btnSecondary"
							type="button"
							onClick={this.insert}
						>
							Insert Q
						</button>
					</div>
				</div>
			</fieldset>
		);
	}
}
export default McqQ;
