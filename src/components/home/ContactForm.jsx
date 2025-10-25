import React from 'react';

const ContactForm = ({ onSubmit, process }) => {
  return (
    <section className="types" id="contact">
      <h2>Contact Us</h2>
      <form method="post" id="contactForm" onSubmit={onSubmit}>
        <label htmlFor="name">Full Name -:</label>
        <input
          name="name"
          id="name"
          placeholder="Your Full Name"
          maxLength="50"
        />
        <p></p>
        <label htmlFor="mail">Email-Id -:</label>
        <input
          type="email"
          name="mailId"
          id="mail"
          placeholder="Updates will be sent here"
          defaultValue=""
          maxLength="100"
        />
        <p></p>
        <label htmlFor="mobno">Mobile Number</label>
        <input
          type="text"
          name="mobNo"
          id="mobno"
          placeholder="Enter 10-digit Mobile Number"
          minLength="10"
          maxLength="10"
        />
        <p></p>
        <label htmlFor="msg">Any initial Message ?</label>
        <textarea
          name="msg"
          id="msg"
          rows="9"
          placeholder="Type it Here"
          autoComplete="off"
          maxLength="500"
        />
        <div>
          <button className="btnPrimary" type="submit" disabled={process}>
            Submit
            {process && <i className="fa fa-spinner" aria-hidden="true"></i>}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ContactForm;
