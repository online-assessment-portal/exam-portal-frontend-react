import React, { Component } from "react";
class Navigator extends Component {
  render() {
    const {
      id1,
      id2,
      crntSec,
      constrained,
      sec,
      crntQIndex,
      status,
      revQ,
      ansQ,
      ansRevQ,
      nVisQ,
      total,
      jumpToQ,
    } = this.props;
    // const secInfo = sec[crntSec];
    return (
      <>
        <div id={id1}>
          {id1 === "qNav" ? (
            <>
              <p>Total Questions - {total}</p>
              <div id="qOverview">
                <p className="revQ">
                  <span>{revQ}</span> Marked for Review
                </p>
                <p className="ansQ">
                  <span>{ansQ}</span> Answered
                </p>
                <p className="ansRevQ">
                  <span>{ansRevQ}</span> Answered{" "}
                  <span style={{ fontSize: "15px" }}>
                    (&amp; marked for Review)
                  </span>
                </p>
                <p className="nAnsQ">
                  <span>{total - ansQ - ansRevQ}</span> Not Answered
                </p>
                <p className="nVisQ">
                  <span>{nVisQ}</span> Not Visited
                </p>
              </div>
              <hr />
              <hr />
            </>
          ) : null}
          {sec.map((eachSec, secIndex) => {
            let btnDis = false;
            if (constrained && secIndex < crntSec) btnDis = true;
            let from = 0;
            if (secIndex > 0) from = sec[secIndex - 1][1];
            let cropStatus = status.slice(from, eachSec[1]);
            //
            const secNotation = String.fromCharCode(65 + secIndex);
            return (
              <div key={secIndex}>
                {id1 === "qNav" ? (
                  <h4>
                    Section - {secNotation} ({eachSec[0]})
                  </h4>
                ) : (
                  <p style={{ textAlign: "center" }}>Sec-{secNotation}</p>
                )}
                <div key={secIndex} id={id2}>
                  {cropStatus.map((each, index) => {
                    index += from;
                    return (
                      <button
                        key={index}
                        className={
                          crntQIndex === index ? each + " crntQ" : each
                        }
                        type="button"
                        disabled={btnDis}
                        onClick={() => {
                          if (crntQIndex !== index) return jumpToQ(index);
                        }}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }
}
export default Navigator;
