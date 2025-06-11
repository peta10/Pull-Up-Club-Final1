import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Trophy, Users, Globe, Zap, Timer } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from '../../components/ui/Link';

const badgeImages = [
  { src: '/Male-Badges/Elite.webp', alt: 'Elite Badge' },
  { src: '/Male-Badges/Hardened.webp', alt: 'Hardened Badge' },
  { src: '/Male-Badges/Operator.webp', alt: 'Operator Badge' },
  { src: '/Male-Badges/Proven.webp', alt: 'Proven Badge' },
  { src: '/Male-Badges/Recruit.webp', alt: 'Recruit Badge' },
];

const Herotry = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
  const [currentStats, setCurrentStats] = useState({
    totalPullUps: 0,
    activeUsers: 0,
    timeLeft: { days: 3, hours: 14, minutes: 27 }
  });
  const [recentActivity, setRecentActivity] = useState([
    { name: "Marcus", location: "Chicago", pullUps: 25, time: "2 min ago" },
    { name: "Sarah", location: "London", pullUps: 18, time: "5 min ago" },
    { name: "Carlos", location: "São Paulo", pullUps: 32, time: "8 min ago" }
  ]);
  
  const heroRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => setAnimationsEnabled(true), 300);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated counter
  useEffect(() => {
    if (animationsEnabled) {
      const interval = setInterval(() => {
        setCurrentStats(prev => ({
          ...prev,
          totalPullUps: Math.min(prev.totalPullUps + Math.floor(Math.random() * 50), 2847293),
          activeUsers: Math.min(prev.activeUsers + 1, 50247)
        }));
      }, 100);

      // Stop after reaching target
      setTimeout(() => clearInterval(interval), 3000);
      return () => clearInterval(interval);
    }
  }, [animationsEnabled]);

  // Activity ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentActivity(prev => {
        const names = ["Alex", "Maria", "James", "Yuki", "Ahmed", "Elena"];
        const cities = ["Tokyo", "Berlin", "Sydney", "Toronto", "Mumbai", "Lagos"];
        const newActivity = {
          name: names[Math.floor(Math.random() * names.length)],
          location: cities[Math.floor(Math.random() * cities.length)],
          pullUps: Math.floor(Math.random() * 40) + 10,
          time: "Just now"
        };
        return [newActivity, ...prev.slice(0, 2)];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStats(prev => {
        let { days, hours, minutes } = prev.timeLeft;
        minutes--;
        if (minutes < 0) {
          minutes = 59;
          hours--;
          if (hours < 0) {
            hours = 23;
            days--;
          }
        }
        return {
          ...prev,
          timeLeft: { days, hours, minutes }
        };
      });
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background image with overlay (matches Hero.tsx) */}
      <div className="absolute inset-0 bg-black">
        <img
          src="/NewWebp-Pics/pullup_header.webp"
          srcSet="/NewWebp-Pics/pullup_header.webp 1200w"
          sizes="(max-width: 768px) 100vw, 50vw"
          alt="Athlete doing pull-ups"
          className={`w-full h-full object-cover transition-opacity duration-1000 ${imageLoaded ? 'opacity-40' : 'opacity-0'}`}
          loading="eager"
          fetchPriority="high"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-90"></div>
      </div>

      {/* Animated particles (yellow, matching Hero accent) */}
      {animationsEnabled && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#9b9b6f] rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Live Activity Ticker */}
      <div className="absolute top-4 left-0 right-0 z-10">
        <div className="bg-black/50 backdrop-blur-sm border-b border-[#9b9b6f]/20">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400">LIVE</span>
                </div>
                <div className="overflow-hidden">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className={`transition-all duration-500 ${
                        index === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full absolute'
                      }`}
                    >
                      <span className="text-gray-300">
                        <span className="text-[#9b9b6f] font-semibold">{activity.name}</span> from {activity.location} completed <span className="text-[#9b9b6f]">{activity.pullUps} pull-ups</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-[#9b9b6f]" />
                <span className="text-[#9b9b6f] font-semibold">
                  Competition ends: {currentStats.timeLeft.days}d {currentStats.timeLeft.hours}h {currentStats.timeLeft.minutes}m
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 pt-24 pb-16 flex flex-col justify-center min-h-screen">
        <div className="max-w-4xl">
          {/* Badge Showcase */}
          <div className={`mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>            <div className="flex items-center space-x-4 mb-4">
              <div className="flex space-x-2">
                {badgeImages.map((badge, index) => (
                  <img
                    key={index}
                    src={badge.src}
                    alt={badge.alt}
                    className="w-10 h-10 rounded-full bg-[#9b9b6f]/20 object-cover border-2 border-[#9b9b6f] shadow"
                    style={{ animationDelay: `${index * 200}ms` }}
                  />
                ))}
              </div>
              <span className="text-[#9b9b6f] text-sm font-semibold">5 Badge Types Available</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="block">
                <span className="text-white">Join </span>
                <span className={`bg-gradient-to-r from-[#9b9b6f] via-[#9b9b6f] to-[#9b9b6f] bg-clip-text text-transparent ${animationsEnabled ? 'animate-pulse' : ''}`}>
                  {currentStats.activeUsers.toLocaleString()}+
                </span>
              </span>
              <span className="block text-[#9b9b6f]">Warriors Worldwide</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed mb-4">
              Transform every pull-up into a <span className="text-[#9b9b6f] font-semibold">battle victory</span>. 
              Compete globally. Earn legendary status.
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-8">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[#9b9b6f]" />
                <span><span className="text-[#9b9b6f] font-bold">{currentStats.totalPullUps.toLocaleString()}</span> pull-ups completed in the last 24 hours</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Button size="lg">
              <Link href="/subscription" className="text-white">
                Start Your Journey - $9.99/mo
              </Link>
            </Button>
            <Button variant="secondary" size="lg">
              <Link href="/leaderboard" className="text-white">
                View Global Leaderboard
              </Link>
            </Button>
          </div>

          {/* Interactive Stats */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="group cursor-pointer">
              <div className="bg-black/30 backdrop-blur-sm border border-[#9b9b6f]/20 rounded-xl p-6 transition-all duration-300 hover:border-[#9b9b6f]/50 hover:bg-black/50">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-[#9b9b6f]/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#9b9b6f]">$9.99/mo</div>
                    <div className="text-gray-400 text-sm">Cancel Anytime</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Less than a coffee per week
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-black/30 backdrop-blur-sm border border-[#9b9b6f]/20 rounded-xl p-6 transition-all duration-300 hover:border-[#9b9b6f]/50 hover:bg-black/50">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-[#9b9b6f]/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-[#9b9b6f]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#9b9b6f]">Global</div>
                    <div className="text-gray-400 text-sm">Leaderboard</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Compete with warriors worldwide
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-black/30 backdrop-blur-sm border border-[#9b9b6f]/20 rounded-xl p-6 transition-all duration-300 hover:border-[#9b9b6f]/50 hover:bg-black/50">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-[#9b9b6f]/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#9b9b6f]">5</div>
                    <div className="text-gray-400 text-sm">Badge Types</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Earn legendary status
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center space-y-2 text-gray-400">
          <span className="text-sm">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Herotry; 