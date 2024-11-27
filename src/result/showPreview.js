import React, { Component } from 'react';
class Preview extends Component {
  constructor() {
    super();
    this.monthList = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
  }
  componentDidMount() {
    document.title = 'My Attempts';
  }
  showEachMonth = (data) => {
    const { fetchData } = this.props;
    const content = [];
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        const each = data[key];
        content.push(
          <div className="eachTest" key={key} onClick={() => fetchData(key)}>
            <p>
              <span>Title -: </span> {each.title}
            </p>
            <p>
              <span>Pass_Code -: </span> {key}
            </p>
            <p>
              <span>Conducted On -: </span> {each.date}
            </p>
          </div>
        );
      }
    }
    return content;
  };
  render() {
    const { previewData } = this.props;
    const keysM = Object.keys(previewData);
    return (
      <>
        <main id="showPreview">
          {keysM.map((each, i) => {
            const splitStr = each.split('_');
            const month = this.monthList[parseInt(splitStr[0]) - 1];
            const year = '20' + splitStr[1];
            return (
              <div key={i}>
                <h4>{month + ', ' + year}</h4>
                <div className="eachMonth">
                  {this.showEachMonth(previewData[each])}
                </div>
              </div>
            );
          })}
        </main>
      </>
    );
  }
}
export default Preview;
