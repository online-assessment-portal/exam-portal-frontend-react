import React, { Component } from "react";
// JS
import NavBar from "./../navbar";
import QBankPrepare from "./QBankPrepare";
import PrepareResult from "./PrepareResult";
import FillInfo from "./fillInfo";
import Invite from "./inviteComp";
import { notify } from "./../common.js";
//
import { dateTimeFormat } from "./../helpers/dateTimeFormat";
//
import "./layout.css";

const apiUrl = process.env.REACT_APP_API_URL;

class ExamAdmin extends Component {
  constructor() {
    super();
    this.state = {
      process: false,
      loggedIn: false,
      action: 0,
      display: 0,
      strtTime: null,
      endTime: null,
      open: true,
      isFixedDur: false,
      dur: null,
      passcode: "",
      testInfo: null,
      qBank: [],
      crctOptArr: [],
      last10Test: [],
    };
    //
    this.passCode = React.createRef();
    this.msgHolder = React.createRef();
  }

  setMainCompState = (obj) => {
    this.setState(obj);
  };
  formDataToUrlEnc = (formData) => {
    const formDataArr = [...formData.entries()];
    const urlenc = formDataArr
      .map((x) => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
      .join("&");
    return urlenc;
  };
  authAdmin = async (event = false, token) => {
    if (event) {
      event.preventDefault();
      token = this.state.token;
    }
    let formData;
    if (event) formData = new FormData(event.target);
    else formData = new FormData();
    formData.append("_csrf", token);
    const formBody = new URLSearchParams(formData).toString();
    try {
      const promise = await fetch(`${apiUrl}/admin/authAdmin/`, {
        method: "POST",
        body: formBody ? formBody : "",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        if (response.notify) {
          delete response.notify;
          notify(this.msgHolder, "s", response.notify);
        }
        const last10Test = response.last10Test;
        last10Test.forEach((each, index) => {
          each.strtTime = dateTimeFormat(each.strtTime);
          each.endTime = dateTimeFormat(each.endTime);
          last10Test[index] = each;
        });
        response.last10Test = last10Test;
        //
        response.mailAcc = JSON.parse(response.mailAcc);
        //
        this.setState(response);
      } else if (response.error)
        this.setState({ loggedIn: response.error.message });
      // notify(this.msgHolder, "e", );
      else notify(this.msgHolder, "e", "");
    } catch (error) {
      notify(
        this.msgHolder,
        "e",
        "SERVER Connection Error<br>Check your Internet Connection"
      );
      return;
    }
  };
  genKey = () => {
    let str = "";
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    for (let i = 0; i < 10; i++) {
      if (i < 4) {
        const char = alphabet.charAt(Math.floor(Math.random() * 24));
        str += char;
      } else {
        str += Math.floor(Math.random() * 10);
      }
    }
    this.setState({
      passcode: str,
    });
  };
  //
  setLoadTest = (response, isFetched) => {
    this.setState((prevState) => {
      prevState.display = 1;
      if (isFetched) {
        prevState.strtTime = dateTimeFormat(response.strtTime);
        prevState.endTime = dateTimeFormat(response.endTime);
      } else {
        prevState.strtTime = response.strtTime;
        prevState.endTime = response.endTime;
      }
      prevState.open = response.open;
      prevState.isFixedDur = response.isFixedDur;
      prevState.dur = parseInt(response.dur);
      prevState.testInfo = JSON.parse(response.testInfo);
      prevState.qBank = JSON.parse(response.qBank);
      prevState.crctOptArr = JSON.parse(response.crctOpt);
      return prevState;
    });
  };
  //
  fetchTestData = async (event) => {
    event.preventDefault();
    const passcode = this.passCode.current.value;
    if (passcode) {
      const { last10Test } = this.state;
      for (let i = 0; i < last10Test.length; i++) {
        const each = last10Test[i];
        if (each.passcode === passcode) {
          this.setLoadTest(each, false);
          return true;
        }
      }
    } else {
      notify(this.msgHolder, "e", "Please enter Passcode to Load.");
      return false;
    }
    //
    try {
      const promise = await fetch(`${apiUrl}/admin/loadTestData/`, {
        method: "POST",
        body: `passcode=${passcode}&_csrf=${this.state.token}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true)
        this.setLoadTest(response, true);
      else if (response.error)
        notify(this.msgHolder, "e", response.error.message);
      else notify(this.msgHolder, "e", "");
    } catch (error) {
      notify(this.msgHolder, "e", error);
    }
  };
  //
  uploadTestData = async () => {
    try {
      let isUpdate = false;
      const formData = new FormData();
      // Create Section Info
      if (
        window.confirm(
          "Are you Updating Test Data\nOK- Updating\nCancel- Creating New"
        )
      ) {
        isUpdate = true;
        formData.append("isUpdt", true);
      } else formData.append("isUpdt", false);
      const {
        strtTime,
        endTime,
        open,
        isFixedDur,
        dur,
        qBank,
        crctOptArr,
        org,
        img,
        imgUpKey,
        token,
      } = this.state;
      let { passcode, testInfo, last10Test } = this.state;
      if (testInfo === null) {
        notify(this.msgHolder, "e", "Test Info is not prepared");
        return;
      } else if (qBank.length === 0) {
        notify(this.msgHolder, "e", "Question Bank is not prepared");
        return;
      } else if (passcode === null) {
        const val = this.passCode.current.value;
        if (val) passcode = val;
        else {
          notify(this.msgHolder, "e", "Pass-Code is NULL");
          return;
        }
      }
      testInfo.org = org;
      testInfo.img = img;
      testInfo.imgUpKey = imgUpKey;
      const testInfoJ = JSON.stringify(testInfo);
      const qBankJ = JSON.stringify(qBank);
      const crctOptArrJ = JSON.stringify(crctOptArr);
      formData.append("strtTime", strtTime);
      formData.append("endTime", endTime);
      formData.append("open", open);
      formData.append("isFixedDur", isFixedDur);
      formData.append("dur", dur);
      formData.append("passcode", passcode);
      formData.append("testInfo", testInfoJ);
      formData.append("qBank", qBankJ);
      formData.append("crctOpt", crctOptArrJ);
      formData.append("_csrf", token);
      const formBody = new URLSearchParams(formData).toString();
      const promise = await fetch(`${apiUrl}/admin/upload_testData/`, {
        method: "POST",
        body: formBody,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        // Clear local-Storage for Default Codes
        localStorage.clear();
        //
        notify(this.msgHolder, "s", response.msg);
        if (isUpdate) {
          for (let i = 0; i < last10Test.length; i++) {
            const each = last10Test[i];
            if (each.passcode === passcode) {
              each.strtTime = strtTime;
              each.endTime = endTime;
              each.open = open;
              each.isFixedDur = isFixedDur;
              each.dur = dur;
              each.testInfo = testInfoJ;
              each.qBank = qBankJ;
              each.crctOpt = crctOptArrJ;
              last10Test[i] = each;
              break;
            }
          }
        } else {
          const obj = {
            passcode: passcode,
            status: 0,
            strtTime: strtTime,
            endTime: endTime,
            open: open,
            isFixedDur: isFixedDur,
            dur: dur,
            testInfo: testInfoJ,
            qBank: qBankJ,
            crctOpt: crctOptArrJ,
          };
          last10Test.push(obj);
        }
        this.setState({ last10Test: last10Test });
      } else if (response.error)
        notify(this.msgHolder, "e", response.error.message, 10000);
      else notify(this.msgHolder, "e", "");
    } catch (error) {
      notify(this.msgHolder, "e", error.stack);
    }
  };
  //
  reqLogout = async () => {
    try {
      const promise = await fetch(`${apiUrl}/logout/`, {
        method: "POST",
        body: `_csrf=${this.state.token}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        this.setState({
          loggedIn: false,
          action: 0,
          display: 0,
        });
      } else if (response.error)
        notify(this.msgHolder, "e", response.error.message);
      else notify(this.msgHolder, "e", "");
    } catch (error) {
      notify(
        this.msgHolder,
        "e",
        "Something went wrong.<br>OR<br>Unable to connect to Server"
      );
    }
  };
  componentDidMount() {
    const adminInfo = JSON.parse(document.getElementById("userInfo").innerText);
    if (adminInfo.loggedIn) this.authAdmin(false, adminInfo.token);
    this.setState(adminInfo);
    document.title = "Exam_Admin";
  }
  //
  render() {
    const {
      loggedIn,
      img,
      org,
      action,
      display,
      last10Test,
      passcode,
      strtTime,
      endTime,
      open,
      isFixedDur,
      dur,
      testInfo,
      qBank,
      crctOptArr,
      token,
    } = this.state;
    if (loggedIn !== true) {
      return (
        <div id="adminLogin">
          <div id="msgHolder" ref={this.msgHolder}></div>
          <NavBar />
          <div>
            <form method="post" onSubmit={this.authAdmin} id="adminLoginForm">
              <h3>Admin Login</h3>
              <label htmlFor="uname">Enter Username / Email</label>
              <input
                id="uname"
                type="text"
                name="uname"
                maxLength="50"
                required
              ></input>
              <label htmlFor="pswd">Enter Password</label>
              <input
                id="pswd"
                type="password"
                name="password"
                maxLength="16"
                required
              ></input>
              {loggedIn !== false ? (
                <>
                  <br></br>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: loggedIn,
                    }}
                  ></p>
                  <br></br>
                </>
              ) : (
                <br></br>
              )}
              <button type="submit" className="btnPrimary">
                Sign-In
              </button>
            </form>
          </div>
        </div>
      );
    }
    return (
      <>
        <NavBar img={img} org={org} logOut={this.reqLogout} />
        <div id="msgHolder" ref={this.msgHolder}></div>
        <div id="briefAdmin">
          <table id="hostedTest">
            <thead>
              <tr>
                <th>Passcode</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Nature</th>
                <th>Cand. Appears</th>
                <th>Duration (in min)</th>
                <th>Status</th>
                <th>Link</th>
                <th>Proctor</th>
              </tr>
            </thead>
            <tbody>
              {last10Test.length ? (
                last10Test.map((each, index) => {
                  return (
                    <tr key={index}>
                      <td>{each.passcode}</td>
                      <td>
                        <input
                          type="datetime-local"
                          value={each.strtTime}
                          readOnly
                        ></input>
                      </td>
                      <td>
                        <input
                          type="datetime-local"
                          value={each.endTime}
                          readOnly
                        ></input>
                      </td>
                      <td>{each.open ? "Open for All" : "Invite Only"}</td>
                      <td>
                        {each.isFixedDur ? "Fixed Duration" : "Full-Time"}
                      </td>
                      <td>{each.dur}</td>
                      <td>
                        {each.status === 0
                          ? "Ready"
                          : each.status === 1
                          ? "Result Uploaded"
                          : null}
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            window.prompt(
                              "Exam Link",
                              `https://shredtest.cf/test?passcode=${each.passcode}`
                            )
                          }
                        >
                          Link
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            window.open(
                              `https://shredtest.cf/monitor?proctor=${each.passcode}`
                            )
                          }
                        >
                          go
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9">No Hosted Test</td>
                </tr>
              )}
            </tbody>
          </table>
          <div>
            <p></p>
            <p></p>
            <button
              type="button"
              className="btnSecondary"
              onClick={() => this.setState({ action: 1 })}
            >
              Host New / Update
            </button>
            <button
              type="button"
              className="btnSecondary"
              onClick={() => this.setState({ action: 2 })}
            >
              Prepare Result
            </button>
            <p></p>
            <p></p>
          </div>
        </div>
        {action === 1 ? (
          <>
            <form method="post" id="keyControl" onSubmit={this.fetchTestData}>
              <div>
                <label>Passcode-: </label>
                <input
                  ref={this.passCode}
                  type="text"
                  name="code"
                  autoComplete="off"
                  minLength="10"
                  maxLength="10"
                  value={passcode}
                  onChange={(ev) => {
                    this.setState({ passcode: ev.target.value.toUpperCase() });
                  }}
                  required
                ></input>
              </div>
              <button
                type="button"
                className="btnSecondary"
                onClick={this.genKey}
              >
                Generate Key
              </button>
              <button type="submit" className="btnSecondary">
                Load Data
              </button>
            </form>
            <div id="prepareTest">
              <button
                type="button"
                onClick={() => {
                  this.setState({ display: 1 });
                }}
              >
                Step 1 - Fill Information
              </button>
              <button
                type="button"
                onClick={() => {
                  this.setState({ display: 2 });
                }}
              >
                Step 2 - Prepare Question Bank
              </button>
              <button type="button" onClick={this.uploadTestData}>
                Upload to Bank
              </button>
              {testInfo !== null ? (
                <button
                  type="button"
                  onClick={() => {
                    this.setState({ display: 3 });
                  }}
                >
                  Invite
                </button>
              ) : null}
            </div>
            {display === 1 ? (
              <FillInfo
                setMainCompState={this.setMainCompState}
                strtTime={strtTime}
                endTime={endTime}
                open={open}
                isFixedDur={isFixedDur}
                dur={dur}
                testInfo={testInfo}
                msgHolder={this.msgHolder}
              />
            ) : display === 2 ? (
              <QBankPrepare
                setMainCompState={this.setMainCompState}
                qBank={qBank}
                crctOptArr={crctOptArr}
                msgHolder={this.msgHolder}
              />
            ) : display === 3 ? (
              <Invite
                mailAcc={this.state.mailAcc}
                testInfo={testInfo}
                passcode={passcode}
                strtTime={strtTime}
                endTime={endTime}
                isFixedDur={isFixedDur}
                isOpen={open}
                dur={dur}
                msgHolder={this.msgHolder}
                token={token}
              />
            ) : null}
          </>
        ) : action === 2 ? (
          <PrepareResult msgHolder={this.msgHolder} token={token} />
        ) : null}
      </>
    );
  }
}
export default ExamAdmin;
