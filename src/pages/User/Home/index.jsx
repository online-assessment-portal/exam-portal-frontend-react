import { useEffect } from 'react';
import {
  ContactForm,
  FeaturesSection,
  Footer,
  HeroSection,
  Navigation,
  PricingSection,
  WhyUsSection,
} from '../../../components/home';
import { useAuth } from '../../../hooks';
import { storeError } from '../../../lib';
import '../../../styles/components/allBtns.css';
import '../../../styles/components/navbar.css';
import '../../../styles/pages/home.css';

const Home = () => {
  const { userInfo } = useAuth();

  useEffect(() => {
    const handleError = (err) => {
      storeError(err, userInfo?.token);
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [userInfo?.token]);

  return (
    <main id="home">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <WhyUsSection />
      <PricingSection />
      <ContactForm />
      <Footer />
    </main>
  );
};
export default Home;
