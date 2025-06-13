import React from "react";
import Head from "../../components/Layout/Head";
import Layout from "../../components/Layout/Layout";
import Hero1 from "./Hero1";
import HowItWorks from "./HowItWorks";
import PerksSection from "./PerksSection";
import LeaderboardPreview from "./LeaderboardPreview";
import TestimonialSection from "./TestimonialSection";
import CTASection from "./CTASection";
import { useTranslation } from "react-i18next";

const Home: React.FC = () => {
  const { t } = useTranslation("home");
  return (
    <>
      <Head>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <meta property="og:image" content="/NewWebp-Pics/pullup_header.webp" />
        <meta property="og:title" content={t("meta.ogTitle")}/>
        <meta property="og:description" content={t("meta.ogDescription")}/>
        <link rel="canonical" href="https://yourdomain.com/" />
      </Head>
      <Layout>
        <Hero1 />
        <HowItWorks />
        <PerksSection />
        <LeaderboardPreview />
        <TestimonialSection />
        <CTASection />
      </Layout>
    </>
  );
};

export default Home;
