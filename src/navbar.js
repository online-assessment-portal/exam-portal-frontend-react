import { PureComponent } from "react";
import logo from "./favicon-32x32.png";
import "./navbar.css";
//
class Navbar extends PureComponent {
	render() {
		const { img, org, logOut } = this.props;
		return (
			<nav>
				<div>
					<img id="brand-logo" src={img ? img : logo} alt="logo" srcSet="" />
					<h1 id="brand-text">{org ? org : "Shred Test"}</h1>
				</div>
				{logOut ? (
					<button type="button" onClick={logOut}>
						Logout
					</button>
				) : null}
			</nav>
		);
	}
}
export default Navbar;
