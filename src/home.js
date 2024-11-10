import React, { Component } from "react";
// import "./about.css";
import "./home.css";
import logo from "./favicon-32x32.png";
import { notify, storeError } from "./common.js";

const apiUrl = process.env.REACT_APP_API_URL;

class Home extends Component {
  constructor() {
    super();
    this.state = { process: false };
    this.navLinks = React.createRef();
    this.msgHolder = React.createRef();
  }
  toggleNavBar = (event) => {
    const target = event.target;
    const style = this.navLinks.current.style;
    if (style.display === "flex") {
      setTimeout(() => {
        style.display = "none";
      }, 280);
      style.animationName = "fadeOutUp";
      target.className = "fa fa-bars";
    } else {
      style.display = "flex";
      style.animationName = "fadeInDown";
      target.className = "fa fa-times";
    }
  };
  reqLogout = async () => {
    try {
      const promise = await fetch(`${apiUrl}/logout/`, {
        method: "POST",
        body: `_csrf=${this.state.token}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        this.setState({ loggedIn: false });
      } else if (response.error)
        notify(this.msgHolder, "e", response.error.message);
      else notify(this.msgHolder, "e", "");
    } catch (error) {
      storeError(error, this.state.token);
      notify(
        this.msgHolder,
        "e",
        "Something went wrong.<br>OR<br>Unable to connect to Server."
      );
    }
  };
  submitContact = async (event) => {
    event.preventDefault();
    this.setState({ process: true });
    //
    const formData = new FormData(event.target);
    const token = this.state.token;
    formData.append("_csrf", token);
    try {
      const promise = await fetch(`${apiUrl}/proctor/contact/`, {
        method: "POST",
        body: new URLSearchParams(formData).toString(),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        event.target.reset();
        notify(
          this.msgHolder,
          "s",
          "Received<br>One from our Team will get back to you ASAP."
        );
      } else if (response.error)
        notify(this.msgHolder, "e", response.error.message);
      else {
        this.setState({
          reqErr: "Something went wrong: Unable to Process your Request",
        });
        notify(this.msgHolder, "e", "", 10000);
      }
    } catch (error) {
      notify(
        this.msgHolder,
        "e",
        "SERVER Connection Error<br>Check your Internet Connection"
      );
    } finally {
      this.setState({ process: false });
    }
  };
  componentDidMount() {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    if (isMobile) {
      const navBar = document.getElementsByTagName("nav")[0];
      setTimeout(() => {
        this.navLinks.current.style.top = navBar.offsetHeight + 2 + "px";
      }, 1000);
    }
    const pgData = JSON.parse(document.getElementById("userInfo").innerText);
    const myState = { token: pgData.token };
    if (pgData.loggedIn) myState.loggedIn = true;
    this.setState(myState);
    window.addEventListener("load", () => {
      document.getElementsByTagName("main")[0].style.display = "block";
    });
    window.addEventListener("error", (err) => {
      storeError(err, pgData.token);
    });
  }
  render() {
    const { loggedIn, process } = this.state;
    return (
      <main id="home">
        <div id="msgHolder" ref={this.msgHolder}></div>
        <nav id="homeNav">
          <div>
            <img id="brand-logo" src={logo} alt="logo" srcSet="" />
            <h1 id="brand-text">Shred Test</h1>
          </div>
          <ul ref={this.navLinks} id="homeNav-links">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#whyus">Why Us?</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
            <li>
              <a href="/test">ExamPage</a>
            </li>
            <li>
              <button
                type="button"
                onClick={
                  loggedIn
                    ? this.reqLogout
                    : () => {
                        window.location.assign("/profile");
                      }
                }
                disabled={process ? true : false}
              >
                {loggedIn ? "Log-out" : "Sign-In"}
              </button>
            </li>
          </ul>
          <i
            className="fa fa-bars"
            aria-hidden="true"
            onClick={this.toggleNavBar}
          ></i>
        </nav>
        <section id="top">
          <div id="topCont">
            <h1>Testing Knowledge -#- Testing Skills</h1>
            <h2>- Stable - Secure - Strict -</h2>
            <p>Why not Give it a Try ?</p>
            <h2>
              MCQs + Coding + WebProgramming <br></br>Questions can be Put in
              any<br></br>
              <u>Combination</u> - <u>Number</u> - <u>Order</u>
            </h2>
            <h2>
              WebCam - Microphone - Screen Proctoring<br></br>LIVE Streaming +
              Recording
            </h2>
            <a href="#contact">
              <button type="button">Free Demo Available</button>
            </a>
            <p>- use contact form to get in touch -</p>
          </div>
        </section>
        <section className="types" id="features">
          <h2>Features at a Glance !</h2>
          <div>
            <div className="typeInfo">
              <h4>Basic Features</h4>
              <ul>
                <li>Counter based Logins to Test/Event.</li>
                <li>
                  all <b>Anti-Cheating Features</b> enabled.
                </li>
                <li>
                  Option for <b>Constrained Examination</b>. (ie. Movement
                  Section-by-Section. re-Attempt of Section can be disabled.)
                </li>
                <li>Offers both fixed Duration and fixed Time Frame Exams.</li>
                <li>
                  <b>Proctor LIVE streaming</b>. Monitor the activity of the
                  Candidate on the Go.
                </li>
                <li>Built in application to prepare and generate results.</li>
                <li>
                  Passcode proctected Test and supports Invite only
                  Participation.
                </li>
              </ul>
            </div>
            <div className="typeInfo">
              <h4>Advanced Features</h4>
              <ul>
                <li>
                  Optimised support for <b>Question Bank Pool</b>. Random
                  selection of questions from Question Bank.
                </li>
                <li>
                  Option for <b>Media Proctoring</b> (webCam/Microphone) and{" "}
                  <b>Screen Proctoring</b>.
                </li>
                <li>Ability to detect Script Tampering.</li>
                <li>
                  Highly Trained AI based model to{" "}
                  <b>detect any Test Tampering</b> &amp;{" "}
                  <b>proctor stream tampering</b>.
                </li>
                <li>
                  Auto-management of Candidate Stream so that you don't miss a
                  second.
                </li>
                <li>
                  Special Feature that tries to{" "}
                  <b>Handle inabilities of System/PC</b> to a greater extent
                  during final submit of responses.
                </li>
              </ul>
            </div>
          </div>
          <div>
            <div className="typeInfo">
              <h4>Candidate Restictions</h4>
              <ul>
                <li>
                  Strict Exam environment, with logging of Violations and
                  Tampers.
                </li>
                <li>
                  Movement and Actions are <b>strictly monitored</b>.
                </li>
                <li>Browser TABs are monitored.</li>
                <li>
                  Super fast stream tampering detection, both media and screen.
                </li>
                <li>Disabled context menu and inspecting behaviour.</li>
              </ul>
            </div>
            <div className="typeInfo">
              <h4>MCQs</h4>
              <ul>
                <li>Completely supports HTML Based question Framing.</li>
                <li>
                  Option for <b>Image-Based Questions</b>.
                </li>
                <li>
                  Option for an explanatory Text with a maintained character
                  indentation.
                </li>
                <li>Easy navigation between Questions.</li>
                <li>Enlarged option selector.</li>
                <li>
                  <b>Option Shuffling</b> &amp; <b>Question Shuffling</b>.
                </li>
              </ul>
            </div>
          </div>
          <div>
            <div className="typeInfo">
              <h4>Coding</h4>
              <ul>
                <li>
                  Supports all Major Languages.<br></br>C, C++, C++11, C++14,
                  C#, Go, Haskell, Java, Java 8, JavaScript(Rhino),
                  JavaScript(Nodejs), Kotlin, Objective, Pascal, Perl, PHP,
                  Python 2, Python 3, Scala, Swift, etc etc
                </li>
                <li>Different questions can be in different language.</li>
                <li>Can add unlimited example input and output.</li>
                <li>
                  Option for Fixed <b>Upper Readable</b> and{" "}
                  <b>Lower Readable</b> Codes.
                </li>
                <li>
                  Can hold any Number of TestCases (each can carry varying
                  Marks).
                </li>
                <li>
                  <b>Distributed Evalution</b> (ie. Output for each Test Case is
                  evaluated line by line)
                </li>
              </ul>
            </div>
            <div className="typeInfo">
              <h4>WebProgramming</h4>
              <ul>
                <li>
                  HTML + CSS + JS.<br></br>(Can be compiled both{" "}
                  <u>in Combination</u> and / or <u>Independently</u>)
                </li>
                <li>
                  Supports all Top libraries and frameworks like Bootstrap,
                  React, Angular, Vue, jQuery etc. etc.
                </li>
                <li>
                  <b>In built Console </b>which supports all types of scripting.
                </li>
                <li>Expected Output can embed both Image and External Page.</li>
                <li>
                  Draggable and Resizable Expected Output Window (Double Click
                  to enable/disable dragging).
                </li>
                <li>
                  <b>Full Window Editor.</b>
                </li>
                <li>
                  <b>Resizable</b> Code Editors, Output Window and Console.
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section className="types" id="whyus">
          <h2>Why Us ? Advantages we offer</h2>
          <div>
            <div className="typeInfo">
              <h4>to Candidates</h4>
              <ul>
                <li>
                  An <b>eye-soothing</b> and <b>classic design</b>.
                </li>
                <li>
                  Easy navigation and more space to the Candidate. Now no-more
                  extra and irritating text just minimum needed.
                </li>
                <li>
                  The colors used and application-interface creates a calming
                  effect during the Test.
                </li>
                <li>Best Interface which offers best experience.</li>
                <li>
                  <u>Least data-consumption</u> with a varying set of parameters
                  and can be easily scaled by the Admin on the Go.
                </li>
                <li>
                  <b>Most lightweight</b> application in the whole industry.
                </li>
                <li>
                  Dedicated team that listens to the Candidate's views and
                  feedbacks, and regularly reports to the Development Team.
                </li>
              </ul>
            </div>
            <div className="typeInfo">
              <h4>to Admin</h4>
              <ul>
                <li>Most basic panel to create and customize the Test.</li>
                <li>
                  Highly <b>customizable Test Environment</b>.
                </li>
                <li>
                  Always kept under Development Task, starts with basic design
                  and move towards customizations as per your feedbacks.
                </li>
                <li>
                  Completely <b>automated proctor Environment</b> which handles
                  lost connections.
                </li>
                <li>Duplicate participation monitoring.</li>
                <li>
                  Option for <b>stream recording</b>.
                </li>
                <li>
                  <u>Control over Participation of Candidates</u> you can end it
                  from your side.
                </li>
                <li>Proctor initiated Chat Window.</li>
                <li>Full support for Multi-Proctor.</li>
              </ul>
            </div>
          </div>
        </section>
        <section className="types" id="pricing">
          <h2>Pricing</h2>
          <div className="typeInfo">
            <ul>
              <li>
                Guaranteed to be <b>most affordable</b> in the market.
              </li>
              <li>
                We follow a variable pricing that depends on a number of factors
                and is more beneficial to the Clients.
              </li>
              <li>
                Since we offer customizable Tests it would be inappropriate to
                offer every client with the same Price and you won't like that.
              </li>
              <li>
                In order to explore the Services and to get a quote for your
                Organization, please drop a message using below contact form.
              </li>
              <li>
                The portal is <u>always open for free to try</u>.
              </li>
            </ul>
          </div>
        </section>
        <section className="types" id="contact">
          <h2>Contact Us</h2>
          <form method="post" id="contactForm" onSubmit={this.submitContact}>
            <label htmlFor="name">Full Name -:</label>
            <input
              name="name"
              id="name"
              placeholder="Your Full Name"
              maxLength="50"
            ></input>
            <p></p>
            <label htmlFor="mail">Email-Id -:</label>
            <input
              type="email"
              name="mailId"
              id="mail"
              placeholder="Updates will be sent here"
              defaultValue=""
              maxLength="100"
            ></input>
            <p></p>
            <label htmlFor="mobno">Mobile Number</label>
            <input
              type="text"
              name="mobNo"
              id="mobno"
              placeholder="Enter 10-digit Mobile Number"
              minLength="10"
              maxLength="10"
            ></input>
            <p></p>
            <label htmlFor="msg">Any initial Message ?</label>
            <textarea
              name="msg"
              id="msg"
              rows="9"
              placeholder="Type it Here"
              autoComplete="off"
              maxLength="500"
            ></textarea>
            <div>
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
            </div>
          </form>
        </section>

        <footer>
          <h4>
            <i className="fa fa-copyright fa-2x" aria-hidden="true"></i>
            <p>&nbsp;Copyright (2021) Shred Test</p>
          </h4>
        </footer>
      </main>
    );
  }
}
export default Home;
