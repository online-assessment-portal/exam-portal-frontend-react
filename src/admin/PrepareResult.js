import React, { Component } from "react";
import ShowCodeAdmin from "./showCodeAdmin";
import HTMLComponent from "./../HTMLComponent";
import ExcelDownload from "./excelDownload";
import { notify } from "./../common.js";
//
import { dateTimeFormat } from "./../helpers/dateTimeFormat";
//
class PrepareResult extends Component {
	constructor() {
		super();
		this.state = {
			prepHTML: false,
			prepCode: false,
			download: false,
			// Start calculating Score when true
			calcScore: false,
			//
			fontS: "16px",
			theme: "monokai",
			//
			crntQIndex: 0,
			crntQResp: "",
			candIndex: 0,
		};
		this.exmnrMarkVal = React.createRef();
		this.exmnrCmntTxt = React.createRef();
	}
	fetchAllData = async (event) => {
		event.preventDefault();
		const { msgHolder, token } = this.props;
		const formData = new FormData(event.target);
		formData.append("_csrf", token);
		const formBody = new URLSearchParams(formData).toString();
		try {
			const promise = await fetch("/preResult/getResponseData/", {
				method: "POST",
				body: formBody,
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			this.response = await promise.json();
			if (promise.status === 200 && promise.ok === true) {
				//
				const testData = this.response.testData;
				const qBank = JSON.parse(testData.qBank);
				let candLibSelAll = [],
					candResAll = [],
					tcResAll = [],
					langUsdAll = [],
					scoreDetAll = [],
					totalAll = [],
					negMark = [],
					finalScore = [],
					spms = [],
					fsRank = [],
					exmnrMark = [],
					exmnrCmnt = [];
				// Prepare Mail List
				const mailList = [];
				const candData = this.response.cand;
				//
				const testInfo = JSON.parse(testData.testInfo);
				const secInfo = testInfo.secInfo;
				const qLen = secInfo[secInfo.length - 1][1];
				candData.forEach((each, index) => {
					// If Pool Based
					if (each.libSel) {
						const arr = [];
						each.libSel = JSON.parse(each.libSel);
						each.libSel.forEach((each) => {
							each.forEach((qNo) => {
								arr.push(qNo);
							});
						});
						candLibSelAll.push(arr);
					}
					candResAll.push(JSON.parse(each.response));
					tcResAll.push(JSON.parse(each.tcResponse));
					langUsdAll.push(JSON.parse(each.cdLangId));
					if (each.exmnrMark === null) {
						exmnrMark.push({});
						exmnrCmnt.push({});
					} else {
						exmnrMark.push(JSON.parse(each.exmnrMark));
						exmnrCmnt.push(JSON.parse(each.exmnrCmnt));
					}
					if (each.result === null) {
						const emptyArr = new Array(qLen).fill(0);
						scoreDetAll.push(emptyArr);
					} else {
						scoreDetAll.push(JSON.parse(each.result));
						totalAll.push(parseInt(each.score));
						negMark.push(parseInt(each.negMark));
						finalScore.push(parseInt(each.finalScore));
					}
					if (each.aRank) {
						spms.push(parseInt(each.aRank));
						fsRank.push(parseInt(each.sRank));
					}
					// Prepare Mail List
					mailList.push(each.email);
					// Prepare violation Data
					const vData = JSON.parse(each.vData);
					this.response.cand[index].vData = vData;
				});
				if (this.response.cand[0].Result === null) {
					const len = this.response.cand.length;
					totalAll = new Array(len).fill(0);
					negMark = new Array(len).fill(0);
					finalScore = new Array(len).fill(0);
				}
				// Prepare Array of Score and Total
				this.setState({
					testInfo: testInfo,
					mailList: mailList,
					candLibSelAll: candLibSelAll,
					candResAll: candResAll,
					tcResAll: tcResAll,
					langUsdAll: langUsdAll,
					exmnrMark: exmnrMark,
					exmnrCmnt: exmnrCmnt,
					scoreDetAll: scoreDetAll,
					totalAll: totalAll,
					negMark: negMark,
					finalScore: finalScore,
					qBank: qBank,
					passcode: this.response.passcode,
					spms: spms,
					fsRank: fsRank,
				});
				if (this.response.cand[0].result) {
					if (
						window.confirm(
							"Result has already been Prepared and Uploaded.\nOK - to Recalculate\nCancel to display the Result"
						)
					)
						this.prepareResult();
				} else {
					notify(msgHolder, "s", "Data Received.<br>Wait till I Process.");
					this.prepareResult();
				}
			} else if (this.response.error)
				notify(msgHolder, "e", this.response.error.message);
			else notify(msgHolder, "e", "");
		} catch (error) {
			notify(
				msgHolder,
				"e",
				"An Error Occured while Processing your Request<br>Check if Internet Connection Exists"
			);
		}
	};
	prepareResult = () => {
		// Check for WebProg Questions
		const { testInfo, qBank, prepCode, prepHTML, exmnrMark, exmnrCmnt } =
			this.state;
		//
		const { msgHolder } = this.props;
		//
		let ctrM = 0,
			ctrC = 0,
			firstCodeIndex = -1,
			ctrH = 0,
			firstHTMLIndex = -1;
		qBank.forEach((each, index) => {
			// Count M to verify Answer keys equals to no of MCQs
			if (each[0] === "M") ctrM++;
			else if (each[0] === "C") {
				if (firstCodeIndex === -1) firstCodeIndex = index;
				ctrC++;
			} else if (each[0] === "H") {
				if (firstHTMLIndex === -1) firstHTMLIndex = index;
				ctrH++;
			}
		});
		// Ask Admin if they want to assign marks for Coding Questions
		if (!prepHTML && !prepCode && ctrC) {
			if (
				window.confirm(
					"There are some Coding Question(s) would you like to Examine Score for them Now.\nOK - for Yes\nCancel - for No"
				)
			) {
				this.nextCandidate(0, firstCodeIndex, {
					prepCode: true,
					prepHTML: false,
					crntQIndex: firstCodeIndex,
				});
				return false;
			}
		}
		// Ask Admin if they want to assign marks for Web-Programming Questions
		if (!prepHTML && ctrH) {
			if (
				window.confirm(
					"There are some Question(s) of WebProg Type would you like to Mark Score for them Now.\nOK - for Yes\nCancel - for No"
				)
			) {
				this.nextCandidate(0, firstHTMLIndex, {
					prepHTML: true,
					prepCode: false,
					crntQIndex: firstHTMLIndex,
				});
				return false;
			}
		}
		const { candLibSelAll, candResAll, tcResAll, scoreDetAll, totalAll } =
			this.state;
		// Prepare MCQ Score
		const crctOptArr = JSON.parse(this.response.testData.crctOpt);
		if (ctrM && ctrM !== crctOptArr.length) {
			if (crctOptArr.length === 0)
				notify(msgHolder, "e", "Please upload Answer Keys for MCQs.");
			else notify(msgHolder, "e", "Answer Keys are missing for some MCQs.");
			return false;
		}
		// Calculate Score one by one for each Candidate
		let incIndex = 0,
			scoreCoding = 0,
			ttlScore = [],
			finalScore = [];
		scoreDetAll.forEach((eachCand, candIndex) => {
			if (candResAll[candIndex] === null) {
				totalAll[candIndex] = 0;
				finalScore[candIndex] = 0;
				return false;
			}
			//
			const candResp = candResAll[candIndex];
			if (testInfo.isPool) {
				candLibSelAll[candIndex].forEach((each, i) => {
					const qType = qBank[each - 1][0];

					if (qType === "M") {
						if (candResp[i] === crctOptArr[each - 1])
							scoreDetAll[candIndex][i] = qBank[each - 1][4];
					} else if (qType === "C") {
						// Calculate Score for Coding
						scoreCoding = 0;
						tcResAll[candIndex][each - 1].forEach((tcScr) => {
							if (tcScr !== null) scoreCoding += tcScr;
						});
						scoreDetAll[candIndex][i] = scoreCoding;
					}
				});
			} else {
				incIndex = 0;
				candResp.forEach((each, qNo) => {
					// Calculate MCQ Score
					if (qBank[qNo][0] === "M") {
						if (each === crctOptArr[incIndex])
							scoreDetAll[candIndex][qNo] = qBank[qNo][4];
						incIndex++;
					} else if (qBank[qNo][0] === "C") {
						// Calculate Score for Coding
						scoreCoding = 0;
						tcResAll[candIndex][qNo].forEach((tcScr) => {
							if (tcScr !== null) scoreCoding += tcScr;
						});
						scoreDetAll[candIndex][qNo] = scoreCoding;
					}
				});
			}
			//
			ttlScore = 0;
			scoreDetAll[candIndex].forEach((eachQScr) => {
				ttlScore += eachQScr;
			});
			totalAll[candIndex] = ttlScore;
			// Total Examiner Marks
			let ttlExmnr = 0,
				tempMarking;
			// skip if no involvment of examiner mark
			if (exmnrMark[candIndex]) {
				if (testInfo.isPool) {
					const libSel = candLibSelAll[candIndex];
					const allQ = Object.keys(exmnrMark[candIndex]);
					allQ.forEach((qNo) => {
						qNo = parseInt(qNo);
						const found = libSel.indexOf(qNo);
						if (found === -1) {
							delete exmnrMark[candIndex][qNo];
							delete exmnrCmnt[candIndex][qNo];
						}
					});
				}
				tempMarking = Object.values(exmnrMark[candIndex]);
				tempMarking.forEach((each) => {
					ttlExmnr += each;
				});
			}
			finalScore[candIndex] = ttlScore + ttlExmnr;
		});
		this.setState({
			scoreDetAll: scoreDetAll,
			totalAll: totalAll,
			negMark: new Array(totalAll.length).fill(0),
			finalScore: finalScore,
			prepCode: false,
			prepHTML: false,
		});
		notify(
			msgHolder,
			"s",
			"<h3>Result was Prepared Successfully</h3>Please Upload and then Download it for your refrence."
		);
	};
	uploadResult = async () => {
		const {
			passcode,
			mailList,
			scoreDetAll,
			totalAll,
			negMark,
			exmnrMark,
			exmnrCmnt,
			finalScore,
		} = this.state;
		const { msgHolder, token } = this.props;
		let formData = new FormData();
		formData.append("passcode", passcode);
		formData.append("mailList", JSON.stringify(mailList));
		formData.append("scrDet", JSON.stringify(scoreDetAll));
		formData.append("total", JSON.stringify(totalAll));
		formData.append("negMark", JSON.stringify(negMark));
		formData.append("eMarks", JSON.stringify(exmnrMark));
		formData.append("eCmnts", JSON.stringify(exmnrCmnt));
		formData.append("finalScore", JSON.stringify(finalScore));
		formData.append("_csrf", token);
		const formBody = new URLSearchParams(formData).toString();
		try {
			const promise = await fetch("/preResult/uploadResult/", {
				method: "POST",
				body: formBody,
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			const response = await promise.json();
			if (promise.status === 200 && promise.ok === true)
				notify(msgHolder, "s", response.msg);
			else if (response.error) notify(msgHolder, "e", response.error.message);
			else notify(msgHolder, "e", "");
		} catch (error) {
			notify(
				msgHolder,
				"e",
				"An Error Occured while Processing your Request<br>Check if Internet Connection Exists"
			);
		}
	};
	getResultString = async (mailList) => {
		const { msgHolder, token } = this.props;
		const formData = new FormData();
		formData.append("mailList", JSON.stringify(mailList));
		formData.append("_csrf", token);
		const formBody = new URLSearchParams(formData).toString();
		try {
			const promise = await fetch("/preResult/getResultStr/", {
				method: "POST",
				body: formBody,
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			const response = await promise.json();
			if (promise.status === 200 && promise.ok === true) {
				notify(msgHolder, "s", response.msg);
				return response.data;
			} else if (response.error) {
				notify(msgHolder, "e", response.error.message);
				return false;
			} else {
				notify(msgHolder, "e", "");
				return false;
			}
		} catch (error) {
			notify(
				msgHolder,
				"e",
				"An Error Occured while Processing your Request<br>Check if Internet Connection Exists"
			);
			return false;
		}
	};
	prepareShowResult = async (passcode, title, date, data) => {
		date = dateTimeFormat(date, -2);
		const resObj = { title: title, date: date };
		//
		data = JSON.parse(data);
		const resStrColl = [];
		data.forEach((each) => {
			resStrColl.push(JSON.parse(each.result));
		});
		//
		const dateObj = new Date();
		const forMonth =
			(dateObj.getMonth() + 1).toString().slice(-2) +
			"_" +
			dateObj.getFullYear().toString().slice(-2);
		resStrColl.forEach((each, index) => {
			if (!each[forMonth]) each[forMonth] = {};
			each[forMonth][passcode] = resObj;
			resStrColl[index] = each;
		});
		resStrColl.forEach((each, index) => {
			resStrColl[index] = JSON.stringify(each);
		});
		return resStrColl;
	};
	showResult = async () => {
		const { passcode } = this.state;
		const { msgHolder, token } = this.props;
		// Prepare MailList for Candidate with response as not null ie atleast one question was answered
		const mailList = [];
		const candData = this.response.cand;
		candData.forEach((each) => {
			if (each.response) mailList.push(each.email);
		});
		if (!mailList.length) {
			notify(
				msgHolder,
				"e",
				"No candidate found with valid response.<br>Result is shown to candidates with atleast 1 response submitted."
			);
			return false;
		}
		//
		const resultStr = await this.getResultString(mailList);
		if (!resultStr) return false;
		//
		const tsInfo = JSON.parse(this.response.testData.testInfo);
		const showResData = await this.prepareShowResult(
			passcode,
			tsInfo.title,
			this.response.testData.strtTime,
			resultStr
		);
		let formData = new FormData();
		formData.append("mailList", JSON.stringify(mailList));
		formData.append("showResData", JSON.stringify(showResData));
		formData.append("_csrf", token);
		const formBody = new URLSearchParams(formData).toString();
		try {
			const promise = await fetch("/preResult/iniShowResult/", {
				method: "POST",
				body: formBody,
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			const response = await promise.json();
			if (promise.status === 200 && promise.ok === true)
				notify(msgHolder, "s", response.msg);
			else if (response.error) notify(msgHolder, "e", response.error.message);
			else notify(msgHolder, "e", "");
		} catch (error) {
			notify(
				msgHolder,
				"e",
				"An Error Occured while Processing your Request<br>Check if Internet Connection Exists"
			);
		}
	};
	examinerQNav = (what, type) => {
		const { crntQIndex, qBank } = this.state;
		const { msgHolder } = this.props;
		// what 1 for forward , 2 for backward
		let nextQIndex = null,
			prevQIndex = null;
		for (let qIndex = 0; qIndex < qBank.length; qIndex++) {
			const each = qBank[qIndex];
			if (
				(what === 1 && qIndex > crntQIndex) ||
				(what === 2 && qIndex < crntQIndex)
			) {
				// Type 1 for HTML , 2 for Coding
				if (what === 1) {
					if (type === 1 && each[0] === "H") {
						nextQIndex = qIndex;
						break;
					} else if (type === 2 && each[0] === "C") {
						nextQIndex = qIndex;
						break;
					}
				} else {
					if (type === 1 && each[0] === "H") prevQIndex = qIndex;
					else if (type === 2 && each[0] === "C") prevQIndex = qIndex;
				}
			}
		}
		if (what === 1 && nextQIndex !== null)
			this.nextCandidate(0, nextQIndex, { crntQIndex: nextQIndex });
		else if (what === 2 && prevQIndex !== null)
			this.nextCandidate(0, prevQIndex, { crntQIndex: prevQIndex });
		else if (what === 1) {
			notify(
				msgHolder,
				"s",
				`<h3>No more ${
					type === 1 ? "Web-Prog" : "Coding"
				} Questions Left.</h3>Result is being Prepared Now.`
			);
			this.prepareResult();
		} else notify(msgHolder, "e", "<h3>No Previous Question Found.</h3>");
	};
	nextCandidate = (
		candIndex,
		crntQIndex,
		stateObj = false,
		backTrace = false
	) => {
		const { msgHolder } = this.props;
		this.setState((prevState) => {
			// Check if cand response is available
			const resp = prevState.candResAll;
			//
			for (
				;
				backTrace ? candIndex >= 0 : candIndex < resp.length;
				backTrace ? candIndex-- : candIndex++
			) {
				const response = resp[candIndex];
				if (!response) continue;
				// Search if current ques was alloted to crntCand - in-case of qBankPool
				if (prevState.testInfo.isPool) {
					const isFound = prevState.candLibSelAll[candIndex].indexOf(
						crntQIndex + 1
					);
					if (isFound !== -1) {
						if (response[isFound]) {
							prevState.candIndex = candIndex;
							prevState.crntQResp = response[isFound];
							break;
						} else prevState.scoreDetAll[candIndex][isFound] = 0;
					}
				} else {
					if ([crntQIndex]) {
						prevState.candIndex = candIndex;
						prevState.crntQResp = response[crntQIndex];
						break;
					} else prevState.scoreDetAll[candIndex][crntQIndex] = 0;
				}
			}
			// If no candidate is found with response to this question
			if (candIndex === resp.length)
				notify(
					msgHolder,
					"e",
					"No more candidate(s) with response to this Question.<br>Please move to next Question."
				);
			// Merge Received stateObj
			prevState = { ...prevState, ...stateObj };
			return prevState;
		});
	};
	examinerUpdate = (candIndex, crntQIndex, score, cmnt) => {
		const { msgHolder } = this.props;
		const { exmnrMark, exmnrCmnt } = this.state;
		if (!score) score = "0";
		exmnrMark[candIndex][crntQIndex + 1] = parseInt(score);
		if (cmnt) exmnrCmnt[candIndex][crntQIndex + 1] = cmnt;
		this.nextCandidate(candIndex + 1, crntQIndex, { exmnrMark, exmnrCmnt });
		notify(msgHolder, "s", "Score Updated.");
	};
	//
	chngFontS = (size) => {
		this.setState({ fontS: size });
	};
	chngTheme = (theme) => {
		// await import(`ace-builds/src-noconflict/theme-${theme}`);
		this.setState({ theme: theme });
	};
	ascendingSortSPmS = (a, b) => {
		if (a[1] < b[1]) return 1;
		else if (a[1] > b[1]) return -1;
		else return 0;
	};
	// Sort email of both ranks so that they are in specific order
	ascendingSort = (a, b) => {
		if (a[0] < b[0]) return 1;
		else if (a[0] > b[0]) return -1;
		else return 0;
	};
	generateRanking = () => {
		const { finalScore } = this.state;
		if (!finalScore.length) {
			notify(this.props.msgHolder, "e", "No Score-card to generate Ranking.");
			return false;
		}
		// score per millisecond
		let spms = [],
			fsRank = [];
		this.response.cand.forEach((each, index) => {
			let scorePmS;
			if (each.submittedOn) {
				scorePmS =
					finalScore[index] /
					(new Date(each.submittedOn).getTime() -
						new Date(each.firstEntry).getTime());
				scorePmS = parseFloat(scorePmS.toFixed(10));
			} else scorePmS = 0;
			const tempArr1 = [each.email, scorePmS];
			spms.push(tempArr1);
			const tempArr2 = [each.email, finalScore[index]];
			fsRank.push(tempArr2);
		});
		spms = spms.sort(this.ascendingSortSPmS);
		fsRank = fsRank.sort(this.ascendingSortSPmS);
		// Give Rank
		let sR = 1,
			oR = 1,
			sspms = [],
			sfsRank = [];
		//
		spms.forEach((each) => {
			sspms.push(each[1]);
		});
		fsRank.forEach((each) => {
			sfsRank.push(each[1]);
		});
		//
		spms[0][1] = 1;
		fsRank[0][1] = 1;
		for (let i = 1; i < sspms.length; i++) {
			if (sspms[i] !== sspms[i - 1]) sR++;
			if (sfsRank[i] !== sfsRank[i - 1]) oR++;
			spms[i][1] = sR;
			fsRank[i][1] = oR;
		}
		// Sort email of both ranks so that they are in specific order
		spms = spms.sort(this.ascendingSort);
		fsRank = fsRank.sort(this.ascendingSort);
		this.sendRanking(spms, fsRank);
		this.extractRank(spms, fsRank);
	};
	extractRank = (spms, fsRank) => {
		const extSpms = [],
			extFs = [];
		//
		const cand = this.response.cand;
		// Set Rank Data
		cand.forEach((eachCand, index) => {
			const email = eachCand.email;
			for (let i = 0; i < spms.length; i++) {
				const rankOf = spms[i][0];
				if (rankOf === email) {
					extSpms[index] = spms[i][1];
					extFs[index] = fsRank[i][1];
				}
			}
		});
		this.setState({ spms: extSpms, fsRank: extFs });
	};
	sendRanking = async (spms, fsRank) => {
		const { passcode } = this.state;
		const { msgHolder, token } = this.props;
		// Remove email from fs Rank - just to reduce size of payload
		const newFsrRank = [];
		fsRank.forEach((each) => {
			newFsrRank.push(each[1]);
		});
		//
		let formData = new FormData();
		formData.append("passcode", passcode);
		formData.append("spms", JSON.stringify(spms));
		formData.append("fsRank", JSON.stringify(newFsrRank));
		formData.append("_csrf", token);
		const formBody = new URLSearchParams(formData).toString();
		try {
			const promise = await fetch("/preResult/uploadRanking/", {
				method: "POST",
				body: formBody,
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			const response = await promise.json();
			if (promise.status === 200 && promise.ok === true) {
				notify(msgHolder, "s", response.msg);
			} else if (this.response.error)
				notify(msgHolder, "e", this.response.error.message);
			else notify(msgHolder, "e", "");
		} catch (error) {
			notify(
				msgHolder,
				"e",
				"An Error Occured while Processing your Request<br>Check if Internet Connection Exists"
			);
		}
	};
	render() {
		const {
			passcode,
			prepHTML,
			prepCode,
			download,
			crntQIndex,
			crntQResp,
			candIndex,
			qBank,
			candLibSelAll,
			candResAll,
			scoreDetAll,
			fontS,
			theme,
		} = this.state;
		if (!passcode) {
			return (
				<form method="post" onSubmit={this.fetchAllData} id="resultForm">
					<label htmlFor="passcode">Enter Passcode-: </label>
					<input type="text" name="passcode" id="passcode" required></input>
					<button
						className="btnPrimary"
						type="submit"
						style={{ marginTop: "1vh" }}
					>
						Initiate
					</button>
					<br></br>
					<ul>
						<li>
							Result Preparing Process will Start after all Data is Fetched
						</li>
						<li>
							This is a time-consuming Process, it may take longer depending on
							the number of Candidates.
						</li>
						<li>Please Be Patient!</li>
						<li>a Alert will Come after the Result is Ready</li>
					</ul>
				</form>
			);
		} else if (prepHTML || prepCode) {
			const { msgHolder } = this.props;
			const { tcResAll, langUsdAll, exmnrMark, exmnrCmnt } = this.state;
			return (
				<>
					<div id="prepResQNav">
						<button
							className="btnPrimary"
							type="button"
							onClick={() => {
								this.prepareResult();
							}}
						>
							Prepare Result
						</button>
						<p>
							Candidate {candIndex + 1} of {candResAll.length}{" "}
							&nbsp;&nbsp;&nbsp;&nbsp;Email-:{" "}
							{this.response.cand[candIndex].email}{" "}
						</p>
						<div>
							<button
								className="btnPrimary"
								type="button"
								onClick={() => {
									if (prepHTML) this.examinerQNav(2, 1);
									else this.examinerQNav(2, 2);
								}}
							>
								{prepHTML ? "Prev WebProg Q." : "Prev Coding Q."}
							</button>
							<button
								className="btnPrimary"
								type="button"
								onClick={() => {
									if (prepHTML) this.examinerQNav(1, 1);
									else this.examinerQNav(1, 2);
								}}
							>
								{prepHTML ? "Next WebProg Q." : "Next Coding Q."}
							</button>
						</div>
					</div>
					{prepHTML ? (
						<HTMLComponent
							isPrepare={true}
							// For Question No
							crntQIndex={crntQIndex}
							// To display Question
							ques={qBank[crntQIndex]}
							// Candidate Response
							response={crntQResp ? crntQResp : null}
							fontS={fontS}
							theme={theme}
							msgHolder={msgHolder}
							chngFontS={this.chngFontS}
							chngTheme={this.chngTheme}
						/>
					) : (
						<ShowCodeAdmin
							isPrepare={true}
							// For Key
							candIndex={candIndex}
							// For Question No
							crntQIndex={crntQIndex}
							// To display Question
							ques={qBank[crntQIndex]}
							// Candidate Response
							candRes={crntQResp}
							tcRes={
								tcResAll[candIndex] ? tcResAll[candIndex][crntQIndex] : null
							}
							langUsed={
								langUsdAll[candIndex] ? langUsdAll[candIndex][crntQIndex] : null
							}
							fontS={fontS}
							theme={theme}
							msgHolder={msgHolder}
						/>
					)}
					<div id="exmnrNav">
						<span></span>
						<form
							method="post"
							onSubmit={(event) => {
								event.preventDefault();
								this.examinerUpdate(
									candIndex,
									crntQIndex,
									this.exmnrMarkVal.current.value,
									this.exmnrCmntTxt.current.value
								);
							}}
						>
							<p>Remarks for Q.{crntQIndex + 1}</p>
							<textarea
								rows="2"
								cols="60"
								key={`exmnrCmnt-${candIndex}-${crntQIndex}`}
								ref={this.exmnrCmntTxt}
								defaultValue={exmnrCmnt[candIndex][crntQIndex + 1]}
							></textarea>
							<p>Score</p>
							<input
								type="number"
								key={`exmnrMark-${candIndex}-${crntQIndex}`}
								ref={this.exmnrMarkVal}
								defaultValue={exmnrMark[candIndex][crntQIndex + 1]}
							></input>
							<button className="btnPrimary" type="submit">
								Next Candidate
							</button>
						</form>
						{candIndex > 0 ? (
							<button
								className="btnPrimary"
								type="button"
								onClick={() => {
									this.nextCandidate(candIndex - 1, crntQIndex, false, true);
								}}
							>
								Prev Candidate
							</button>
						) : (
							<span></span>
						)}
					</div>
				</>
			);
		} else if (download) {
			const { testData } = this.response;
			const {
				tcResAll,
				totalAll,
				exmnrMark,
				exmnrCmnt,
				negMark,
				finalScore,
				spms,
				fsRank,
			} = this.state;
			return (
				<ExcelDownload
					candData={this.response.cand}
					testInfo={testData.testInfo}
					passcode={testData.passcode}
					candLibSelAll={candLibSelAll}
					candResAll={candResAll}
					tcResAll={tcResAll}
					scoreDetAll={scoreDetAll}
					totalAll={totalAll}
					exmnrMark={exmnrMark}
					exmnrCmnt={exmnrCmnt}
					negMark={negMark}
					finalScore={finalScore}
					spms={spms}
					fsRank={fsRank}
					qBank={qBank}
					token={this.props.token}
				/>
			);
		} else {
			// Display Result
			const {
				scoreDetAll,
				totalAll,
				exmnrMark,
				negMark,
				finalScore,
				spms,
				fsRank,
			} = this.state;
			// Return blank if not calculated
			if (!totalAll[0]) return <p>Calculating</p>;
			//
			const candData = this.response.cand;
			return (
				<>
					<div id="prepResBtns">
						<button
							className="btnPrimary"
							type="button"
							onClick={this.uploadResult}
						>
							Upload Result
						</button>
						<button
							className="btnPrimary"
							type="button"
							onClick={this.generateRanking}
						>
							Generate Ranking
						</button>
						<button
							className="btnPrimary"
							type="button"
							onClick={this.showResult}
						>
							Declare Result
						</button>
					</div>
					<button
						className="btnPrimary"
						type="button"
						onClick={() => this.setState({ download: true })}
					>
						Download Result
					</button>
					<div id="briefResp">
						<table id="printable">
							<thead>
								<tr>
									<th>Email</th>
									<th>entryCtr</th>
									<th>Voilations</th>
									{/* <th>Offline</th> */}
									<th>Score_Detailed</th>
									<th>Total_Score</th>
									{exmnrMark[0] ? <th>Examiner Marking</th> : null}
									<th>Negative Marking</th>
									<th>Final Score</th>
									{spms.length ? <th>Score/ms Ranking</th> : null}
									{fsRank.length ? <th>Final Score Ranking</th> : null}
								</tr>
							</thead>
							<tbody>
								{scoreDetAll.map((each, i) => {
									const cand = candData[i];
									return (
										<tr key={i}>
											<td>{cand.email}</td>
											<td>{cand.entryCtr}</td>
											<td>
												{cand.vData.fsv +
													cand.vData.wfo +
													cand.vData.rsz +
													cand.vData.mpv +
													cand.vData.spv +
													cand.vData.devT}
											</td>
											{/* <td>{cand.Offline}</td> */}
											<td>{each.toString()}</td>
											<td>{totalAll[i]}</td>
											{exmnrMark[0] ? (
												<td>{Object.values(exmnrMark[i]).toString()}</td>
											) : null}
											<td>
												<input
													type="number"
													min="0"
													value={negMark[i] ? negMark[i] : 0}
													onChange={(ev) => {
														this.setState((prevState) => {
															const neg = ev.target.value;
															prevState.negMark[i] = neg;
															prevState.finalScore[i] =
																prevState.totalAll[i] - neg;
															return prevState;
														});
													}}
												></input>
											</td>
											<td>{finalScore[i]}</td>
											{spms.length ? <td>#{spms[i]}</td> : null}
											{fsRank.length ? <td>#{fsRank[i]}</td> : null}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</>
			);
		}
	}
}
export default PrepareResult;
