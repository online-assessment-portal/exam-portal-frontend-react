import React, { PureComponent } from 'react';
import { Link } from 'react-router';
import spinner from './spinner.svg';
class ReqResponse extends PureComponent {
  responseBtnComp = () => {
    const callback = this.props.callback;
    return (
      <div id="responseBtn">
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <button
          type="button"
          className="btnPrimary"
          onClick={() => callback(1)}
        >
          YES
        </button>
        <button
          type="button"
          className="btnSecondary"
          onClick={() => callback(0)}
        >
          NO
        </button>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
      </div>
    );
  };
  devicePermission = (val) => {
    if (val === 1) return 'Optional';
    else if (val === 2) return 'Required (if available)';
    else if (val === 3) return 'Compulsory';
    else return 'No Information';
  };
  permissionStatus = (val) => {
    if (val === 0) return 'Not Intitated';
    else if (val === 1) return 'Ready - Accepted';
    else if (val === -1) return 'Browser Granted';
    else if (val === -2) return 'Browser Prompted';
    else if (val === -3) return 'Browser Denied';
    else if (val === -4) return 'your System Denied';
    else if (val === -5) return 'Permission Dismissed';
    else if (val === -9) return 'Use Chrome Browser';
    else return 'Unable to Determine';
  };
  proctorFormHandle = (event) => {
    event.preventDefault();
    this.props.callback();
  };
  componentDidMount() {
    const { wh, data } = this.props;
    if (!this.intiated && data && wh === 'usrM') {
      if (data.cam)
        data.permissionStatus('camera', 1).then(() => {
          if (data.mic) data.permissionStatus('microphone', 1);
        });
      else if (data.mic) data.permissionStatus('microphone', 1);
      this.intiated = true;
    }
  }
  render() {
    const { wh, callback, data } = this.props;
    return (
      <div id="responseWin">
        <div
          className={wh !== 'usrM' && wh !== 'usrS' ? 'fWidthRes' : ''}
          id="responseDiv"
        >
          {wh === 'fscr' ? (
            <>
              <h2>
                Your Organization wants you to appear in Full Screen mode only.
              </h2>
              <p>
                Please don't exit full-Screen after it is implemented otherwise
                the Test Environment may misbehave.
              </p>
              <button type="button" className="btnPrimary" onClick={callback}>
                OK
              </button>
            </>
          ) : wh === 'usrM' ? (
            <>
              <h3 className="permHead">Media Proctoring</h3>
              <div className="mediaPerm">
                <div className="howTo">
                  <h4>
                    <u>Steps to follow -:</u>
                  </h4>
                  <ol>
                    <li>Once Prompted choose Allow.</li>
                    <li>The Stream will Begin.</li>
                  </ol>
                  <p>If Status : System Denied</p>
                  <ul>
                    <li>
                      Search for camera/microphone permissions in your PC and
                      allow it for your System.
                    </li>
                    <li>Reload/Refresh this Page.</li>
                  </ul>
                  <p>If Status : Browser Denied</p>
                  <ul>
                    <li>
                      Open Site Settings and allow camera and microphone for
                      this website (shredtest.coderadiant.com).
                    </li>
                    <li>Reload/Refresh this Page.</li>
                  </ul>
                </div>
                <div className="status">
                  <table>
                    <thead>
                      <tr>
                        <th>Device</th>
                        <th>Acceptance</th>
                        <th>Permission Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.cam ? (
                        <tr>
                          <td>Camera</td>
                          <td>{this.devicePermission(data.cam)}</td>
                          <td>{this.permissionStatus(data.cameraP)}</td>
                        </tr>
                      ) : null}
                      {data.mic ? (
                        <tr>
                          <td>Microphone</td>
                          <td>{this.devicePermission(data.mic)}</td>
                          <td>{this.permissionStatus(data.micP)}</td>
                        </tr>
                      ) : null}
                      {data.spkr ? (
                        <tr>
                          <td>Speakers</td>
                          <td colSpan="2">Required for Audio Broadcast</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                  {data.cam ? (
                    <video
                      ref={(element) => {
                        if (element) {
                          element.srcObject = data.candStream;
                        }
                      }}
                      autoPlay
                      muted
                    ></video>
                  ) : null}
                </div>
              </div>
              <form onSubmit={this.proctorFormHandle}>
                <div key="agreeMd">
                  <input
                    type="checkbox"
                    id="agreeM"
                    required={data.candStream ? true : false}
                  ></input>
                  <label htmlFor="agreeM">
                    {' '}
                    I completely understand and agree to{' '}
                    <Link to="/terms.html" target="_blank">
                      Terms & Conditions
                    </Link>{' '}
                    of media proctoring.
                  </label>
                </div>
                <button type="submit" className="btnPrimary">
                  Step Ahead
                </button>
              </form>
            </>
          ) : wh === 'usrS' ? (
            <>
              <h3 className="permHead">Screen/Window Proctoring</h3>
              <div className="mediaPerm">
                <div className="howTo">
                  <h4>
                    <u>Steps to follow -:</u>
                  </h4>
                  <ol>
                    <li>Click on Request Button.</li>
                    <li>
                      Once Prompted select the screen that is required and click
                      share/allow.
                      {data.win === 2 ? (
                        <ul>
                          <li>
                            Since required screen is <b>Browser Window</b> it is
                            your responsibility to verify that Browser Window is
                            being Proctored, in case you share some other window
                            your Test/Event may be automatically ended.
                          </li>
                        </ul>
                      ) : null}
                    </li>
                    <li>The Stream will Begin.</li>
                  </ol>
                  <p>
                    <b>V. Important Note</b>
                    <br></br>In some browsers a small window may appear saying
                    that you are sharing your screen.<br></br>This will be your
                    one and only chance to hide/minimize that dialog window.
                    Hiding it later will create a Violation.
                  </p>
                </div>
                <div className="status">
                  <table>
                    <thead>
                      <tr>
                        <th>Required Screen</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          {data.win === 1
                            ? 'Entire Screen'
                            : data.win === 2
                              ? 'Browser Window'
                              : 'In Choice'}
                        </td>
                        <td>
                          {data.scrnStream
                            ? 'Ready - Accepted'
                            : 'Not Available'}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btnPrimary"
                            onClick={data.getStream}
                            style={{ margin: 0 }}
                          >
                            Request
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <video
                    ref={(element) => {
                      if (element) {
                        element.srcObject = data.scrnStream;
                      }
                    }}
                    autoPlay
                    muted
                  ></video>
                </div>
              </div>
              <form onSubmit={this.proctorFormHandle}>
                <div key="agreeSc">
                  <input
                    type="checkbox"
                    id="agreeS"
                    required={data.scrnStream ? true : false}
                  ></input>
                  <label htmlFor="agreeS">
                    {' '}
                    I completely understand and agree to{' '}
                    <Link to="/terms.html" target="_blank">
                      Terms & Conditions
                    </Link>{' '}
                    of Window/Screen proctoring.
                  </label>
                </div>
                <button type="submit" className="btnPrimary">
                  Step ahead
                </button>
              </form>
            </>
          ) : wh === 'cover' ? (
            <>
              <h1>Please Wait</h1>
              <h3>We are processing your Request</h3>
              <img
                style={{ maxHeight: '5vw', maxWidth: '5vw' }}
                src={spinner}
                alt="Wait Wait Wait"
              ></img>
            </>
          ) : wh === 'over' ? (
            <>
              <h2 style={{ textDecoration: 'underline #0074d9' }}>
                Submitting your Test
              </h2>
              <h3>
                Don't Close this Page or Perform any Action on your System
                <br />
                Be Patient
              </h3>
              <img
                style={{ maxHeight: '5vw', maxWidth: '5vw' }}
                src={spinner}
                alt="Wait Wait Wait"
              ></img>
              <fieldset>
                <legend>If Submission Fails</legend>
                <ul style={{ textAlign: 'left', marginLeft: '2vw' }}>
                  <li>
                    <b style={{ fontSize: 'large' }}>
                      Don't Refresh/Reload the Page you will loose all your new
                      Answers.
                    </b>
                  </li>
                  <li>Check your Internet Connection.</li>
                  <li>Seek help from your Test Incharge.</li>
                  <li>
                    Server will auto retry after few seconds so don't perform
                    any action yourself.
                  </li>
                  <li>
                    Don't Exit this Page / Close the Browser / Run any Tools/
                    other Application in any Case.
                  </li>
                  <li>
                    Remember- Absolute ZERO actions.Just Leave the System.
                  </li>
                </ul>
              </fieldset>
            </>
          ) : wh === 'overErr' ? (
            <>
              <h2 style={{ textDecoration: 'underline #0074d9' }}>
                Test Submission : Error Action
              </h2>
              <h3>
                Don't Close this Page / Browser <br />
                Be Calm you will never loose your Answers if you don't run any
                Tools / other Application.
              </h3>
              <fieldset>
                <legend>What should I do ?</legend>
                <ul style={{ textAlign: 'left', marginLeft: '2vw' }}>
                  <li>
                    Check your Internet Connection.Proceed ahead only after
                    connecting to the Internet.
                  </li>
                  <li>
                    Refresh this Page and try Starting the Test Again, Server
                    will auto retry to collect your Responses.
                  </li>
                  <li>
                    If this doesn't work seek help from your Test Incharge.
                  </li>
                  <li>
                    It is a must that you Inform the Test Incharge about the
                    Late Submission stating the exact Reason.
                  </li>
                </ul>
              </fieldset>
            </>
          ) : wh === 'peer' ? (
            <>
              <h2 style={{ textDecoration: 'underline #0074d9' }}>
                Subordinate Server : Connection Error
              </h2>
              <fieldset>
                <legend>Please read the instructions carefully ?</legend>
                <ul style={{ textAlign: 'left', marginLeft: '2vw' }}>
                  <li>
                    If using some other Browser prefer switching to Chrome
                    Browser.
                  </li>
                  <li>
                    Disable all the extensions that are installed, I repeat ALL.
                    Some block connections without knowing what it is meant for.
                  </li>
                  <li>
                    Check speed of your Internet Connection. Switch to high
                    speed connections.
                  </li>
                  <li>
                    After verifying all above conditions, refresh this Page to
                    retry connecting.
                  </li>
                  <li>
                    If you still face this issue you can continue to Test/Event
                    ignoring this notification, but your Organization will be
                    notified about it.
                  </li>
                </ul>
              </fieldset>
              <div id="responseBtn">
                <button
                  type="button"
                  className="btnPrimary"
                  onClick={() => callback({ confirm: false })}
                >
                  OK
                </button>
              </div>
            </>
          ) : wh === 'resetConf' ? (
            <>
              <h2>
                Are you sure you want to reset all your codes &amp; response for
                the current Question ?
              </h2>
              <p>Please note this action is irreversible.</p>
              {this.responseBtnComp()}
            </>
          ) : typeof wh === 'number' ? (
            <>
              {wh === 0 ? (
                <h2 style={{ color: 'orangered' }}>
                  Are you sure,<br></br>you want to Submit and End ?
                </h2>
              ) : wh === 1 ? (
                <>
                  <h2>Are you sure you want to move to next section ?</h2>
                  <p>
                    You will not be allowed to get back to this section later
                  </p>
                </>
              ) : wh === 3 || wh === 4 ? (
                <>
                  <h2>
                    Are you sure about denying {wh === 3 ? 'Media' : 'Screen'}{' '}
                    Proctoring ?
                  </h2>
                  <p>Click Yes to proceed, No to alter your stand.</p>
                </>
              ) : null}
              {this.responseBtnComp()}
            </>
          ) : null}
        </div>
      </div>
    );
  }
}
export default ReqResponse;
