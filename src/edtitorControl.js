import React, { Component } from 'react';
import { langName, langV } from './helpers/lang';
class EditorControl extends Component {
  constructor(props) {
    super();
    this.state = {
      crntLangId: props.crntLangId,
    };
  }
  setEditorSettings = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = {};
    // await import(`ace-builds/src-noconflict/theme-${theme}`);
    for (var pair of formData.entries()) values[pair[0]] = pair[1];
    const { keyCd, crntLangId, setParentCompState, setExamCompState } =
      this.props;
    //
    localStorage.setItem(`crntLangId_${keyCd}`, values.langId);
    localStorage.setItem(`crntCompId_${keyCd}`, values.compId);
    const fontSize = parseInt(values.fontSize);
    localStorage.setItem('fontSize', fontSize);
    //
    const theme = values.edtrTheme;
    localStorage.setItem('theme', theme);
    setExamCompState({
      fontS: fontSize,
      theme: theme,
    });
    let stateObj = { edtrSetting: false };
    if (values.langId) {
      stateObj.crntLangId = parseInt(values.langId);
      stateObj.crntCompId = parseInt(values.compId);
    }
    setParentCompState(
      stateObj,
      crntLangId !== stateObj.crntLangId ? true : false
    );
  };
  constructLangList = (langId) => {
    const content = [];
    if (langId[0] === 0) {
      langId = Object.keys(langName);
      langId.splice(0, 1);
    }
    langId.forEach((each, i) => {
      content.push(
        <option key={i} value={each}>
          {langName[each]}
        </option>
      );
    });
    return content;
  };
  constructCompList = (crntLangId, langId, compId) => {
    let foundAt = langId.indexOf(crntLangId);
    // All Compilers allowed -
    if (foundAt === -1) foundAt = 0;
    let toIterate = compId[foundAt];
    const content = [];
    // If all is allowed
    if (toIterate[0] === 0) toIterate = Object.keys(langV[crntLangId]);
    toIterate.forEach((each, i) => {
      content.push(
        <option key={i} value={each}>
          {langV[crntLangId][each]}
        </option>
      );
    });
    return content;
  };
  render() {
    const { crntCompId, langId, compId, fontS, theme } = this.props;
    const { crntLangId } = this.state;
    return (
      <div id="responseWin">
        <form id="responseDiv" onSubmit={this.setEditorSettings}>
          <table className="editorControl">
            <tbody>
              <tr>
                <td colSpan="2">
                  <h3 className="permHead">Editor Settings</h3>
                </td>
              </tr>
              {langId ? (
                <>
                  <tr>
                    <td>
                      <label htmlFor="langSel">Language -:</label>
                    </td>
                    <td>
                      <select
                        id="langSel"
                        name="langId"
                        defaultValue={crntLangId}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          this.setState({ crntLangId: val });
                        }}
                      >
                        {this.constructLangList(langId)}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="compSel">Compiler -:</label>
                    </td>
                    <td>
                      <select
                        id="compSel"
                        name="compId"
                        defaultValue={crntCompId}
                      >
                        {this.constructCompList(crntLangId, langId, compId)}
                      </select>
                    </td>
                  </tr>
                </>
              ) : null}
              <tr>
                <td>
                  <label htmlFor="codeFont">Text Size -:</label>
                </td>
                <td>
                  <select id="codeFont" name="fontSize" defaultValue={fontS}>
                    <option value="14">Small</option>
                    <option value="16">Medium</option>
                    <option value="18">Large</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="editorTheme">Theme -:</label>
                </td>
                <td>
                  <select
                    id="editorTheme"
                    name="edtrTheme"
                    defaultValue={theme}
                  >
                    <optgroup label="DARK THEMES">
                      <option value="monokai">Monokai</option>
                      <option value="twilight">Twilight</option>
                      <option value="terminal">Terminal</option>
                      <option value="tomorrow_night">Tomorrow Night</option>
                      <option value="merbivore_soft">Merbivore Soft</option>
                      <option value="gruvbox">Gruvbox</option>
                      <option value="chaos">Chaos</option>
                    </optgroup>
                    <optgroup label="LIGHT THEMES">
                      <option value="chrome">Chrome</option>
                      <option value="dawn">Dawn</option>
                      <option value="sqlserver">SQL Server</option>
                      <option value="kuroir">Kuroir</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="textmate">TextMate</option>
                      <option value="iplastic">iPlastic</option>
                    </optgroup>
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <button type="submit" className="btnPrimary">
            Done
          </button>
        </form>
      </div>
    );
  }
}
export default EditorControl;
