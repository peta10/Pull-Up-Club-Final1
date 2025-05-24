import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const difference = lastDay.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center text-white bg-[#9b9b6f] rounded-lg p-4 max-w-full overflow-hidden gap-4">
      <div className="flex items-center">
        <Timer className="w-6 h-6 text-white mr-2" />
        <span className="text-2xl font-bold whitespace-nowrap">Get your submissions in!</span>
      </div>
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center min-w-[3rem] justify-center">
          <span className="text-3xl font-bold tabular-nums">{timeLeft.days.toString().padStart(2, '0')}</span>
          <span className="text-base ml-1">d</span>
        </div>
        <div className="flex items-center min-w-[3rem] justify-center">
          <span className="text-3xl font-bold tabular-nums">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-base ml-1">h</span>
        </div>
        <div className="flex items-center min-w-[3rem] justify-center">
          <span className="text-3xl font-bold tabular-nums">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-base ml-1">m</span>
        </div>
        <div className="flex items-center min-w-[3rem] justify-center">
          <span className="text-3xl font-bold tabular-nums">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-base ml-1">s</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;