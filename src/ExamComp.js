import React, { Component } from 'react';
// CSS
import './navbar.css';
import './reqExamCd.css';
import './testInfo.css';
import './reqResponse.css';
import './form.css';
import './allBtns.css';
import './topBar.css';
import './examPage.css';
import './mcq.css';
import './exmPgCmn.css';
import './exmPgC.css';
import './exmPgH.css';
import './htmlEditor.css';
import './notify.css';
//
// import { checkDev } from './detectDev';
//
import { storeError, notify, cjoinQbank } from './common.js';
//
import Peer from 'peerjs';
import { io } from 'socket.io-client';
// JS
import AuthPage from './pages/User/Auth/index.jsx';
import ReqExamCode from './reqExamCd';
import ToStart from './toStart';
import Facilitate from './facilitate';
import ReqResponse from './reqResponse.js';
import Navigator from './navigator';
import McqComponent from './McqComponent';
import HTMLComponent from './HTMLComponent';
import CodingComponent from './CodingComponent';
//
import ChatComp from './ChatComponent';
import FeedbackForm from './feedback';

const apiUrl = import.meta.env.VITE_API_URL;
const appEnv = import.meta.env.VITE_APP_ENV;
const isProd = appEnv === 'PROD';

const peerjsHost = import.meta.env.VITE_PEERJS_URL;
const peerjsPort = import.meta.env.VITE_PEERJS_PORT;

