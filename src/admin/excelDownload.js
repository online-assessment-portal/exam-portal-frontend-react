import React, { Component } from "react";
//
import { dateTimeFormat } from "./../helpers/dateTimeFormat";
//
class ExcelDownload extends Component {
	constructor() {
		super();
		this.state = { html: "" };
	}
	replaceForWebProg = (each, wh, to) => {
		each.forEach((e1, i) => {
			each[i] = e1.replaceAll(wh, to);
		});
		return each;
	};
	prepareHTML = (allLabel, finalData, tsInfo) => {
		let str = `<style> table { border-collapse: collapse; font-family: Arial, Helvetica, sans-serif; } th, td { padding: 1vh 8px; text-align: center; } </style> <table id="mytable" border='1'><tr><th>SlNo.</th>`;
		allLabel.forEach((each) => {
			str += `<th>${each}</th>`;
		});
		str += "</tr>";
		finalData.forEach((each, index) => {
			str += `<tr><td>${index + 1}</td>`;
			each.forEach((e1) => {
				str += `<td>${e1}</td>`;
			});
			str += "</tr>";
		});
		str +=
			'</table><script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.9/xlsx.full.min.js" integrity="sha512-wBcFatf7yQavHQWtf4ZEjvtVz4XkYISO96hzvejfh18tn3OrJ3sPBppH0B6q/1SHB4OKHaNNUKqOmsiTGlOM/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script> <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js" integrity="sha512-Qlv6VSKh1gDKGoJbnyA5RMXYcvnpIqhO++MhIM2fStMcGT9i2T//tSwYFlcyoRRDcDZ+TYHpH8azBBCyhpSeqw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script> <script defer src="/sheetS.js"></script>';
		//
		const pgInfo = {};
		const { passcode } = this.props;
		pgInfo.filename =
			tsInfo.title + "_" + passcode + "_" + Date.now() + ".xlsx";
		str +=
			'<pre id="pgInfo" style="display: none;">' +
			JSON.stringify(pgInfo) +
			"</pre>";
		//
		this.setState({ html: str });
	};
	ascendingSort = (a, b) => {
		if (a > b) return 1;
		else if (a < b) return -1;
		else return 0;
	};
	processRespInsert = (each) => {
		if (Array.isArray(each)) {
			each = this.replaceForWebProg(each, "\n", "<br>");
			each = this.replaceForWebProg(each, "\t", "&emsp;");
			let string = `<b>HTML-:</b><br>${each[0]}<br><b>CSS-:</b><br>${each[1]}<br><b>JavaScript-:</b><br>${each[2]}`;
			return string;
		} else {
			if (each) {
				if (typeof each === "string") {
					each = each.replaceAll("\n", "<br>");
					each = each.replaceAll("\t", "&emsp;");
				}
				return each;
			} else return "-";
		}
	};
	prepareData = () => {
		let finalData = [];
		const {
			candData,
			testInfo,
			candLibSelAll,
			candResAll,
			tcResAll,
			scoreDetAll,
			totalAll,
			exmnrMark,
			exmnrCmnt,
			negMark,
			finalScore,
			qBank,
			spms,
			fsRank,
		} = this.props;
		//
		const tsInfo = JSON.parse(testInfo);
		let allLabel = [];
		allLabel.push("Email - Logger");
		if (tsInfo.ques) tsInfo.ques.forEach((each) => allLabel.push(each[2]));
		allLabel.push("Registration");
		allLabel.push("Submitted");
		if (tsInfo.isPool) allLabel.push(`Question Pool`);
		//
		for (let i = 0; i < qBank.length; i++) allLabel.push(`Q.${i + 1}`);
		//
		qBank.forEach((each, qNo) => {
			if (each[0] === "C") allLabel.push(`Test Case Response Q.${qNo + 1}`);
		});
		allLabel.push("Score Detailed");
		allLabel.push("Total Score");
		allLabel.push("Entry Count");
		allLabel.push("Full-Screen Violation");
		allLabel.push("Resize Screen Violation");
		allLabel.push("Tab Switches / Window Switches");
		allLabel.push("Media Proctor Violation");
		allLabel.push("Window Protor Violation");
		allLabel.push("Major Violation - Test Tamper");
		allLabel.push("Offline");
		if (exmnrMark[0]) {
			allLabel.push("Examiner Marking");
			allLabel.push("Examiner Remarks");
		}
		allLabel.push("Negative Marking");
		allLabel.push("Final Score");
		if (spms.length) {
			allLabel.push("Accuracy Ranking");
			allLabel.push("Score Ranking");
		}
		//
		//
		//
		let eachCandData = [];
		candData.forEach((eachCand, index) => {
			eachCandData = [];
			eachCandData.push(eachCand.email);
			//
			if (tsInfo.ques) {
				const questionnaire = JSON.parse(eachCand.questionnaire);
				if (questionnaire) {
					questionnaire.forEach((each) => eachCandData.push(each));
					const len1 = questionnaire.length;
					const len2 = tsInfo.ques.length;
					if (len1 < len2)
						for (let i = 0; i < len2 - len1; i++) eachCandData.push("");
				} else
					for (let i = 0; i < tsInfo.ques.length; i++) eachCandData.push("");
			}
			const date1 = dateTimeFormat(eachCand.firstEntry, -2);
			eachCandData.push(date1);
			const date2 = dateTimeFormat(eachCand.submittedOn, -2);
			eachCandData.push(date2);
			//
			const libSel = candLibSelAll[index];
			if (tsInfo.isPool) {
				// Since value is pass by ref and will be used for locating questions - use another array
				const tempArr = [];
				libSel.forEach((each) => {
					tempArr.push(each);
				});
				const str = tempArr.sort(this.ascendingSort).toString();
				eachCandData.push(str);
			}
			let scrDet = scoreDetAll[index];
			const newScrDet = [];
			// In case no response was Submitted
			if (candResAll[index] === null)
				qBank.forEach(() => eachCandData.push("-"));
			else {
				const resp = candResAll[index];
				let each = "";
				for (let i = 0; i < qBank.length; i++) {
					if (tsInfo.isPool) {
						const found = libSel.indexOf(i + 1);
						if (found === -1) {
							eachCandData.push("---");
							continue;
						} else {
							each = resp[found];
							// in order to match asc-Order of Question
							newScrDet.push(scrDet[found]);
						}
					} else each = resp[i];
					eachCandData.push(this.processRespInsert(each));
				}
			}
			// In case no response was submitted for Test Cases
			if (candResAll[index] === null) {
				qBank.forEach((each) => {
					if (each[0] === "C") eachCandData.push("-");
				});
			} else {
				// If the Question has Test Cases
				for (const i in tcResAll[index]) {
					if (Object.hasOwnProperty.call(tcResAll[index], i)) {
						const each = tcResAll[index][i].toString();
						if (each) eachCandData.push(each);
						else eachCandData.push("-");
					}
				}
			}
			if (newScrDet.length) scrDet = newScrDet;
			eachCandData.push(scrDet.toString());
			eachCandData.push(totalAll[index]);
			//
			eachCandData.push(eachCand.entryCtr);
			if (eachCand.vData.fsv === -1)
				eachCandData.push("System/Browser Changed");
			else eachCandData.push(eachCand.vData.fsv);
			eachCandData.push(eachCand.vData.rsz);
			eachCandData.push(eachCand.vData.wfo);
			eachCandData.push(eachCand.vData.mpv);
			eachCandData.push(eachCand.vData.spv);
			eachCandData.push(eachCand.vData.devT);
			eachCandData.push(eachCand.vData.offline);
			// Examiner
			if (exmnrMark[0]) {
				eachCandData.push(JSON.stringify(exmnrMark[index]));
				eachCandData.push(JSON.stringify(exmnrCmnt[index]));
			}
			//
			eachCandData.push(negMark[index]);
			eachCandData.push(finalScore[index]);
			// Rank Push
			if (spms.length) {
				eachCandData.push(spms[index]);
				eachCandData.push(fsRank[index]);
			}
			//
			finalData.push(eachCandData);
		});
		this.prepareHTML(allLabel, finalData, tsInfo);
	};
	componentDidMount() {
		this.prepareData();
	}
	render() {
		const { html } = this.state;
		if (!html) return <h1>Preparing</h1>;
		const { token } = this.props;
		return (
			<>
				<form action="/preResult/downloadExcel/" method="post" target="_blank">
					<input type="hidden" name="html" value={html}></input>
					<input type="hidden" name="_csrf" value={token}></input>
					<button
						type="submit"
						className="btnPrimary"
						ref={(ele) => {
							if (ele) ele.click();
						}}
					>
						Click to re-Download
					</button>
				</form>
			</>
		);
	}
}
export default ExcelDownload;
