import React, { Component } from 'react';
import { notify } from './common';

const apiUrl = process.env.REACT_APP_API_URL;

class HeadAuth extends Component {
  constructor() {
    super();
    this.state = { token: '' };
    this.msgHolder = React.createRef();
  }
  addAdmin = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      formData.append('_csrf', this.state.token);
      const formBody = new URLSearchParams(formData).toString();
      const promise = await fetch(`${apiUrl}/helloHead/addAdmin/`, {
        method: 'POST',
        body: formBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        notify(this.msgHolder, 's', response.msg);
        event.target.reset();
      } else if (response.error)
        notify(this.msgHolder, 'e', response.error.message);
      else notify(this.msgHolder, 'e', '');
    } catch (error) {
      notify(
        this.msgHolder,
        'e',
        'Something went wrong.<br>OR<br>Unable to connect to Server.'
      );
    }
  };
  componentDidMount() {
    const userInfo = JSON.parse(document.getElementById('userInfo').innerText);
    this.setState({ token: userInfo.token });
  }
  render() {
    return (
      <>
        <div id="msgHolder" ref={this.msgHolder}></div>
        <h3>Add Exam Admins</h3>
        <form method="post" onSubmit={this.addAdmin}>
          <table>
            <tbody>
              <tr>
                <td>
                  <label htmlFor="a">Username </label>
                </td>
                <td>
                  <input id="a" type="text" name="uname"></input>
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="b">Email </label>
                </td>
                <td>
                  <input id="b" type="email" name="email"></input>
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="c">Organzation Name </label>
                </td>
                <td>
                  <input id="c" type="text" name="org"></input>
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="d">Org. Image URL </label>
                </td>
                <td>
                  <input id="d" type="text" name="img"></input>
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="e">ImgBB Key </label>
                </td>
                <td>
                  <input id="e" type="text" name="imgUpKey"></input>
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="f">Password </label>
                </td>
                <td>
                  <input id="f" type="text" name="password"></input>
                </td>
              </tr>
              <tr>
                <td>
                  <br></br>
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <button type="submit" className="btnPrimary">
                    Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </>
    );
  }
}
export default HeadAuth;
