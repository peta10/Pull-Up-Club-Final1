import React from "react";
import { Button } from "../../components/ui/Button";
import { Link } from "../../components/ui/Link";
import { useTranslation } from "react-i18next";

const Hero: React.FC = () => {
  const { t } = useTranslation("home");
  return (
    <div className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-black">
        <img
          src="/NewWebp-Pics/pullup_header.webp"
          srcSet="/NewWebp-Pics/pullup_header.webp 1200w"
          sizes="(max-width: 768px) 100vw, 50vw"
          alt="Athlete doing pull-ups"
          className="w-full h-full object-cover opacity-40"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-90"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-start">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="block text-[#9b9b6f]">
              {t("hero.headline")}
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl">
            {t("hero.subheadline")}
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Button size="lg">
            <Link href="/subscription" className="text-white">
              {t("cta.button")}
            </Link>
          </Button>
          <Button variant="secondary" size="lg">
            <Link href="/leaderboard" className="text-white">
              {t("cta.leaderboard", "View Leaderboard")}
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-[#9b9b6f]">$9.99/mo</span>
            <span className="mt-2 text-gray-400">{t("hero.cancelAnytime", "Cancel Anytime")}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-[#9b9b6f]">{t("hero.global", "Global")}</span>
            <span className="mt-2 text-gray-400">{t("hero.leaderboard", "Leaderboard")}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-[#9b9b6f]">5</span>
            <span className="mt-2 text-gray-400">{t("hero.badgeTypes", "Badge Types")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
