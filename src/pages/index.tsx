import Header from "@/components/landingPage/Header";
import PricingSection from "@/components/landingPage/PricingSection";
import FAQSection from "@/components/landingPage/FAQSection";
import ContactSection from "@/components/landingPage/ContactSection";
import Footer from "@/components/landingPage/Footer";
import PartnerLogosSection from "@/components/landingPage/PartnerLogosSection";
import DashboardOverview from "@/components/landingPage/DashboardOverview";
import FeaturesSection from "@/components/landingPage/FeaturesSection";
import CTASection from "@/components/landingPage/CTASection";

const Home = () => {
  return (
    <div>
      <Header/>
      <CTASection />

      <FeaturesSection />

      <DashboardOverview />

      <PricingSection />

      <PartnerLogosSection />

      <FAQSection />

      <ContactSection />
      
      <Footer />
    </div>
  );
};

export default Home;
