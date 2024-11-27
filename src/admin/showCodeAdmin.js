import React, { Component } from 'react';
import AceEditor from 'react-ace';
//
import { extractDefCode } from './../helpers/codingQ';
import { langName, edtrMode } from './../helpers/lang';

class ShowCodeAdmin extends Component {
  constructor() {
    super();
    this.edtrOpt = {
      wrap: true,
      highlightActiveLine: false,
      highlightGutterLine: false,
      useWorker: false,
      showPrintMargin: false,
      minLines: 10,
      maxLines: 100,
    };
  }
  render() {
    const { ques, langUsed, crntQIndex, candIndex } = this.props;
    let { candRes, tcRes } = this.props;
    //
    if (candRes && langUsed) {
      const crntDefCode = extractDefCode(ques, langUsed);
      // Upper Code
      if (crntDefCode[2]) candRes = crntDefCode[2] + candRes;
      else if (crntDefCode[0]) candRes = crntDefCode[0] + candRes;
      // Lower Code
      if (crntDefCode[3]) candRes = candRes + crntDefCode[3];
      else if (crntDefCode[1]) candRes = candRes + crntDefCode[1];
    } else candRes = '';
    //
    let ttlScore = 0;
    if (!tcRes || tcRes[0] === null) tcRes = new Array(ques[8]).fill(0);
    else
      tcRes.forEach((each) => {
        ttlScore += each;
      });
    let maxScore = 0;
    ques[9].forEach((each) => (maxScore += each));
    //
    let mode = 'c_cpp';
    if (langUsed) mode = edtrMode[langUsed];
    //
    return (
      <div id="prepResCd">
        <div>
          <div>
            <p>
              <u>
                <strong>Question No.{crntQIndex + 1}</strong>
              </u>
              <span>(Max Score - {maxScore})</span>
              <br></br>
              {ques[1]}
            </p>
          </div>
          <h4>
            Candidate's Compiled Code - {langUsed ? langName[langUsed] : null}
          </h4>
          <AceEditor
            key={crntQIndex + candIndex + 'CD'}
            name="code"
            mode={mode}
            placeholder="No Code"
            fontSize="18px"
            theme="monokai"
            value={candRes}
            width="100%"
            height="100%"
            style={{ borderRadius: '5px' }}
            setOptions={this.edtrOpt}
          />
        </div>
        <div
          id="scoreTable"
          style={{ display: 'flex', marginTop: '4vh' }}
          key={crntQIndex}
        >
          <table>
            <thead>
              <tr>
                <th>Test Case</th>
                <th>Status</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {tcRes.map((each, index, cn) => {
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
              <tr>
                <td colSpan="3" style={{ border: '0' }}>
                  <strong>Total Score-: {ttlScore}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
export default ShowCodeAdmin;
