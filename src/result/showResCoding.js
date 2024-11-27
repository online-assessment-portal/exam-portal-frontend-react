import React, { Component } from 'react';
import AceEditor from 'react-ace';
import { extractDefCode } from './../helpers/codingQ';
import { langName, edtrMode } from './../helpers/lang';

class ShowResCoding extends Component {
  constructor() {
    super();
    this.edtrOpt = {
      wrap: true,
      readOnly: true,
      highlightActiveLine: false,
      highlightGutterLine: false,
      useWorker: false,
      showPrintMargin: false,
    };
  }
  componentDidMount() {
    document.title = 'Response Coding Question';
  }
  render() {
    const {
      ques,
      crntQIndex,
      status,
      response,
      cdLangId,
      score,
      exmnrM,
      exmnrC,
      theme,
    } = this.props;
    let { tcR } = this.props;
    if (!tcR || tcR[0] === null) tcR = new Array(ques[8]).fill(0);
    let maxScore = 0;
    ques[9].forEach((each) => {
      maxScore += each;
    });
    let responseCode;
    if (response && cdLangId) {
      const crntDefCode = extractDefCode(ques, cdLangId);
      // Upper Code
      if (crntDefCode[2]) responseCode = crntDefCode[2] + response;
      else responseCode = crntDefCode[0] + response;
      // Lower Code
      if (crntDefCode[3]) responseCode = response + crntDefCode[3];
      else responseCode = response + crntDefCode[1];
    } else responseCode = 'No Code Written';
    let qText = `<u><strong>Question No.${crntQIndex + 1}`;
    if (cdLangId) qText += `- Lang -: ${langName[cdLangId]}`;
    qText +=
      `</strong></u><span>(Max Score - ${maxScore})</span><br>` + ques[2];
    //
    let mode = 'c_cpp';
    if (cdLangId) mode = edtrMode[cdLangId];
    //
    return (
      <div id="container">
        <div id="mcqContainer">
          <p
            dangerouslySetInnerHTML={{
              __html: qText,
            }}
          ></p>
          {ques[3] ? (
            <>
              <h4>Explanation -:</h4>
              <p
                dangerouslySetInnerHTML={{
                  __html: ques[3],
                }}
              ></p>
            </>
          ) : null}
        </div>
        <div className="showCode">
          <h4>Your Code-:</h4>
          <AceEditor
            key={crntQIndex + 'CD'}
            name="code"
            mode={mode}
            placeholder="Your Response Code Here"
            fontSize="16px"
            theme={theme}
            value={responseCode}
            width="100%"
            height="100%"
            style={{ borderRadius: '5px' }}
            setOptions={this.edtrOpt}
          />
        </div>
        <div id="scoreTable" key={crntQIndex}>
          <table>
            <thead>
              <tr>
                <th>Test Case</th>
                <th>Status</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {tcR.map((each, index, cn) => {
                if (each === null || (each === 0 && ques[9][index] !== 0))
                  cn = 'fa fa-times';
                else cn = 'fa fa-check';
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <i className={cn} aria-hidden="true"></i>
                    </td>
                    <td>
                      {each}/{ques[9][index]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div id="respDetail">
          <p>
            <u>Question.{crntQIndex + 1}</u>
          </p>
          <p>
            Status-: <span className="showStatus">{status}</span>
          </p>
          {exmnrM ? <p>Examiner Marking-: {exmnrM}</p> : null}
          {exmnrC ? <p>Examiner Comment/Remark-: {exmnrC}</p> : null}
          <p>
            <strong>Test-Case Score -: {score}</strong>
          </p>
          {exmnrM ? (
            <p>
              <strong>Final Score -: {score + exmnrM}</strong>
            </p>
          ) : null}
        </div>
      </div>
    );
  }
}
export default ShowResCoding;
