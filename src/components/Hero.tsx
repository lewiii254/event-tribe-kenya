import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-accent/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-medium">Join Your Tribe Today</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 animate-slide-up leading-tight px-4 drop-shadow-lg">
            Discover Events That
            <br />
            <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent drop-shadow-lg">
              Bring People Together
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-12 max-w-2xl mx-auto animate-fade-in px-4 drop-shadow-md">
            Connect with your local community through exciting events, meetups, and experiences in Kenya
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-scale-in px-4">
            <Button 
              size="lg" 
              asChild
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full font-semibold hover:scale-105 active:scale-95"
            >
              <Link to="/events">
                Browse Events
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-primary transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full font-semibold backdrop-blur-sm hover:scale-105 active:scale-95"
            >
              <Link to="/create">Create Event</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-20 max-w-2xl mx-auto px-4">
            <div className="text-center animate-fade-in">
              <div className="flex justify-center mb-2">
                <Calendar className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-xl sm:text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-xs sm:text-sm text-white/80">Events</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex justify-center mb-2">
                <Users className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-xl sm:text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-xs sm:text-sm text-white/80">Members</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex justify-center mb-2">
                <Zap className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-xl sm:text-3xl font-bold text-white mb-1">20+</div>
              <div className="text-xs sm:text-sm text-white/80">Cities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path 
            fill="hsl(var(--background))" 
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
