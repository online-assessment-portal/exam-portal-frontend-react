import React, { Component } from 'react';
class ShowResMcq extends Component {
  componentDidMount() {
    document.title = 'Response MCQs';
  }
  render() {
    const { crntQIndex, status, ques, response, crctOpt, score } = this.props;
    let qText =
      `<strong>Q${crntQIndex + 1}.</strong> ` +
      ques[1] +
      `<span>(${ques[4]} Marks)</span>`;
    const candRes = ques[3][response - 1];
    return (
      <div id="container">
        <div id="mcqContainer">
          <h1
            dangerouslySetInnerHTML={{
              __html: qText,
            }}
          ></h1>
          <pre>
            <p
              dangerouslySetInnerHTML={{
                __html: ques[2],
              }}
            ></p>
          </pre>
          <div className="mcqResponse" id="mcqOptCont">
            <form key={crntQIndex}>
              {ques[3].map((each, index) => {
                return (
                  <label key={index + 1}>
                    <input
                      type="radio"
                      name="option"
                      value={index + 1}
                      onClick={() => this.sendRes('ansQ')}
                      defaultChecked={response === index + 1 ? true : false}
                      disabled
                    />
                    {each}
                  </label>
                );
              })}
            </form>
          </div>
          <div id="respDetail">
            <p>
              <u>Question.{crntQIndex + 1}</u>
            </p>
            <p>
              Status-: <span className="showStatus">{status}</span>
            </p>
            <p className={score === ques[4] ? 'crctRes' : 'wrongRes'}>
              <strong>Score-: {score}</strong>
            </p>
            <p>
              Your Response -:{' '}
              {candRes ? candRes : <span className="noresp">No Response</span>}
            </p>
            <p>Correct Response -: {ques[3][crctOpt - 1]}</p>
          </div>
        </div>
      </div>
    );
  }
}
export default ShowResMcq;
