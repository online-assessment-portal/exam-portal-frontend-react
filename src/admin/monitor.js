import React, { Component } from 'react';
import Peer from 'peerjs';
import { io } from 'socket.io-client';
//
import { notify } from './../common.js';
//
import './monitor.css';
import AdminModal from './adminModal';
import ChatComp from './../ChatComponent';
import RenderVid from './renderVideo';
//
import { checkDev } from './../detectDev';

const apiUrl = import.meta.env.VITE_API_URL;
const appEnv = import.meta.env.VITE_APP_ENV;
const isProd = appEnv === 'PROD';

class Proctor extends Component {
  constructor() {
    super();
    this.state = {
      streamColl: [],
      chatWith: 0, // index of candidate
      show: -1, // -1 to show progress spinner, 0 to show proctoring Page(ie. Screens),1 to show all Candidates Briefs, 2 to show chat Window 3 to show Broadcast Window, 4 to show Single View, 5 to show Video Settings
      showVid: -1, // -1 to makeCall, 0 for none, 1 for both webcam and screen, 2 for webcam only, 3 for screen only
      // For Single Stream View
      vidIndex: -1,
      streamIndex: -1,
      alertR: [],
      alertG: [],
      isRecAll: false,
      recorderColl: [],
    };
    //
    this.newRegCandList = [];
    this.otherCand = [];
    this.myList = [];
    this.duplicateList = [];
    this.chatList = [];
    this.nMsgCtr = [];
    //
    this.dataConn = [];
    this.mediaConn = [];
    this.mediaCallHist = [];
    //
    this.options = { mimeType: 'video/webm;codecs=vp8,opus' };
    //
    this.msgHolder = React.createRef();
    //
    this.colInput = React.createRef();
    //
    this.adminVideo = React.createRef();
    this.gridForm = React.createRef();
    this.downloadLink = React.createRef();
  }
  setMainCompState = (obj) => {
    this.setState(obj);
  };
  processDevCheck = () => {
    const res = checkDev();
    if (res.isOpen || navigator.maxTouchPoints === 1) {
      const { myKey, loggedIn } = this.state;
      if (loggedIn) this.storeViolation(myKey, 'devT');
      window.alert(
        "Close developer Tools/Inspect.\nFor Security Reasons and to maintain connection ethics we don't allow Inspecting."
      );
      setTimeout(() => {
        this.processDevCheck();
      }, 3000);
    }
  };
  reqLogout = async () => {
    try {
      const promise = await fetch(`${apiUrl}/logout/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: `_csrf=${this.state.token}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true)
        notify(
          this.msgHolder,
          's',
          'Logout Success.<br>Please close all Browser TABs'
        );
      else if (response.error)
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
  changeLayout = (e) => {
    e.preventDefault();
    const col = this.colInput.current.value;
    const clientWid = window.innerWidth;
    const calc = (clientWid - col * 25) / col - 10;
    this.adminVideo.current.style.gridTemplateColumns = `repeat(auto-fill, ${calc}px)`;
  };
  closeAllConn = (peerId, mediaOnly = false) => {
    // mediaOnly 1 to close media anly
    // peerId = -1 close All
    if (peerId === -1) {
      notify(
        this.msgHolder,
        'e',
        '<h3>Please Wait</h3>Closing All Connections.<br>Wait for confirmation from Server.'
      );
      // Close from Client Side - Data Conn + Media Conn
      this.dataConn.forEach((each) => each.close());
      this.mediaConn.forEach((each) => each.close());
      this.dataConn = [];
      this.mediaConn = [];
      // Verify disconnection from Server Side - Close if connection is still intact
      const allConn = this.peerConn.connections;
      for (const key in allConn) {
        if (Object.hasOwnProperty.call(allConn, key)) {
          const each = allConn[key];
          while (each.length) each.forEach((eachConn) => eachConn.close());
        }
      }
      notify(this.msgHolder, 's', '<h3>Done<br>Close this TAB after 3sec</h3>');
    } else {
      // Close for one Peer both media+data
      if (mediaOnly === false)
        for (let i = 0; i < this.dataConn.length; i++) {
          const each = this.dataConn[i];
          if (each.peer === peerId) {
            each.close();
            if (this.dataConn.length === 1) this.dataConn = [];
            else this.dataConn.splice(i, 1);
          }
        }
      for (let i = 0; i < this.mediaConn.length; ) {
        const each = this.mediaConn[i];
        if (each.peer === peerId) {
          each.close();
          if (this.mediaConn.length === 1) this.mediaConn = [];
          else this.mediaConn.splice(i, 1);
        } else i++;
      }
      // Verify disconnection from Server Side - Close if connection is still intact
      const allConn = this.peerConn.connections;
      for (const key in allConn) {
        if (key === peerId) {
          if (Object.hasOwnProperty.call(allConn, key)) {
            const each = allConn[key];
            for (let i = 0; i < each.length; i++) {
              each.forEach((eachConn) => {
                // label is in data connection
                // in case media only label is blank
                if (!mediaOnly || !eachConn.label) eachConn.close();
              });
            }
          }
          break;
        }
      }
    }
  };
  endTest = (mListIndex) => {
    const cand = this.myList[mListIndex];
    if (
      !window.confirm(
        `Are you sure you want to End Test of ${cand.name}\nEmail: ${cand.email}\nOK - for Yes\nCancel - to cancel`
      )
    )
      return false;
    notify(
      this.msgHolder,
      's',
      "Process initiated.<br>Wait for Status from Server.<br>Please don't perform any action till response is received."
    );
    this.socket.emit('endTest', cand.socketId, (response) => {
      if (response.done) {
        const updated = this.removeLive(cand);
        // ae - Admin Ended Test
        updated.socketId = 'ae';
        this.myList[mListIndex] = updated;
        this.closeAllConn(cand.peerId);
        // Remove Video Stream
        let { streamColl } = this.state;
        if (streamColl.length) {
          for (let i = 0; i < streamColl.length; i++) {
            const each = streamColl[i];
            if (each.myListIndex === mListIndex) {
              if (streamColl.length > 1) streamColl.splice(mListIndex, 1);
              else streamColl = [];
              this.setState({ streamColl: streamColl });
              //
              if (this.mediaCallHist.length > 1)
                this.mediaCallHist.splice(i, 1);
              else this.mediaCallHist = [];
              //
              break;
            }
          }
        } else this.forceUpdate();
        notify(this.msgHolder, 'e', 'Ended');
      } else
        notify(
          this.msgHolder,
          'e',
          "Sorry due to some issues the Test can't be ended.<br>Please retry after few minutes."
        );
    });
  };
  getSupportedRec = () => {
    const list = [
      'video/webm',
      'video/webm;codecs=vp8',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8.0',
      'video/webm;codecs=vp9.0',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8,pcm',
      'video/WEBM;codecs=VP8,OPUS',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,vp9,opus',
    ];
    for (let i = 0; i < list.length; i++) {
      const each = list[i];
      if (MediaRecorder.isTypeSupported(each)) {
        this.options = { mimeType: each };
        break;
      }
    }
  };
  startRecording = async (strmObj, strCollI, strmI, res) => {
    return new Promise((resolve, reject) => {
      const streamObj = strmObj.streams[strmI];
      const myListI = strmObj.myListIndex;
      //
      const recorder = new MediaRecorder(streamObj.stream, this.options);
      let data = [];
      recorder.ondataavailable = (event) => data.push(event.data);
      //
      recorder.onstart = () => {
        const recI = strCollI * 2 + strmI;
        if (res) res({ recI: recI, rec: recorder });
        else {
          this.setState((prevState) => {
            prevState.recorderColl[recI] = recorder;
            return prevState;
          });
        }
      };
      recorder.start();
      //
      recorder.onstop = () => {
        resolve({ chunks: data, myListI: myListI });
      };

      recorder.onerror = (event) => reject(event.name);
    });
  };
  initiateRec = (strmObj, strCollI, strmI, res) => {
    // res===true to Toggle Recording State - For toggling with buttons
    // Check if Already Recording only if initiated by rec button
    if (res === true) {
      // If Already Recording STOP
      const recIndex = strCollI * 2 + strmI;
      const { recorderColl } = this.state;
      const recorderChk = this.state.recorderColl[recIndex];
      if (recorderChk && recorderChk.state === 'recording') {
        recorderChk.stop();
        recorderColl[recIndex] = null;
        this.setState({ recorderColl: recorderColl });
        return false;
      }
      // make false since it's value is passed to startRec() - if will be true the function will undertand it to be resolving function
      res = false;
    }
    // Else initiate Recording
    if (strmObj === false) strmObj = this.state.streamColl[strCollI];
    //
    this.startRecording(strmObj, strCollI, strmI, res)
      .then((data) => {
        //
        const myList = this.myList[data.myListI];
        let recordedBlob = new Blob(data.chunks, {
          type: this.options.mimeType,
        });
        const downloadE = this.downloadLink.current;
        downloadE.href = URL.createObjectURL(recordedBlob);
        // Change name in case name from myList get removed faster when removing prcotoring
        downloadE.download =
          myList.email +
          '_' +
          (strmObj.streams[strmI].req === 'cam' ? 'webcam' : 'screen') +
          '.webm';
        downloadE.click();
      })
      .catch((err) => {
        notify(this.msgHolder, 'e', 'Unable to start recording.');
      });
  };
  // Stop Recoding in case candidate dis-connected
  checkAndStopRec = (myListIndex) => {
    // Get myListIndex - search of that candidate streams in streamColl - if recorder stop and put as waiting recorder
    const { streamColl, recorderColl } = this.state;
    for (let strCollI = 0; strCollI < streamColl.length; strCollI++) {
      const each = streamColl[strCollI];
      if (each.myListIndex === myListIndex) {
        for (let strI = 0; strI < each.streams.length; strI++) {
          const recIndex = strCollI * 2 + strI;
          const recorder = recorderColl[recIndex];
          if (recorder && recorder.state === 'recording') {
            recorder.stop();
            this.setState((prevState) => {
              prevState.alertG.push(`Stopped Recording: Index${strI}`);
              return prevState;
            });
            recorderColl[recIndex] = 'w';
          }
        }
        break;
      }
    }
    this.setState({ recorderColl: recorderColl });
  };
  //
  checkAndStartRec = (strmObj, strCollI, isRecAll) => {
    return new Promise((resolve) => {
      const promiseColl = [];
      for (let i = 0; i < strmObj.streams.length; i++) {
        const recorder = this.state.recorderColl[strCollI * 2 + i];
        if ((isRecAll && recorder === undefined) || recorder === 'w') {
          const promise = new Promise((res) =>
            this.initiateRec(strmObj, strCollI, i, res)
          );
          // Each promsise get recorder Object as resolved on start for 1 Stream
          // so incase of 2 Streams - each stream has own recorderObj response is array of 2 recorder Object
          promiseColl.push(promise);
        }
      }
      // response is array of recorder object
      Promise.all(promiseColl).then((allRecorder) => {
        resolve(allRecorder);
      });
    });
  };
  //
  genRecorderColl = (allRecorder) => {
    const { recorderColl } = this.state;
    allRecorder.forEach((recEchI) => {
      recEchI.forEach((eachStrmRec) => {
        recorderColl[eachStrmRec.recI] = eachStrmRec.rec;
      });
    });
    return recorderColl;
  };
  initiateRecBulk = (streamColl, fromI) => {
    const promiseColl = [];
    const isRecAll = this.state.isRecAll;
    for (let i = 0; i < streamColl.length; i++) {
      const promise = this.checkAndStartRec(streamColl[i], fromI, isRecAll);
      promiseColl.push(promise);
      fromI++;
    }
    Promise.all(promiseColl)
      .then((allRecorder) => {
        if (allRecorder.length) {
          const genColl = this.genRecorderColl(allRecorder);
          this.setState({ recorderColl: genColl });
        }
      })
      .catch((allRecorder) => {
        if (allRecorder.length) {
          const genColl = this.genRecorderColl(allRecorder);
          this.setState({ recorderColl: genColl });
        }
      });
  };
  //
  recordAll = () => {
    const { isRecAll, showVid } = this.state;
    if (!isRecAll) {
      // Start Recoding
      notify(
        this.msgHolder,
        's',
        'All current and upcoming streams will be recorded.<br>Keep Patience.',
        10000
      );
      const stateObj = { isRecAll: true, showVid: 2 };
      if (showVid === 1) stateObj.showVid = 1;
      this.setState(stateObj, () => {
        if (showVid === -1) {
          this.makeVideoCallAll();
          return false;
        }
        // Record Using Streams
        const { streamColl } = this.state;
        if (streamColl.length) this.initiateRecBulk(streamColl, 0);
        else
          notify(
            this.msgHolder,
            's',
            'No Streams to record now.<br>but upcoming Streams will be automatically recorded.'
          );
      });
    } else {
      // End Recoding
      notify(
        this.msgHolder,
        's',
        'No upcoming streams will be automatically recorded.<br>However the old streams on which recorder was set (if any) will continue to record.'
      );
      const { streamColl, recorderColl } = this.state;
      if (streamColl.length)
        streamColl.forEach((each, index) => {
          for (let strI = 0; strI < each.streams.length; strI++) {
            const recIndex = index * 2 + strI;
            // If waiting streams ie 'w' then cancel wait else stop recording
            const recorder = recorderColl[recIndex];
            if (recorder && recorder.state === 'recording') recorder.stop();
            recorderColl[recIndex] = null;
          }
        });
      else notify(this.msgHolder, 's', 'No Recordings Available.');
      this.setState({ isRecAll: false, recorderColl: recorderColl });
    }
  };
  muteAll = () => {
    const allVid = document.getElementsByClassName('webcam');
    for (let i = 0; i < allVid.length; i++) allVid[i].muted = true;
    const allUnmute = document.getElementsByClassName('fa-microphone');
    for (let i = 0; i < allUnmute.length; i++)
      allUnmute[i].className = 'fa fa-microphone-slash';
  };
  toggleMute = (icon, strmColI, strmI) => {
    const vidEle = this.allVid[strmColI * 2 + strmI];
    if (vidEle.muted) {
      vidEle.muted = false;
      icon.className = 'fa fa-microphone';
    } else {
      vidEle.muted = true;
      icon.className = 'fa fa-microphone-slash';
    }
  };
  //
  determineCallReq = (cand) => {
    const { testInfo } = this.state;
    let req = [];
    if (cand.cam === true && (testInfo.cam || testInfo.mic)) {
      req.push('cam');
      if (cand.scrn === true && testInfo.win) req.push('scrn');
    } else if (cand.scrn === true && testInfo.win) req.push('scrn');
    return req;
  };
  // Setup Call Type and send Required Stream using PeerJS data connection
  setupCall = (connIndex, data) => {
    return new Promise((res, rej) => {
      const timeout = setTimeout(() => rej(), 3000);
      const conn = this.dataConn[connIndex];
      if (!(conn && conn.open)) rej();
      conn.send(data);
      conn.once('data', (data) => {
        clearTimeout(timeout);
        if (data.type === 'ct' && data.accept === 1) res();
        else rej();
      });
    });
  };
  //
  callPeer = async (connIndex, request) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(), 4000);
      this.setupCall(connIndex, request)
        .then(() => {
          const callConn = this.peerConn.call(
            this.dataConn[connIndex].peer,
            this.adminMedia
          );
          this.mediaConn.push(callConn);
          //
          callConn.on('stream', (candMediaStream) => {
            clearTimeout(timeout);
            resolve(candMediaStream);
          });
        })
        .catch(() => {
          clearTimeout(timeout);
          reject();
        });
    });
  };
  getCandStream = async (dConnIndex, req) => {
    return new Promise((res, rej) => {
      let streams = [];
      // ct - call type
      this.callPeer(dConnIndex, { type: 'ct', req: req[0] })
        .then((candStream) => {
          streams.push({ req: req[0], stream: candStream });
        })
        .then(() => {
          if (req[1])
            this.callPeer(dConnIndex, {
              type: 'ct',
              req: req[1],
            })
              .then((candStream_1) => {
                streams.push({ req: req[1], stream: candStream_1 });
                res(streams);
              })
              .catch(() => res(streams));
          else res(streams);
        })
        .catch(() => rej(0));
    });
  };
  makeVideoCallAll = () => {
    const { testInfo, streamColl } = this.state;
    let req = [],
      promiseColl = [],
      nStreamColl = [];
    this.myList.forEach((each, index) => {
      // Check if stream is available
      for (let i = 0; i < streamColl.length; i++)
        if (streamColl[i].myListIndex === index) return false;
      //
      req = [];
      if (each.cam === true && (testInfo.cam || testInfo.mic)) {
        req.push('cam');
        if (each.scrn === true && testInfo.win) req.push('scrn');
      } else if (each.scrn === true && testInfo.win) req.push('scrn');
      // If something is available then call else skip candidate
      if (req.length) {
        // list index equals dataConn Index
        const promise = this.getCandStream(index, req).then((streams) => {
          const streamObj = { myListIndex: index, streams: streams };
          //
          this.mediaCallHist[index] = true;
          //
          nStreamColl.push(streamObj);
        });
        promiseColl.push(promise);
      }
    });
    const { isRecAll, showVid } = this.state;
    let from = streamColl.length;
    if (from > 0) from -= 1;
    //
    const process = () => {
      // Show if any stream is available
      if (nStreamColl.length) {
        // 2nd param of initiate_Rec_Bulk is index of streamColl from which recording has to be started
        if (isRecAll) this.initiateRecBulk(nStreamColl, from);
        const newState = {
          streamColl: [...streamColl, ...nStreamColl],
          show: 0,
        };
        if (showVid === -1) newState.showVid = 1;
        this.setState(newState);
      }
    };
    Promise.all(promiseColl)
      .then(() => {
        process();
      })
      .catch(() => {
        notify(
          this.msgHolder,
          'e',
          'Failed to fetch all or some of the Streams. - make_Video_Call_All Request'
        );
        process();
      });
  };
  fetchStream = (myListI, check = false) => {
    const cand = this.myList[myListI];
    // Close Previous Media Connection if any
    if (check) {
      // Stop if Refreshing Connection
      this.checkAndStopRec(myListI);
      //
      const dataConn = this.dataConn[myListI];
      if (dataConn && dataConn.open) dataConn.send({ closeMedia: true });
      // Close Current Media Connection Only in case of refreshing Media Call
      this.closeAllConn(cand.peerId, true);
      //
      //
      this.socket.emit('closeMedia', {
        socketId: cand.socketId,
        peerId: this.peerConn._id,
      });
      // const peerId = cand.peerId;
      // for (let i = 0; i < this.mediaConn.length; ) {
      // 	const each = this.mediaConn[i];
      // 	if (each.peer === peerId) {
      // 		each.close();
      // 		if (this.mediaConn.length === 1) this.mediaConn = [];
      // 		else this.mediaConn.splice(i, 1);
      // 	} else i++;
      // }
      // this.closeAllConn(peerId,true)
    }
    //
    // myListI equals dataConn Index
    const { show, showVid } = this.state;
    const req = this.determineCallReq(cand);
    if (req.length)
      this.getCandStream(myListI, req)
        .then((streams) => {
          const streamObj = { myListIndex: myListI, streams: streams };
          //
          this.mediaCallHist[myListI] = true;
          //
          const { streamColl } = this.state;
          // if previous streams is present else add to stream_Collection
          // wasReplaced stores index of current stream obj in stream_Coll
          let wasReplaced = false;
          for (let i = 0; i < streamColl.length; i++) {
            const each = streamColl[i];
            if (each.myListIndex === myListI) {
              streamColl[i] = streamObj;
              wasReplaced = i;
              break;
            }
          }
          if (wasReplaced === false) wasReplaced = streamColl.push(streamObj);
          this.initiateRecBulk([streamObj], wasReplaced);
          //
          const nState = { streamColl: streamColl, show: 0 };
          if (showVid === -1) nState.showVid = 1;
          this.setState(nState, () => {
            if (showVid !== 0) this.forceUpdate();
          });
        })
        .catch(() => {
          if (check)
            notify(
              this.msgHolder,
              'e',
              `re-Calling Video Stream: No Stream to fetch.<br>Name: ${cand.name}<br>Email: ${cand.email}`
            );
          else
            this.setState((prevState) => {
              prevState.alertR.push(
                `re-Calling Video Stream: No Stream to fetch.<br>Name: ${cand.name} &emsp; Email: ${cand.email}`
              );
              return prevState;
            });
        });
    else if (show === 1 || show === 2) this.forceUpdate();
    // Force Update in case of 1.Brief View && 2.ChatComponent is Open so that it receives the fresh data connection
    // If Video Proctoring it will already force Update to update video
  };
  reconnectAndCall = (myListI) => {
    const { passcode } = this.state;
    const cand = this.myList[myListI];
    // myListI equals dataConn Index
    this.requestProctoring(cand.peerId, myListI, false, passcode).then(() => {
      if (this.mediaCallHist[myListI]) this.fetchStream(myListI);
    });
  };
  //
  toggleVideoRender = () => {
    const { showVid } = this.state;
    if (showVid === -1 && !this.myList.length) {
      notify(this.msgHolder, 'e', 'Proctoring List Empty');
      return false;
    }
    if (showVid === -1) {
      notify(this.msgHolder, 's', 'Initiated.<br>Keep Patience.');
      this.makeVideoCallAll();
    } else if (showVid > 0) {
      this.setState({ showVid: 0 });
      notify(this.msgHolder, 's', 'Auto fetch stream Stopped.');
    } else this.setState({ showVid: 1 });
  };
  //
  createMediaStreamFake = () => {
    return new MediaStream([
      this.createEmptyAudioTrack(),
      this.createEmptyVideoTrack({ width: 640, height: 480 }),
    ]);
  };
  createEmptyVideoTrack = ({ width, height }) => {
    const canvas = Object.assign(document.createElement('canvas'), {
      width,
      height,
    });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    const track = stream.getVideoTracks()[0];
    return Object.assign(track, { enabled: false });
  };
  createEmptyAudioTrack = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    return Object.assign(track, { enabled: false });
  };
  toggleGridForm = () => {
    const sty = this.gridForm.current.style;
    if (sty.display !== 'block') {
      sty.display = 'block';
      sty.animation = 'fadeInRight 200ms ease-out';
    } else {
      sty.animation = 'fadeOutRight 200ms ease-out';
      setTimeout(() => {
        sty.display = 'none';
        sty.animation = 'unset';
      }, 180);
    }
  };
  //
  setViolationCand = (conn, setFor, setValue) => {
    this.setState((prevState) => {
      prevState.alertR.push(
        ` Candidate either changed Device or found tampering.`
      );
      return prevState;
    });
    // Send the Value to set to Candidate Violation Storage
    conn.send({ type: 'setVio', setFor: setFor, setVal: setValue });
  };
  //
  addDataConnListPerm = (conn) => {
    conn.on('data', (data) => {
      if (data.type === 'verifyReq') conn.send({ type: 'verifyRes' });
      else if (data.type === 'chat') {
        let { chatWith, show } = this.state;
        //
        const old = localStorage.getItem(`chat_${data.from}`);
        let newChat = { nMsg: 1, of: data.from, store: [] };
        if (old) {
          newChat = JSON.parse(old);
          if (typeof chatWith === 'number' && isFinite(chatWith))
            chatWith = this.myList[0].email;
          if (data.from === chatWith && show === 2) newChat.nMsg = 0;
          else newChat.nMsg += 1;
        }
        newChat.store.push({ in: data.msg });
        localStorage.setItem(`chat_${data.from}`, JSON.stringify(newChat));
        // Message Notification
        if (show !== 2 || chatWith !== data.from)
          this.setState((prevState) => {
            prevState.alertG.push(`${newChat.nMsg} new Message(s)`);
            return prevState;
          });
        // Find my list index and set new Message Counter
        for (let i = 0; i < this.myList.length; i++) {
          const each = this.myList[i];
          if (each.email === data.from) {
            this.nMsgCtr[i] = newChat.nMsg;
            break;
          }
        }
        //
        if (show === 2) this.forceUpdate();
        //
      } else if (data.type === 'vio') {
        let myKey = `${data.code}_${data.email}`,
          userObj = {},
          found = false,
          i = 0;
        // Find User Index in myList
        for (; i < this.myList.length; i++) {
          const each = this.myList[i];
          if (each.email === data.email) {
            userObj = each;
            found = true;
            break;
          }
        }
        if (found === false) return false;
        // Process Violation + Device Change / localStorage clear
        let key;
        if (data.wfo) key = 'wfo';
        else if (data.rsz) key = 'rsz';
        else if (data.fsv) key = 'fsv';
        else if (data.devT) key = 'devT';
        else if (data.mpv) key = 'mpv';
        else if (data.spv) key = 'spv';
        else return false;
        //
        const storeKey = `${myKey}_${key}`;
        const onMyStore = parseInt(localStorage.getItem(myKey));
        if (userObj.vData[key] < data[key]) {
          userObj.vData[key] = data[key];
          this.myList[i] = userObj;
        }
        if (!onMyStore) data[key] += 1;
        else if (data[key] === -1) {
          data[key] += 1;
          this.setViolationCand(conn, key, onMyStore + 1);
        }
        localStorage.setItem(storeKey, data[key]);
        //
        this.setState((prevState) => {
          prevState.alertR.push(
            `${
              data.wfo
                ? `${userObj.vData.wfo} Window Violations`
                : data.rsz
                  ? `${userObj.vData.rsz} Resize Violations`
                  : data.fsv
                    ? `${userObj.vData.fsv} Full-Screen Violations`
                    : data.devT
                      ? `${userObj.vData.devT} Test Tamper - Red`
                      : data.mpv
                        ? `${userObj.vData.mpv} Media Proctoring Violations`
                        : data.spv
                          ? `${userObj.vData.spv} Screen Proctoring Violations`
                          : ''
            }. &emsp; Name: ${userObj.name} &emsp; Email: ${userObj.email}`
          );
          return prevState;
        });
        if (this.state.show === 1) this.forceUpdate();
      } else if (data.type === 're-call') {
        const email = data.email;
        for (let i = 0; i < this.myList.length; i++) {
          const each = this.myList[i];
          if (each.email === email) {
            if (!data.proctor)
              this.setState((prevState) => {
                prevState.alertR.push(
                  `Tried to alter video stream.<br>Name: ${data.name} &emsp; Email: ${email}`
                );
                return prevState;
              });
            if (this.mediaCallHist[i]) this.fetchStream(i, true);
            break;
          }
        }
      }
    });
  };
  makeDataConnection = (peerId, index) => {
    let timeout;
    return new Promise((res, rej) => {
      const reject = () => {
        this.closeAllConn(dataConn.peer);
        const rejObj = { index: index, isUnreachable: true };
        rej(rejObj);
      };
      timeout = setTimeout(() => {
        reject();
      }, 10000);
      const dataConn = this.peerConn.connect(peerId);
      dataConn.on('open', () => {
        // Request Verification from Candidate Side that no previous admin Exists
        dataConn.send({ type: 'verifyReq' });
      });
      dataConn.once('data', (data) => {
        if (data.type === 'verifyRes') {
          if (data.proctorMe) {
            const response = { conn: dataConn, index: index };
            clearTimeout(timeout);
            res(response);
          } else {
            clearTimeout(timeout);
            rej(index);
          }
        }
      });
      // dataConn.on("close", () => {
      // 	clearTimeout(timeout);
      // 	reject();
      // });
    });
  };
  //
  closeAllPeer = () => {
    if (
      !window.confirm(
        "Are you sure you want to dis-connect all the connections to Server and Exit.\nPlease note that you must disconnect before exiting, else it will create an extra load both on the Server and on the Candidate's connection."
      )
    )
      return false;
    // Close all recorder
    const { recorderColl } = this.state;
    recorderColl.forEach((each, index) => {
      if (each && each.state === 'recording') each.stop();
      recorderColl[index] = null;
    });
    this.setState({ recorderColl: recorderColl });
    // Send Peer to Close All
    const data = { closeAll: true };
    this.dataConn.forEach((each) => {
      each.send(data);
    });
    // Close form Admin Side
    this.closeAllConn(-1);
    // Socket Side Close
    this.socket.emit('proctorCloseAll', {
      passcode: this.state.passcode,
      peerId: this.peerConn._id,
    });
  };
  //
  setOneByOne = (myKey, key, cand) => {
    const storeKey = `${myKey}_${key}`;
    const onMyStore = parseInt(localStorage.getItem(storeKey));
    if (onMyStore) {
      if (onMyStore < cand.vData[key])
        localStorage.setItem(storeKey, cand.vData[key]);
      else cand.vData[key] = onMyStore;
    }
    return cand;
  };
  setViolationData = (passcode, cand, index) => {
    const myKey = `${passcode}_${cand.email}`;
    const keyColl = ['wfo', 'rsz', 'fsv', 'devT', 'mpv', 'spv'];
    keyColl.forEach((each) => {
      cand = this.setOneByOne(myKey, each, cand);
    });
    this.myList[index] = cand;
  };
  //
  setNMsgCtr = (email, index) => {
    let store = localStorage.getItem(`chat_${email}`);
    if (store) {
      store = JSON.parse(store);
      this.nMsgCtr[index] = store.nMsg;
    }
  };
  //
  requestProctoring = (peerId, index, isNew, passcode) => {
    return this.makeDataConnection(peerId, index)
      .then((response) => {
        if (isNew) {
          // Add the Verified Candidate
          this.dataConn.push(response.conn);
          const nLen = this.myList.push(this.otherCand[response.index]);
          this.setViolationData(
            passcode,
            this.otherCand[response.index],
            nLen - 1
          );
          this.setNMsgCtr(this.otherCand[response.index].email, nLen - 1);
          // Remove that candidate from other Candidate List
          this.otherCand[response.index] = null;
        } else this.dataConn[response.index] = response.conn;
        this.addDataConnListPerm(response.conn);
      })
      .catch((rejIndex) => {
        let rejCand = '',
          isUnreachable = false;
        if (typeof rejIndex === 'object') {
          rejIndex = rejIndex.index;
          isUnreachable = true;
        }
        if (isNew) rejCand = this.otherCand[rejIndex];
        else rejCand = this.myList[rejIndex];
        if (rejCand)
          notify(
            this.msgHolder,
            'e',
            `Candidate ${
              isUnreachable ? 'Unreachable' : 'Already being Proctored'
            }<br>Name: ${rejCand.name}<br>Email: ${rejCand.email}`,
            10000
          );
      });
  };
  endMediaCall = (listIndex) => {
    const cand = this.myList[listIndex];
    //
    this.checkAndStopRec(listIndex);
    //
    const dataConn = this.dataConn[listIndex];
    if (dataConn && dataConn.open) dataConn.send({ closeMedia: true });
    // Close Media Connection only
    this.closeAllConn(cand.peerId, true);
    //
    this.rmvStream(listIndex);
    //
    this.socket.emit('closeMedia', {
      socketId: cand.socketId,
      peerId: this.peerConn._id,
    });
  };
  rmvStream = (listIndex, cand = false) => {
    // In case Proctoring is taken down - delete button
    // Remove from my list and add back to other cand list
    const process = (stateObj) => {
      if (this.myList.length > 1) this.myList.splice(listIndex, 1);
      else this.myList = [];
      this.otherCand.push(cand);
      this.setState(stateObj);
    };
    // Remove Video Stream
    let { streamColl, recorderColl } = this.state;
    //
    const stateObj = {};
    //
    if (streamColl.length) {
      for (let i = 0; i < streamColl.length; i++) {
        const each = streamColl[i];
        if (each.myListIndex === listIndex) {
          const promiseColl = [];
          const streams = each.streams;
          // Stop Recording if any
          for (let j = 0; j < streams.length; j++) {
            const recorder = recorderColl[i * 2 + j];
            if (recorder && recorder.state === 'recording') {
              const promise = new Promise((resolve) => {
                recorder.addEventListener('stop', () => {
                  resolve(i * 2 + j);
                });
                recorder.stop();
              });
              promiseColl.push(promise);
            }
          }
          //
          if (streamColl.length > 1) streamColl.splice(i, 1);
          else streamColl = [];
          //
          if (this.mediaCallHist.length > 1) this.mediaCallHist.splice(i, 1);
          else this.mediaCallHist = [];
          // Assign New my List index in case remove proctor
          if (cand)
            for (let j = 0; j < streamColl.length; j++) {
              const myListI = streamColl[j].myListIndex;
              if (myListI > listIndex) streamColl[j].myListIndex = myListI - 1;
            }
          stateObj.streamColl = streamColl;
          // If recorder found wait for recodings to stop
          if (promiseColl.length) {
            // to remove warning copy in another variable and change
            let recColl = recorderColl;
            Promise.all(promiseColl).then((stopped) => {
              stopped.forEach((each) => {
                if (recColl.length > 1) recColl.splice(each, 1);
                else recColl = [];
              });
              stateObj.recorderColl = recColl;
              //
              if (cand) process(stateObj);
              else this.setState(stateObj);
            });
          } else {
            if (cand) process(stateObj);
            else this.setState(stateObj);
          }
          break;
        }
      }
    } else {
      stateObj.streamColl = [];
      if (cand) process(stateObj);
      else this.setState(stateObj);
    }
  };
  rmvOneFrmMyList = (listIndex) => {
    const cand = this.myList[listIndex];
    const dataConn = this.dataConn[listIndex];
    if (dataConn && dataConn.open) dataConn.send({ closeAll: true });
    //
    this.socket.emit('proctorClose', {
      socketId: cand.socketId,
      peerId: this.peerConn._id,
    });
    // close connections from proctor side
    this.closeAllConn(cand.peerId);
    //
    this.rmvStream(listIndex, cand);

    notify(
      this.msgHolder,
      's',
      `Proctoring taken down for-:Name: ${cand.name}<br>Email: ${cand.email}.`
    );
  };
  addOneToMyList = (listIndex) => {
    const cand = this.otherCand[listIndex];
    const { passcode, showVid } = this.state;
    if (cand.peerId)
      this.requestProctoring(cand.peerId, listIndex, true, passcode).then(
        () => {
          // Check if Proctoring request was success
          if (!this.otherCand[listIndex]) {
            // Remove from other cand list as it was added to myList
            if (this.otherCand.length === 1) this.otherCand = [];
            else this.otherCand.splice(listIndex, 1);
            // Make Call Request if Stream has already been initiated
            if (showVid !== -1) {
              const candIndex = this.myList.length - 1;
              const req = this.determineCallReq(this.myList[candIndex]);
              if (req.length)
                this.getCandStream(candIndex, req)
                  .then((streams) => {
                    const streamObj = {
                      myListIndex: candIndex,
                      streams: streams,
                    };
                    //
                    this.mediaCallHist[candIndex] = true;
                    //
                    const { streamColl } = this.state;
                    const len = streamColl.push(streamObj);
                    this.initiateRecBulk([streamObj], len - 1);
                    this.setState({ streamColl: streamColl });
                  })
                  .catch(() => {
                    notify(
                      this.msgHolder,
                      'e',
                      `No Stream to fetch.<br>Name: ${cand.name}<br>Email: ${cand.email}`,
                      10000
                    );
                    this.forceUpdate();
                  });
            } else this.forceUpdate();
          }
        }
      );
  };
  addToMyList = (from, to) => {
    const { passcode } = this.state;
    // from - to addition
    this.setState({ show: -1 });
    let promiseColl = [];
    for (let i = from; i < to; i++) {
      const each = this.otherCand[i];
      if (each.peerId) {
        const promise = this.requestProctoring(each.peerId, i, true, passcode);
        promiseColl.push(promise);
      }
    }
    Promise.all(promiseColl)
      .then(() => {
        // Prepare New List of other Candidate List
        const newList = [];
        this.otherCand.forEach((each) => {
          if (each) newList.push(each);
        });
        this.otherCand = newList;
        //
        if (this.state.showVid !== -1) this.makeVideoCallAll();
        else this.setState({ show: 1 });
      })
      .catch(() => {
        notify(this.msgHolder, 'e', 'Addding to your List Failed');
      });
  };
  //
  initiatePeerConn = (pser) => {
    return new Promise((resolve) => {
      const peerHost =
        pser === 0 ? 'mypeercleanserve.herokuapp.com' : 'mypeerserv.tk';
      this.peerConn = new Peer(undefined, {
        host: peerHost,
        secure: true,
        port: 443,
        path: '/peerjs/myapp',
      });
      //
      // setInterval(() => {
      // 	console.log(this.peerConn.connections);
      // }, 5000);
      //
      this.peerConn.on('open', () => {
        notify(this.msgHolder, 's', 'Connection 2: Intact');
        resolve();
      });
      //
      this.peerConn.on('close', () => {
        notify(this.msgHolder, 'e', 'Connection 2: Closed.');
        this.peerConn.destroy();
      });
      this.peerConn.on('disconnected', () => {
        notify(
          this.msgHolder,
          'e',
          'Connection 2: Disconnected.<br>Auto retry after 10s.<br>else you may choose to close all connections from your side <br>and refresh this Page to re-connect.',
          10000
        );
        setTimeout(() => {
          if (this.peerConn._destroyed)
            notify(
              this.msgHolder,
              'e',
              '<h3>Connection Ended</h3> - Close connections from your side and close this page.',
              60000
            );
          else this.peerConn.reconnect();
        }, 10000);
      });
      this.peerConn.on('error', (err) => {
        console.log(err, err.type);
        notify(
          this.msgHolder,
          'e',
          '<h3>Server 2 : Connection Error</h3>- Switch to High Speed Internet<br>- Prefer Chrome Browser<br>- Disable all extensions.<br>Still facing issue contact Webmaster',
          60000
        );
      });
      //
    });
  };
  checkDuplicateLogin = (each, listIndex, list) => {
    // If socket_Id and peer_Id is not empty that means candidate session is LIVE
    if (each.socketId && each.peerId) {
      this.setState((prevState) => {
        prevState.alertR.push(
          `Candidate connected - ${
            list === 1 ? 'proctoring list' : 'other candidate list'
          } - <b>New session - Duplicate Login.</b><br>Name: ${
            each.name
          } &emsp; Email: ${
            each.email
          }<br>In case of media proctoring new Session's Video will be streamed.`
        );
        return prevState;
      });
      // Add the previous connection to duplicate_List and new_Connection to myList
      if (list === 1) {
        const { streamColl } = this.state;
        for (let i = 0; i < streamColl.length; i++) {
          const eachS = streamColl[i];
          if (eachS.myListIndex === listIndex) {
            each.streams = eachS;
            break;
          }
        }
      }
      this.duplicateList.push(each);
    }
  };
  processSocketConnData = (data) => {
    const email = data.email;
    const { show } = this.state;
    // Search email in New Registration List
    for (let i = 0; i < this.newRegCandList.length; i++) {
      const each = this.newRegCandList[i];
      if (each.email === email) {
        const mergedData = { ...each, ...data };
        //
        if (this.newRegCandList.length > 1) this.newRegCandList.splice(i, 1);
        else this.newRegCandList = [];
        //
        this.otherCand.push(mergedData);
        this.setState((prevState) => {
          prevState.alertG.push(
            `New Registration. &emsp; Email: ${each.email}`
          );
          return prevState;
        });
        if (show === 1 || show === 2) this.forceUpdate();
        return true;
      }
    }
    // Search email in Proctoring List
    for (let i = 0; i < this.myList.length; i++) {
      const each = this.myList[i];
      if (each.email === email) {
        //
        this.checkDuplicateLogin(each, i, 1);
        //
        const mergedData = { ...each, ...data };
        this.myList[i] = mergedData;
        this.setState((prevState) => {
          prevState.alertG.push(
            `Candidate connected - proctoring list.<br>Name: ${each.name} &emsp; Email: ${each.email}`
          );
          return prevState;
        });
        this.reconnectAndCall(i);
        return true;
      }
    }
    // Search email in other Candidate List
    for (let i = 0; i < this.otherCand.length; i++) {
      const each = this.otherCand[i];
      if (each.email === email) {
        //
        this.checkDuplicateLogin(each, i, 2);
        //
        const mergedData = { ...each, ...data };
        this.otherCand[i] = mergedData;
        this.setState((prevState) => {
          prevState.alertG.push(
            `Candidate connected - other candidate list.<br>Name: ${mergedData.name} &emsp; Email: ${each.email}`
          );
          return prevState;
        });
        if (show === 1 || show === 2) this.forceUpdate();
        return true;
      }
    }
  };
  removeLive = (data) => {
    //
    data.cam = false;
    data.mic = false;
    data.scrn = false;
    data.peerId = '';
    data.socketId = '';
    return data;
  };
  otherSession = (data, each, listIndex, list) => {
    let toReturn;
    // Check if is in duplicate List
    for (let i = 0; i < this.duplicateList.length; i++) {
      const eachDup = this.duplicateList[i];
      if (eachDup.email === data.email) {
        // Check if most recent Session was disconnected
        if (data.socketId === each.socketId) {
          this.setState((prevState) => {
            prevState.alertR.push(
              `Candidate dis-Connected - ${
                list === 1 ? 'proctoring list' : 'other candidate list'
              } - <b>One session - Duplicate Login.</b><br>Name: ${
                each.name
              } &emsp; Email: ${each.email}`
            );
            return prevState;
          });
          if (list === 1) {
            const streams = eachDup.streams;
            delete eachDup.streams;
            this.myList[listIndex] = eachDup;
            if (streams) {
              // Replace Stream
              const { streamColl } = this.state;
              for (let i = 0; i < streamColl.length; i++) {
                const each = streamColl[i];
                if (each.myListIndex === listIndex) {
                  streamColl[i] = streams;
                  break;
                }
              }
              this.setState({ streamColl: streamColl });
            }
          } else this.otherCand[listIndex] = eachDup;
          toReturn = true;
        } else if (eachDup.socketId !== data.socketId) continue;
        else toReturn = false;
        // elseif in case any other duplicate session has disconnected and that is not the current duplicate session search ahead in the list
        // else - in case the current duplicate session has disconnected
        if (this.duplicateList.length > 1) this.duplicateList.splice(i, 1);
        else this.duplicateList = [];
        break;
      }
    }
    return toReturn;
  };
  processSocketDconnData = (data) => {
    //
    this.closeAllConn(data.peerId);
    //
    const email = data.email;
    const { show } = this.state;
    // Search email in Proctoring List
    for (let i = 0; i < this.myList.length; i++) {
      const each = this.myList[i];
      if (each.email === email) {
        // Stop Recording
        this.checkAndStopRec(i);
        //
        // Other Session will check and process disconnection for duplicate Login (the most recent session being closed)
        // If old session was disconnected then the below code will process, Since stream was processed for duplicate Login
        // and duplicate Login is in myList now
        if (this.otherSession(data, each, i, 1)) return false;
        //
        // Check if ids match to verify the disconnected session is being closed
        if (each.peerId === data.peerId) {
          // Close Connection
          const updated = this.removeLive(each);
          this.myList[i] = updated;
        }
        //
        this.setState((prevState) => {
          prevState.alertR.push(
            `Candidate dis-Connected - proctoring list.<br>Name: ${each.name} &emsp; Email: ${each.email}`
          );
          return prevState;
        });
        if (show === 1 || show === 2) this.forceUpdate();
        return true;
      }
    }
    // Search email in other Candidate List
    for (let i = 0; i < this.otherCand.length; i++) {
      const each = this.otherCand[i];
      if (each.email === email) {
        //
        if (this.otherSession(data, each, i, 2)) return false;
        //
        if (each.peerId === data.peerId) {
          const updated = this.removeLive(each);
          this.otherCand[i] = updated;
        }
        this.setState((prevState) => {
          prevState.alertR.push(
            `Candidate dis-Connected - other Candidate list.<br>Name: ${each.name} &emsp; Email: ${each.email}`
          );
          return prevState;
        });
        if (show === 1 || show === 2) this.forceUpdate();
        return true;
      }
    }
  };
  socketConnect = (passcode) => {
    return new Promise((resolve) => {
      this.socket = io('/');
      this.socket.on('connect', () => {
        resolve();
        this.socket.emit('join-room', `${passcode}_admin`);
        notify(this.msgHolder, 's', 'Connection 1: Intact');
      });
      this.socket.on('newProctor', () =>
        notify(this.msgHolder, 'e', 'New Proctor: Joined')
      );
      this.socket.on('disconnect', () => {
        notify(
          this.msgHolder,
          'e',
          'Connection 1: Disconnected<br>Wait till I re-connect.<br>I will notify you once we are connected.'
        );
      });
      this.socket.on('newRegistration', (data) => {
        data.entryCtr = 1;
        let temp = [data];
        temp = this.constructVData(temp);
        this.newRegCandList.push(temp[0]);
      });
      this.socket.on('cand-connected', (data) =>
        this.processSocketConnData(data)
      );
      this.socket.on('cand-disConnected', (data) =>
        this.processSocketDconnData(data)
      );
    });
  };
  // Merge All Candidate Data and Live Cand Data
  mergeFetchedCand = (allCand, liveCand) => {
    liveCand.forEach((eachLv) => {
      const email = eachLv.email;
      for (let i = 0; i < allCand.length; i++) {
        const eachReg = allCand[i];
        if (email === eachReg.email) {
          allCand[i] = { ...eachReg, ...eachLv };
          break;
        }
      }
    });
    return allCand;
  };
  constructVData = (allCand) => {
    for (let i = 0; i < allCand.length; i++) {
      const eachReg = allCand[i];
      delete eachReg.passcode;
      delete eachReg._id;
      delete eachReg.__v;
      eachReg.vData = {
        rsz: 0,
        fsv: 0,
        wfo: 0,
        mpv: 0,
        spv: 0,
        devT: 0,
        offline: '',
      };
      allCand[i] = eachReg;
    }
    return allCand;
  };
  fetchTest = (passcode, token) => {
    return new Promise(async (resolve, rej) => {
      try {
        const promise = await fetch(`${apiUrl}/proctor/enquire/`, {
          method: 'POST',
          credentials: isProd ? 'same-origin' : 'include',
          body: `passcode=${passcode}&_csrf=${token}`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const response = await promise.json();
        if (promise.status === 200 && promise.ok === true) {
          if (response.allCand === 0)
            notify(
              this.msgHolder,
              'e',
              '<h3>No Registered Candidate Found.</h3>Wait for a candidate to register',
              10000
            );
          if (response.liveCand.length && response.allCand.length) {
            this.otherCand = this.mergeFetchedCand(
              response.allCand,
              response.liveCand
            );
          } else if (response.allCand.length) {
            this.otherCand = response.allCand;
            notify(
              this.msgHolder,
              'e',
              '<h3>No Candidate Found to be LIVE.</h3>Wait for connections.'
            );
          }
          this.otherCand = this.constructVData(this.otherCand);
          const newState = response.testData;
          delete newState._id;
          const testInfo = JSON.parse(newState.testInfo);
          // Initiate PeerJS Conn - pass server to connect to
          const promise = this.initiatePeerConn(testInfo.pser);
          //
          newState.testInfo = testInfo;
          newState.show = 0; // CHANGE TO 0
          newState.strm2 = false;
          if (testInfo.win && (testInfo.cam || testInfo.mic))
            newState.strm2 = true;
          //
          if (testInfo.cam || testInfo.mic || testInfo.win)
            this.adminMedia = this.createMediaStreamFake();
          //
          const resColl = [
            { w: 1920, h: 1080 },
            { w: 1280, h: 720 },
            { w: 854, h: 480 },
            { w: 640, h: 360 },
            { w: 426, h: 240 },
          ];
          const resCam = resColl[testInfo.camR];
          const resWin = resColl[testInfo.winR];
          const constr = {
            1: { width: resCam.w, height: resCam.h, frameRate: testInfo.camF },
            2: { width: resWin.w, height: resWin.h, frameRate: testInfo.winF },
          };
          newState.constr = constr;
          //
          newState.token = token;
          //
          promise
            .then(() => {
              resolve(newState);
            })
            .catch((err) => {
              notify(
                this.msgHolder,
                'e',
                "<h3>Can't connect to Stream Server.</h3>",
                60000
              );
            });
        } else if (response.error) {
          notify(this.msgHolder, 'e', response.error.message);
          rej();
        } else notify(this.msgHolder, 'e', '');
      } catch (err) {
        notify(
          this.msgHolder,
          'e',
          'Request Send Failed.<br>Check for Internet Connection.'
        );
      }
    });
  };
  componentDidUpdate() {
    this.allVid = document.getElementsByTagName('video');
  }
  componentDidMount() {
    const adminInfo = JSON.parse(document.getElementById('userInfo').innerText);
    if (!adminInfo.passcode) {
      notify(this.msgHolder, 'e', '<h3>Invalid URL Access.</h3>', 10000);
      return false;
    } else if (!adminInfo.loggedIn) {
      notify(this.msgHolder, 'e', '<h3>Unauthenticated Access.</h3>', 10000);
      return false;
    }
    document.title = `Proctoring - ${adminInfo.passcode}`;
    //
    this.getSupportedRec();
    const promise1 = this.fetchTest(adminInfo.passcode, adminInfo.token);
    const promise2 = this.socketConnect(adminInfo.passcode);
    Promise.all([promise1, promise2])
      .then((a) => {
        this.setState(a[0]);
      })
      .catch(() => {
        notify(
          this.msgHolder,
          'e',
          '<h3>Proctoring Initiate Failed.</h3>',
          60000
        );
      });
    this.processDevCheck();
    window.addEventListener('blur', this.processDevCheck);
    window.addEventListener('resize', this.processDevCheck);
  }
  render() {
    const {
      strm2,
      streamColl,
      isRecAll,
      recorderColl,
      chatWith,
      show,
      showVid,
      vidIndex,
      streamIndex,
      testInfo,
      alertR,
      alertG,
    } = this.state;
    if (show === -1)
      return (
        <>
          <div id="msgHolder" ref={this.msgHolder}></div>
          <AdminModal show={show} msgHolder={this.msgHolder} />
        </>
      );
    return (
      <>
        <div id="msgHolder" ref={this.msgHolder}></div>
        {show === 1 ? (
          <AdminModal
            show={show}
            testInfo={this.state.testInfo}
            myList={this.myList}
            otherCand={this.otherCand}
            addOneToMyList={this.addOneToMyList}
            addToMyList={this.addToMyList}
            fetchStream={this.fetchStream}
            rmvOneFrmMyList={this.rmvOneFrmMyList}
            endTest={this.endTest}
            setMainCompState={this.setMainCompState}
            msgHolder={this.msgHolder}
          />
        ) : show === 2 ? (
          <ChatComp
            isAdmin={true}
            myList={this.myList}
            nMsgCtr={this.nMsgCtr}
            allDataConn={this.dataConn}
            chatWith={chatWith}
            setMainCompState={this.setMainCompState}
            msgHolder={this.msgHolder}
          />
        ) : show === 3 ? (
          <AdminModal
            show={show}
            socket={this.socket}
            passcode={this.state.passcode}
            setMainCompState={this.setMainCompState}
            msgHolder={this.msgHolder}
          />
        ) : show === 4 ? (
          <AdminModal
            show={show}
            stream={streamColl[vidIndex].streams[streamIndex].stream}
            setMainCompState={this.setMainCompState}
          />
        ) : show === 5 ? (
          <AdminModal
            show={show}
            dataConn={this.dataConn}
            constr={this.state.constr}
            setMainCompState={this.setMainCompState}
            msgHolder={this.msgHolder}
          />
        ) : null}
        <nav ref={this.navBar}>
          <div>
            <img id="brand-logo" src={testInfo.img} alt="" srcSet="" />
            <h1 id="brand-text">{testInfo.org}</h1>
            &nbsp;&nbsp;- Welcome to Live Monitoring/Proctoring
          </div>
          <div>
            Currently Proctoring - {this.myList.length}&nbsp;&nbsp;
            <button type="button" onClick={this.reqLogout}>
              Logout
            </button>
          </div>
        </nav>
        <div id="monitoring">
          <div id="proctControl">
            {testInfo.cam || testInfo.aud || testInfo.win ? (
              <>
                <button
                  type="button"
                  className="btnPrimary"
                  title="Control live stream Video settings.Resolution & Frame Rate"
                  onClick={() => this.setState({ show: 5 })}
                >
                  <i className="fa fa-cogs" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  className="btnPrimary"
                  title={
                    showVid > 0
                      ? 'Stop Video Render'
                      : 'Request Video from Server : Start Render'
                  }
                  onClick={this.toggleVideoRender}
                >
                  <i
                    className={showVid > 0 ? 'fa fa-stop-circle' : 'fa fa-play'}
                    aria-hidden="true"
                  ></i>
                </button>
                <button
                  type="button"
                  className={isRecAll ? 'btnPrimary recording' : 'btnPrimary'}
                  title="Record-all : All Displaying Screens will be recorded"
                  onClick={this.recordAll}
                >
                  <i className="fa fa-video-camera" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  className="btnPrimary"
                  title="Mute-all web-cam(s)"
                  onClick={this.muteAll}
                >
                  <i className="fa fa-microphone-slash" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  className={
                    showVid === 2 ? 'btnPrimary activeBtn' : 'btnPrimary'
                  }
                  title="Show web-cam(s) Only"
                  onClick={
                    showVid === 2
                      ? () => {
                          this.setState({ showVid: 1 });
                        }
                      : () => {
                          this.setState({ showVid: 2 });
                        }
                  }
                >
                  <i className="fa fa-camera" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  className={
                    showVid === 3 ? 'btnPrimary activeBtn' : 'btnPrimary'
                  }
                  title="Show screen(s) Only"
                  onClick={
                    showVid === 3
                      ? () => {
                          this.setState({ showVid: 1 });
                        }
                      : () => {
                          this.setState({ showVid: 3 });
                        }
                  }
                >
                  <i className="fa fa-desktop" aria-hidden="true"></i>
                </button>
              </>
            ) : null}
            <button
              type="button"
              className="btnPrimary"
              title="View Candidates (also shows Violation)"
              onClick={() => this.setState({ show: 1 })}
            >
              <i className="fa fa-users" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              className="btnPrimary"
              title="Open Chat Window"
              onClick={() => {
                if (this.myList.length) this.setState({ show: 2 });
                else
                  notify(
                    this.msgHolder,
                    'e',
                    'No candidate in your Proctor List.<br>Please add one to initate Chat.'
                  );
              }}
            >
              <i className="fa fa-comments-o" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              className="btnPrimary"
              title="Message Broadcast"
              onClick={() => this.setState({ show: 3 })}
            >
              <i className="fa fa-bullhorn" aria-hidden="true"></i>
            </button>
            {testInfo.cam || testInfo.aud || testInfo.win ? (
              <button
                type="button"
                className="btnPrimary"
                title="Change View Layout"
                onClick={this.toggleGridForm}
              >
                <i className="fa fa-th" aria-hidden="true"></i>
              </button>
            ) : null}
            <button
              type="button"
              className="btnPrimary"
              title="End all Connections : V.Important before you Exit"
              onClick={this.closeAllPeer}
            >
              <i className="fa fa-phone" aria-hidden="true"></i>
            </button>
            {testInfo.cam || testInfo.aud || testInfo.win ? (
              <div ref={this.gridForm}>
                <form onSubmit={this.changeLayout}>
                  <input
                    type="number"
                    ref={this.colInput}
                    placeholder="Col"
                    min="1"
                    name="col"
                  ></input>
                  <button type="submit" className="btnPrimary">
                    &#10004;
                  </button>
                  <button
                    type="button"
                    className="btnSecondary"
                    onClick={this.toggleGridForm}
                  >
                    &#10008;
                  </button>
                </form>
              </div>
            ) : null}
          </div>
          <div id="adminVideo" ref={this.adminVideo}>
            {/* strmColI - Stream Collection _Index */}
            {showVid > 0
              ? streamColl.map((each, strmColI) => {
                  return (
                    <div
                      key={strmColI}
                      className={
                        showVid === 1 && strm2
                          ? 'eachCand Streams2'
                          : 'eachCand'
                      }
                    >
                      <div>
                        {each.streams.map((eachStream, strmI) => {
                          if (
                            (showVid === 2 && eachStream.req === 'scrn') ||
                            (showVid === 3 && eachStream.req === 'cam')
                          )
                            return false;
                          const recorder = recorderColl[strmColI * 2 + strmI];
                          const isRec =
                            recorder && recorder.state === 'recording'
                              ? true
                              : false;
                          return (
                            <div
                              className="eachVideo"
                              key={strmColI + eachStream.req}
                            >
                              <span
                                className={
                                  isRec ? 'recSpan showRec' : 'recSpan'
                                }
                              >
                                REC
                              </span>
                              <RenderVid
                                stream={eachStream}
                                strmColI={strmColI}
                                strmI={strmI}
                                setMainCompState={this.setMainCompState}
                              />
                              <div className="callOpt">
                                <div>
                                  {eachStream.req === 'cam' ? (
                                    <i
                                      className="fa fa-microphone-slash"
                                      aria-hidden="true"
                                      onClick={(e) => {
                                        this.toggleMute(
                                          e.target,
                                          strmColI,
                                          strmI
                                        );
                                      }}
                                    ></i>
                                  ) : null}
                                  <i
                                    className={
                                      isRec
                                        ? 'fa fa-video-camera recording'
                                        : 'fa fa-video-camera'
                                    }
                                    aria-hidden="true"
                                    title="Start Recording"
                                    onClick={(e) =>
                                      this.initiateRec(
                                        false,
                                        strmColI,
                                        strmI,
                                        true
                                      )
                                    }
                                  ></i>
                                  <i
                                    className="fa fa-comments-o"
                                    aria-hidden="true"
                                    title="Start Chat"
                                    onClick={() => {
                                      this.setState({
                                        show: 2,
                                        chatWith:
                                          this.myList[each.myListIndex].email,
                                      });
                                    }}
                                  ></i>
                                  <i
                                    className="fa fa-phone fa-rotate-180"
                                    aria-hidden="true"
                                    title="End Stream(s) of this Candidate"
                                    onClick={() => {
                                      this.endMediaCall(each.myListIndex);
                                    }}
                                  ></i>
                                  <i
                                    className="fa fa-ban"
                                    aria-hidden="true"
                                    title="End-Test"
                                    onClick={() =>
                                      this.endTest(each.myListIndex)
                                    }
                                  ></i>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div>
                        <p>
                          {this.myList[each.myListIndex].name}
                          <br></br>
                          {this.myList[each.myListIndex].email}
                        </p>
                      </div>
                    </div>
                  );
                })
              : null}
            {this.duplicateList.map((each, i1) => {
              if (each.streams && each.streams.streams) {
                return (
                  <div
                    key={i1}
                    className={
                      showVid === 1 && strm2
                        ? 'eachCand Streams2 duplicate'
                        : 'eachCand duplicate'
                    }
                  >
                    <div>
                      {each.streams.streams.map((eachStr, i2) => {
                        return (
                          <div key={i2 + eachStr.req} className="eachVideo">
                            <RenderVid stream={eachStr} isDup={true} />
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <p>
                        {each.name}
                        <br></br>
                        {each.email}
                      </p>
                    </div>
                  </div>
                );
              } else return null;
            })}
            <a href="https://www.youtube.com/" ref={this.downloadLink}>
              Download
            </a>
          </div>
          {this.duplicateList.length ? (
            <table>
              <thead>
                <tr>
                  <th colSpan="2" align="center">
                    Duplicate Logins
                  </th>
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {this.duplicateList.map((each, i) => {
                  return (
                    <tr key={i}>
                      <td>{each.name}</td>
                      <td>{each.email}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : null}
          <div id="adminNotify">
            <table>
              <thead>
                <tr>
                  <th align="center">Red Alerts : Proctor</th>
                  <th>
                    <button
                      type="button"
                      className="btnSecondary"
                      onClick={() => this.setState({ alertR: [] })}
                    >
                      Clear
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {alertR.map((each, i) => (
                  <tr key={i}>
                    <td dangerouslySetInnerHTML={{ __html: each }}></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table>
              <thead>
                <tr>
                  <th align="center">Green Alerts : Proctor</th>
                  <th>
                    <button
                      type="button"
                      className="btnSecondary"
                      onClick={() => this.setState({ alertG: [] })}
                    >
                      Clear
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {alertG.map((each, i) => (
                  <tr key={i}>
                    <td dangerouslySetInnerHTML={{ __html: each }}></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table>
              <thead>
                <tr>
                  <th>Important Instructions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Recoding Media Proctoring-: webcam video stream must always
                    be viewed on screen if recording else you will receive blank
                    recording for the time-frame it is kept off.
                  </td>
                </tr>
                <tr>
                  <td>
                    Recoding Window/Screen Proctoring-: You may keep it viewing
                    on screen or keep it off.
                  </td>
                </tr>
                <tr>
                  <td>
                    Note: Both media proctor stream and screen proctor stream
                    are independent of each other whether recoding on streaming.
                    Condition imposed on one doesn't apply on the other.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }
}
export default Proctor;
