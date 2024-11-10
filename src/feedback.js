import React, { PureComponent } from "react";
import NavBar from "./navbar";
import logo from "./favicon-32x32.png";
import { notify } from "./common.js";
//
import "./feedback.css";

const apiUrl = process.env.REACT_APP_API_URL;

class FeedbackForm extends PureComponent {
  constructor() {
    super();
    this.state = { process: false };
    this.msgHolder = React.createRef();
    this.feedback = React.createRef();
  }
  exitFeedback = () => {
    setTimeout(() => {
      window.close();
      window.location.assign("/");
    }, 10000);
    const fEle = document.fullscreenElement;
    if (fEle) document.exitFullscreen();
  };
  submitForm = async (event) => {
    event.preventDefault();
    if (!this.feedback.current.value) {
      notify(
        this.msgHolder,
        "s",
        "Feedback Skipped.<br>For security of submission please logout and then close this TAB",
        100000
      );
      this.exitFeedback();
      return false;
    }
    this.setState({ process: true });
    const { passcode, token } = this.props;
    const formData = new FormData(event.target);
    formData.append("passcode", passcode);
    formData.append("_csrf", token);
    const formBody = new URLSearchParams(formData).toString();
    try {
      const promise = await fetch(`${apiUrl}/cand/feedback/`, {
        method: "POST",
        body: formBody,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        event.target.reset();
        notify(
          this.msgHolder,
          "s",
          "Feedback Received.<br>We assure you more better experience next time.<br>For security of submission please logout and then close this TAB",
          100000
        );
        this.exitFeedback();
      } else if (response.error)
        notify(this.msgHolder, "e", response.error.message);
      else notify(this.msgHolder, "e", "");
    } catch (error) {
      notify(
        this.msgHolder,
        "e",
        "&starf; your Browser failed to Connect to SERVER<br>&starf; Check your Internet Connection"
      );
    } finally {
      this.setState({ process: false });
    }
  };
  componentDidMount() {
    document.title = "Feedback";
  }
  render() {
    const { process } = this.state;
    return (
      <>
        <NavBar logOut={this.props.logOut} />
        <main id="feedback">
          <div>
            <img src={logo} alt="logo" border="0"></img>
            <h2>Shred Test</h2>
          </div>
          <h4>
            Please provide us with your Valuable Feedback<br></br>Help us Serve
            you Better
          </h4>
          <form method="post" id="feedbackForm" onSubmit={this.submitForm}>
            <textarea
              ref={this.feedback}
              name="feedback"
              cols="25"
              rows="5"
              placeholder="your each word is important to us, Please try your level best to be crisp and clear"
            ></textarea>
            <button
              className="btnPrimary"
              type="submit"
              disabled={process ? true : false}
            >
              Submit
              {process ? (
                <i className="fa fa-spinner" aria-hidden="true"></i>
              ) : null}
            </button>
          </form>
          <br></br>
          <p>
            To Host any Test / Event / Quizes, you can reach us on our WhatsApp
            8529493017.
          </p>
          <div id="msgHolder" ref={this.msgHolder}></div>
        </main>
      </>
    );
  }
}
export default FeedbackForm;
