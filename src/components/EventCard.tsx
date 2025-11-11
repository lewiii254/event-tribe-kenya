import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  id: string;
  title: string;
  category: string;
  image: string;
  location: string;
  date: string;
  price: number;
  isFree: boolean;
  attendeeCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
}

const EventCard = ({
  id,
  title,
  category,
  image,
  location,
  date,
  price,
  isFree,
  attendeeCount = 0,
  isLiked = false,
  onLike,
}: EventCardProps) => {
  const [liked, setLiked] = useState(isLiked);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked(!liked);
    onLike?.();
  };

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const categoryColors: Record<string, string> = {
    Tech: "bg-accent text-accent-foreground",
    Music: "bg-secondary text-secondary-foreground",
    Travel: "bg-primary text-primary-foreground",
    Parties: "bg-secondary text-secondary-foreground",
    Campus: "bg-accent text-accent-foreground",
    Sports: "bg-primary text-primary-foreground",
    Art: "bg-secondary text-secondary-foreground",
  };

  return (
    <Link to={`/event/${id}`}>
      <Card className="group overflow-hidden border-0 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-2 bg-card animate-fade-in">
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <button
            onClick={handleLike}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95",
              liked 
                ? "bg-secondary text-secondary-foreground shadow-lg" 
                : "bg-white/20 text-white hover:bg-white/30"
            )}
          >
            <Heart className={cn("w-5 h-5 transition-all", liked && "fill-current animate-scale-in")} />
          </button>

          <Badge className={cn("absolute top-3 left-3 shadow-md", categoryColors[category] || "bg-primary")}>
            {category}
          </Badge>
        </div>

        <div className="p-5">
          <h3 className="text-xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>

          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary" />
              <span className="line-clamp-1">{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              <span>{attendeeCount} attending</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              {isFree ? (
                <span className="text-lg font-bold text-primary animate-pulse">Free</span>
              ) : (
                <span className="text-lg font-bold text-foreground">KSh {price.toLocaleString()}</span>
              )}
            </div>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 rounded-full shadow-md hover:shadow-lg"
              onClick={(e) => e.preventDefault()}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default EventCard;
