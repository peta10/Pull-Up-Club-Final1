import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { Link } from '../../components/ui/Link';
import { Zap } from 'lucide-react';

// Use the same color and font conventions as Hero.tsx
const FALLBACK_ACTIVE_USERS = 1230

function getRoundedUserCount(count: number) {
  if (count < 100) return 30;
  if (count < 1000) return Math.round(count / 10) * 10;
  if (count < 10000) return Math.round(count / 100) * 100;
  if (count < 100000) return Math.round(count / 1000) * 1000;
  return Math.round(count / 10000) * 10000;
}

const Hero1: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
  const [currentStats, setCurrentStats] = useState({
    totalPullUps: 0,
    activeUsers: FALLBACK_ACTIVE_USERS
  });
  const [recentActivity, setRecentActivity] = useState([
    { name: "Marcus", location: "Chicago", pullUps: 25, time: "2 min ago" },
    { name: "Sarah", location: "London", pullUps: 18, time: "5 min ago" },
    { name: "Carlos", location: "São Paulo", pullUps: 32, time: "8 min ago" }
  ]);
  
  const heroRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [headlineVisible, setHeadlineVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [displayedActiveUsers, setDisplayedActiveUsers] = useState(0);
  const roundedTarget = getRoundedUserCount(currentStats.activeUsers);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => setAnimationsEnabled(true), 300);
          setTimeout(() => setHeadlineVisible(true), 400);
          setTimeout(() => setSubtitleVisible(true), 900);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated counter for pull-ups and active users
  useEffect(() => {
    if (animationsEnabled) {
      // Animate pull-ups
      const interval = setInterval(() => {
        setCurrentStats(prev => ({
          ...prev,
          totalPullUps: Math.min(prev.totalPullUps + Math.floor(Math.random() * 50), 2847293),
          activeUsers: prev.activeUsers // keep static for now
        }));
      }, 100);
      setTimeout(() => clearInterval(interval), 3000);
      return () => clearInterval(interval);
    }
  }, [animationsEnabled]);

  // Slower, smooth animated counter for Join 30+/rounded users
  useEffect(() => {
    if (isVisible) {
      let start = 0;
      const end = roundedTarget;
      const duration = 1800; // ms, slower
      const stepTime = 30;
      const steps = Math.ceil(duration / stepTime);
      const increment = Math.max(1, Math.round((end - start) / steps));
      let current = start;
      setDisplayedActiveUsers(start);
      const interval = setInterval(() => {
        current += increment;
        if (current >= end) {
          setDisplayedActiveUsers(end);
          clearInterval(interval);
        } else {
          setDisplayedActiveUsers(current);
        }
      }, stepTime);
      return () => clearInterval(interval);
    }
  }, [isVisible, roundedTarget]);

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

  return (
    <div ref={heroRef} className="relative bg-gray-900 text-white overflow-hidden" style={{ minHeight: '70vh' }}>
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-black">
        <img
          src="/NewWebp-Pics/pullup_header.webp"
          alt="Athlete doing pull-ups"
          className={`w-full h-full object-cover transition-opacity duration-1000 ${imageLoaded ? 'opacity-40' : 'opacity-0'}`}
          loading="eager"
          fetchPriority="high"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-90"></div>
      </div>

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
                <div className="overflow-hidden relative h-5 w-64">
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
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 flex flex-col items-start justify-center" style={{ minHeight: '70vh' }}>
        {/* Animated Join Counter */}
        <div className={`mb-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <span className="block text-2xl md:text-3xl font-bold tracking-tight text-white">
            Join <span className="text-[#9b9b6f]">{displayedActiveUsers.toLocaleString()}+</span>
          </span>
        </div>
        {/* Dramatic Headline Animation */}
        <div className={`mb-2 transition-all duration-700 ${headlineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="block text-[#9b9b6f]">
              Welcome to Pull-Up Club
            </span>
          </h1>
        </div>
        {/* Dramatic Subtitle Animation */}
        <div className={`transition-all duration-700 ${subtitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl">
            Rule #1: You don't talk about Pull-Up Club, but your reps will speak for themselves.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Button size="lg">
            <Link href="/subscription" className="text-white">
              Sign Up Now
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

        <div className="mt-8 flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#9b9b6f]" />
            <span><span className="text-[#9b9b6f] font-bold">{currentStats.totalPullUps.toLocaleString()}</span> pull-ups completed in the last 24 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero1; 