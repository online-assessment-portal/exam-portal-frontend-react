import { useState } from 'react';
import { SYSTEM_MESSAGES } from '../../constants/messages';
import { notifications } from '../../lib';
import { sendContactRequest } from '../../services/guest.service';
import Button from '../ui/Button';

const SUCCESS_MESSAGE =
  "Message sent successfully! We'll get back to you soon.";

const ContactForm = () => {
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.target);
    const contactData = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      const { success, message } = await sendContactRequest(contactData);

      if (success) {
        event.target.reset();
        notifications.success(SUCCESS_MESSAGE);
      } else {
        notifications.errorCustom(message || SYSTEM_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (error) {
      notifications.errorCustom(
        error?.message || SYSTEM_MESSAGES.UNKNOWN_ERROR
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="types" id="contact">
      <h2>Contact Us</h2>
      <form method="post" id="contactForm" onSubmit={handleFormSubmit}>
        <label htmlFor="name">Full Name:</label>
        <input
          name="name"
          id="name"
          type="text"
          placeholder="Your Full Name"
          maxLength="50"
          required
        />

        <label htmlFor="mail">Email:</label>
        <input
          type="email"
          name="email"
          id="mail"
          placeholder="your.email@example.com"
          maxLength="100"
          required
        />

        <label htmlFor="subject">Subject:</label>
        <input
          type="text"
          name="subject"
          id="subject"
          placeholder="What is this about?"
          maxLength="100"
          required
        />

        <label htmlFor="msg">Message:</label>
        <textarea
          name="message"
          id="msg"
          rows="6"
          placeholder="Tell us more about your inquiry..."
          maxLength="500"
          required
        />

        <div>
          <Button
            type="submit"
            isLoading={loading}
            loadingText="Sending..."
            disabled={loading}
          >
            Send Message
          </Button>
        </div>
      </form>
    </section>
  );
};

export default ContactForm;
