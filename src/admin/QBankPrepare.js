import React, { Component } from "react";
// JS
import McqQ from "./McqQ";
import CodingQ from "./CodingQ";
import HtmlQ from "./HtmlQ";
import { notify } from "./../common.js";
class QBankPrepare extends Component {
	constructor() {
		super();
		this.nom = React.createRef();
		this.noc = React.createRef();
		this.noh = React.createRef();
	}
	prepareArr = (event) => {
		event.preventDefault();
		let { qBank, setMainCompState } = this.props;
		const nom = parseInt(this.nom.current.value),
			noc = parseInt(this.noc.current.value),
			noh = parseInt(this.noh.current.value);
		if (qBank.length) {
			const action = parseInt(
				prompt(
					"There is already some Data\nInstruct Me\n1:to Clear and Re-Create\n2:to Append New Changes"
				)
			);
			if (isNaN(action)) return;
			if (action === 1) {
				qBank = [];
				// const allText = document.querySelectorAll("textarea");
				// allText.forEach((element) => {
				//   element.value = "";
				// });
				// const allInp = document.querySelectorAll("input");
				// allInp.forEach((element) => {
				//   element.value = "";
				// });
			}
		} else {
			qBank = [];
		}
		if (nom) {
			for (let i = 0; i < nom; i++) {
				qBank.push(["M"]);
			}
		}
		if (noc) {
			for (let i = 0; i < noc; i++) {
				qBank.push(["C"]);
			}
		}
		if (noh) {
			for (let i = 0; i < noh; i++) {
				qBank.push(["H", "", "", []]);
			}
		}
		setMainCompState({ qBank: qBank });
		event.target.reset();
	};
	insert = (qNo, arr) => {
		let qBank = this.props.qBank;
		qBank[qNo - 1] = arr;
		const { setMainCompState, msgHolder } = this.props;
		setMainCompState({
			qBank: qBank,
		});
		notify(msgHolder, "s", `Question No- ${qNo} Inserted`);
	};
	insertCorrect = (qNo, crct) => {
		let crctOptArr = this.props.crctOptArr;
		crctOptArr[qNo - 1] = crct;
		this.props.setMainCompState({
			crctOptArr: crctOptArr,
		});
	};
	deleteQuestion = (index) => {
		let { qBank, setMainCompState } = this.props;
		qBank = qBank.slice(0, index).concat(qBank.slice(index + 1));
		setMainCompState({ qBank: qBank });
	};
	render() {
		const { qBank, crctOptArr } = this.props;
		return (
			<>
				<form onSubmit={this.prepareArr} method="post" id="describe">
					<div>
						<label htmlFor="nom">MCQs-: </label>
						<input
							type="number"
							id="nom"
							ref={this.nom}
							defaultValue="0"
						></input>
					</div>
					<div>
						<label htmlFor="nom">Coding-: </label>
						<input
							type="number"
							id="noc"
							ref={this.noc}
							defaultValue="0"
						></input>
					</div>
					<div>
						<label htmlFor="nom">Web-Prog.-: </label>
						<input
							type="number"
							id="noh"
							defaultValue="0"
							ref={this.noh}
						></input>
					</div>
					<button className="btnSecondary" type="submit">
						Create/Update
					</button>
				</form>
				<div id="prepareQBank">
					{qBank
						? qBank.map((each, index) => {
								if (each[0] === "M")
									return (
										<McqQ
											key={index}
											qNo={index + 1}
											ques={each}
											crctOpt={crctOptArr[index]}
											insert={this.insert}
											insertCorrect={this.insertCorrect}
											deleteQ={this.deleteQuestion}
										/>
									);
								else if (each[0] === "C")
									return (
										<CodingQ
											key={index}
											qNo={index + 1}
											ques={each}
											insert={this.insert}
											deleteQ={this.deleteQuestion}
										/>
									);
								else if (each[0] === "H")
									return (
										<HtmlQ
											key={index}
											qNo={index + 1}
											ques={each}
											insert={this.insert}
											deleteQ={this.deleteQuestion}
										/>
									);
								else return null;
						  })
						: null}
				</div>
			</>
		);
	}
}
export default QBankPrepare;
