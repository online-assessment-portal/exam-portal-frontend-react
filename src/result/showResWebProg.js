import React, { Component } from 'react';
import AceEditor from 'react-ace';
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
    document.title = 'Response Web-Programming';
  }
  render() {
    const { ques, crntQIndex, status, response, exmnrM, exmnrC, theme } =
      this.props;
    let qText =
      `<u><strong>Question No.${
        crntQIndex + 1
      }</strong></u><span>(Max Score - ${ques[6]})</span><br>` + ques[1];
    return (
      <div id="container">
        <div id="mcqContainer">
          <p
            dangerouslySetInnerHTML={{
              __html: qText,
            }}
          ></p>
          {ques[2] ? (
            <>
              <h4>Explanation -:</h4>
              <p
                dangerouslySetInnerHTML={{
                  __html: ques[2],
                }}
              ></p>
            </>
          ) : null}
        </div>
        <div id="showWebCode">
          {response ? (
            <div className="showCode">
              <h4>HTML Code-:</h4>
              <AceEditor
                key={crntQIndex + 'html'}
                name="code"
                mode="html"
                placeholder="Your HTML Code Here"
                fontSize="16px"
                theme={theme}
                value={response[0]}
                width="100%"
                height="100%"
                setOptions={this.edtrOpt}
              />
              <h4>CSS Code-:</h4>
              <AceEditor
                key={crntQIndex + 'css'}
                name="code"
                mode="css"
                placeholder="Your CSS Code Here"
                fontSize="16px"
                theme={theme}
                value={response[1]}
                width="100%"
                height="100%"
                setOptions={this.edtrOpt}
              />
              <h4>JS Code-:</h4>
              <AceEditor
                key={crntQIndex + 'js'}
                name="code"
                mode={ques[3].indexOf(0) !== -1 ? 'jsx' : 'javascript'}
                placeholder="Your JavaScript Code Here"
                fontSize="16px"
                theme={theme}
                value={response[2]}
                width="100%"
                height="100%"
                setOptions={this.edtrOpt}
              />
            </div>
          ) : (
            <h4>No Code Submitted</h4>
          )}
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
        </div>
      </div>
    );
  }
}
export default ShowResCoding;