class ExamComp extends Component {
  constructor() {
    super();
    const stateObj = {
      loggedIn: false,
      verify: -1,
      isLive: false,
      confirm: false,
      confirmCallback: false,
      tcRes: {},
      cdLangId: {},
      err: false,
      reqErr: '',
      reqFScr: false,
      toStartShow: false,
      resQuestionnaire: false,
      //
      myBrowser: false,
      notFullWidth: false,
      isFullScr: false,
      fsNotSupp: false,
      //
      cameraP: 0,
      micP: 0,
      candStream: null,
      scrnStream: null,
      candStandCam: 0,
      candStandScrn: 0,
      // 0 - No Stand , 1 - Denied , 2 - Event Listner Added
      chat: false,
    };
    //
    const store1 = localStorage.getItem('fontSize');
    if (store1) stateObj.fontS = parseInt(store1);
    else stateObj.fontS = 14;
    const store2 = localStorage.getItem('theme');
    if (store2) stateObj.theme = store2;
    else stateObj.theme = 'chrome';
    //
    this.state = stateObj;
    //
    this.resColl = [
      { w: 1920, h: 1080 },
      { w: 1280, h: 720 },
      { w: 854, h: 480 },
      { w: 640, h: 360 },
      { w: 426, h: 240 },
    ];
    this.adminDataConn = null;
    this.adminMediaConn = [];
    this.retry = 0;
    this.msgHolder = React.createRef();
    // To store currently removing message
    this.crntHide = null;
    this.rszNoti = false;
    this.focusVio = false;
    //
    this.disRsz =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    //
    this.lateStart = 0;
    this.lateStartInterval = '';
  }
  setMainCompState = (obj) => {
    this.setState(obj);
  };
  fetchTest = async (code) => {
    const { token } = this.state.userInfo;
    const passcode = code.toUpperCase();
    try {
      const promise = await fetch(`${apiUrl}/cand/examInfo/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: `passcode=${passcode}&_csrf=${token}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      this.response = await promise.json();
      if (promise.status === 200 && promise.ok === true) this.handleFetch();
      else if (this.response.error)
        this.setState({ reqErr: this.response.error.message });
      else {
        this.setState({
          reqErr: 'Something went wrong: Unable to Process your Request',
        });
        notify(this.msgHolder, 'e', '', 10000);
      }
    } catch (error) {
      this.submitErr(error);
      notify(
        this.msgHolder,
        'e',
        '&starf; your Browser failed to Connect to SERVER<br>&starf; Check your Internet Connection'
      );
      this.setState({
        reqErr: 'Something went wrong: Unable to Process your Request',
      });
    }
  };
  sendLibSel = async (passcode, librarySel) => {
    const { token } = this.state.userInfo;
    try {
      const formData = new FormData();
      formData.append('passcode', passcode);
      formData.append('libSel', librarySel);
      formData.append('_csrf', token);
      const formBody = new URLSearchParams(formData).toString();
      const promise = await fetch(`${apiUrl}/cand/storeLibSel/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: formBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const response = await promise.json();
      let msg = '';
      if (promise.status === 200 && promise.ok === true) return true;
      else if (response.error) msg = response.error.message + '<br>';
      msg +=
        "Something went wrong.<br>Please don't continue to this Test/Event till this error message appears.<br>Check for the following<ol><li>Internet Connection/Speed</li><li>Clear your Browser cache/history/data</li><br>then refresh current TAB to retry.";
      notify(this.msgHolder, 'e', msg, 60000);
    } catch (error) {
      this.submitErr(error);
      notify(
        this.msgHolder,
        'e',
        '&starf; your Browser failed to Connect to SERVER<br>&starf; Check your Internet Connection'
      );
    }
  };
  handleFetch = async () => {
    const {
      testBuild0,
      testBuild1,
      passcode,
      setPortalInit,
      Entry,
      crntSec,
      questionnaire,
      candStatusNull,
      infoResQRB,
      trpOSFail,
      myAttempt,
      dictIndex,
      libSel,
    } = this.response;
    const email = this.state.userInfo.email;
    const myKey = email + '-' + passcode;
    if (Entry === 1) {
      localStorage.clear();
      localStorage.setItem(`${myKey}-dmy75264`, 5865);
      localStorage.setItem(`${myKey}-rsz`, 0);
      localStorage.setItem(`${myKey}-fsv`, 0);
      localStorage.setItem(`${myKey}-wfo`, 0);
      localStorage.setItem(`${myKey}-mpv`, 0);
      localStorage.setItem(`${myKey}-spv`, 0);
      localStorage.setItem(`${myKey}-devT`, 0);
      localStorage.setItem(`${myKey}-offline`, '');
    }
    // Decode Recived Data
    let Status = null,
      Response = null,
      tcResponse = null,
      cdLangIdUsed = null;
    // Check if local response is available
    if (localStorage.getItem(`${myKey}-rEsPONseS`)) {
      Status = localStorage.getItem(`${myKey}-sTatUS`);
      Response = localStorage.getItem(`${myKey}-rEsPONseS`);
      tcResponse = localStorage.getItem(`${myKey}-TcReS`);
      cdLangIdUsed = localStorage.getItem(`${myKey}-cdLngUsd`);
    } else if (candStatusNull) {
      Status = window.atob(candStatusNull);
      Response = window.atob(infoResQRB);
      tcResponse = window.atob(trpOSFail);
      cdLangIdUsed = myAttempt;
    }
    // Decode Complete
    const testInfo = JSON.parse(window.atob(setPortalInit));
    const { secInfo } = testInfo;
    // Take Care of Indexing - We Receive Question Number and work on index
    let crntQIndex = 0;
    if (crntSec < 0) {
      this.setState({ reqErr: 'Already Appeared' });
      return false;
    }
    let qBank = cjoinQbank(this.response, dictIndex);
    let libQIndex = [];
    if (libSel) libQIndex = JSON.parse(libSel);
    if (testInfo.isPool && !libQIndex.length) {
      // Select Questions in Case of Library Based Exam - Logic on Question Number - not index
      secInfo.forEach((eachSec, i) => {
        if (eachSec[1] < eachSec[2]) {
          // Prepare qNumber Array
          let from = i === 0 ? 1 : secInfo[i - 1][2] + 1;
          const to = eachSec[2];
          let arr = [];
          for (; from <= to; from++) arr.push(from);
          // Select Randomly
          const toSelect =
            i === 0 ? eachSec[1] : eachSec[1] - secInfo[i - 1][1];
          arr = arr.sort(function () {
            return Math.round(Math.random()) - 0.5;
          });
          arr = arr.slice(0, toSelect);
          libQIndex.push(arr);
        } else libQIndex.push([]);
      });
      const rndmSec = Math.floor(Math.random() * 10) + 5;
      const tempStore = JSON.stringify(libQIndex);
      const pscd = passcode;
      setTimeout(() => {
        this.sendLibSel(pscd, tempStore);
      }, rndmSec);
    }
    // Give Question Index to Each Question
    qBank.forEach((each, index) => {
      qBank[index] = { qIndex: index, ...each };
    });
    // Select questions that is in library
    if (testInfo.isPool) {
      const newQBank = [];
      // Convert libQIndex in 1D array and extract alloted questions
      const libQIndexN = [];
      libQIndex.forEach((each) => {
        each.forEach((qNo) => {
          libQIndexN.push(qNo);
          newQBank.push(qBank[qNo - 1]);
        });
      });
      libQIndex = libQIndexN;
      qBank = newQBank;
    }
    //
    const totalQ = qBank.length;
    // Prepare Null TestCase Response Array
    // tcRes - Score made by Candidate
    let tcRes = {},
      // langId of code language used
      cdLangId = {};
    qBank.forEach((each) => {
      if (each[0] === 'C') {
        if (!tcResponse) {
          tcRes = { ...tcRes, [each.qIndex]: new Array(each[8]).fill(null) };
          cdLangId = {
            ...cdLangId,
            [each.qIndex]: each[4][0] === 0 ? 11 : each[4][0],
          };
          localStorage.setItem(`${myKey}-cdLngUsd`, JSON.stringify(cdLangId));
        }
      }
    });
    if (tcResponse) {
      tcRes = JSON.parse(tcResponse);
      cdLangId = JSON.parse(cdLangIdUsed);
    }
    // Shuffle Questions of the Section if selected by test-admin
    let startIndex = 0;
    testInfo.shuffleSec.forEach((opted, key) => {
      if (opted === 1) {
        const upto = secInfo[key][1];
        let toSort = qBank.slice(startIndex, upto);
        toSort = toSort.sort(function () {
          return Math.round(Math.random()) - 0.5;
        });
        // Now Modify Question Bank
        let newQBank = qBank.slice(0, startIndex);
        newQBank = newQBank.concat(toSort);
        // Rest All After - Remember upto is based on qNo and is 1 ahead of Index so nooo +1
        newQBank = newQBank.concat(qBank.slice(upto));
        //
        qBank = newQBank;
        startIndex = upto + 1;
      }
    });
    // Convert Options into Object and Shuffle Options if TRUE for Each MCQ Bank
    qBank.forEach((eachQ) => {
      if (eachQ[0] === 'M') {
        let optArr = eachQ[3];
        // Convert to Array with each Option as Object with index as key and option as value
        let i = 0;
        optArr.forEach((eachOpt) => {
          optArr[i] = { [i]: eachOpt };
          i++;
        });
        if (testInfo.shuffleOpt)
          optArr = optArr.sort(() => {
            return Math.round(Math.random()) - 0.5;
          });
      }
    });
    //
    let responses, status;
    let nVisQ = 0,
      ansQ = 0,
      ansRevQ = 0,
      revQ = 0;
    if (Response) {
      responses = JSON.parse(Response);
      status = JSON.parse(Status);
      // Reconstruct Status + Responses Array according to shuffle or q-Bank-Pool
      let newResponses = [],
        newStatus = [];
      if (testInfo.isPool) {
        qBank.forEach((each, index) => {
          const at = libQIndex.indexOf(each.qIndex + 1);
          if (at === -1) return false;
          newResponses[index] = responses[at];
          newStatus[index] = status[at];
        });
      } else
        qBank.forEach((each, index) => {
          newResponses[index] = responses[each.qIndex];
          newStatus[index] = status[each.qIndex];
        });
      status = newStatus;
      newStatus = [];
      let statusStr = '';
      // reconstruct status array with string code and Count n-VisQ, ansQ, ansRevQ, revQ
      status.forEach((each) => {
        if (each === 0) {
          statusStr = 'nVisQ';
          nVisQ++;
        } else if (each === 1) {
          statusStr = 'nAnsQ';
        } else if (each === 'revQ') {
          statusStr = 2;
          revQ++;
        } else if (each === 3) {
          statusStr = 'ansRevQ';
          ansRevQ++;
        } else if (each === 4) {
          statusStr = 'ansQ';
          ansQ++;
        }
        newStatus.push(statusStr);
      });
      //
      responses = newResponses;
      status = newStatus;
      //
      if (crntSec > 0) crntQIndex = secInfo[crntSec - 1][1];
      if (status[crntQIndex] === 'nVisQ') {
        status[crntQIndex] = 'nAnsQ';
        nVisQ--;
      }
    } else {
      status = new Array(totalQ).fill('nVisQ');
      status[0] = 'nAnsQ';
      responses = new Array(totalQ).fill(null);
      nVisQ = totalQ - 1;
      revQ = 0;
      ansQ = 0;
      ansRevQ = 0;
    }
    //
    if (testInfo.reqFScr)
      document.addEventListener('fullscreenchange', this.fullScreenChngHandler);
    let resQuestionnaire = false;
    if (testInfo.ques && questionnaire) resQuestionnaire = questionnaire;
    this.setState({
      thisIs: testInfo.type === 1 ? 'Test' : 'Event',
      startIn: testBuild0,
      endIn: testBuild1,
      myKey,
      resQuestionnaire: resQuestionnaire,
      reqFScr: testInfo.reqFScr,
      verify: 0,
      passcode,
      crntSec,
      crntQIndex: crntQIndex,
      questionBank: qBank,
      testInfo,
      secInfo,
      status,
      responses,
      tcRes,
      cdLangId,
      total: totalQ,
      nVisQ,
      revQ,
      ansQ,
      ansRevQ,
      libQIndex,
    });
    document.title = testInfo.title + ' - ' + passcode + ' - Shred Test';
  };
  //
  submitQuestionnaire = async (data) => {
    const { passcode, userInfo } = this.state;
    const formData = new FormData();
    formData.append('passcode', passcode);
    formData.append('response', data);
    formData.append('_csrf', userInfo.token);
    const formBody = new URLSearchParams(formData).toString();
    try {
      const promise = await fetch(`${apiUrl}/cand/submitQnr/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: formBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const resData = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        this.setState({ resQuestionnaire: data });
        notify(this.msgHolder, 's', resData.notify);
      } else if (resData.error)
        notify(this.msgHolder, 'e', resData.error.message);
      else notify(this.msgHolder, 'e', '');
    } catch (error) {
      this.submitErr(error);
      notify(
        this.msgHolder,
        'e',
        '&starf; your Browser failed to Connect to SERVER<br>&starf; Check your Internet Connection'
      );
    }
  };
  prepareRespAndStatus = (responses, status) => {
    const { testInfo, libQIndex, questionBank } = this.state;
    let newResponses = [],
      newStatus = [],
      statusCode = 0;
    if (testInfo.isPool) {
      questionBank.forEach((eachQ, index) => {
        const at = libQIndex.indexOf(eachQ.qIndex + 1);
        if (at === -1) return false;
        newResponses[at] = responses[index];
        newStatus[at] = status[index];
      });
    } else
      questionBank.forEach((eachQ, index) => {
        newResponses[eachQ.qIndex] = responses[index];
        newStatus[eachQ.qIndex] = status[index];
      });
    // Convert newStatus to code-based status
    status = newStatus;
    newStatus = [];
    status.forEach((each) => {
      if (each === 'nVisQ') statusCode = 0;
      else if (each === 'nAnsQ') statusCode = 1;
      else if (each === 'revQ') statusCode = 2;
      else if (each === 'ansRevQ') statusCode = 3;
      else if (each === 'ansQ') statusCode = 4;
      newStatus.push(statusCode);
    });
    const returnData = [newResponses, newStatus];
    return returnData;
  };
  retryEndTest = (isEnd, msg, retrySec) => {
    if ((isEnd && this.retry < 5) || this.retry < 3) {
      notify(this.msgHolder, 'e', msg, retrySec * 1000);
      setTimeout(() => {
        this.retry++;
        this.endTest(isEnd);
      }, retrySec * 1000);
    } else {
      this.retry = 0;
      notify(
        this.msgHolder,
        'e',
        'Unable to Process Your Request<br>Try manually after few Seconds'
      );
      this.setState({ confirm: 'overErr' });
    }
  };
  notifiedEndTest = (userResp) => {
    if (userResp === 9)
      this.setState({ confirm: 0, confirmCallback: this.notifiedEndTest });
    else if (userResp) this.endTest(true);
    else this.setState({ confirm: false, confirmCallback: null });
  };
  endTest = async (isEnd) => {
    const {
      confirm,
      myKey,
      passcode,
      crntSec,
      tcRes,
      cdLangId,
      userInfo,
      responses,
      status,
    } = this.state;
    const data = this.prepareRespAndStatus(responses, status);
    if (isEnd === true)
      if (confirm !== 'over') this.setState({ confirm: 'over' });
      else if (confirm !== 'cover') this.setState({ confirm: 'cover' });
    let formData = new FormData();
    formData.append('passcode', passcode);
    formData.append(
      'crntSec',
      isEnd === true ? -1 : isEnd === false ? crntSec + 1 : crntSec
    );
    formData.append('response', JSON.stringify(data[0]));
    formData.append('status', JSON.stringify(data[1]));
    formData.append('tcResponse', JSON.stringify(tcRes));
    formData.append('cdLangId', JSON.stringify(cdLangId));
    formData.append('_csrf', userInfo.token);
    if (isEnd) {
      const vData = {};
      let rsz = parseInt(localStorage.getItem(`${myKey}-rsz`));
      if (isNaN(rsz) || rsz === null) rsz = -1;
      vData.rsz = rsz;
      //
      let fsv = parseInt(localStorage.getItem(`${myKey}-dmy75264`));
      if (isNaN(fsv) || fsv === null) vData.fsv = -1;
      else vData.fsv = parseInt(localStorage.getItem(`${myKey}-fsv`));
      //
      let wfo = parseInt(localStorage.getItem(`${myKey}-wfo`));
      if (isNaN(wfo) || wfo === null) wfo = -1;
      vData.wfo = wfo;
      //
      let mpv = parseInt(localStorage.getItem(`${myKey}-mpv`));
      if (isNaN(mpv) || mpv === null) mpv = -1;
      vData.mpv = mpv;
      //
      let spv = parseInt(localStorage.getItem(`${myKey}-spv`));
      if (isNaN(spv) || spv === null) spv = -1;
      vData.spv = spv;
      //
      let devT = parseInt(localStorage.getItem(`${myKey}-devT`, 0));
      if (isNaN(devT) || devT === null) devT = -1;
      vData.devT = devT;
      //
      let offline = localStorage.getItem(`${myKey}-offline`);
      if (offline === null) offline = 'CIMID';
      vData.offline = offline;
      //
      formData.append('vData', window.btoa(JSON.stringify(vData)));
      //
      const str = `${window.innerWidth}x${window.innerHeight}_${window.screen.width}x${window.screen.height}_${window.outerWidth}x${window.outerHeight}`;
      formData.append('sSize', str);
    }
    const retrySec = Math.floor(Math.random() * 30) + 10;
    //
    const formBody = new URLSearchParams(formData).toString();
    try {
      const promise = await fetch(`${apiUrl}/cand/submitTest/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: formBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const resData = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        if (isEnd === true) {
          notify(this.msgHolder, 's', '<h2>Submission Success</h2>');
          this.setState({ verify: 9 });
        } else {
          this.setState({ confirm: false });
          return 1;
        }
      } else if (resData.error) {
        notify(this.msgHolder, 'e', resData.error.message, 60000);
        this.setState({ confirm: false });
      } else {
        if (isEnd === true) {
          const thisIs = this.state.thisIs;
          this.retryEndTest(
            isEnd,
            `There was an Error Submitting your ${thisIs}<br>Please Contact ${thisIs} Incharge<br>Auto-Retry in ${retrySec}secInfo`,
            retrySec
          );
        }
        // else {
        // 	this.retryEndTest(
        // 		isEnd,
        // 		`Error in Processing Request<br>Auto-Retry in ${retrySec}secInfo`,
        // 		retrySec
        // 	);
        // }
      }
    } catch (error) {
      this.submitErr(error);
      if (isEnd === true)
        this.retryEndTest(
          isEnd,
          `&starf; your Browser failed to Connect to SERVER<br>&starf; Check your Internet Connection<br>Auto Retry in ${retrySec}secInfo`,
          retrySec
        );
      else
        notify(
          this.msgHolder,
          'e',
          '&starf; your Browser failed to Connect to SERVER<br>&starf; Check your Internet Connection'
        );
    }
  };
  nextSec = (userRes) => {
    if (userRes === 0) {
      this.setState({ confirm: false });
      return false;
    }
    const { crntSec, secInfo, confirm, testInfo } = this.state;
    const gotoNext = async () => {
      let isStored = false;
      isStored = await this.endTest(false);
      // isStored = true;
      // For Storing Upto Current Section - Store only if Section is of MCQ type
      if (isStored) {
        this.setState((prevState) => {
          prevState.nVisQ = prevState.nVisQ - 1;
          const qIndexN = secInfo[crntSec][1];
          prevState.crntQIndex = qIndexN;
          prevState.status[qIndexN] = 'nAnsQ';
          prevState.crntSec = crntSec + 1;
          prevState.confirm = false;
          return prevState;
        });
      }
    };
    // For Ending Test
    if (crntSec === secInfo.length - 1) {
      if (confirm === false)
        this.setState({ confirm: 0, confirmCallback: this.nextSec });
      else if (userRes === 1) this.endTest(true);
    } else if (testInfo.constrained) {
      if (confirm === false)
        this.setState({ confirm: 1, confirmCallback: this.nextSec });
      else if (userRes === 1) gotoNext();
    } else gotoNext();
  };
  jumpToQ = (index) => {
    if (index < 0) return false;
    const { crntSec, secInfo } = this.state;
    const upto = secInfo[crntSec][1];
    if (index > upto - 1) {
      this.nextSec();
      return;
    }
    this.setState((prevState) => {
      const statusArr = prevState.status;
      let nvQ = prevState.nVisQ;
      if (statusArr[index] === 'nVisQ') {
        statusArr[index] = 'nAnsQ';
        nvQ--;
      }
      return { crntQIndex: index, status: statusArr, nVisQ: nvQ };
    });
  };
  recRes = async (recStatus, recRes) => {
    this.setState((prevState) => {
      let { crntQIndex, status, nVisQ, nAnsQ, ansQ, ansRevQ, revQ } = prevState;
      //
      const crntStatus = status[crntQIndex];
      if (recStatus === 'ansQ') {
        // In case of Coding and HTML Submit Code at that time

        // In case of First Answer
        if (crntStatus !== 'ansQ') ansQ++;
        //
        if (crntStatus === 'nAnsQ') nAnsQ--;
        else if (crntStatus === 'revQ') revQ--;
        else if (crntStatus === 'ansRevQ') ansRevQ--;
        prevState.status[crntQIndex] = recStatus;
      } else if (recStatus === 'nAnsQ') {
        nAnsQ++;
        // Clear Response
        if (crntStatus === 'ansQ') ansQ--;
        else if (crntStatus === 'ansRevQ') ansRevQ--;
        else if (crntStatus === 'revQ') revQ--;
        prevState.status[crntQIndex] = recStatus;
      } else if (recStatus === 'revQ') {
        if (crntStatus === 'ansQ') {
          ansQ--;
          ansRevQ++;
          prevState.status[crntQIndex] = 'ansRevQ';
        } else if (crntStatus === 'nAnsQ') {
          revQ++;
          prevState.status[crntQIndex] = recStatus;
        } else if (crntStatus === 'ansRevQ') {
          ansRevQ--;
          ansQ++;
          prevState.status[crntQIndex] = 'ansQ';
        } else if (crntStatus === 'revQ') {
          revQ--;
          prevState.status[crntQIndex] = 'nAnsQ';
        } else notify(this.msgHolder, 'e', 'Invalid Request');
      } else notify(this.msgHolder, 'e', 'Invalid Request');
      //
      prevState.responses[crntQIndex] = recRes;
      //
      prevState.nVisQ = nVisQ;
      prevState.revQ = revQ;
      prevState.ansQ = ansQ;
      prevState.ansRevQ = ansRevQ;
      prevState.nAnsQ = nAnsQ;
      const myKey = prevState.myKey;
      const data = this.prepareRespAndStatus(
        prevState.responses,
        prevState.status
      );
      localStorage.setItem(`${myKey}-rEsPONseS`, JSON.stringify(data[0]));
      localStorage.setItem(`${myKey}-sTatUS`, JSON.stringify(data[1]));
      localStorage.setItem(`${myKey}-TcReS`, JSON.stringify(prevState.tcRes));
      return prevState;
    });
    // Return true to show done
    return true;
  };
  chngTCRes = (qIndex, newData) => {
    this.setState((prevState) => {
      prevState.tcRes[qIndex] = newData;
      return prevState;
    });
  };
  //
  reqLogout = async () => {
    try {
      const promise = await fetch(`${apiUrl}/logout/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: `_csrf=${this.state.userInfo.token}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true)
        window.location.reload();
      else if (response.error)
        notify(this.msgHolder, 'e', response.error.message);
      else notify(this.msgHolder, 'e', '');
    } catch (error) {
      this.submitErr(error);
      notify(
        this.msgHolder,
        'e',
        '&starf; Something went wrong.<br>OR<br>&starf; Unable to connect to Server.'
      );
    }
  };
  fascilateForm = (input) => {
    input.addEventListener('focus', (ev) =>
      ev.target.parentNode.classList.add('focused')
    );
    input.addEventListener('blur', (ev) => {
      const val = ev.target.value;
      const parent = ev.target.parentNode;
      if (val === '') {
        ev.target.classList.remove('filled');
        parent.classList.remove('focused');
      } else parent.classList.add('filled');
    });
  };
  sendViolation = (data) => {
    const { userInfo, passcode } = this.state;
    data.email = userInfo.email;
    data.code = passcode;
    data.type = 'vio';
    if (this.adminDataConn && this.adminDataConn.open)
      this.adminDataConn.send(data);
  };
  storeViolation = (myKey, key) => {
    // myKey- candidate key
    // key - violation localstorage key
    let nData = parseInt(localStorage.getItem(`${myKey}-${key}`));
    if (isNaN(nData) || nData === null) {
      nData = -1;
      localStorage.setItem(`${myKey}-${key}`, 2);
    } else nData += 1;
    this.sendViolation({ [key]: nData });
    if (nData === -1) nData = 0;
    localStorage.setItem(`${myKey}-${key}`, nData);
    // Check for Auto End Test
    const { testInfo, thisIs } = this.state;
    const maxAllow = testInfo ? testInfo[key] : 0;
    if (maxAllow) {
      const leftVio = maxAllow - nData;
      if (leftVio === 0) {
        notify(
          this.msgHolder,
          'e',
          `<h3>${thisIs} was ended due to repeated Violations.</h3>`
        );
        // End Test
        this.endTest(true);
      } else if (leftVio < 6) {
        notify(
          this.msgHolder,
          'e',
          `<h4>your ${thisIs} will auto-end after next</h4><h3>${leftVio} ${
            key === 'fsv'
              ? 'Full-Screen'
              : key === 'rsz'
                ? 'Resize Screen'
                : 'Window-Switch'
          } Violation(s).</h3>`,
          10000
        );
      }
    }
  };
  openFullscreen = async () => {
    let isFullScr = false,
      fsNotSupp = false;
    const notSupp = () => {
      notify(
        this.msgHolder,
        'e',
        `<h4>Couldn't switch to Full Screen Mode.</h4>Try using alternate Browser.If that doesn't work, you can continue this ${this.state.thisIs} in Normal Screen Mode.`,
        10000
      );
      isFullScr = false;
      fsNotSupp = true;
    };
    // Check if Function is Supported By Browser
    const isBrwsrEnabled =
      document.fullscreenEnabled ||
      document.mozFullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.msFullscreenEnabled
        ? true
        : false;
    if (isBrwsrEnabled) {
      const fSEle = document.documentElement;
      // Determine Request Method
      var requestMethod =
        fSEle.requestFullscreen ||
        fSEle.mozRequestFullScreen ||
        fSEle.webkitRequestFullScreen ||
        fSEle.msRequestFullScreen;
      if (requestMethod) {
        try {
          // Native full screen.
          await requestMethod.call(fSEle).catch((err) => {
            notSupp();
          });
        } catch (err) {
          notSupp();
        }
      } else notSupp();
      if (document.fullscreenElement) {
        isFullScr = true;
        fsNotSupp = false;
      }
    } else notSupp();
    // Continue with no FullScreen
    if (fsNotSupp)
      document.removeEventListener(
        'fullscreenchange',
        this.fullScreenChngHandler
      );
    this.setState(
      {
        confirm: false,
        confirmCallback: false,
        isFullScr: isFullScr,
        fsNotSupp: fsNotSupp,
      },
      this.testRequirements
    );
    this.resizeHandler();
  };
  fullScreenChngHandler = () => {
    const { myKey, verify, fsNotSupp } = this.state;
    if (!fsNotSupp && !document.fullscreenElement) {
      if (verify) {
        this.storeViolation(myKey, 'fsv');
        notify(this.msgHolder, 'e', 'Full Screen Violation');
      }
      this.setState({
        confirm: 'fscr',
        confirmCallback: this.openFullscreen,
        isFullScr: false,
      });
    }
  };
  //
  resizeHandler = () => {
    const { myKey, verify, reqFScr, fsNotSupp } = this.state;
    if (reqFScr === false && this.disRsz) {
      return false;
    }
    this.processDevCheck();
    const processVoilation = () => {
      if (verify !== 1) {
        this.setState({
          notFullWidth: true,
        });
        return false;
      }
      //
      this.storeViolation(myKey, 'rsz');
      //
      if (!this.rszNoti) {
        this.rszNoti = true;
        notify(this.msgHolder, 'e', 'Resize Violation');
        setTimeout(() => {
          this.rszNoti = false;
        }, 5000);
      }
    };
    const widthDiff = Math.abs(window.screen.width - window.innerWidth);
    const heightDiff = Math.abs(window.screen.height - window.innerHeight);
    if (
      reqFScr === true &&
      fsNotSupp === false &&
      !document.fullscreenElement &&
      (widthDiff > 10 || heightDiff > 10)
    )
      processVoilation();
    else if (widthDiff > 10 || heightDiff > 200) processVoilation();
    else {
      if (verify === 1) this.verify();
      else
        this.setState({
          notFullWidth: false,
        });
    }
  };
  //
  processDevCheck = () => {
    // setTimeout(() => {
    //   const res = checkDev(this.state.isFullScr);
    //   if (res.isOpen || navigator.maxTouchPoints === 1) {
    //     const { myKey, loggedIn } = this.state;
    //     if (loggedIn) this.storeViolation(myKey, "devT");
    //     window.alert(
    //       `Close extra/side window or zoom back to default 100%.\nViolation V|H : ${res.orientation}\nThis is considered a major Violation and your Test/Event might be ended by Proctor.\nThis will be your one and only chance to close the extra/side window and click OK to continue to Test/Event, future violations/extra clicks on OK will FREEZE your TEST / EVENT and a RED Warning will be issued for your Account.`
    //     );
    //     setTimeout(() => {
    //       this.processDevCheck();
    //     }, 5000);
    //   }
    // }, 1000);
  };
  focusBackCheckS = () => {
    setTimeout(() => {
      const { scrnStream, myKey } = this.state;
      if (scrnStream.active === false) {
        this.storeViolation(myKey, 'spv');
        // Recall initiated for Media Stream
        this.recallIniScr = true;
        this.setState({ scrnStream: null }, this.testRequirements);
      }
    }, 1000);
    window.removeEventListener('focus', this.focusBackCheckS);
  };
  focusBackCheckM = () => {
    const processVio = () => {
      notify(
        this.msgHolder,
        'e',
        'Media Proctoring In-active Stream detected.Please provide it again.'
      );
      const { myKey } = this.state;
      this.storeViolation(myKey, 'mpv');
      // Recall initiated for Media Stream
      this.recallIniMedia = true;
      this.setState({ candStream: null }, this.testRequirements);
    };
    setTimeout(async () => {
      const perm = await this.permissionStatus('camera');
      if (perm < -2) {
        processVio();
        return false;
      }
      //
      const status = await this.getMediaStream(false, 0, 0, true);
      // In case nothing is returned
      if (!status) processVio();
    }, 1000);
    window.removeEventListener('focus', this.focusBackCheckM);
  };
  //
  lostFocus = () => {
    this.processDevCheck();
    // Check if Candidate Media Stream was altered
    const {
      myBrowser,
      scrnStream,
      candStream,
      candStandScrn,
      candStandCam,
      myKey,
      verify,
      crntQIndex,
      questionBank,
      thisIs,
    } = this.state;
    if (
      myBrowser !== 'C' &&
      myBrowser !== 'O' &&
      scrnStream &&
      candStandScrn === 0
    )
      window.addEventListener('focus', this.focusBackCheckS);
    //
    if (candStream && candStandCam === 0)
      window.addEventListener('focus', this.focusBackCheckM);
    // Check if lost focus was on HTML Based Q - iframe
    if (verify !== 1) return false;
    const question = questionBank[crntQIndex];
    if (question[0] === 'H') {
      const tag = document.activeElement.tagName;
      if (tag === 'IFRAME') return false;
    }
    // if (this.props.checkFrame) {
    // 	const frameDiv = document.querySelector("#frameDiv iframe");
    // 	const dragFrame = document.querySelector("#draggable iframe");
    // 	if (
    // 		(dragFrame && document.activeElement === dragFrame) ||
    // 		(frameDiv && document.activeElement === frameDiv)
    // 	) {
    // 		setTimeout(() => {
    // 			document.activeElement.blur();
    // 		}, 50);
    // 		return;
    // 	}
    // }
    //
    // Process Violation if Test has Started
    const msgHolder = this.msgHolder;
    //
    this.storeViolation(myKey, 'wfo');
    //
    if (this.focusVio === true) {
      notify(
        msgHolder,
        'e',
        `<h3>Repeated Violation</h3>May auto-end ${thisIs}.`
      );
      return false;
    } else {
      this.focusVio = true;
      notify(msgHolder, 'e', 'Window-Switch Violation');
      setTimeout(() => {
        this.focusVio = false;
      }, 5000);
    }
  };
  //
  changeConstrVid = (data) => {
    let stream;
    if (data.setFor === 1) stream = this.state.candStream;
    else if (data.setFor === 2) stream = this.state.scrnStream;
    else return false;
    delete data.setFor;
    //
    const vidTrack = stream.getVideoTracks()[0];
    const capable = vidTrack.getCapabilities();
    // Check for FrameRate
    if (data.frameRate > capable.frameRate.max)
      data.frameRate = capable.frameRate.max;
    // Check for Height
    if (data.height > capable.height.max) data.height = capable.height.max;
    // Check for Width
    if (data.width > capable.width.max) data.width = capable.width.max;
    // Old Settings
    vidTrack.applyConstraints(data);
    //
  };
  //
  getScreenStream = () => {
    const { testInfo, myBrowser, myKey } = this.state;
    //
    const resolution = this.resColl[testInfo.winR];
    //
    const notSupp = () => {
      notify(
        this.msgHolder,
        'e',
        'Window Proctoring : Not Supported.<br>Fallback detection will be implemented.<br>Please prefer switching to Desktop/PC.'
      );
      this.setState({ confirm: 4 });
    };
    if (!navigator.mediaDevices.getDisplayMedia) return notSupp();
    navigator.mediaDevices
      .getDisplayMedia()
      .then((stream) => {
        const vidTrack = stream.getVideoTracks()[0];
        const lbl = vidTrack.label;
        if (
          testInfo.win === 1 &&
          ((myBrowser === 'M' && lbl.search('Primary Monitor') === -1) ||
            ((myBrowser === 'C' || myBrowser === 'O') &&
              lbl.search('screen') === -1))
        ) {
          notify(
            this.msgHolder,
            'e',
            `Invalid Screen Selection.<br>Please select as required for the ${this.state.thisIs}.<br>Read Instructions before Proceeding.`
          );
          this.setState({
            scrnStream: null,
          });
          return false;
        } else if (
          testInfo.win === 2 &&
          ((myBrowser === 'M' &&
            lbl.search('Shred_Test — Mozilla Firefox') === -1 &&
            lbl.search('Primary Monitor') === -1) ||
            ((myBrowser === 'C' || myBrowser === 'O') &&
              lbl.search('window') === -1 &&
              lbl.search('screen') === -1))
        ) {
          notify(
            this.msgHolder,
            'e',
            `&starf; Invalid Screen Selection.<br>&starf; Please select as required for the ${this.state.thisIs}.<br>&starf; Read Instructions before Proceeding.`
          );
          this.setState({
            scrnStream: null,
          });
          return false;
        } else {
          //
          vidTrack.applyConstraints({
            width: resolution.w,
            height: resolution.h,
            frameRate: testInfo.winF,
          });
          //
          if (this.recallIniScr) {
            this.recallIniScr = false;
            if (this.recallIniMedia !== true) this.requestPeerReCall();
          }
          stream.addEventListener('inactive', () => {
            notify(
              this.msgHolder,
              'e',
              'In-active Stream detected.Please provide it again.'
            );
            this.storeViolation(myKey, 'spv');
            // Recall initiated for Screen Stream
            this.recallIniScr = true;
            this.setState({ scrnStream: null }, this.testRequirements);
          });
          stream.addEventListener('removetrack', () => {
            notify(this.msgHolder, 'e', 'Screen Stream Track Removed');
          });
          this.setState({
            scrnStream: stream,
          });
        }
      })
      .catch((err) => {
        if (err.message === 'Permission denied')
          notify(this.msgHolder, 'e', 'Permission Denied by Candidate.');
        else notSupp();
      });
  };
  //
  getMediaStream = (isCust = false, vid, mic, isCheck = false) => {
    let { cameraP, micP } = this.state;
    const { testInfo } = this.state;
    //
    let video = isCust ? vid : testInfo.cam ? true : false;
    //
    const resolution = this.resColl[testInfo.camR];
    //
    if (video)
      video = {
        facingMode: { exact: 'user' },
        width: resolution.w,
        height: resolution.h,
        frameRate: testInfo.camF,
      };
    // return to make function return a promise
    return navigator.mediaDevices
      .getUserMedia({
        video: video,
        audio: isCust ? mic : testInfo.mic ? true : false,
      })
      .then((stream) => {
        if (isCheck) return true;
        //
        if (this.recallIniMedia) {
          this.recallIniMedia = false;
          if (this.recallIniScr !== true) this.requestPeerReCall();
        }
        if (isCust) {
          if (vid && stream.getVideoTracks().length !== 0) cameraP = 1;
          if (mic && stream.getAudioTracks().length !== 0) micP = 1;
        } else {
          if (testInfo.cam && stream.getVideoTracks().length !== 0) cameraP = 1;
          if (testInfo.mic && stream.getAudioTracks().length !== 0) micP = 1;
        }
        this.setState({ cameraP: cameraP, micP: micP, candStream: stream });
      })
      .catch((err) => {
        const errMsg = err.message;
        let callback = null;
        err = err.toString();
        if (errMsg === 'Could not start video source') {
          cameraP = -4;
          if (micP === -1)
            callback = () => this.getMediaStream(true, false, true);
        } else if (errMsg === 'Could not start audio source') {
          micP = -4;
          if (cameraP === -1)
            callback = () => this.getMediaStream(true, true, false);
        } else if (!isCust && errMsg === 'Permission denied') {
          if (cameraP === -1)
            callback = () => this.getMediaStream(true, true, false);
          else if (micP === -1)
            callback = () => this.getMediaStream(true, false, true);
        } else if (errMsg === 'Permission dismissed') {
          if (cameraP === -2) {
            cameraP = -5;
            callback = () => this.getMediaStream(true, false, true);
          } else if (micP === -2) {
            micP = -5;
            callback = () => this.getMediaStream(true, true, false);
          }
        } else {
          notify(
            this.msgHolder,
            'e',
            'Something is wrong with Device Permissions.'
          );
        }
        if (callback) this.setState({ cameraP: cameraP, micP: micP }, callback);
        else this.setState({ cameraP: cameraP, micP: micP });
      });
  };
  permissionStatus = async (device, addLis = false) => {
    let { cameraP, micP, candStream, myBrowser } = this.state;
    if (myBrowser === 'M') {
      if (!candStream)
        this.setState({ cameraP: -9, micP: -9 }, this.getMediaStream);
      return true;
    }
    let val;
    if (device === 'camera') val = cameraP;
    else val = micP;
    const result = await navigator.permissions.query({ name: device });
    if (result.state === 'granted') val = -1;
    else if (result.state === 'prompt') val = -2;
    else if (result.state === 'denied') val = -3;
    //
    if (device === 'camera') cameraP = val;
    else micP = val;
    if (addLis)
      result.onchange = () => {
        this.permissionStatus(device);
      };
    if (
      addLis &&
      !candStream &&
      (((cameraP === -1 || cameraP === -2) && this.state.testInfo.mic === 0) ||
        (micP < 0 && (cameraP === -1 || cameraP === -2)))
    )
      this.setState({ cameraP: cameraP, micP: micP }, this.getMediaStream);
    else this.setState({ cameraP: cameraP, micP: micP });
    return val;
  };
  enquireDevice = async (device) => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    for (let i = 0; i < devices.length; i++) {
      const each = devices[i];
      if (each.kind === device) return true;
    }
    return false;
  };
  testRequirements = (usrResp) => {
    const { testInfo, reqFScr, isFullScr, fsNotSupp, candStream, scrnStream } =
      this.state;
    let { confirm, candStandCam, candStandScrn } = this.state;
    if (confirm !== false) {
      if (confirm === 'usrM') {
        if (
          !candStream ||
          (testInfo.cam > 1 && candStream.getVideoTracks().length === 0) ||
          (testInfo.mic > 1 && candStream.getAudioTracks().length === 0)
        ) {
          let msg = '';
          if (
            testInfo.cam > 1 &&
            (!candStream || candStream.getVideoTracks().length === 0)
          ) {
            return this.enquireDevice('videoinput').then((status) => {
              if (status) {
                msg = `&starf; WebCam Detected<br>&starf; Since your Organzation has made it compulsory,<br>you can step ahead only after the ${this.state.thisIs} gains complete access to your web-cam.`;
                notify(this.msgHolder, 'e', msg);
                return false;
              } else {
                if (testInfo.cam === 2) {
                  confirm = 3;
                  this.setState({
                    confirm: confirm,
                  });
                } else {
                  msg = `&starf; Since your Organzation has made it compulsory,<br>you can step ahead only after the ${this.state.thisIs} gains complete access to your web-cam.`;
                  notify(this.msgHolder, 'e', msg);
                  return false;
                }
              }
            });
          } else if (
            testInfo.mic > 1 &&
            (!candStream || candStream.getAudioTracks().length === 0)
          ) {
            return this.enquireDevice('audioinput').then((status) => {
              if (status) {
                msg = `&starf; Microphone Detected<br>&starf; Since your Organzation has made it compulsory,<br>you can step ahead only after the ${this.state.thisIs} gains complete access to your microphone.`;
                notify(this.msgHolder, 'e', msg);
                return false;
              } else {
                if (testInfo.mic === 2) {
                  confirm = 3;
                  this.setState({
                    confirm: confirm,
                  });
                } else {
                  msg = `&starf; Since your Organzation has made it compulsory,<br>you can step ahead only after the ${this.state.thisIs} gains complete access to your microphone.`;
                  notify(this.msgHolder, 'e', msg);
                  return false;
                }
              }
            });
          } else if (
            testInfo.cam === 1 &&
            (!candStream || candStream.getVideoTracks().length === 0)
          )
            confirm = 3;
          else if (
            testInfo.aud === 1 &&
            (!candStream || candStream.getAudioTracks().length === 0)
          )
            confirm = 3;
          else {
            msg = `&starf; Since your Organization has made media proctoring compulsory,<br>you can step ahead only after the ${this.state.thisIs} gains complete access to required media device(s).`;
            notify(this.msgHolder, 'e', msg);
            return false;
          }
        } else if (!candStream) confirm = 3;
        else confirm = false;
      } else if (confirm === 3) {
        if (usrResp) {
          candStandCam = 1;
          confirm = false;
        } else confirm = 'usrM';
      } else if (confirm === 'usrS') {
        if (!scrnStream && (testInfo.win === 1 || testInfo.win === 2)) {
          notify(
            this.msgHolder,
            'e',
            `&starf; Since your Organization has made Screen Proctoring compulsory,<br>you can proceed only after the ${this.state.thisIs} gains your Screen Proctoring.`
          );
          return false;
        } else if (!scrnStream) confirm = 4;
        else confirm = false;
      } else if (confirm === 4) {
        if (usrResp) {
          candStandScrn = 1;
          confirm = false;
        } else confirm = 'usrS';
      }
    }
    if (confirm === false) {
      if (candStandCam === 0 && !candStream && (testInfo.cam || testInfo.mic))
        confirm = 'usrM';
      else if (candStandScrn === 0 && !scrnStream && testInfo.win)
        confirm = 'usrS';
      else if (reqFScr && !isFullScr && !fsNotSupp) confirm = 'fscr';
    }
    this.setState({
      confirm: confirm,
      candStandCam: candStandCam,
      candStandScrn: candStandScrn,
    });
  };
  closeAllConn = (mediaOnly = false) => {
    // Close Data Conn - Client Side
    if (mediaOnly === false) {
      if (this.adminDataConn) this.adminDataConn.close();
      this.adminDataConn = null;
    }
    // Close Media Conn - Client Side
    this.adminMediaConn.forEach((each) => {
      each.close();
    });
    this.adminMediaConn = [];
    // Verify Disconnection from Server - If found open then CLose
    const allConn = this.peerConn.connections;
    for (const key in allConn) {
      if (Object.hasOwnProperty.call(allConn, key)) {
        const each = allConn[key];
        for (let i = 0; i < each.length; i++)
          each.forEach((eachConn) => {
            // Close Conn
            if (!mediaOnly || !eachConn.label) eachConn.close();
          });
      }
    }
  };
  newAdminAuthorize = (newAdmin) => {
    const accept = () => {
      this.adminDataConn = newAdmin;
      newAdmin.send({ type: 'verifyRes', proctorMe: true });
      // Force Update in case of ChatComponent is Open so that it receives the fresh data connection
      if (this.state.chat) this.forceUpdate();
    };
    // if previous admin exists check if admin is still live
    if (this.adminDataConn) {
      if (this.adminDataConn.open === false) {
        this.adminDataConn.close();
        // Clear Connection from Server End just for assurance
        this.closeAllConn();
        accept();
        return true;
      }
      // Create promise and wait for Verification from old Admin
      new Promise((res, rej) => {
        let timeout = setTimeout(() => {
          // Close all Connections Media + Data and add New Admin
          if (this.adminDataConn) this.adminDataConn.close();
          const allConn = this.peerConn.connections;
          for (const key in allConn) {
            if (Object.hasOwnProperty.call(allConn, key)) {
              const element = allConn[key];
              if (key === newAdmin.peer) continue;
              element.forEach((eachConn) => eachConn.close());
            }
          }
          rej();
        }, 5000);
        this.adminDataConn.send({ type: 'verifyReq' });
        this.adminDataConn.once('data', (data) => {
          if (data.type === 'verifyRes') {
            newAdmin.send({ type: 'verifyRes', proctorMe: false });
            res();
            if (timeout) clearTimeout(timeout);
          }
        });
      })
        .then(() => {
          console.log('');
        })
        .catch(() => accept());
    } else accept();
  };
  //
  requestPeerReCall = (proctorInit = false) => {
    if (this.adminDataConn && this.adminDataConn.open) {
      //
      this.adminMediaConn.forEach((each) => {
        each.close();
      });
      this.adminMediaConn = [];
      //
      const { userInfo } = this.state;
      const data = {
        type: 're-call',
        email: userInfo.email,
        name: userInfo.name,
      };
      if (proctorInit) data.proctor = true;
      this.adminDataConn.send(data);
    }
  };
  //
  initatePeerConn = () => {
    this.peerConn = new Peer(undefined, {
      host: peerjsHost,
      secure: isProd ? true : false,
      port: peerjsPort,
      path: '/peerjs',
    });
    //
    // setInterval(() => {
    // 	console.log(this.peerConn.connections);
    // }, 5000);
    //
    this.peerConn.on('open', this.connectToSocket);
    this.peerConn.on('connection', (conn) => {
      // conn.on("open", () => {
      // console.log("Data Receiver Connection Open");
      // });
      conn.on('data', (data) => {
        // New Addmin Verification Request
        if (data.type === 'verifyReq') this.newAdminAuthorize(conn);
        // this.newAdminConn.send({ proctor: true });
        else if (data.type === 'ct') {
          this.answerStream = data.req;
          conn.send({ type: 'ct', accept: 1 });
        } else if (data.closeAll === true) {
          // Close all PeerJS connections : admin Initated a Close
          this.closeAllConn();
        } else if (data.closeMedia === true) this.closeAllConn(true);
        else if (data.type === 'chat') {
          const old = localStorage.getItem('chat_Admin');
          let newChat = { nMsg: 1, of: 'admin', store: [] };
          if (old) {
            newChat = JSON.parse(old);
            if (this.state.chat) newChat.nMsg = 0;
            else newChat.nMsg += 1;
          }
          if (!this.state.chat)
            notify(this.msgHolder, 's', `${newChat.nMsg} new Message(s)`);
          newChat.store.push({ in: data.msg });
          localStorage.setItem('chat_Admin', JSON.stringify(newChat));
          this.forceUpdate();
        } else if (data.type === 'setVio') {
          const { myKey } = this.state;
          localStorage.setItem(`${myKey}-${data.setFor}`, data.setVal);
        } else if (data.type === 'chngConstr') {
          delete data.type;
          this.changeConstrVid(data);
        }
      });
    });
    this.peerConn.on('call', (callConn) => {
      this.adminMediaConn.push(callConn);
      if (this.answerStream === 'cam') callConn.answer(this.state.candStream);
      else if (this.answerStream === 'scrn')
        callConn.answer(this.state.scrnStream);
      // else
      // 	notify(
      // 		this.msgHolder,
      // 		"e",
      // 		"Connection Issue detected while Answering Call"
      // 	);
      // callConn.on("close", () => {
      // 	console.log("Media Connection Closed");
      // });
      callConn.on('error', (err) => {
        this.submitErr(err);
      });
    });
    // this.peerConn.on("close", () => {
    // 	console.log("Peer Connection Closed");
    // });
    // this.peerConn.on("disconnected", () => {
    // 	console.log("Peer Dis-Connected");
    // });
    this.peerConn.on('error', (err) => {
      this.submitErr(err);
      this.setState({
        confirm: 'peer',
        confirmCallback: this.setMainCompState,
      });
    });
  };
  connectToSocket = (peerId) => {
    const { passcode, userInfo, candStream, scrnStream } = this.state;
    let data = {
      passcode: passcode,
      name: userInfo.name,
      email: userInfo.email,
      peerId: peerId,
      cam: candStream && candStream.getVideoTracks().length ? true : false,
      mic: candStream && candStream.getAudioTracks().length ? true : false,
      scrn: scrnStream ? true : false,
    };
    const socket = this.socket;
    socket.emit('join-room', passcode, data);
    //
    socket.on('closeAll', (peerId) => {
      if (this.adminDataConn && this.adminDataConn.peer === peerId) {
        // Close all PeerJS connections : admin Initated a Close
        this.closeAllConn();
      }
    });
    socket.on('closeMedia', (peerId) => {
      if (this.adminDataConn && this.adminDataConn.peer === peerId) {
        // Close all Media Connections : socket initiated by admin
        this.closeAllConn(true);
      }
    });
    socket.on('endTest', () => {
      this.closeAllConn();
      const thisIs = this.state.thisIs;
      notify(
        this.msgHolder,
        'e',
        `<h3>Proctor: ${thisIs} Ended</h3>your Proctor ended your ${thisIs}.${thisIs} will be Submitted Now.<br>In case of any action from your side your response will be rejected.`,
        10000
      );
      setTimeout(() => {
        this.endTest(true);
      }, 1000);
    });
    //
    // socket.on("rmvProctor", () => {
    // 	this.closeAllConn(-1);
    // });

    //
    this.peerConn.on('close', () => {
      notify(
        this.msgHolder,
        'e',
        '<h3>Response Server Connection Lost</h3> - Please maintain a descent Internet Connection.<br>Refresh this Page to resume and reconnect.',
        60000
      );
      this.peerConn.destroy();
    });
    this.peerConn.on('disconnected', () => {
      setTimeout(() => {
        if (this.peerConn._destroyed)
          notify(
            this.msgHolder,
            'e',
            '<h3>Response Server Connection Lost</h3> - Please maintain a descent Internet Connection.<br>Refresh this Page to resume and reconnect.',
            60000
          );
        else if (this.peerConn._disconnected) this.peerConn.reconnect();
      }, 10000);
    });
  };
  //
  verify = () => {
    const { myBrowser, notFullWidth, reqFScr, isFullScr, fsNotSupp } =
      this.state;
    const allVerified =
      myBrowser &&
      navigator.cookieEnabled &&
      !notFullWidth &&
      (reqFScr ? (isFullScr ? true : fsNotSupp ? true : false) : true);
    if (allVerified) return true;
    else return false;
  };
  //
  timer = (type, obj) => {
    // type = 0 for liveIn 1 - for Exam is Live
    let countDown;
    if (type === 0) {
      this.verify();
      countDown = this.state.startIn;
    } else if (type === 1) {
      const { endIn, startIn } = this.state;
      clearInterval(this.lateStartInterval);
      countDown = endIn - startIn - this.lateStart;
    }
    // Update the count down every 1 second
    let days, hours, minutes, seconds;
    const x = setInterval(() => {
      // Time calculations for days, hours, minutes and seconds
      days = Math.floor(countDown / 86400);
      hours = Math.floor((countDown % 86400) / 3600);
      minutes = Math.floor((countDown % 3600) / 60);
      seconds = Math.floor(countDown % 60);
      if (minutes / 10 < 1) minutes = '0' + minutes;
      if (seconds / 10 < 1) seconds = '0' + seconds;
      // Display the result in the object
      obj.innerText =
        (days ? `${days}d ` : '') +
        (hours ? `${hours}h ` : '') +
        (minutes ? `${minutes}m ` : '') +
        (seconds ? `${seconds}s` : '');
      if (countDown <= 0) {
        clearInterval(x);
        if (type === 0) {
          this.setState({ isLive: true });
          this.lateStartInterval = setInterval(() => {
            this.lateStart += 1;
          }, 1000);
          obj.innerText = 'Start';
        } else if (type === 1) {
          this.endTest(true);
          obj.innerText = "Time's Up";
          notify(
            this.msgHolder,
            'e',
            "<h3>TIME OVER</h3>Your Participation will be Submitted Now.<br>Don't Close the Browser!<br>Be Patient",
            10000
          );
        }
      } else if (countDown <= 300 && type === 1) obj.style.color = 'red';
      countDown -= 1;
    }, 1000);
  };
  //
  startExam = () => {
    const { isLive, startIn, endIn, testInfo, resQuestionnaire } = this.state;
    if (this.verify()) {
      if (testInfo.ques && !resQuestionnaire) {
        notify(
          this.msgHolder,
          'e',
          '<h3>Please Fill the Questionnaire to Start</h3>'
        );
        this.setState({ toStartShow: 4 });
        return false;
      }
      if (startIn === 0 || isLive) {
        if (endIn < 0) {
          this.endTest(true);
          notify(
            this.msgHolder,
            'e',
            "<h3>TIME OVER</h3>Your Participation will be Submitted Now Don't Close the Browser!<br>Be Patient",
            10000
          );
        } else this.setState({ verify: 1 });
      } else
        notify(
          this.msgHolder,
          'e',
          `Wait for the ${this.state.thisIs} to Start.`
        );
    } else {
      notify(
        this.msgHolder,
        'e',
        'All Verifications are Not Completed.<br>Please complete.'
      );
      this.setState({ verify: 0, toStartShow: 1 });
      // make Verify = 0
    }
  };
  //
  findReqCallback = (confirm) => {
    return confirm === 'fscr'
      ? this.openFullscreen
      : confirm === 'usrM' ||
          confirm === 3 ||
          confirm === 'usrS' ||
          confirm === 4
        ? this.testRequirements
        : this.state.confirmCallback;
  };
  reqResData = (confirm, testInfo) => {
    const { cameraP, micP, candStream, scrnStream } = this.state;
    return confirm === 'usrM'
      ? {
          cam: testInfo.cam,
          cameraP: cameraP,
          mic: testInfo.mic,
          micP: micP,
          spkr: testInfo.spkr,
          candStream: candStream,
          permissionStatus: this.permissionStatus,
        }
      : confirm === 'usrS'
        ? {
            win: testInfo.win,
            scrnStream: scrnStream,
            getStream: this.getScreenStream,
          }
        : null;
  };
  //
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHandler);
    try {
      if (!localStorage) console.log('Spam');
    } catch (err) {
      this.setState({
        err: 'Please enable Cookies and Site Data for this website.<br>Reload website after enabling',
      });
      return false;
    }
  }
  submitErr = (err) => {
    const { passcode, userInfo } = this.state;
    err = `${err.message.toString() + err.type ? ` - ${err.type}` : ''} - ${
      userInfo.uname
    } - ${userInfo.email} - ${passcode} - ${err}`;
    storeError(err, userInfo.token);
  };
  componentDidMount() {
    try {
      if (!localStorage) console.log('Spam');
    } catch (err) {
      this.setState({
        err: 'Please enable Cookies and Site Data for this website.<br>Reload website after enabling',
      });
      return false;
    }
    // If Google Login
    const gLogin = localStorage.getItem('gLogin');
    if (gLogin) {
      if (gLogin !== window.location.pathname) {
        window.location.replace(gLogin);
        localStorage.removeItem('gLogin');
      }
    }
    //
    const userInfo = JSON.parse(document.getElementById('userInfo').innerText);
    //
    const myState = { loggedIn: false };
    const loggedIn = userInfo.loggedIn;
    delete userInfo.loggedIn;
    //
    const localPasscode = localStorage.getItem('passcode');
    if (userInfo.passcode) {
      myState.passcode = userInfo.passcode;
      if (!loggedIn) localStorage.setItem('passcode', userInfo.passcode);
      delete userInfo.passcode;
    } else if (localPasscode) {
      myState.passcode = localPasscode;
      localStorage.removeItem('passcode');
    }
    //
    if (loggedIn) myState.loggedIn = loggedIn;
    //
    const isRegister = userInfo.register;
    if (isRegister) delete userInfo.register;
    //
    if (!isRegister && myState.loggedIn && (!userInfo.uname || !userInfo.name))
      window.alert(
        `You must create your username and Fill your name in your profile to continue to the Test/Event.\nWe are redirecting you to the Profile-Page.`
      );
    else myState.userInfo = userInfo;
    this.setState(myState);
    //
    this.socket = io('/');
    // First Time Initiate
    this.resizeHandler();
    this.processDevCheck();
    //
    window.addEventListener('blur', this.lostFocus);
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('error', (err) => {
      this.submitErr(err);
    });
  }
  render() {
    const { loggedIn, verify, userInfo, err } = this.state;
    if (err)
      return (
        <center>
          <h1
            dangerouslySetInnerHTML={{ __html: err }}
            style={{ fontFamily: '"Noto Sans JP",sans-serif' }}
          ></h1>
        </center>
      );
    else if (!loggedIn || !userInfo || !userInfo.name || !userInfo.uname)
      return (
        <AuthPage
          setExamCompState={this.setMainCompState}
          userInfo={userInfo}
        />
      );
    else if (!userInfo) return <h1>Loading</h1>;
    const {
      reqErr,
      secInfo,
      testInfo,
      confirm,
      myBrowser,
      reqFScr,
      isFullScr,
      fsNotSupp,
      notFullWidth,
      theme,
      fontS,
      passcode,
    } = this.state;
    if (verify === -1)
      return (
        <>
          <div id="msgHolder" ref={this.msgHolder}></div>
          <ReqExamCode
            fascilateForm={this.fascilateForm}
            fetchTest={this.fetchTest}
            setMainCompState={this.setMainCompState}
            userInfo={userInfo}
            passcode={passcode}
            reqErr={reqErr}
            logOut={this.reqLogout}
          />
        </>
      );
    else if (verify === 0) {
      const { endIn, candStream, scrnStream } = this.state;
      return (
        <>
          <div id="msgHolder" ref={this.msgHolder}></div>
          {confirm === false ? null : (
            <ReqResponse
              wh={confirm}
              callback={this.findReqCallback(confirm)}
              data={this.reqResData(confirm, testInfo)}
            />
          )}
          <ToStart
            thisIs={this.state.thisIs}
            markActive={this.state.toStartShow}
            userInfo={userInfo}
            data={this.response}
            secInfo={secInfo}
            testInfo={testInfo}
            setMainCompState={this.setMainCompState}
            fascilateForm={this.fascilateForm}
            testRequirements={this.testRequirements}
            myBrowser={myBrowser}
            reqFScr={reqFScr}
            isFullScr={isFullScr}
            fsNotSupp={fsNotSupp}
            candStream={candStream}
            scrnStream={scrnStream}
            notFullWidth={notFullWidth}
            timer={this.timer}
            endIn={endIn}
            startExam={this.startExam}
            submitQuestionnaire={this.submitQuestionnaire}
            resQuestionnaire={this.state.resQuestionnaire}
            logOut={this.reqLogout}
          />
        </>
      );
    } else if (verify === 9)
      return (
        <FeedbackForm
          passcode={passcode}
          logOut={this.reqLogout}
          msgHolder={this.msgHolder}
          token={userInfo.token}
        />
      );
    // ^ SHOW FEEDBACK
    const {
      crntSec,
      crntQIndex,
      status,
      responses,
      questionBank,
      tcRes,
      cdLangId,
      total,
      nVisQ,
      revQ,
      ansQ,
      ansRevQ,
      candStream,
      scrnStream,
      chat,
      myKey,
    } = this.state;
    const question = questionBank[crntQIndex];
    return (
      <>
        {chat ? (
          <ChatComp
            email={userInfo.email}
            adminDataConn={this.adminDataConn}
            setMainCompState={this.setMainCompState}
            msgHolder={this.msgHolder}
          />
        ) : null}
        {confirm === false ? null : (
          <ReqResponse
            wh={confirm}
            callback={this.findReqCallback(confirm)}
            data={this.reqResData(confirm, testInfo)}
          />
        )}
        <div id="msgHolder" ref={this.msgHolder}></div>
        <Facilitate
          myKey={myKey}
          testInfo={testInfo}
          notify={notify}
          msgHolder={this.msgHolder}
          thisIs={this.state.thisIs}
          userInfo={userInfo}
          passcode={passcode}
          timer={this.timer}
          notifiedEndTest={this.notifiedEndTest}
          logOut={this.reqLogout}
          candStream={candStream}
          scrnStream={scrnStream}
          initatePeerConn={this.initatePeerConn}
          setMainCompState={this.setMainCompState}
          socket={this.socket}
        />
        <main id="examMain">
          {question[0] === 'M' ? (
            <McqComponent
              crntQIndex={crntQIndex}
              ques={question}
              response={responses[crntQIndex]}
              status={status[crntQIndex]}
              jumpToQ={this.jumpToQ}
              recRes={this.recRes}
              nextSec={this.nextSec}
            />
          ) : question[0] === 'C' ? (
            <CodingComponent
              myKey={myKey}
              crntQIndex={crntQIndex}
              testInfo={testInfo}
              ques={question}
              response={responses[crntQIndex]}
              recRes={this.recRes}
              theme={theme}
              fontS={fontS}
              setExamCompState={this.setMainCompState}
              tcR={tcRes[question.qIndex]}
              cdLangId={cdLangId}
              chngTCRes={this.chngTCRes}
              msgHolder={this.msgHolder}
              token={userInfo.token}
            />
          ) : question[0] === 'H' ? (
            <HTMLComponent
              myKey={myKey}
              crntQIndex={crntQIndex}
              testInfo={testInfo}
              ques={question}
              response={responses[crntQIndex]}
              recRes={this.recRes}
              theme={theme}
              fontS={fontS}
              notify={notify}
              msgHolder={this.msgHolder}
              // Used for confirmation in HTML Reset
              setExamCompState={this.setMainCompState}
            />
          ) : null}
          <Navigator
            id1={question[0] === 'M' ? 'qNav' : 'qNavCd'}
            id2={question[0] === 'M' ? 'qBtns' : 'qBtnsCd'}
            crntQIndex={crntQIndex}
            secInfo={secInfo}
            crntSec={crntSec}
            constrained={testInfo.constrained}
            nVisQ={nVisQ}
            revQ={revQ}
            ansQ={ansQ}
            ansRevQ={ansRevQ}
            total={total}
            status={status}
            jumpToQ={this.jumpToQ}
          />
        </main>
      </>
    );
  }
}
export default ExamComp;
