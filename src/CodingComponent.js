import React, { PureComponent } from 'react';

import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
// Ensure you have at least one mode and theme imported
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';

import EditorControl from './edtitorControl';
import Beautify from 'ace-builds/src-noconflict/ext-beautify';
import { notify, isInViewport } from './common.js';
//
import { extractDefCode } from './helpers/codingQ';
import { edtrColl, resetEdtrColl, mouseDownHandlerH } from './helpers/resizer';
import { langName, edtrMode, langV } from './helpers/lang';

const apiUrl = import.meta.env.VITE_API_URL;
const appEnv = import.meta.env.VITE_APP_ENV;
const isProd = appEnv === 'PROD';

class CodingComponent extends PureComponent {
  constructor(props) {
    super();
    resetEdtrColl(false);
    //
    this.state = {
      isCustInp: false,
      custInpTrigger: false,
      isSubmit: false,
      showOutput: false,
      code: '',
      hideScore: false,
      edtrSetting: false,
    };
    //
    this.objOptCmn = {
      wrap: true,
      readOnly: true,
      dragEnabled: true,
      highlightActiveLine: false,
      highlightGutterLine: false,
      useWorker: false,
      showPrintMargin: false,
    };
    if (props.testInfo.disEdtrDrag) {
      this.objOptCmn = {
        ...this.objOptCmn,
        dragEnabled: false,
      };
      this.optionObj3 = {
        ...this.optionObj3,
        dragEnabled: false,
      };
    }
    this.optionObj1 = {
      minLines: 5,
      maxLines: 15,
      ...this.objOptCmn,
    };
    this.optionObj2 = {
      minLines: 8,
      maxLines: 15,
      ...this.objOptCmn,
    };
    this.optionObj3 = {
      wrap: true,
      minLines: 20,
      maxLines: 300,
      showPrintMargin: false,
    };
    this.optionObj4 = {
      maxLines: 20,
      // showGutter: false,
      ...this.objOptCmn,
    };
    this.restrictCmnd = {
      name: 'breakTheEditor',
      bindKey:
        'ctrl-c|ctrl-v|ctrl-x|ctrl-s|ctrl-shift-v|shift-del|ctrl-h|cmd-c|cmd-v|cmd-x|cmd-s|cmd-h',
      exec: () => {
        if (this.cmndNoti) return;
        notify(this.props.msgHolder, 'e', 'Command Not Allowed');
        this.cmndNoti = true;
        setTimeout(() => {
          this.cmndNoti = false;
        }, 5000);
      },
    };
    this.beautifyCmnd = {
      name: 'beautifyC',
      bindKey: { win: 'Alt-Shift-F', mac: 'Option-Shift+F' },
      exec: () => {
        Beautify.beautify(this.codeEdtr.session);
      },
    };
    //
    this.resizerH1 = React.createRef();
    this.resizerH2 = React.createRef();
    this.resizerH3 = React.createRef();
    //
    this.custInpDiv = React.createRef();
    this.custInpRef = React.createRef();
    this.scoreTable = React.createRef();
    this.memoryUsed = React.createRef();
    this.cpuTime = React.createRef();
    this.testInpBtn = React.createRef();
    this.submitBtn = React.createRef();
    // to stop repeated notification
    // Command Not Allowed Notification
    this.cmndNoti = false;
    // Uncheck Enable Custom Input
    this.uncheck = false;
  }
  static getDerivedStateFromProps(props) {
    const stateObj = {};
    const { myKey, ques } = props;
    let score = 0;
    ques[9].forEach((each) => (score += each));
    stateObj.totalScore = score;
    const key = `${myKey}-${ques.qIndex}`;
    stateObj.keyCd = key;
    // Check if compiler was selected
    const store1 = localStorage.getItem(`crntLangId_${key}`);
    if (store1) stateObj.crntLangId = parseInt(store1);
    else stateObj.crntLangId = ques[4][0] === 0 ? 11 : ques[4][0];
    //
    const store2 = localStorage.getItem(`crntCompId_${key}`);
    if (store2) stateObj.crntCompId = parseInt(store2);
    else
      stateObj.crntCompId =
        ques[4][0] === 0
          ? 1
          : ques[5][0][0] === 0
            ? Object.keys(langV[ques[4][0]])[0]
            : ques[5][0][0];
    //
    return stateObj;
  }
  setParentCompState = (obj, isNewLang) => {
    this.setState(obj);
    if (isNewLang)
      notify(
        this.props.msgHolder,
        's',
        "&starf; New Compiler added.<br>&starf; Don't forget to reset your current code<br>to get default code of current language (if any).",
        10000
      );
  };
  //
  submitCode = async () => {
    // Submit Code that was there at time of button click
    const { code, crntLangId } = this.state;
    //
    this.setState({ isSubmit: true });
    const custInp = this.custInpRef.current;
    if (custInp.checked) {
      custInp.checked = false;
      this.enableCustomInp();
    }
    const status = await this.compileCode();
    this.setState({ isSubmit: false });
    // Update Response
    const { myKey, msgHolder, ques, cdLangId, recRes, setExamCompState } =
      this.props;
    if (status === 0)
      notify(
        msgHolder,
        'e',
        '&starf; Code was not run for Hidden Test Cases but was submitted.<br>&starf; No score was given for this Coding Question.<br>&starf; you may contact your Test Incharge at a later point of time<br>and request for evaluation.',
        10000
      );
    recRes('ansQ', code);
    // Set crnt_Lang_Id
    cdLangId[ques.qIndex] = crntLangId;
    setExamCompState({ cdLangId: cdLangId });
    localStorage.setItem(`${myKey}-cdLngUsd`, JSON.stringify(cdLangId));
  };
  resetMidCode = (userResp) => {
    if (userResp) {
      const { keyCd } = this.state;
      this.props.recRes('nAnsQ', null);
      localStorage.removeItem(keyCd);
      //
      const { chngTCRes, ques } = this.props;
      chngTCRes(ques.qIndex, new Array(ques[8]).fill(0));
      this.forceUpdate();
    }
    this.props.setExamCompState({
      confirm: false,
      confirmCallback: false,
    });
  };
  enableCustomInp = () => {
    const custInpDivS = this.custInpDiv.current.style;
    if (this.custInpRef.current.checked) {
      this.scoreTable.current.style.display = 'none';
      custInpDivS.maxHeight = '50vh';
      setTimeout(() => {
        custInpDivS.overflowY = 'auto';
        custInpDivS.transitionDuration = '0ms';
      }, 350);
      const scrollEle = this.custInpDiv.current;
      if (!isInViewport(scrollEle))
        setTimeout(() => {
          scrollEle.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'end',
          });
        }, 300);
    } else {
      this.setState({ showOutput: false });
      custInpDivS.transitionDuration = '150ms';
      custInpDivS.maxHeight = 0;
      custInpDivS.overflowY = 'hidden';
    }
  };
  displayScore = () => {
    const { hideScore } = this.state;
    if (hideScore === false && this.props.tcR[0] !== null)
      this.scoreTable.current.style.display = 'flex';
    else this.scoreTable.current.style.display = 'none';
  };
  compileCode = async () => {
    const { isCustInp, crntLangId, crntCompId } = this.state;
    const { ques, msgHolder, token } = this.props;
    const crntDefCode = extractDefCode(ques, crntLangId);
    //
    if (isCustInp) this.setState({ isCustInp: false, hideScore: true });
    let formData = new FormData();
    formData.append('target', crntLangId);
    formData.append('useflow', crntCompId);
    let code = this.codeEdtr.getValue();
    if (!code) {
      notify(msgHolder, 'e', '&starf; No Code to Compile.');
      this.setState({ custInpTrigger: false });
      return false;
    }
    if (isCustInp) {
      formData.append('fordata', btoa(this.custInpEdtr.getValue()));
      if (crntDefCode[0]) code = crntDefCode[0] + code;
      if (crntDefCode[1]) code += crntDefCode[1];
    } else {
      // Submit Answer
      this.setState({ code: code });
      if (ques[10]) formData.append('fordata', btoa(ques[10]));
      else formData.append('fordata', '');
      // Upper Code
      if (crntDefCode[2]) code = crntDefCode[2] + code;
      else if (crntDefCode[0]) code = crntDefCode[0] + code;
      // Lower Code
      if (crntDefCode[3]) code += crntDefCode[3];
      else if (crntDefCode[1]) code += crntDefCode[1];
    }
    formData.append('resource', btoa(code));
    formData.append('_csrf', token);
    const formBody = new URLSearchParams(formData).toString();
    try {
      const promise = await fetch(`${apiUrl}/compiler/cV1/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: formBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      this.stdOut.setValue('');
      this.showErr.setValue('');
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        if (response.err) {
          this.showErr.insert(response.err);
          if (response.output) this.stdOut.insert(response.output);
          else this.stdOut.insert('No Output');
          if (!isCustInp)
            this.props.chngTCRes(ques.qIndex, new Array(ques[8]).fill(0));
          this.setState({ showOutput: true });
        } else if (response.output) {
          if (isCustInp) {
            this.stdOut.insert(response.output);
            this.showErr.insert('No Errors');
            this.setState({ showOutput: true });
          } else {
            this.setState({ showOutput: false, hideScore: false });
            this.matchOutput(response.output);
          }
        }
        // to Scroll to OutputDiv scroll its upper div custInpDiv to top
        let scrollEle;
        if (isCustInp) scrollEle = this.custInpDiv.current;
        else {
          scrollEle = this.scoreTable.current;
          scrollEle.style.display = 'flex';
        }
        if (!isInViewport(scrollEle))
          setTimeout(() => {
            scrollEle.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
              inline: 'end',
            });
          }, 300);
        const cpuTimeEle = this.cpuTime.current;
        if (response.time >= 0) cpuTimeEle.innerText = response.time;
        else cpuTimeEle.innerText = '';
        const memoryEle = this.memoryUsed.current;
        if (response.memory >= 0) memoryEle.innerText = response.memory;
        else memoryEle.innerText = '';
      } else if (response.error) {
        notify(msgHolder, 'e', response.error.message);
        if (!isCustInp)
          this.props.chngTCRes(ques.qIndex, new Array(ques[8]).fill(0));
      } else {
        notify(msgHolder, 'e', '');
        return 0;
      }
    } catch (error) {
      notify(
        msgHolder,
        'e',
        '&starf; Code was not Compiled<br>&starf; your Browser failed to connect to Server<br>&starf; Check your Internet Connection'
      );
      return 0;
    } finally {
      this.setState({ custInpTrigger: false });
    }
  };
  matchOutput = (output) => {
    // chngTCRes - Test Case Update Function
    const { chngTCRes, ques, msgHolder } = this.props;
    let tcOut = ques[11];
    if (output.localeCompare(tcOut) === 0) chngTCRes(ques.qIndex, ques[9]);
    else {
      const outputLen = (output.match(/\n/g) || []).length;
      const tcOutLen = (tcOut.match(/\n/g) || []).length;
      let score = {};
      if (outputLen !== tcOutLen)
        notify(
          msgHolder,
          'e',
          "&starf; Output Format Doesn't Match Required Format"
        );
      const eachTCL = tcOutLen / ques[8];
      for (let i = 0; i < ques[8]; i++) {
        let each1, each2, eachScr;
        // Get index of line end for each test cases
        let indexEchOut = output.split('\n', eachTCL).join('\n').length;
        let indexEchTc = tcOut.split('\n', eachTCL).join('\n').length;
        if (!indexEchOut || !indexEchTc) {
          // Mark 0 for rest Test Cases
          for (let j = i; j < ques[8]; j++) score = { ...score, [j]: 0 };
          break;
        }
        each1 = output.slice(0, indexEchOut);
        each2 = tcOut.slice(0, indexEchTc);
        eachScr = ques[9][i];
        if (each1 && each2 && each1 === each2)
          score = { ...score, [i]: eachScr };
        else if (eachTCL > 1) {
          const disScore =
            Math.round((eachScr / eachTCL + Number.EPSILON) * 100) / 100;
          let smlScore = 0;
          for (let j = 0; j < eachTCL; j++) {
            let smlEach1, smlEach2;
            let idxEchOutDis = each1.split('\n', 1).join('\n').length;
            let idxEchTcDis = each2.split('\n', 1).join('\n').length;
            smlEach1 = each1.slice(0, idxEchOutDis + 1);
            smlEach2 = each2.slice(0, idxEchTcDis + 1);
            if (smlEach1 && smlEach2 && smlEach1 === smlEach2)
              smlScore += disScore;
            each1 = each1.slice(idxEchOutDis + 1);
            each2 = each2.slice(idxEchTcDis + 1);
          }
          score = { ...score, [i]: smlScore };
        } else {
          score = { ...score, [i]: 0 };
        }
        output = output.slice(indexEchOut + 1);
        tcOut = tcOut.slice(indexEchTc + 1);
      }
      chngTCRes(ques.qIndex, Object.values(score));
      //
      const scoreTable = this.scoreTable.current;
      scoreTable.style.display = 'flex';
      if (!isInViewport(scoreTable))
        scoreTable.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'end',
        });
    }
  };
  //
  componentDidUpdate() {
    // Overwrite the Option
    this.custInpEdtr.setReadOnly(false);
    //
    const { isCustInp } = this.state;
    if (isCustInp) this.compileCode();
    //
    this.displayScore();
  }

  componentDidMount() {
    this.resizerH1.current.addEventListener('mousedown', mouseDownHandlerH);
    this.resizerH2.current.addEventListener('mousedown', mouseDownHandlerH);
    this.resizerH3.current.addEventListener('mousedown', mouseDownHandlerH);
    // Overwrite the Option
    this.custInpEdtr.setReadOnly(false);
    //
    this.displayScore();
  }
  render() {
    const {
      edtrSetting,
      crntLangId,
      crntCompId,
      isSubmit,
      custInpTrigger,
      showOutput,
      totalScore,
      keyCd,
    } = this.state;
    const mode = edtrMode[crntLangId];
    const {
      crntQIndex,
      testInfo,
      ques,
      response,
      fontS,
      theme,
      setExamCompState,
      tcR,
    } = this.props;
    // Extract Default Code
    const crntDefCode = extractDefCode(ques, crntLangId);
    const editorCode = localStorage.getItem([keyCd])
      ? localStorage.getItem([keyCd])
      : response
        ? response
        : '';
    return (
      <>
        {edtrSetting ? (
          <EditorControl
            fontS={fontS}
            theme={theme}
            keyCd={keyCd}
            setExamCompState={setExamCompState}
            setParentCompState={this.setParentCompState}
            crntLangId={crntLangId}
            crntCompId={crntCompId}
            langId={ques[4]}
            compId={ques[5]}
          />
        ) : null}
        <div id="containerCd">
          <div className="codeContDivs" id="cdContTop">
            <div>
              <u>
                <b>Question No.{crntQIndex + 1}</b>
              </u>
              <span>( Max Score - {totalScore} )</span>
            </div>
            <strong>{ques[1]}</strong>
            <div>
              <p>
                Lang -: {langName[crntLangId]}&nbsp; [{' '}
                {langV[crntLangId][crntCompId]} ]
              </p>
              <i
                className="fa fa-refresh"
                aria-hidden="true"
                title="Reset code & response for this Question"
                onClick={() => {
                  setExamCompState({
                    confirm: 'resetConf',
                    confirmCallback: this.resetMidCode,
                  });
                }}
              ></i>
              <i
                className="fa fa-cog"
                aria-hidden="true"
                onClick={() => {
                  this.setState({ edtrSetting: !edtrSetting });
                }}
              ></i>
            </div>
          </div>
          <div className="codeContDivs" id="qpc">
            <div id="quesCode">
              <p
                dangerouslySetInnerHTML={{
                  __html: ques[2],
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
              {ques[7].map((each, index) => {
                return (
                  <div key={`inpOutEx${index}`}>
                    <h4>Example {index + 1}</h4>
                    {each[0] ? (
                      <>
                        <h5>Standard Input</h5>
                        <AceEditor
                          key={'SI' + crntQIndex}
                          name={'inpE' + index}
                          mode={mode}
                          value={each[0]}
                          fontSize={fontS}
                          theme="chrome"
                          height="100%"
                          width="100%"
                          setOptions={this.optionObj1}
                          onLoad={(editor) => {
                            edtrColl.push(editor);
                            editor.renderer.$cursorLayer.element.style.display =
                              'none';
                          }}
                        />
                      </>
                    ) : null}
                    {each[1] ? (
                      <>
                        <h5>Standard Output</h5>
                        <AceEditor
                          key={'SO' + crntQIndex}
                          name={'outE' + index}
                          mode={mode}
                          value={each[1]}
                          fontSize={fontS}
                          theme="chrome"
                          height="100%"
                          width="100%"
                          setOptions={this.optionObj1}
                          onLoad={(editor) => {
                            edtrColl.push(editor);
                            editor.renderer.$cursorLayer.element.style.display =
                              'none';
                          }}
                        />
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <span ref={this.resizerH1} className="dragMeH"></span>
            <div id="editor">
              {crntDefCode[0] ? (
                <AceEditor
                  key={crntQIndex + 'RO1'}
                  name="readOnlyCode1"
                  mode={mode}
                  value={crntDefCode[0]}
                  fontSize={fontS}
                  theme={theme}
                  width="100%"
                  setOptions={this.optionObj4}
                  commands={testInfo.disEdtrCmnd ? [this.restrictCmnd] : []}
                  onLoad={(editor) => {
                    edtrColl.push(editor);
                    editor.getSession().foldAll();
                    editor.renderer.$cursorLayer.element.style.display = 'none';
                  }}
                />
              ) : null}
              <AceEditor
                key={crntQIndex + 'CD'}
                name="code"
                mode={mode}
                placeholder="Write Your Code Here"
                fontSize={fontS}
                theme={theme}
                value={editorCode ? editorCode : crntDefCode[4]}
                width="100%"
                style={
                  !crntDefCode[0] && !crntDefCode[1]
                    ? { minHeight: '100%' }
                    : {}
                }
                setOptions={this.optionObj3}
                commands={
                  testInfo.disEdtrCmnd
                    ? [this.restrictCmnd, this.beautifyCmnd]
                    : [this.beautifyCmnd]
                }
                onChange={(code) => localStorage.setItem([keyCd], code)}
                onLoad={(editor) => {
                  edtrColl.push(editor);
                  //
                  this.codeEdtr = editor;
                  // Disable Drop
                  if (testInfo.disEdtrDrop) {
                    editor.container.addEventListener(
                      'drop',
                      function (e) {
                        e.stopPropagation();
                      },
                      true
                    );
                  }
                  editor.focus();
                }}
              />
              {crntDefCode[1] ? (
                <AceEditor
                  key={crntQIndex + 'RO2'}
                  name="readOnlyCode2"
                  mode={mode}
                  value={crntDefCode[1]}
                  fontSize={fontS}
                  theme={theme}
                  width="100%"
                  setOptions={this.optionObj4}
                  commands={testInfo.disEdtrCmnd ? [this.restrictCmnd] : []}
                  onLoad={(editor) => {
                    edtrColl.push(editor);
                    editor.getSession().foldAll();
                    editor.renderer.$cursorLayer.element.style.display = 'none';
                  }}
                />
              ) : null}
            </div>
            <span ref={this.resizerH2} className="dragMeH"></span>
            <div id="codeOutput">
              <input
                ref={this.custInpRef}
                type="checkbox"
                id="cInp"
                onChange={this.enableCustomInp}
              />
              <label htmlFor="cInp">&nbsp;Test against Custom Input</label>
              <div id="custInpDiv" ref={this.custInpDiv}>
                <AceEditor
                  key={crntQIndex + 'CI'}
                  name="customInp"
                  mode={mode}
                  fontSize={fontS}
                  theme="chrome"
                  height="100%"
                  width="100%"
                  setOptions={this.optionObj2}
                  onLoad={(editor) => {
                    edtrColl.push(editor);
                    this.custInpEdtr = editor;
                  }}
                />
                <button
                  ref={this.testInpBtn}
                  id="executeBtn"
                  type="button"
                  onClick={() => {
                    this.setState({
                      isCustInp: true,
                      custInpTrigger: true,
                      isSubmit: false,
                    });
                  }}
                  disabled={isSubmit || custInpTrigger ? true : false}
                >
                  Test{' '}
                  {custInpTrigger ? (
                    <i className="fa fa-spinner" aria-hidden="true"></i>
                  ) : null}
                </button>
              </div>
              {showOutput ? <h4>Output:</h4> : null}
              <AceEditor
                key={crntQIndex + 'SO'}
                name="stdout"
                mode={mode}
                fontSize={fontS}
                theme="chrome"
                width="100%"
                style={showOutput ? { display: 'block' } : { display: 'none' }}
                setOptions={this.optionObj2}
                onLoad={(editor) => {
                  this.stdOut = editor;
                  edtrColl.push(editor);
                  editor.renderer.$cursorLayer.element.style.display = 'none';
                }}
              />
              {showOutput ? <h4>Errors :</h4> : null}
              <AceEditor
                key={crntQIndex + 'EC'}
                name="errors"
                mode={mode}
                fontSize={fontS}
                theme="chrome"
                width="100%"
                style={showOutput ? { display: 'block' } : { display: 'none' }}
                setOptions={this.optionObj2}
                onLoad={(editor) => {
                  this.showErr = editor;
                  edtrColl.push(editor);
                  editor.renderer.$cursorLayer.element.style.display = 'none';
                }}
              />
              <div id="scoreTable" ref={this.scoreTable} key={crntQIndex}>
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
            </div>
            <span ref={this.resizerH3} className="dragMeH"></span>
            <span></span>
          </div>
          <div className="codeContDivs" id="cdContBtm">
            <div>
              <p>
                Memory Used-:<span ref={this.memoryUsed}></span>kb
                &nbsp;&nbsp;CPU Time-:
                <span ref={this.cpuTime}></span>sec
              </p>
            </div>
            <button
              className="btnPrimary"
              ref={this.submitBtn}
              type="button"
              onClick={this.submitCode}
              disabled={isSubmit || custInpTrigger ? true : false}
            >
              Submit{' '}
              {isSubmit ? (
                <i className="fa fa-spinner" aria-hidden="true"></i>
              ) : null}
            </button>
          </div>
        </div>
      </>
    );
  }
}
export default CodingComponent;
