import React, { Component } from "react";
class ResNavigator extends Component {
  render() {
    const {
      sec,
      crntQIndex,
      jumpToQ,
      setMainCompState,
      isScoreCard,
    } = this.props;
    let i,
      tempArr = [];
    return (
      <div id="qNav">
        <button
          className="transpBtn"
          onClick={() => setMainCompState({ action: 0 })}
          style={isScoreCard ? { marginTop: "2vh" } : null}
        >
          Go back
        </button>
        <br></br>
        <button
          className="transpBtn"
          onClick={() => {
            if (isScoreCard) setMainCompState({ action: 1 });
            else setMainCompState({ action: 2 });
          }}
        >
          {isScoreCard ? "Show my Responses" : "Show Scorecard"}
        </button>
        {!isScoreCard
          ? sec.map((eachSec, secIndex) => {
              const secNotation = String.fromCharCode(65 + secIndex);
              if (secIndex === 0) i = 1;
              else i = sec[secIndex - 1][1] + 1;
              tempArr = [];
              for (; i <= eachSec[1]; i++) tempArr.push(i);
              return (
                <div key={secIndex}>
                  <h4>
                    Section - {secNotation} ({eachSec[0]})
                  </h4>
                  <div key={secIndex} id="qBtns">
                    {tempArr.map((each) => {
                      return (
                        <button
                          key={each}
                          className={
                            crntQIndex === each - 1 ? "nVisQ crntQ" : "nVisQ"
                          }
                          type="button"
                          onClick={() => {
                            if (crntQIndex !== each - 1) jumpToQ(each - 1);
                          }}
                        >
                          {each}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          : null}
      </div>
    );
  }
}
export default ResNavigator;
