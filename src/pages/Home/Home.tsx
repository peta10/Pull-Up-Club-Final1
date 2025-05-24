import React from "react";
import Layout from "../../components/Layout/Layout";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import PerksSection from "./PerksSection";
import LeaderboardPreview from "./LeaderboardPreview";
import TestimonialSection from "./TestimonialSection";
import CTASection from "./CTASection";

const Home: React.FC = () => {
  return (
    <Layout>
      <Hero />
      <HowItWorks />
      <PerksSection />
      <LeaderboardPreview />
      <TestimonialSection />
      <CTASection />
    </Layout>
  );
};

export default Home;
