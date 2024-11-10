import React, { Component } from "react";
import { io } from "socket.io-client";
import { notify } from "./../common.js";
import { dateTimeFormat } from "./../helpers/dateTimeFormat";

const apiUrl = process.env.REACT_APP_API_URL;

class Invite extends Component {
  constructor(props) {
    super();
    this.state = {
      queue: [],
      status: [],
      mailSub: "",
      mailImg: "",
      extra: "",
      close: "Regards<br>Team Shred Test",
      name: "Sachin Kumar",
      desig: "Admin Shred Test",
      mobno: "8529493017",
      mail: "sachin@shredtest.cf",
      instr: false,
      // This is email of mail account
      mailAccKey: Object.keys(props.mailAcc)[0],
    };
    this.mailWriter = React.createRef();
    this.mailHTML = React.createRef();
  }
  validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  getAllSentMail = async () => {
    const { passcode, msgHolder, token } = this.props;
    try {
      const promise = await fetch(`${apiUrl}/invite/allInvites/`, {
        method: "POST",
        body: `passcode=${passcode}&_csrf=${token}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        const newList = [];
        const { queue } = this.state;
        response.data.forEach((each) => {
          if (queue.indexOf(each.email) === -1) newList.push(each.email);
        });
        if (newList.length) {
          let { queue, status } = this.state;
          queue = [...queue, ...newList];
          status = [...status, ...new Array(newList.length).fill(1)];
          this.setState({ queue: queue, status: status });
        }
        if (newList.length)
          notify(msgHolder, "s", `Total Sent Mails-: ${newList.length}`);
      } else if (response.error) notify(msgHolder, "e", response.error.message);
      else notify(msgHolder, "e", "");
    } catch (error) {
      notify(
        msgHolder,
        "e",
        "Something went wrong.<br>OR<br>Unable to connect to Server."
      );
    }
  };
  createQueue = () => {
    const { msgHolder } = this.props;
    const newMails = this.mailWriter.current.value.split(",");
    this.mailWriter.current.value = "";
    //
    let { queue, status } = this.state;
    const newList = [];
    newMails.forEach((each) => {
      if (this.validateEmail(each)) {
        if (queue.indexOf(each) === -1 && newList.indexOf(each) === -1)
          newList.push(each);
        else notify(msgHolder, "e", `Duplicate Rejected.<br>Email: ${each}`);
      } else {
        if (each) notify(msgHolder, "e", `Invalid Email:<br>${each}`);
      }
    });
    //
    queue = [...queue, ...newList];
    status = [...status, ...new Array(newList.length).fill(-1)];
    this.setState({ queue: queue, status: status });
  };
  mailErr = (status) => {
    let str = "";
    if (status === 2) str = "Failed";
    else if (status === 3) str = "Invalid Recipient";
    else if (status === 4) str = "Mailer A/C Auth Failed";
    return str;
  };
  intiateMail = async (index) => {
    const { queue, mailSub, mailAccKey } = this.state;
    // -1 send to all
    const { passcode, mailAcc, msgHolder, token } = this.props;
    const formData = new FormData();
    formData.append("mailBody", this.mailHTML.current.innerHTML);
    formData.append("from", mailAccKey);
    //
    const account = mailAcc[mailAccKey];
    formData.append("sender", account.name);
    formData.append("token", account.token);
    //
    formData.append("mailSub", mailSub);
    formData.append("passcode", passcode);
    formData.append("myHold", this.socket.id);
    formData.append("_csrf", token);
    if (index === -1) {
      formData.append("queue", JSON.stringify(queue));
      this.setState({ status: new Array(queue.length).fill(0) });
    } else {
      formData.append("queue", `["${queue[index]}"]`);
      this.setState((prevState) => {
        prevState.status[index] = 0;
        return prevState;
      });
    }
    try {
      const formBody = new URLSearchParams(formData).toString();
      const promise = await fetch(`${apiUrl}/invite/mail/`, {
        method: "POST",
        body: formBody,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true)
        notify(msgHolder, "s", response.msg);
      else if (response.error) notify(msgHolder, "e", response.error.message);
      else notify(msgHolder, "e", "");
    } catch (error) {
      notify(
        msgHolder,
        "e",
        "Something went wrong.<br>OR<br>Unable to connect to Server."
      );
    }
  };
  renderMailTable = (mailAcc) => {
    const content = [];
    let index = 0;
    for (const key in mailAcc) {
      if (Object.hasOwnProperty.call(mailAcc, key)) {
        const each = mailAcc[key];
        const id = `selMAc${index}`;
        content.push(
          <tr key={index}>
            <td>
              <input
                type="radio"
                name="selMailer"
                id={id}
                value={key}
                defaultChecked={index === 0 ? true : false}
                onChange={(e) => {
                  this.setState({ mailAccKey: e.target.value });
                }}
              ></input>
            </td>
            <td>
              <label htmlFor={id}>{index + 1}</label>
            </td>
            <td>
              <label htmlFor={id}>{key}</label>
            </td>
            <td>
              <label htmlFor={id}>{each.name}</label>
            </td>
            <td>
              <label htmlFor={id}>{each.token ? "GMail" : "Mail-Server"}</label>
            </td>
          </tr>
        );
        index++;
      }
    }
    return content;
  };
  setStatus = (data) => {
    let { queue, status } = this.state;
    //
    data.forEach((obj) => {
      const i = queue.indexOf(obj[0]);
      if (i !== -1) status[i] = obj[1];
    });
    this.setState({ status: status });
  };
  clearSentMails = () => {
    let { queue, status } = this.state;
    for (let i = 0; i < status.length; ) {
      if (status[i] === 1) {
        if (status.length === 1)
          return this.setState({ queue: [], status: [] });
        queue.splice(i, 1);
        status.splice(i, 1);
      } else i++;
    }
    this.setState({ queue: queue, status: status });
  };
  componentDidMount() {
    const { testInfo, dur } = this.props;
    let durStr;
    if (dur > 60) {
      durStr = Math.trunc(dur / 60);
      durStr += durStr > 1 ? " hrs" : " hr";
      const mod = dur % 60;
      if (mod) {
        durStr += " " + mod;
        durStr += mod > 1 ? " mins" : " min";
      }
    } else durStr = dur + " mins";
    this.setState({
      mailSub: `${testInfo.type === 1 ? "Test" : "Event"} Invitation || ${
        testInfo.org
      } || ${testInfo.title}`,
      durStr: durStr,
    });
    // CHANGE
    this.socket = io("/");
    this.socket.on("mailStatus", (data) => {
      this.setStatus(data);
    });
    this.socket.on("write", (data) => {
      const textArea = this.mailWriter.current;
      textArea.value += `${data.show + data.status[0]}\r\n`;
      this.setStatus(data.status);
    });
    this.socket.on("notify", (data) => {
      const { msgHolder } = this.props;
      if (data.type === "e") notify(msgHolder, "e", data.msg);
      else notify(msgHolder, "s", data.msg);
    });
    this.socket.on("cancelRest", () => {
      let { status } = this.state;
      status.forEach((each, i) => {
        if (each === 0) {
          each = 2;
          status[i] = each;
        }
      });
      this.setState({ status: status });
    });
  }
  render() {
    const {
      queue,
      status,
      durStr,
      mailSub,
      mailImg,
      extra,
      close,
      name,
      desig,
      mobno,
      mail,
      instr,
    } = this.state;
    const {
      mailAcc,
      testInfo,
      passcode,
      strtTime,
      endTime,
      isFixedDur,
      isOpen,
    } = this.props;
    const type = testInfo.type;
    const strtTm = dateTimeFormat(strtTime, -2),
      endTm = dateTimeFormat(endTime, -2);
    return (
      <div id="invDiv">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>SlNo</th>
              <th>From Email</th>
              <th>Sender's Name</th>
              <th>Server</th>
            </tr>
          </thead>
          <tbody>
            {this.renderMailTable(mailAcc)}
            <tr>
              <td colSpan="4"></td>
              <td>
                <a href="https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fmail.google.com&response_type=code&client_id=57505295086-q2oetegjoq46igu7cs0itm6vq0oanptr.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fshredtest.cf%2Finvite%2FsetupMailer">
                  Add New Gmail
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <button
            type="button"
            className="btnPrimary"
            onClick={this.getAllSentMail}
          >
            View Outbox
          </button>
          {queue.length ? (
            <button
              type="button"
              className="btnPrimary"
              onClick={() => this.setState({ queue: [], status: [] })}
            >
              Clear List
            </button>
          ) : null}
        </div>
        <div id="invite">
          {queue.length ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>SlNo.</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Send</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((each, i) => {
                    const statusE = status[i];
                    return (
                      <tr key={i}>
                        <td>{i + 1}.</td>
                        <td>{each}</td>
                        {statusE === -1 ? (
                          <td>-</td>
                        ) : statusE === 0 ? (
                          <td>
                            <i
                              className="fa fa-spinner showGreen"
                              aria-hidden="true"
                            ></i>
                          </td>
                        ) : statusE === 1 ? (
                          <td className="showGreen">&#10004;</td>
                        ) : (
                          <td className="showRed">
                            &#10008; - {this.mailErr(statusE)}
                          </td>
                        )}
                        <td>
                          <i
                            className="fa fa-envelope"
                            aria-hidden="true"
                            onClick={() => this.intiateMail(i)}
                          ></i>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div>
                <button
                  type="button"
                  className="btnPrimary"
                  onClick={this.clearSentMails}
                >
                  Clear Sent
                </button>
                <button
                  type="button"
                  className="btnPrimary"
                  onClick={() => this.intiateMail(-1)}
                >
                  Send All
                </button>
              </div>
            </>
          ) : null}
          <h4>
            Add Emails<p></p>
          </h4>
          <textarea
            rows="10"
            ref={this.mailWriter}
            placeholder="each seperated by a comma"
          ></textarea>
          <button
            type="button"
            className="btnPrimary"
            style={{ float: "right" }}
            onClick={this.createQueue}
          >
            {queue.length ? "Add to Queue" : "Create Queue"}
          </button>
          <div ref={this.mailHTML}>
            <table width="600" style={{ fontSize: "16px" }}>
              <thead style={{ textAlign: "center" }}>
                <tr>
                  <th
                    style={{
                      display: "inline-flex",
                      textAlign: "left",
                      marginBottom: "3vh",
                      borderBottom: "2px solid gainsboro",
                    }}
                  >
                    <img
                      src={testInfo.img}
                      alt="rf-Dyu-N12-Ap"
                      border="0"
                      style={{ height: "5vh", width: "5vh" }}
                    ></img>
                    <h2
                      style={{
                        margin: 0,
                        marginLeft: "5px",
                      }}
                    >
                      {testInfo.org}
                    </h2>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ paddingBottom: "2vh" }}>
                    Hi, ((=CandidateEmail=))<br></br>Hope this mail finds you
                    well !!
                  </td>
                </tr>
                <tr>
                  <td>
                    You are invited to{" "}
                    {type === 1 ? "take Test" : "participate in the Event"}.
                  </td>
                </tr>
                {mailImg ? (
                  <tr>
                    <td align="center" colSpan="2">
                      <img
                        style={{ maxHeight: "40vh" }}
                        src={mailImg}
                        alt="unreachableImg"
                        border="0"
                      ></img>
                    </td>
                  </tr>
                ) : null}
                <tr
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(220, 220, 220, 0.4)",
                  }}
                >
                  <td align="center" style={{ padding: "6vh 0" }}>
                    <table
                      style={{
                        borderCollapse: "collapse",
                        fontSize: "17px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            colSpan="2"
                            style={{
                              color: "#0074d9",
                            }}
                          >
                            {type === 1 ? "Test" : "Event"} Information
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Title</td>
                          <td style={{ letterSpacing: "1px" }}>
                            <b>{testInfo.title}</b>
                          </td>
                        </tr>
                        <tr>
                          <td>Passcode</td>
                          <td style={{ letterSpacing: "2px" }}>
                            <b>{passcode}</b>
                          </td>
                        </tr>
                        <tr>
                          <td>Starts At</td>
                          <td>{strtTm}</td>
                        </tr>
                        <tr>
                          <td>{isFixedDur ? "Entry Closes" : "Ends"} At</td>
                          <td>{endTm}</td>
                        </tr>
                        <tr>
                          <td>{isFixedDur ? "your " : ""}Duration</td>
                          <td style={{ textAlign: "center" }}>{durStr}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      textAlign: "center",
                      backgroundColor: "rgb(255, 199, 228)",
                      padding: "2vh 5px",
                    }}
                  >
                    This {type === 1 ? "Test" : "Event"} is of{" "}
                    {isFixedDur
                      ? "Fixed Duration, your countdown will start as soon as you join and will end after the stated duration no matter you were active for that Time or not."
                      : `fixed time-frame and it will end on ${endTm.slice(
                          0,
                          10
                        )} at ${endTm.slice(12)} no matter when you join.`}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      margin: "2vh 0",
                      padding: "4vh 10px",
                      textAlign: "center",
                      backgroundColor: "rgb(143, 238, 255)",
                    }}
                  >
                    Please click on the below{" "}
                    {type === 1 ? "Take Test" : "Participate"} button at{" "}
                    {strtTm.slice(-8)} to start.<br></br>
                    <br></br>
                    <a
                      id="linkBtn"
                      href="((=CandidateLink=))"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {type === 1 ? "Take Test" : "Participate"}
                    </a>
                    <br></br>
                    <br></br>If the button doesn't work click on the below link
                    ( you can even copy paste this link in browser's URL )
                    <br></br>
                    <a
                      href="((=CandidateLink=))"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ((=CandidateLink=))
                    </a>
                    <br></br>
                    <br></br>
                    {isOpen
                      ? `or else you manually login to the ${
                          type === 1 ? "Test" : "Event"
                        } using the
										${type === 1 ? "Test" : "Event"} Passcode`
                      : null}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      textAlign: "center",
                      backgroundColor: "rgb(255, 199, 228)",
                      borderTop: "3vh solid white",
                      borderBottom: "3vh solid white",
                      padding: "2vh 5px",
                    }}
                  >
                    Please note this is a Private Link. In case of duplicate
                    login attempts your Participation may get cancelled.
                    <br></br>So never share this Link.
                  </td>
                </tr>
                {extra ? (
                  <tr>
                    <td
                      style={{
                        backgroundColor: "rgb(255, 199, 228)",
                        borderTop: "3vh solid white",
                        borderBottom: "3vh solid white",
                        padding: "2vh 5px",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: extra,
                      }}
                    ></td>
                  </tr>
                ) : null}
                {instr ? (
                  <tr style={{ backgroundColor: "rgb(255, 199, 228)" }}>
                    <td style={{ padding: "2vh 10px" }}>
                      <p>
                        <b>Instructions</b>
                      </p>
                      <ul>
                        <li>
                          It is highly recommended that you only use your PC to
                          Participate. Small Screen Devices such as
                          Smartphones,Tablets has been enabled only for
                          extremely rare conditions.
                        </li>
                        <li>
                          Your organization may/may not accept your
                          participation from small-screen devices.
                        </li>
                        <li>Maintain a stable Internet Connection.</li>
                        <li>
                          You may clear your browsing data before Start of the{" "}
                          {type === 1 ? "Test" : "Event"}.<br></br>Never perform
                          any action with your Browser or its Settings during
                          the {type === 1 ? "Test" : "Event"}, you will loose
                          your responses by doing so.
                        </li>
                        <li>
                          Once you login it is a must that you pursue it in one
                          Go for the complete duration and not change your
                          device else you may be marked suspicious and your
                          responses might be kept on hold.
                        </li>
                        <li>
                          Changing browser / Changing System or any such
                          violations will not only mark you as suspicious
                          candidate but also clear your new responses.
                        </li>
                        <li>
                          Your organization may impose negative marking for
                          Violations of the Examination Environment.
                        </li>
                      </ul>
                    </td>
                  </tr>
                ) : null}
                <tr style={{ color: "rgb(134, 36, 0)" }}>
                  <td
                    style={{ paddingTop: "3vh" }}
                    dangerouslySetInnerHTML={{
                      __html: close,
                    }}
                  ></td>
                </tr>
                <tr>
                  <td>
                    <br></br>
                  </td>
                </tr>
                <tr>
                  <td>For any issues / queries, please write to us on</td>
                </tr>
                <tr>
                  <td
                    style={{ textDecoration: "underline blue" }}
                    dangerouslySetInnerHTML={{
                      __html: name,
                    }}
                  ></td>
                </tr>
                <tr>
                  <td
                    style={{ color: "rgb(54, 54, 54)" }}
                    dangerouslySetInnerHTML={{
                      __html: desig,
                    }}
                  ></td>
                </tr>
                <tr>
                  <td className="contactLink">
                    <a
                      href={`https://api.whatsapp.com/send?phone=${mobno}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://i.ibb.co/QFTf5KH/whatsapp.png"
                        alt="whatsapp"
                        border="0"
                        width="20"
                        height="20"
                      ></img>
                      &nbsp;
                      <span>{mobno}</span>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="contactLink">
                    <a
                      href={`mailto:${mail}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://i.ibb.co/xXT5vh1/mail.png"
                        alt="gmail"
                        border="0"
                        width="21"
                        height="21"
                      ></img>
                      &nbsp;
                      <span>{mail}</span>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderTop: "3vh solid white",
                      backgroundColor: "gainsboro",
                      textAlign: "center",
                      padding: "2vh 5px",
                    }}
                  >
                    I want to stop receiving any mails from this mail Address
                    <br></br> and I want to{" "}
                    <a
                      href=" ((=UnsubLink=))"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      unsubscribe
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div id="mailCreator">
          <div>
            <label htmlFor="mailSub">Mail Subject</label>
            <input
              type="text"
              id="mailSub"
              value={mailSub}
              onChange={(e) => {
                this.setState({ mailSub: e.target.value });
              }}
            ></input>
            <br></br>
            <br></br>
            <label htmlFor="imhurl">Poster/Image URL</label>
            <input
              type="text"
              id="imguri"
              value={mailImg}
              onChange={(e) => {
                this.setState({ mailImg: e.target.value });
              }}
            ></input>
            <br></br>
            <br></br>
            <label htmlFor="sdNote">Side Note</label>
            <textarea
              id="sdNote"
              rows="2"
              value={extra}
              onChange={(e) => {
                this.setState({ extra: e.target.value });
              }}
            ></textarea>
            <br></br>
            <br></br>
            <label htmlFor="closing">Closing Line</label>
            <textarea
              id="closing"
              rows="2"
              value={close}
              onChange={(e) => {
                this.setState({ close: e.target.value });
              }}
            ></textarea>
            <br></br>
            <br></br>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                this.setState({ name: e.target.value });
              }}
            ></input>
            <br></br>
            <br></br>
            <label htmlFor="desg">Designation</label>
            <input
              type="text"
              id="desg"
              value={desig}
              onChange={(e) => {
                this.setState({ desig: e.target.value });
              }}
            ></input>
            <br></br>
            <br></br>
            <label htmlFor="mobno">Contact No.</label>
            <input
              type="number"
              id="mobno"
              value={mobno}
              onChange={(e) => {
                this.setState({ mobno: e.target.value });
              }}
            ></input>
            <br></br>
            <br></br>
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              value={mail}
              onChange={(e) => {
                this.setState({ mail: e.target.value });
              }}
            ></input>
            <br></br>
            <br></br>
            <div>
              <input
                type="checkbox"
                id="inst"
                style={{ width: "unset" }}
                defaultChecked={instr ? true : false}
                onChange={(e) => {
                  if (e.target.checked) this.setState({ instr: true });
                  else this.setState({ instr: false });
                }}
              ></input>
              <label htmlFor="inst"> Include Instructions</label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Invite;
