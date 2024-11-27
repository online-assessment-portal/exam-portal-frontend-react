import React, { PureComponent } from 'react';
import { notify } from './common';
import { makeDateTimeReadable } from './common';
class Facilitate extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      broadcasts: null,
      show: 1, // 0 to show none 1-Show BroadCast 2-Show Candidate
    };
    this.showing = 0;
    this.answerStream = 'cam';
    //
    this.exmTmObj = new Date(props.time).getTime();
    //
    this.topBar = React.createRef();
    this.candDiv = React.createRef();
    this.liveTimer = React.createRef();
    //
    this.broadcast = React.createRef();
    this.candidate = React.createRef();
    this.showConn = React.createRef();
    //
    this.canvas = React.createRef();
    // Notification Right Click
    this.nRClick = false;
  }
  takeSnap = async (email, target, imgUpKey) => {
    try {
      const myWidth = target.videoWidth,
        myHeight = target.videoHeight;
      const canvas = this.canvas.current;
      canvas.width = myWidth;
      canvas.height = myHeight;
      const context = canvas.getContext('2d');
      context.drawImage(target, 0, 0);
      //
      const base64image = canvas.toDataURL().split(';base64,')[1];
      const name = email + ' ' + makeDateTimeReadable();
      const formData = new FormData();
      formData.append('key', imgUpKey);
      formData.append('image', base64image);
      formData.append('name', name);
      const formBody = new URLSearchParams(formData);
      await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        credentials: 'omit',
        body: formBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } catch (error) {
      console.log(error);
    }
  };
  rightClickHandler = (event) => {
    event.preventDefault();
    if (this.nRClick) return;
    const { notify, msgHolder } = this.props;
    notify(msgHolder, 'e', 'Not Allowed');
    this.nRClick = true;
    setTimeout(() => {
      this.nRClick = false;
    }, 5000);
  };
  styleDropDown = (style, eventHandler) => {
    // Set Height of Dropdown
    style.top = this.topBar.current.clientHeight + 'px';
    if (style.display === 'flex') {
      style.animation = 'fadeOutRight 300ms ease-in';
      setTimeout(() => {
        style.display = 'none';
      }, 280);
      document.removeEventListener('scroll', eventHandler);
    } else {
      style.display = 'flex';
      style.animation = 'fadeInRight 300ms ease-in';
      document.addEventListener('scroll', eventHandler);
    }
    setTimeout(() => {
      style.animation = 'none';
    }, 280);
  };
  showBroadcast = () => {
    if (this.candidate.current.style.display === 'flex') this.showCand();
    const style = this.broadcast.current.style;
    this.styleDropDown(style, this.showBroadcast);
  };
  showCand = () => {
    if (this.broadcast.current.style.display === 'flex') this.showBroadcast();
    const style = this.candidate.current.style;
    this.styleDropDown(style, this.showCand);
  };
  initiateScrShot = (email, ele, min, max, imgUpKey) => {
    if (!min || !max) return false;
    const timer = Math.floor(Math.random() * (max - min - 1) + min);
    setTimeout(() => {
      this.takeSnap(email, ele, imgUpKey);
      this.initiateScrShot(email, ele, min, max, imgUpKey);
    }, timer * 1000);
  };
  toggleVideo = (event, vidEle) => {
    let tm = 0;
    const icon = event.target;
    const vidDIV = icon.parentElement.style;
    //
    const style = vidEle.style;
    style.animation = 'none';
    // To Hide
    if (!icon.style.display) {
      vidDIV.transitionDuration = '300ms';
      //
      // icon.className = "fa fa-angle-down";
      icon.style.transform = 'rotate(180deg)';
      icon.style.display = 'unset';
      //
      style.animation = 'fadeOutUp 300ms ease-in';
      setTimeout(() => {
        style.visibility = 'hidden';
        //
        vidDIV.maxHeight = 'max-content';
      }, 280);
      setTimeout(() => {
        vidEle.className = 'hideVideo';
      }, 300);
      //
      tm = 420;
    } else {
      vidDIV.transitionDuration = 0;
      vidDIV.maxHeight = '15vh';
      // To Show
      // icon.className = "fa fa-angle-up";
      icon.style.transform = 'rotate(0deg)';
      icon.style.display = '';
      //
      style.animation = 'fadeInDown 250ms ease-out 200ms';
      vidEle.className = '';
      setTimeout(() => {
        style.visibility = 'visible';
      }, 220);
    }
    //
    const topBar = this.topBar.current;
    const candDiv = this.candDiv.current;
    setTimeout(() => {
      if (
        (this.vidEle1 ? this.vidEle1.className : true) &&
        (this.vidEle2 ? this.vidEle2.className : true)
      ) {
        topBar.className = 'flxCntr';
        candDiv.className = 'flxCntr';
      } else {
        topBar.className = 'flxStrt';
        candDiv.className = 'flxStrt';
      }
    }, tm);
  };
  //
  componentDidMount() {
    const { testInfo, userInfo, passcode } = this.props;
    const scrnshot = testInfo.scr;
    // Opposite in order - Media Vid Ele and Window Vid Ele
    if (this.vidEle1 && (scrnshot === 2 || scrnshot === 3))
      this.initiateScrShot(
        userInfo.email + passcode,
        this.vidEle1,
        testInfo.min,
        testInfo.max,
        testInfo.imgUpKey
      );
    if (this.vidEle2 && (scrnshot === 1 || scrnshot === 3))
      this.initiateScrShot(
        userInfo.email + passcode,
        this.vidEle2,
        testInfo.min,
        testInfo.max,
        testInfo.imgUpKey
      );
    //
    const { timer, socket, msgHolder, initatePeerConn } = this.props;
    // Set Timer
    timer(1, this.liveTimer.current);
    //
    initatePeerConn();
    socket.on('connect', () => {
      const ele = this.showConn.current;
      if (ele) {
        ele.style.color = 'rgb(45, 209, 135)';
        notify(msgHolder, 's', 'Back Online');
      }
    });
    socket.on('disconnect', () => {
      const ele = this.showConn.current;
      if (ele) {
        ele.style.color = 'red';
        notify(msgHolder, 'e', '<h3>Offline</h3>');
      }
    });
    //
    //
    socket.on('recBroadcast', (data) => {
      const old = localStorage.getItem('broadcastStore');
      let newStore = [data.msg];
      if (old) newStore = [...newStore, ...JSON.parse(old)];
      localStorage.setItem('broadcastStore', JSON.stringify(newStore));
      this.setState({ broadcasts: newStore });
      if (this.broadcast.current.style.display !== 'flex')
        notify(msgHolder, 's', `You have a new Broadcast Message`, 10000);
    });
    const oldBroad = JSON.parse(localStorage.getItem('broadcastStore'));
    if (oldBroad) this.setState({ broadcasts: oldBroad });
    // Right Click
    document.addEventListener('contextmenu', this.rightClickHandler);
  }
  render() {
    const { broadcasts } = this.state;
    const {
      thisIs,
      userInfo,
      testInfo,
      logOut,
      candStream,
      scrnStream,
      setMainCompState,
    } = this.props;
    return (
      <>
        <div
          ref={this.topBar}
          id="topbar"
          className={candStream || scrnStream ? 'flxStrt' : 'flxCntr'}
        >
          <div>
            <img src={testInfo.img} alt="orgImg" srcSet=""></img>
            <p>{testInfo.title}</p>
          </div>
          <div id="timerDiv">
            <i className="fa fa-clock-o" aria-hidden="true"></i>
            <span id="liveTimer" ref={this.liveTimer}>
              Time Left
            </span>
          </div>
          <div
            ref={this.candDiv}
            id="candDiv"
            className={candStream || scrnStream ? 'flxStrt' : 'flxCntr'}
          >
            <i
              className="fa fa-envelope-o"
              title="Chat with myProctor"
              aria-hidden="true"
              onClick={() => setMainCompState({ chat: true })}
            ></i>
            <i
              className="fa fa-bullhorn"
              title="Broadcast Message"
              aria-hidden="true"
              onClick={this.showBroadcast}
            >
              <div ref={this.broadcast} id="showBroadcast">
                <h5>Information Broadcast</h5>
                <ul>
                  {broadcasts ? (
                    broadcasts.map((each, index) => {
                      return <li key={index}>{each}</li>;
                    })
                  ) : (
                    <li>-- No Broadcast Messages --</li>
                  )}
                </ul>
              </div>
            </i>
            {candStream ? (
              <div>
                <video
                  ref={(element) => {
                    if (element) {
                      element.srcObject = candStream;
                      this.vidEle1 = element;
                    }
                  }}
                  muted
                  autoPlay
                ></video>
                <i
                  className="fa fa-angle-up"
                  aria-hidden="true"
                  onClick={(ev) => this.toggleVideo(ev, this.vidEle1)}
                ></i>
              </div>
            ) : null}
            {scrnStream ? (
              <div>
                <video
                  ref={(element) => {
                    if (element) {
                      element.srcObject = scrnStream;
                      this.vidEle2 = element;
                    }
                  }}
                  muted
                  autoPlay
                ></video>
                <i
                  className="fa fa-angle-up"
                  aria-hidden="true"
                  onClick={(ev) => this.toggleVideo(ev, this.vidEle2)}
                ></i>
              </div>
            ) : null}
            <i
              className="fa fa-user"
              aria-hidden="true"
              onClick={this.showCand}
            >
              <div ref={this.candidate} id="candDropDown">
                <img
                  src={userInfo.img}
                  alt="no_candidate_Image"
                  srcSet=""
                ></img>
                <p>
                  <span>Name-:</span>
                  <span>{userInfo.name}</span>
                </p>
                <p>
                  <span>Username-:</span>
                  <span>{userInfo.uname}</span>
                </p>
                <p>
                  <span>Email-:</span>
                  <span>{userInfo.email}</span>
                </p>
                <button
                  type="button"
                  className="btnSecondary"
                  onClick={() => this.props.notifiedEndTest(9)}
                >
                  End {thisIs}
                </button>
                <button type="button" className="btnSecondary" onClick={logOut}>
                  Logout
                </button>
              </div>
            </i>
            <span
              ref={this.showConn}
              // className={"showGreen"}
              style={{ color: 'rgb(16, 199, 16)' }}
              title="Shows your Server Connection Status"
            >
              &#9679;
            </span>
            <i
              className="fa fa-power-off"
              title={`End ${thisIs}`}
              aria-hidden="true"
              onClick={() => this.props.notifiedEndTest(9)}
            ></i>
            <canvas ref={this.canvas}></canvas>
          </div>
        </div>
      </>
    );
  }
}
export default Facilitate;
