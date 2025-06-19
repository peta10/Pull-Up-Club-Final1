import React from 'react';
import { Camera, Award, Medal } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Camera size={48} className="text-[#9b9b6f]" />,
      title: "1. Record & Submit",
      description: "Record your best pull-up performance, post it publicly and submit the video link along with a fee."
    },
    {
      icon: <Award size={48} className="text-[#9b9b6f]" />,
      title: "2. Get Reviewed",
      description: "Our team will review your submission for proper form and count your pull-ups."
    },
    {
      icon: <Medal size={48} className="text-[#9b9b6f]" />,
      title: "3. Join the Leaderboard",
      description: "Once verified, your performance will be featured on our global leaderboard."
    }
  ];

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">How It Works</h2>
          <div className="w-20 h-1 bg-[#9b9b6f] mx-auto mt-4 mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join the Battle Bunker Pull-Up Challenge in three simple steps.
            Show your strength and compete with athletes worldwide.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-gray-900 p-6 rounded-lg text-center transform transition-transform hover:scale-105"
            >
              <div className="flex justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;