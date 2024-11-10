import React, { Component } from "react";
import Questionnaire from "./questinnnaireOpt";
import { notify } from "./../common.js";
class FillInfo extends Component {
  constructor(props) {
    super();
    const { testInfo, open, isFixedDur } = props;
    console.log(props);
    this.state = {
      secInfo: testInfo ? testInfo.secInfo : [["", 1, ""]],
      qsnr: testInfo && testInfo.ques ? testInfo.ques : [],
      open: open,
      isFixedDur: isFixedDur,
      isPool: testInfo ? testInfo.isPool : false,
      sShot: testInfo ? testInfo.scr : 0,
    };
  }
  resOpt = () => {
    return (
      <>
        <option value="0">1080p</option>
        <option value="1">720p</option>
        <option value="2">480p</option>
        <option value="3">360p</option>
        <option value="4">240p</option>
      </>
    );
  };
  increaseSec = () => {
    this.setState((prev) => {
      return prev.secInfo.push(["", 0, ""]);
    });
  };
  chngQsnr = (wh, event, index, delIndex) => {
    // wh - 0 - to change type, 1 - to add a option
    if (wh === "alterQsnr")
      this.setState((prevState) => {
        // event 0 - Add && 1 - Remove
        if (event === 0) prevState.qsnr.push([0, 0, ""]);
        else if (event === 1) prevState.qsnr.splice(index, 1);
        return prevState;
      });
    else if (wh === 0) {
      const val = parseInt(event.target.value);
      this.setState((prevState) => {
        prevState.qsnr[index][0] = val;
        if (val > 2 && val < 6 && !prevState.qsnr[index][3])
          prevState.qsnr[index][3] = [""];
        else if (prevState.qsnr[index][3]) prevState.qsnr[index].pop();
        return prevState;
      });
    } else if (wh === "alterOpt") {
      this.setState((prevState) => {
        // event 0 - Add && 1 - Remove
        if (event === 0) prevState.qsnr[index][3].push("");
        else if (event === 1) prevState.qsnr[index][3].splice(delIndex, 1);
        return prevState;
      });
    }
  };
  prepareTestInfo = (event) => {
    event.preventDefault();
    const { msgHolder } = this.props;
    let formData = new FormData(event.target);
    const values = formData.entries();
    let ti = {};
    // ti for testInfo
    for (const pair of values) {
      ti[pair[0]] = pair[1];
    }
    // Prepare
    let { secInfo, qsnr } = this.state;
    let setStateObj = {};
    // Prepare Basic-Information
    ti.type = parseInt(ti.type);
    setStateObj.strtTime = ti.strtTime;
    delete ti.strtTime;
    setStateObj.endTime = ti.endTime;
    delete ti.endTime;
    setStateObj.isFixedDur = ti.isFixedDur === "true";
    delete ti.isFixedDur;
    setStateObj.open = ti.open === "true";
    delete ti.open;
    if (ti.dur) {
      setStateObj.dur = ti.dur;
      delete ti.dur;
    } else {
      const s = new Date(setStateObj.strtTime).getTime();
      const e = new Date(setStateObj.endTime).getTime();
      const dur = parseInt((e - s) / 60000);
      setStateObj.dur = dur;
    }
    if (ti.reqFScr) ti.reqFScr = 1;
    else ti.reqFScr = 0;
    if (ti.constrained) ti.constrained = 1;
    else ti.constrained = 0;
    if (ti.shuffleOpt) ti.shuffleOpt = 1;
    else ti.shuffleOpt = 0;
    if (ti.isPool) ti.isPool = 1;
    else ti.isPool = 0;
    // Prepare Proctoring Info
    ti.pser = parseInt(ti.pser);
    ti.win = parseInt(ti.win);
    ti.winR = parseInt(ti.winR);
    ti.winF = parseInt(ti.winF);
    ti.cam = parseInt(ti.cam);
    ti.camR = parseInt(ti.camR);
    ti.camF = parseInt(ti.camF);
    ti.mic = parseInt(ti.mic);
    ti.scr = parseInt(ti.scr);
    ti.min = parseInt(ti.min);
    if (isNaN(ti.min)) ti.min = 0;
    ti.max = parseInt(ti.max);
    if (isNaN(ti.max)) ti.max = 0;
    // Auto End
    ti.wfo = parseInt(ti.wfo);
    ti.fsv = parseInt(ti.fsv);
    ti.rsz = parseInt(ti.rsz);
    if (isNaN(ti.wfo)) ti.wfo = 0;
    if (isNaN(ti.fsv)) ti.fsv = 0;
    if (isNaN(ti.rsz)) ti.rsz = 0;
    // Prepare Section Info
    let shuffleSec = [];
    secInfo.forEach((each, index) => {
      let eachSec = [];
      const sNm = `secNm_${index}`,
        sUpto = `secUpto_${index}`,
        sLib = `secLib_${index}`,
        sInfo = `secInfo_${index}`;
      if (ti[sNm] && ti[sUpto]) {
        eachSec.push(ti[sNm]);
        eachSec.push(parseInt(ti[sUpto]));
        if (ti[sLib]) eachSec.push(parseInt(ti[sLib]));
        else eachSec.push(0);
        if (ti[sInfo]) eachSec.push(ti[sInfo]);
        secInfo[index] = eachSec;
      } else {
        if (index === 0) {
          notify(
            msgHolder,
            "e",
            "Section Information can't be Null,<br>Atleast 1 is Required - Test won't work"
          );
          return;
        } else
          notify(
            msgHolder,
            "e",
            "Blank Sec-Data Found.Rest were ignored after that."
          );
        secInfo = secInfo.slice(0, index);
      }
      // Delete
      delete ti[sNm];
      delete ti[sUpto];
      delete ti[sLib];
      delete ti[sInfo];
      const sflChk = `sflSec_${index}`;
      if (ti[sflChk]) shuffleSec.push(1);
      else shuffleSec.push(0);
      delete ti[sflChk];
    });
    ti.secInfo = secInfo;
    ti.shuffleSec = shuffleSec;
    // Prepare Questionaire
    // ignore rest if label found empty
    let ignore = false;
    qsnr.forEach((each, index) => {
      if (ignore) return false;
      const lbl = `qsnrLbl${index}`,
        isReq = `qsnrReq_${index}`;
      if (ti[lbl]) qsnr[index][2] = ti[lbl];
      else {
        notify(
          msgHolder,
          "e",
          `Label-Not Found at position ${
            index + 1
          } - Current and the Rest Ignored`
        );
        ignore = true;
        qsnr = qsnr.slice(0, index);
        return false;
      }
      delete ti[lbl];
      // Options
      let noOpt = false;
      if (each[0] > 2 && each[0] < 6) {
        // Set option array to empty array
        qsnr[index][3] = [];
        for (let i = 0; ; i++) {
          const opt = `qsnrOpt_${index}_${i}`;
          if (ti[opt]) {
            qsnr[index][3].push(ti[opt]);
            delete ti[opt];
          } else {
            // Break loop in case no more exists
            if (ti[opt] === undefined) break;
            // Check for blank options
            if (i === 0) {
              noOpt = true;
              notify(
                msgHolder,
                "e",
                `No Option Exists for Label ${qsnr[index][2]}.<br>This Question was ignored.`
              );
              // Delete array
              qsnr = qsnr.slice(0, index);
            } else {
              // Slice upto Stored Options Ignore Rest
              qsnr[index][3] = qsnr[index][3].slice(0, i);
              notify(
                msgHolder,
                "e",
                `Blank Option Exists for Label ${qsnr[index][2]}.<br>Rest after blank was found was ignored.`
              );
            }
            delete ti[opt];
            break;
          }
        }
      }
      // SetRequired if question is added
      if (ti[isReq]) {
        if (noOpt === false) qsnr[index][1] = 1;
        delete ti[isReq];
      } else if (noOpt === false) qsnr[index][1] = 0;
    });
    if (qsnr.length && qsnr[0][2]) ti.ques = qsnr;
    // Prepare Editor Options
    if (ti.disEdtrDrag) ti.disEdtrDrag = 1;
    else ti.disEdtrDrag = 0;
    if (ti.disEdtrCmnd) ti.disEdtrCmnd = 1;
    else ti.disEdtrCmnd = 0;
    if (ti.disEdtrDrop) ti.disEdtrDrop = 1;
    else ti.disEdtrDrop = 0;
    //
    setStateObj.testInfo = ti;
    //
    this.props.setMainCompState(setStateObj);
    notify(msgHolder, "s", "<h3>Test Information Prepared</h3>");
  };
  render() {
    const { secInfo, qsnr, open, isFixedDur, isPool, sShot } = this.state;
    const { strtTime, endTime, dur, testInfo } = this.props;
    console.log("render-testInfo", testInfo);
    return (
      <form method="post" id="fillInfo" onSubmit={this.prepareTestInfo}>
        <div>
          <div id="basicInfoAdmin">
            <label>Basic Information</label>
            <table>
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="type">This is</label>
                  </td>
                  <td>
                    <select
                      name="type"
                      defaultValue={testInfo ? testInfo.type : 1}
                      id="type"
                    >
                      <option value="1">Test</option>
                      <option value="2">Event</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="ttl">Title</label>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="title"
                      id="ttl"
                      defaultValue={testInfo ? testInfo.title : null}
                      required
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="dttmS">Start Date & Time</label>
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      name="strtTime"
                      id="dttmS"
                      defaultValue={strtTime}
                      required
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="dttmE">
                      {isFixedDur ? "Entry Allowed Till" : "End Date & Time"}
                    </label>
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      name="endTime"
                      id="dttmE"
                      defaultValue={endTime}
                      required
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="durType1">Candidate Appears For -:</label>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <input
                      type="radio"
                      name="isFixedDur"
                      id="durType1"
                      value={false}
                      onChange={(ev) => {
                        if (ev.target.checked)
                          this.setState({ isFixedDur: false });
                      }}
                      defaultChecked={isFixedDur ? false : true}
                    ></input>
                    <label htmlFor="durType1">Full-Time</label>
                    <input
                      type="radio"
                      name="isFixedDur"
                      id="durType2"
                      value={true}
                      onChange={(ev) => {
                        if (ev.target.checked)
                          this.setState({ isFixedDur: true });
                      }}
                      defaultChecked={isFixedDur ? true : false}
                    ></input>
                    <label htmlFor="durType2">Fixed Duration</label>
                  </td>
                </tr>
                {isFixedDur ? (
                  <tr>
                    <td>
                      <label htmlFor="dur">Duration</label>
                    </td>
                    <td>
                      <input
                        type="number"
                        name="dur"
                        id="dur"
                        placeholder="in minutes"
                        defaultValue={dur}
                        style={{ width: "100%" }}
                        required
                      ></input>
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td>
                    <label htmlFor="dttmE">Choose Test Nature</label>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <input
                      type="radio"
                      name="open"
                      id="isOpen1"
                      value={true}
                      onChange={(ev) => {
                        if (ev.target.checked) this.setState({ open: true });
                      }}
                      defaultChecked={open ? true : false}
                    ></input>
                    <label htmlFor="isOpen1">Open for All</label>
                    <input
                      type="radio"
                      name="open"
                      id="isOpen2"
                      value={false}
                      onChange={(ev) => {
                        if (ev.target.checked) this.setState({ open: false });
                      }}
                      defaultChecked={open ? false : true}
                    ></input>
                    <label htmlFor="isOpen2">Invite Only</label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="fscr">Full Screen (if Permitted)</label>
                  </td>
                  <td className="adminCheckbox">
                    <input
                      type="checkbox"
                      name="reqFScr"
                      id="fscr"
                      defaultChecked={
                        testInfo ? (testInfo.reqFScr ? true : false) : false
                      }
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="const">Constrained</label>
                  </td>
                  <td className="adminCheckbox">
                    <input
                      type="checkbox"
                      name="constrained"
                      id="const"
                      defaultChecked={
                        testInfo ? (testInfo.constrained ? true : false) : false
                      }
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="isQPool">Question Pooling</label>
                  </td>
                  <td className="adminCheckbox">
                    <input
                      type="checkbox"
                      name="isPool"
                      id="isQPool"
                      onChange={(e) => {
                        if (e.target.checked) this.setState({ isPool: true });
                        else this.setState({ isPool: !isPool });
                      }}
                      defaultChecked={
                        testInfo ? (testInfo.isPool ? true : false) : false
                      }
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="sflopt">Shuffle Options - (MCQs)</label>
                  </td>
                  <td className="adminCheckbox">
                    <input
                      type="checkbox"
                      name="shuffleOpt"
                      id="sflOpt"
                      defaultChecked={
                        testInfo ? (testInfo.shuffleOpt ? true : false) : false
                      }
                    ></input>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="proctoInfoAdmin">
            <label>Proctoring Information</label>
            <table>
              <thead>
                <tr>
                  <td></td>
                  <td></td>
                  <td>Resolution</td>
                  <td>FPS</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="pSer">Window Proctoring</label>
                  </td>
                  <td>
                    <select
                      name="pser"
                      defaultValue={testInfo ? testInfo.pser : 0}
                      id="pSer"
                    >
                      <option value="0">Basic - Free</option>
                      <option value="1">Advanced - Chargeable</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="winP">Window Proctoring</label>
                  </td>
                  <td>
                    <select
                      name="win"
                      defaultValue={testInfo ? testInfo.win : 0}
                      id="winP"
                    >
                      <option value="0">No Window Proctoring</option>
                      <option value="1">Entire Screen</option>
                      <option value="2">Browser Window Only</option>
                    </select>
                  </td>
                  <td>
                    <select
                      defaultValue={testInfo ? testInfo.winR : 0}
                      name="winR"
                    >
                      {this.resOpt()}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      name="winF"
                      defaultValue={testInfo ? testInfo.winF : 5}
                      required
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="camP">Webcam Proctoring</label>
                  </td>
                  <td>
                    <select
                      name="cam"
                      defaultValue={testInfo ? testInfo.cam : 0}
                      id="camP"
                    >
                      <option value="0">Not Required</option>
                      <option value="1">Optional</option>
                      <option value="2">Required if available (Strict)</option>
                      <option value="3">
                        Required (Not available no Entry)
                      </option>
                    </select>
                  </td>
                  <td>
                    <select
                      defaultValue={testInfo ? testInfo.camR : 0}
                      name="camR"
                    >
                      {this.resOpt()}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      name="camF"
                      defaultValue={testInfo ? testInfo.camF : 5}
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="camP">Microphone Proctoring</label>
                  </td>
                  <td>
                    <select
                      name="mic"
                      defaultValue={testInfo ? testInfo.mic : 0}
                      id="micP"
                    >
                      <option value="0">Not Required</option>
                      <option value="1">Optional</option>
                      <option value="2">Required if available (Strict)</option>
                      <option value="3">
                        Required (Not available no Entry)
                      </option>
                    </select>
                  </td>
                  <td rowSpan={sShot ? 3 : 2} colSpan="2">
                    <pre>
                      FPS:frames per second
                      {sShot ? (
                        <>
                          <br></br>
                          <p>
                            Note-: The same video quality as above<br></br>will
                            be used for screenshots.
                          </p>
                        </>
                      ) : null}
                    </pre>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="scrst">Take Screenshot</label>
                  </td>
                  <td>
                    <select
                      name="scr"
                      defaultValue={testInfo ? testInfo.scr : 0}
                      id="scrst"
                      onChange={(ev) => {
                        this.setState({ sShot: ev.target.selectedIndex });
                      }}
                    >
                      <option value="0">None</option>
                      <option value="1">Window Only</option>
                      <option value="2">Webcam Only</option>
                      <option value="3">Both</option>
                    </select>
                  </td>
                </tr>
                {sShot ? (
                  <tr>
                    <td>
                      <label>Set Interval Range (in secs)</label>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <input
                        type="number"
                        name="min"
                        placeholder="min"
                        defaultValue={testInfo?.min}
                        required
                      ></input>
                      <input
                        type="number"
                        name="max"
                        placeholder="max"
                        defaultValue={testInfo?.max}
                        required
                      ></input>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div id="configAutoEnd">
            <label>Configure Auto-End - leave blank / fill 0 to disable</label>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Other Window</th>
                  <th>Exit Full Screen</th>
                  <th>Resizing Browser</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>End After</td>
                  <td>
                    <input
                      type="number"
                      name="wfo"
                      defaultValue={testInfo?.wfo}
                    ></input>
                  </td>
                  <td>
                    <input
                      type="number"
                      name="fsv"
                      defaultValue={testInfo?.fsv}
                    ></input>
                  </td>
                  <td>
                    <input
                      type="number"
                      name="rsz"
                      defaultValue={testInfo?.rsz}
                    ></input>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="secInfoAdmin">
            <label>Section Information</label>
            <table>
              <thead>
                <tr>
                  <th>Indexing</th>
                  <th>Name</th>
                  <th>Upto qNo</th>
                  {isPool ? <th>Select from Upto</th> : null}
                  <th>Short Info to Candidate (Optional)</th>
                  <th>Shuffle Questions</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {secInfo.map((each, index) => {
                  return (
                    <tr key={index}>
                      <td>{String.fromCharCode(65 + index)}</td>
                      <td>
                        <input
                          type="text"
                          name={`secNm_${index}`}
                          defaultValue={each[0]}
                          required
                        ></input>
                      </td>
                      <td>
                        <input
                          type="number"
                          name={`secUpto_${index}`}
                          defaultValue={each[1]}
                          required
                        ></input>
                      </td>
                      {isPool ? (
                        <td>
                          <input
                            type="number"
                            name={`secLib_${index}`}
                            defaultValue={each[2]}
                          ></input>
                        </td>
                      ) : null}
                      <td>
                        <input
                          type="text"
                          name={`secInfo_${index}`}
                          defaultValue={each[3]}
                        ></input>
                      </td>
                      <td className="adminCheckbox">
                        <input
                          type="checkbox"
                          name={`sflSec_${index}`}
                          defaultChecked={
                            testInfo
                              ? testInfo.shuffleSec[index]
                                ? true
                                : false
                              : false
                          }
                        ></input>
                      </td>
                      <td className="adminCheckbox">
                        {index > 0 ? (
                          <i
                            className="fa fa-trash-o"
                            aria-hidden="true"
                            onClick={() => {
                              this.setState((prevState) => {
                                prevState.secInfo.splice(index, 1);
                                return prevState;
                              });
                            }}
                          ></i>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan={isPool ? 7 : 6} style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btnSecondary"
                      onClick={this.increaseSec}
                    >
                      +1
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="qsnrAdmin">
            <label>Questionnaire</label>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Label</th>
                  <th>Options</th>
                  <th>Required</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {qsnr.map((each, index) => {
                  return (
                    <Questionnaire
                      key={index}
                      crntIndex={index}
                      chngQsnr={this.chngQsnr}
                      crntType={each[0]}
                      qsnr={each}
                    />
                  );
                })}
                <tr>
                  <td colSpan="5" style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => this.chngQsnr("alterQsnr", 0)}
                    >
                      Questionnaire +1
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="edtrOptAdmin">
            <label>Editor Options</label>
            <table>
              <thead>
                <tr>
                  <th>Options</th>
                  <th>Select to Enable</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="disEdtrDrag">
                      Disable Drag Inside Editor
                    </label>
                  </td>
                  <td className="adminCheckbox">
                    <input
                      type="checkbox"
                      name="disEdtrDrag"
                      defaultChecked={
                        testInfo ? (testInfo.disEdtrDrag ? true : false) : false
                      }
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="disEdtrCmnd">
                      Disable All Editor Commands
                    </label>
                  </td>
                  <td className="adminCheckbox">
                    <input
                      type="checkbox"
                      name="disEdtrCmnd"
                      defaultChecked={
                        testInfo ? (testInfo.disEdtrCmnd ? true : false) : false
                      }
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="disEdtrDrop">Disable Drop on Editor</label>
                  </td>
                  <td className="adminCheckbox">
                    <input
                      type="checkbox"
                      name="disEdtrDrop"
                      defaultChecked={
                        testInfo ? (testInfo.disEdtrDrop ? true : false) : false
                      }
                    ></input>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <button className="btnPrimary" type="submit" id="prepareTestInfo">
          Prepare Test-Info
        </button>
      </form>
    );
  }
}
export default FillInfo;
