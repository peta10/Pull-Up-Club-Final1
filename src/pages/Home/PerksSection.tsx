import React from 'react';
import { Award, Shield, Trophy, Medal, ShoppingBag, Share2 } from 'lucide-react';

const PerksSection: React.FC = () => {
  const perks = [
    {
      icon: <Shield size={48} className="text-[#9b9b6f]" />,
      title: "OFFICIAL ENTRY PATCH",
      description: "Earn your first stripe. Every member receives an exclusive Battle Bunker Pull-Up Club patch shipped directly to their doorstep. This is your badge of honor — no reps, no patch."
    },
    {
      icon: <Award size={48} className="text-[#9b9b6f]" />,
      title: "QUARTERLY COLLECTOR'S PATCH",
      description: "Each quarter we drop a brand-new, limited-edition patch — pull-up club members will receive the patch shipped to their doorstep. Miss it? You'll never see it again."
    },
    {
      icon: <Trophy size={48} className="text-[#9b9b6f]" />,
      title: "TIER RANKING SYSTEM",
      description: "You're ranked based on performance — Recruit, Proven, Hardened, Operator, Elite. This isn't participation. You earn your way up, and the community sees it."
    },
    {
      icon: <Medal size={48} className="text-[#9b9b6f]" />,
      title: "OFFICIAL LEADERBOARD",
      description: "Once verified, your name is locked in. Compete with the best, track your climb, and let the numbers speak for themselves. Leaderboard only displays active pull-up club members."
    },
    {
      icon: <ShoppingBag size={48} className="text-[#9b9b6f]" />,
      title: "TIER-RESTRICTED GEAR ACCESS",
      description: "Want the gear? Earn it. Exclusive merch unlocks only at certain tiers. No shortcuts, no excuses — you rock what you've proven."
    },
    {
      icon: <Share2 size={48} className="text-[#9b9b6f]" />,
      title: "SOCIAL SPOTLIGHT",
      description: "Tag us in your submission videos, patch photos and comeback stories and get featured. We share 100% of the community."
    }
  ];

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Battle Bunker Pull-Up Club Perks</h2>
          <div className="w-20 h-1 bg-[#9b9b6f] mx-auto mt-4 mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            When you enlist, you don't just join a club. You join a movement. Here's what you get:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {perks.map((perk, index) => (
            <div 
              key={index} 
              className="bg-gray-900 p-6 rounded-lg transform transition-transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {perk.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{perk.title}</h3>
                <p className="text-gray-400">{perk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerksSection;