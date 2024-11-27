import React, { PureComponent } from 'react';
import NavBar from './navbar';
import { makeDateTimeReadable } from './common';
import RenderVidCand from './renderVideoCand';
class ToStart extends PureComponent {
  constructor() {
    super();
    this.state = {
      placeholder: 'Enter 10-digit Pass Code',
      error: '',
      active: 1,
      myBrowser: false,
      cookieV: false,
    };
    this.showTimer = false;
    this.prevActive = 0;
    //
    this.container = React.createRef();
    this.navLinkDiv = React.createRef();
    //
    this.liveIn = React.createRef();
    //
    this.questionnaire = React.createRef();
    //
    this.browserVerify = React.createRef();
    this.cookieVerify = React.createRef();
  }
  static getDerivedStateFromProps(props) {
    if (props.markActive) {
      props.setMainCompState({ toStartShow: false });
      return { active: props.markActive };
    }
    return {};
  }
  markActive = (skip = false) => {
    const { active } = this.state;
    const prevActive = this.prevActive;
    if (active === 4 && prevActive !== 4) this.makeQuestionnaireWork();
    this.navLinks[active].classList.toggle('activeLink');
    if (skip === false && prevActive !== undefined)
      this.navLinks[prevActive].classList.toggle('activeLink');
    this.prevActive = active;
  };
  // to Verify Browser
  verifyBroswer = () => {
    let myBrowser = '';
    const operate = (pos, uptoV) => {
      let browser = string.slice(pos);
      // Broswer Name
      pos = browser.indexOf('/');
      // Browser Version
      ver = parseInt(browser.slice(pos + 1, browser.indexOf('.')));
      if (ver < uptoV) {
        browser = browser.slice(0, pos);
        if (browser === 'Edg') browser = 'Edge';
        else if (browser === 'OPR') browser = 'Opera';
        this.browserVerify.current.innerHTML =
          '<span style="color:tomato;">' +
          browser +
          ' ' +
          ver +
          ' - Browser Not Supported ' +
          ` <br>Supported ${browser} v${uptoV} and above${
            myBrowser !== 'C' ? '<br>Prefer Chrome v80 and above' : ''
          }</span>`;
        return 0;
      } else {
        const { testRequirements, setMainCompState } = this.props;
        setMainCompState({ myBrowser: myBrowser });
        testRequirements();
        return 1;
      }
    };
    let string = navigator.userAgent;
    let ver = 0,
      chrome = 0,
      edge = 0,
      opera = 0,
      safari = 0,
      mozilla = 0;
    chrome = string.search('Chrome');
    // for Edge
    edge = string.search('Edg');
    if (edge !== -1 && chrome !== -1) {
      myBrowser = 'E';
      return operate(edge, 83);
    }
    // for Opera Browsers
    opera = string.search('OPR');
    if (opera !== -1 && chrome !== -1) {
      myBrowser = 'O';
      return operate(opera, 69);
    }
    // for Safari
    safari = string.search('Safari');
    if (safari !== -1 && chrome === -1 && string.search('Chromium') === -1) {
      myBrowser = 'S';
      return operate(safari, 13);
    }
    // for Chrome
    if (
      chrome !== -1 &&
      edge === -1 &&
      opera === -1 &&
      string.search('Chromium') === -1
    ) {
      myBrowser = 'C';
      return operate(chrome, 80);
    }
    // for Mozilla
    mozilla = string.search('Firefox');
    if (
      mozilla !== -1 &&
      chrome === -1 &&
      edge === -1 &&
      opera === -1 &&
      string.search('Chromium') === -1
    ) {
      myBrowser = 'M';
      return operate(mozilla, 80);
    }
  };
  makeQuestionnaireWork = () => {
    const form = this.questionnaire.current;
    const allInp = form.querySelectorAll('.form-input');
    const formFascilate = this.props.fascilateForm;
    allInp.forEach((each) => {
      formFascilate(each);
    });
  };
  processQuestionnaire = (event) => {
    event.preventDefault();
    let formData = new FormData(this.questionnaire.current);
    const values = formData.values();
    let arr = [];
    for (const e of values) arr.push(e);
    this.props.submitQuestionnaire(JSON.stringify(arr));
  };
  oneTimeVerify = () => {
    if (this.browserVerify.current && this.verifyBroswer() === 0)
      this.setState({ active: 1 });
    // check Cookie
    if (navigator.cookieEnabled) {
      this.setState({ cookieV: true });
    } else this.setState({ active: 1 });
  };
  initiateExam = () => {
    this.showTimer = true;
    setTimeout(() => {
      this.setState({ active: 0 });
    }, 10);
  };
  componentDidUpdate() {
    this.markActive();
    //
    // Carry out Verifications
    //
  }
  componentWillUnmount() {
    clearInterval(this.endCalcInt);
    // this.props.setMainCompState({ endIn: this.endIn, isNewEndIn: true });
  }
  componentDidMount() {
    const { endIn, timer } = this.props;
    timer(0, this.liveIn.current);
    this.endIn = endIn;
    this.endCalcInt = setInterval(() => {
      this.endIn -= 1;
    }, 1000);
    // Mark Max-height
    // this.container.current.style.minHeight =
    // 	window.innerHeight - this.navBar.current.clientHeight + +"px";
    // this.container.current.style.minHeight = "120vh";
    //
    this.navLinks = this.navLinkDiv.current.querySelectorAll('.change');
    this.navLinks.forEach((each) => {
      each.addEventListener('click', (e) => {
        this.setState({ active: parseInt(e.target.value) });
      });
    });
    this.markActive(true);
    // Carry out Verifications
    this.oneTimeVerify();
    //
    //
    const { data } = this.props;
    let strtTm, endTm;
    if (data.isFixedDur) {
      if (data.testBuild0) {
        strtTm = data.strtTime;
        endTm = new Date(strtTm).getTime() + parseInt(data.dur) * 60000;
      } else {
        const unixStrt = new Date(data.firstEntry).getTime();
        strtTm = unixStrt;
        endTm = unixStrt + parseInt(data.dur) * 60000;
      }
      strtTm = makeDateTimeReadable(strtTm);
      endTm = makeDateTimeReadable(endTm);
    } else {
      strtTm = makeDateTimeReadable(data.strtTime);
      endTm = makeDateTimeReadable(data.endTime);
    }
    let durString = '',
      mins = 0,
      days = 0,
      hrs = 0;
    mins = parseInt(data.dur);
    days = parseInt(mins / 1440);
    if (days > 0) mins = mins % 1440;
    hrs = parseInt(mins / 60);
    if (hrs > 0) mins = mins % 60;
    if (days > 0) durString += (days > 1 ? `${days}days` : `${days}day`) + ' ';
    if (hrs > 0) durString += (hrs > 1 ? `${hrs}hrs` : `${hrs}hr`) + ' ';
    if (mins > 0) durString += (mins > 1 ? `${mins}mins` : `${mins}min`) + ' ';
    this.setState({
      strtTm: strtTm,
      endTm: endTm,
      durString: durString,
    });
    document.title = 'Candidate Verification';
  }
  render() {
    const { active, cookieV, strtTm, endTm, durString } = this.state;
    const {
      thisIs,
      userInfo,
      resQuestionnaire,
      data,
      sec,
      testInfo,
      myBrowser,
      notFullWidth,
      reqFScr,
      isFullScr,
      fsNotSupp,
      candStream,
      scrnStream,
      startExam,
      logOut,
    } = this.props;
    const allBrwsr =
      myBrowser &&
      cookieV &&
      !notFullWidth &&
      (reqFScr ? (isFullScr ? true : fsNotSupp ? true : false) : true);
    const proctorVf =
      (testInfo.cam || testInfo.aud ? candStream : true) &&
      (testInfo.win ? scrnStream : true);
    if (this.showTimer === false && allBrwsr && proctorVf) this.initiateExam();
    return (
      <>
        <NavBar img={testInfo.img} org={testInfo.org} logOut={logOut} />
        <div className="beforeStart" ref={this.container}>
          <div id="nav-links" ref={this.navLinkDiv}>
            <button className="go change" type="button" value="0">
              Info
            </button>
            <div>
              <button className="go change" type="button" value="1">
                Validation
              </button>
              {allBrwsr && proctorVf ? (
                <i className="fa fa-check" aria-hidden="true"></i>
              ) : (
                <i className="fa fa-frown-o" aria-hidden="true"></i>
              )}
            </div>
            <button className="go change" type="button" value="2">
              Do(s) & Don't(s)
            </button>
            <button className="go change" type="button" value="3">
              FAQs
            </button>
            {testInfo.ques ? (
              <div>
                <button className="go change" type="button" value="4">
                  Questionnaire
                </button>
                {resQuestionnaire ? (
                  <i className="fa fa-check" aria-hidden="true"></i>
                ) : (
                  <i className="fa fa-frown-o" aria-hidden="true"></i>
                )}
              </div>
            ) : null}
            <button
              className="go"
              type="button"
              ref={this.liveIn}
              onClick={startExam}
            >
              Start
            </button>
          </div>
          {active === 0 ? (
            <>
              <div className="welcome" id="testInfo">
                <div>
                  <h3>{thisIs} Information</h3>
                  <table>
                    <thead></thead>
                    <tbody>
                      <tr>
                        <td>{thisIs} Title</td>
                        <td>{testInfo.title}</td>
                      </tr>
                      <tr>
                        <td>Passcode</td>
                        <td>{data.passcode}</td>
                      </tr>
                      <tr>
                        <td>Start Time</td>
                        <td>{strtTm}</td>
                      </tr>
                      <tr>
                        <td>End Time</td>
                        <td>{endTm}</td>
                      </tr>
                      <tr>
                        <td>Duration</td>
                        <td>{durString}</td>
                      </tr>
                      {sec.length > 1 ? (
                        <tr>
                          <td>Section Movement</td>
                          <td>
                            {testInfo.constrained ? 'Disabled' : 'Enabled'}
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3>
                    {thisIs === 'Test' ? 'Candidate' : 'Participant'}{' '}
                    Information
                  </h3>
                  <table id="candInfo">
                    <thead></thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan="2"
                          style={{ textAlign: 'center', borderRight: 'none' }}
                        >
                          <img src={userInfo.img} alt="" srcSet="" />
                        </td>
                      </tr>
                      <tr>
                        <td>Name</td>
                        <td>
                          {userInfo.name} ({userInfo.uname})
                        </td>
                      </tr>
                      <tr>
                        <td>Email</td>
                        <td>{userInfo.email}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="welcome" id="secInfo">
                <h3>Section Information</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th>Name</th>
                      <th>No. Of Ques.</th>
                      <th>Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.map((eachSec, secIndex) => {
                      return (
                        <tr key={secIndex}>
                          <td>{String.fromCharCode(65 + secIndex)}</td>
                          <td>{eachSec[0]}</td>
                          <td>
                            {secIndex > 0
                              ? eachSec[1] - sec[secIndex - 1][1]
                              : eachSec[1]}
                          </td>
                          <td>{eachSec[3] ? eachSec[3] : 'None'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
          {active === 1 ? (
            <div className="welcome" id="verify">
              <h3>Browser Validation *</h3>
              <div>
                {myBrowser ? null : (
                  <p ref={this.browserVerify}>
                    <i className="fa fa-frown-o" aria-hidden="true"></i> Browser
                    Not Supported
                  </p>
                )}
                {cookieV ? null : (
                  <p ref={this.cookieVerify}>
                    <i className="fa fa-frown-o" aria-hidden="true"></i> Cookies
                    and Site Data is Disabled
                  </p>
                )}
                {notFullWidth ? (
                  <>
                    <p>
                      <i className="fa fa-frown-o" aria-hidden="true"></i>{' '}
                      Browser is not at its Full Width and/or Full Height.
                    </p>
                    <p>
                      <i className="fa fa-flag-o" aria-hidden="true"></i> What
                      you can try ?
                    </p>
                    <ul>
                      <li>
                        Hide/disable Sidebars and/or Bookmarks Bar of your
                        Browser.
                      </li>
                      <li>Zoom back to default 100%.</li>
                      <li>Reset your Broswer Settings to default.</li>
                    </ul>
                    <br></br>
                  </>
                ) : null}
                {reqFScr ? (
                  isFullScr || fsNotSupp ? null : (
                    <>
                      <p>
                        <i className="fa fa-frown-o" aria-hidden="true"></i>{' '}
                        Extra Window(s) Opened or Browser is not in Full-Screen.
                      </p>
                      <p>
                        <i className="fa fa-flag-o" aria-hidden="true"></i> What
                        you can try ?
                      </p>
                      <ul>
                        <li>Switch to Full Screen (use F11 key).</li>
                      </ul>
                      <br></br>
                    </>
                  )
                ) : null}
                {allBrwsr ? (
                  <p>
                    <i className="fa fa-check" aria-hidden="true"></i>
                    Verified
                  </p>
                ) : null}
              </div>
              {testInfo.cam || testInfo.aud || testInfo.win ? (
                <>
                  <h3>Proctoring Validation *</h3>
                  <div>
                    {testInfo.cam ? (
                      <div>
                        <p>
                          {testInfo.cam
                            ? testInfo.aud
                              ? 'web-cam + microphone'
                              : 'web-cam'
                            : testInfo.aud
                              ? 'microphone'
                              : ''}
                        </p>
                        {candStream ? (
                          <RenderVidCand stream={candStream} />
                        ) : (
                          <i className="fa fa-frown-o" aria-hidden="true"></i>
                        )}
                      </div>
                    ) : null}
                    {testInfo.win ? (
                      <div>
                        <p>screen</p>
                        {scrnStream ? (
                          <RenderVidCand stream={scrnStream} />
                        ) : (
                          <i className="fa fa-frown-o" aria-hidden="true"></i>
                        )}
                      </div>
                    ) : null}
                  </div>
                  {proctorVf ? (
                    <p>
                      <i className="fa fa-check" aria-hidden="true"></i>
                      Verified
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}
          {active === 2 ? (
            <div className="welcome" id="dodont">
              <div>
                <div>
                  <h3>Do (s)</h3>
                  <p>Disable all Notifications</p>
                  <p>Keep your Laptop Plugged-In</p>
                  <p>In case using Desktop Use UPS</p>
                  <p>Maintain a decent Network Connection</p>
                  <p>Close all other Apps / Browser TAB</p>
                </div>
                <div>
                  <h3>Don't (s)</h3>
                  <p>Absolute no illegal Activities</p>
                  <p>
                    Don't run any tools / other Application until the {thisIs}{' '}
                    is finished and submitted
                  </p>
                  <p>
                    In case of any Violation the Proctor may erase your
                    responses and End Participation
                  </p>
                  <p>Never Zoom-In or Zoom-Out</p>
                </div>
              </div>
            </div>
          ) : null}
          {active === 3 ? (
            <div id="faq">
              <h3>FAQs</h3>
              <div>
                <div>
                  <p>
                    <b>How result is Evaluated ?</b>
                    <br></br>
                    All your Responses will be reviewed by a Team of
                    Professionals before the final declaration of the Result.
                  </p>
                </div>
                <div>
                  <p>
                    <b>
                      What should I do if the Page Fails to Load in Mid of the{' '}
                      {thisIs} ?
                    </b>
                    <br></br>This type of issue arises due to Poor Internet
                    Connection. Try switching to a Better Internet Connection.
                  </p>
                </div>
              </div>
              <div>
                <div>
                  <p>
                    <b>
                      What should I do if I face an Issue in the Mid of the{' '}
                      {thisIs}?
                    </b>
                    <br></br>Contact your {thisIs} Incharge to Fix the Issue of
                    the System. Don't try to fix on your own.
                  </p>
                </div>
                <div>
                  <p>
                    <b>What should I if my Connection goes offline ?</b>
                    <br></br>Don't close Browser or exit Full Screen.If using
                    Mobile Hotspot try restarting and wait for it to re-Connect.
                    <br></br>If using ethernet try re-plugging the Cable.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {testInfo.ques && active === 4 ? (
            <div className="welcome" id="questionnaire">
              <p>
                This Information is requested by your Organization.<br></br>So
                fill it with respect to the Organization.<br></br>(say name
                should exactly match as stored in their records)
              </p>
              {resQuestionnaire ? (
                <p style={{ marginTop: '3vh', color: 'rgb(10, 117, 69)' }}>
                  Your last filled Questionnaire is already available.<br></br>
                  If there isn't any change there is no need to fill this again
                  you can continue to the Test/Event.
                </p>
              ) : null}
              <form
                id="questionnaireForm"
                method="post"
                ref={this.questionnaire}
                onSubmit={this.processQuestionnaire}
              >
                {testInfo.ques.map((each, index) => {
                  if (each[0] < 3)
                    return (
                      <div className="form-group" key={index}>
                        <label className="form-label">
                          {each[1] ? each[2] + '*' : each[2]}
                        </label>
                        <input
                          className="form-input"
                          type={
                            each[0] === 0
                              ? 'text'
                              : each[0] === 1
                                ? 'email'
                                : each[0] === 2
                                  ? 'number'
                                  : null
                          }
                          name={each[2]}
                          autoComplete="off"
                          maxLength="60"
                          required={each[1] ? true : false}
                        ></input>
                      </div>
                    );
                  else if (each[0] < 5)
                    return (
                      <div className="form-group" key={index}>
                        <label className="inputLabel" htmlFor={index + '0'}>
                          {each[1] ? each[2] + '*' : each[2]}
                        </label>
                        <div className="inputGroup">
                          {each[3].map((eachOpt, resIndex) => {
                            return (
                              <div key={index + '' + resIndex}>
                                <input
                                  type={
                                    each[0] === 3
                                      ? 'radio'
                                      : each[0] === 4
                                        ? 'checkbox'
                                        : null
                                  }
                                  id={index + '' + resIndex}
                                  name={each[2]}
                                  value={eachOpt}
                                  required={
                                    each[0] === 3 && each[1] ? true : false
                                  }
                                ></input>
                                <label htmlFor={index + '' + resIndex}>
                                  {eachOpt}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  else if (each[0] === 5)
                    return (
                      <div className="form-group" key={index}>
                        <label className="inputLabel">
                          {each[1] ? each[2] + '*' : each[2]}
                        </label>
                        <select
                          name={each[2]}
                          className="singleInp"
                          required={each[1] ? true : false}
                        >
                          {each[3].map((eachOpt, resIndex) => {
                            return (
                              <option id="0" key={resIndex} value={eachOpt}>
                                {eachOpt}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  else if (each[0] === 6)
                    return (
                      <div className="form-group" key={index}>
                        <label className="inputLabel" htmlFor={index}>
                          {each[1] ? each[2] + '*' : each[2]}
                        </label>
                        <input
                          className="singleInp"
                          type="date"
                          id={index}
                          name={each[2]}
                          required={each[1] ? true : false}
                        ></input>
                      </div>
                    );
                  else if (each[0] === 7)
                    return (
                      <div className="form-group" key={index}>
                        <label className="inputLabel" htmlFor={index}>
                          {each[1] ? each[2] + '*' : each[2]}
                        </label>
                        <input
                          className="singleInp"
                          type="datetime-local"
                          id={index}
                          name={each[2]}
                          required={each[1] ? true : false}
                        ></input>
                      </div>
                    );
                  else return <></>;
                })}
                <input className="go" type="submit" value="Submit"></input>
              </form>
            </div>
          ) : null}
        </div>
      </>
    );
  }
}
export default ToStart;
