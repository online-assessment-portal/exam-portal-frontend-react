import React, { PureComponent } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
//
import logo from "./../favicon-32x32.png";
import googleLogo from "./../google-logo.png";
import "./loginComp.css";
//
import SignIn from "./signin";
import SignUp1 from "./signup1";
import SignUp2 from "./signup2";
import Profile from "./profile";
import { storeError, notify } from "../common";
//
// import LoginCont from "./loginCont";
class LoginComp extends PureComponent {
	constructor() {
		super();
		// action 1-signIn 2-signUp-OTP 3-signUp-Password 4-reset pswd OTP 5-reset Pswd Password 6-PROFILE
		this.state = { action: 1, userInfo: {} };
		this.msgHolder = React.createRef();
	}
	toggleShowHide = (event) => {
		const button = event.target;
		const target = button.parentElement.previousElementSibling;
		if (target.type === "password") {
			target.type = "text";
			button.className = "fa fa-eye";
		} else {
			target.type = "password";
			button.className = "fa fa-eye-slash";
		}
	};
	setMainCompState = (obj) => {
		this.setState(obj);
	};
	componentDidMount() {
		let userInfo = this.props.userInfo;
		if (!userInfo)
			userInfo = JSON.parse(document.getElementById("userInfo").innerText);
		const obj = { userInfo: userInfo };
		// Direct SignUp Notification
		if (userInfo.ds) {
			notify(
				this.msgHolder,
				"s",
				"<h3>Candidate Verified</h3>Manual Verification Skipped.<br>you just need to fill these 2 fields.",
				10000
			);
			obj.action = 6;
		} else if (userInfo.loggedIn) obj.action = 6;
		//
		if (this.props.isHome)
			window.addEventListener("error", (err) => {
				storeError(err, userInfo.token);
			});
		this.setState(obj);
	}
	render() {
		const { action, userInfo } = this.state;
		const { isHome } = this.props;
		return (
			<main id="loginComp">
				<div id="msgHolder" ref={this.msgHolder}></div>
				<CSSTransition in={true} appear={true} timeout={250} classNames="fade">
					<div id="loginCont">
						<a href="/" id="branding">
							<img src={logo} alt="logo" srcSet="" />
							<h1>Shred Test</h1>
						</a>
						<TransitionGroup>
							<CSSTransition key={action} timeout={300} classNames="fade">
								<div id="containerLSR">
									<div id="subContLSR">
										{action === 1 ? (
											<SignIn
												toggleShowHide={this.toggleShowHide}
												setMainCompState={this.setMainCompState}
												setExamCompState={this.props.setExamCompState}
												msgHolder={this.msgHolder}
												isHome={isHome}
												googleLogo={googleLogo}
												token={userInfo.token}
											/>
										) : action === 2 || action === 4 ? (
											<SignUp1
												isReset={action === 4 ? true : false}
												toggleShowHide={this.toggleShowHide}
												setMainCompState={this.setMainCompState}
												msgHolder={this.msgHolder}
												googleLogo={googleLogo}
												token={userInfo.token}
											/>
										) : action === 3 || action === 5 ? (
											<SignUp2
												isReset={action === 5 ? true : false}
												toggleShowHide={this.toggleShowHide}
												setMainCompState={this.setMainCompState}
												setExamCompState={this.props.setExamCompState}
												msgHolder={this.msgHolder}
												isHome={isHome}
												token={userInfo.token}
											/>
										) : action === 6 ? (
											<Profile
												setMainCompState={this.setMainCompState}
												setExamCompState={this.props.setExamCompState}
												msgHolder={this.msgHolder}
												userInfo={userInfo}
												isHome={isHome}
											/>
										) : null}
									</div>
								</div>
							</CSSTransition>
						</TransitionGroup>
					</div>
				</CSSTransition>
			</main>
		);
	}
}
export default LoginComp;
