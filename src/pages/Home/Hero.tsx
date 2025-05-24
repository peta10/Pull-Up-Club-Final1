import React from "react";
import { Button } from "../../components/ui/Button";
import { Link } from "../../components/ui/Link";

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-black">
        <img
          src="https://cdn.shopify.com/s/files/1/0567/5237/3945/files/pullup_header.png?v=1746306382"
          alt="Athlete doing pull-ups"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-90"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-start">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="block text-[#9b9b6f]">
              Welcome to The Pull-Up Club
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl">
            Rule #1: You don't talk about Pull-Up Club, but your reps will speak
            for themselves.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Button size="lg">
            <Link href="/login" className="text-white">
              Sign Up
            </Link>
          </Button>
          <Button variant="secondary" size="lg">
            <Link href="/leaderboard" className="text-white">
              View Leaderboard
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-[#9b9b6f]">$9.99/mo</span>
            <span className="mt-2 text-gray-400">Cancel Anytime</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-[#9b9b6f]">Global</span>
            <span className="mt-2 text-gray-400">Leaderboard</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-[#9b9b6f]">5</span>
            <span className="mt-2 text-gray-400">Badge Types</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
