import React, { PureComponent } from 'react';
import { notify } from './../common.js';
import { fascilateForm } from './../fascilateForm';

const apiUrl = process.env.REACT_APP_API_URL;
const appEnv = process.env.REACT_APP_APP_ENV;
const isProd = appEnv === 'PROD';

class Profile extends PureComponent {
  constructor() {
    super();
    this.state = { process: 0 };
    this.showImg = React.createRef();
    this.imgLabel = React.createRef();
    this.upldBtn = React.createRef();
  } // Function to change profile image
  readURL = (file) => {
    var reader = new FileReader();
    reader.onload = (e) => {
      this.showImg.current.setAttribute('src', e.target.result);
      this.upldBtn.current.style.display = 'block';
    };
    reader.readAsDataURL(file);
  };
  imgPickHandler = (event) => {
    const target = event.target;
    const { msgHolder } = this.props;
    if (!(target.files && target.files[0])) {
      notify(msgHolder, 'e', 'Image File was not loaded successfully.');
      return false;
    }
    if (target.files[0].size > 1048576) {
      notify(
        msgHolder,
        'e',
        'File size is greater than 1MB.<br>In order to make your profile load faster we have set a limit on size of Image Files.'
      );
      return false;
    }
    let fileName = target.files[0]['name'];
    if (fileName.length > 15)
      fileName =
        fileName.slice(0, 5) + '***' + fileName.slice(fileName.length - 8);
    this.imgLabel.current.innerHTML = fileName;
    this.readURL(target.files[0]);
  };
  imgUploader = async (event) => {
    event.preventDefault();
    this.setState({ process: 1 });
    const { msgHolder, userInfo } = this.props;
    const btn = this.upldBtn.current;
    //
    btn.innerText = 'Uploading.';
    const i1 = setInterval(() => {
      btn.innerText += '.';
    }, 1000);
    const i2 = setInterval(() => {
      btn.innerText = 'Uploading.';
    }, 5000);
    //
    const formData = new FormData(event.target);
    try {
      const promise = await fetch(`${apiUrl}/upload/img`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        headers: { 'csrf-token': userInfo.token },
        body: formData,
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        if (response.url) {
          btn.style.display = 'none';
          notify(msgHolder, 's', 'Upload Success');
          this.showImg.current.setAttribute('src', response.url);
        } else notify(msgHolder, 'e', '');
      } else if (response.error)
        notify(msgHolder, 'e', response.error.message, 10000);
      else notify(msgHolder, 'e', '');
    } catch (error) {
      notify(
        msgHolder,
        'e',
        'an unknown Error was encountered while Uploading your Image.<br>Please check your Internet Connection.'
      );
    } finally {
      clearInterval(i1);
      clearInterval(i2);
      setTimeout(() => {
        btn.innerText = 'Upload';
      }, 1000);
      //
      this.setState({ process: 0 });
    }
  };
  //
  profileUpdate = async (event) => {
    event.preventDefault();
    this.setState({ process: 2 });
    const { isHome } = this.props;
    const formData = new FormData(event.target);
    if (!isHome) formData.append('sendCand', true);
    else formData.append('sendCand', false);
    const { msgHolder, userInfo } = this.props;
    formData.append('_csrf', userInfo.token);
    const formBody = new URLSearchParams(formData).toString();
    try {
      const promise = await fetch(`${apiUrl}/login/updateProfile/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: formBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        if (response.notify) notify(msgHolder, 's', response.notify);
        if (response.userInfo) {
          response.userInfo.token = userInfo.token;
          this.props.setExamCompState({
            userInfo: response.userInfo,
            loggedIn: true,
          });
          return true;
        }
      } else if (response.error)
        notify(msgHolder, 'e', response.error.message, 10000);
      else notify(msgHolder, 'e', '');
      this.setState({ process: 0 });
    } catch (error) {
      notify(
        msgHolder,
        'e',
        'SERVER Connection Error<br>Check your Internet Connection'
      );
      this.setState({ process: 0 });
    }
  };
  logout = async () => {
    this.setState({ process: true });
    const { msgHolder, userInfo } = this.props;
    try {
      const promise = await fetch(`${apiUrl}/logout/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: `_csrf=${userInfo.token}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        if (response.msg) notify(msgHolder, 's', response.msg);
        this.props.setMainCompState({ action: 1 });
      } else if (response.error) notify(msgHolder, 'e', response.error.message);
      else notify(msgHolder, 'e', '');
    } catch (error) {
      notify(
        msgHolder,
        'e',
        'SERVER Connection Error<br>Check your Internet Connection'
      );
    } finally {
      this.setState({ process: false });
    }
  };
  componentDidMount() {
    document.title = 'Candidate Profile';
  }
  render() {
    const { process } = this.state;
    const { userInfo } = this.props;
    if (userInfo.uname === userInfo.email) userInfo.uname = '';
    return (
      <>
        <h2>My Profile</h2>
        <div id="proLogoutCont">
          <button
            type="button"
            className="btnPrimary"
            onClick={this.logout}
            disabled={process ? true : false}
          >
            Log-out
          </button>
        </div>
        <img
          ref={this.showImg}
          id="profileImg"
          src={
            userInfo.img
              ? userInfo.img
              : 'https://i.ibb.co/QpJYCQ7/UL8Ijh0w.png'
          }
          alt="no-preview"
          border="0"
        ></img>
        <form method="post" id="imgUpload" onSubmit={this.imgUploader}>
          <label htmlFor="selectImg" ref={this.imgLabel}>
            Upload New Image<br></br>
            <span>(less than 900kb)</span>
          </label>
          <input
            name="profile_pic"
            id="selectImg"
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={this.imgPickHandler}
          ></input>
          <button
            ref={this.upldBtn}
            className="btnSecondary"
            type="submit"
            disabled={process ? true : false}
          >
            Upload
          </button>
        </form>
        <div style={{ width: '70%' }}>
          <form method="post" id="profileForm" onSubmit={this.profileUpdate}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                ref={(element) => {
                  if (element) {
                    fascilateForm(element);
                    element.focus();
                    element.blur();
                  }
                }}
                className="form-input"
                type="text"
                name="name"
                autoComplete="off"
                minLength="5"
                maxLength="30"
                defaultValue={userInfo.name}
                required
              ></input>
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                ref={(element) => {
                  if (element) {
                    fascilateForm(element);
                    element.focus();
                    element.blur();
                  }
                }}
                className="form-input"
                type="text"
                name="uname"
                autoComplete="off"
                minLength="6"
                maxLength="15"
                defaultValue={userInfo.uname}
                required
              ></input>
            </div>
            <button
              type="submit"
              className="btnPrimary"
              disabled={process ? true : false}
            >
              Update
              {process === 2 ? (
                <i className="fa fa-spinner" aria-hidden="true"></i>
              ) : null}
            </button>
          </form>
        </div>
      </>
    );
  }
}
export default Profile;
