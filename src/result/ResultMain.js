import React, { Component } from 'react';
// JS
import LoginComp from './../login/loginComp';
import NavBar from './../navbar';
import ReqResponse from './../reqResponse.js';
import Preview from './showPreview';
import Scorecard from './scoreCard.js';
import McqRes from './showResMcq';
import CodingRes from './showResCoding';
import WebProgRes from './showResWebProg';
import ResNavigator from './responseNavigator';
import { notify } from './../common.js';
//
import './layout.css';

const apiUrl = import.meta.env.VITE_API_URL;
const appEnv = import.meta.env.VITE_APP_ENV;
const isProd = appEnv === 'PROD';

class ResultMain extends Component {
  constructor() {
    super();
    const stateObj = {
      loggedIn: false,
      cover: 'cover',
      action: -1,
      shwExmCode: null,
      crntQIndex: 0,
      previewData: -1,
      theme: 'chrome',
    };
    const themeStore = localStorage.getItem('theme');
    if (themeStore) stateObj.theme = themeStore;
    this.state = stateObj;
    //
    this.oldRequests = [];
    this.msgHolder = React.createRef();
    //
    this.showStatus = [
      'Not Visited Question',
      'Not Answered Question',
      'Not Answered but Marked for Review',
      'Answer & Marked for Review Question : was evaluated',
      'Answered Question',
    ];
  }
  setMainCompState = (obj) => {
    this.setState(obj);
  };
  fetchPreview = async (userInfo = false) => {
    try {
      let token;
      if (userInfo) token = userInfo.token;
      else token = this.state.userInfo.token;
      const promise = await fetch(`${apiUrl}/cand/resultPre/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: `_csrf=${token}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const response = await promise.json();
      //
      if (promise.status === 200 && promise.ok === true) {
        const data = JSON.parse(response.data);
        const nState = {
          previewData: data,
          cover: false,
        };
        // if userInfo is set then add State
        if (userInfo) {
          nState.loggedIn = true;
          nState.userInfo = userInfo;
        }
        //
        if (Object.keys(data).length === 0)
          notify(
            this.msgHolder,
            'e',
            '<h3>No Result / Participation Found for this Account.</h3>If you think this is an Error at our end,<br>you can Contact us 24 x 7.',
            10000
          );
        else nState.action = 0;
        this.setState(nState);
      } else if (response.error)
        notify(this.msgHolder, 'e', response.error.message);
      else notify(this.msgHolder, 'e', '');
    } catch (error) {
      notify(
        this.msgHolder,
        'e',
        'SERVER Connection Error<br>Check your Internet Connection'
      );
    }
  };
  showResponse = (response) => {
    const libQIndex = JSON.parse(response.libSel),
      ti = JSON.parse(window.atob(response.tsingif)),
      qb = window.atob(response.mybknait),
      res = window.atob(response.cwrnfreso),
      tcRes = window.atob(response.ifotrefres);
    let stateObj = {},
      crctOpt = JSON.parse(response.crctOpt);
    stateObj.sec = ti.secInfo;
    //
    let qBank = JSON.parse(qb);
    // Give Question Index to Each Question - to fascilate show examiner marking
    qBank.forEach((each, index) => {
      qBank[index] = { qIndex: index, ...each };
    });
    //
    if (ti.isPool) {
      const newQBank = [],
        nCrctOpt = [];
      // Convert libQIndex in 1D array and extract alloted questions
      libQIndex.forEach((each) => {
        each.forEach((qNo) => {
          newQBank.push(qBank[qNo - 1]);
          nCrctOpt.push(crctOpt[qNo - 1]);
        });
      });
      qBank = newQBank;
      crctOpt = nCrctOpt;
    }
    stateObj.quesBank = qBank;
    stateObj.status = JSON.parse(response.myNpQVal);
    stateObj.response = JSON.parse(res);
    stateObj.tcRes = JSON.parse(tcRes);
    stateObj.cdLangId = JSON.parse(response.cdLangUsed);
    stateObj.crctOptArr = crctOpt;
    stateObj.scoreDetailed = JSON.parse(response.scoreDet);
    stateObj.score = response.total;
    stateObj.exmnrM = JSON.parse(response.exmnrMark);
    stateObj.exmnrC = JSON.parse(response.exmnrCmnt);
    stateObj.negmark = response.neg;
    stateObj.final = response.final;
    stateObj.action = 2;
    stateObj.cover = false;
    if (response.Rank) {
      stateObj.Rank = response.Rank;
      stateObj.ScoreRank = response.ScoreRank;
    }
    this.setState(stateObj);
  };
  fetchData = async (passcode) => {
    try {
      const old = this.oldRequests;
      for (let i = 0; i < old.length; i++) {
        const each = old[i];
        if (each.passcode === passcode) {
          this.showResponse(each.response);
          return false;
        }
      }
      const promise = await fetch(`${apiUrl}/cand/showResult/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: `passcode=${passcode}&_csrf=${this.state.userInfo.token}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        this.oldRequests.push({ passcode: passcode, response: response });
        this.showResponse(response);
      } else if (response.error)
        notify(this.msgHolder, 'e', response.error.message);
      else notify(this.msgHolder, 'e', '');
    } catch (error) {
      notify(
        this.msgHolder,
        'e',
        'SERVER Connection Error<br>Check your Internet Connection'
      );
    }
  };
  jumpToQ = (index) => {
    this.setState({ crntQIndex: index });
  };
  reqLogout = async () => {
    try {
      let promise = await fetch(`${apiUrl}/logout/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: `_csrf=${this.state.userInfo.token}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        notify(this.msgHolder, 's', response.msg);
        this.setState({ loggedIn: false });
      } else if (response.error)
        notify(this.msgHolder, 'e', response.error.message);
      else notify(this.msgHolder, 'e', '');
    } catch (error) {
      notify(
        this.msgHolder,
        'e',
        'Something went wrong.<br>OR<br>Unable to connect to Server.'
      );
    }
  };
  componentDidUpdate() {
    const { loggedIn, previewData } = this.state;
    if (previewData === -1 && loggedIn) this.fetchPreview();
  }
  componentDidMount() {
    const userInfo = JSON.parse(document.getElementById('userInfo').innerText);
    if (userInfo.loggedIn) this.fetchPreview(userInfo);
  }
  render() {
    const { loggedIn, action, previewData, cover } = this.state;
    if (!loggedIn)
      return <LoginComp setExamCompState={this.setMainCompState} />;
    else if (action === -1)
      return (
        <>
          <NavBar logOut={this.reqLogout} />
          {cover === false ? null : <ReqResponse wh={cover} />}
          <div id="msgHolder" ref={this.msgHolder}></div>
        </>
      );
    else if (action === 0)
      return (
        <>
          <NavBar logOut={this.reqLogout} />
          {cover === false ? null : <ReqResponse wh={cover} />}
          <Preview previewData={previewData} fetchData={this.fetchData} />
          <div id="msgHolder" ref={this.msgHolder}></div>
        </>
      );
    else if (action === 2) {
      const {
        crntQIndex,
        sec,
        userInfo,
        scoreDetailed,
        exmnrM,
        quesBank,
        Rank,
        ScoreRank,
        score,
        negmark,
        final,
      } = this.state;
      return (
        <>
          <NavBar logOut={this.reqLogout} />
          {cover === false ? null : <ReqResponse wh={cover} />}
          <div id="msgHolder" ref={this.msgHolder}></div>
          <main id="scoreCard">
            <Scorecard
              userInfo={userInfo}
              scoreDetailed={scoreDetailed}
              exmnrM={exmnrM}
              quesBank={quesBank}
              Rank={Rank}
              ScoreRank={ScoreRank}
              score={score}
              negmark={negmark}
              final={final}
            />
            <ResNavigator
              crntQIndex={crntQIndex}
              sec={sec}
              jumpToQ={this.jumpToQ}
              isScoreCard="Y"
              setMainCompState={this.setMainCompState}
            />
          </main>
        </>
      );
    }
    const {
      crntQIndex,
      sec,
      status,
      quesBank,
      response,
      tcRes,
      cdLangId,
      crctOptArr,
      scoreDetailed,
      exmnrM,
      exmnrC,
      theme,
    } = this.state;
    const ques = quesBank[crntQIndex];
    const type = ques[0];
    const statusShow = this.showStatus[status[crntQIndex]];
    return (
      <>
        <NavBar logOut={this.reqLogout} />
        {cover === false ? null : <ReqResponse wh={cover} />}
        <div id="msgHolder" ref={this.msgHolder}></div>
        <main id="resultMain">
          {type === 'M' ? (
            <McqRes
              crntQIndex={crntQIndex}
              response={response[crntQIndex]}
              score={scoreDetailed[crntQIndex]}
              status={statusShow}
              ques={ques}
              //
              crctOpt={crctOptArr[crntQIndex]}
            />
          ) : type === 'C' ? (
            <CodingRes
              crntQIndex={crntQIndex}
              response={response[crntQIndex]}
              score={scoreDetailed[crntQIndex]}
              status={statusShow}
              ques={ques}
              theme={theme}
              //
              tcR={tcRes[ques.qIndex]}
              cdLangId={cdLangId[ques.qIndex]}
              exmnrM={exmnrM ? exmnrM[ques.qIndex + 1] : ''}
              exmnrC={exmnrC ? exmnrC[ques.qIndex + 1] : ''}
            />
          ) : type === 'H' ? (
            <WebProgRes
              crntQIndex={crntQIndex}
              response={response[crntQIndex]}
              status={statusShow}
              ques={ques}
              theme={theme}
              //
              exmnrM={exmnrM ? exmnrM[ques.qIndex + 1] : ''}
              exmnrC={exmnrC ? exmnrC[ques.qIndex + 1] : ''}
            />
          ) : null}
          <ResNavigator
            crntQIndex={crntQIndex}
            sec={sec}
            jumpToQ={this.jumpToQ}
            setMainCompState={this.setMainCompState}
          />
        </main>
      </>
    );
  }
}
export default ResultMain;
