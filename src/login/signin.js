import React, { PureComponent } from "react";
import { notify } from "./../common.js";

const apiUrl = process.env.REACT_APP_API_URL;

class SignIn extends PureComponent {
  constructor() {
    super();
    this.state = { signInErr: "", process: false };
    this.inputPswd = React.createRef();
    //
    this.reqCtr = 0;
  }
  pswdValidate = () => {
    const pswd = this.inputPswd.current.value.trim();
    const len = pswd.length;
    //
    if (
      /\s/g.test(pswd) ||
      /\t/g.test(pswd) ||
      !(len >= 6 && len <= 16) ||
      !/[A-Z]/g.test(pswd) ||
      !/[a-z]/g.test(pswd) ||
      !/\d/g.test(pswd) ||
      !/\W|_/g.test(pswd)
    )
      return "Password Validation Error : Invalid Format";
    else return false;
  };
  signIn = async (event) => {
    event.preventDefault();
    const { msgHolder, token } = this.props;
    if (this.reqCtr > 5) {
      notify(
        msgHolder,
        "e",
        "Reached maximum attempts allowed.<br>Please retry after 15 mins."
      );
      return false;
    }
    const validate = this.pswdValidate();
    if (validate) {
      this.setState({ signInErr: validate });
      return false;
    }
    this.setState({ process: true });
    try {
      const formData = new FormData(event.target);
      formData.append("_csrf", token);
      const formBody = new URLSearchParams(formData).toString();
      const promise = await fetch(`${apiUrl}/login/signIn/`, {
        method: "POST",
        body: formBody,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
            return this.props.setExamCompState({
              userInfo: response.userInfo,
              loggedIn: true,
            });
          else {
            window.alert(
              "You must create your username and Fill your name in your profile to continue to the Test.\nWe are redirecting you to the Profile-Page."
            );
            return this.props.setMainCompState({
              action: 6,
              userInfo: response.userInfo,
            });
          }
        }
      } else if (response.error) {
        return this.setState({
          signInErr: response.error.message,
          process: false,
        });
      } else notify(msgHolder, "e", "");
      this.setState({ process: false });
    } catch (error) {
      notify(
        msgHolder,
        "e",
        "SERVER Connection Error<br>Check your Internet Connection"
      );
      this.setState({ process: false });
    }
  };
  componentDidMount() {
    document.title = "Sign-In";
  }
  render() {
    const { process, signInErr } = this.state;
    const { toggleShowHide, setMainCompState, googleLogo } = this.props;
    return (
      <>
        <h2>Sign In</h2>
        <form method="post" onSubmit={this.signIn}>
          <div className="field">
            <i className="floatter fa fa-user" aria-hidden="true"></i>
            <input
              type="text"
              name="uname"
              placeholder="Enter Username / e-Mail"
              minLength="3"
              maxLength="60"
              required
            ></input>
          </div>
          <div className="field">
            <i className="floatter fa fa-key" aria-hidden="true"></i>
            <input
              ref={this.inputPswd}
              type="password"
              autoComplete="off"
              name="password"
              placeholder="Enter Password"
              minLength="6"
              maxLength="16"
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
          {!process && signInErr ? (
            <div
              className="errMsg"
              dangerouslySetInnerHTML={{
                __html: signInErr,
              }}
            ></div>
          ) : null}
          <div>
            <button
              className="btnPrimary"
              type="submit"
              disabled={process ? true : false}
            >
              Submit
            </button>
          </div>
          <div id="frgtPswd">
            <button
              className="blueLinkBtn"
              type="button"
              onClick={() => {
                setMainCompState({ action: 4 });
              }}
              disabled={process ? true : false}
            >
              &nbsp;Forgot Password ?&nbsp;
            </button>
          </div>
          <h3 className="othOptHead">
            <span>OR</span>
          </h3>
          <div id="alternateLogin">
            <button
              className="gLogin"
              type="button"
              disabled={process ? true : false}
              onClick={() => {
                this.setState({ process: true });
                localStorage.setItem("gLogin", window.location.pathname);
                window.location.replace(
                  "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20profile&response_type=code&client_id=1025872685182-o5jdqap12eg6d9t06sh5nqqdnj8she8s.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fshredtest.cf%2Fgsign%2Fgoogle-login"
                );
              }}
            >
              <img src={googleLogo} alt="G" srcSet=""></img>
              <p>Sign-In with Google</p>
            </button>
          </div>
          <h3 className="othOptHead">
            <span>Have No Account ?</span>
          </h3>
          <div>
            <button
              className="blueLinkBtn"
              type="button"
              onClick={() => {
                setMainCompState({ action: 2 });
              }}
              disabled={process ? true : false}
            >
              &nbsp;&nbsp;Create your Account&nbsp;&nbsp;
            </button>
          </div>
        </form>
      </>
    );
  }
}
export default SignIn;
