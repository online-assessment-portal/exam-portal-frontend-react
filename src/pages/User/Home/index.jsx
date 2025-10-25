import React, { Component } from 'react';
import '../../../styles/pages/home.css';
import '../../../styles/components/navbar.css';
import '../../../styles/components/allBtns.css';
import { notify, storeError } from '../../../lib/common.js';
import {
  Navigation,
  HeroSection,
  FeaturesSection,
  WhyUsSection,
  PricingSection,
  ContactForm,
  Footer,
} from '../../../components/home';

const apiUrl = import.meta.env.VITE_API_URL;
const appEnv = import.meta.env.VITE_APP_ENV;
const isProd = appEnv === 'PROD';

class Home extends Component {
  constructor() {
    super();
    this.state = { process: false };
    this.msgHolder = React.createRef();
  }

  reqLogout = async () => {
    try {
      const promise = await fetch(`${apiUrl}/logout/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: `_csrf=${this.state.token}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        this.setState({ loggedIn: false });
      } else if (response.error)
        notify(this.msgHolder, 'e', response.error.message);
      else notify(this.msgHolder, 'e', '');
    } catch (error) {
      storeError(error, this.state.token);
      notify(
        this.msgHolder,
        'e',
        'Something went wrong.<br>OR<br>Unable to connect to Server.'
      );
    }
  };
  submitContact = async (event) => {
    event.preventDefault();
    this.setState({ process: true });
    //
    const formData = new FormData(event.target);
    const token = this.state.token;
    formData.append('_csrf', token);
    try {
      const promise = await fetch(`${apiUrl}/proctor/contact/`, {
        method: 'POST',
        credentials: isProd ? 'same-origin' : 'include',
        body: new URLSearchParams(formData).toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const response = await promise.json();
      if (promise.status === 200 && promise.ok === true) {
        event.target.reset();
        notify(
          this.msgHolder,
          's',
          'Received<br>One from our Team will get back to you ASAP.'
        );
      } else if (response.error)
        notify(this.msgHolder, 'e', response.error.message);
      else {
        this.setState({
          reqErr: 'Something went wrong: Unable to Process your Request',
        });
        notify(this.msgHolder, 'e', '', 10000);
      }
    } catch (error) {
      notify(
        this.msgHolder,
        'e',
        'SERVER Connection Error<br>Check your Internet Connection'
      );
    } finally {
      this.setState({ process: false });
    }
  };
  componentDidMount() {
    const pgData = JSON.parse(document.getElementById('userInfo').innerText);
    const myState = { token: pgData.token };
    if (pgData.loggedIn) myState.loggedIn = true;
    this.setState(myState);
    window.addEventListener('load', () => {
      document.getElementsByTagName('main')[0].style.display = 'block';
    });
    window.addEventListener('error', (err) => {
      storeError(err, pgData.token);
    });
  }
  render() {
    const { loggedIn, process } = this.state;
    return (
      <main id="home">
        <div id="msgHolder" ref={this.msgHolder}></div>
        <Navigation
          loggedIn={loggedIn}
          onLogout={this.reqLogout}
          process={process}
        />
        <HeroSection />
        <FeaturesSection />
        <WhyUsSection />
        <PricingSection />
        <ContactForm onSubmit={this.submitContact} process={process} />
        <Footer />
      </main>
    );
  }
}
export default Home;
