import React from "react";
import Layout from "../components/Layout/Layout";
import Head from "../components/Layout/Head";
import { Button } from "../components/ui/Button";
import { Link } from "../components/ui/Link";
import { Shield, Users, Activity } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";

const EthosPage: React.FC = () => {
  const { t } = useTranslation("ethos");
  return (
    <Layout pageName={t("hero.title")}>
      <Head>
        <title>{t("hero.title")} | Pull-Up Club</title>
        <meta name="description" content={t("cta.subtitle")}/>
        <meta property="og:image" content="/NewWebp-Pics/TheLegendofAlkeios-min.webp" />
        <meta property="og:title" content={`${t("hero.title")} | Pull-Up Club`} />
        <meta property="og:description" content={t("cta.subtitle")} />
        <link rel="canonical" href="https://yourdomain.com/ethos" />
      </Head>
      {/* Hero Section */}
      <section className="relative bg-black text-white min-h-[60vh] flex items-center justify-center overflow-hidden">
        <img
          src="/NewWebp-Pics/TheLegendofAlkeios-min.webp"
          alt="The Legend of Alkeios - Battle Bunker"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />
        <div className="relative z-10 text-center px-4 py-24 md:py-32">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#9b9b6f] drop-shadow-lg mb-4 tracking-wider uppercase">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Legend Section */}
      <section className="bg-[#1a1a1a] py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#9b9b6f] mb-6 text-center">
            {t("legend.title")}
          </h2>
          <blockquote className="border-l-4 border-[#9b9b6f] pl-6 text-lg md:text-xl text-gray-100 italic mb-6">
            <p>
              <Trans i18nKey="legend.quote1" components={{ 1: <span className='text-[#9b9b6f] font-semibold'/> }} />
            </p>
            <p className="mt-4">
              {t("legend.quote2")}
            </p>
          </blockquote>
          <p className="text-gray-300 text-lg md:text-xl text-center max-w-2xl mx-auto">
            {t("legend.summary")}
          </p>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="bg-black py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#9b9b6f] mb-8 text-center">
            {t("purpose.title")}
          </h2>
          <p className="text-gray-200 text-lg md:text-xl text-center mb-10 max-w-2xl mx-auto">
            {t("purpose.intro")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center bg-[#23231c] rounded-lg p-6 shadow-lg">
              <Shield size={48} className="text-[#9b9b6f] mb-4" />
              <h3 className="text-xl font-bold text-[#9b9b6f] mb-2">{t("purpose.pillars.trainToSave.title")}</h3>
              <p className="text-gray-300">{t("purpose.pillars.trainToSave.desc")}</p>
            </div>
            <div className="flex flex-col items-center text-center bg-[#23231c] rounded-lg p-6 shadow-lg">
              <Users size={48} className="text-[#9b9b6f] mb-4" />
              <h3 className="text-xl font-bold text-[#9b9b6f] mb-2">{t("purpose.pillars.strengthToLift.title")}</h3>
              <p className="text-gray-300">{t("purpose.pillars.strengthToLift.desc")}</p>
            </div>
            <div className="flex flex-col items-center text-center bg-[#23231c] rounded-lg p-6 shadow-lg">
              <Activity size={48} className="text-[#9b9b6f] mb-4" />
              <h3 className="text-xl font-bold text-[#9b9b6f] mb-2">{t("purpose.pillars.disciplineToOvercome.title")}</h3>
              <p className="text-gray-300">{t("purpose.pillars.disciplineToOvercome.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#9b9b6f] py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-black text-xl mb-8 max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="primary" size="lg">
              <Link href="/subscription" className="text-black font-bold">
                {t("cta.signup")}
              </Link>
            </Button>
            <Button variant="secondary" size="lg">
              <Link href="/leaderboard" className="text-white font-bold">
                {t("cta.leaderboard")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EthosPage; 