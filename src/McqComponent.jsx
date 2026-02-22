import React, { PureComponent } from 'react';

class McqComponent extends PureComponent {
  constructor() {
    super();
    this.form = React.createRef();
  }
  clearResponse = async () => {
    const done = await this.props.recRes('nAnsQ', null);
    if (done) {
      const form = this.form.current;
      form.reset();
    }
  };
  sendRes = (status) => {
    const form = this.form.current;
    const val = form.querySelector('input[name="option"]:checked');
    let response = null;
    if (val) response = parseInt(val.value);
    this.props.recRes(status, response);
    return;
  };
  markResponse() {
    const form = this.form.current;
    form.reset();
    if (this.props.response !== null) {
      form.querySelector(`input[value="${this.props.response}"]`).checked =
        true;
    }
  }
  componentDidUpdate() {
    this.markResponse();
  }
  componentDidMount() {
    this.markResponse();
  }
  render() {
    const { crntQIndex, ques, status, jumpToQ } = this.props;
    let qText =
      `<strong>Q${crntQIndex + 1}.</strong> ` +
      ques[1] +
      `<span>(${ques[4]} Marks)</span>`;
    return (
      <>
        <div id="container">
          <div id="mcqContainer">
            <button
              type="button"
              id="mark"
              style={
                status === 'revQ' || status === 'ansRevQ'
                  ? { transform: 'none' }
                  : null
              }
              onClick={() => this.sendRes('revQ')}
            >
              <i className="fa fa-thumb-tack" aria-hidden="true"></i>
            </button>
            <h1
              dangerouslySetInnerHTML={{
                __html: qText,
              }}
            ></h1>
            <pre>
              <p
                dangerouslySetInnerHTML={{
                  __html: ques[2],
                }}
              ></p>
            </pre>
            <div id="mcqOptCont">
              <form
                ref={this.form}
                // onChange={}
              >
                {ques[3].map((each, index) => {
                  const value = parseInt(Object.keys(each)[0]) + 1;
                  const label = Object.values(each)[0];
                  return (
                    <label key={index + 1}>
                      <input
                        type="radio"
                        name="option"
                        value={value}
                        onClick={() => this.sendRes('ansQ')}
                      />
                      {label}
                    </label>
                  );
                })}
              </form>
            </div>
          </div>
          <div id="qControls">
            <div>
              <button
                type="button"
                className="btnSecondary"
                onClick={this.clearResponse}
              >
                Clear Response
              </button>
            </div>
            <div>
              <button
                type="button"
                className="btnPrimary"
                onClick={() => jumpToQ(crntQIndex - 1)}
                style={
                  crntQIndex > 0
                    ? { visibility: 'visible' }
                    : { visibility: 'hidden' }
                }
              >
                Previous
              </button>
              <button
                type="button"
                className="btnPrimary"
                onClick={() => jumpToQ(crntQIndex + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default McqComponent;
