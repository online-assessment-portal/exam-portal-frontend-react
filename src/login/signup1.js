import React, { PureComponent } from "react";
import { notify } from "./../common.js";
//
class SignUp1 extends PureComponent {
	constructor() {
		super();
		this.state = {
			process: false,
			otpSent: false,
			email: "",
			errMsg: "",
		};
		this.resendOTP = false;
		this.vfFailCtr = 0;
		this.mailCtr = 0;
		this.email = React.createRef();
		this.otp = React.createRef();
		//
		this.reqCtrM = 0;
		this.reqCtrV = 0;
	}
	signUpForm = async (event = false) => {
		if (event) event.preventDefault();
		const { msgHolder } = this.props;
		if (
			(this.resendOTP && this.reqCtrM > 5) ||
			(!this.resendOTP && this.reqCtrV > 5)
		) {
			notify(
				msgHolder,
				"e",
				"Reached maximum attempts allowed.<br>Please retry after 15 mins."
			);
			return false;
		}
		this.setState({ process: true });
		const { otpSent } = this.state;
		const email = this.email.current.value;
		//
		let otp;
		if (otpSent) {
			otp = parseInt(this.otp.current.value);
			if (isNaN(otp) && !this.resendOTP)
				return this.setState({ errMsg: "Invalid OTP Entered", process: false });
		}
		const { isReset, token } = this.props;
		const formData = new FormData();
		if (email) {
			formData.append("email", email);
			if (!this.resendOTP && otp) {
				formData.append("otp", otp);
				this.reqCtrV++;
			} else this.reqCtrM++;
		} else {
			notify(msgHolder, "e", "Enter a valid e-Mail.");
			this.setState({ process: false });
			return false;
		}
		if (isReset) formData.append("isReset", true);
		formData.append("_csrf", token);
		//
		const formBody = new URLSearchParams(formData).toString();
		try {
			const promise = await fetch("/login/otp_auth/", {
				method: "POST",
				body: formBody,
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});
			const response = await promise.json();
			//
			if (promise.status === 200 && promise.ok === true) {
				if (response.sentTo) {
					this.setState({
						otpSent: true,
						email: response.sentTo,
						errMsg: "",
					});
				} else if (response.ovs && response.ovs === "V") {
					if (response.vioVerify)
						notify(
							msgHolder,
							"e",
							"eMail-Id was Changed.<br>Account will be created for the email on which OTP was sent.<br>You can proceed safely."
						);
					const { setMainCompState } = this.props;
					if (isReset) setMainCompState({ action: 5 });
					else setMainCompState({ action: 3 });
				} else notify(msgHolder, "e", "");
			} else if (response.error) {
				let msg = "";
				const recMsg = response.error.message;
				if (recMsg.search("email") >= 0)
					msg =
						"Email must be a valid email.<br>Note that we currently allow only [.com , .in , .edu , .net] email addresses.<br>Contact to add your organization.";
				return this.setState({
					errMsg: msg ? msg : recMsg,
					process: false,
				});
			} else notify(msgHolder, "e", "");
			this.setState({ process: false });
		} catch (error) {
			notify(
				msgHolder,
				"e",
				"SERVER Connection Error<br>Check your Internet Connection"
			);
			this.setState({ process: false });
		} finally {
			this.resendOTP = false;
		}
	};
	componentDidMount() {
		if (this.props.isReset) document.title = "Reset Password";
		else document.title = "Sign-Up";
	}
	render() {
		const { process, otpSent, email, errMsg } = this.state;
		const { isReset, toggleShowHide, setMainCompState, googleLogo } =
			this.props;
		return (
			<>
				<h2>{isReset ? "Reset Password" : "Create your account"}</h2>
				<form method="post" onSubmit={this.signUpForm}>
					<div className="field">
						<i className="floatter fa fa-user" aria-hidden="true"></i>
						<input
							ref={this.email}
							type="text"
							autoComplete="off"
							name="email"
							placeholder="Enter your e-Mail"
							pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
							maxLength="60"
							required
						></input>
					</div>
					<div>
						<button
							className="btnPrimary"
							type={otpSent ? "button" : "submit"}
							onClick={
								otpSent
									? () => {
											this.resendOTP = true;
											this.signUpForm();
									  }
									: null
							}
							disabled={process ? true : false}
						>
							{otpSent ? "Resend" : "Send"} OTP
						</button>
					</div>
					{otpSent ? null : (
						<div className="middleText">
							<p>
								✩ A Verification e-Mail containing 6-digit OTP will be sent on
								this e-Mail address.
							</p>
						</div>
					)}
					{otpSent ? (
						<div className="sucesMsg">
							<p>
								✩ A Verification e-Mail containing 6-digit OTP was Sent to{" "}
								{email}.
							</p>
							<p>
								✩ It may take some time to receive depending on the Mail-Server.
								Please Wait before Retrying.
							</p>
						</div>
					) : null}
					{!process && errMsg ? (
						<div
							className="errMsg"
							dangerouslySetInnerHTML={{
								__html: errMsg,
							}}
						></div>
					) : null}
					{otpSent ? (
						<>
							<div className="field">
								<i className="floatter fa fa-unlock-alt" aria-hidden="true"></i>
								<input
									ref={this.otp}
									type="password"
									autoComplete="off"
									name="sp_otp"
									placeholder="Enter 6-digit OTP"
									minLength="6"
									maxLength="6"
									required
								></input>
								<button type="button" id="eyeBtn">
									<i
										className="fa fa-eye-slash"
										id="eyeIcon"
										aria-hidden="true"
										onClick={toggleShowHide}
									></i>
								</button>
							</div>
							<div>
								<button
									className="btnPrimary"
									type="submit"
									disabled={process ? true : false}
								>
									Verify &amp; Proceed
								</button>
							</div>
						</>
					) : null}
					<h3 className="othOptHead">
						<span>{isReset ? "Often forget Password ?" : "OR"}</span>
					</h3>
					<div id="alternateLogin">
						<button
							type="button"
							className="gLogin"
							disabled={process ? true : false}
							onClick={() => {
								this.setState({ process: true });
								localStorage.setItem("gLogin", window.location.pathname);
								window.location.replace(
									"https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20profile&response_type=code&client_id=1025872685182-o5jdqap12eg6d9t06sh5nqqdnj8she8s.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fshredtest.cf%2Fgsign%2Fgoogle-login"
								);
							}}
						>
							<img src={googleLogo} alt="G" srcSet=""></img>
							<p>{isReset ? "Use Sign-In" : "Sign-Up"} with Google</p>
						</button>
					</div>
					<h3 className="othOptHead">
						<span>
							{isReset ? "Give your memory a Try" : "Already Have an Account ?"}
						</span>
					</h3>
					<div>
						<button
							className="blueLinkBtn"
							type="button"
							disabled={process ? true : false}
							onClick={() => {
								setMainCompState({ action: 1 });
							}}
						>
							&nbsp;&nbsp;Sign In&nbsp;&nbsp;
						</button>
					</div>
				</form>
			</>
		);
	}
}
export default SignUp1;
