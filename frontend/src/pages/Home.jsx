import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import KnowledgeSection from "../components/KnowledgeSection";

const Home = ({ onLoginClick, isLoggedIn }) => {
  return (
    <>
      <HeroSection onLoginClick={onLoginClick} isLoggedIn={isLoggedIn} />
      <KnowledgeSection />
      <FeaturesSection onLoginClick={onLoginClick} isLoggedIn={isLoggedIn} />
      <CTASection onLoginClick={onLoginClick} isLoggedIn={isLoggedIn} />
      <Footer />
    </>
  );
};

export default Home;



