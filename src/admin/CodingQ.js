import React, { PureComponent } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/ext-language_tools';
//
import { langName, edtrMode, langV } from './../helpers/lang';
class CodingQ extends PureComponent {
  constructor(props) {
    super();
    // In case prepared question is loaded
    if (props.ques[2]) {
      let scoreStr = '';
      props.ques[9].forEach((score) => {
        scoreStr += score + '-';
      });
      this.state = {
        langId: props.ques[4],
        verId: props.ques[5],
        example: props.ques[7],
        fascilate: props.ques[7].length,
        tcScr: scoreStr,
        crntSel: props.ques[4][0],
      };
      // Set local-Storage for default codes
      const keyPrefix = ['urc', 'lrc', 'urs', 'lrs', 'defCd'];
      const qNo = props.qNo;
      props.ques[6].forEach((eachDef, i1) => {
        keyPrefix.forEach((prefix, i2) => {
          if (eachDef[i2])
            localStorage.setItem(
              `${qNo}${prefix}_${props.ques[4][i1]}`,
              eachDef[i2]
            );
        });
      });
    } else
      this.state = {
        example: [['', '']],
        fascilate: 0,
        tcScr: '',
        crntSel: 0,
        langId: [0],
        verId: [[0]],
      };
    //
    this.edtrOpt = {
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
    };
    this.qTitle = React.createRef();
    this.qText = React.createRef();
    this.expl = React.createRef();
    this.compSelector = React.createRef();
    this.tcScr = React.createRef();
  }
  assignCompiler = () => {
    const { crntSel, langId, verId } = this.state;
    //
    const isAdded = langId.indexOf(crntSel);
    const compSelected = parseInt(this.compSelector.current.value);
    // In case of new Lang
    let stateObj = {};
    if (isAdded === -1) {
      if (crntSel === 0) {
        stateObj.langId = [0];
        stateObj.verId = [[0]];
      } else {
        if (langId[0] === 0) {
          stateObj.langId = [];
          stateObj.verId = [];
        }
        langId.push(crntSel);
        verId.push([compSelected]);
        stateObj.langId = langId;
        stateObj.verId = verId;
      }
    } else {
      if (compSelected === 0) verId[isAdded] = [0];
      else if (verId[isAdded].indexOf(compSelected) === -1) {
        // If all was added and later being changed
        if (verId[isAdded][0] === 0) verId[isAdded] = [];
        verId[isAdded].push(compSelected);
        stateObj.verId = verId;
      } else return false;
    }
    this.setState(stateObj, this.forceUpdate);
  };
  deleteCompiler = (langKey, verI) => {
    let { langId, verId } = this.state;
    // Remove Compiler Version
    const langI = langId.indexOf(langKey);
    const toRmv = verId[langI];
    if (toRmv.length === 1) {
      verId.splice(langI, 1);
      langId.splice(langI, 1);
    } else verId[langI].splice(verI, 1);
    //
    this.setState((prevState) => {
      prevState.langId = langId;
      prevState.verId = verId;
      return prevState;
    }, this.forceUpdate);
  };
  compilerSel = (e) => {
    const selector = e.target;
    this.setState({ crntSel: parseInt(selector.value) });
  };
  showAddedCompList = (langId, verId) => {
    let key = 1;
    const pushTable = (col1, col2, langKey, verI) => {
      contents.push(
        <tr key={key++}>
          <td>{col1}</td>
          <td>{col2 ? col2 : 'All'}</td>
          <td>
            {col1 === 0 ? null : (
              <i
                className="fa fa-trash-o"
                aria-hidden="true"
                onClick={() => {
                  this.deleteCompiler(langKey, verI);
                }}
              ></i>
            )}
          </td>
        </tr>
      );
    };
    const contents = [];
    langId.forEach((each, i) => {
      pushTable(langName[each], langV[each][verId[i][0]], each, 0);
      for (let j = 1; j < verId[i].length; j++)
        pushTable('', langV[each][verId[i][j]], each, j);
    });
    return contents;
  };
  constructLangOpt = () => {
    const content = [];
    for (const key in langName) {
      if (Object.hasOwnProperty.call(langName, key)) {
        const each = langName[key];
        content.push(
          <option key={key} value={key} data-mode={edtrMode[key]}>
            {each}
          </option>
        );
      }
    }
    return content;
  };
  constructCompOpt = () => {
    const content = [],
      { crntSel } = this.state;
    const compList = langV[crntSel];
    if (crntSel > 0)
      content.push(
        <option key={0} value="0">
          All
        </option>
      );
    for (const key in compList) {
      if (Object.hasOwnProperty.call(compList, key)) {
        const each = compList[key];
        content.push(
          <option key={key} value={key} data-mode={edtrMode[key]}>
            {each}
          </option>
        );
      }
    }
    return content;
  };
  insert = () => {
    const { langId, verId, example } = this.state;
    const { qNo, insert } = this.props;
    let arr = [];
    arr.push('C');
    arr.push(this.qTitle.current.value);
    arr.push(this.qText.current.value);
    arr.push(this.expl.current.value);
    arr.push(langId);
    arr.push(verId);
    // Push Default Code Mid - for Each Language
    const keyPrefix = ['urc', 'lrc', 'urs', 'lrs', 'defCd'];
    const defCode = [];
    langId.forEach((eachLang) => {
      const eachLangDef = [];
      keyPrefix.forEach((prefix) => {
        let code = localStorage.getItem(`${qNo}${prefix}_${eachLang}`);
        if (!code) code = '';
        eachLangDef.push(code);
      });
      defCode.push(eachLangDef);
    });
    arr.push(defCode);
    // Prepare Example Array
    let prepExample = [];
    example.forEach((each) => {
      if (!each[0] && !each[1]) return;
      prepExample.push(each);
    });
    arr.push(prepExample);
    // Prepare Test-Case Array
    let inpScr = this.tcScr.current.value;
    let tcScr = [],
      notc = 0;
    if (inpScr.lastIndexOf('-') !== inpScr.length - 1) {
      alert('Invalid Format of TestCase Score');
      return;
    }
    while (inpScr) {
      const pos = inpScr.search('-');
      tcScr.push(parseInt(inpScr.slice(0, pos)));
      inpScr = inpScr.slice(pos + 1);
      notc++;
    }
    arr.push(notc);
    arr.push(tcScr);
    arr.push(this.stdInp.getValue());
    arr.push(this.stdOut.getValue());
    insert(qNo, arr);
  };
  addExample = () => {
    this.setState((prevState) => {
      prevState.example.push(['', '']);
      return prevState;
    });
    this.setState((prevState) => {
      prevState.fascilate++;
      return prevState;
    });
  };
  render() {
    const { qNo, ques, deleteQ } = this.props;
    const { crntSel, langId, verId, example } = this.state;
    const mode = edtrMode[crntSel];
    return (
      <fieldset>
        <legend>
          Question No.{qNo}-Coding -
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
            <label htmlFor={'qTitle' + qNo}>Title</label>
            <input
              ref={this.qTitle}
              type="text"
              id={'qTitle' + qNo}
              defaultValue={ques[1] ? ques[1] : null}
            ></input>
            <label htmlFor={'qText' + qNo}>Main Text</label>
            <textarea
              ref={this.qText}
              id={'qText' + qNo}
              cols="50"
              rows="6"
              defaultValue={ques[2] ? ques[2] : null}
            ></textarea>
            <label htmlFor={'expl' + qNo}>Explanation Text</label>
            <textarea
              ref={this.expl}
              id={'expl' + qNo}
              cols="50"
              rows="10"
              defaultValue={ques[3] ? ques[3] : null}
            ></textarea>
          </div>
          <div>
            <table>
              <tbody id="addedComp">
                <tr>
                  <td>Lang</td>
                  <td>Compiler Ver</td>
                  <td></td>
                </tr>
                {this.showAddedCompList(langId, verId)}
              </tbody>
            </table>
            <label htmlFor={'lang' + qNo}>Select Language</label>
            <select
              id={'lang' + qNo}
              defaultValue={crntSel}
              onChange={this.compilerSel}
            >
              {this.constructLangOpt()}
            </select>
            <label htmlFor={'comp' + qNo}>Select Compiler</label>
            <select ref={this.compSelector} id={'comp' + qNo}>
              {this.constructCompOpt()}
            </select>
            <button
              className="btnSecondary"
              type="button"
              onClick={this.assignCompiler}
            >
              Assign Compiler
            </button>
            <label htmlFor={'tcScr' + qNo}>TestCases Score(5-10-15-)</label>
            <input
              ref={this.tcScr}
              type="text"
              id={'tcScr' + qNo}
              defaultValue={this.state.tcScr}
            ></input>
          </div>
        </div>
        {example.map((each, index) => {
          return (
            <div className="edtr_row" key={index}>
              <div>
                <label>Standard Input Ex-{index + 1}</label>
                <AceEditor
                  key={qNo + 'SI' + index}
                  name={'stdinE' + index}
                  mode={mode}
                  value={each[0]}
                  fontSize={18}
                  theme="chrome"
                  height="100%"
                  width="100%"
                  onChange={(val) => (example[index][0] = val)}
                  onLoad={(editor) => {
                    this.stdInpE = editor;
                  }}
                />
              </div>
              <div>
                <label>Standard Output Ex-{index + 1}</label>
                <AceEditor
                  key={qNo + 'SO' + index}
                  name={'expOutE' + index}
                  mode={mode}
                  value={each[1]}
                  fontSize={18}
                  theme="chrome"
                  height="100%"
                  width="100%"
                  onChange={(val) => (example[index][1] = val)}
                  onLoad={(editor) => {
                    this.stdOutE = editor;
                  }}
                />
              </div>
            </div>
          );
        })}
        <button
          className="btnSecondary"
          type="button"
          onClick={this.addExample}
        >
          Add Example Inp-Output
        </button>
        <p style={{ textAlign: 'center' }}>
          <u>Confirgure Default Codes for {langName[crntSel]}</u>
        </p>
        <div className="edtr_row">
          <div>
            <label>Upper Readable Candidate</label>
            <AceEditor
              key={qNo + 'RO1'}
              name="readOnlyCode1"
              mode={mode}
              fontSize={18}
              theme="monokai"
              height="100%"
              width="100%"
              setOptions={this.edtrOpt}
              // urc - lower readable candidate
              value={localStorage.getItem(`${qNo}urc_${crntSel}`)}
              onChange={(code) => {
                localStorage.setItem(`${qNo}urc_${crntSel}`, code);
              }}
            />
          </div>
          <div>
            <label>Upper Readable Server</label>
            <AceEditor
              key={qNo + 'RO1'}
              name="upCode"
              mode={mode}
              fontSize={18}
              theme="monokai"
              height="100%"
              width="100%"
              setOptions={this.edtrOpt}
              // urs - upper readable server
              value={localStorage.getItem(`${qNo}urs_${crntSel}`)}
              onChange={(code) => {
                localStorage.setItem(`${qNo}urs_${crntSel}`, code);
              }}
            />
          </div>
        </div>
        <div className="edtr_row">
          <div>
            <label>Lower Readable Candidate</label>
            <AceEditor
              key={qNo + 'RO2'}
              name="readOnlyCode2"
              mode={mode}
              fontSize={18}
              theme="monokai"
              height="100%"
              width="100%"
              setOptions={this.edtrOpt}
              // lrc - lower readable Candidate
              value={localStorage.getItem(`${qNo}lrc_${crntSel}`)}
              onChange={(code) => {
                localStorage.setItem(`${qNo}lrc_${crntSel}`, code);
              }}
            />
          </div>
          <div>
            <label>Lower Readable Server</label>
            <AceEditor
              key={qNo + 'RO2'}
              name="dnCode"
              mode={mode}
              fontSize={18}
              theme="monokai"
              height="100%"
              width="100%"
              setOptions={this.edtrOpt}
              // lrs - lower readable server
              value={localStorage.getItem(`${qNo}lrs_${crntSel}`)}
              onChange={(code) => {
                localStorage.setItem(`${qNo}lrs_${crntSel}`, code);
              }}
            />
          </div>
        </div>
        <div className="edtr_row">
          <div>
            <label>Default Code - Mid</label>
            <AceEditor
              key={qNo + 'defMid' + crntSel}
              name="defCode" // default-Code
              mode={mode}
              fontSize={18}
              theme="monokai"
              height="100%"
              width="100%"
              setOptions={this.edtrOpt}
              value={localStorage.getItem(`${qNo}defCd_${crntSel}`)}
              onChange={(code) => {
                localStorage.setItem(`${qNo}defCd_${crntSel}`, code);
              }}
            />
          </div>
          <div className="edtr_row codingInsrtBtn">
            <button
              className="btnSecondary"
              type="button"
              onClick={this.insert}
            >
              Insert Q
            </button>
          </div>
        </div>
        <div className="edtr_row">
          <div>
            <label>Standard Input-Server</label>
            <AceEditor
              key={qNo + 'CI'}
              name="stdInp"
              mode={mode}
              value={ques[10]}
              fontSize={18}
              theme="chrome"
              height="100%"
              width="100%"
              onLoad={(editor) => {
                this.stdInp = editor;
              }}
            />
          </div>
          <div>
            <label>Standard Output-Server</label>
            <AceEditor
              key={qNo + 'CI'}
              name="stdOut"
              mode={mode}
              value={ques[11]}
              fontSize={18}
              theme="chrome"
              height="100%"
              width="100%"
              onLoad={(editor) => {
                this.stdOut = editor;
              }}
            />
          </div>
        </div>
      </fieldset>
    );
  }
}
export default CodingQ;
