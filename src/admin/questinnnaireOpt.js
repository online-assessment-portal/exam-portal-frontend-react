import React, { Component } from "react";
class Questionnaire extends Component {
  constructor() {
    super();
    this.qsnrOpt = React.createRef();
  }
  selectType = () => {
    const crntType = this.props.crntType;
    this.qsnrOpt.current.querySelector(`option[value="${crntType}"]`);
  };
  componentDidUpdate() {
    this.selectType();
  }
  componentDidMount() {
    this.selectType();
  }
  render() {
    const { chngQsnr, crntIndex, qsnr } = this.props;
    return (
      <>
        <tr>
          <td>
            <select
              ref={this.qsnrOpt}
              onChange={(e) => chngQsnr(0, e, crntIndex)}
              defaultValue={qsnr[0]}
            >
              <option value="0">text</option>
              <option value="1">email</option>
              <option value="2">number</option>
              <option value="3">radio</option>
              <option value="4">checkbox</option>
              <option value="5">select</option>
              <option value="6">date</option>
              <option value="7">datetime</option>
            </select>
          </td>
          <td>
            <input
              type="text"
              name={`qsnrLbl${crntIndex}`}
              defaultValue={qsnr[2]}
              required
            ></input>
          </td>
          <td>
            {qsnr[3] ? (
              qsnr[3].map((each, index) => {
                return (
                  <div key={index}>
                    <p>{index + 1}.</p>
                    <input
                      type="text"
                      name={`qsnrOpt_${crntIndex}_${index}`}
                      defaultValue={each}
                      required
                    ></input>
                    {index > 0 ? (
                      <i
                        className="fa fa-trash-o"
                        aria-hidden="true"
                        onClick={() =>
                          chngQsnr("alterOpt", 1, crntIndex, index)
                        }
                      ></i>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <span>-</span>
            )}
            {qsnr[3] ? (
              <button
                type="button"
                onClick={() => chngQsnr("alterOpt", 0, crntIndex)}
              >
                +1
              </button>
            ) : null}
          </td>
          <td className="adminCheckbox">
            <input
              type="checkbox"
              name={`qsnrReq_${crntIndex}`}
              defaultChecked={qsnr[1] ? true : false}
            ></input>
          </td>
          <td className="adminCheckbox">
            <i
              className="fa fa-trash-o"
              aria-hidden="true"
              onClick={() => chngQsnr("alterQsnr", 1, crntIndex)}
            ></i>
          </td>
        </tr>
      </>
    );
  }
}
export default Questionnaire;
