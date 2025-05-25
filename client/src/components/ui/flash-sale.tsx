import { useState, useEffect } from "react";
import { Link } from "wouter";

interface FlashSaleProps {
  title: string;
  description: string;
  endTime: Date;
  discountCode: string;
  backgroundClass?: string;
  ctaLink: string;
}

export const FlashSale = ({
  title,
  description,
  endTime,
  discountCode,
  backgroundClass = "bg-gradient-to-r from-[#FF7A00] to-[#CC6200]",
  ctaLink,
}: FlashSaleProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const padZero = (num: number) => num.toString().padStart(2, "0");

  return (
    <section className={`py-8 text-white ${backgroundClass}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="font-medium text-sm inline-block mb-1">Limited Time Offer</span>
            <h2 className="font-heading font-bold text-2xl md:text-3xl">{title}</h2>
            <p className="mt-2 text-white/90">
              {description}{" "}
              <span className="font-bold">{discountCode}</span>
            </p>
          </div>
          <div>
            <div className="flex space-x-4 text-center">
              <div className="bg-white/20 rounded-lg px-4 py-2 w-16">
                <span className="block text-2xl font-bold">{padZero(timeLeft.hours)}</span>
                <span className="text-xs">Hours</span>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2 w-16">
                <span className="block text-2xl font-bold">{padZero(timeLeft.minutes)}</span>
                <span className="text-xs">Minutes</span>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2 w-16">
                <span className="block text-2xl font-bold">{padZero(timeLeft.seconds)}</span>
                <span className="text-xs">Seconds</span>
              </div>
            </div>
            <Link href={ctaLink} className="mt-4 inline-block bg-white text-[#FF7A00] hover:bg-neutral-100 px-6 py-2 rounded-full font-medium text-center transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
