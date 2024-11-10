import React, { Component } from "react";
class Scorecard extends Component {
	componentDidMount() {
		document.title = "My Scorecard";
	}
	render() {
		const {
			userInfo,
			scoreDetailed,
			exmnrM,
			quesBank,
			Rank,
			ScoreRank,
			negmark,
			final,
		} = this.props;
		let { score } = this.props;
		let eachScr = 0,
			qScore = 0,
			maxScore = 0;
		return (
			<div id="container">
				<div id="qContainer">
					<div id="candInfo">
						<p>Name -: {userInfo.name}</p>
						<p>Email -: {userInfo.email}</p>
					</div>
					<table>
						<thead>
							<tr>
								<th>Question No.</th>
								<th>Score</th>
							</tr>
						</thead>
						<tbody>
							{scoreDetailed.map((each, index) => {
								if (quesBank[index][0] === "M") qScore = quesBank[index][4];
								else if (quesBank[index][0] === "C") {
									qScore = 0;
									quesBank[index][9].forEach((each) => {
										qScore += each;
									});
								} else if (quesBank[index][0] === "H")
									qScore = quesBank[index][6];
								maxScore += qScore;
								//
								eachScr = each;
								if (exmnrM && exmnrM[quesBank[index].qIndex + 1]) {
									const eMark = exmnrM[quesBank[index].qIndex + 1];
									eachScr += eMark;
									score += eMark;
								}
								return (
									<tr key={index}>
										<td>{index + 1}.</td>
										<td>
											{eachScr}/{qScore}
										</td>
									</tr>
								);
							})}
							<tr className="tableEff">
								<td>Total Score</td>
								<td>
									{score}/{maxScore}
								</td>
							</tr>
							<tr className="tableEff">
								<td>Negative Marking</td>
								<td>- {negmark}</td>
							</tr>
							<tr className="tableEff">
								<td>Final Score</td>
								<td>
									{final}/{maxScore}
								</td>
							</tr>
							{Rank ? (
								<tr className="tableEff">
									<td>Ranking</td>
									<td>#{Rank}</td>
								</tr>
							) : null}
							{ScoreRank ? (
								<tr className="tableEff">
									<td>Score Ranking</td>
									<td>#{ScoreRank}</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}
export default Scorecard;
