import React, { Component } from 'react';
import Navbar from './navbar';
class ReqExamCode extends Component {
  constructor() {
    super();
    this.state = {
      error: '',
      process: false,
    };
    this.inputCodeRef = React.createRef();
    this.initiateFetchTest = React.createRef();
  }
  static getDerivedStateFromProps(props) {
    if (props.reqErr) {
      props.setMainCompState({ reqErr: '' });
      return { error: props.reqErr, process: false };
    } else return {};
  }
  componentDidMount() {
    this.props.fascilateForm(this.inputCodeRef.current);
    //
    if (this.props.passcode) {
      this.initiateFetchTest.current.click();
      this.inputCodeRef.current.focus();
    }
    document.title = 'Shred Test';
  }
  render() {
    const { error, process } = this.state;
    const { userInfo, passcode, fetchTest } = this.props;
    return (
      <>
        <Navbar logOut={this.props.logOut} />
        <div className="beforeStart" id="reqCode">
          <div className="welcome">
            <h1>Hi {userInfo.name ? userInfo.name : 'Candidate'}</h1>
            <h1>Welcome to Online Examination Portal</h1>
            <p>
              Please enter the passcode to proceed to the Start Page. <br></br>
              In case you don't have, please contact concerned HR / your Test
              Incharge.
            </p>
          </div>
          <form
            action=""
            method="post"
            id="reqCodeForm"
            onSubmit={(event) => {
              event.preventDefault();
              this.setState({ process: true });
              fetchTest(this.inputCodeRef.current.value);
            }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="passcode">
                Enter 10-digit Passcode
              </label>
              <input
                ref={this.inputCodeRef}
                className="form-input"
                style={{ width: 'min-content' }}
                type="text"
                id="passcode"
                name="passcode"
                minLength="10"
                maxLength="10"
                autoComplete="off"
                defaultValue={passcode ? passcode : ''}
                required
              ></input>
            </div>
            <button
              className="go"
              type="submit"
              ref={this.initiateFetchTest}
              disabled={process ? true : false}
            >
              Proceed
              {process ? (
                <i className="fa fa-spinner" aria-hidden="true"></i>
              ) : null}
            </button>
          </form>
          {error ? (
            <div id="reqError">
              <i className="fa fa-frown-o" aria-hidden="true"></i>
              <p
                dangerouslySetInnerHTML={{
                  __html: error,
                }}
              ></p>
            </div>
          ) : null}
        </div>
      </>
    );
  }
}
export default ReqExamCode;
