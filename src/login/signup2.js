import React, { PureComponent } from 'react';
import { notify } from './../common.js';

const apiUrl = process.env.REACT_APP_API_URL;
const appEnv = process.env.REACT_APP_APP_ENV;
const isProd = appEnv === 'PROD';

class SignUp2 extends PureComponent {
  constructor() {
    super();
    this.state = { errMsg: '', process: false };
    this.inputPswd = React.createRef();
    //
    this.reqCtr = 0;
  }
  showPswdCheck = (status, index) => {
    const ele = this.pswdChk[index];
    if (!ele) return false;
    if (status === 1) ele.className = 'fa fa-check styleGreen';
    else ele.className = 'fa fa-times styleRed';
  };
  pswdChkLive = () => {
    const { msgHolder } = this.props;
    const pswd = this.inputPswd.current.value.trim();
    const len = pswd.length;
    //
    if (/\s/g.test(pswd)) {
      notify(msgHolder, 'e', 'No whitespace allowed');
      return false;
    }
    if (/\t/g.test(pswd)) {
      notify(msgHolder, 'e', 'No TAB spaces allowed');
      return false;
    }
    if (len >= 6 && len <= 16) this.showPswdCheck(1, 0);
    else this.showPswdCheck(0, 0);
    //
    if (/[A-Z]/g.test(pswd)) this.showPswdCheck(1, 1);
    else this.showPswdCheck(0, 1);
    //
    if (/[a-z]/g.test(pswd)) this.showPswdCheck(1, 2);
    else this.showPswdCheck(0, 2);
    //
    if (/\d/g.test(pswd)) this.showPswdCheck(1, 3);
    else this.showPswdCheck(0, 3);
    //
    if (/\W|_/g.test(pswd)) this.showPswdCheck(1, 4);
    else this.showPswdCheck(0, 4);
  };
  registerAccount = async (event) => {
    event.preventDefault();
    const { msgHolder } = this.props;
    if (this.reqCtr > 5) {
      notify(
        msgHolder,
        'e',
        'Reached maximum attempts allowed.<br>Please retry after few hours.'
      );
      return false;
    }
    const notSatis = document.querySelectorAll('#pswdChkLive .fa-times');
    if (notSatis.length) {
      notify(
        msgHolder,
        'e',
        "Entered Password doesn't satisfy all security Standards.<br>For details see text against Red Cross."
      );
      return false;
    }
    this.setState({ process: true });
    const pswd = this.inputPswd.current.value.trim();
    if (!pswd) {
      notify(msgHolder, 'e', "Password can't be blank.");
      return false;
    }
    const formData = new FormData();
    formData.append('password', pswd);
    const { isReset, token } = this.props;
    if (isReset) formData.append('isReset', true);
    formData.append('_csrf', token);
    const formBody = new URLSearchParams(formData).toString();
    try {
      const promise = await fetch(`${apiUrl}/login/register_Acc/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: formBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      this.reqCtr++;
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        response.userInfo.token = token;
        if (this.props.isHome)
          this.props.setMainCompState({
            action: 6,
            userInfo: response.userInfo,
          });
        else {
          if (response.userInfo.uname && response.userInfo.name)
            this.props.setExamCompState({
              userInfo: response.userInfo,
              loggedIn: true,
            });
          else {
            window.alert(
              'You must create your username and Fill your name in your profile to continue to the Test.\nWe are redirecting you to the Profile-Page.'
            );
            this.props.setMainCompState({
              action: 6,
              userInfo: response.userInfo,
            });
          }
        }
      } else if (response.error)
        return this.setState({
          errMsg: response.error.message,
          process: false,
        });
      else notify(msgHolder, 'e', '');
      this.setState({ process: false });
    } catch (error) {
      notify(
        msgHolder,
        'e',
        'SERVER Connection Error<br>Check your Internet Connection'
      );
      this.setState({ process: false });
    }
  };
  componentDidMount() {
    this.pswdChk = document.querySelectorAll('#pswdChkLive .fa');
    if (this.props.isReset) document.title = 'Create new Password';
    else document.title = 'Secure your Account';
  }
  render() {
    const { process, errMsg } = this.state;
    const { isReset, toggleShowHide } = this.props;
    return (
      <>
        <h2>{isReset ? 'Create New Password' : 'Secure your Account'}</h2>
        <form method="post" onSubmit={this.registerAccount}>
          <div className="middleText">
            <p>✩ Account Verification Complete.</p>
            {isReset ? (
              <p>
                ✩ Create a Password that is both easy to Remember and difficult
                to guess.
              </p>
            ) : (
              <p>✩ Please create a Strong Password for your Account.</p>
            )}
          </div>
          <div className="field">
            <i className="floatter fa fa-key" aria-hidden="true"></i>
            <input
              ref={this.inputPswd}
              type="password"
              autoComplete="off"
              name="pswd"
              placeholder="Enter a strong Password"
              minLength="8"
              maxLength="16"
              onKeyUp={this.pswdChkLive}
              required
            ></input>
            <button type="button" id="eyeBtn">
              <i
                className="fa fa-eye-slash"
                id="eyeIcon"
                aria-hidden="true"
                onClick={toggleShowHide}
              ></i>
            </button>
          </div>
          <div id="pswdChkLive">
            <p>
              <i className="fa fa-check" aria-hidden="true"></i>
              <span>Min 6 - Max 16 Characters</span>
            </p>
            <p>
              <i className="fa fa-check" aria-hidden="true"></i>
              <span>Min 1 UpperCase Character (A-Z)</span>
            </p>
            <p>
              <i className="fa fa-check" aria-hidden="true"></i>
              <span>Min 1 LowerCase Character (a-z)</span>
            </p>
            <p>
              <i className="fa fa-check" aria-hidden="true"></i>
              <span>Min 1 Number (0-9)</span>
            </p>
            <p>
              <i className="fa fa-check" aria-hidden="true"></i>
              <span>Min 1 Special Character (eg @ # $ % &amp; * )</span>
            </p>
          </div>
          {!process && errMsg ? (
            <div
              className="errMsg"
              dangerouslySetInnerHTML={{
                __html: errMsg,
              }}
            ></div>
          ) : null}
          {isReset ? null : (
            <div className="middleText">
              <input type="checkbox" name="agree" id="tandc" required></input>
              <label htmlFor="tandc">
                &nbsp;I agree to&nbsp;
                <a href="/terms.html" target="_blank">
                  all terms and conditions
                </a>
                &nbsp;related to use of this website and its Services.
              </label>
            </div>
          )}
          <div>
            <button
              className="btnPrimary"
              type="submit"
              disabled={process ? true : false}
            >
              {isReset ? 'Submit' : 'Register Me'}
            </button>
          </div>
        </form>
      </>
    );
  }
}
export default SignUp2;
